import { supabase } from './supabase';

export async function fetchNotifications() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from('notifications')
    .select('*, actor:users!notifications_actor_id_fkey(name)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20);
  return data || [];
}

export async function markAsRead(notifId) {
  await supabase.from('notifications').update({ read: true }).eq('id', notifId);
}

export async function markAllAsRead() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from('notifications').update({ read: true }).eq('user_id', user.id).eq('read', false);
}