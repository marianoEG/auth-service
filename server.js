const express = require("express");
const connectDB = require("./db");
const { port } = require("./config/config");
const authRoutes = require("./routes/authRoutes");

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);

// Start Server
connectDB();
app.listen(port, () => console.log(`Auth Service running on port ${port}`));
