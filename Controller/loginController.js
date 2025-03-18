const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.login = async (req, res) => {
    const { user_name, password, is_guest_user, email } = req.body;

    try {
        if (is_guest_user) {
            const guestUser = await prisma.guestUser.findFirst({
                where: { email },
                include: {
                    auth: true,
                },
            });

            const token = jwt.sign(
                { id: guestUser.user_id, username: guestUser.email, role: guestUser.role },
                'secret_key',
                { expiresIn: '30d' }
            );

            return res.status(200).json({
                message: "User authenticated successfully",
                token,
                result: guestUser,
            });
        }

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

        if (user.role_id === 4) {
            // Check if the user's authentication is verified
            if (!user.auth || !user.auth.is_verified) {
                return res.status(401).json({ message: "User is not verified" });
            }
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
