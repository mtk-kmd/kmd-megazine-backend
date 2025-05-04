const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { response, error_response} = require('../utils/response');
const mailjet = require('node-mailjet').connect(process.env.MAILJET_APIKEY, process.env.MAILJET_SECRET_KEY);

exports.createEvent = async (req, res) => {
    const { title, description, createdBy, entry_closure, final_closure, faculty_id } = req.body;
    try {
        const event = await prisma.event.create({
            data: {
                title: title,
                description: description,
                userUser_id: parseInt(createdBy),
                faculty_id: parseInt(faculty_id),
            },
        });

        if (!event) {
            return error_response(res, { message: "Event not created" });
        }

        if (entry_closure && final_closure) {
            const closure = await prisma.closureDate.create({
                data: {
                    entry_closure: entry_closure,
                    final_closure: final_closure,
                },
            });

            const updateEvent = await prisma.event.update({
                where: {
                    event_id: event.event_id,
                },
                data: {
                    closure_id: closure.closure_id,
                },
            });

            if (!updateEvent) {
                return error_response(res, { message: "Event not updated" });
            }
        }

        const getEvent = await prisma.event.findUnique({
            where: {
                event_id: event.event_id,
            },
            include: {
                User: {
                    include: {
                        role: true
                    }
                },
                closure: true,
                Faculty: true,
            },
        });

        delete getEvent.User?.user_password;

        const emailPayload = {
            "Messages": [
                {
                    "From": {
                        "Email": "minthukyaw454@gmail.com",
                        "Name": "A new event"
                    },
                    "To": [
                        {
                            "Email": getEvent.User?.email,
                            "Name": getEvent.User?.first_name
                        }
                    ],
                    "Subject": "A new event has been created",
                    "TextPart": `Dear ${getEvent.User?.first_name}, event name ${getEvent.title} has been created.`,
                    "HTMLPart": `<h3>Dear ${getEvent.User?.first_name},</h3><br><p>event name ${getEvent.title} has been created.</p>`,
                }
            ]
        };

        await mailjet.post("send", { version: 'v3.1' }).request(emailPayload);

        return response(res, getEvent);
    } catch (error) {
        return error_response(res, error);
    } finally {
        await prisma.$disconnect();
    }
}


exports.getEvent = async (req, res) => {
    const { event_id } = req.query;
    try {
        if (event_id) {
            const event = await prisma.event.findUnique({
                where: {
                    event_id: parseInt(event_id),
                },
                include: {
                    User: {
                        include: {
                            role: true
                        }
                    },
                    closure: true,
                    Faculty: true,
                    view_count: true,
                    StudentSubmission: {
                        include: {
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
                                            StudentFaculty: {
                                                include: {
                                                    faculty: true
                                                }
                                            },
                                        }
                                    },
                                }
                            },
                        }
                    }
                },
            });

            const viewCount = await prisma.viewCount.findFirst({
                where: {
                    event_id: parseInt(event_id)
                }
            });

            if (!viewCount) {
                await prisma.viewCount.create({
                    data: {
                        event_id: event.event_id,
                        count: 1,
                    },
                });
            } else {
                await prisma.viewCount.update({
                    where: {
                        view_count_id: viewCount.view_count_id,
                    },
                    data: {
                        count: viewCount.count + 1,
                    },
                });
            }

            delete event.User?.user_password;
            return response(res, event);
        } else {
            const event = await prisma.event.findMany({
                include: {
                    User: {
                        include: {
                            role: true
                        }
                    },
                    closure: true,
                    Faculty: true,
                    view_count: true,
                    StudentSubmission: {
                        include: {
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
                                            StudentFaculty: {
                                                include: {
                                                    faculty: true
                                                }
                                            },
                                        }
                                    },
                                }
                            },
                        }
                    }
                },
            });
            event.forEach((c) => {
                delete c.User?.user_password;
            })
            return response(res, event);
        }
    } catch (error) {
        return error_response(res, error);
    } finally {
        await prisma.$disconnect();
    }
}

exports.updateEvent = async (req, res) => {
    const { event_id, title, description, createdBy, entry_closure, final_closure, faculty_id } = req.body;

    try {
        const event = await prisma.event.update({
            where: {
                event_id: parseInt(event_id),
            },
            data: {
                title: title,
                description: description,
                userUser_id: parseInt(createdBy),
                faculty_id: parseInt(faculty_id),
            },
        });

        if (entry_closure && final_closure) {
            await prisma.closureDate.update({
                where: {
                    closure_id: event.closure_id,
                },
                data: {
                    entry_closure: entry_closure,
                    final_closure: final_closure,
                }
            })
        }

        if (!event) {
            return error_response(res, { message: "Event not updated" });
        }

        const getEvent = await prisma.event.findUnique({
            where: {
                event_id: event.event_id,
            },
            include: {
                User: {
                    include: {
                        role: true
                    }
                },
                closure: true,
                faculty: true,
            },
        });
        delete getEvent.User?.user_password;

        return response(res, getEvent);
    } catch (error) {
        return error_response(res, error);
    } finally {
        await prisma.$disconnect();
    }
}

exports.deleteEvent = async (req, res) => {
    const { event_id } = req.body;
    try {
        const event = await prisma.event.delete({
            where: {
                event_id: parseInt(event_id),
            },
        });
        if (!event) {
            return error_response(res, { message: "Event not deleted" });
        }
        return response(res, { message: "Event deleted"});
    } catch (error) {
        return error_response(res, error);
    } finally {
        await prisma.$disconnect();
    }
}
