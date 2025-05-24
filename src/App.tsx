import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Auth0Provider } from '@auth0/auth0-react';
import { SupabaseProvider } from './contexts/SupabaseContext';
import { QuestionProvider } from './contexts/QuestionContext';
import PrivateRoute from './components/auth/PrivateRoute';
import HomePage from './pages/HomePage';
import WizardPage from './pages/WizardPage';
import AdminDashboardNew from './pages/AdminDashboardNew';
import NotFoundPage from './pages/NotFoundPage';
import ScannerListPage from './pages/ScannerListPage';

const auth0Config = {
  domain: import.meta.env.VITE_AUTH0_DOMAIN || '',
  clientId: import.meta.env.VITE_AUTH0_CLIENT_ID || '',
  authorizationParams: {
    redirect_uri: window.location.origin
  }
};

const App: React.FC = () => {
  return (
    <Auth0Provider {...auth0Config}>
      <SupabaseProvider>
        <QuestionProvider>
          <Router>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="*" element={<NotFoundPage />} />

              {/* Protected routes */}
              <Route
                path="/wizard"
                element={
                  <PrivateRoute>
                    <WizardPage />
                  </PrivateRoute>
                }
              />
              
              <Route
                path="/scanners"
                element={
                  <PrivateRoute>
                    <ScannerListPage />
                  </PrivateRoute>
                }
              />

              {/* Admin routes */}
              <Route
                path="/admin"
                element={
                  <PrivateRoute requireAdmin>
                    <AdminDashboardNew />
                  </PrivateRoute>
                }
              />
            </Routes>
          </Router>
        </QuestionProvider>
      </SupabaseProvider>
    </Auth0Provider>
  );
};

export default App;