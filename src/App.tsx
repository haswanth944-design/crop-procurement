import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { BottomNav } from './components/layout/BottomNav';
import { Footer } from './components/layout/Footer';
import { Toast } from './components/common/Toast';
import { Sprout } from 'lucide-react';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/Auth/LoginPage';
import { FarmerRegisterPage } from './pages/Auth/FarmerRegisterPage';
import { FarmerForgotPasswordPage } from './pages/Auth/FarmerForgotPasswordPage';

// Farmer Pages
import { DashboardPage } from './pages/farmer/DashboardPage';
import { BookSlotPage } from './pages/farmer/BookSlotPage';
import { QueuePage } from './pages/farmer/QueuePage';
import { ProcurementPage } from './pages/farmer/ProcurementPage';
import { PaymentsPage } from './pages/farmer/PaymentsPage';
import { BookingsHistoryPage } from './pages/farmer/BookingsHistoryPage';
import { ProfilePage } from './pages/farmer/ProfilePage';
import { NotificationsPage } from './pages/farmer/NotificationsPage';
import { HelpSupportPage } from './pages/farmer/HelpSupportPage';

// Centre Staff Pages
import { CentreDashboardPage } from './pages/centre/CentreDashboardPage';
import { StaffQueuePage } from './pages/centre/StaffQueuePage';
import { StaffBookingsPage } from './pages/centre/StaffBookingsPage';
import { StaffProcurementPage } from './pages/centre/StaffProcurementPage';
import { StaffReportsPage } from './pages/centre/StaffReportsPage';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminFarmersPage } from './pages/admin/AdminFarmersPage';
import { AdminCentresPage } from './pages/admin/AdminCentresPage';
import { AdminMonitoringPage } from './pages/admin/AdminMonitoringPage';
import { AdminAnalyticsPage } from './pages/admin/AdminAnalyticsPage';
import { AdminReportsPage } from './pages/admin/AdminReportsPage';

// Common
import { SmartAutomationPage } from './pages/SmartAutomationPage';

const farmerProtectedRoutes = [
  '/dashboard',
  '/book-slot',
  '/queue',
  '/procurement',
  '/payments',
  '/bookings',
  '/profile',
  '/notifications'
];

const staffProtectedRoutes = [
  '/centre/dashboard',
  '/centre/queue',
  '/centre/bookings',
  '/centre/procurement',
  '/centre/reports'
];

const adminProtectedRoutes = [
  '/admin/dashboard',
  '/admin/farmers',
  '/admin/centres',
  '/admin/monitoring',
  '/admin/analytics',
  '/admin/reports'
];

const authRoutes = ['/login', '/staff/login', '/admin/login', '/register', '/forgot-password', '/staff/forgot-password', '/admin/forgot-password'];

const AppContent: React.FC = () => {
  const { currentPath, navigate, toastMessage, hideToast } = useApp();
  const { currentUser, userRole, loading } = useAuth();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPath]);

  // Role-Based Route Protection & Redirection
  useEffect(() => {
    if (loading) return;

    // 1. If trying to access Farmer protected route
    if (farmerProtectedRoutes.includes(currentPath)) {
      if (!currentUser) {
        navigate('/login');
        return;
      }
      if (userRole !== 'farmer') {
        if (userRole === 'staff') navigate('/centre/dashboard');
        else if (userRole === 'admin') navigate('/admin/dashboard');
        return;
      }
    }

    // 2. If trying to access Staff protected route
    if (staffProtectedRoutes.includes(currentPath)) {
      if (!currentUser) {
        navigate('/login?role=staff');
        return;
      }
      if (userRole !== 'staff') {
        if (userRole === 'farmer') navigate('/dashboard');
        else if (userRole === 'admin') navigate('/admin/dashboard');
        return;
      }
    }

    // 3. If trying to access Admin protected route
    if (adminProtectedRoutes.includes(currentPath)) {
      if (!currentUser) {
        navigate('/login?role=admin');
        return;
      }
      if (userRole !== 'admin') {
        if (userRole === 'farmer') navigate('/dashboard');
        else if (userRole === 'staff') navigate('/centre/dashboard');
        return;
      }
    }

    // 4. If an already logged-in user visits an auth route, redirect to their home
    if (currentUser && authRoutes.includes(currentPath)) {
      if (userRole === 'farmer') {
        navigate('/dashboard');
      } else if (userRole === 'staff') {
        navigate('/centre/dashboard');
      } else if (userRole === 'admin') {
        navigate('/admin/dashboard');
      }
    }
  }, [currentPath, currentUser, userRole, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-800">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-800 text-white shadow-lg mb-3">
          <Sprout className="w-6 h-6 text-emerald-300 animate-pulse" />
        </div>
        <h2 className="text-base font-black font-heading tracking-tight">ProcureEase</h2>
        <p className="text-xs text-slate-500 mt-1">Initializing secure portal session...</p>
      </div>
    );
  }

  const renderPage = () => {
    // Synchronously enforce route protection so protected pages never mount when unauthenticated
    if (adminProtectedRoutes.includes(currentPath)) {
      if (!currentUser || userRole !== 'admin') {
        return <LoginPage initialRole="admin" />;
      }
    }
    if (staffProtectedRoutes.includes(currentPath)) {
      if (!currentUser || userRole !== 'staff') {
        return <LoginPage initialRole="staff" />;
      }
    }
    if (farmerProtectedRoutes.includes(currentPath)) {
      if (!currentUser || userRole !== 'farmer') {
        return <LoginPage />;
      }
    }

    switch (currentPath) {
      // Public / General
      case '/':
        return <LandingPage />;
      case '/help':
        return <HelpSupportPage />;
      case '/smart-automation':
        return <SmartAutomationPage />;

      // Unified Auth Route
      case '/login':
        return <LoginPage />;
      case '/staff/login':
        return <LoginPage initialRole="staff" />;
      case '/admin/login':
        return <LoginPage initialRole="admin" />;
      case '/register':
        return <FarmerRegisterPage />;
      case '/forgot-password':
      case '/staff/forgot-password':
      case '/admin/forgot-password':
        return <FarmerForgotPasswordPage />;

      // Farmer Protected
      case '/dashboard':
        return <DashboardPage />;
      case '/book-slot':
        return <BookSlotPage />;
      case '/queue':
        return <QueuePage />;
      case '/procurement':
        return <ProcurementPage />;
      case '/payments':
        return <PaymentsPage />;
      case '/bookings':
        return <BookingsHistoryPage />;
      case '/profile':
        return <ProfilePage />;
      case '/notifications':
        return <NotificationsPage />;

      // Staff Protected
      case '/centre/dashboard':
        return <CentreDashboardPage />;
      case '/centre/queue':
        return <StaffQueuePage />;
      case '/centre/bookings':
        return <StaffBookingsPage />;
      case '/centre/procurement':
        return <StaffProcurementPage />;
      case '/centre/reports':
        return <StaffReportsPage />;

      // Admin Protected
      case '/admin/dashboard':
        return <AdminDashboardPage />;
      case '/admin/farmers':
        return <AdminFarmersPage />;
      case '/admin/centres':
        return <AdminCentresPage />;
      case '/admin/monitoring':
        return <AdminMonitoringPage />;
      case '/admin/analytics':
        return <AdminAnalyticsPage />;
      case '/admin/reports':
        return <AdminReportsPage />;

      default:
        return <LandingPage />;
    }
  };

  const isLoginPage = currentPath === '/login' || currentPath === '/staff/login' || currentPath === '/admin/login';

  if (isLoginPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-900 font-sans antialiased selection:bg-emerald-100 selection:text-emerald-900">
        <main className="w-full flex items-center justify-center p-4">
          {renderPage()}
        </main>
        <Toast message={toastMessage} onClose={hideToast} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans antialiased selection:bg-emerald-100 selection:text-emerald-900">
      {/* Main Gov Navigation Header */}
      <Navbar />

      {/* Page View Body */}
      <main className="flex-1 pb-16 md:pb-0">
        {renderPage()}
      </main>

      {/* Mobile Bottom Quick Navigation for Farmers */}
      <BottomNav />

      {/* Official Government Footer */}
      <Footer />

      {/* Global Accessible Toast Alerts */}
      <Toast message={toastMessage} onClose={hideToast} />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  );
}
