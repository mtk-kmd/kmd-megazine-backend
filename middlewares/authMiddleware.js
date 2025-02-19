const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.verifyToken = async (req, res, next) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({
            message: 'Access denied. No token provided.'
        });
    }

    const tokenWithoutBearer = token.replace('Bearer ', '');

    try {
        const decoded = jwt.verify(tokenWithoutBearer, 'secret_key');

        // Fetch user details from database
        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: {
                id: true,
                user_name: true,
                role: true,
                email: true,
            }
        });

        if (!user) {
            return res.status(401).json({
                message: 'User not found.'
            });
        }

        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({
            message: 'Invalid token.'
        });
    } finally {
        await prisma.$disconnect();
    }
};

module.exports = exports;
