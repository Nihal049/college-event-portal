import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CreateEvent from './pages/CreateEvent';
import MyRegistrations from './pages/MyRegistrations';
import Profile from './pages/Profile';
import AdminScanner from './pages/AdminScanner';
import EditEvent from './pages/EditEvent';
import BroadcastManager from './pages/BroadcastManager';
import AdminEventDetails from './pages/AdminEventDetails'; // <-- Make sure this is imported!
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import MySchedule from './pages/MySchedule';
import AdminAnalytics from './pages/AdminAnalytics';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create-event" element={<CreateEvent />} />
        <Route path="/my-registrations" element={<MyRegistrations />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin-scanner" element={<AdminScanner />} />
        <Route path="/admin/edit-event/:id" element={<EditEvent />} />
        {/* This is the route that tells React to load the new details page */}
        <Route path="/admin/event/:id" element={<AdminEventDetails />} />
        <Route path="/admin/broadcast" element={<BroadcastManager />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/analytics" element={<AdminAnalytics />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/my-schedule" element={<MySchedule />} /><Route path="/schedule" element={<MySchedule />} />     
      </Routes>
    </Router>
  );
}

export default App;