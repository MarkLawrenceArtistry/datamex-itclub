import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../lib/profiles';
import { fetchPosts } from '../lib/posts';
import PostCard from '../components/PostCard';
import { timeAgo } from '../lib/time-ago';
import { Edit2, Save, X, Link2, Globe } from 'lucide-react';

export default function Profile() {
  const { user, profile, refreshProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: '',
    year_level: '1st Year',
    tech_stack: '',
    github_url: '',
    linkedin_url: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name,
        year_level: profile.year_level,
        tech_stack: (profile.tech_stack || []).join(', '),
        github_url: profile.github_url || '',
        linkedin_url: profile.linkedin_url || '',
      });
    }
  }, [profile]);

  useEffect(() => {
    if (user) {
      fetchPosts({}).then(allPosts => {
        setPosts(allPosts.filter(p => p.user_id === user.id));
      });
    }
  }, [user]);

  const handleSave = async () => {
    if (!form.name.trim()) { setError('Name is required'); return; }
    setSaving(true);
    setError('');
    try {
      await updateProfile({
        name: form.name.trim(),
        year_level: form.year_level,
        tech_stack: form.tech_stack
          .split(',')
          .map(t => t.trim())
          .filter(Boolean),
        github_url: form.github_url.trim() || null,
        linkedin_url: form.linkedin_url.trim() || null,
      });
      await refreshProfile();
      setEditing(false);
    } catch (err) {
      setError(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setForm({
        name: profile.name,
        year_level: profile.year_level,
        tech_stack: (profile.tech_stack || []).join(', '),
        github_url: profile.github_url || '',
        linkedin_url: profile.linkedin_url || '',
      });
    }
    setEditing(false);
    setError('');
  };

  if (!profile) return null;

  return (
    <div className="space-y-6">
      {/* Profile header */}
      <div className="rounded-xl border border-neutral-200 bg-white p-6">
        <div className="flex items-start justify-between">
          <div>
            {/* Avatar */}
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-maroon-800 text-xl font-bold text-white">
              {profile.name.charAt(0).toUpperCase()}
            </div>

            <h1 className="text-2xl font-bold text-neutral-900">{profile.name}</h1>
            <p className="mt-1 text-sm text-neutral-500">{profile.year_level}</p>

            {profile.tech_stack?.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {profile.tech_stack.map(tech => (
                  <span
                    key={tech}
                    className="rounded-md border border-neutral-200 px-2 py-0.5 text-xs font-medium text-neutral-600"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-3 flex flex-wrap gap-3">
              {profile.github_url && (
                <a
                  href={profile.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-maroon-800 transition-colors"
                >
                  <Link2 size={15} />
                  GitHub
                </a>
              )}
              {profile.linkedin_url && (
                <a
                  href={profile.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-maroon-800 transition-colors"
                >
                  <Globe size={15} />
                  LinkedIn
                </a>
              )}
              <span className="text-xs text-neutral-400 mt-0.5">
                Joined {timeAgo(profile.created_at)}
              </span>
            </div>
          </div>

          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-50"
            >
              <Edit2 size={14} />
              Edit
            </button>
          )}
        </div>

        {/* Edit form */}
        {editing && (
          <div className="mt-6 border-t border-neutral-200 pt-6 space-y-4">
            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
            )}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm text-neutral-900 focus:border-maroon-800 focus:outline-none focus:ring-1 focus:ring-maroon-800"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">Year Level</label>
              <select
                value={form.year_level}
                onChange={(e) => setForm(prev => ({ ...prev, year_level: e.target.value }))}
                className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm text-neutral-900 focus:border-maroon-800 focus:outline-none focus:ring-1 focus:ring-maroon-800"
              >
                {['1st Year', '2nd Year', '3rd Year', '4th Year', 'Alumni'].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                Tech Stack <span className="font-normal text-neutral-400">(comma-separated)</span>
              </label>
              <input
                type="text"
                value={form.tech_stack}
                onChange={(e) => setForm(prev => ({ ...prev, tech_stack: e.target.value }))}
                placeholder="React, Node.js, Python"
                className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-maroon-800 focus:outline-none focus:ring-1 focus:ring-maroon-800"
              />
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-neutral-700">
                <Link2 size={14} /> GitHub URL
              </label>
              <input
                type="url"
                value={form.github_url}
                onChange={(e) => setForm(prev => ({ ...prev, github_url: e.target.value }))}
                placeholder="https://github.com/username"
                className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-maroon-800 focus:outline-none focus:ring-1 focus:ring-maroon-800"
              />
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-neutral-700">
                <Globe size={14} /> LinkedIn URL
              </label>
              <input
                type="url"
                value={form.linkedin_url}
                onChange={(e) => setForm(prev => ({ ...prev, linkedin_url: e.target.value }))}
                placeholder="https://linkedin.com/in/username"
                className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-maroon-800 focus:outline-none focus:ring-1 focus:ring-maroon-800"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={handleCancel}
                className="flex items-center gap-1.5 rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50"
              >
                <X size={14} />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 rounded-lg bg-maroon-800 px-4 py-2 text-sm font-medium text-white hover:bg-maroon-900 disabled:opacity-50"
              >
                <Save size={14} />
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User's posts */}
      <div>
        <h2 className="mb-4 text-lg font-bold text-neutral-900">Your Posts</h2>
        {posts.length === 0 ? (
          <div className="rounded-xl border border-neutral-200 bg-white py-12 text-center">
            <p className="text-sm text-neutral-400">You haven't posted anything yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map(post => (
              <PostCard key={post.id} post={post} onDelete={(id) => {
                setPosts(prev => prev.filter(p => p.id !== id));
              }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}