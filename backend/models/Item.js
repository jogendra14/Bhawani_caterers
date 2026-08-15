// models/Item.js

import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Item name is required"],
      trim: true,
      unique: true,
    },

    rawMaterials: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "RawMaterial",
        required: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

itemSchema.index({ name: "text" });

const Item = mongoose.model("Item", itemSchema);

export default Item;