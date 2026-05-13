-- Seed some initial content to make the app feel alive

-- 2. Seed Missions (no creator_id for system missions)
insert into public.missions (id, title, type, description, cities, spots_left, image_url)
values 
(gen_random_uuid(), 'The Tokyo Transience', 'Field Test', 'Documenting the efficiency of capsule hotels vs. business hotels in Shinjuku.', 'Tokyo', 4, 'https://images.unsplash.com/photo-1540959733332-e94e270b4d82?auto=format&fit=crop&w=800'),
(gen_random_uuid(), 'Alpine Coordination', 'Gathering', 'A coordinated gathering of explorers in the Swiss Alps to discuss high-altitude logistics.', 'Zermatt', 12, 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800');

-- 3. Seed Feed Posts (no user_id for system posts)
insert into public.posts (id, text, flair, likes_count)
values 
(gen_random_uuid(), 'Welcome to the new coordination layer. Use the Network Notes to share field intelligence.', 'alert', 12),
(gen_random_uuid(), 'Verification for Japan stays is now 2x faster due to new local partnerships.', 'travel_tip', 45);
