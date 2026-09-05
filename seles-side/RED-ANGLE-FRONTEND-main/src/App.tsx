// import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
// import "./App.css";
// import { NotificationsProvider } from './components/notifi/NotificationsContext';
// /* ================= AUTH ================= */
// import Login from "./pages/Login/Login";

// /* ================= ADMIN PAGES ================= */
// import AdminDashboard from "./pages/admin/AdminDashboard";
// import ViewLeads from "./pages/admin/ViewLeads";
// import ViewLead from "./pages/admin/ViewLead";
// import AssignLeads from "./pages/admin/AssignLeads";
// import TrackingDetails from "./pages/admin/TrackingDetails";
// import EmployeeProfile from "./pages/admin/EmployeeProfile";
// import EmployeeTrack from "./pages/admin/EmployeeTrack";
// import LeadTrack from "./pages/admin/LeadTrack";
// import Approval from "./pages/admin/Approval";
// import Employees from "./pages/admin/Employees";
// import EmployeeActivity from "./pages/admin/EmployeeActivity";
// // import Quotation from "./pages/admin/Quotation";
// import Report from "./pages/admin/Report";
// import EmployeeAttendanceReport from "./pages/admin/EmployeeAttendanceReport";
// import ClientReport from "./pages/admin/ClientReport";
// import InvoiceReport from "./pages/admin/InvoiceReport";
// import Invoice from "./pages/admin/Invoice";
// import Notifications from "./pages/admin/Notifications";
// import PublicInvoiceView from "./pages/public/PublicInvoiceView";

// /* ================= PARTNER PAGES ================= */
// import Dashboard from "./pages/partner_page/dashboard";
// import Leads from "./pages/partner_page/Leads";
// import  NotificationsPage from "./components/notifi/NotificationsPage";
// import Earnings from "./pages/partner_page/Earnings";
// import Profile from "./pages/partner_page/Profile";
// import ProtectedRoute from "./route/ProtectedRoute";
// import QuotationApprovePage from "./pages/partner_page/quotationapprovepage.tsx/quotationapprovepage";
// import Lead from "./pages/partner_page/LeadStatus";
// /* ================= EMPLOYEE PAGES ================= */
// import EmployeeProfileEmp from "./pages/employee/EmployeeProfile";
// import EmployeeAttendance from "./pages/employee/EmployeeAttendance";
// import TaskBoard from "./pages/employee/TaskBoard";
// import EmployeeDetails from "./pages/employee/EmployeeDetails";
// import LeaveApproval from "./pages/employee/LeaveApproval";
// import LeadDetails from "./pages/employee/LeadDetails";
// import EmployeeLeadOverview from "./pages/employee/EmployeeLeadOverview";
// import EmployeeQuotation from "./pages/employee/EmployeeQuotation";
// import EmployeeConfirmationPage from "./pages/employee/EmployeeConfirmationPage";
// import EmployeeOverview from "./pages/partner_page/EmployeeOverview";
// import PartnerQuotation from "./pages/partner_page/quotation";
// import PartnerConfirmationPage from "./pages/partner_page/Confirmation";

// function App() {
//   return (
//     <NotificationsProvider>
//     <Router>
//       <Routes>
//         {/* ================= LOGIN ================= */}
//         <Route path="/" element={<Login />} />

//         {/* ================= ADMIN ROUTES ================= */}
//         <Route path="/admin/dashboard" element={<AdminDashboard />} />
//         <Route path="/admin/view-leads" element={<ViewLeads />} />
//         <Route path="/admin/view-lead/:id" element={<ViewLead />} />
//         <Route path="/admin/assign-leads" element={<AssignLeads />} />
//         <Route path="/admin/tracking" element={<TrackingDetails />} />
//         <Route path="/admin/approval" element={<Approval />} />
//         <Route path="/admin/employees" element={<Employees />} />
//         <Route path="/admin/employees/activity" element={<EmployeeActivity />} />
//         <Route path="/admin/employees/profile" element={<EmployeeProfile />} />

//         <Route path="/admin/invoice" element={<Invoice />} />
//         <Route path="/admin/notifications" element={<Notifications />} />

//         {/* Admin Reports */}
//         <Route path="/admin/report" element={<Report />} />
//         <Route
//           path="/admin/report/employee-attendance"
//           element={<EmployeeAttendanceReport />}
//         />
//         <Route path="/admin/report/client" element={<ClientReport />} />
//         <Route path="/admin/report/invoice" element={<InvoiceReport />} />

//         {/* Admin Tracking */}
//         <Route path="/admin/tracking/track-leads" element={<LeadTrack />} />
//         <Route
//           path="/admin/tracking/employee-profile/track-employee"
//           element={<EmployeeTrack />}
//         />
//         <Route path="/admin/employee-track" element={<EmployeeTrack />} />
//         <Route path="/admin/lead-track" element={<LeadTrack />} />
//         <Route path="/invoice/:token" element={<PublicInvoiceView />} />

//         {/* ================= PARTNER ROUTES ================= */}
//         <Route path="/partner/dashboard" element={<Dashboard />} />
//          <Route path="/partner/profile" element={<Profile />} />
//         <Route path="/partner/leads" element={<Leads />} />

//         <Route path="/partner/earnings" element={<Earnings />} />
//         <Route path="/partner/notifications" element={<Notifications />} />
//         <Route path="/partner/lead/:leadId/overview" element={<EmployeeOverview />} />
//         <Route path="/partner/leads/:leadId"element={<Lead />}/>
//       <Route
//   path="/partner/leads/:leadId/quotation"
//   element={<PartnerQuotation />}
// />
//  <Route path="/partner/leads/:leadId/confirmation" element={<PartnerConfirmationPage />} />
// <Route
//   path="/notifications"
//   element={
//     <ProtectedRoute>
//       <NotificationsPage />
//     </ProtectedRoute>
//   }
// />
// <Route path="/quotateapprove" element={<QuotationApprovePage />} />

//         {/* ================= EMPLOYEE ROUTES ================= */}
//         <Route
//           path="/employee/employee-profile"
//           element={<EmployeeProfileEmp />}
//         />
//         <Route path="/employee/attendance" element={<EmployeeAttendance />} />
//         <Route path="/employee/tasks" element={<TaskBoard />} />
//         <Route
//           path="/employee/employee-details"
//           element={<EmployeeDetails />}
//         />
//         <Route
//           path="/employee/leave-approval"
//           element={<LeaveApproval />}
//         />

//         <Route
//           path="/employee/leads/:leadId"
//           element={<EmployeeLeadOverview />}
//         />
//         <Route
//           path="/employee/leads/:leadId/view"
//           element={<LeadDetails />}
//         />
//         <Route
//           path="/employee/leads/:leadId/quotation"
//           element={<EmployeeQuotation />}
//         />
//         <Route
//           path="/employee/leads/:leadId/confirmation"
//           element={<EmployeeConfirmationPage />}
//         />

//         {/* ================= FALLBACK ================= */}
//         <Route path="*" element={<Navigate to="/" replace />} />
//       </Routes>
//     </Router>
//     </NotificationsProvider>
//   );
// }

// export default App;

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import { NotificationsProvider } from "./notifications/NotificationsContext";
import ResetPassword from "./pages/auth/ResetPassword";
import { Toaster } from "react-hot-toast";
import GlobalReminder from "./components/GlobalReminder";

/* ================= AUTH ================= */
import Login from "./pages/Login/Login";


/* ================= ADMIN ================= */
import AdminDashboard from "./pages/admin/AdminDashboard";
import ViewLeads from "./pages/admin/ViewLeads";
import ViewLead from "./pages/admin/ViewLead";
import AssignLeads from "./pages/admin/AssignLeads";
import TrackingDetails from "./pages/admin/TrackingDetails";
import EmployeeProfile from "./pages/admin/EmployeeProfile";
import EmployeeTrack from "./pages/admin/EmployeeTrack";
import LeadTrack from "./pages/admin/LeadTrack";
import Approval from "./pages/admin/Approval";
import Employees from "./pages/admin/Employees";
import EmployeeActivity from "./pages/admin/EmployeeActivity";
import Quotation from "./pages/admin/Quotation";
import Report from "./pages/admin/Report";
import EmployeeAttendanceReport from "./pages/admin/EmployeeAttendanceReport";
import ClientReport from "./pages/admin/ClientReport";
import InvoiceReport from "./pages/admin/InvoiceReport";
import Invoice from "./pages/admin/Invoice";
import Notifications from "./pages/admin/Notifications";
import PublicInvoiceView from "./pages/public/PublicInvoiceView";
import AdminAttendance from "./pages/admin/adminAttendence";

/* ================= PARTNER ================= */
import Dashboard from "./pages/partner_page/dashboard";
import Leads from "./pages/partner_page/Leads";
import Earnings from "./pages/partner_page/Earnings";
import Profile from "./pages/partner_page/Profile";
import EmployeeOverview from "./pages/partner_page/EmployeeOverview";
import PartnerConfirmationPage from "./pages/partner_page/Confirmation";
import Lead from "./pages/partner_page/LeadStatus";
import QuotationApprovePage from "./pages/partner_page/quotationapprovepage.tsx/quotationapprovepage";
import NotificationsPage from "./components/notifi/NotificationsPage";

/* ================= EMPLOYEE ================= */
import EmployeeProfileEmp from "./pages/employee/EmployeeProfile";
import EmployeeAttendance from "./pages/employee/EmployeeAttendance";
import TaskBoard from "./pages/employee/TaskBoard";
import EmployeeDetails from "./pages/employee/EmployeeDetails";
import LeaveApproval from "./pages/employee/LeaveApproval";
import LeadDetails from "./pages/employee/LeadDetails";
import EmployeeLeadOverview from "./pages/employee/EmployeeLeadOverview";
import EmployeeConfirmationPage from "./pages/employee/EmployeeConfirmationPage";
import PublicQuotationView from "./pages/quotation/PublicQuotationView";
import ProtectedRoute from "./route/ProtectedRoute";
// InvoicePublic import removed — route is commented out

const RedirectToClient = () => {
  window.location.replace(`http://localhost:5174/set-password${window.location.search}`);
  return null;
};

function App() {
  return (
    <NotificationsProvider>
      <GlobalReminder />
      <Toaster position="top-right" reverseOrder={false} />
      <Router>
        <Routes>



          <Route path="/set-password" element={<RedirectToClient />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/quotation/view" element={<PublicQuotationView />} />
          <Route path="/invoice/:token" element={<PublicInvoiceView />} />
          {/* ================= LOGIN ================= */}
          <Route path="/" element={<Login />} />

          {/* ================= ADMIN ================= */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Routes>
                  <Route path="" element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="view-leads" element={<ViewLeads />} />
                  <Route path="view-lead/:id" element={<ViewLead />} />
                  <Route path="assign-leads" element={<AssignLeads />} />
                  <Route path="tracking" element={<TrackingDetails />} />
                  <Route path="approval" element={<Approval />} />
                  <Route path="employees" element={<Employees />} />
                  <Route path="employees/activity" element={<EmployeeActivity />} />
                  <Route path="employees/profile" element={<EmployeeProfile />} />
                  <Route path="quotation" element={<Quotation />} />
                  <Route path="invoice" element={<Invoice />} />
                  <Route path="notifications" element={<Notifications />} />
                  <Route path="report" element={<Report />} />
                  <Route path="report/employee-attendance" element={<EmployeeAttendanceReport />} />
                  <Route path="report/client" element={<ClientReport />} />
                  <Route path="report/invoice" element={<InvoiceReport />} />
                  <Route path="tracking/track-leads" element={<LeadTrack />} />
                  <Route path="tracking/employee-profile/track-employee" element={<EmployeeTrack />} />
                  <Route path="attendance" element={<AdminAttendance />} />
                  <Route path="*" element={<Navigate to="dashboard" replace />} />
                </Routes>
              </ProtectedRoute>
            }
          />

          {/* ================= PARTNER ================= */}
          <Route
            path="/partner/*"
            element={
              <ProtectedRoute allowedRoles={["partner"]}>
                <Routes>
                  <Route path="" element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="leads" element={<Leads />} />
                  <Route path="earnings" element={<Earnings />} />
                  <Route path="notifications" element={<Notifications />} />
                  <Route path="lead/:leadId/overview" element={<EmployeeOverview />} />
                  <Route path="leads/:leadId" element={<Lead />} />
                  <Route path="leads/:leadId/quotation" element={<Quotation />} />
                  <Route path="leads/:leadId/confirmation" element={<PartnerConfirmationPage />} />
                  <Route path="*" element={<Navigate to="dashboard" replace />} />
                </Routes>
              </ProtectedRoute>
            }
          />

          {/* ================= EMPLOYEE ================= */}
          <Route
            path="/employee/*"
            element={
              <ProtectedRoute allowedRoles={["employee"]}>
                <Routes>
                  <Route path="" element={<EmployeeProfileEmp />} />
                  <Route path="dashboard" element={<EmployeeProfileEmp />} />
                  <Route path="employee-profile" element={<EmployeeProfileEmp />} />
                  <Route path="attendance" element={<EmployeeAttendance />} />
                  <Route path="tasks" element={<TaskBoard />} />
                  <Route path="employee-details" element={<EmployeeDetails />} />
                  <Route path="leave-approval" element={<LeaveApproval />} />
                  <Route path="leads/:leadId/overview" element={<EmployeeLeadOverview />} />
                  <Route path="leads/:leadId/view" element={<LeadDetails />} />
                  <Route path="leads/:leadId/quotation" element={<Quotation />} />
                  <Route path="leads/:leadId/confirmation" element={<EmployeeConfirmationPage />} />
                  <Route path="notifications" element={<Notifications />} />
                  <Route path="*" element={<Navigate to="dashboard" replace />} />
                </Routes>
              </ProtectedRoute>
            }
          />

          {/* ================= MISC ================= */}
          <Route path="/quotateapprove" element={<QuotationApprovePage />} />
          <Route path="/notifications" element={<NotificationsPage />} />

          {/* ================= FALLBACK ================= */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </NotificationsProvider>
  );
}

export default App;