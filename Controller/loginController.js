const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.login = async (req, res) => {
    const { user_name, password } = req.body;

    try {
        const user = await prisma.user.findUnique({
            where: { user_name },
            include: {
                auth: true,
            },
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid User Account" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.user_password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: "Authentication failed" });
        }

        // Check if the user's authentication is verified
        if (!user.auth || !user.auth.is_verified) {
            return res.status(401).json({ message: "User is not verified" });
        }

        const token = jwt.sign(
            { id: user.user_id, username: user.user_name, role: user.role },
            'secret_key',
            { expiresIn: '30d' }
        );

        delete user.user_password;

        return res.status(200).json({
            message: "User authenticated successfully",
            token,
            result: user,
        });
    } catch (error) {
        console.error("Error during login:", error);
        return res.status(500).json({ message: "An error occurred" });
    } finally {
        await prisma.$disconnect();
    }
};
