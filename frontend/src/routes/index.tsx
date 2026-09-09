import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Public Pages
import LandingPage from '../pages/LandingPage';
import Login from '../pages/Login';
import ModuleHub from '../pages/ModuleHub';
import GreatMasterEntry from '../pages/GreatMasterEntry';
import GreatMasterLogin from '../pages/GreatMasterLogin';
import GreatMasterGuard from '../components/shared/GreatMasterGuard';
import GreatMasterLayout from '../modules/master/GreatMasterLayout';
import PaymentPage from '../pages/PaymentPage';

// Signup Wizard
import SignupLayout from '../pages/signup/SignupLayout';
import AccountStep from '../pages/signup/AccountStep';
import StudioDetailsStep from '../pages/signup/StudioDetailsStep';
import CompleteStep from '../pages/signup/CompleteStep';

// Master Module
import MasterLayout from '../modules/master/MasterLayout';
import MasterDashboard from '../modules/master/pages/MasterDashboard';
import MasterStudios from '../modules/master/pages/MasterStudios';
import MasterStudioDetail from '../modules/master/pages/MasterStudioDetail';
import MasterAdmins from '../modules/master/pages/MasterAdmins';
import MasterClients from '../modules/master/pages/MasterClients';
import MasterMonitoring from '../modules/master/pages/MasterMonitoring';
import MasterActivity from '../modules/master/pages/MasterActivity';
import MasterApprovals from '../modules/master/pages/MasterApprovals';
import MasterProducts from '../modules/master/pages/MasterProducts';

// Sales Module
import SalesLayout from '../modules/sales/SalesLayout';
import SalesDashboard from '../modules/sales/pages/SalesDashboard';
import SalesViewLeads from '../modules/sales/pages/SalesViewLeads';
import SalesAssignLeads from '../modules/sales/pages/SalesAssignLeads';
import SalesTracking from '../modules/sales/pages/SalesTracking';
import SalesInvoice from '../modules/sales/pages/SalesInvoice';
import SalesAttendance from '../modules/sales/pages/SalesAttendance';
import SalesApproval from '../modules/sales/pages/SalesApproval';
import SalesEmployees from '../modules/sales/pages/SalesEmployees';
import SalesQuotation from '../modules/sales/pages/SalesQuotation';
import SalesReports from '../modules/sales/pages/SalesReports';

// Clients / Studio Module
import ClientLayout from '../modules/client/ClientLayout';
import StudioDashboard from '../modules/client/pages/StudioDashboard';
import StudioClients from '../modules/client/pages/StudioClients';
import ClientOnboarding from '../modules/client/pages/ClientOnboarding';
import ClientWorkspace from '../modules/client/pages/ClientWorkspace';
import StudioWorkflow from '../modules/client/pages/StudioWorkflow';
import StudioActivity from '../modules/client/pages/StudioActivity';

// Pre-Production Module
import CRMLayout from '../modules/pre-production/pages/crm/CRMLayout';
import PreProdDashboard from '../modules/pre-production/pages/crm/pages/Dashboard';
import PreProdClient from '../modules/pre-production/pages/crm/pages/Client';
import PreProdRawData from '../modules/pre-production/pages/crm/pages/RawData';
import PreProdQCCheck from '../modules/pre-production/pages/crm/pages/QCCheck';
import PreProdFinalApproval from '../modules/pre-production/pages/crm/pages/FinalApproval';
import PreProdClientDelivery from '../modules/pre-production/pages/crm/pages/ClientDelivery';
import PreProdWorkTracking from '../modules/pre-production/pages/crm/pages/WorkTracking';
import PreProdAttendance from '../modules/pre-production/pages/crm/pages/Attendance';
import PreProdNotifications from '../modules/pre-production/pages/crm/pages/Notifications';

// Production Module
import ProductionLayout from '../modules/production/ProductionLayout';
import ProductionDashboard from '../modules/production/ProductionDashboard';
import ProductionSchedules from '../modules/production/ProductionSchedules';
import ProductionLiveEvent from '../modules/production/ProductionLiveEvent';
import ProductionCardCheckIn from '../modules/production/ProductionCardCheckIn';

// Post-Production Module
import PostProductionLayout from '../modules/post-production/PostProductionLayout';
import PostProductionTasks from '../modules/post-production/PostProductionTasks';
import PostProductionQC from '../modules/post-production/PostProductionQC';
import PostProductionDataManager from '../modules/post-production/PostProductionDataManager';

// Finance Module
import FinanceLayout from '../modules/finance/FinanceLayout';
import FinanceInvoices from '../modules/finance/FinanceInvoices';
import FinancePayments from '../modules/finance/FinancePayments';
import FinanceApprovals from '../modules/finance/FinanceApprovals';

export function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/great-master/login" element={<GreatMasterLogin />} />
      <Route path="/dashboard" element={<ModuleHub />} />
      <Route path="/modules" element={<ModuleHub />} />
      <Route path="/pay" element={<PaymentPage />} />
      <Route path="/pay/:studioId" element={<PaymentPage />} />

      {/* New Studio Sign-Up Wizard */}
      <Route path="/signup" element={<SignupLayout />}>
        <Route index element={<AccountStep />} />
        <Route path="studio" element={<StudioDetailsStep />} />
        <Route path="complete" element={<CompleteStep />} />
      </Route>

      {/* Great Master Dedicated Governance Portal */}
      <Route
        path="/great-master"
        element={
          <GreatMasterGuard>
            <GreatMasterLayout />
          </GreatMasterGuard>
        }
      >
        <Route index element={<Navigate to="/great-master/dashboard" replace />} />
        <Route path="dashboard" element={<MasterDashboard />} />
        <Route path="masters" element={<MasterStudios />} />
        <Route path="masters/:studioId" element={<MasterStudioDetail />} />
        <Route path="studios" element={<MasterStudios />} />
        <Route path="studios/:studioId" element={<MasterStudioDetail />} />
        <Route path="users" element={<MasterAdmins />} />
        <Route path="admins" element={<MasterAdmins />} />
        <Route path="approvals" element={<MasterApprovals />} />
        <Route path="activity" element={<MasterActivity />} />
        <Route path="settings" element={<MasterMonitoring />} />
        <Route path="monitoring" element={<MasterMonitoring />} />
        <Route path="*" element={<Navigate to="/great-master/dashboard" replace />} />
      </Route>

      {/* Master Studio Workspace — Integrated Studio Operations */}
      <Route path="/master" element={<MasterLayout />}>
        <Route index element={<Navigate to="/master/dashboard" replace />} />
        <Route path="dashboard" element={<StudioDashboard />} />
        <Route path="clients" element={<StudioClients />} />
        <Route path="clients/onboard" element={<ClientOnboarding />} />
        <Route path="clients/:clientId" element={<ClientWorkspace />} />
        <Route path="products" element={<MasterProducts />} />
        <Route path="sales" element={<SalesDashboard />} />
        <Route path="sales/dashboard" element={<SalesDashboard />} />
        <Route path="sales/leads" element={<SalesViewLeads />} />
        <Route path="sales/assign-leads" element={<SalesAssignLeads />} />
        <Route path="sales/tracking" element={<SalesTracking />} />
        <Route path="sales/quotation" element={<SalesQuotation />} />
        <Route path="sales/invoice" element={<SalesInvoice />} />
        <Route path="sales/attendance" element={<SalesAttendance />} />
        <Route path="sales/approval" element={<SalesApproval />} />
        <Route path="sales/employees" element={<SalesEmployees />} />
        <Route path="sales/report" element={<SalesReports />} />
        <Route path="pre-production" element={<PreProdDashboard />} />
        <Route path="pre-production/dashboard" element={<PreProdDashboard />} />
        <Route path="pre-production/client" element={<PreProdClient />} />
        <Route path="pre-production/raw-data" element={<PreProdRawData />} />
        <Route path="pre-production/qc-check" element={<PreProdQCCheck />} />
        <Route path="pre-production/final-approval" element={<PreProdFinalApproval />} />
        <Route path="pre-production/delivery" element={<PreProdClientDelivery />} />
        <Route path="pre-production/work-tracking" element={<PreProdWorkTracking />} />
        <Route path="pre-production/attendance" element={<PreProdAttendance />} />
        <Route path="pre-production/notifications" element={<PreProdNotifications />} />
        <Route path="workflow" element={<StudioWorkflow />} />
        <Route path="production" element={<ProductionDashboard />} />
        <Route path="post-production" element={<PostProductionTasks />} />
        <Route path="projects" element={<StudioClients />} />
        <Route path="payments" element={<FinanceInvoices />} />
        <Route path="finance" element={<FinanceInvoices />} />
        <Route path="reports" element={<SalesReports />} />
        <Route path="settings" element={<MasterMonitoring />} />
        <Route path="*" element={<Navigate to="/master/dashboard" replace />} />
      </Route>

      {/* Master-Admin: Operational role inside Master/Studio — Redirect cleanly to Master Studio Workspace */}
      <Route path="/master-admin" element={<Navigate to="/master/dashboard" replace />} />
      <Route path="/master-admin/*" element={<Navigate to="/master/dashboard" replace />} />

      {/* Sales Module Routes */}
      <Route path="/sales" element={<SalesLayout />}>
        <Route index element={<Navigate to="/sales/dashboard" replace />} />
        <Route path="dashboard" element={<SalesDashboard />} />
        <Route path="view-leads" element={<SalesViewLeads />} />
        <Route path="leads" element={<SalesViewLeads />} />
        <Route path="assign-leads" element={<SalesAssignLeads />} />
        <Route path="tracking" element={<SalesTracking />} />
        <Route path="invoice" element={<SalesInvoice />} />
        <Route path="invoices" element={<SalesInvoice />} />
        <Route path="attendance" element={<SalesAttendance />} />
        <Route path="approval" element={<SalesApproval />} />
        <Route path="employees" element={<SalesEmployees />} />
        <Route path="quotation" element={<SalesQuotation />} />
        <Route path="quotations" element={<SalesQuotation />} />
        <Route path="report" element={<SalesReports />} />
        <Route path="reports" element={<SalesReports />} />
        <Route path="*" element={<Navigate to="/sales/dashboard" replace />} />
      </Route>

      {/* Client Admin Module Routes */}
      <Route path="/client" element={<ClientLayout />}>
        <Route index element={<Navigate to="/client/dashboard" replace />} />
        <Route path="dashboard" element={<StudioDashboard />} />
        <Route path="clients" element={<StudioClients />} />
        <Route path="clients/onboard" element={<ClientOnboarding />} />
        <Route path="clients/:clientId" element={<ClientWorkspace />} />
        <Route path="clients/:clientId/pre-wedding" element={<ClientWorkspace />} />
        <Route path="clients/:clientId/post-wedding" element={<ClientWorkspace />} />
        <Route path="projects" element={<StudioClients />} />
        <Route path="workflow" element={<StudioWorkflow />} />
        <Route path="workflow/:type" element={<StudioWorkflow />} />
        <Route path="activity" element={<StudioActivity />} />
        <Route path="*" element={<Navigate to="/client/dashboard" replace />} />
      </Route>

      {/* Pre-Production Module Routes */}
      <Route path="/pre-production" element={<CRMLayout />}>
        <Route index element={<Navigate to="/pre-production/dashboard" replace />} />
        <Route path="dashboard" element={<PreProdDashboard />} />
        <Route path="client" element={<PreProdClient />} />
        <Route path="clients" element={<PreProdClient />} />
        <Route path="projects" element={<PreProdClient />} />
        <Route path="raw-data" element={<PreProdRawData />} />
        <Route path="workflow" element={<PreProdRawData />} />
        <Route path="qc-check" element={<PreProdQCCheck />} />
        <Route path="approvals" element={<PreProdQCCheck />} />
        <Route path="final-approval" element={<PreProdFinalApproval />} />
        <Route path="client-delivery" element={<PreProdClientDelivery />} />
        <Route path="delivery" element={<PreProdClientDelivery />} />
        <Route path="work-tracking" element={<PreProdWorkTracking />} />
        <Route path="attendance" element={<PreProdAttendance />} />
        <Route path="notifications" element={<PreProdNotifications />} />
        <Route path="*" element={<Navigate to="/pre-production/dashboard" replace />} />
      </Route>

      {/* Production Module Routes */}
      <Route path="/production" element={<ProductionLayout />}>
        <Route index element={<Navigate to="/production/dashboard" replace />} />
        <Route path="dashboard" element={<ProductionDashboard />} />
        <Route path="schedules" element={<ProductionSchedules />} />
        <Route path="live-event" element={<ProductionLiveEvent />} />
        <Route path="cards" element={<ProductionCardCheckIn />} />
        <Route path="*" element={<Navigate to="/production/dashboard" replace />} />
      </Route>

      {/* Post-Production Module Routes */}
      <Route path="/post-production" element={<PostProductionLayout />}>
        <Route index element={<Navigate to="/post-production/tasks" replace />} />
        <Route path="tasks" element={<PostProductionTasks />} />
        <Route path="qc-check" element={<PostProductionQC />} />
        <Route path="data-manager" element={<PostProductionDataManager />} />
        <Route path="*" element={<Navigate to="/post-production/tasks" replace />} />
      </Route>

      {/* Finance Module Routes */}
      <Route path="/finance" element={<FinanceLayout />}>
        <Route index element={<Navigate to="/finance/invoices" replace />} />
        <Route path="invoices" element={<FinanceInvoices />} />
        <Route path="payments" element={<FinancePayments />} />
        <Route path="approvals" element={<FinanceApprovals />} />
        <Route path="*" element={<Navigate to="/finance/invoices" replace />} />
      </Route>

      {/* Legacy Aliases and Redirects */}
      <Route path="/studio/*" element={<Navigate to="/client/dashboard" replace />} />
      <Route path="/crm/*" element={<Navigate to="/pre-production/dashboard" replace />} />
      <Route path="/pre-production-crm/*" element={<Navigate to="/pre-production/dashboard" replace />} />
      <Route path="/event-crm/*" element={<Navigate to="/production/dashboard" replace />} />
      <Route path="/greatmaster" element={<Navigate to="/great-master/dashboard" replace />} />
      <Route path="/greatmaster/*" element={<Navigate to="/great-master/dashboard" replace />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;
