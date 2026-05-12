import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, rolPermis }) {
  const { user, profil, loading } = useAuth()

  if (loading) return <div>Se încarcă...</div>
  if (!user) return <Navigate to="/login" />
  if (rolPermis && profil?.rol !== rolPermis) return <Navigate to="/login" />

  return children
}