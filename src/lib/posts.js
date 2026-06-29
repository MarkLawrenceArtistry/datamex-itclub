import { supabase } from './supabase';

// Tag config for the UI
export const TAG_CONFIG = {
  knowledge: { label: 'Knowledge', icon: '🧠' },
  tips:      { label: 'Tips/Q&A',  icon: '💡' },
  project:   { label: 'Projects',   icon: '🚀' },
  ojt:       { label: 'OJT/Careers', icon: '💼' },
};

// Fetch posts with author info, sorted by newest or top
export async function fetchPosts({ tag = null, sort = 'new' } = {}) {
  let query = supabase
    .from('posts')
    .select('*, users!posts_user_id_fkey(name, year_level, tech_stack, github_url)')
    .order(sort === 'top' ? 'upvotes_count' : 'created_at', {
      ascending: sort === 'top' ? false : false,
    })
    .limit(50);

  if (tag) {
    query = query.eq('tag', tag);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
  return data;
}

// Create a new post
export async function createPost({ title, body, tag, linkUrl }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('posts')
    .insert({
      user_id: user.id,
      title,
      body: body || '',
      tag,
      link_url: linkUrl || null,
    })
    .select('*, users!posts_user_id_fkey(name, year_level)')
    .single();

  if (error) {
    console.error('Error creating post:', error);
    throw error;
  }
  return data;
}

// Delete a post (author only, enforced by RLS)
export async function deletePost(postId) {
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', postId);

  if (error) {
    console.error('Error deleting post:', error);
    throw error;
  }
}