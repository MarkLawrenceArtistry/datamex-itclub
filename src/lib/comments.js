import { supabase } from './supabase';

// Fetch all comments for a post
export async function fetchComments(postId) {
  const { data, error } = await supabase
    .from('comments')
    .select('*, users(name, year_level)')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching comments:', error);
    return [];
  }
  return data;
}

// Add a comment (top-level or reply)
export async function addComment({ postId, body, parentCommentId = null }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('comments')
    .insert({
      post_id: postId,
      user_id: user.id,
      body,
      parent_comment_id: parentCommentId,
    })
    .select('*, users(name, year_level)')
    .single();

  if (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
  return data;
}

// Delete a comment (author only, enforced by RLS)
export async function deleteComment(commentId) {
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId);

  if (error) {
    console.error('Error deleting comment:', error);
    throw error;
  }
}