// routes/itemRoutes.js

import express from "express";
import Item from "../models/Item.js";

const router = express.Router();

// =========================================================
// GET ALL ITEMS
// =========================================================

router.get("/", async (req, res) => {
  try {
    const items = await Item.find()
  .populate("rawMaterials", "name")
  .sort({ createdAt: 1 });
    res.status(200).json({
      success: true,
      items,
    });
  } catch (error) {
    console.error("Fetch items error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch items",
    });
  }
});

// =========================================================
// ADD ITEM
// =========================================================

router.post("/", async (req, res) => {
  try {
    const name = req.body.name?.trim();

    const rawMaterials = Array.isArray(req.body.rawMaterials) ? req.body.rawMaterials : [];

    // =====================================================
    // VALIDATE NAME
    // =====================================================

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Item name is required",
      });
    }

    // =====================================================
    // VALIDATE RAW MATERIALS
    // =====================================================

    if (rawMaterials.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please select at least one raw material",
      });
    }

    // =====================================================
    // REMOVE DUPLICATE IDS
    // =====================================================

    const uniqueRawMaterials = [...new Set(rawMaterials.map((id) => String(id)))];

    // =====================================================
    // CREATE
    // =====================================================

    const item = await Item.create({
      name,
      rawMaterials: uniqueRawMaterials,
    });

    res.status(201).json({
      success: true,
      item,
    });
  } catch (error) {
    console.error("Add item error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This item already exists",
      });
    }

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid raw material selected",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to add item",
    });
  }
});

// =========================================================
// UPDATE ITEM
// =========================================================

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const name = req.body.name?.trim();

    const rawMaterials = Array.isArray(req.body.rawMaterials) ? req.body.rawMaterials : [];

    // =====================================================
    // VALIDATE NAME
    // =====================================================

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Item name is required",
      });
    }

    // =====================================================
    // VALIDATE RAW MATERIALS
    // =====================================================

    if (rawMaterials.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please select at least one raw material",
      });
    }

    // =====================================================
    // REMOVE DUPLICATES
    // =====================================================

    const uniqueRawMaterials = [...new Set(rawMaterials.map((id) => String(id)))];

    // =====================================================
    // UPDATE
    // =====================================================

    const item = await Item.findByIdAndUpdate(
      id,
      {
        name,
        rawMaterials: uniqueRawMaterials,
      },
      {
        new: true,
        runValidators: true,
      },
    );

    // =====================================================
    // ITEM NOT FOUND
    // =====================================================

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    res.status(200).json({
      success: true,
      item,
    });
  } catch (error) {
    console.error("Update item error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This item already exists",
      });
    }

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid item or raw material ID",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update item",
    });
  }
});

// =========================================================
// DELETE ITEM
// =========================================================

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const item = await Item.findByIdAndDelete(id);

    // =====================================================
    // ITEM NOT FOUND
    // =====================================================

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Item deleted successfully",
      item,
    });
  } catch (error) {
    console.error("Delete item error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid item ID",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to delete item",
    });
  }
});

export default router;
