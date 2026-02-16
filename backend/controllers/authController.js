import Users from '../models/Users.js';
import {
    generateAccessToken,
    generateRefreshToken
} from '../utils/tokenUtils.js';
import jwt from 'jsonwebtoken';

export const register = async (req, res) => {
    try {
        const { username, password, role } = req.body;

        const existingUser = await Users.findOne({ username });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Username already exists"
            });
        }

        const user = await Users.create({
            username,
            password,
            role
        });

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        user.refreshToken = refreshToken;
        await user.save();

        res.status(201).json({
            success: true,
            accessToken,
            refreshToken,
            user: {
                id: user._id,
                username: user.username,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Register Error:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


export const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await Users.findOne({
            username,
            isDeleted: false
        });

        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        user.refreshToken = refreshToken;
        await user.save();

        res.json({
            success: true,
            accessToken,
            refreshToken,
            user: {
                id: user._id,
                username: user.username,
                role: user.role
            }
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

export const createAdmin = async (req, res) => {
    try {
        const { username, password } = req.body;
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
            role: 'admin'
        });

        res.status(201).json({
            success: true,
            message: "Admin user created successfully",
            user: {
                id: user._id,
                username: user.username,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Create Admin Error:", error);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};
