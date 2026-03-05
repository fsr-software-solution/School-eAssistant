import Users from '../models/Users.js';
import ChatSessions from '../models/ChatSessions.js'
import StudentProgress from '../models/StudentProgress.js';
import PaymentTransaction from '../models/PaymentTransaction.js';
import {
    generateAccessToken,
    generateRefreshToken
} from '../utils/tokenUtils.js';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

// Validation schema for updating user
const updateUserSchema = z.object({
    username: z.string().min(3, 'Username must be at least 3 characters').optional(),
    password: z.string().min(6, 'Password must be at least 6 characters').optional(),
    role: z.enum(['student', 'admin']).optional()
});


export const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check if user exists
        const existingUser = await Users.findOne({
            username,
            isDeleted: false
        });

        let user;

        if (existingUser) {
            // User exists, verify password
            if (!(await existingUser.comparePassword(password))) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid credentials"
                });
            }
            user = existingUser;
        } else {
            // User doesn't exist, register new user
            user = await Users.create({
                username,
                password
            });
        }

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        user.refreshToken = refreshToken;
        await user.save();
        user.password = null

        res.json({
            success: true,
            accessToken,
            refreshToken,
            user
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


export const refreshAccessToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: "Refresh token required"
            });
        }

        const decoded = jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        const user = await Users.findById(decoded.id);

        if (!user || user.refreshToken !== refreshToken) {
            return res.status(403).json({
                success: false,
                message: "Invalid refresh token"
            });
        }

        const newAccessToken = generateAccessToken(user);

        res.json({
            success: true,
            accessToken: newAccessToken
        });

    } catch (error) {
        console.error("Refresh Token Error:", error);
        res.status(403).json({
            success: false,
            message: "Invalid or expired refresh token"
        });
    }
};



export const logout = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        const user = await Users.findOne({ refreshToken });

        if (user) {
            user.refreshToken = null;
            await user.save();
        }

        res.json({
            success: true,
            message: "Logged out successfully"
        });

    } catch (error) {
        console.error("Logout Error:", error);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

export const createUser = async (req, res) => {
    try {
        const { username, password, role } = req.body;
        const adminId = req.user.id;

        // Verify the requesting user is an admin
        const admin = await Users.findById(adminId);
        if (!admin || admin.role !== 'admin' || admin.isDeleted) {
            return res.status(403).json({
                success: false,
                message: "Access denied. Admin privileges required"
            });
        }

        // Validate input
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: "Username and password are required"
            });
        }

        // Check if username already exists
        const existingUser = await Users.findOne({ username });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Username already exists"
            });
        }

        // Create new admin user
        const user = await Users.create({
            username,
            password,
            role
        });

        res.status(201).json({
            success: true,
            message: "Admin user created successfully",
            data: user
        });

    } catch (error) {
        console.error("Create Admin Error:", error);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

/**
 new feterue now i add 
 */
export const getAllUsers = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, role, search } = req.query;
        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);
        const skip = (pageNumber - 1) * limitNumber;

        // Build filter
        const filter = { isDeleted: false };

        if (role && ['student', 'admin'].includes(role)) {
            filter.role = role;
        }

        if (search) {
            filter.username = { $regex: search, $options: 'i' };
        }

        // Get total count for pagination
        const total = await Users.countDocuments(filter);

        // Get users
        const users = await Users.find(filter)
            .select('-password -refreshToken')
            .sort({ updatedAt: -1 })
            // .skip(skip)
            // .limit(limitNumber);

        res.status(200).json({
            success: true,
            data: users,
            pagination: {
                page: pageNumber,
                limit: limitNumber,
                total,
                pages: Math.ceil(total / limitNumber)
            }
        });
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve users',
            error: error.message
        });
    }
};

/**
 * Get user by ID
 * Users can view their own profile, admins can view any profile
 */
export const getUserById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const requestingUserId = req.user?.id;
        const requestingUserRole = req.user?.role;

        // Users can only view their own profile unless they're admin
        if (requestingUserRole !== 'admin' && requestingUserId !== id) {
            return res.status(403).json({
                success: false,
                message: 'You can only view your own profile'
            });
        }

        const user = await Users.findById(id).select('-password -refreshToken');

        if (!user || user.isDeleted) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Get user by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve user',
            error: error.message
        });
    }
};

/**
 * Get user progress
 * Users can view their own progress, admins can view any user's progress
 */
export const getUserProgress = async (req, res, next) => {
    try {
        const { id } = req.params;
        const requestingUserId = req.user?.id;
        const requestingUserRole = req.user?.role;

        // Users can only view their own progress unless they're admin
        if (requestingUserRole !== 'admin' && requestingUserId !== id) {
            return res.status(403).json({
                success: false,
                message: 'You can only view your own progress'
            });
        }

        // Verify user exists and is a student
        const user = await Users.findOne({ _id: id, isDeleted: false });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Get all progress for this student
        const progress = await StudentProgress.find({studentId: id, isDeleted: false}).sort({ updatedAt: -1 });

        res.status(200).json({
            success: true,
            data: progress
        });
    } catch (error) {
        console.error('Get user progress error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve user progress',
            error: error.message
        });
    }
};

/**
 * Update user
 * Users can update their own profile (except role), admins can update any user
 */
export const updateUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const requestingUserId = req.user?.id;
        const requestingUserRole = req.user?.role;

        // Users can only update their own profile unless they're admin
        if (requestingUserRole !== 'admin' && requestingUserId !== id) {
            return res.status(403).json({
                success: false,
                message: 'You can only update your own profile'
            });
        }

        // Validate input
        if (!req?.body?.password) {
            delete req.body.password
        }

        const validation = updateUserSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: 'Invalid input data',
                errors: validation.error.errors
            });
        }

        const updateData = validation.data;

        // Non-admin users cannot change their role
        if (requestingUserRole !== 'admin' && updateData.role) {
            return res.status(403).json({
                success: false,
                message: 'You cannot change your own role'
            });
        }

        // Find user
        const user = await Users.findOne({ _id: id, isDeleted: false });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if username is being changed and if it's already taken
        if (updateData.username && updateData.username !== user.username) {
            const existingUser = await Users.findOne({
                username: updateData.username,
                _id: { $ne: id }
            });

            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message: 'Username already exists'
                });
            }

            user.username = updateData.username;
        }

        // Update password if provided
        if (updateData.password) {
            user.password = updateData.password; // Will be hashed by pre-save hook
        }

        // Update role if admin is making the change
        if (requestingUserRole === 'admin' && updateData.role) {
            user.role = updateData.role;
        }

        await user.save();

        // Return updated user without password
        const updatedUser = await Users.findById(id).select('-password -refreshToken');

        res.status(200).json({
            success: true,
            message: 'User updated successfully',
            data: updatedUser
        });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update user',
            error: error.message
        });
    }
};

/**
 * Delete user (soft delete)
 * Admin only
 */
export const deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Prevent admin from deleting themselves
        if (req.user?.id === id) {
            return res.status(400).json({
                success: false,
                message: 'You cannot delete your own account'
            });
        }

        const user = await Users.findById(id);

        if (!user || user.isDeleted) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Soft delete
        await user.softDelete();

        res.status(200).json({
            data: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete user',
            error: error.message
        });
    }
};


export const getUserChatInteractions = async (req, res, next) => {
    try {
        const { id } = req.params;
        const requestingUserId = req.user?.id;
        const requestingUserRole = req.user?.role;

        // Users can only view their own chat interactions unless they're admin
        if (requestingUserRole !== 'admin' && requestingUserId !== id) {
            return res.status(403).json({
                success: false,
                message: 'You can only view your own chat interactions'
            });
        }

        // Verify user exists and is a student
        const user = await Users.findOne({ _id: id, isDeleted: false });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const interactions = await ChatSessions.find({studentId: id, type: 'interaction'}).sort({ updatedAt: -1 })

        res.status(200).json({
            success: true,
            data: interactions
        });
    } catch (error) {
        console.error('Get user chat interactions error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve user chat interactions',
            error: error.message
        });
    }
};


export const getUserQuizzes = async (req, res, next) => {
    try {
        const { id } = req.params;
        const requestingUserId = req.user?.id;
        const requestingUserRole = req.user?.role;

        // Users can only view their own quizzes unless they're admin
        if (requestingUserRole !== 'admin' && requestingUserId !== id) {
            return res.status(403).json({
                success: false,
                message: 'You can only view your own quizzes'
            });
        }

        // Verify user exists and is a student
        const user = await Users.findOne({ _id: id, isDeleted: false });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const quizzes = await ChatSessions.find({studentId: id, type: 'quiz'}).sort({ updatedAt: -1 })

        res.status(200).json({
            success: true,
            data: quizzes
        });
    } catch (error) {
        console.error('Get user quizzes error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve user quizzes',
            error: error.message
        });
    }
};

export const getUserPayments = async (req, res, next) => {
    const { id } = req.params;
    const requestingUserId = req.user?.id;
    const requestingUserRole = req.user?.role;

    // Users can only view their own quizzes unless they're admin
    if (requestingUserRole !== 'admin' && requestingUserId !== id) {
        return res.status(403).json({
            success: false,
            message: 'You can only view your own payment histories'
        });
    }

    // Verify user exists and is a student
    const user = await Users.findOne({ _id: id, isDeleted: false });
    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found'
        });
    }

    const transactions = await PaymentTransaction.find({ studentId: id })
        .populate('planId', 'planName amount durationDays features')
        .sort({ updatedAt: -1 });

    res.status(200).json({
        success: true,
        data: transactions
    });
}