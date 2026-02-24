import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Login from './pages/Login.jsx';
import SignUp from './pages/SignUp.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Settings from './components/Settings.jsx';
import ProgramList from './components/ProgramList.jsx';
import SubjectList from './components/SubjectList.jsx';
import Sidebar from './components/Sidebar.jsx';
import './App.css';

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
          <Route path="/dashboard/*" element={<DashboardLayout />} />

          {/* --- GLOBAL FALLBACK --- */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;