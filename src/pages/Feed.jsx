import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchPosts } from '../lib/posts';
import PostCard from '../components/PostCard';
import PostFormModal from '../components/PostFormModal';
import { Plus, Clock, TrendingUp, Search } from 'lucide-react';

export default function Feed() {
  const [searchParams] = useSearchParams();
  const tag = searchParams.get('tag');
  const [sort, setSort] = useState('new');
  const [search, setSearch] = useState('');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editPost, setEditPost] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetchPosts({ tag, sort, search }).then(setPosts).finally(() => setLoading(false));
  }, [tag, sort, search]);

  const handleCreated = (post) => { setPosts(prev => [post, ...prev]); setShowForm(false); };
  const handleUpdated = (post) => { setPosts(prev => prev.map(p => p.id === post.id ? post : p)); setEditPost(null); setShowForm(false); };
  const handleDeleted = (id) => setPosts(prev => prev.filter(p => p.id !== id));

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">{tag ? `${tag.charAt(0).toUpperCase() + tag.slice(1)}` : 'Feed'}</h1>
        </div>
        <button onClick={() => { setEditPost(null); setShowForm(true); }} className="flex shrink-0 items-center gap-2 rounded-lg bg-maroon-800 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-maroon-900">
          <Plus size={16} /><span className="hidden sm:inline">New Post</span>
        </button>
      </div>

      {/* Search & Sort */}
      <div className="mb-5 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search posts..." className="w-full rounded-lg border border-neutral-200 bg-white py-2.5 pl-10 pr-4 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-maroon-800 focus:outline-none focus:ring-1 focus:ring-maroon-800" />
        </div>
        <div className="flex gap-1 rounded-lg border border-neutral-200 bg-white p-1">
          <button onClick={() => setSort('new')} className={`flex items-center gap-1.5 rounded-md px-3.5 py-2 text-sm font-medium transition-colors ${sort === 'new' ? 'bg-neutral-900 text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-800'}`}><Clock size={14} />New</button>
          <button onClick={() => setSort('top')} className={`flex items-center gap-1.5 rounded-md px-3.5 py-2 text-sm font-medium transition-colors ${sort === 'top' ? 'bg-neutral-900 text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-800'}`}><TrendingUp size={14} />Top</button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="animate-pulse rounded-xl border border-neutral-200 bg-white p-5"><div className="h-4 w-3/4 rounded bg-neutral-200" /></div>)}</div>
      ) : posts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-300 bg-white py-20 text-center">
          <p className="text-4xl mb-3">📝</p><p className="text-base font-semibold text-neutral-400">{search ? 'No posts match your search' : 'No posts yet'}</p>
        </div>
      ) : (
        <div className="space-y-3">{posts.map(post => <PostCard key={post.id} post={post} onDelete={handleDeleted} onEdit={(p) => { setEditPost(p); setShowForm(true); }} />)}</div>
      )}

      {showForm && <PostFormModal editPost={editPost} onClose={() => setShowForm(false)} onCreated={handleCreated} onUpdated={handleUpdated} />}
    </div>
  );
}