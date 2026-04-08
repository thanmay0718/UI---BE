import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import SignUpPage from './pages/SignUpPage'
import WorkerDashboard from './pages/WorkerDashboard'
import WorkerProfilePage from './pages/WorkerProfile'
import AdminDashboard from './pages/AdminDashboard'
import CreatePolicyPage from './pages/CreatePolicy'
import BuyPolicy from './pages/BuyPolicy'
import ClaimSubmission from './pages/ClaimSubmission'
import WorkerRegistration from './pages/WorkerRegistration'
import WorkerClaimsHistory from './pages/WorkerClaimsHistory'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"               element={<LandingPage />} />
        <Route path="/login"          element={<LoginPage />} />
        <Route path="/signup"         element={<SignUpPage />} />
        <Route path="/worker"         element={<WorkerDashboard />} />
        <Route path="/worker/profile" element={<WorkerProfilePage />} />
        <Route path="/worker/registration" element={<WorkerRegistration />} />
        <Route path="/worker/claims"        element={<WorkerClaimsHistory />} />
        <Route path="/admin"          element={<AdminDashboard />} />
        <Route path="/admin/policy/new" element={<CreatePolicyPage />} />
        <Route path="/buy-policy"     element={<BuyPolicy />} />
        <Route path="/claim"          element={<ClaimSubmission />} />
        <Route path="*"               element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
