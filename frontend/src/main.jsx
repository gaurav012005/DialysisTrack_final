import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AppRouter from './AppRouter';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import "./styles/index.css";
import "./styles/typography.css";
import "./styles/accessibility.css";
import "./styles/dark-mode-fixes.css";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRouter />
          <Toaster
            position="top-right"
            reverseOrder={false}
            gutter={12}
            containerStyle={{
              top: 60,
              right: 16,
              zIndex: 99999,
            }}
            toastOptions={{
              duration: 3000,
              style: {
                maxWidth: '380px',
                fontSize: '14px',
                fontWeight: 500,
                padding: '12px 16px',
                borderRadius: '10px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
                background: '#1e293b',
                color: '#e2e8f0',
              },
              success: {
                style: {
                  background: '#065f46',
                  color: '#d1fae5',
                  border: '1px solid #10b981',
                },
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#d1fae5',
                },
              },
              error: {
                duration: 4000,
                style: {
                  background: '#7f1d1d',
                  color: '#fecaca',
                  border: '1px solid #ef4444',
                },
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fecaca',
                },
              },
            }}
          />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);

