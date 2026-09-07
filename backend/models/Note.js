const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  // VULN #3: content is stored and later rendered as raw HTML on the frontend -> Stored XSS.
  content: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Note", noteSchema);
