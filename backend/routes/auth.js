const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// VULN #4: Hardcoded fallback JWT secret + no expiry on tokens (tokens live forever).
const JWT_SECRET = process.env.JWT_SECRET || "secret123";

/**
 * REGISTER
 * VULN #2 (Mass Assignment): the entire req.body is spread into the new User,
 * so a client can POST { "username": "x", "password": "y", "isAdmin": true }
 * and grant themselves admin at signup.
 */
router.post("/register", async (req, res) => {
  try {
    const user = new User({ ...req.body }); // <-- mass assignment vulnerability
    await user.save();
    res.status(201).json(user); // VULN #5: returns full user doc, including plaintext password
  } catch (err) {
    // VULN #6: leaks internal error/stack trace details to the client
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});

/**
 * LOGIN
 * VULN #7 (NoSQL Injection): username/password are dropped straight into the
 * Mongo query. A request like:
 *   { "username": {"$ne": null}, "password": {"$ne": null} }
 * will match the first user in the collection and log the attacker in
 * without knowing any real credentials.
 * VULN #8: no rate limiting / brute-force protection on this endpoint.
 */
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username, password }); // <-- NoSQL injection
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    // VULN #4 (cont.): no `expiresIn` set -> token never expires.
    const token = jwt.sign(
      { id: user._id, username: user.username, isAdmin: user.isAdmin },
      JWT_SECRET
    );
    res.json({ token, user }); // VULN #5 (cont.): plaintext password shipped to client again
  } catch (err) {
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});

module.exports = router;
