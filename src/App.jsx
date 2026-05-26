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
import MissionDetail from './pages/MissionDetail.jsx'
import ExplorerProfile from './pages/ExplorerProfile.jsx'
import DestinationDiscussion from './pages/DestinationDiscussion.jsx'
import TestMissions from './pages/TestMissions.jsx'
import Bookings from './pages/Bookings.jsx'
import Privacy from './pages/Privacy.jsx'
import Terms from './pages/Terms.jsx'
import Admin from './pages/Admin.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import { ErrorBoundary } from './components/ErrorBoundary.jsx'

export default function App() {
  const { user } = useAuth()
  return (
    <div className={`app-layout${!user ? ' no-sidebar' : ''}`}>
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<ErrorBoundary name="Home"><Home /></ErrorBoundary>} />
          <Route path="/auth" element={<ErrorBoundary name="Auth"><Auth /></ErrorBoundary>} />
          <Route path="/privacy" element={<ErrorBoundary name="Privacy"><Privacy /></ErrorBoundary>} />
          <Route path="/terms" element={<ErrorBoundary name="Terms"><Terms /></ErrorBoundary>} />
          
          {/* Protected Routes */}
          <Route path="/profile" element={<ProtectedRoute><ErrorBoundary name="Profile"><Profile /></ErrorBoundary></ProtectedRoute>} />
          <Route path="/missions" element={<ProtectedRoute><ErrorBoundary name="Missions"><Missions /></ErrorBoundary></ProtectedRoute>} />
          <Route path="/missions/:missionId" element={<ProtectedRoute><ErrorBoundary name="MissionDetail"><MissionDetail /></ErrorBoundary></ProtectedRoute>} />
          <Route path="/feed" element={<ProtectedRoute><ErrorBoundary name="Feed"><Feed /></ErrorBoundary></ProtectedRoute>} />
          <Route path="/fund" element={<ProtectedRoute><ErrorBoundary name="Fund"><Fund /></ErrorBoundary></ProtectedRoute>} />
          <Route path="/claim" element={<ProtectedRoute><ErrorBoundary name="ClaimStay"><ClaimStay /></ErrorBoundary></ProtectedRoute>} />
          <Route path="/destinations" element={<ProtectedRoute><ErrorBoundary name="Destinations"><Destinations /></ErrorBoundary></ProtectedRoute>} />
          <Route path="/destinations/:id" element={<ProtectedRoute><ErrorBoundary name="Discussion"><DestinationDiscussion /></ErrorBoundary></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><ErrorBoundary name="Messages"><Messages /></ErrorBoundary></ProtectedRoute>} />
          <Route path="/explorer/:id" element={<ProtectedRoute><ErrorBoundary name="Profile"><ExplorerProfile /></ErrorBoundary></ProtectedRoute>} />
          <Route path="/test-missions" element={<ProtectedRoute><ErrorBoundary name="TestMissions"><TestMissions /></ErrorBoundary></ProtectedRoute>} />
          <Route path="/bookings" element={<ProtectedRoute><ErrorBoundary name="Bookings"><Bookings /></ErrorBoundary></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><ErrorBoundary name="Admin"><Admin /></ErrorBoundary></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  )
}
