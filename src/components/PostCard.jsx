import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { TAG_CONFIG } from '../lib/posts';
import { toggleUpvote, hasUserUpvoted } from '../lib/upvotes';
import { toggleBookmark, isBookmarked } from '../lib/bookmarks';
import { deletePost } from '../lib/posts';
import { timeAgo } from '../lib/time-ago';
import { ChevronUp, MessageSquare, ExternalLink, Trash2, Bookmark, BookmarkCheck, Pencil } from 'lucide-react';

export default function PostCard({ post, onDelete, onEdit }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [upvoted, setUpvoted] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [upvotesCount, setUpvotesCount] = useState(post.upvotes_count);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const isOwner = user?.id === post.user_id;
  const tagInfo = TAG_CONFIG[post.tag] || { label: post.tag, icon: '📌' };

  useEffect(() => {
    if (user) {
      hasUserUpvoted(post.id).then(setUpvoted);
      isBookmarked(post.id).then(setBookmarked);
    }
  }, [post.id, user]);

  useEffect(() => {
    if (!confirmDelete) return;
    const t = setTimeout(() => setConfirmDelete(false), 3000);
    return () => clearTimeout(t);
  }, [confirmDelete]);

  const handleUpvote = async (e) => {
    e.stopPropagation();
    if (!user) return;
    const now = await toggleUpvote(post.id);
    setUpvoted(now);
    setUpvotesCount((c) => (now ? c + 1 : c - 1));
  };

  const handleBookmark = async (e) => {
    e.stopPropagation();
    if (!user) return;
    const now = await toggleBookmark(post.id);
    setBookmarked(now);
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!confirmDelete) return setConfirmDelete(true);
    onDelete?.(post.id);
  };

  return (
    <article onClick={() => navigate(`/post/${post.id}`)} className="group cursor-pointer rounded-xl border border-neutral-200 bg-white p-5 transition-all hover:border-neutral-300 hover:shadow-sm">
      <div className="flex gap-4">
        <button onClick={handleUpvote} className={`flex flex-col items-center gap-0.5 pt-0.5 transition-colors ${upvoted ? 'text-maroon-800' : 'text-neutral-300 hover:text-maroon-800'}`}><ChevronUp size={22} strokeWidth={upvoted ? 2.5 : 1.5} /><span className="text-xs font-bold">{upvotesCount}</span></button>
        
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-md bg-maroon-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-maroon-800">{tagInfo.icon} {tagInfo.label}</span>
            <span className="text-xs text-neutral-400">
              by <span onClick={(e) => { e.stopPropagation(); navigate(`/profile/${post.user_id}`); }} className="font-medium text-neutral-500 hover:text-maroon-800 hover:underline cursor-pointer">{post.users?.name || 'Anonymous'}</span> · {timeAgo(post.created_at)}
            </span>
          </div>

          <h2 className="mb-1 text-[15px] font-semibold leading-snug text-neutral-900 transition-colors group-hover:text-maroon-800">{post.title}</h2>
          {post.body && <p className="text-sm leading-relaxed text-neutral-500 line-clamp-2">{post.body}</p>}
          
          {post.link_url && (
            <a href={post.link_url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-xs font-medium text-maroon-800 hover:bg-maroon-50 hover:border-maroon-200">
              <ExternalLink size={11} />{post.link_url.replace(/^https?:\/\//, '').split('/')[0]}
            </a>
          )}

          <div className="mt-2.5 flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 text-xs text-neutral-400"><MessageSquare size={13} />{post.comments_count}</span>
            
            <button onClick={handleBookmark} className={`inline-flex items-center gap-1 text-xs transition-colors ${bookmarked ? 'text-maroon-800' : 'text-neutral-400 opacity-0 group-hover:opacity-100 hover:!text-maroon-800'}`}>
              {bookmarked ? <BookmarkCheck size={13} /> : <Bookmark size={13} />}Bookmark
            </button>

            {isOwner && (
              <>
                <button onClick={(e) => { e.stopPropagation(); onEdit?.(post); }} className="inline-flex items-center gap-1 text-xs text-neutral-400 opacity-0 transition-opacity group-hover:opacity-100 hover:!text-neutral-800"><Pencil size={12} />Edit</button>
                <button onClick={handleDelete} className={`inline-flex items-center gap-1 text-xs transition-colors ${confirmDelete ? 'font-semibold text-red-600 opacity-100' : 'text-neutral-400 opacity-0 group-hover:opacity-100 hover:!text-red-500'}`}><Trash2 size={12} />{confirmDelete ? 'Confirm?' : 'Delete'}</button>
              </>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}