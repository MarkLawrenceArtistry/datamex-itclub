import { useState, useEffect } from 'react';
import { fetchBookmarks } from '../lib/bookmarks';
import PostCard from '../components/PostCard';
import { Bookmark } from 'lucide-react';

export default function Bookmarks() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookmarks().then(data => { setPosts(data); setLoading(false); });
  }, []);

  return (
    <div>
      <h1 className="mb-6 flex items-center gap-2 text-2xl font-bold text-neutral-900"><Bookmark size={24} className="text-maroon-800" /> Bookmarks</h1>
      
      {loading ? (
        <div className="space-y-3">{[...Array(2)].map((_, i) => <div key={i} className="animate-pulse rounded-xl border border-neutral-200 bg-white p-5"><div className="h-4 w-3/4 rounded bg-neutral-200" /></div>)}</div>
      ) : posts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-300 bg-white py-20 text-center">
          <p className="text-4xl mb-3">🔖</p><p className="text-base font-semibold text-neutral-400">No bookmarked posts yet</p>
          <p className="mt-1 text-sm text-neutral-400">Click the bookmark icon on a post to save it here.</p>
        </div>
      ) : (
        <div className="space-y-3">{posts.map(post => <PostCard key={post.id} post={post} onDelete={(id) => setPosts(p => p.filter(x => x.id !== id))} onEdit={() => {}} />)}</div>
      )}
    </div>
  );
}