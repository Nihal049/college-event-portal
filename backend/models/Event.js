const mongoose = require('mongoose');

const eventSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    festDay: {
      type: String,
      default: 'Day 1',
    },
    startTime: {
      type: String, 
      default: "09:00 AM",
    },
    endTime: {
      type: String,
      default: "11:00 AM",
    },
    venue: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    seatLimit: {
      type: Number,
      required: true,
    },
    offersAccommodation: {
      type: Boolean,
      default: false,
    },
    allowTeams: {
      type: Boolean,
      default: false,
    },
    maxTeamSize: {
      type: Number,
      default: 1,
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    registeredUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    waitlistedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    checkedInUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    accommodationRequests: [
      {
        student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        status: {
          type: String,
          enum: ['Pending', 'Approved', 'Waitlisted', 'Rejected'],
          default: 'Pending',
        },
        assignedRoom: {
          type: String,
          default: 'Not Assigned',
        },
      },
    ],
    // --- NEW: FEEDBACK SYSTEM ---
    feedbacks: [
      {
        student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        rating: {
          type: Number,
          required: true,
          min: 1,
          max: 5
        },
        comment: {
          type: String,
          required: true
        },
        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Event', eventSchema);