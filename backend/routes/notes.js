const express = require("express");
const Note = require("../models/Note");
const requireAuth = require("../middleware/auth");

const router = express.Router();

// Create a note (owner = logged-in user)
router.post("/", requireAuth, async (req, res) => {
  try {
    const note = new Note({
      title: req.body.title,
      content: req.body.content, // VULN: no sanitization/escaping of HTML/JS here
      owner: req.user.id,
    });
    await note.save();
    res.status(201).json(note);
  } catch (err) {
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});

// List ALL notes from ALL users, not just the logged-in user's own notes.
// VULN #10 (Broken Access Control): any authenticated user can read everyone's notes.
router.get("/", requireAuth, async (req, res) => {
  try {
    const notes = await Note.find().populate("owner", "username password"); // VULN: leaks passwords via populate
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a single note by ID.
// VULN #11 (IDOR): no check that req.user.id === note.owner. Any logged-in
// user can view/edit/delete ANY note just by guessing/incrementing the ID.
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ error: "Not found" });
    res.json(note);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", requireAuth, async (req, res) => {
  try {
    // VULN #11 (cont.): no ownership check before update.
    const note = await Note.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(note);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    // VULN #11 (cont.): no ownership check before delete.
    await Note.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
