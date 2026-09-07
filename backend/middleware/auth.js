const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "secret123";

/**
 * VULN #9: "Auth" middleware only checks that *a* valid token was supplied.
 * It does not verify the user still exists, isn't banned, etc. Combined with
 * tokens that never expire (see routes/auth.js), a leaked token is valid forever.
 */
function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: "No token provided" });

  const token = header.replace("Bearer ", "");
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
}

module.exports = requireAuth;
