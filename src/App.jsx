import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Login from './components/auth/Login.jsx';
import SignUp from './components/auth/SignUp.jsx';
import Dashboard from './components/dashboard/Dashboard.jsx';
import Settings from './components/settings/Settings.jsx';
import ProgramList from './components/programs/ProgramList.jsx';
import SubjectList from './components/subjects/SubjectList.jsx';
import Sidebar from './components/common/Sidebar.jsx';
import './App.css';
import { useContext } from 'react';
import { AppContext } from './context/AppContext';

/**
 * DASHBOARD LAYOUT
 * Wraps the protected content with the Sidebar.
 * Note: Sub-route paths are relative (no leading slash).
 */
const DashboardLayout = () => (
  <div className="dashboard-wrapper" style={{ display: 'flex', minHeight: '100vh' }}>
    <Sidebar />
    <main className="main-content" style={{ 
      flex: 1, 
      padding: '40px', 
      background: 'var(--bg-dark)',
      overflowY: 'auto' 
    }}>
      <Routes>
        {/* These paths are relative to /dashboard/ */}
        <Route path="/" element={<Dashboard />} />
        <Route path="programs" element={<ProgramList />} />
        <Route path="subjects" element={<SubjectList />} />
        <Route path="settings" element={<Settings />} />
        
        {/* Fallback for dashboard sub-routes */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </main>
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useContext(AppContext);
  if (loading) return <div style={{ color:'#fff', padding:'40px' }}>Loading...</div>;
  if (!currentUser) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          {/* --- PUBLIC ROUTES --- */}
          
          {/* Login Page */}
          <Route path="/login" element={<Login />} />
          
          {/* SIGNUP PAGE FIX: Added the missing route here */}
          <Route path="/signup" element={<SignUp />} />
          
          {/* Root Redirect: Sends users to login by default */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* --- PROTECTED ROUTES --- */}
          
          {/* Any path starting with /dashboard will use the DashboardLayout */}
          <Route path="/dashboard/*" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>} />

          {/* --- GLOBAL FALLBACK --- */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;