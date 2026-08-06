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

// Student Routes (Only requires 'protect')
router.post('/:id/register', protect, registerForEvent);
router.delete('/:id/cancel', protect, cancelRegistration);
router.get('/my-registrations', protect, getMyRegistrations);
router.post('/:id/team', protect, createTeam);
router.post('/:id/team/join', protect, joinTeam);
router.get('/:id/team', protect, getMyTeam);

// Volunteer + Admin Routes (For the Scanner & Details)
router.post('/:id/checkin', protect, authorize('admin', 'volunteer'), checkInUser);
router.get('/:id/admin-details', protect, authorize('admin', 'volunteer'), getAdminEventDetails);

// Admin ONLY Routes (Strictly locked down)
router.post('/', protect, authorize('admin'), createEvent);
router.put('/:id', protect, authorize('admin'), updateEvent);
router.delete('/:id', protect, authorize('admin'), deleteEvent);
router.put('/:id/assign-room', protect, authorize('admin'), assignRoom);
router.post('/broadcast', protect, authorize('admin'), broadcastAnnouncement);
router.post('/:id/bookmark', protect, toggleBookmark);
router.get('/my-bookmarks', protect, getMyBookmarks);
module.exports = router;