const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const Minio = require('minio');
const multer = require('multer');
const path = require('path');
const { response, error_response} = require('../utils/response');
const mailjet = require('node-mailjet').connect(process.env.MAILJET_APIKEY, process.env.MAILJET_SECRET_KEY);

const minioClient = new Minio.Client({
    endPoint: process.env.MINIO_ENDPOINT || 'localhost',
    port: 443,
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY
});

const bucketName = process.env.MINIO_BUCKET_NAME || 'images';

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

const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
        // allowed everything including pdf, docx, img
        const allowedTypes = ['.jpg', '.jpeg', '.png', '.heif', '.pdf', '.docx', '.doc'];
        const extname = path.extname(file.originalname).toLowerCase();
        if (allowedTypes.includes(extname)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type'));
        }
    }
}).any();

exports.createStudentContribution = async (req, res) => {
    const { event_id, user_id, title, content, agreed_to_terms } = req.body;
    try {
        if (!req.files || req.files.length === 0) {
            return error_response(res, { message: "No files uploaded" });
        }

        const urls = [];
        for (const file of req.files) {
            const fileBuffer = file.buffer;
            const fileName = file.originalname;
            const contentType = file.mimetype;
            const objectName = `${Date.now()}-${fileName}`;

            await minioClient.putObject(bucketName, objectName, fileBuffer, contentType);
            const url = await minioClient.presignedGetObject(bucketName, objectName);
            urls.push(url);
        }

        const submission = await prisma.studentSubmission.create({
            data: {
                event_id: parseInt(event_id),
                student_id: parseInt(user_id),
                title: title || "Untitled",
                content: content || "",
                uploadUrl: urls,
                agreed_to_terms: agreed_to_terms === "true" || agreed_to_terms === true,
            },
        });

        const getOneSubmission = await prisma.studentSubmission.findUnique({
            where: {
                submission_id: submission.submission_id,
            },
            include: {
                event: {
                    include: {
                        Faculty: true,
                        User: true,
                        closure: true,
                    }
                },
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
                    }
                },
                comments: true,
            },
        });

        delete getOneSubmission.event.User?.user_password;

        const emailPayload = {
            "Messages": [
                {
                    "From": {
                        "Email": "minthukyaw454@gmail.com",
                        "Name": "A new event submission"
                    },
                    "To": [
                        {
                            "Email": getOneSubmission.event.User?.email,
                            "Name": getOneSubmission.event.User?.first_name
                        }
                    ],
                    "Subject": "Guest user registered to your faculty",
                    "TextPart": `Dear ${getOneSubmission.event.User?.first_name}, student name ${getOneSubmission.student.first_name} ${getOneSubmission.student.last_name} has submitted event ${getOneSubmission.event.title}.`,
                    "HTMLPart": `<h3>Dear ${getOneSubmission.event.User?.first_name},</h3><br><p>student name ${getOneSubmission.student.first_name} ${getOneSubmission.student.last_name} has submitted event ${getOneSubmission.event.title}.</p>`,
                }
            ]
        };

        await mailjet.post("send", { version: 'v3.1' }).request(emailPayload);

        return response(res, submission);
    } catch (error) {
        return error_response(res, error);
    } finally {
        await prisma.$disconnect();
    }
}

exports.getStudentContribution = async (req, res) => {
    const { submission_id } = req.query;
    try {
        if (submission_id) {
            const submission = await prisma.studentSubmission.findUnique({
                where: {
                    submission_id: parseInt(submission_id),
                },
                include: {
                    event: {
                        include: {
                            Faculty: true,
                            User: true,
                            closure: true,
                            view_count: true,
                        }
                    },
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
                    event: {
                        include: {
                            Faculty: true,
                            User: true,
                            closure: true,
                            view_count: true,
                        }
                    },
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
