import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AppRoutes } from './routes/AppRoutes';

export default function App() {
  return (
    <BrowserRouter>
        {/* O AuthProvider envolve o app inteiro, garantindo que a Splash Screen rode primeiro */}
        <AuthProvider>
            <AppRoutes />
        </AuthProvider>
    </BrowserRouter>
  );
}