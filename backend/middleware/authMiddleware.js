import jwt from 'jsonwebtoken';
import Users from '../models/Users.js';

const protect = async (req, res, next) => {

    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {

            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(
                token,
                process.env.ACCESS_TOKEN_SECRET
            );

            const user = await Users.findById(decoded.id).select('-password');

            if (!user || user.isDeleted) {
                return res.status(401).json({
                    success: false,
                    message: "User not found"
                });
            }

            req.user = user;
            req.user.id = user._id.toString()
            next();

        } catch (error) {
            return res.status(401).json({
                success: false,
                message: "Access token expired or invalid"
            });
        }
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "No token provided"
        });
    }
};

export default protect