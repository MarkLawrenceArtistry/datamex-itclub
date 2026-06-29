import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { TAG_CONFIG } from '../lib/posts';
import { toggleUpvote, hasUserUpvoted } from '../lib/upvotes';
import { deletePost } from '../lib/posts';
import { timeAgo } from '../lib/time-ago';
import CommentSection from '../components/CommentSection';
import { ChevronUp, ArrowLeft, ExternalLink, Trash2 } from 'lucide-react';

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [upvoted, setUpvoted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('posts')
        .select('*, users!posts_user_id_fkey(name, year_level, tech_stack, github_url)')
        .eq('id', id)
        .single();

      if (error || !data) {
        navigate('/', { replace: true });
        return;
      }
      setPost(data);
      setLoading(false);

      if (user) {
        hasUserUpvoted(id).then(setUpvoted);
      }
    }
    load();
  }, [id, user, navigate]);

  useEffect(() => {
    if (confirmDelete) {
      const t = setTimeout(() => setConfirmDelete(false), 3000);
      return () => clearTimeout(t);
    }
  }, [confirmDelete]);

  const handleUpvote = async () => {
    if (!user || !post) return;
    const nowUpvoted = await toggleUpvote(post.id);
    setUpvoted(nowUpvoted);
    setPost(prev => ({
      ...prev,
      upvotes_count: nowUpvoted ? prev.upvotes_count + 1 : prev.upvotes_count - 1,
    }));
  };

  const handleDelete = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    await deletePost(post.id);
    navigate('/', { replace: true });
  };

  if (loading) {
    return (
      <div className="animate-pulse rounded-xl border border-neutral-200 bg-white p-6">
        <div className="mb-4 h-4 w-24 rounded bg-neutral-200" />
        <div className="mb-3 h-6 w-3/4 rounded bg-neutral-200" />
        <div className="h-4 w-full rounded bg-neutral-200" />
        <div className="mt-2 h-4 w-2/3 rounded bg-neutral-200" />
      </div>
    );
  }

  if (!post) return null;

  const tagInfo = TAG_CONFIG[post.tag] || { label: post.tag, icon: '📌' };
  const isOwner = user?.id === post.user_id;

  return (
    <div>
      {/* Back button */}
      <button
        onClick={() => navigate('/')}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-[#800020] transition-colors"
      >
        <ArrowLeft size={16} />
        Back to feed
      </button>

      {/* Post */}
      <article className="rounded-xl border border-neutral-200 bg-white p-6">
        <div className="flex gap-4">
          {/* Upvote */}
          <button
            onClick={handleUpvote}
            className={`flex flex-col items-center gap-0.5 pt-0.5 transition-colors ${
              upvoted ? 'text-[#800020]' : 'text-neutral-400 hover:text-[#800020]'
            }`}
          >
            <ChevronUp size={22} strokeWidth={upvoted ? 2.5 : 2} />
            <span className="text-xs font-semibold">{post.upvotes_count}</span>
          </button>

          <div className="min-w-0 flex-1">
            {/* Tag + meta */}
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-md bg-[#800020]/10 px-2 py-0.5 text-xs font-medium text-[#800020]">
                {tagInfo.icon} {tagInfo.label}
              </span>
              <span className="text-xs text-neutral-400">
                by {post.users?.name || 'Anonymous'} · {timeAgo(post.created_at)}
              </span>
            </div>

            {/* Title */}
            <h1 className="mb-3 text-xl font-bold text-neutral-900">{post.title}</h1>

            {/* Body */}
            {post.body && (
              <div className="mb-4 whitespace-pre-wrap text-sm leading-relaxed text-neutral-700">
                {post.body}
              </div>
            )}

            {/* Link */}
            {post.link_url && (
              <a
                href={post.link_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mb-4 inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium text-[#800020] transition-colors hover:bg-[#800020]/5"
              >
                <ExternalLink size={14} />
                {post.link_url.replace(/^https?:\/\//, '').split('/')[0]}
              </a>
            )}

            {/* Delete */}
            {isOwner && (
              <div className="mt-4 border-t border-neutral-100 pt-3">
                <button
                  onClick={handleDelete}
                  className={`inline-flex items-center gap-1.5 text-xs transition-colors ${
                    confirmDelete ? 'text-red-600 font-medium' : 'text-neutral-400 hover:text-red-500'
                  }`}
                >
                  <Trash2 size={13} />
                  {confirmDelete ? 'Click again to confirm deletion' : 'Delete post'}
                </button>
              </div>
            )}
          </div>
        </div>
      </article>

      {/* Comments */}
      <div className="mt-4">
        <CommentSection postId={post.id} commentCount={post.comments_count} />
      </div>
    </div>
  );
}