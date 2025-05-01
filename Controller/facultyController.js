const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { response, error_response} = require('../utils/response');
const mailjet = require('node-mailjet').connect(process.env.MAILJET_APIKEY, process.env.MAILJET_SECRET_KEY);

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
                    students: {
                        include: {
                            student: true,
                        },
                    }
                },
            });

            delete faculty.coordinator?.user_password;

            faculty.students.forEach((s) => {
                delete s.student.user_password;
            })

            return response(res, faculty);
        }
        const faculty = await prisma.faculty.findMany({
            include: {
                coordinator: {
                    include: {
                        role: true
                    }
                },
                students: {
                    include: {
                        student: true,
                    },
                }
            },
        });

        faculty.forEach((f) => {
            delete f.coordinator?.user_password;
            f.students.forEach((s) => {
                delete s.student.user_password;
            })
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

exports.addGuestToFaculty = async (req, res) => {
    const { faculty_id, guest_id } = req.body;
    try {
        const exitstingGuest = await prisma.guestFaculty.findUnique({
            where: {
                guest_id: parseInt(guest_id),
            },
            include: {
                faculty: true,
            }
        });

        if (exitstingGuest) {
            return error_response(res, "Guest already exists in this faculty");
        }
        const guestFaculty = await prisma.guestFaculty.create({
            data: {
                faculty_id: parseInt(faculty_id),
                guest_id: parseInt(guest_id),
            },
        });

        if (!guestFaculty) {
            return error_response(res, "Failed to add guest to faculty");
        }

        const getFaculty = await prisma.faculty.findUnique({
            where: {
                faculty_id: parseInt(faculty_id),
            },
            include: {
                coordinator: true,
                guests: {
                    include: {
                        guest: true,
                    },
                }
            },
        })

        delete getFaculty.coordinator?.user_password;

        getFaculty.guests.forEach((s) => {
            delete s.guest.user_password;
        })

        const emailPayload = {
            "Messages": [
                {
                    "From": {
                        "Email": "minthukyaw454@gmail.com",
                        "Name": "Guest user registered to your faculty"
                    },
                    "To": [
                        {
                            "Email": getFaculty.coordinator.email,
                            "Name": getFaculty.coordinator.first_name
                        }
                    ],
                    "Subject": "Guest user registered to your faculty",
                    "TextPart": `Dear ${getFaculty.coordinator.first_name}, guest user ${getFaculty.guests[0]?.guest.first_name} ${getFaculty.guests[0]?.guest.last_name} has been registered to your faculty.`,
                    "HTMLPart": `<h3>Dear ${getFaculty.coordinator.first_name}, guest user ${getFaculty.guests[0]?.guest.first_name} ${getFaculty.guests[0]?.guest.last_name} has been registered to your faculty.</h3>`
                }
            ]
        };

        await mailjet.post("send", { version: 'v3.1' }).request(emailPayload);

        return response(res, getFaculty);
    } catch (error) {
        return error_response(res, error);
    } finally {
        await prisma.$disconnect();
    }
}
