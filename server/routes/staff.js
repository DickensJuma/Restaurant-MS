const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const auth = require("../middleware/auth");

// Get all staff members
router.get("/", auth, async (req, res) => {
  try {
    // Get all users with role 'staff' or 'admin'
    const staff = await User.find({
      role: { $in: ["staff", "admin"] },
    }).select("-password");
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add new staff member
router.post("/", auth, async (req, res) => {
  try {
    // Only admin can add new staff
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Only admin can add new staff members" });
    }

    const { name, email, phone, role, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = new User({
      name,
      email,
      phone,
      role: role || "staff", // Default to staff if not specified
      password: hashedPassword,
      status: "active",
    });

    await user.save();

    // Return user without password
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json(userResponse);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update staff member
router.put("/:id", auth, async (req, res) => {
  try {
    const { name, email, phone, role, status, password } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if trying to modify an admin
    if (user.role === "admin" && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Only admin can modify admin accounts" });
    }

    // Prevent changing admin status or role
    if (user.role === "admin") {
      if (status === "inactive") {
        return res
          .status(403)
          .json({ message: "Cannot deactivate admin account" });
      }
      if (role && role !== "admin") {
        return res.status(403).json({ message: "Cannot change admin role" });
      }
    }

    // Update fields
    user.name = name || user.name;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    if (role && user.role !== "admin") {
      user.role = role;
    }
    if (status && user.role !== "admin") {
      user.status = status;
    }

    // Update password if provided
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();

    // Return user without password
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json(userResponse);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete staff member
router.delete("/:id", auth, async (req, res) => {
  try {
    // Only admin can delete users
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admin can delete users" });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent deleting admin accounts
    if (user.role === "admin") {
      return res.status(403).json({ message: "Cannot delete admin account" });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
