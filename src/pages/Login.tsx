import React, { useEffect } from 'react';
import '../styles/main.css';
import '../styles/login.css';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import Section from "../components/section";
import Footer from "../components/footer";
import LoginComponent from '../components/logincomponent';

const Login: React.FC = () => {
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

  return (
    <>
      <div className="page-container">
        <Section title="Admin Login">
          <LoginComponent />
        </Section>
      </div>
      <Footer />
    </>
  );
};

export default Login;