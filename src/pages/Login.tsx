import React, { useState, useEffect } from 'react';
import '../styles/main.css';
import '../styles/login.css';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate('/admin');
      }
    });

    return () => unsubscribe();
  }, [auth, navigate]);

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
      if (error.code === 'auth/invalid-email') {
        setError('Invalid email format');
      } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setError('Invalid email or password');
      } else {
        setError('An error occurred. Please try again.');
      }
    }
  };

  return (
    <div className="page-container">
      <section className="content-section">
        <h2 className="section-title">Admin Login</h2>
        {error && <p className="error-message">{error}</p>}
        <form className="form-container" onSubmit={handleSubmit}>
          <input
            className="form-input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="form-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="action-button" type="submit">Login</button>
        </form>
      </section>
    </div>
  );
};

export default Login;