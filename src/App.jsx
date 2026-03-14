import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AppProvider, AppContext } from './context/AppContext';

import Login          from './components/auth/Login.jsx';
import SignUp         from './components/auth/SignUp.jsx';
import Dashboard      from './components/dashboard/Dashboard.jsx';
import Settings       from './components/settings/Settings.jsx';
import ProgramList    from './components/programs/ProgramList.jsx';
import SubjectList    from './components/subjects/SubjectList.jsx';
import Students       from './components/students/Students.jsx';
import SchoolCalendar from './components/school calendar/SchoolCalendar.jsx';
import Sidebar        from './components/common/Sidebar.jsx';
import ErrorBoundary  from './components/common/ErrorBoundary.jsx';

import './App.css';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { currentUser, loading, isAdmin } = useContext(AppContext);
  if (loading) return <div style={{ color:'#fff', padding:'40px' }}>Loading...</div>;
  if (!currentUser) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin()) return <Navigate to="/dashboard" replace />;
  return children;
};

const DashboardLayout = () => (
  <div className="dashboard-wrapper" style={{ display:'flex', minHeight:'100vh' }}>
    <Sidebar />
    <main className="main-content" style={{ flex:1, padding:'40px',
                                             background:'var(--bg-dark)', overflowY:'auto' }}>
      <ErrorBoundary>
        <Routes>
          <Route path="/"        element={<Dashboard />} />
          <Route path="programs" element={<ProgramList />} />
          <Route path="subjects" element={<SubjectList />} />
          <Route path="calendar" element={<SchoolCalendar />} />
          <Route path="settings" element={<Settings />} />
          <Route path="students" element={
            <ProtectedRoute adminOnly>
              <Students />
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </ErrorBoundary>
    </main>
  </div>
);

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/login"  element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/dashboard/*" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;