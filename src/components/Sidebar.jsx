import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { signOut } from '../lib/auth';
import { TAG_CONFIG } from '../lib/posts';
import { X, LogOut, Rss, User, Coffee, Bookmark } from 'lucide-react';

export default function Sidebar({ open, onClose }) {
  const { profile } = useAuth();
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
    </aside>
  );
}