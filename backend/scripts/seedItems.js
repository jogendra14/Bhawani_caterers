import mongoose from "mongoose";
import dotenv from "dotenv";

import Item from "../models/Item.js";
import RawMaterial from "../models/RawMaterial.js";

import itemData from "../data/itemData.json" with { type: "json" };

dotenv.config();

const seedItems = async () => {
  try {

    const MONGO_URI=`mongodb+srv://jogendrabanna46_db_user:royal8239@cluster0.pcnmhsz.mongodb.net/?appName=Cluster0`
    await mongoose.connect(MONGO_URI);

    console.log("MongoDB connected");

    for (const itemDataItem of itemData) {
      const rawMaterialIds = [];

      for (const materialName of itemDataItem.rawMaterials) {
        const material = await RawMaterial.findOne({
          name: materialName,
        });

        if (!material) {
          console.log(
            `❌ Raw material not found: ${materialName}`
          );

          continue;
        }

        rawMaterialIds.push(material._id);
      }

      if (rawMaterialIds.length === 0) {
        console.log(
          `❌ Skipping item: ${itemDataItem.name}`
        );

        continue;
      }

      const existingItem = await Item.findOne({
        name: itemDataItem.name,
      });

      if (existingItem) {
        console.log(
          `⚠️ Item already exists: ${itemDataItem.name}`
        );

        continue;
      }

      await Item.create({
        name: itemDataItem.name,
        rawMaterials: rawMaterialIds,
      });

      console.log(
        `✅ Added item: ${itemDataItem.name}`
      );
    }

    console.log("🎉 Item seeding completed");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seed error:", error);

    process.exit(1);
  }
};

seedItems();