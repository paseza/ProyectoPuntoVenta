import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter } from 'react-router-dom';

import App from './App.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import { SessionProvider } from './context/SessionContext.jsx';
import { queryClient } from './lib/queryClient.js';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <SessionProvider>
            <App />
          </SessionProvider>
        </BrowserRouter>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
