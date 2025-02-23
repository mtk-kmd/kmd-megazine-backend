const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { response, error_response} = require('../utils/response');

exports.getFaculty = async (req, res) => {
    const { faculty_id } = req.query;

    try {
        if (faculty_id) {
            const faculty = await prisma.faculty.findUnique({
                where: {
                    faculty_id: parseInt(faculty_id),
                },
                include: {
                    coordinator: {
                        include: {
                            role: true
                        }
                    },
                },
            });

            delete faculty.coordinator?.user_password;
            return response(res, faculty);
        }
        const faculty = await prisma.faculty.findMany({
            include: {
                coordinator: {
                    include: {
                        role: true
                    }
                },
            },
        });

        faculty.forEach((f) => {
            delete f.coordinator?.user_password;
        });
        return response(res, faculty);
    } catch (error) {
        return error_response(res, error);
    } finally {
        await prisma.$disconnect();
    }
}

exports.createFaculty = async (req, res) => {
    const { name, coordinator_id } = req.body;
    try {
        const faculty = await prisma.faculty.create({
            data: {
                name,
                coordinator_id,
            },
        });
        return response(res, faculty);
    } catch (error) {
        return error_response(res, error);
    } finally {
        await prisma.$disconnect();
    }
}

exports.updateFaculty = async (req, res) => {
    const { faculty_id, faculty_name, coordinator_id } = req.body;

    try {
        const faculty = await prisma.faculty.update({
            where: {
                faculty_id: parseInt(faculty_id),
            },
            data: {
                name: faculty_name,
                coordinator_id: coordinator_id,
            },
        });
        return response(res, faculty);
    } catch (error) {
        return error_response(res, error);
    } finally {
        await prisma.$disconnect();
    }
}

exports.addStudentToFaculty = async (req, res) => {
    const { faculty_id, student_id } = req.body;
    try {
        const studentFaculty = await prisma.studentFaculty.create({
            data: {
                faculty_id: parseInt(faculty_id),
                student_id: parseInt(student_id),
            },
        });

        if (!studentFaculty) {
            return error_response(res, "Failed to add student to faculty");
        }

        const getFaculty = await prisma.faculty.findUnique({
            where: {
                faculty_id: parseInt(faculty_id),
            },
            include: {
                coordinator: true,
                students: {
                    include: {
                        student: true,
                    },
                }
            },
        })

        delete getFaculty.coordinator?.user_password;
        getFaculty.students.forEach((s) => {
            delete s.student.user_password;
        })

        const combinedObject = {
            ...getFaculty
        }
        return response(res, combinedObject);
    } catch (error) {
        return error_response(res, error);
    } finally {
        await prisma.$disconnect();
    }
}
