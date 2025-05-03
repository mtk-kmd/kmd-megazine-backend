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
