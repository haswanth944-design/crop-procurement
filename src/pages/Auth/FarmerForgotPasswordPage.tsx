import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { 
  Sprout, 
  Mail, 
  ArrowLeft, 
  Send, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

export const FarmerForgotPasswordPage: React.FC = () => {
  const { sendResetEmail } = useAuth();
  const { navigate, showToast } = useApp();

  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setErrorMessage('Please enter a valid registered email address.');
      return;
    }

    setSubmitting(true);
    const res = await sendResetEmail(trimmed);
    setSubmitting(false);

    if (res.success) {
      setIsSent(true);
      showToast('Password reset email sent. Please check your inbox.');
    } else {
      setErrorMessage(res.error || 'Failed to send reset link. Please check the email.');
    }
  };

  return (
    <div className="min-h-[85vh] bg-slate-50 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200">
          <div className="text-center mb-6">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-800 text-white shadow-md shadow-emerald-900/20 mb-3">
              <Sprout className="w-7 h-7 text-emerald-300" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 font-heading">
              Reset Password
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Enter your registered account email address to receive a secure password recovery link.
            </p>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {isSent ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Email Dispatched!</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                We've sent a password reset link to <strong className="text-slate-900">{email}</strong>. Check your inbox and spam folder, then follow the instructions.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl shadow transition"
              >
                Return to Farmer Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Registered Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-emerald-700 outline-none"
                    placeholder="farmer@example.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl text-sm shadow-md shadow-emerald-950/20 transition active:scale-98 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'Sending Link...' : 'Send Password Reset Link'}</span>
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Login</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
