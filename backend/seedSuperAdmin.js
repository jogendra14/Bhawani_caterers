// scripts/seedSuperAdmin.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';

import User from './models/User.js';

dotenv.config();

const createSuperAdmin =
  async () => {
    try {
      await mongoose.connect(
        process.env.MONGO_URI
      );

      const existing =
        await User.findOne({
          role: 'superadmin',
        });

      if (existing) {
        console.log(
          'Superadmin already exists'
        );

        process.exit(0);
      }

      const superAdmin =
        await User.create({
          name:
            process.env.SUPERADMIN_NAME,
          email:
            process.env.SUPERADMIN_EMAIL,
          phone:
            process.env.SUPERADMIN_PHONE,
          passwordHash:
            process.env.SUPERADMIN_PASSWORD,
          role: 'superadmin',
          isActive: true,
        });

      console.log(
        'Superadmin created:',
        superAdmin.email
      );

      process.exit(0);
    } catch (error) {
      console.error(
        error
      );

      process.exit(1);
    }
  };

createSuperAdmin();