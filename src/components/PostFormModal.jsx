import { useState } from 'react';
import { createPost, updatePost } from '../lib/posts';
import { TAG_CONFIG } from '../lib/posts';
import { X, Link2, Pencil } from 'lucide-react';

export default function PostFormModal({ onClose, onCreated, onUpdated, editPost }) {
  const isEditing = !!editPost;
  const [tag, setTag] = useState(editPost?.tag || '');
  const [title, setTitle] = useState(editPost?.title || '');
  const [body, setBody] = useState(editPost?.body || '');
  const [linkUrl, setLinkUrl] = useState(editPost?.link_url || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!tag) return setError('Select a tag first.');
    if (title.trim().length < 5) return setError('Title must be at least 5 characters.');
    setSubmitting(true);
    try {
      const payload = { title: title.trim(), body: body.trim(), tag, linkUrl: linkUrl.trim() || null };
      if (isEditing) {
        const updated = await updatePost(editPost.id, payload);
        onUpdated(updated);
      } else {
        const created = await createPost(payload);
        onCreated(created);
      }
    } catch (err) {
      setError(err.message || 'Failed to save post.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = 'w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 transition-colors focus:border-maroon-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-maroon-800';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4">
          <h2 className="flex items-center gap-2 text-lg font-bold text-neutral-900">
            {isEditing ? <Pencil size={18} className="text-maroon-800"/> : null} {isEditing ? 'Edit Post' : 'New Post'}
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">{error}</div>}
          
          <div>
            <label className="mb-2 block text-sm font-semibold text-neutral-800">Tag <span className="text-red-500">*</span></label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(TAG_CONFIG).map(([key, { label, icon }]) => (
                <button key={key} type="button" onClick={() => setTag(key)} className={`rounded-lg border px-3.5 py-2 text-sm font-medium transition-all ${tag === key ? 'border-maroon-800 bg-maroon-800 text-white shadow-sm' : 'border-neutral-200 text-neutral-600 hover:border-neutral-400'}`}>{icon} {label}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-neutral-800">Title <span className="text-red-500">*</span></label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What's on your mind?" maxLength={200} className={inputClass} />
            <p className="mt-1 text-right text-xs text-neutral-400">{title.length}/200</p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-neutral-800">Body <span className="font-normal text-neutral-400">(optional)</span></label>
            <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Add some context..." rows={4} className={`${inputClass} resize-none`} />
          </div>

          {tag === 'project' && (
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-neutral-800"><Link2 size={14} className="text-maroon-800" /> Link</label>
              <input type="url" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://github.com/you/project" className={inputClass} />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-1">
            <button type="button" onClick={onClose} className="rounded-lg border border-neutral-200 px-5 py-2.5 text-sm font-medium text-neutral-600 hover:bg-neutral-50">Cancel</button>
            <button type="submit" disabled={submitting} className="rounded-lg bg-maroon-800 px-6 py-2.5 text-sm font-semibold text-white hover:bg-maroon-900 disabled:opacity-50">{submitting ? 'Saving...' : isEditing ? 'Update' : 'Post'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}