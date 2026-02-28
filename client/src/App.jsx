import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import DashboardLayout from './components/layout/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import PDFUpload from './pages/PDFUpload';
import DocumentDetail from './pages/DocumentDetail';
import MyDocuments from './pages/MyDocuments';
import Landing from './pages/Landing';
import Settings from './pages/Settings';
import AiChat from './pages/AiChat';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { Toaster } from 'react-hot-toast';

// Marketing / Legal Pages
import Privacy from './pages/Privacy';
import Security from './pages/Security';
import Status from './pages/Status';


const App = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <Router>
      <Toaster position="top-right" toastOptions={{ duration: 3000, style: { background: '#1F2937', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' } }} />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        
        <Route 
          path="/login" 
          element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" replace />} 
        />
        <Route 
          path="/register" 
          element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" replace />} 
        />

        {/* Legal & Status Routes */}
        <Route path="/privacy"  element={<Privacy />} />
        <Route path="/security" element={<Security />} />
        <Route path="/status"   element={<Status />} />

        {/* Protected Dashboard Routes */}
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/documents" element={<PDFUpload />} />
                  <Route path="/library" element={<MyDocuments />} />
                  <Route path="/documents/:id" element={<DocumentDetail />} />
                  <Route path="/chat"     element={<AiChat />} />
                  <Route path="/settings" element={<Settings />} />
                </Routes>
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Catch all redirect to landing/dashboard */}
        <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/"} replace />} />
      </Routes>
    </Router>
  );
};

export default App;