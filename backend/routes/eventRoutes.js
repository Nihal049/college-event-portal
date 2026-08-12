const express = require('express');
const router = express.Router();
const {
  getEvents,
  createEvent,
  registerForEvent,
  getMyRegistrations,
  checkInUser,
  getAdminEventDetails,
  updateEvent,
  assignRoom,
  deleteEvent,
  cancelRegistration,
  createTeam,
  joinTeam,
  getMyTeam,
  broadcastAnnouncement,
  toggleBookmark,
  getMyBookmarks
} = require('../controllers/eventController');

// Import both protect AND authorize
const { protect, authorize } = require('../middlewares/authMiddleware'); 

// Public route
router.get('/', getEvents);

// ==========================================
// 1. SPECIFIC ROUTES (Must go BEFORE /:id routes)
// ==========================================
router.get('/my-registrations', protect, getMyRegistrations);
router.get('/my-bookmarks', protect, getMyBookmarks);
router.post('/broadcast', protect, authorize('admin'), broadcastAnnouncement);

// ==========================================
// 2. PARAMETERIZED ROUTES (/:id)
// ==========================================
// Student Routes 
router.post('/:id/register', protect, registerForEvent);
router.delete('/:id/cancel', protect, cancelRegistration);
router.post('/:id/team', protect, createTeam);
router.post('/:id/team/join', protect, joinTeam);
router.get('/:id/team', protect, getMyTeam);
router.post('/:id/bookmark', protect, toggleBookmark);

// Volunteer + Admin Routes
router.post('/:id/checkin', protect, authorize('admin', 'volunteer'), checkInUser);
router.get('/:id/admin-details', protect, authorize('admin', 'volunteer'), getAdminEventDetails);

// Admin ONLY Routes
router.post('/', protect, authorize('admin'), createEvent);
router.put('/:id', protect, authorize('admin'), updateEvent);
router.delete('/:id', protect, authorize('admin'), deleteEvent);
router.put('/:id/assign-room', protect, authorize('admin'), assignRoom);

module.exports = router;