import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import DashboardAdmin from './pages/DashboardAdmin'
import DashboardPrimarie from './pages/DashboardPrimarie'
import DashboardFurnizor from './pages/DashboardFurnizor'
import AuthCallback from './pages/AuthCallback'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/admin" element={
              <ProtectedRoute rolPermis="administrator">
                <DashboardAdmin />
              </ProtectedRoute>
            } />
            <Route path="/primarie" element={
              <ProtectedRoute rolPermis="primarie">
                <DashboardPrimarie />
              </ProtectedRoute>
            } />
            <Route path="/furnizor" element={
              <ProtectedRoute rolPermis="furnizor">
                <DashboardFurnizor />
              </ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App