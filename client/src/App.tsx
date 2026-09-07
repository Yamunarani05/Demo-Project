import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'sonner';

// 1. Public Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import GreatMasterEntry from './pages/GreatMasterEntry';

// 1b. Sign-Up Wizard
import SignupLayout from './pages/signup/SignupLayout';
import AccountStep from './pages/signup/AccountStep';
import StudioDetailsStep from './pages/signup/StudioDetailsStep';
import CompleteStep from './pages/signup/CompleteStep';

// 2. Great Master Admin Module
import MasterLayout from './modules/master/MasterLayout';
import MasterDashboard from './modules/master/pages/MasterDashboard';
import MasterStudios from './modules/master/pages/MasterStudios';
import MasterStudioDetail from './modules/master/pages/MasterStudioDetail';
import MasterAdmins from './modules/master/pages/MasterAdmins';
import MasterClients from './modules/master/pages/MasterClients';
import MasterMonitoring from './modules/master/pages/MasterMonitoring';
import MasterActivity from './modules/master/pages/MasterActivity';

// 3. Studio Admin Module
import StudioLayout from './modules/studio/StudioLayout';
import StudioDashboard from './modules/studio/pages/StudioDashboard';
import StudioClients from './modules/studio/pages/StudioClients';
import ClientOnboarding from './modules/studio/pages/ClientOnboarding';
import ClientWorkspace from './modules/studio/pages/ClientWorkspace';
import StudioWorkflow from './modules/studio/pages/StudioWorkflow';
import StudioActivity from './modules/studio/pages/StudioActivity';

function ExternalPreproductionAdmin() {
  React.useEffect(() => {
    const token = localStorage.getItem('ra_token');
    const user = localStorage.getItem('ra_user');
    const targetUrl = new URL('http://localhost:5178/admin');
    if (token) targetUrl.searchParams.set('token', token);
    if (user) targetUrl.searchParams.set('user', user);
    window.location.href = targetUrl.toString();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-700 text-sm font-medium">
      <div className="flex flex-col items-center gap-2">
        <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin" />
        <span>Redirecting to Preproduction Admin (http://localhost:5178/admin)...</span>
      </div>
    </div>
  );
}

function ExternalPostproductionPortal() {
  React.useEffect(() => {
    const token = localStorage.getItem('ra_token');
    const user = localStorage.getItem('ra_user');
    const targetUrl = new URL('http://localhost:5178/post-production-crm');
    if (token) targetUrl.searchParams.set('token', token);
    if (user) targetUrl.searchParams.set('user', user);
    window.location.href = targetUrl.toString();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-700 text-sm font-medium">
      <div className="flex flex-col items-center gap-2">
        <div className="w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin" />
        <span>Redirecting to Postproduction Module (http://localhost:5178/post-production-crm)...</span>
      </div>
    </div>
  );
}

function ExternalSalesPortal() {
  React.useEffect(() => {
    const token = localStorage.getItem('token') || localStorage.getItem('ra_token');
    const role = localStorage.getItem('role') || 'admin';
    const userId = localStorage.getItem('userId') || '1';
    const fullName = localStorage.getItem('fullName') || 'Sales Admin';

    const targetUrl = new URL('http://localhost:5175');
    if (token) targetUrl.searchParams.set('token', token);
    if (role) targetUrl.searchParams.set('role', role);
    if (userId) targetUrl.searchParams.set('userId', userId);
    if (fullName) targetUrl.searchParams.set('fullName', fullName);

    if (role === 'admin') {
      targetUrl.searchParams.set('redirect', '/admin/dashboard');
    } else if (role === 'employee') {
      targetUrl.searchParams.set('redirect', '/employee/employee-profile');
    } else if (role === 'partner') {
      targetUrl.searchParams.set('redirect', '/partner/dashboard');
    }

    window.location.href = targetUrl.toString();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-700 text-sm font-medium">
      <div className="flex flex-col items-center gap-2">
        <div className="w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin" />
        <span>Redirecting to Sales Portal (http://localhost:5175)...</span>
      </div>
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" richColors />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />

          {/* New Studio Sign-Up Wizard */}
          <Route path="/signup" element={<SignupLayout />}>
            <Route index element={<AccountStep />} />
            <Route path="studio" element={<StudioDetailsStep />} />
            <Route path="complete" element={<CompleteStep />} />
          </Route>

          {/* Great Master Admin Routes */}
          <Route path="/master" element={<MasterLayout />}>
            <Route index element={<Navigate to="/master/dashboard" replace />} />
            <Route path="dashboard" element={<MasterDashboard />} />
            <Route path="studios" element={<MasterStudios />} />
            <Route path="studios/:studioId" element={<MasterStudioDetail />} />
            <Route path="admins" element={<MasterAdmins />} />
            <Route path="employees" element={<MasterAdmins />} />
            <Route path="clients" element={<MasterClients />} />
            <Route path="monitoring" element={<MasterMonitoring />} />
            <Route path="activity" element={<MasterActivity />} />
            <Route path="*" element={<Navigate to="/master/dashboard" replace />} />
          </Route>

          {/* Studio Admin Routes */}
          <Route path="/studio" element={<StudioLayout />}>
            <Route index element={<Navigate to="/studio/dashboard" replace />} />
            <Route path="dashboard" element={<StudioDashboard />} />
            <Route path="clients" element={<StudioClients />} />
            <Route path="clients/onboard" element={<ClientOnboarding />} />
            <Route path="clients/:clientId" element={<ClientWorkspace />} />
            <Route path="clients/:clientId/pre-wedding" element={<ClientWorkspace />} />
            <Route path="clients/:clientId/post-wedding" element={<ClientWorkspace />} />
            <Route path="workflow" element={<StudioWorkflow />} />
            <Route path="workflow/:type" element={<StudioWorkflow />} />
            <Route path="activity" element={<StudioActivity />} />
            <Route path="*" element={<Navigate to="/studio/dashboard" replace />} />
          </Route>


          {/* Compatibility Aliases & Direct Redirects */}
          <Route path="/admin" element={<ExternalPreproductionAdmin />} />
          <Route path="/admin/*" element={<ExternalPreproductionAdmin />} />
          <Route path="/pre-production" element={<ExternalPreproductionAdmin />} />
          <Route path="/pre-production/*" element={<ExternalPreproductionAdmin />} />
          <Route path="/pre-production-crm/*" element={<ExternalPreproductionAdmin />} />
          <Route path="/post-production" element={<ExternalPostproductionPortal />} />
          <Route path="/post-production/*" element={<ExternalPostproductionPortal />} />
          <Route path="/post-production-crm/*" element={<ExternalPostproductionPortal />} />
          <Route path="/operational-manager/*" element={<ExternalPostproductionPortal />} />
          <Route path="/sales" element={<ExternalSalesPortal />} />
          <Route path="/sales/*" element={<ExternalSalesPortal />} />
          <Route path="/master-admin/*" element={<Navigate to="/master/dashboard" replace />} />

          {/* Great Master direct entry point */}
          <Route path="/greatmaster" element={<GreatMasterEntry />} />
          <Route path="/greatmaster/*" element={<GreatMasterEntry />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
