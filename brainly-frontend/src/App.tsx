import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './providers/ThemeProvider';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Dashboard from './pages/DashboardPage';
import SearchPage from './pages/SearchPage';
import PublicSharePage from './pages/PublicSharePage';
import { Toaster } from "react-hot-toast";
import LandingPage from './pages/landingpage';
import Bin from './pages/BinPage';


function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="content-store-theme">
      <Toaster position="top-right" />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/shared/:shareLink" element={<PublicSharePage />}/>
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/bin" 
              element={
                <ProtectedRoute>
                  <Bin />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/search" 
              element={
                <ProtectedRoute>
                  <SearchPage />
                </ProtectedRoute>
              } 
            />
            {/* Add other routes */}
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;