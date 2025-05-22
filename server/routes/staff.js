const express = require("express");
const router = express.Router();
const Staff = require("../models/Staff");
const bcrypt = require("bcryptjs");
const auth = require("../middleware/auth");

// Get all staff members
router.get("/", auth, async (req, res) => {
  try {
    const staff = await Staff.find().select("-password");
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add new staff member
router.post("/", auth, async (req, res) => {
  try {
    const { name, email, phone, role, password } = req.body;

    // Check if staff member already exists
    const existingStaff = await Staff.findOne({ email });
    if (existingStaff) {
      return res
        .status(400)
        .json({ message: "Staff member with this email already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new staff member
    const staff = new Staff({
      name,
      email,
      phone,
      role,
      password: hashedPassword,
      status: "active",
    });

    await staff.save();

    // Return staff member without password
    const staffResponse = staff.toObject();
    delete staffResponse.password;

    res.status(201).json(staffResponse);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update staff member
router.put("/:id", auth, async (req, res) => {
  try {
    const { name, email, phone, role, status } = req.body;
    const staff = await Staff.findById(req.params.id);

    if (!staff) {
      return res.status(404).json({ message: "Staff member not found" });
    }

    // Update fields
    staff.name = name || staff.name;
    staff.email = email || staff.email;
    staff.phone = phone || staff.phone;
    staff.role = role || staff.role;
    staff.status = status || staff.status;

    await staff.save();

    // Return staff member without password
    const staffResponse = staff.toObject();
    delete staffResponse.password;

    res.json(staffResponse);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete staff member
router.delete("/:id", auth, async (req, res) => {
  try {
    const staff = await Staff.findByIdAndDelete(req.params.id);
    if (!staff) {
      return res.status(404).json({ message: "Staff member not found" });
    }
    res.json({ message: "Staff member deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
