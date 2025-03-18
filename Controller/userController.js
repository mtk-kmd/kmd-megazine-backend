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
                    user_id: parseInt(user_id),
                },
                include: {
                    role: true,
                    StudentFaculty: {
                        include: {
                            faculty: true
                        }
                    },
                    Faculty: {
                        include: {
                            students: {
                                include: {
                                    student: {
                                        select: {
                                            user_id: true,
                                            user_name: true,
                                            first_name: true,
                                            last_name: true,
                                            email: true,
                                            phone: true,
                                            role_id: true,
                                            auth_id: true,
                                            status: true,
                                            createdAt: true,
                                            updatedAt: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });

            if (user) {
                delete user.user_password;
            }
        } else {
            user = await prisma.user.findMany({
                include: {
                    role: true,
                    StudentFaculty: {
                        include: {
                            faculty: true
                        }
                    },
                    Faculty: {
                        include: {
                            students: {
                                include: {
                                    student: {
                                        select: {
                                            user_id: true,
                                            user_name: true,
                                            first_name: true,
                                            last_name: true,
                                            email: true,
                                            phone: true,
                                            role_id: true,
                                            auth_id: true,
                                            status: true,
                                            createdAt: true,
                                            updatedAt: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });

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
                role_id: role,
                email: email,
                phone: phone || "",
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

exports.createGuestUser = async (req, res) => {
    const { first_name, last_name, phone, email } = req.body;

    try {
        const user = await prisma.guestUser.create({
            data: {
                first_name: first_name,
                last_name: last_name,
                email: email,
                phone: phone,
                role_id: 5
            },
        });

        const authCode = Math.floor(Math.random() * 900000) + 100000;
        const auth = await prisma.authentication.create({
            data: {
                auth_code: authCode,
            },
        });

        console.log(authCode);
        console.log(user.user_id);

        updateGuestUser = await prisma.guestUser.update({
            where: {
                user_id: user.user_id,
            },
            data: {
                auth_id: auth.auth_id,
            },
        });

        if (updateGuestUser) {
            response(res, user);
        } else {
            error_response(res, "Error creating Guest User");
        }
    } catch (error) {
        console.error('Error creating Guest User:', error);
        error_response(res, error);
    } finally {
        await prisma.$disconnect();
    }
};

exports.update = async (req, res) => {
    const { user_id, user_name, role, first_name, last_name, email, phone, status} = req.body;

    try {
        const user = await prisma.user.update({
            where: {
                user_id: parseInt(user_id),
            },
            data: {
                user_name: user_name,
                role_id: role,
                first_name: first_name,
                last_name: last_name,
                email: email,
                phone: phone,
                status: status
            },
        });

        delete user.user_password;
        return response(res, user);
    } catch (error) {
        return error_response(res, error);
    } finally {
        await prisma.$disconnect();
    }
};

exports.delete = async (req, res) => {
    const { user_id } = req.body;
    try {
        const user = await prisma.user.update({
            where: {
                user_id: parseInt(user_id),
            },
            data: {
                status: false,
            }
        });

        delete user.user_password;
        return response(res, user);
    } catch (error) {
        return error_response(res, error);
    } finally {
        await prisma.$disconnect();
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
    const { email, user_name, auth_code } = req.body;

    try {
        const user = await prisma.user.findUnique({
            where: {
                user_name: user_name,
                email: email,
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

exports.passwordReset = async (req, res) => {
    const { user_name, email } = req.body;

    try {
        const user = await prisma.user.findUnique({
            where: {
                user_name: user_name,
                email: email,
            },
        });

        if (!user) {
            return res.status(404).json({
                status: 404,
                message: "User not found",
            });
        }

        const auth = await prisma.authentication.create({
            data: {
                auth_code: Math.floor(Math.random() * 900000) + 100000,
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
                                "Email": email,
                                "Name": user.first_name
                            }
                        ],
                        "Subject": "Here is your verification code",
                        "TextPart": `Dear ${user.first_name}, here is your verification code ${auth.auth_code}`,
                        "HTMLPart": `<h3>Dear ${user.first_name}, welcome!</h3><br /><p>Your verification code is: ${auth.auth_code}</p>`
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

        response(res, "Authentication Code Sent Successfully. Please check email.");
    } catch (error) {
        console.error("Error fetching authentication:", error);
    } finally {
        await prisma.$disconnect();
    }
}

exports.createRole = async (req, res) => {
    const { role_name } = req.body;
    try {
        const role = await prisma.role.create({
            data: {
                role_name: role_name,
            },
        });
        response(res, role);
    } catch (error) {
        console.error("Error creating role:", error);
        error_response(res, error);
    } finally {
        await prisma.$disconnect();
    }
}

exports.getRoles = async (req, res) => {
    const { role_id } = req.query;
    try {
        if (role_id) {
            const role = await prisma.role.findUnique({
                where: {
                    role_id: parseInt(role_id),
                },
            });
            response(res, role);
        }

        const roles = await prisma.role.findMany();
        response(res, roles);
    } catch (error) {
        console.error("Error fetching roles:", error);
        error_response(res, error);
    } finally {
        await prisma.$disconnect();
    }
}
