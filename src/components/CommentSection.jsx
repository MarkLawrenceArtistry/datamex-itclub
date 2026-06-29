import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchComments, addComment, deleteComment } from '../lib/comments';
import { timeAgo } from '../lib/time-ago';
import { MessageSquare, Reply, Trash2, Send } from 'lucide-react';

export default function CommentSection({ postId, commentCount }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [body, setBody] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [replyBody, setReplyBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [confirmDeletes, setConfirmDeletes] = useState({});

  const load = () => {
    setLoading(true);
    fetchComments(postId).then((data) => {
      setComments(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    load();
  }, [postId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!body.trim()) return;
    setSubmitting(true);
    try {
      const c = await addComment({ postId, body: body.trim() });
      setComments((prev) => [...prev, c]);
      setBody('');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyBody.trim() || !replyTo) return;
    setSubmitting(true);
    try {
      const c = await addComment({
        postId,
        body: replyBody.trim(),
        parentCommentId: replyTo.id,
      });
      setComments((prev) => [...prev, c]);
      setReplyBody('');
      setReplyTo(null);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (cid) => {
    if (!confirmDeletes[cid]) {
      setConfirmDeletes((p) => ({ ...p, [cid]: true }));
      setTimeout(() => {
        setConfirmDeletes((p) => {
          const n = { ...p };
          delete n[cid];
          return n;
        });
      }, 3000);
      return;
    }
    try {
      await deleteComment(cid);
      setComments((prev) => prev.filter((c) => c.id !== cid));
    } catch (err) {
      console.error(err);
    }
  };

  const topLevel = comments.filter((c) => !c.parent_comment_id);
  const repliesByParent = {};
  comments
    .filter((c) => c.parent_comment_id)
    .forEach((c) => {
      if (!repliesByParent[c.parent_comment_id])
        repliesByParent[c.parent_comment_id] = [];
      repliesByParent[c.parent_comment_id].push(c);
    });

  const textareaClass =
    'w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 transition-colors focus:border-maroon-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-maroon-800 resize-none';

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-6">
      <h3 className="mb-5 flex items-center gap-2 text-sm font-bold text-neutral-900">
        <MessageSquare size={16} className="text-neutral-400" />
        {commentCount} {commentCount === 1 ? 'comment' : 'comments'}
      </h3>

      {/* New comment */}
      <form onSubmit={handleSubmit} className="mb-6">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Add a comment..."
          rows={3}
          className={textareaClass}
        />
        <div className="mt-2 flex justify-end">
          <button
            type="submit"
            disabled={!body.trim() || submitting}
            className="flex items-center gap-1.5 rounded-lg bg-maroon-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-maroon-900 disabled:opacity-40"
          >
            <Send size={13} />
            Comment
          </button>
        </div>
      </form>

      {/* List */}
      {loading ? (
        <div className="space-y-5">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="mb-2 h-3 w-28 rounded bg-neutral-200" />
              <div className="h-4 w-full rounded bg-neutral-200" />
              <div className="mt-1 h-4 w-2/3 rounded bg-neutral-200" />
            </div>
          ))}
        </div>
      ) : topLevel.length === 0 ? (
        <p className="py-6 text-center text-sm text-neutral-400">
          No comments yet. Start the conversation.
        </p>
      ) : (
        <div className="space-y-5">
          {topLevel.map((comment) => (
            <div key={comment.id}>
              <CommentBubble
                comment={comment}
                isOwner={user?.id === comment.user_id}
                confirmDelete={!!confirmDeletes[comment.id]}
                onReply={() => {
                  setReplyTo({ id: comment.id, name: comment.users?.name });
                  setReplyBody('');
                }}
                onDelete={() => handleDelete(comment.id)}
              />

              {/* Nested replies */}
              {repliesByParent[comment.id]?.length > 0 && (
                <div className="ml-6 mt-3 space-y-3 border-l-2 border-neutral-100 pl-4">
                  {repliesByParent[comment.id].map((reply) => (
                    <CommentBubble
                      key={reply.id}
                      comment={reply}
                      isOwner={user?.id === reply.user_id}
                      confirmDelete={!!confirmDeletes[reply.id]}
                      onReply={() => {}}
                      onDelete={() => handleDelete(reply.id)}
                      isReply
                    />
                  ))}
                </div>
              )}

              {/* Inline reply form */}
              {replyTo?.id === comment.id && (
                <form onSubmit={handleReply} className="ml-6 mt-3">
                  <div className="rounded-lg border border-maroon-200 bg-maroon-50/50 p-3">
                    <p className="mb-2 text-xs font-medium text-maroon-800">
                      Replying to {replyTo.name}
                    </p>
                    <textarea
                      value={replyBody}
                      onChange={(e) => setReplyBody(e.target.value)}
                      placeholder="Write a reply..."
                      rows={2}
                      autoFocus
                      className={`${textareaClass} !bg-white`}
                    />
                    <div className="mt-2 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setReplyTo(null)}
                        className="rounded-md px-3 py-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-800"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={!replyBody.trim() || submitting}
                        className="rounded-md bg-maroon-800 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-maroon-900 disabled:opacity-40"
                      >
                        Reply
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Single comment bubble ─── */
function CommentBubble({ comment, isOwner, confirmDelete, onReply, onDelete, isReply }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-sm font-semibold text-neutral-800">
          {comment.users?.name || 'Anonymous'}
        </span>
        <span className="text-xs text-neutral-400">{timeAgo(comment.created_at)}</span>
      </div>
      <p className="text-sm leading-relaxed text-neutral-600">{comment.body}</p>
      <div className="mt-1.5 flex items-center gap-3">
        {!isReply && (
          <button
            onClick={onReply}
            className="inline-flex items-center gap-1 text-xs text-neutral-400 transition-colors hover:text-maroon-800"
          >
            <Reply size={11} />
            Reply
          </button>
        )}
        {isOwner && (
          <button
            onClick={onDelete}
            className={`inline-flex items-center gap-1 text-xs transition-colors ${
              confirmDelete
                ? 'font-semibold text-red-600'
                : 'text-neutral-400 hover:text-red-500'
            }`}
          >
            <Trash2 size={11} />
            {confirmDelete ? 'Confirm?' : 'Delete'}
          </button>
        )}
      </div>
    </div>
  );
}