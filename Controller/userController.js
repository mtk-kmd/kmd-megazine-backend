const { query } = require("../src/config/pg_connection");
const bcrypt = require('bcryptjs');
const { response, error_response} = require('../utils/response');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const mailjet = require('node-mailjet').connect(process.env.MAILJET_APIKEY, process.env.MAILJET_SECRET_KEY);

exports.get = async (req, res) => {
    const { user_id } = req.query;

    try {
        let user = null;

        if (user_id) {
            user = await prisma.user.findUnique({
                where: {
                    id: parseInt(user_id),
                },
            });

            if (user) {
                delete user.user_password;
            }
        } else {
            user = await prisma.user.findMany();

            user = user.map((u) => {
                const { user_password, ...rest } = u;
                return rest;
            });
        }

        response(res, user);
    } catch (error) {
        console.error('Error creating user:', error);
        response(res, error);
    } finally {
        await prisma.$disconnect();
    }
};

exports.createUser = async (req, res) => {
    const { username, password, first_name, last_name, phone, role, email } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const authCode = Math.floor(Math.random() * 900000) + 100000;

        const user = await prisma.user.create({
            data: {
                user_name: username,
                user_password: hashedPassword,
                role: role,
                email: email,
                phone: parseInt(phone) || null,
                first_name: first_name,
                last_name: last_name,
            },
        });

        const auth = await prisma.authentication.create({
            data: {
                auth_code: authCode,
            },
        });

        await prisma.user.update({
            where: {
                user_id: user.user_id,
            },
            data: {
                auth_id: auth.auth_id,
            },
        });

        delete user.user_password;

        console.log('User created:', user);
        response(res, {
            user,
            auth,
        });
    } catch (error) {
        console.error('Error creating user:', error);
        error_response(res, error);
    } finally {
        await prisma.$disconnect();
    }
};

exports.update = async (req, res) => {
    const { user_id, user_name, role, name, status } = req.body;

    const obj = {
        user_id,
        user_name,
        role,
        name,
        status,
    };

    const getUsers = await query(
        `SELECT * FROM sch_user_management.user_tbl WHERE user_id = $1`,
        [obj.user_id],
    )

    if (getUsers.length > 0) {
        // Check if the user_name already exists for a different ID
        const getQuery = await query(
            "SELECT * FROM sch_user_management.user_tbl WHERE user_name = $1 AND user_id != $2",
            [user_name, user_id],
        );

        if (getQuery.length > 0) {
            return res.status(400).json({
                status: 400,
                message: "User name already exists for a different user",
            });
        } else {
            const updateQuery = "UPDATE sch_user_management.user_tbl SET user_name = $1, role = $2, name = $3, updated_at = $4, status = $5 WHERE user_id = $6";

            await query(
                updateQuery,
                [
                    obj.user_name,
                    obj.role,
                    obj.name,
                    new Date,
                    obj.status,
                    obj.user_id,
                ],
            );

            response(res, obj);
        }
    } else {
        return res.status(500).json({
            status: 500,
            message: "There is no user account with this id",
        })
    }
};

exports.sendVerificationMail = async (req, res) => {
    const { user_id } = req.body;
    try {
        const userInfo = await prisma.user.findUnique({
            where: {
                user_id: user_id,
            },
            include: {
                auth: true,
            },
        });

        if (!userInfo) {
            return res.status(404).json({
                status: 404,
                message: "Authentication not found",
            });
        }

        const request = mailjet
            .post("send", { 'version': 'v3.1' })
            .request({
                "Messages": [
                    {
                        "From": {
                            "Email": "minthukyaw454@gmail.com",
                            "Name": "Authentication Email"
                        },
                        "To": [
                            {
                                "Email": userInfo.email,
                                "Name": userInfo.first_name
                            }
                        ],
                        "Subject": "Here is your verification code",
                        "TextPart": `Dear ${userInfo.first_name}, here is your verification code ${userInfo.auth.auth_code}`,
                        "HTMLPart": `<h3>Dear ${userInfo.first_name}, welcome!</h3><br /><p>Your verification code is: ${userInfo.auth.auth_code}</p>`
                    }
                ]
            });

        request
            .then((result) => {
                response(res, result);
            })
            .catch((err) => {
                console.log(err.statusCode, err.message);
                error_response(res, err);
            });

    } catch (error) {
        console.error("Error fetching authentication:", error);
    } finally {
        await prisma.$disconnect();
    }
};

exports.verifyUser = async (req, res) => {
    const { user_id, auth_code } = req.body;

    try {
        const user = await prisma.user.findUnique({
            where: {
                user_id: user_id,
            },
            include: {
                auth: true,
            },
        });

        if (!user) {
            return res.status(404).json({
                status: 404,
                message: "User not found",
            });
        }

        if (user.auth && user.auth.auth_code === auth_code) {
            await prisma.authentication.update({
                where: {
                    auth_id: user.auth.auth_id,
                },
                data: {
                    is_verified: true
                },
            });

            return res.status(200).json({
                status: 200,
                message: "User verified successfully",
            });
        } else {
            return res.status(401).json({
                status: 401,
                message: "Authentication code is invalid",
            });
        }
    } catch (error) {
        console.error("Error verifying user:", error);
        error_response(res, error);
    } finally {
        await prisma.$disconnect();
    }
};
