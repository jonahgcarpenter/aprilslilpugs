import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const LoginComponent: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const auth = getAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/admin');
    } catch (error: any) {
      switch (error.code) {
        case 'auth/invalid-credential':
          setError('Invalid email or password');
          break;
        case 'auth/too-many-requests':
          setError('Account temporarily locked due to too many failed attempts. Please try again later');
          break;
        case 'auth/network-request-failed':
          setError('Network error. Please check your internet connection');
          break;
        default:
          setError('An error occurred. Please try again.');
          console.error('Login error:', error.code, error.message);
      }
    }
  };

  return (
    <>
      {error && <p className="login-error-message">{error}</p>}
      <form className="login-form-container" onSubmit={handleSubmit}>
        <h2 className="login-form-header">Login</h2>
        <input
          className="login-form-input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <div className="login-password-container">
          <input
            className="login-form-input"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            className="login-password-toggle"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
        <button className="login-action-button" type="submit">Login</button>
      </form>
    </>
  );
};

export default LoginComponent;
