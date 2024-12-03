import React, { useState, useEffect } from 'react';
import '../styles/main.css';
import '../styles/login.css';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import Section from "../components/Section";
import Footer from "../components/Footer";

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      switch (error.code) {
        case 'auth/invalid-email':
          setError('Invalid email format');
          break;
        case 'auth/user-not-found':
          setError('No account exists with this email');
          break;
        case 'auth/wrong-password':
          setError('Incorrect password');
          break;
        case 'auth/too-many-requests':
          setError('Too many failed attempts. Please try again later');
          break;
        default:
          setError('An error occurred. Please try again.');
      }
    }
  };

  return (
    <>
      <div className="page-container">
        <Section title="Admin Login">
          {error && <p className="error-message">{error}</p>}
          <form className="form-container" onSubmit={handleSubmit}>
            <input
              className="form-input"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <div className="password-container">
              <input
                className="form-input"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <button className="action-button" type="submit">Login</button>
          </form>
        </Section>
      </div>
      <Footer />
    </>
  );
};

export default Login;