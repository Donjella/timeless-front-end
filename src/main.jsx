import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/index.css';
import App from './App.jsx';
import { AuthProvider } from './contexts/AuthContext';

console.log('Main.jsx is running');

const root = document.getElementById('root');
console.log('Root element:', root);

createRoot(root).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>
);
