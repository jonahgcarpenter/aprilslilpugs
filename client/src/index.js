import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// CONTEXT
import { BreederContextProvider } from './context/BreederContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BreederContextProvider>
      <App />
    </BreederContextProvider>
  </React.StrictMode>
);
