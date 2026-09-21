const mongoose = require('mongoose');

const WinnerSchema = new mongoose.Schema(
  {
    participantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Participant',
      default: null,
    },
    name: { type: String, required: true, trim: true },
    drawNumber: { type: Number, required: true },
    wonAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Winner', WinnerSchema);
