import { useState } from 'react';
import { createPost } from '../lib/posts';
import { TAG_CONFIG } from '../lib/posts';
import { X, Link2 } from 'lucide-react';

export default function CreatePostModal({ onClose, onCreated }) {
  const [tag, setTag] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!tag) {
      setError('Select a tag first.');
      return;
    }
    if (title.trim().length < 5) {
      setError('Title must be at least 5 characters.');
      return;
    }

    setSubmitting(true);
    try {
      const post = await createPost({
        title: title.trim(),
        body: body.trim(),
        tag,
        linkUrl: linkUrl.trim() || null,
      });
      onCreated(post);
    } catch (err) {
      setError(err.message || 'Failed to create post.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    'w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 transition-colors focus:border-maroon-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-maroon-800';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4">
          <h2 className="text-lg font-bold text-neutral-900">New Post</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          {/* Error */}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Tag selector */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-neutral-800">
              Tag <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(TAG_CONFIG).map(([key, { label, icon }]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTag(key)}
                  className={`rounded-lg border px-3.5 py-2 text-sm font-medium transition-all ${
                    tag === key
                      ? 'border-maroon-800 bg-maroon-800 text-white shadow-sm'
                      : 'border-neutral-200 text-neutral-600 hover:border-neutral-400 hover:bg-neutral-50'
                  }`}
                >
                  {icon} {label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-neutral-800">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's on your mind?"
              maxLength={200}
              className={inputClass}
            />
            <p className="mt-1 text-right text-xs text-neutral-400">
              {title.length}/200
            </p>
          </div>

          {/* Body */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-neutral-800">
              Body{' '}
              <span className="font-normal text-neutral-400">(optional)</span>
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Add some context, details, or code snippets..."
              rows={4}
              className={`${inputClass} resize-none`}
            />
          </div>

          {/* Link — only for project tag */}
          {tag === 'project' && (
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-neutral-800">
                <Link2 size={14} className="text-maroon-800" />
                Link{' '}
                <span className="font-normal text-neutral-400">
                  (GitHub, Vercel, etc.)
                </span>
              </label>
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://github.com/you/project"
                className={inputClass}
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-neutral-200 px-5 py-2.5 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-maroon-800 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-maroon-900 disabled:opacity-50"
            >
              {submitting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}