// middleware/auth.js

import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import asyncHandler from './asyncHandler.js';
import ErrorResponse from '../utils/errorResponse.js';

/*
|--------------------------------------------------------------------------
| PROTECT
|--------------------------------------------------------------------------
*/
export const protect =
  asyncHandler(
    async (req, res, next) => {
      let token;

      const authHeader =
        req.headers.authorization;

      if (
        authHeader &&
        authHeader.startsWith('Bearer ')
      ) {
        token =
          authHeader.split(' ')[1];
      }

      if (!token) {
        return next(
          new ErrorResponse(
            'Not authorized. Please login.',
            401
          )
        );
      }

      try {
        const decoded =
          jwt.verify(
            token,
            process.env.JWT_ACCESS_SECRET
          );

        const user =
          await User.findById(
            decoded.id
          );

        if (!user) {
          return next(
            new ErrorResponse(
              'User not found',
              401
            )
          );
        }

        if (!user.isActive) {
          return next(
            new ErrorResponse(
              'Your account has been deactivated',
              403
            )
          );
        }

        req.user = {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isActive: user.isActive,
        };

        next();
      } catch (error) {
        if (
          error.name ===
          'TokenExpiredError'
        ) {
          return next(
            new ErrorResponse(
              'Access token expired',
              401
            )
          );
        }

        return next(
          new ErrorResponse(
            'Invalid access token',
            401
          )
        );
      }
    }
  );

/*
|--------------------------------------------------------------------------
| AUTHORIZE ROLE
|--------------------------------------------------------------------------
*/
export const authorize =
  (...roles) =>
  (req, res, next) => {
    if (!req.user) {
      return next(
        new ErrorResponse(
          'Authentication required',
          401
        )
      );
    }

    if (
      !roles.includes(
        req.user.role
      )
    ) {
      return next(
        new ErrorResponse(
          'Access denied',
          403
        )
      );
    }

    next();
  };

/*
|--------------------------------------------------------------------------
| SUPERADMIN ONLY
|--------------------------------------------------------------------------
*/
export const isSuperAdmin =
  (req, res, next) => {
    if (
      req.user?.role !==
      'superadmin'
    ) {
      return next(
        new ErrorResponse(
          'Only superadmin can access this route',
          403
        )
      );
    }

    next();
  };