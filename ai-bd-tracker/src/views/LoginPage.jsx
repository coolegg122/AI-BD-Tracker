import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    // ... same as before
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        navigate('/dashboard'); // Redirect to dashboard after successful login
      } else {
        setError(result.message || 'Invalid email or password');
      }
    } catch (err) {
      setError(err.message || 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-ui-bg p-4 relative transition-colors duration-500">
      <div className="w-full max-w-md bg-ui-card rounded-2xl shadow-xl overflow-hidden relative z-10 border border-ui-border transition-colors">
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 rounded-full bg-ui-accent/10 flex items-center justify-center mb-4 transition-colors">
              <Lock className="w-8 h-8 text-ui-accent" />
            </div>
            <h2 className="text-2xl font-bold text-ui-text">Welcome Back</h2>
            <p className="text-ui-text-muted mt-2">Sign in to your AI-BD Tracker account</p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-ui-error/10 text-ui-error rounded-lg text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-ui-text-muted mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-ui-text-muted" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 bg-ui-input border border-ui-input-border rounded-lg focus:ring-2 focus:ring-ui-accent/20 focus:border-ui-accent outline-none text-ui-text transition-all"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-ui-text-muted mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-ui-text-muted" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 bg-ui-input border border-ui-input-border rounded-lg focus:ring-2 focus:ring-ui-accent/20 focus:border-ui-accent outline-none text-ui-text transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-ui-text-muted hover:text-ui-text" />
                  ) : (
                    <Eye className="h-5 w-5 text-ui-text-muted hover:text-ui-text" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-ui-accent focus:ring-ui-accent border-ui-border rounded transition-colors"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-ui-text-muted">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="font-bold text-ui-accent hover:text-ui-accent/80 cursor-pointer bg-transparent border-none outline-none"
                >
                  Forgot password?
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-ui-accent hover:bg-ui-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ui-accent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing in...
                  </div>
                ) : 'Sign in'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-ui-text-muted">
              Don't have an account?{' '}
              <a href="/register" className="font-bold text-ui-accent hover:text-ui-accent/80">
                Sign up
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200 transition-all">
          <div className="w-full max-w-sm bg-ui-card rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-ui-border transition-colors">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-ui-accent/10 rounded-xl transition-colors">
                  <Mail className="w-6 h-6 text-ui-accent" />
                </div>
                <button onClick={() => setShowForgotModal(false)} className="text-ui-text-muted hover:text-ui-text p-1 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <h3 className="text-xl font-bold text-ui-text mb-2 transition-colors">Reset Password</h3>
              <p className="text-sm text-ui-text-muted leading-relaxed mb-6 transition-colors">
                For security reasons, password resets are handled by your system administrator. 
                Please contact the IT support team or your BD Director.
              </p>
              <div className="bg-ui-bg p-4 rounded-xl border border-ui-border mb-6 transition-colors">
                <p className="text-[10px] font-bold text-ui-text-muted uppercase mb-1">Support Email</p>
                <p className="text-sm font-bold text-ui-text">support@ai-bdtracker.com</p>
              </div>
              <button
                onClick={() => setShowForgotModal(false)}
                className="w-full py-3 bg-ui-accent hover:opacity-90 text-white font-bold rounded-xl transition-all shadow-lg shadow-ui-accent/20"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;