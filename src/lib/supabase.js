import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

export async function queryWithRetry(fn, retries = 2) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const result = await fn()
      if (result.error && attempt < retries && isRetryableError(result.error)) {
        await sleep(Math.pow(2, attempt) * 500)
        continue
      }
      return result
    } catch (err) {
      if (attempt < retries && isRetryableError(err)) {
        await sleep(Math.pow(2, attempt) * 500)
        continue
      }
      throw err
    }
  }
}

function isRetryableError(err) {
  const code = err?.code || ''
  const message = err?.message || ''
  return (
    code === '40P01' ||
    code === '53300' ||
    code === '08501' ||
    code === '08000' ||
    code === '08001' ||
    code === '08006' ||
    code === '08003' ||
    message?.includes('timeout') ||
    message?.includes('network') ||
    message?.includes('connection') ||
    message?.includes('reset') ||
    message?.includes('ECONNRESET') ||
    message?.includes('fetch failed')
  )
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}
