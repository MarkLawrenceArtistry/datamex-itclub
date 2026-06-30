import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchNotifications, markAsRead, markAllAsRead } from '../lib/notifications';
import { timeAgo } from '../lib/time-ago';
import { Bell, Check } from 'lucide-react';

export default function NotificationBell() {
  const navigate = useNavigate();
  const [notifs, setNotifs] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const unreadCount = notifs.filter(n => !n.read).length;

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!showNotifs) return;
    const handleClick = (e) => {
      if (e.target.closest('.notif-container')) return;
      setShowNotifs(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showNotifs]);

  const loadNotifs = async () => {
    const data = await fetchNotifications();
    setNotifs(data);
  };

  const handleRead = async (id, postId) => {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    await markAsRead(id);
    setShowNotifs(false);
    navigate(`/post/${postId}`);
  };

  const handleReadAll = async () => {
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
    await markAllAsRead();
  };

  return (
    <div className="relative notif-container">
      <button 
        onClick={() => { 
          setShowNotifs(!showNotifs); 
          if(!showNotifs) loadNotifs(); // refresh when opening
        }} 
        className="relative rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 transition-colors"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-maroon-800 text-[10px] font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {showNotifs && (
        <div className="absolute right-0 top-12 z-50 w-80 rounded-xl border border-neutral-200 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-neutral-100 p-3">
            <h4 className="text-sm font-bold text-neutral-900">Notifications</h4>
            {unreadCount > 0 && (
              <button 
                onClick={handleReadAll} 
                className="flex items-center gap-1 text-xs font-medium text-maroon-800 hover:underline"
              >
                <Check size={12}/>Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifs.length === 0 ? (
              <p className="p-4 text-center text-sm text-neutral-400">No notifications yet</p>
            ) : (
              notifs.map(n => (
                <button 
                  key={n.id} 
                  onClick={() => handleRead(n.id, n.post_id)} 
                  className={`w-full text-left px-4 py-3 border-b border-neutral-50 transition-colors hover:bg-neutral-50 ${!n.read ? 'bg-maroon-50/30' : ''}`}
                >
                  <p className="text-sm text-neutral-700">
                    <span className="font-semibold text-neutral-900">{n.actor?.name || 'Someone'}</span> 
                    {' '}{n.type === 'upvote' ? 'upvoted your post' : n.type === 'comment' ? 'commented on your post' : 'replied to your comment'}
                  </p>
                  <p className="mt-0.5 text-xs text-neutral-400">{timeAgo(n.created_at)}</p>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}