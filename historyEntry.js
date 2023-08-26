const mongoose = require('mongoose');

const historyEntrySchema = new mongoose.Schema({
  question: String,
  answer: Number
});

const HistoryEntry = mongoose.model('HistoryEntry', historyEntrySchema);

module.exports = HistoryEntry;