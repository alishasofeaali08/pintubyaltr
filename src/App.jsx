import { Link, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import RequireAuth from './components/RequireAuth'
import AboutUs from './pages/AboutUs'
import AdminDashboard from './pages/AdminDashboard'
import AdminLogin from './pages/AdminLogin'
import Community from './pages/Community'
import Dashboard from './pages/Dashboard'
import Enquiry from './pages/Enquiry'
import FAQ from './pages/FAQ'
import HowItWorks from './pages/HowItWorks'
import Login from './pages/Login'
import Marketplace from './pages/Marketplace'
import OurMission from './pages/OurMission'
import Signup from './pages/Signup'
import MaintenanceRequests from './pages/MaintenanceRequests'
import Announcements from './pages/Announcements'

function NotFound() {
  return (
    <div className="container wide empty-state">
      <h1>404 · Page not found</h1>
      <p>The page you are looking for does not exist.</p>
      <Link to="/" className="primary-btn">Go to Home</Link>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<RequireAuth><Community /></RequireAuth>} />
        <Route path="/community" element={<RequireAuth><Community /></RequireAuth>} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/mission" element={<OurMission />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/enquiry" element={<Enquiry />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
        <Route path="/marketplace" element={<RequireAuth><Marketplace /></RequireAuth>} />
        <Route path="/maintenance" element={<RequireAuth><MaintenanceRequests /></RequireAuth>} />
        <Route path="/announcements" element={<RequireAuth><Announcements /></RequireAuth>} />
        <Route path="/admin" element={<RequireAuth adminOnly><AdminDashboard /></RequireAuth>} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
