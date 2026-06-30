import { supabase } from './supabase';

export async function isBookmarked(postId) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data } = await supabase.from('bookmarks').select('user_id').eq('post_id', postId).eq('user_id', user.id).maybeSingle();
  return !!data;
}

export async function toggleBookmark(postId) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const { data: existing } = await supabase.from('bookmarks').select('user_id').eq('post_id', postId).eq('user_id', user.id).maybeSingle();
  
  if (existing) {
    await supabase.from('bookmarks').delete().eq('post_id', postId).eq('user_id', user.id);
    return false;
  } else {
    await supabase.from('bookmarks').insert({ user_id: user.id, post_id: postId });
    return true;
  }
}

export async function fetchBookmarks() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from('bookmarks')
    .select('created_at, posts!post_id(*, users!posts_user_id_fkey(name, year_level))')
    .order('created_at', { ascending: false });
  return data?.map(b => b.posts) || [];
}