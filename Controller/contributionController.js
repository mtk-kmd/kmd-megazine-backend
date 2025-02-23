const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { response, error_response} = require('../utils/response');

exports.getContribution = async (req, res) => {
    const { contribution_id } = req.query;
    try {
        if (contribution_id) {
            const contribution = await prisma.contribution.findUnique({
                where: {
                    contribution_id: parseInt(contribution_id),
                },
                include: {
                    User: {
                        include: {
                            role: true
                        }
                    },
                    faculty: true,
                    closure: true
                },
            });
            delete contribution.User?.user_password;
            return response(res, contribution);
        } else {
            const contribution = await prisma.contribution.findMany({
                include: {
                    User: {
                        include: {
                            role: true
                        }
                    },
                    faculty: true,
                    closure: true
                },
            });
            contribution.forEach((c) => {
                delete c.User?.user_password;
            })
            return response(res, contribution);
        }
    } catch (error) {
        return error_response(res, error);
    } finally {
        await prisma.$disconnect();
    }
}

exports.createContribution = async (req, res) => {
    const { title, description, faculty_id, createdBy, entry_closure, final_closure } = req.body;
    try {
        const contribution = await prisma.contribution.create({
            data: {
                title: title,
                description: description,
                faculty_id: parseInt(faculty_id),
                userUser_id: parseInt(createdBy),
            },
        });

        if (!contribution) {
            return error_response(res, { message: "Contribution not created" });
        }

        if (entry_closure && final_closure) {
            const closure = await prisma.closureDate.create({
                data: {
                    entry_closure: entry_closure,
                    final_closure: final_closure,
                },
            });

            const updateContribution = await prisma.contribution.update({
                where: {
                    contribution_id: contribution.contribution_id,
                },
                data: {
                    closure_id: closure.closure_id,
                },
            });

            if (!updateContribution) {
                return error_response(res, { message: "Contribution not updated" });
            }
        }

        const getContribution = await prisma.contribution.findUnique({
            where: {
                contribution_id: contribution.contribution_id,
            },
            include: {
                User: {
                    include: {
                        role: true
                    }
                },
                faculty: true,
                closure: true
            },
        });

        delete getContribution.User?.user_password;

        return response(res, getContribution);
    } catch (error) {
        return error_response(res, error);
    } finally {
        await prisma.$disconnect();
    }
}
