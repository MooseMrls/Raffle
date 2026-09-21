const express = require('express');
const multer = require('multer');
const Papa = require('papaparse');
const XLSX = require('xlsx');
const Participant = require('../models/Participant');
const Winner = require('../models/Winner');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// GET /api/participants  -> everyone, split by status
router.get('/', async (req, res) => {
  try {
    const pending = await Participant.find({ status: 'pending' }).sort({ createdAt: 1 });
    const winners = await Participant.find({ status: 'winner' }).sort({ wonAt: -1 });
    res.json({ pending, winners });
  } catch (err) {
    res.status(500).json({ message: 'Failed to load participants', error: err.message });
  }
});

// POST /api/participants  -> add one or many names manually
// body: { names: ["Juan Dela Cruz", "Maria Santos"] }
router.post('/', async (req, res) => {
  try {
    const { names } = req.body;
    if (!Array.isArray(names) || names.length === 0) {
      return res.status(400).json({ message: 'Provide a non-empty "names" array.' });
    }
    const cleaned = names
      .map((n) => (typeof n === 'string' ? n.trim() : ''))
      .filter((n) => n.length > 0);

    if (cleaned.length === 0) {
      return res.status(400).json({ message: 'No valid names supplied.' });
    }

    const docs = await Participant.insertMany(cleaned.map((name) => ({ name })));
    res.status(201).json({ inserted: docs.length, participants: docs });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add participants', error: err.message });
  }
});

// POST /api/participants/upload -> CSV or XLSX file, field name "file"
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    const originalName = req.file.originalname.toLowerCase();
    let names = [];

    if (originalName.endsWith('.csv')) {
      const text = req.file.buffer.toString('utf-8');
      const parsed = Papa.parse(text, { skipEmptyLines: true });
      names = parsed.data.map((row) => (Array.isArray(row) ? row[0] : row)).filter(Boolean);
    } else if (originalName.endsWith('.xlsx') || originalName.endsWith('.xls')) {
      const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      names = rows.map((row) => (Array.isArray(row) ? row[0] : row)).filter(Boolean);
    } else {
      return res.status(400).json({ message: 'Only .csv, .xlsx, or .xls files are supported.' });
    }

    // Drop an obvious header row like "name" / "names" / "full name"
    if (names.length && typeof names[0] === 'string') {
      const headerLike = /^(name|names|full ?name|participant)s?$/i;
      if (headerLike.test(names[0].trim())) {
        names = names.slice(1);
      }
    }

    const cleaned = names
      .map((n) => (typeof n === 'string' ? n.trim() : String(n).trim()))
      .filter((n) => n.length > 0);

    if (cleaned.length === 0) {
      return res.status(400).json({ message: 'No names found in the file.' });
    }

    const docs = await Participant.insertMany(cleaned.map((name) => ({ name })));
    res.status(201).json({ inserted: docs.length, participants: docs });
  } catch (err) {
    res.status(500).json({ message: 'Failed to process file', error: err.message });
  }
});

// POST /api/participants/spin -> pick a random pending participant, mark as winner & record in Winner model
router.post('/spin', async (req, res) => {
  try {
    const pool = await Participant.find({ status: 'pending' });
    if (pool.length === 0) {
      return res.status(400).json({ message: 'No participants left in the pool.' });
    }
    const winner = pool[Math.floor(Math.random() * pool.length)];
    winner.status = 'winner';
    winner.wonAt = new Date();
    await winner.save();

    const currentWinnerCount = await Winner.countDocuments({});
    await Winner.create({
      participantId: winner._id,
      name: winner.name,
      drawNumber: currentWinnerCount + 1,
      wonAt: winner.wonAt,
    });

    const remaining = await Participant.countDocuments({ status: 'pending' });
    res.json({ winner, remaining });
  } catch (err) {
    res.status(500).json({ message: 'Failed to spin', error: err.message });
  }
});

// DELETE /api/participants/clear-pool -> clear only pending names, keep winners intact
router.delete('/clear-pool', async (req, res) => {
  try {
    const result = await Participant.deleteMany({ status: 'pending' });
    res.json({ message: `Cleared ${result.deletedCount} pending participant(s). Winners are preserved.` });
  } catch (err) {
    res.status(500).json({ message: 'Failed to clear pool', error: err.message });
  }
});

// DELETE /api/participants/:id -> remove a single participant
router.delete('/:id', async (req, res) => {
  try {
    await Participant.findByIdAndDelete(req.params.id);
    res.json({ message: 'Removed' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to remove participant', error: err.message });
  }
});

// DELETE /api/participants -> reset everything (pool + winners)
router.delete('/', async (req, res) => {
  try {
    await Participant.deleteMany({});
    await Winner.deleteMany({});
    res.json({ message: 'All participants and winner records cleared.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to reset', error: err.message });
  }
});

module.exports = router;
