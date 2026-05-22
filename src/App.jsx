import { Routes, Route } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'
import Navbar from './components/Navbar.jsx'
import Home from './pages/Home.jsx'
import Profile from './pages/Profile.jsx'
import Missions from './pages/Missions.jsx'
import Feed from './pages/Feed.jsx'
import Fund from './pages/Fund.jsx'
import ClaimStay from './pages/ClaimStay.jsx'
import Auth from './pages/Auth.jsx'
import Destinations from './pages/Destinations.jsx'
import Messages from './pages/Messages.jsx'
import ExplorerProfile from './pages/ExplorerProfile.jsx'
import DestinationDiscussion from './pages/DestinationDiscussion.jsx'
import TestMissions from './pages/TestMissions.jsx'
import Bookings from './pages/Bookings.jsx'
import Privacy from './pages/Privacy.jsx'
import Terms from './pages/Terms.jsx'
import Admin from './pages/Admin.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

export default function App() {
  const { user } = useAuth()
  return (
    <div className={`app-layout${!user ? ' no-sidebar' : ''}`}>
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          
          {/* Protected Routes */}
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/missions" element={<ProtectedRoute><Missions /></ProtectedRoute>} />
          <Route path="/feed" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
          <Route path="/fund" element={<ProtectedRoute><Fund /></ProtectedRoute>} />
          <Route path="/claim" element={<ProtectedRoute><ClaimStay /></ProtectedRoute>} />
          <Route path="/destinations" element={<ProtectedRoute><Destinations /></ProtectedRoute>} />
          <Route path="/destinations/:id" element={<ProtectedRoute><DestinationDiscussion /></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
          <Route path="/explorer/:id" element={<ProtectedRoute><ExplorerProfile /></ProtectedRoute>} />
          <Route path="/test-missions" element={<ProtectedRoute><TestMissions /></ProtectedRoute>} />
          <Route path="/bookings" element={<ProtectedRoute><Bookings /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  )
}
