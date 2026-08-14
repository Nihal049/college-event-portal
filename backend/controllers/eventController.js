const Event = require('../models/Event');
const User = require('../models/User');
const Team = require('../models/Team');
const sendEmail = require('../utils/sendEmail');

const getEvents = async (req, res) => {
  try {
    const events = await Event.find({});
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createEvent = async (req, res) => {
  try {
    const { 
      title, description, category, date, venue, seatLimit, 
      offersAccommodation, allowTeams, maxTeamSize,
      festDay, startTime, endTime 
    } = req.body;

    const event = await Event.create({
      title, description, category, date, venue, seatLimit, 
      offersAccommodation, allowTeams, maxTeamSize, festDay, 
      startTime, endTime, organizer: req.user.id
    });

    res.status(201).json({ message: 'Event created successfully', event });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const registerForEvent = async (req, res) => {
  try {
    const { requestAccommodation } = req.body;
    const event = await Event.findById(req.params.id);

    if (!event) return res.status(404).json({ message: 'Event not found' });

    if (event.registeredUsers && event.registeredUsers.includes(req.user.id)) {
      return res.status(400).json({ message: 'You are already registered for this event!' });
    }

    const currentRegistrations = event.registeredUsers ? event.registeredUsers.length : 0;
    if (currentRegistrations >= event.seatLimit) {
      if (event.waitlistedUsers && event.waitlistedUsers.includes(req.user.id)) {
        return res.status(400).json({ message: 'You are already on the waitlist!' });
      }

      const waitlistOps = { $addToSet: { waitlistedUsers: req.user.id } };
      
      if (requestAccommodation && event.offersAccommodation) {
        waitlistOps.$push = { 
          accommodationRequests: { student: req.user.id, status: 'Waitlisted', assignedRoom: 'Not Assigned' } 
        };
      }

      await Event.findByIdAndUpdate(req.params.id, waitlistOps, { new: true, runValidators: false });
      return res.status(200).json({ message: 'Event is full. You have been added to the waitlist!' });
    }

    const updateOps = { $addToSet: { registeredUsers: req.user.id } };
    
    if (requestAccommodation && event.offersAccommodation) {
      const alreadyRequested = event.accommodationRequests?.some(
        accReq => accReq.student.toString() === req.user.id
      );
      if (!alreadyRequested) {
        updateOps.$push = { 
          accommodationRequests: { student: req.user.id, status: 'Pending', assignedRoom: 'Not Assigned' } 
        };
      }
    }

    await Event.findByIdAndUpdate(req.params.id, updateOps, { new: true, runValidators: false });

    try {
      const user = await User.findById(req.user.id);
      const emailHTML = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
          <h2 style="color: #2563eb;">Registration Confirmed! 🎉</h2>
          <p>Hi ${user.name},</p>
          <p>You have successfully registered for <strong>${event.title}</strong>.</p>
          <div style="background-color: #f8fafc; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>📍 Venue:</strong> ${event.venue}</p>
            <p style="margin: 5px 0;"><strong>📅 Date:</strong> ${new Date(event.date).toLocaleDateString()}</p>
          </div>
          <p>Please log in to your Student Dashboard to view your official QR Code ticket for entry.</p>
          <br>
          <p style="color: #64748b; font-size: 12px;">This is an automated message from the Event Portal.</p>
        </div>
      `;
      sendEmail({ email: user.email, subject: `Ticket Confirmed: ${event.title}`, html: emailHTML })
        .catch(err => console.error('Email failed:', err));
    } catch (error) {
      console.error('Error preparing email:', error);
    }

    res.status(200).json({ message: 'Successfully registered for the event!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyRegistrations = async (req, res) => {
  try {
    const events = await Event.find({ registeredUsers: req.user.id });
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const checkInUser = async (req, res) => {
  try {
    const { userId } = req.body;
    const event = await Event.findById(req.params.id);

    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.checkedInUsers.includes(userId)) {
      return res.status(400).json({ message: 'User has already checked in!' });
    }

    event.checkedInUsers.push(userId);
    await event.save();

    const user = await User.findById(userId);
    const identifier = user.rollNumber ? user.rollNumber.toUpperCase() : user.name;

    res.status(200).json({ message: `${identifier} successfully checked in!` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAdminEventDetails = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('registeredUsers', 'name email rollNumber')
      .populate('checkedInUsers', 'name email rollNumber')
      .populate('accommodationRequests.student', 'name email rollNumber')
      .populate('feedbacks.student', 'name email rollNumber'); 
      
    if (!event) return res.status(404).json({ message: 'Event not found' });
    
    const teams = await Team.find({ event: req.params.id })
      .populate('captain', 'name email rollNumber')
      .populate('members', 'name email rollNumber');

    const eventData = event.toObject();
    eventData.teams = teams;
    
    res.status(200).json(eventData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateEvent = async (req, res) => {
  try {
    const { title, description, date, venue, category, seatLimit } = req.body;
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      { title, description, date, venue, category, seatLimit },
      { new: true, runValidators: false }
    );
    if (!updatedEvent) return res.status(404).json({ message: 'Event not found' });
    res.status(200).json(updatedEvent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const assignRoom = async (req, res) => {
  try {
    const { requestId, roomNumber } = req.body;
    const event = await Event.findOneAndUpdate(
      { _id: req.params.id, "accommodationRequests._id": requestId },
      { 
        $set: { 
          "accommodationRequests.$.assignedRoom": roomNumber,
          "accommodationRequests.$.status": "Approved"
        } 
      },
      { new: true }
    ).populate('accommodationRequests.student', 'name email rollNumber');

    if (!event) return res.status(404).json({ message: 'Event or request not found' });
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const cancelRegistration = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.checkedInUsers && event.checkedInUsers.includes(req.user.id)) {
      return res.status(400).json({ message: 'Cannot cancel ticket after checking in.' });
    }

    const team = await Team.findOne({
      event: req.params.id,
      $or: [{ captain: req.user.id }, { members: req.user.id }]
    });

    if (team) {
      if (team.captain.toString() === req.user.id) {
        if (team.members.length > 0) {
          const newCaptain = team.members.shift();
          team.captain = newCaptain;
          await team.save();
        } else {
          await Team.findByIdAndDelete(team._id);
        }
      } else {
        team.members = team.members.filter(memberId => memberId.toString() !== req.user.id);
        await team.save();
      }
    }

    event.registeredUsers = event.registeredUsers.filter(userId => userId.toString() !== req.user.id);
    if (event.accommodationRequests) {
      event.accommodationRequests = event.accommodationRequests.filter(request => request.student.toString() !== req.user.id);
    }

    let promotedUserEmail = null;
    let promotedUserName = null;

    if (event.waitlistedUsers && event.waitlistedUsers.length > 0) {
      const promotedUserId = event.waitlistedUsers.shift(); 
      event.registeredUsers.push(promotedUserId);

      if (event.accommodationRequests) {
        const accReq = event.accommodationRequests.find(r => r.student.toString() === promotedUserId.toString());
        if (accReq) accReq.status = 'Pending';
      }

      const promotedUser = await User.findById(promotedUserId);
      if (promotedUser) {
        promotedUserEmail = promotedUser.email;
        promotedUserName = promotedUser.name;
      }
    }

    await event.save();

    if (promotedUserEmail) {
      const emailHTML = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
          <h2 style="color: #16a34a;">You're In! 🎉</h2>
          <p>Hi ${promotedUserName},</p>
          <p>Great news! A spot opened up for <strong>${event.title}</strong> and you have been automatically moved off the waitlist and registered!</p>
          <p>Please log in to your Student Dashboard to view your official QR Code ticket.</p>
        </div>
      `;
      sendEmail({ email: promotedUserEmail, subject: `Waitlist Upgrade: ${event.title}`, html: emailHTML })
        .catch(err => console.error("Waitlist email failed:", err));
    }

    res.status(200).json({ message: 'Registration cancelled successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createTeam = async (req, res) => {
  try {
    const { teamName } = req.body;
    const eventId = req.params.id;
    const userId = req.user.id;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (!event.allowTeams) return res.status(400).json({ message: 'This event does not allow teams.' });

    if (event.registeredUsers.includes(userId) || event.waitlistedUsers.includes(userId)) {
      return res.status(400).json({ message: 'You are already registered or waitlisted for this event.' });
    }
    if (event.registeredUsers.length >= event.seatLimit) {
      return res.status(400).json({ message: 'Event is completely sold out! Cannot create a team.' });
    }

    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const team = await Team.create({ name: teamName, event: eventId, captain: userId, inviteCode });

    event.registeredUsers.push(userId);
    await event.save();

    res.status(201).json({ message: `Team '${teamName}' created! Invite Code: ${inviteCode}`, team });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const joinTeam = async (req, res) => {
  try {
    const { inviteCode } = req.body;
    const eventId = req.params.id;
    const userId = req.user.id;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    if (event.registeredUsers.includes(userId) || event.waitlistedUsers.includes(userId)) {
      return res.status(400).json({ message: 'You are already registered or waitlisted.' });
    }
    if (event.registeredUsers.length >= event.seatLimit) {
      return res.status(400).json({ message: 'Event is completely sold out!' });
    }

    const team = await Team.findOne({ inviteCode: inviteCode.toUpperCase(), event: eventId });
    if (!team) return res.status(404).json({ message: 'Invalid invite code or team not found.' });

    if (team.members.length + 1 >= event.maxTeamSize) {
      return res.status(400).json({ message: `This team has reached its max capacity of ${event.maxTeamSize} players!` });
    }

    team.members.push(userId);
    await team.save();

    event.registeredUsers.push(userId);
    await event.save();

    res.status(200).json({ message: `Successfully joined team ${team.name}!`, team });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyTeam = async (req, res) => {
  try {
    const team = await Team.findOne({
      event: req.params.id,
      $or: [{ captain: req.user.id }, { members: req.user.id }]
    }).populate('captain', 'name email rollNumber').populate('members', 'name email rollNumber');
    if (!team) return res.status(200).json(null); 
    res.status(200).json(team);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const broadcastAnnouncement = async (req, res) => {
  try {
    const { title, message } = req.body;
    if (!title || !message) return res.status(400).json({ message: 'Please provide both a title and message.' });

    req.io.emit('receive-announcement', { title, message, time: new Date().toLocaleTimeString() });
    res.status(200).json({ message: 'Announcement broadcasted successfully!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyBookmarks = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('bookmarkedEvents');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user.bookmarkedEvents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const toggleBookmark = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const eventId = req.params.id;
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isBookmarked = user.bookmarkedEvents.includes(eventId);

    if (isBookmarked) {
      user.bookmarkedEvents = user.bookmarkedEvents.filter(id => id.toString() !== eventId.toString());
    } else {
      user.bookmarkedEvents.push(eventId);
    }

    await user.save();
    res.status(200).json({ 
      message: isBookmarked ? 'Removed from schedule' : 'Added to schedule!', 
      bookmarkedEvents: user.bookmarkedEvents 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- NEW: FEEDBACK SUBMISSION ---
const submitFeedback = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const event = await Event.findById(req.params.id);

    if (!event) return res.status(404).json({ message: 'Event not found' });

    // Ensure the student actually attended the event before allowing a review
    if (!event.checkedInUsers.includes(req.user.id)) {
      return res.status(400).json({ message: 'You can only review events you actually attended.' });
    }

    // Ensure they haven't already submitted a review
    const alreadyReviewed = event.feedbacks?.find(
      (r) => r.student.toString() === req.user.id.toString()
    );

    if (alreadyReviewed) {
      return res.status(400).json({ message: 'You have already submitted feedback for this event!' });
    }

    const newFeedback = {
      student: req.user.id,
      rating: Number(rating),
      comment: comment
    };

    event.feedbacks.push(newFeedback);
    await event.save();

    res.status(201).json({ message: 'Thank you! Your feedback has been recorded.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getEvents, createEvent, registerForEvent, getMyRegistrations, checkInUser, getAdminEventDetails,
  updateEvent, assignRoom, deleteEvent, cancelRegistration, createTeam, joinTeam, getMyTeam,
  broadcastAnnouncement, toggleBookmark, getMyBookmarks, submitFeedback
};