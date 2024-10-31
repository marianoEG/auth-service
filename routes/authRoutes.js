const express = require("express");
const {
  register,
  login,
  getAllUsers,
  getUserById,
} = require("../controllers/authController");
const router = express.Router();

router.post("/register", register);
router.post("/login", login);

// Rutas de usuarios
router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);

module.exports = router;
