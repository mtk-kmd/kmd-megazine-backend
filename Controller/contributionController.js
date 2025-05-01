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

exports.addCommentToContribution = async (req, res) => {
    const { submission_id, comment, user_id } = req.body;
    try {
        const contributionComment = await prisma.comment.create({
            data: {
                submission_id: parseInt(submission_id),
                content: comment,
                user_id: parseInt(user_id),
            },
        });
        if (!contributionComment) {
            return error_response(res, { message: "Comment not added" });
        }

        return response(res, contributionComment);
    } catch (error) {
        return error_response(res, error);
    } finally {
        await prisma.$disconnect();
    }
}

exports.createStudentSubmission = async (req, res) => {
    const { contribution_id, user_id, title, content, uploadUrl, agreed_to_terms } = req.body;
    try {
        const urls = Array.isArray(uploadUrl) ? uploadUrl : [uploadUrl];

        const submission = await prisma.studentSubmission.create({
            data: {
                contribution_id: parseInt(contribution_id),
                student_id: parseInt(user_id),
                title: title,
                content: content,
                uploadUrl: urls,
                agreed_to_terms: agreed_to_terms,
            },
        });
        if (!submission) {
            return error_response(res, { message: "Submission not created" });
        }
        return response(res, submission);
    } catch (error) {
        return error_response(res, error);
    } finally {
        await prisma.$disconnect();
    }
}

exports.getStudentSubmission = async (req, res) => {
    const { submission_id } = req.query;
    try {
        if (submission_id) {
            const submission = await prisma.studentSubmission.findUnique({
                where: {
                    submission_id: parseInt(submission_id),
                },
                include: {
                    contribution: true,
                    student: true,
                    comments: {
                        include: {
                            contributor: true,
                        }
                    }
                },
            });
            return response(res, submission);
        } else {
            const submission = await prisma.studentSubmission.findMany({
                include: {
                    contribution: true,
                    student: {
                        select: {
                            user_id: true,
                            role: true,
                            user_name: true,
                            first_name: true,
                            last_name: true,
                            email: true,
                            phone: true,
                            role_id: true,
                            StudentFaculty: {
                                include: {
                                    faculty: true
                                }
                            },
                        }
                    },
                    comments: {
                        include: {
                            contributor: {
                                select: {
                                    user_id: true,
                                    role: true,
                                    user_name: true,
                                    first_name: true,
                                    last_name: true,
                                    email: true,
                                    phone: true,
                                    role_id: true,
                                }
                            }
                        }
                    }
                },
            });

            return response(res, submission);
        }
    } catch (error) {
        return error_response(res, error);
    } finally {
        await prisma.$disconnect();
    }
}