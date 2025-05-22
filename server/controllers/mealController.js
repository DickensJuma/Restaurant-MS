const Meal = require("../models/Meal");
const fs = require("fs");
const path = require("path");

// Get all meals
exports.getAllMeals = async (req, res) => {
  try {
    const meals = await Meal.find();
    res.json(meals);
  } catch (error) {
    console.error("Get meals error:", error);
    res.status(500).json({ error: "Failed to fetch meals" });
  }
};

// Get single meal
exports.getMeal = async (req, res) => {
  try {
    const meal = await Meal.findById(req.params.id);
    if (!meal) {
      return res.status(404).json({ error: "Meal not found" });
    }
    res.json(meal);
  } catch (error) {
    console.error("Get meal error:", error);
    res.status(500).json({ error: "Failed to fetch meal" });
  }
};

// Create new meal
exports.createMeal = async (req, res) => {
  try {
    const mealData = {
      ...req.body,
      images: req.files
        ? req.files.map((file, index) => ({
            url: `/uploads/meals/${file.filename}`,
            alt: req.body.name,
            isMain: index === 0,
          }))
        : [],
    };

    const meal = new Meal(mealData);
    await meal.save();
    res.status(201).json(meal);
  } catch (error) {
    console.error("Create meal error:", error);
    res.status(500).json({ error: "Failed to create meal" });
  }
};

// Update meal
exports.updateMeal = async (req, res) => {
  try {
    const meal = await Meal.findById(req.params.id);
    if (!meal) {
      return res.status(404).json({ error: "Meal not found" });
    }

    // Handle image updates
    if (req.files && req.files.length > 0) {
      // Delete old images if requested
      if (req.body.deleteOldImages === "true") {
        meal.images.forEach((image) => {
          if (image.url) {
            const imagePath = path.join(__dirname, "..", image.url);
            if (fs.existsSync(imagePath)) {
              fs.unlinkSync(imagePath);
            }
          }
        });
        meal.images = [];
      }

      // Add new images
      const newImages = req.files.map((file, index) => ({
        url: `/uploads/meals/${file.filename}`,
        alt: req.body.name || meal.name,
        isMain: index === 0 && meal.images.length === 0,
      }));
      meal.images.push(...newImages);
    }

    // Update other fields
    const updateFields = [
      "name",
      "category",
      "price",
      "available",
      "description",
      "ingredients",
      "preparationTime",
      "calories",
      "dietaryInfo",
    ];

    updateFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === "dietaryInfo") {
          meal[field] = {
            ...meal[field],
            ...req.body[field],
          };
        } else {
          meal[field] = req.body[field];
        }
      }
    });

    await meal.save();
    res.json(meal);
  } catch (error) {
    console.error("Update meal error:", error);
    res.status(500).json({ error: "Failed to update meal" });
  }
};

// Delete meal
exports.deleteMeal = async (req, res) => {
  try {
    const meal = await Meal.findById(req.params.id);
    if (!meal) {
      return res.status(404).json({ error: "Meal not found" });
    }

    // Delete associated images
    meal.images.forEach((image) => {
      if (image.url) {
        const imagePath = path.join(__dirname, "..", image.url);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }
    });

    await meal.deleteOne();
    res.json({ message: "Meal deleted successfully" });
  } catch (error) {
    console.error("Delete meal error:", error);
    res.status(500).json({ error: "Failed to delete meal" });
  }
};
