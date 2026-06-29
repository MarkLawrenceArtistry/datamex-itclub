import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchPosts } from '../lib/posts';
import PostCard from '../components/PostCard';
import CreatePostModal from '../components/CreatePostModal';
import { Plus, Clock, TrendingUp } from 'lucide-react';

export default function Feed() {
  const [searchParams] = useSearchParams();
  const tag = searchParams.get('tag');
  const [sort, setSort] = useState('new');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchPosts({ tag, sort })
      .then(setPosts)
      .finally(() => setLoading(false));
  }, [tag, sort]);

  const handlePostCreated = (newPost) => {
    setPosts(prev => [newPost, ...prev]);
    setShowCreate(false);
  };

  return (
    <div>
      {/* Top bar */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Feed</h1>
          {tag && (
            <p className="mt-1 text-sm text-neutral-500">
              Showing posts tagged with "{tag}"
            </p>
          )}
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 rounded-lg bg-[#800020] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#5C0017]"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">New Post</span>
        </button>
      </div>

      {/* Sort toggle */}
      <div className="mb-4 flex gap-1 rounded-lg border border-neutral-200 bg-white p-1">
        <button
          onClick={() => setSort('new')}
          className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            sort === 'new'
              ? 'bg-neutral-900 text-white'
              : 'text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <Clock size={14} />
          New
        </button>
        <button
          onClick={() => setSort('top')}
          className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            sort === 'top'
              ? 'bg-neutral-900 text-white'
              : 'text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <TrendingUp size={14} />
          Top
        </button>
      </div>

      {/* Posts */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse rounded-xl border border-neutral-200 bg-white p-5">
              <div className="mb-3 h-4 w-20 rounded bg-neutral-200" />
              <div className="mb-2 h-5 w-3/4 rounded bg-neutral-200" />
              <div className="h-4 w-1/2 rounded bg-neutral-200" />
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-xl border border-neutral-200 bg-white py-16 text-center">
          <p className="text-lg font-medium text-neutral-400">No posts yet</p>
          <p className="mt-1 text-sm text-neutral-400">
            Be the first to share something with the community.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map(post => (
            <PostCard 
            key={post.id} 
            post={post} 
            onDelete={(id) => setPosts(prev => prev.filter(p => p.id !== id))} 
            />
          ))}
        </div>
      )}

      {/* Create modal */}
      {showCreate && (
        <CreatePostModal
          onClose={() => setShowCreate(false)}
          onCreated={handlePostCreated}
        />
      )}
    </div>
  );
}