import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import RegisterPage from './pages/RegisterPage';
import UserLoginPage from './pages/UserLoginPage';
import AdminLoginPage from './pages/AdminLoginPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminShell from './components/AdminShell';
import UserShell from './components/UserShell';
import AdminActivityLogsPage from './pages/AdminActivityLogsPage';
import CategoryManagementPage from './pages/CategoryManagementPage';
import ActivityTypeManagementPage from './pages/ActivityTypeManagementPage';
import EmissionFactorManagementPage from './pages/EmissionFactorManagementPage';
import ActivityLoggingPage from './pages/ActivityLoggingPage';
import UserDashboard from './pages/UserDashboard';
import ReportsAnalyticsPage from './pages/ReportsAnalyticsPage';
import MyProfilePage from './pages/MyProfilePage';
import AlertHistoryPage from './pages/AlertHistoryPage';
import GoalsPage from './pages/GoalsPage';
import RecommendationsPage from './pages/RecommendationsPage';
import ArticlesPage from './pages/ArticlesPage';
import AdminEmissionLimitsPage from './pages/AdminEmissionLimitsPage';
import AdminArticlesPage from './pages/AdminArticlesPage';
import ProtectedRoute from './components/ProtectedRoute';
import ChatbotWidget from './components/ChatbotWidget';
import OAuth2CallbackPage from './pages/OAuth2CallbackPage';
import { useAuth } from './context/AuthContext';

function PublicOnly({ children }) {
  const { user, isAdmin } = useAuth();
  return user ? <Navigate to={isAdmin() ? '/admin/dashboard' : '/user/dashboard'} replace /> : children;
}

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<PublicOnly><LandingPage /></PublicOnly>} />
        <Route path="/register" element={<PublicOnly><RegisterPage /></PublicOnly>} />
        <Route path="/login" element={<PublicOnly><UserLoginPage /></PublicOnly>} />
        <Route path="/admin/login" element={<PublicOnly><AdminLoginPage /></PublicOnly>} />
        <Route path="/oauth2/callback" element={<OAuth2CallbackPage />} />
        <Route path="/reset-password" element={<ProtectedRoute><ResetPasswordPage /></ProtectedRoute>} />

        <Route path="/admin" element={<ProtectedRoute requireAdmin={true}><AdminShell /></ProtectedRoute>}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminDashboard />} />
          <Route path="categories" element={<CategoryManagementPage />} />
          <Route path="activity-types" element={<ActivityTypeManagementPage />} />
          <Route path="emission-factors" element={<EmissionFactorManagementPage />} />
          <Route path="activity-logs" element={<AdminActivityLogsPage />} />
          <Route path="emission-limits" element={<AdminEmissionLimitsPage />} />
          <Route path="articles" element={<AdminArticlesPage />} />
          <Route path="profile" element={<MyProfilePage />} />
        </Route>

        <Route path="/user" element={<ProtectedRoute><UserShell /></ProtectedRoute>}>
          <Route path="dashboard" element={<UserDashboard />} />
          <Route path="activities" element={<ActivityLoggingPage />} />
          <Route path="history" element={<ActivityLoggingPage />} />
          <Route path="reports" element={<ReportsAnalyticsPage />} />
          <Route path="profile" element={<MyProfilePage />} />
          <Route path="alerts" element={<AlertHistoryPage />} />
          <Route path="goals" element={<GoalsPage />} />
          <Route path="recommendations" element={<RecommendationsPage />} />
          <Route path="articles" element={<ArticlesPage />} />
          <Route path="articles/:id" element={<ArticlesPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ChatbotWidget />
    </>
  );
}

export default App;
