// routes/userRoutes.js

import express from 'express';

import {
  loginUser,
  logoutUser,
  refreshAccessToken,
  getMe,
  registerUser,
  getAllUser,
  getUserById,
  updateUser,
  deleteUser,
  toggleUserStatus,
} from '../controllers/userController.js';

import {
  protect,
  authorize,
  isSuperAdmin,
} from '../middleware/auth.js';

const router =
  express.Router();

/*
|--------------------------------------------------------------------------
| PUBLIC
|--------------------------------------------------------------------------
*/

router.post( '/login', loginUser );

router.post(
  '/refresh-token',
  refreshAccessToken
);

/*
|--------------------------------------------------------------------------
| PROTECTED
|--------------------------------------------------------------------------
*/

router.get(
  '/me',
  protect,
  getMe
);

router.post(
  '/logout',
  protect,
  logoutUser
);

/*
|--------------------------------------------------------------------------
| USER MANAGEMENT
|--------------------------------------------------------------------------
*/

// Only superadmin creates admins
router.post(
  '/',
  protect,
  isSuperAdmin,
  registerUser
);

// Admin + Superadmin can view users
router.get(
  '/',
  protect,
  authorize(
    'admin',
    'superadmin'
  ),
  getAllUser
);

router.get(
  '/:id',
  protect,
  authorize(
    'admin',
    'superadmin'
  ),
  getUserById
);

// Update user
router.put(
  '/:id',
  protect,
  authorize(
    'admin',
    'superadmin'
  ),
  updateUser
);

// Delete ONLY normal admin
router.delete(
  '/:id',
  protect,
  authorize(
    'admin',
    'superadmin'
  ),
  deleteUser
);

// Toggle ONLY normal admin
router.patch(
  '/:id/toggle-status',
  protect,
  authorize(
    'admin',
    'superadmin'
  ),
  toggleUserStatus
);

export default router;