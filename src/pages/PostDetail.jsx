import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { TAG_CONFIG } from '../lib/posts';
import { toggleUpvote, hasUserUpvoted } from '../lib/upvotes';
import { deletePost, updatePost } from '../lib/posts';
import { timeAgo } from '../lib/time-ago';
import CommentSection from '../components/CommentSection';
import PostFormModal from '../components/PostFormModal'; // Note: using Feed's modal logic inline
import { ChevronUp, ArrowLeft, ExternalLink, Trash2, Pencil } from 'lucide-react';

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [upvoted, setUpvoted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('posts').select('*, users!posts_user_id_fkey(name, year_level, tech_stack, github_url)').eq('id', id).single();
      if (!data) return navigate('/', { replace: true });
      setPost(data); setLoading(false);
      if (user) hasUserUpvoted(id).then(setUpvoted);
    }
    load();
  }, [id, user, navigate]);

  useEffect(() => { if (!confirmDelete) return; const t = setTimeout(() => setConfirmDelete(false), 3000); return () => clearTimeout(t); }, [confirmDelete]);

  const handleUpvote = async () => {
    if (!user || !post) return;
    const now = await toggleUpvote(post.id);
    setUpvoted(now);
    setPost(p => ({ ...p, upvotes_count: now ? p.upvotes_count + 1 : p.upvotes_count - 1 }));
  };

  const handleDelete = async () => {
    if (!confirmDelete) return setConfirmDelete(true);
    await deletePost(post.id);
    navigate('/', { replace: true });
  };

  const handleUpdated = async (updatedPost) => {
    setPost(updatedPost);
    setShowEdit(false);
  };

  if (loading) return <div className="animate-pulse rounded-xl border border-neutral-200 bg-white p-6"><div className="h-6 w-3/4 rounded bg-neutral-200" /></div>;
  if (!post) return null;

  const tagInfo = TAG_CONFIG[post.tag] || { label: post.tag, icon: '📌' };
  const isOwner = user?.id === post.user_id;

  return (
    <div>
      <button onClick={() => navigate('/')} className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-neutral-400 hover:text-maroon-800"><ArrowLeft size={16} />Back to feed</button>
      
      <article className="rounded-xl border border-neutral-200 bg-white p-6">
        <div className="flex gap-4">
          <button onClick={handleUpvote} className={`flex flex-col items-center gap-0.5 pt-0.5 transition-colors ${upvoted ? 'text-maroon-800' : 'text-neutral-300 hover:text-maroon-800'}`}><ChevronUp size={24} strokeWidth={upvoted ? 2.5 : 1.5} /><span className="text-xs font-bold">{post.upvotes_count}</span></button>
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-md bg-maroon-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-maroon-800">{tagInfo.icon} {tagInfo.label}</span>
              <span className="text-xs text-neutral-400">by <span onClick={() => navigate(`/profile/${post.user_id}`)} className="font-medium text-neutral-600 cursor-pointer hover:text-maroon-800 hover:underline">{post.users?.name || 'Anonymous'}</span> · {timeAgo(post.created_at)}</span>
            </div>
            <h1 className="mb-3 text-xl font-bold leading-snug text-neutral-900">{post.title}</h1>
            {post.body && <div className="mb-4 whitespace-pre-wrap text-sm leading-relaxed text-neutral-600">{post.body}</div>}
            {post.link_url && <a href={post.link_url} target="_blank" rel="noopener noreferrer" className="mb-4 inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm font-medium text-maroon-800 hover:bg-maroon-50"><ExternalLink size={14} />{post.link_url.replace(/^https?:\/\//, '').split('/')[0]}</a>}
            
            {isOwner && (
              <div className="mt-5 flex gap-3 border-t border-neutral-100 pt-4">
                <button onClick={() => setShowEdit(true)} className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-800"><Pencil size={13} />Edit post</button>
                <button onClick={handleDelete} className={`inline-flex items-center gap-1.5 text-xs transition-colors ${confirmDelete ? 'font-semibold text-red-600' : 'text-neutral-400 hover:text-red-500'}`}><Trash2 size={13} />{confirmDelete ? 'Click again to delete' : 'Delete post'}</button>
              </div>
            )}
          </div>
        </div>
      </article>
      <div className="mt-4"><CommentSection postId={post.id} commentCount={post.comments_count} /></div>
      
      {showEdit && <PostFormModal editPost={post} onClose={() => setShowEdit(false)} onCreated={() => {}} onUpdated={handleUpdated} />}
    </div>
  );
}