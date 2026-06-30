import { supabase } from './supabase';

export const TAG_CONFIG = {
  knowledge: { label: 'Knowledge', icon: '🧠' },
  tips:      { label: 'Tips/Q&A',  icon: '💡' },
  project:   { label: 'Projects',   icon: '🚀' },
  ojt:       { label: 'OJT/Careers', icon: '💼' },
};

export async function fetchPosts({ tag = null, sort = 'new', search = '' } = {}) {
  let query = supabase
    .from('posts')
    .select('*, users!posts_user_id_fkey(name, year_level, tech_stack, github_url)')
    .order(sort === 'top' ? 'upvotes_count' : 'created_at', { ascending: false })
    .limit(50);

  if (tag) query = query.eq('tag', tag);
  if (search) query = query.or(`title.ilike.%${search}%,body.ilike.%${search}%`);

  const { data, error } = await query;
  return data || [];
}

export async function createPost({ title, body, tag, linkUrl }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const { data, error } = await supabase.from('posts').insert({ user_id: user.id, title, body: body || '', tag, link_url: linkUrl || null }).select('*, users!posts_user_id_fkey(name, year_level)').single();
  if (error) throw error;
  return data;
}

export async function updatePost(postId, { title, body, tag, linkUrl }) {
  const { data, error } = await supabase.from('posts').update({ title, body, tag, link_url: linkUrl || null }).eq('id', postId).select('*, users!posts_user_id_fkey(name, year_level)').single();
  if (error) throw error;
  return data;
}

export async function deletePost(postId) {
  const { error } = await supabase.from('posts').delete().eq('id', postId);
  if (error) throw error;
}