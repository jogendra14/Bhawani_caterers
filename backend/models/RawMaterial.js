// models/RawMaterial.js

import mongoose from "mongoose";

const rawMaterialSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Raw material name is required"],
      trim: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

rawMaterialSchema.index({ name: "text" });

const RawMaterial = mongoose.model("RawMaterial", rawMaterialSchema);

export default RawMaterial;