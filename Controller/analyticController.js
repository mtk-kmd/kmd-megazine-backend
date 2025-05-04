const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getDashboardStats = async (req, res) => {
    try {
        const stats = await Promise.all([
            // Total users count
            prisma.user.count(),
            // Total faculties count
            prisma.faculty.count(),
            // Total events count
            prisma.event.count(),
            // Total student faculty (StudentFaculty entries)
            prisma.studentFaculty.count(),
            // Active users (status = true)
            prisma.user.count({
                where: { status: true }
            }),
            // Recent submissions (last 30 days)
            prisma.studentSubmission.count({
                where: {
                    submittedAt: {
                        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                    }
                }
            }),
            // Total events count
            prisma.event.count(),
            // Total comments
            prisma.comment.count()
        ]);

        res.json({
            totalUsers: stats[0],
            totalFaculties: stats[1],
            totalEvents: stats[2],
            totalStudentFaculties: stats[3],
            activeUsers: stats[4],
            recentSubmissions: stats[5],
            totalEvents: stats[6],
            totalComments: stats[7]
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
    }
};

exports.getDashboardStatsByUser = async (req, res) => {
    const { user_id } = req.query;
    try {
        const user = await prisma.user.findFirst({
            where: {
                user_id: parseInt(user_id),
            },
            include: {
                Event: true,
                role: true,
                StudentFaculty: true,
                StudentSubmission: true
            }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.role_id === 3) {
            const facultyIds = user.Event
                .map(event => event.faculty_id)
                .filter(id => id !== null);

            if (facultyIds.length === 0) {
                return res.status(404).json({ error: 'No faculty associated with this user' });
            }

            const totalEventsById = await prisma.event.findMany({
                where: {
                    userUser_id: user.user_id
                },
                select: {
                    event_id: true,
                    StudentSubmission: {
                        select: {
                            submission_id: true,
                            submission_status: true,
                        }
                    },
                    _count: {
                        select: {
                            StudentSubmission: true
                        }
                    }
                }
            });

            // Calculate submission status counts
            const submissionStatusCounts = totalEventsById.reduce((acc, event) => {
                event.StudentSubmission.forEach(submission => {
                    acc[submission.submission_status] = (acc[submission.submission_status] || 0) + 1;
                });
                return acc;
            }, {});

            const totalOverallSubmissions = totalEventsById.reduce((total, event) => {
                return total + event._count.StudentSubmission;
            }, 0);

            const stats = await Promise.all([
                // Total users count
                prisma.studentFaculty.count({
                    where: {
                        faculty_id: facultyIds[0]
                    }
                }),
                // Total Events count
                prisma.event.count({
                    where: {
                        userUser_id: user.user_id
                    }
                }),
            ]);

            res.json({
                totalStudentsInFaculty: stats[0],
                totalEventsCreatedByUser: stats[1],
                totalOverallSubmissions: totalOverallSubmissions,
                submissionStatusCounts: submissionStatusCounts  // This will show counts by status
            });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
    } finally {
        await prisma.$disconnect();
    }
}
