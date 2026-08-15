import mongoose from "mongoose";
import dotenv from "dotenv";

import RawMaterial from "../models/RawMaterial.js";
import rawMaterials from "../data/rawMaterialData.json" with { type: "json" };

dotenv.config();

const seedRawMaterials = async () => {
  try {
    // =====================================================
    // CONNECT DATABASE
    // =====================================================

    const MONGO_URI=`mongodb+srv://jogendrabanna46_db_user:royal8239@cluster0.pcnmhsz.mongodb.net/?appName=Cluster0`
    await mongoose.connect(MONGO_URI);


    console.log("========================================");
    console.log("MongoDB Connected");
    console.log("========================================");

    let added = 0;
    let alreadyExists = 0;
    let failed = 0;

    // =====================================================
    // INSERT RAW MATERIALS
    // =====================================================

    for (const material of rawMaterials) {
      try {
        const name = material.name?.trim();

        if (!name) {
          console.log("❌ Invalid material name");
          failed++;
          continue;
        }

        // Check existing material
        const existingMaterial = await RawMaterial.findOne({
          name,
        });

        if (existingMaterial) {
          console.log(`⚠️ Already exists: ${name}`);
          alreadyExists++;
          continue;
        }

        // Create material
        await RawMaterial.create({
          name,
        });

        console.log(`✅ Added: ${name}`);
        added++;
      } catch (error) {
        console.log(
          `❌ Failed: ${material.name}`,
          error.message
        );

        failed++;
      }
    }

    // =====================================================
    // SUMMARY
    // =====================================================

    console.log("\n========================================");
    console.log("RAW MATERIAL SEED COMPLETED");
    console.log("========================================");

    console.log(`✅ Added          : ${added}`);
    console.log(`⚠️ Already Exists : ${alreadyExists}`);
    console.log(`❌ Failed         : ${failed}`);

    console.log("========================================\n");

    await mongoose.connection.close();

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Seed Error:");
    console.error(error);

    await mongoose.connection.close();

    process.exit(1);
  }
};

seedRawMaterials();