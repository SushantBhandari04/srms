import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Faculty from './pages/Faculty';
import Courses from './pages/Courses';
import Subjects from './pages/Subjects';
import Attendance from './pages/Attendance';
import Marks from './pages/Marks';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/students"
            element={
              <ProtectedRoute allowedRoles={['admin', 'faculty']}>
                <Layout>
                  <Students />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/faculty"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Layout>
                  <Faculty />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/courses"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Layout>
                  <Courses />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/subjects"
            element={
              <ProtectedRoute allowedRoles={['admin', 'faculty']}>
                <Layout>
                  <Subjects />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/attendance"
            element={
              <ProtectedRoute>
                <Layout>
                  <Attendance />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/marks"
            element={
              <ProtectedRoute>
                <Layout>
                  <Marks />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
