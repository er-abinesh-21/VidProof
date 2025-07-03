import { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<'signIn' | 'signUp' | 'forgotPassword'>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    document.body.classList.add('login-page-body');
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate('/');
      }
    });

    return () => {
      document.body.classList.remove('login-page-body');
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      showSuccess("Signed in successfully!");
      navigate('/');
    } catch (err: any) {
      setError(err.error_description || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
        },
      });
      if (error) throw error;
      setMessage('Check your email for the confirmation link!');
      showSuccess('Confirmation email sent!');
    } catch (err: any) {
      setError(err.error_description || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/`,
      });
      if (error) throw error;
      setMessage('Check your email for a password reset link.');
      showSuccess('Password reset email sent!');
    } catch (err: any) {
      setError(err.error_description || err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderForm = () => {
    switch (view) {
      case 'signUp':
        return (
          <form onSubmit={handleSignUp} className="login-form">
            <div className="input-group">
              <input type="text" placeholder="First Name" className="input-field" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
            </div>
            <div className="input-group">
              <input type="text" placeholder="Last Name" className="input-field" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
            </div>
            <div className="input-group">
              <input type="email" placeholder="Email" className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="input-group">
              <input type="password" placeholder="Password" className="input-field" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="login-button" disabled={loading}>
              {loading ? 'Signing Up...' : 'Sign Up'}
            </button>
            <div className="form-links">
              <a href="#" className="form-link" onClick={() => setView('signIn')}>Already have an account? Sign In</a>
            </div>
          </form>
        );
      case 'forgotPassword':
        return (
          <form onSubmit={handleForgotPassword} className="login-form">
            <div className="input-group">
              <input type="email" placeholder="Email" className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <button type="submit" className="login-button" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
            <div className="form-links">
              <a href="#" className="form-link" onClick={() => setView('signIn')}>Back to Sign In</a>
            </div>
          </form>
        );
      default: // 'signIn'
        return (
          <form onSubmit={handleLogin} className="login-form">
            <div className="input-group">
              <input type="email" placeholder="Email" className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="input-group">
              <input type="password" placeholder="Password" className="input-field" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="login-button" disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
            <div className="form-links">
              <a href="#" className="form-link" onClick={() => setView('forgotPassword')}>Forgot password?</a>
              <a href="#" className="form-link" onClick={() => setView('signUp')}>Sign up</a>
            </div>
          </form>
        );
    }
  };

  return (
    <div className="login-container">
      <div className="particles"></div>
      <div className="glass-box">
        <div className="login-header">
          <h1>Vid<span className="neon">Proof</span></h1>
          <p>AI-Powered CCTV Video Authenticity Checker</p>
        </div>
        {message && <p className="form-message success">{message}</p>}
        {error && <p className="form-message error">{error}</p>}
        {renderForm()}
      </div>
    </div>
  );
};

export default Login;