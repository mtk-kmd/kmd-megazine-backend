const UAParser = require('ua-parser-js');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');

const browserTrackingMiddleware = async (req, res, next) => {
    try {
        const parser = new UAParser(req.headers['user-agent']);
        const browserInfo = parser.getResult();
        const token = req.headers.authorization;
        let user = null;

        if (!token) {
            console.log('No token provided.');
        } else {
            const tokenWithoutBearer = token.replace('Bearer ', '');
            const decoded = jwt.verify(tokenWithoutBearer, 'secret_key');
            console.log(decoded);

            user = await prisma.user.findUnique({
                where: { user_id: decoded.id },
                select: {
                    user_id: true,
                    user_name: true,
                    role: true,
                    email: true,
                }
            });
        }

        await prisma.browserTracking.create({
            data: {
                browser_name: browserInfo.browser.name || 'Unknown',
                browser_version: browserInfo.browser.version || 'Unknown',
                os_name: browserInfo.os.name || 'Unknown',
                os_version: browserInfo.os.version || 'Unknown',
                device_type: browserInfo.device.type || 'Unknown',
                device_vendor: browserInfo.device.vendor || 'Unknown',
                device_model: browserInfo.device.model || 'Unknown',
                request_path: req.path,
                request_method: req.method,
                user_id: user ? user.user_id : null,
            }
        });
        next();
    } catch (error) {
        console.error('Browser tracking error:', error);
        next();
    } finally {
        await prisma.$disconnect();
    }
};

exports.browserTrackingMiddleware = browserTrackingMiddleware;
