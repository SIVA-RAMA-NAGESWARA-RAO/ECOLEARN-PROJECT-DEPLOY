import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import { ToastContainer, ModalContainer, LightboxContainer } from './components/UI';

// Pages
import Login from './pages/Login';
import Home from './pages/Home';
import Modules from './pages/Modules';
import ModuleDetail from './pages/ModuleDetail';
import Quizzes from './pages/Quizzes';
import QuizTake from './pages/QuizTake';
import Assignments from './pages/Assignments';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';

// Admin Pages
import AdminModules from './pages/admin/AdminModules';
import AdminQuizzes from './pages/admin/AdminQuizzes';
import AdminAssignments from './pages/admin/AdminAssignments';
import AdminUsers from './pages/admin/AdminUsers';
import AdminAnalytics from './pages/admin/AdminAnalytics';

function PrivateRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="loading-screen">🌿 Loading EcoLearn...</div>;
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" />;

  return <Layout>{children}</Layout>;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
          <Route path="/modules" element={<PrivateRoute><Modules /></PrivateRoute>} />
          <Route path="/modules/:id" element={<PrivateRoute><ModuleDetail /></PrivateRoute>} />
          <Route path="/quizzes" element={<PrivateRoute><Quizzes /></PrivateRoute>} />
          <Route path="/quizzes/:id" element={<PrivateRoute><QuizTake /></PrivateRoute>} />
          <Route path="/assignments" element={<PrivateRoute><Assignments /></PrivateRoute>} />
          <Route path="/leaderboard" element={<PrivateRoute><Leaderboard /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />

          {/* Admin Routes */}
          <Route path="/admin/modules" element={<PrivateRoute adminOnly><AdminModules /></PrivateRoute>} />
          <Route path="/admin/quizzes" element={<PrivateRoute adminOnly><AdminQuizzes /></PrivateRoute>} />
          <Route path="/admin/assignments" element={<PrivateRoute adminOnly><AdminAssignments /></PrivateRoute>} />
          <Route path="/admin/users" element={<PrivateRoute adminOnly><AdminUsers /></PrivateRoute>} />
          <Route path="/admin/analytics" element={<PrivateRoute adminOnly><AdminAnalytics /></PrivateRoute>} />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
      <ToastContainer />
      <ModalContainer />
      <LightboxContainer />
    </AuthProvider>
  );
}

export default App;
