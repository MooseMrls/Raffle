const mongoose = require('mongoose');

const ParticipantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['pending', 'winner'],
      default: 'pending',
    },
    wonAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Participant', ParticipantSchema);
