import React, { useState } from 'react';
import { Lock, User, Mail, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'BD Manager',
    initials: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate initials length
    if (formData.initials.length < 1 || formData.initials.length > 3) {
      setError('Initials must be 1-3 characters');
      return;
    }

    setIsLoading(true);

    try {
      const { password, confirmPassword, ...userData } = formData;
      console.log('Submitting registration:', userData);
      
      const result = await register({ ...userData, password });
      console.log('Registration result:', result);

      if (result.success) {
        alert('Registration successful! Please log in.');
        navigate('/login');
      } else {
        setError(result.message || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'An error occurred during registration');
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
              <User className="w-8 h-8 text-ui-accent" />
            </div>
            <h2 className="text-2xl font-bold text-ui-text transition-colors">Create Account</h2>
            <p className="text-ui-text-muted mt-2 transition-colors">Join AI-BD Tracker to manage your deals</p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-ui-error/10 text-ui-error rounded-lg text-sm transition-colors">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-ui-text-muted mb-1 transition-colors">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-ui-text-muted" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 bg-ui-input border border-ui-input-border rounded-lg focus:ring-2 focus:ring-ui-accent/30 focus:border-ui-accent text-ui-text transition-all"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="initials" className="block text-sm font-medium text-ui-text-muted mb-1">
                  Initials
                </label>
                <input
                  id="initials"
                  name="initials"
                  type="text"
                  required
                  value={formData.initials}
                  onChange={handleChange}
                  className="block w-full px-3 py-3 bg-ui-input border border-ui-input-border rounded-lg focus:ring-2 focus:ring-ui-accent/30 focus:border-ui-accent text-ui-text transition-all"
                  placeholder="JD"
                  maxLength="3"
                />
              </div>
            </div>

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
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 bg-ui-input border border-ui-input-border rounded-lg focus:ring-2 focus:ring-ui-accent/30 focus:border-ui-accent text-ui-text transition-all"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-ui-text-muted mb-1">
                Role
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="block w-full px-3 py-3 bg-ui-input border border-ui-input-border rounded-lg focus:ring-2 focus:ring-ui-accent/30 focus:border-ui-accent text-ui-text transition-all appearance-none"
              >
                <option value="BD Manager">BD Manager</option>
                <option value="BD Director">BD Director</option>
                <option value="VP of BD">VP of BD</option>
                <option value="CEO">CEO</option>
                <option value="Other">Other</option>
              </select>
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
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-10 py-3 bg-ui-input border border-ui-input-border rounded-lg focus:ring-2 focus:ring-ui-accent/30 focus:border-ui-accent text-ui-text transition-all"
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

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-ui-text-muted mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-ui-text-muted" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-10 py-3 bg-ui-input border border-ui-input-border rounded-lg focus:ring-2 focus:ring-ui-accent/30 focus:border-ui-accent text-ui-text transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-ui-text-muted hover:text-ui-text" />
                  ) : (
                    <Eye className="h-5 w-5 text-ui-text-muted hover:text-ui-text" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-ui-accent hover:bg-ui-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ui-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Creating account...' : 'Create Account'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-ui-text-muted transition-colors">
              Already have an account?{' '}
              <a href="/login" className="font-bold text-ui-accent hover:text-ui-accent/80 transition-colors">
                Sign in
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;