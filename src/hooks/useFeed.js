import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase.js'

const FEED_PAGE_SIZE = 25

const profileMapCache = new Map()

async function fetchProfiles(userIds) {
  const missing = userIds.filter((id) => id && !profileMapCache.has(id))
  if (missing.length > 0) {
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .in('id', missing)
    if (data) {
      for (const p of data) profileMapCache.set(p.id, p)
    }
  }
  return Object.fromEntries(
    userIds.filter(Boolean).map((id) => [id, profileMapCache.get(id)])
  )
}

async function fetchComments(postIds) {
  if (!postIds.length) return {}
  const { data: allComments } = await supabase
    .from('comments')
    .select('*')
    .in('post_id', postIds)
    .order('timestamp', { ascending: true })
  if (!allComments) return {}

  const commentUserIds = [...new Set(allComments.map((c) => c.user_id))]
  const commentProfileMap = await fetchProfiles(commentUserIds)

  const commentsByPost = {}
  for (const c of allComments) {
    if (!commentsByPost[c.post_id]) commentsByPost[c.post_id] = []
    commentsByPost[c.post_id].push({
      id: c.id,
      userId: c.user_id,
      user: commentProfileMap[c.user_id]?.full_name || 'Explorer',
      avatar: commentProfileMap[c.user_id]?.avatar_url || 'E',
      text: c.text,
      timestamp: c.timestamp,
    })
  }
  return commentsByPost
}

function mapPost(post, profileMap, commentsByPost) {
  return {
    id: post.id,
    userId: post.user_id,
    user: profileMap[post.user_id]?.full_name || 'Explorer',
    avatar: profileMap[post.user_id]?.avatar_url || 'E',
    text: post.text,
    image: post.image_url,
    flair: post.flair,
    likes: post.likes_count ?? 0,
    timestamp: post.timestamp,
    type: post.flair === 'system_update' ? post.flair : 'user_post',
    comments: commentsByPost[post.id] || [],
  }
}

export function useFeedQuery() {
  return useInfiniteQuery({
    queryKey: ['feed'],
    queryFn: async ({ pageParam = 0 }) => {
      const from = pageParam * FEED_PAGE_SIZE
      const to = from + FEED_PAGE_SIZE - 1

      const { data, error } = await supabase
        .from('posts')
        .select('id, user_id, text, image_url, flair, likes_count, timestamp')
        .order('timestamp', { ascending: false })
        .range(from, to)

      if (error) throw error

      const hasMore = data.length === FEED_PAGE_SIZE
      const userIds = [...new Set(data.map((p) => p.user_id))]
      const profileMap = await fetchProfiles(userIds)
      const commentsByPost = await fetchComments(data.map((p) => p.id))

      return {
        posts: data.map((p) => mapPost(p, profileMap, commentsByPost)),
        nextPage: hasMore ? pageParam + 1 : undefined,
      }
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
    staleTime: 30_000,
    gcTime: 300_000,
  })
}

export function useCreatePost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ text, image, flair, userId }) => {
      const { data, error } = await supabase
        .from('posts')
        .insert({ user_id: userId, text, image_url: image, flair })
        .select()
      if (error) throw error
      return data?.[0]
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] })
      profileMapCache.clear()
    },
  })
}

export function useLikePost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ postId, userId, isLiked }) => {
      if (isLiked) {
        await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', userId)
      } else {
        const { error } = await supabase.from('post_likes').insert({ post_id: postId, user_id: userId })
        if (error && error.code !== '23505') throw error
      }
    },
    onMutate: async ({ postId, isLiked }) => {
      await queryClient.cancelQueries({ queryKey: ['feed'] })
      const previous = queryClient.getQueriesData({ queryKey: ['feed'] })
      queryClient.setQueriesData({ queryKey: ['feed'] }, (old) => {
        if (!old) return old
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            posts: page.posts.map((p) =>
              p.id === postId
                ? { ...p, likes: p.likes + (isLiked ? -1 : 1) }
                : p
            ),
          })),
        }
      })
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        for (const [key, data] of context.previous) {
          queryClient.setQueryData(key, data)
        }
      }
    },
  })
}

export function useDeletePost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (postId) => {
      const { error } = await supabase.from('posts').delete().eq('id', postId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] })
    },
  })
}

export function useRepostPost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ text, originalAuthor }) => {
      const repostText = `♻️ Repost\n\n${text}\n\n— ${originalAuthor}`
      const { error } = await supabase.from('posts').insert({ text: repostText, flair: 'repost' })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] })
    },
  })
}

export function useAddComment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ postId, text }) => {
      const { error } = await supabase.from('comments').insert({ post_id: postId, text })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] })
      profileMapCache.clear()
    },
  })
}
