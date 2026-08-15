// controllers/userController.js

import User from '../models/User.js';
import asyncHandler from '../middleware/asyncHandler.js';
import ErrorResponse from '../utils/errorResponse.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
/*
|--------------------------------------------------------------------------
| LOGIN
|--------------------------------------------------------------------------
*/
export const loginUser = asyncHandler(
  async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(
        new ErrorResponse(
          'Please provide email and password',
          400
        )
      );
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    }).select('+passwordHash');

    console.log(user)

    if (!user) {
      return next(
        new ErrorResponse(
          'Invalid email or password',
          401
        )
      );
    }

    if (!user.isActive) {
      return next(
        new ErrorResponse(
          'Your account has been deactivated.',
          403
        )
      );
    }

    const passwordMatch =
      await bcrypt.compare(password,user.passwordHash) 

      console.log(user.passwordHash)
      console.log(passwordMatch)
      console.log(password)


    if (!passwordMatch) {
      return next(
        new ErrorResponse(
          'Invalid email or password',
          401
        )
      );
    }

    const accessToken =
      user.generateAccessToken();

    const refreshToken =
      user.generateRefreshToken();

    user.refreshToken = refreshToken;

    await user.save({
      validateBeforeSave: false,
    });

    /*
    |--------------------------------------------------------------------------
    | Refresh token ONLY in HTTP-only cookie
    |--------------------------------------------------------------------------
    */
    res.cookie(
      'refreshToken',
      refreshToken,
      {
        httpOnly: true,
        secure:
          process.env.NODE_ENV === 'development',
        sameSite:
          process.env.NODE_ENV === 'development'
            ? 'none'
            : 'lax',
        maxAge:
          7 * 24 * 60 * 60 * 1000,
        path: '/',
      }
    );

    res.status(200).json({
      success: true,
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isActive: user.isActive,
        },
        accessToken,
      },
    });
  }
);

/*
|--------------------------------------------------------------------------
| LOGOUT
|--------------------------------------------------------------------------
*/
export const logoutUser = asyncHandler(
  async (req, res, next) => {
    const refreshToken =
      req.cookies?.refreshToken;

    if (refreshToken) {
      const user =
        await User.findOne({
          refreshToken,
        }).select('+refreshToken');

      if (user) {
        user.refreshToken = null;

        await user.save({
          validateBeforeSave: false,
        });
      }
    }

    res.clearCookie(
      'refreshToken',
      {
        httpOnly: true,
        secure:
          process.env.NODE_ENV === 'production',
        sameSite:
          process.env.NODE_ENV === 'production'
            ? 'none'
            : 'lax',
        path: '/',
      }
    );

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  }
);

/*
|--------------------------------------------------------------------------
| REFRESH ACCESS TOKEN
|--------------------------------------------------------------------------
*/
export const refreshAccessToken =
  asyncHandler(
    async (req, res, next) => {
      const refreshToken =
        req.cookies?.refreshToken;

      if (!refreshToken) {
        return next(
          new ErrorResponse(
            'No refresh token provided',
            401
          )
        );
      }

      let decoded;

      try {
        decoded = jwt.verify(
          refreshToken,
          process.env.JWT_REFRESH_SECRET
        );
      } catch (error) {
        return next(
          new ErrorResponse(
            'Invalid or expired refresh token',
            401
          )
        );
      }

      const user =
        await User.findById(
          decoded.id
        ).select('+refreshToken');

      if (
        !user ||
        user.refreshToken !== refreshToken
      ) {
        return next(
          new ErrorResponse(
            'Invalid refresh token',
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

      const accessToken =
        user.generateAccessToken();

      res.status(200).json({
        success: true,
        data: {
          accessToken,
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            isActive: user.isActive,
          },
        },
      });
    }
  );

/*
|--------------------------------------------------------------------------
| CURRENT USER
|--------------------------------------------------------------------------
*/
export const getMe = asyncHandler(
  async (req, res, next) => {
    const user =
      await User.findById(req.user.id);

    if (!user) {
      return next(
        new ErrorResponse(
          'User not found',
          404
        )
      );
    }

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  }
);

/*
|--------------------------------------------------------------------------
| CREATE ADMIN
|--------------------------------------------------------------------------
| PUBLIC REGISTER NAHI HOGA.
| Sirf SUPERADMIN admin create karega.
|--------------------------------------------------------------------------
*/
export const registerUser = asyncHandler(
  async (req, res, next) => {
    const {
      name,
      email,
      phone,
      password,
    } = req.body;

    if (
      !name ||
      !email ||
      !phone ||
      !password
    ) {
      return next(
        new ErrorResponse(
          'All fields are required',
          400
        )
      );
    }

    if (password.length < 6) {
      return next(
        new ErrorResponse(
          'Password must be at least 6 characters',
          400
        )
      );
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    const existingUser =
      await User.findOne({
        email: normalizedEmail,
      });

    if (existingUser) {
      return next(
        new ErrorResponse(
          'User with this email already exists',
          400
        )
      );
    }

    // ALWAYS create ADMIN
    // Superadmin cannot be created from frontend
    const user = await User.create({
      name,
      email: normalizedEmail,
      phone,
      passwordHash: password,
      role: 'admin',
      isActive: true,
    });

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
    });
  }
);

/*
|--------------------------------------------------------------------------
| GET ALL USERS
|--------------------------------------------------------------------------
*/
export const getAllUser =
  asyncHandler(
    async (req, res) => {
      const users =
        await User.find()
          .select(
            '-passwordHash -refreshToken'
          )
          .sort({
            createdAt: -1,
          });

      res.status(200).json({
        success: true,
        count: users.length,
        data: users,
      });
    }
  );

/*
|--------------------------------------------------------------------------
| GET USER BY ID
|--------------------------------------------------------------------------
*/
export const getUserById =
  asyncHandler(
    async (req, res, next) => {
      const user =
        await User.findById(
          req.params.id
        ).select(
          '-passwordHash -refreshToken'
        );

      if (!user) {
        return next(
          new ErrorResponse(
            'User not found',
            404
          )
        );
      }

      res.status(200).json({
        success: true,
        data: user,
      });
    }
  );

/*
|--------------------------------------------------------------------------
| UPDATE USER
|--------------------------------------------------------------------------
| Role yahan change nahi hoga.
|--------------------------------------------------------------------------
*/
export const updateUser =
  asyncHandler(
    async (req, res, next) => {
      const {
        name,
        email,
        phone,
        password,
        isActive,
      } = req.body;

      const user =
        await User.findById(
          req.params.id
        ).select('+passwordHash');

      if (!user) {
        return next(
          new ErrorResponse(
            'User not found',
            404
          )
        );
      }

      // Superadmin ko deactivate/change nahi karne dena
      if (
        user.role === 'superadmin' &&
        isActive === false
      ) {
        return next(
          new ErrorResponse(
            'Superadmin cannot be deactivated',
            403
          )
        );
      }

      if (
        email &&
        email.toLowerCase() !==
          user.email
      ) {
        const exists =
          await User.findOne({
            email:
              email
                .trim()
                .toLowerCase(),
          });

        if (exists) {
          return next(
            new ErrorResponse(
              'Email already exists',
              400
            )
          );
        }

        user.email =
          email
            .trim()
            .toLowerCase();
      }

      if (name !== undefined) {
        user.name = name;
      }

      if (phone !== undefined) {
        user.phone = phone;
      }

      if (
        isActive !== undefined &&
        user.role !== 'superadmin'
      ) {
        user.isActive = isActive;
      }

      if (password) {
        if (password.length < 6) {
          return next(
            new ErrorResponse(
              'Password must be at least 6 characters',
              400
            )
          );
        }

        user.passwordHash =
          password;
      }

      await user.save();

      res.status(200).json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isActive:
            user.isActive,
          updatedAt:
            user.updatedAt,
        },
      });
    }
  );

/*
|--------------------------------------------------------------------------
| DELETE USER
|--------------------------------------------------------------------------
*/
export const deleteUser =
  asyncHandler(
    async (req, res, next) => {
      const user =
        await User.findById(
          req.params.id
        );

      if (!user) {
        return next(
          new ErrorResponse(
            'User not found',
            404
          )
        );
      }

      if (
        user.role === 'superadmin'
      ) {
        return next(
          new ErrorResponse(
            'Superadmin cannot be deleted',
            403
          )
        );
      }

      if (
        user._id.toString() ===
        req.user.id.toString()
      ) {
        return next(
          new ErrorResponse(
            'You cannot delete your own account',
            400
          )
        );
      }

      await user.deleteOne();

      res.status(200).json({
        success: true,
        message:
          'User deleted successfully',
      });
    }
  );

/*
|--------------------------------------------------------------------------
| TOGGLE USER STATUS
|--------------------------------------------------------------------------
*/
export const toggleUserStatus =
  asyncHandler(
    async (req, res, next) => {
      const user =
        await User.findById(
          req.params.id
        );

      if (!user) {
        return next(
          new ErrorResponse(
            'User not found',
            404
          )
        );
      }

      if (
        user.role === 'superadmin'
      ) {
        return next(
          new ErrorResponse(
            'Superadmin status cannot be changed',
            403
          )
        );
      }

      user.isActive =
        !user.isActive;

      await user.save();

      res.status(200).json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          isActive:
            user.isActive,
        },
      });
    }
  );