import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { signOut } from '../lib/auth';
import { TAG_CONFIG } from '../lib/posts';
import { fetchNotifications, markAsRead, markAllAsRead } from '../lib/notifications';
import { timeAgo } from '../lib/time-ago';
import { X, LogOut, Rss, User, Coffee, Bell, Bookmark, Check } from 'lucide-react';

export default function Sidebar({ open, onClose }) {
  const { profile } = useAuth();
  const [notifs, setNotifs] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const unreadCount = notifs.filter(n => !n.read).length;

  useEffect(() => {
    if (open) loadNotifs();
  }, [open]);

  const loadNotifs = async () => {
    const data = await fetchNotifications();
    setNotifs(data);
  };

  const handleRead = async (id, postId) => {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    await markAsRead(id);
    onClose();
  };

  const handleReadAll = async () => {
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
    await markAllAsRead();
  };

  const handleLogout = async () => { await signOut(); onClose(); };

  return (
    <aside className={`fixed top-0 left-0 z-50 flex h-full w-64 flex-col border-r border-neutral-200 bg-white transition-transform duration-200 lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex h-14 items-center justify-between border-b border-neutral-200 px-5">
        <span className="text-lg font-bold text-neutral-900">The<span className="text-maroon-800">Hub</span></span>
        <button onClick={onClose} className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 lg:hidden"><X size={18} /></button>
      </div>

      <nav className="flex-1 space-y-1 px-3 pt-5">
        <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-widest text-neutral-400">Menu</p>
        <NavLink to="/" end className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive ? 'bg-maroon-800 text-white' : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'}`} onClick={onClose}><Rss size={17} />Feed</NavLink>
        <NavLink to="/bookmarks" className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive ? 'bg-maroon-800 text-white' : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'}`} onClick={onClose}><Bookmark size={17} />Bookmarks</NavLink>
        <NavLink to="/profile" className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive ? 'bg-maroon-800 text-white' : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'}`} onClick={onClose}><User size={17} />Profile</NavLink>
      </nav>

      <div className="border-t border-neutral-200 px-3 pt-5 pb-3">
        <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-widest text-neutral-400">Tags</p>
        <div className="space-y-0.5">
          {Object.entries(TAG_CONFIG).map(([key, { label, icon }]) => (
            <NavLink key={key} to={`/?tag=${key}`} className={({ isActive }) => `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${isActive ? 'bg-maroon-50 font-medium text-maroon-800' : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800'}`} onClick={onClose}>
              <span className="text-base">{icon}</span>{label}
            </NavLink>
          ))}
        </div>
      </div>

      <div className="border-t border-neutral-200 px-3 py-3 space-y-1">
        {profile && <p className="mb-2 truncate px-3 text-xs text-neutral-400">{profile.name} · {profile.year_level}</p>}
        <button onClick={handleLogout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-800"><LogOut size={16} />Sign out</button>
        <a href="#" className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-neutral-400 transition-colors hover:text-neutral-600"><Coffee size={13} />Buy me a coffee</a>
      </div>

      {/* Notification Bell (Floating) */}
      <div className="absolute top-3 right-3 hidden lg:block">
        <div className="relative">
          <button onClick={() => setShowNotifs(!showNotifs)} className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 transition-colors">
            <Bell size={18} />
            {unreadCount > 0 && <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-maroon-800 text-[10px] font-bold text-white">{unreadCount}</span>}
          </button>
          {showNotifs && (
            <div className="absolute right-0 top-12 w-80 rounded-xl border border-neutral-200 bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-neutral-100 p-3">
                <h4 className="text-sm font-bold text-neutral-900">Notifications</h4>
                {unreadCount > 0 && <button onClick={handleReadAll} className="flex items-center gap-1 text-xs font-medium text-maroon-800 hover:underline"><Check size={12}/>Mark all read</button>}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifs.length === 0 ? <p className="p-4 text-center text-sm text-neutral-400">No notifications yet</p> : notifs.map(n => (
                  <button key={n.id} onClick={() => handleRead(n.id, n.post_id)} className={`w-full text-left px-4 py-3 border-b border-neutral-50 transition-colors hover:bg-neutral-50 ${!n.read ? 'bg-maroon-50/30' : ''}`}>
                    <p className="text-sm text-neutral-700"><span className="font-semibold text-neutral-900">{n.actor?.name || 'Someone'}</span> {n.type === 'upvote' ? 'upvoted your post' : n.type === 'comment' ? 'commented on your post' : 'replied to your comment'}</p>
                    <p className="mt-0.5 text-xs text-neutral-400">{timeAgo(n.created_at)}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}