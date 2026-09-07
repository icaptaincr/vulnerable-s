const mongoose = require("mongoose");

// VULN #1: Password stored in PLAINTEXT. Should be hashed with bcrypt/argon2.
// VULN #2: isAdmin is a plain boolean field settable via mass assignment (see routes/auth.js register).
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // plaintext, never do this in real apps
  isAdmin: { type: Boolean, default: false },
});

module.exports = mongoose.model("User", userSchema);
