// routes/rawMaterialRoutes.js

import express from "express";
import RawMaterial from "../models/RawMaterial.js";

const router = express.Router();

// GET all materials
router.get("/", async (req, res) => {
  try {
    const materials = await RawMaterial.find().sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      materials,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch raw materials",
    });
  }
});

// ADD material
router.post("/", async (req, res) => {
  try {
    const name = req.body.name?.trim();

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Raw material name is required",
      });
    }

    const material = await RawMaterial.create({
      name,
    });

    res.status(201).json({
      success: true,
      material,
    });
  } catch (error) {
    // Duplicate name
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This raw material already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to add raw material",
    });
  }
});

export default router;