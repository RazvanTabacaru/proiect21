import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

export default function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        const { data: profil } = await supabase
          .from('profiles')
          .select('rol')
          .eq('id', session.user.id)
          .single()

        if (profil?.rol === 'administrator') navigate('/admin')
        else if (profil?.rol === 'primarie') navigate('/primarie')
        else navigate('/furnizor')
      } else {
        navigate('/login')
      }
    })
  }, [navigate])

  return (
    <div style={{ padding: 32, textAlign: 'center' }}>
      <p>Se verifică contul, te rugăm așteaptă...</p>
    </div>
  )
}