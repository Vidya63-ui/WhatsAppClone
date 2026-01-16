import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import Login from './pages/Login'
import Register from './pages/Register'
import Chat from './pages/Chat'
import { authAPI, setCheckingAuth } from './services/api'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const hasCheckedAuth = useRef(false)

  useEffect(() => {
    // Prevent multiple auth checks (even with StrictMode)
    if (!hasCheckedAuth.current) {
      hasCheckedAuth.current = true
      checkAuth()
    }
  }, [])

  const checkAuth = async () => {
    setCheckingAuth(true)
    try {
      const response = await authAPI.getMe()
      if (response.data.success) {
        setUser(response.data.user)
      }
    } catch (error) {
      // Silently fail - user is not authenticated
      // Don't redirect here, let the component handle routing
      setUser(null)
    } finally {
      setCheckingAuth(false)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>Loading...</div>
      </div>
    )
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={user ? <Navigate to="/" /> : <Login setUser={setUser} />} 
        />
        <Route 
          path="/register" 
          element={user ? <Navigate to="/" /> : <Register setUser={setUser} />} 
        />
        <Route 
          path="/" 
          element={user ? <Chat user={user} setUser={setUser} /> : <Navigate to="/login" />} 
        />
      </Routes>
    </Router>
  )
}

export default App
