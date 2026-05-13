import { Routes, Route } from 'react-router-dom'
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

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/missions" element={<Missions />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/fund" element={<Fund />} />
        <Route path="/claim" element={<ClaimStay />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/destinations" element={<Destinations />} />
        <Route path="/destinations/:id" element={<DestinationDiscussion />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/explorer/:id" element={<ExplorerProfile />} />
        <Route path="/test-missions" element={<TestMissions />} />
        <Route path="/bookings" element={<Bookings />} />
      </Routes>
    </>
  )
}
