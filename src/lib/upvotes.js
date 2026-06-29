import { supabase } from './supabase';

// Check if current user upvoted a post
export async function hasUserUpvoted(postId) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data, error } = await supabase
    .from('upvotes')
    .select('user_id')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) {
    console.error('Error checking upvote:', error);
    return false;
  }
  return !!data;
}

// Toggle upvote: add if not voted, remove if already voted
export async function toggleUpvote(postId) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Check if already upvoted
  const { data: existing } = await supabase
    .from('upvotes')
    .select('user_id')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (existing) {
    // Remove upvote
    const { error } = await supabase
      .from('upvotes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', user.id);

    if (error) throw error;
    return false; // now not upvoted
  } else {
    // Add upvote
    const { error } = await supabase
      .from('upvotes')
      .insert({ user_id: user.id, post_id: postId });

    if (error) throw error;
    return true; // now upvoted
  }
}