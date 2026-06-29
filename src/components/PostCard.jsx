import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { TAG_CONFIG } from '../lib/posts';
import { toggleUpvote, hasUserUpvoted } from '../lib/upvotes';
import { deletePost } from '../lib/posts';
import { timeAgo } from '../lib/time-ago';
import { ChevronUp, MessageSquare, ExternalLink, Trash2 } from 'lucide-react';

export default function PostCard({ post, onDelete }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [upvoted, setUpvoted] = useState(false);
  const [upvotesCount, setUpvotesCount] = useState(post.upvotes_count);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const isOwner = user?.id === post.user_id;
  const tagInfo = TAG_CONFIG[post.tag] || { label: post.tag, icon: '📌' };

  useEffect(() => {
    if (user) hasUserUpvoted(post.id).then(setUpvoted);
  }, [post.id, user]);

  useEffect(() => {
    if (!confirmDelete) return;
    const t = setTimeout(() => setConfirmDelete(false), 3000);
    return () => clearTimeout(t);
  }, [confirmDelete]);

  const handleUpvote = async (e) => {
    e.stopPropagation();
    if (!user) return;
    try {
      const now = await toggleUpvote(post.id);
      setUpvoted(now);
      setUpvotesCount((c) => (now ? c + 1 : c - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    try {
      await deletePost(post.id);
      onDelete?.(post.id);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <article
      onClick={() => navigate(`/post/${post.id}`)}
      className="group cursor-pointer rounded-xl border border-neutral-200 bg-white p-5 transition-all hover:border-neutral-300 hover:shadow-sm"
    >
      <div className="flex gap-4">
        {/* Upvote */}
        <button
          onClick={handleUpvote}
          className={`flex flex-col items-center gap-0.5 pt-0.5 transition-colors ${
            upvoted
              ? 'text-maroon-800'
              : 'text-neutral-300 hover:text-maroon-800'
          }`}
          title={upvoted ? 'Remove upvote' : 'Upvote'}
        >
          <ChevronUp size={22} strokeWidth={upvoted ? 2.5 : 1.5} />
          <span className="text-xs font-bold">{upvotesCount}</span>
        </button>

        {/* Content */}
        <div className="min-w-0 flex-1">
          {/* Meta row */}
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-md bg-maroon-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-maroon-800">
              {tagInfo.icon} {tagInfo.label}
            </span>
            <span className="text-xs text-neutral-400">
              by <span className="font-medium text-neutral-500">{post.users?.name || 'Anonymous'}</span>
              {' · '}{timeAgo(post.created_at)}
            </span>
          </div>

          {/* Title */}
          <h2 className="mb-1 text-[15px] font-semibold leading-snug text-neutral-900 transition-colors group-hover:text-maroon-800">
            {post.title}
          </h2>

          {/* Body preview */}
          {post.body && (
            <p className="text-sm leading-relaxed text-neutral-500 line-clamp-2">
              {post.body}
            </p>
          )}

          {/* Link */}
          {post.link_url && (
            <a
              href={post.link_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-xs font-medium text-maroon-800 transition-colors hover:bg-maroon-50 hover:border-maroon-200"
            >
              <ExternalLink size={11} />
              {post.link_url.replace(/^https?:\/\//, '').split('/')[0]}
            </a>
          )}

          {/* Footer */}
          <div className="mt-2.5 flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 text-xs text-neutral-400">
              <MessageSquare size={13} />
              {post.comments_count} {post.comments_count === 1 ? 'comment' : 'comments'}
            </span>

            {isOwner && (
              <button
                onClick={handleDelete}
                className={`inline-flex items-center gap-1 text-xs transition-colors ${
                  confirmDelete
                    ? 'font-semibold text-red-600'
                    : 'text-neutral-300 opacity-0 transition-opacity group-hover:opacity-100 hover:!text-red-500'
                }`}
              >
                <Trash2 size={12} />
                {confirmDelete ? 'Click to confirm' : 'Delete'}
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}