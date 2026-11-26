import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ApplicationsPage from './pages/ApplicationsPage';
import UserControlsPage from './pages/UserControlsPage';
import AccountControlsPage from './pages/AccountControlsPage';
import CustomerProfilePage from './pages/CustomerProfilePage';
import ApprovalQueuePage from './pages/ApprovalQueuePage';
import { RequireModule } from './components/controls/RequireModule';
import { MessageProvider } from './components/messages/MessageProvider';
import AccessRolesPage from './pages/AccessRolesPage';
import AuditTrailPage from './pages/AuditTrailPage';
import { AppShell } from './components/dashboard/AppShell';

export default function App() {
  return (
    <AuthProvider>
      <MessageProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppShell />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/applications" element={<ApplicationsPage />} />
              <Route element={<RequireModule module="controls" />}>
                <Route path="/user-controls" element={<UserControlsPage />} />
                <Route path="/user-controls/:cif" element={<CustomerProfilePage />} />
                <Route path="/account-controls" element={<AccountControlsPage />} />
                <Route path="/account-controls/:cif" element={<CustomerProfilePage />} />
                <Route path="/controls" element={<Navigate to="/user-controls" replace />} />
                <Route path="/controls/:cif" element={<CustomerProfilePage />} />
              </Route>
              <Route element={<RequireModule module="approvals" what="the Approval queue" />}>
                <Route path="/controls/approvals" element={<ApprovalQueuePage />} />
              </Route>
              <Route path="/access-roles" element={<AccessRolesPage />} />
              <Route path="/audit-trail" element={<AuditTrailPage />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
      </MessageProvider>
    </AuthProvider>
  );
}
