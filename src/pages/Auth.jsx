import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signUp, signIn } from '../lib/auth';
import { Eye, EyeOff } from 'lucide-react';

export default function Auth() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [yearLevel, setYearLevel] = useState('1st Year');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await signIn({ email, password });
      } else {
        if (!fullName.trim()) { setError('Name is required'); setLoading(false); return; }
        await signUp({
          email,
          password,
          fullName: fullName.trim(),
          yearLevel,
        });
        // If email confirmation is ON, show message
        setError('Check your email to confirm your account.');
        setLoading(false);
        return;
      }
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-100 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-neutral-900">
            The<span className="text-[#800020]">Hub</span>
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            Your school's exclusive IT community
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
          <h2 className="mb-6 text-xl font-bold text-neutral-900">
            {isLogin ? 'Welcome back' : 'Create your account'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <p className={`rounded-lg px-3 py-2 text-sm ${
                error.includes('Check your email')
                  ? 'bg-green-50 text-green-700'
                  : 'bg-red-50 text-red-600'
              }`}>
                {error}
              </p>
            )}

            {!isLogin && (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Juan Dela Cruz"
                  className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-[#800020] focus:outline-none focus:ring-1 focus:ring-[#800020]"
                />
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-[#800020] focus:outline-none focus:ring-1 focus:ring-[#800020]"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  required
                  minLength={6}
                  className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 pr-10 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-[#800020] focus:outline-none focus:ring-1 focus:ring-[#800020]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">Year Level</label>
                <select
                  value={yearLevel}
                  onChange={(e) => setYearLevel(e.target.value)}
                  className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm text-neutral-900 focus:border-[#800020] focus:outline-none focus:ring-1 focus:ring-[#800020]"
                >
                  {['1st Year', '2nd Year', '3rd Year', '4th Year', 'Alumni'].map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#800020] py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#5C0017] disabled:opacity-50"
            >
              {loading ? 'Please wait...' : isLogin ? 'Sign in' : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-neutral-500">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="font-medium text-[#800020] hover:underline"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}