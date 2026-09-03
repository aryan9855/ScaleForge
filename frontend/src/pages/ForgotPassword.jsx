import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import api from '../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [resetUrl, setResetUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    setResetUrl('');
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      setMessage(data.message);
      if (data.resetUrl) setResetUrl(data.resetUrl);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to request a password reset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
        <h2 className="text-3xl font-bold text-slate-900">Forgot Password?</h2>
        <p className="text-slate-500 mt-2 mb-8">Enter your email and we&apos;ll send a secure reset link.</p>
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 border border-red-100">{error}</div>}
        {message && <div className="bg-emerald-50 text-emerald-700 p-3 rounded-lg text-sm mb-6 border border-emerald-100">{message}</div>}
        {resetUrl && <a href={resetUrl} className="block mb-6 break-all text-sm text-indigo-600 underline">Open local reset link</a>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input type="email" required placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <button type="submit" disabled={loading} className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-lg disabled:opacity-50">{loading ? 'Sending...' : 'Send Reset Link'}</button>
        </form>
        <Link to="/login" className="mt-6 flex items-center justify-center gap-2 text-sm text-indigo-600 font-semibold hover:underline"><ArrowLeft className="w-4 h-4" /> Back to login</Link>
      </div>
    </div>
  );
};

export default ForgotPassword;