import { describe, it, expect, vi, beforeEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import ProtectedRoute from '../components/ProtectedRoute';
import Layout from '../components/layout/Layout';
import AdminDashboard from '../pages/AdminDashboard';
import ScannerWizard from '../pages/ScannerWizard';
import Home from '../pages/Home';
import { AuthContext } from '../contexts/AuthContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { ToastProvider } from '../components/ui/Toast';
import { WizardProvider } from '../contexts/WizardContext';

function renderWithAuth(ui: React.ReactElement, { currentUser, isLoading = false }: { currentUser: unknown; isLoading?: boolean }) {
  return render(
    <ThemeProvider>
      <ToastProvider>
        <AuthContext.Provider value={{ currentUser, isLoading, logout: vi.fn(), login: vi.fn(), signup: vi.fn(), session: null, sendPasswordResetEmail: vi.fn() }}>
          <WizardProvider>
            {ui}
          </WizardProvider>
        </AuthContext.Provider>
      </ToastProvider>
    </ThemeProvider>
  );
}

describe('Routing & Access Control', () => {
  const ownerUser = { id: '1', email: 'owner@example.com', is_owner: true };
  const regularUser = { id: '2', email: 'user@example.com', is_owner: false };

  it('redirects unauthenticated users to login', () => {
    renderWithAuth(
      <MemoryRouter initialEntries={["/scanner"]}>
        <Routes>
          <Route path="/scanner" element={<ProtectedRoute><ScannerWizard /></ProtectedRoute>} />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>,
      { currentUser: null }
    );
    expect(screen.getByText(/login page/i)).toBeInTheDocument();
  });

  it('allows regular users to access /scanner but not /admin', () => {
    renderWithAuth(
      <MemoryRouter initialEntries={["/scanner"]}>
        <Routes>
          <Route path="/scanner" element={<ProtectedRoute><ScannerWizard /></ProtectedRoute>} />
        </Routes>
      </MemoryRouter>,
      { currentUser: regularUser }
    );
    // Look for any element with scanner-related text since the heading might be rendered differently
    expect(screen.getByTestId('holographic-text')).toBeInTheDocument();

    renderWithAuth(
      <MemoryRouter initialEntries={["/admin"]}>
        <Routes>
          <Route path="/admin" element={<ProtectedRoute requireOwner><AdminDashboard /></ProtectedRoute>} />
          <Route path="/scanner" element={<div>Scanner Page</div>} />
        </Routes>
      </MemoryRouter>,
      { currentUser: regularUser }
    );
    expect(screen.getByText(/scanner page/i)).toBeInTheDocument();
  });

  it('allows owners to access /admin', () => {
    renderWithAuth(
      <MemoryRouter initialEntries={["/admin"]}>
        <Routes>
          <Route path="/admin" element={<ProtectedRoute requireOwner><AdminDashboard /></ProtectedRoute>} />
        </Routes>
      </MemoryRouter>,
      { currentUser: ownerUser }
    );
    // Look for the admin dashboard heading using the test ID
    expect(screen.getByTestId('holographic-text')).toBeInTheDocument();
  });

  it('shows correct navigation links for owners and regular users', () => {
    // Owner
    renderWithAuth(
      <MemoryRouter>
        <Layout>
          <div>Content</div>
        </Layout>
      </MemoryRouter>,
      { currentUser: ownerUser }
    );
    expect(screen.getByText(/admin dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/scanner templates/i)).toBeInTheDocument();
    expect(screen.getByText(/logout/i)).toBeInTheDocument();

    // Cleanup to avoid state leakage between renders
    cleanup();

    // Regular user
    renderWithAuth(
      <MemoryRouter>
        <Layout>
          <div>Content</div>
        </Layout>
      </MemoryRouter>,
      { currentUser: regularUser }
    );
    // The Admin Dashboard link should only be present for owners, not regular users
    expect(screen.queryByText(/admin dashboard/i)).toBeNull();
    expect(screen.getByText(/scanner templates/i)).toBeInTheDocument();
    expect(screen.getByText(/logout/i)).toBeInTheDocument();
  });
});
