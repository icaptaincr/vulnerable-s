require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const noteRoutes = require("./routes/notes");

const app = express();

// VULN #12 (CORS Misconfiguration): reflects/allows ANY origin with credentials
// implicitly trusted. A malicious site can call this API directly from a
// victim's browser using their stored token.
app.use(cors({ origin: "*" }));

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/notes", noteRoutes);

// VULN #13: generic error handler that echoes stack traces to the client.
app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message, stack: err.stack });
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/vulnerable_mern";

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error("MongoDB connection error:", err));
