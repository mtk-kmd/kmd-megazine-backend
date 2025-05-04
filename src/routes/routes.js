const router = require("express").Router();

const multer = require('multer');
const helloController = require('../../Controller/helloController');
const userController = require('../../Controller/userController');
const loginController = require('../../Controller/loginController');
const rcController = require('../../Controller/rcController');
const minioController = require('../../Controller/minioController');
const { verifyToken } = require('../../middlewares/authMiddleware');
const facultyController = require('../../Controller/facultyController');
const contributionController = require('../../Controller/contributionController');
const eventController = require('../../Controller/eventController');
const browserController = require('../../Controller/browserController');
const analyticsController = require('../../Controller/analyticController');
const upload = multer({ storage: multer.memoryStorage() }).any();

router.get("/hello", helloController.hello);

router.post("/login", loginController.login);

// User Management
router.get("/getUsers", verifyToken, userController.get);
router.post("/createUser", userController.createUser);
router.put("/updateUser", verifyToken, userController.update);
router.post('/sendVerificationMail', userController.sendVerificationMail);
router.post('/verifyUser', userController.verifyUser);
router.post('/passwordReset', userController.passwordReset);
router.post('/createRole', verifyToken, userController.createRole);
router.get('/getRoles', verifyToken, userController.getRoles);
router.put('/updateUser', verifyToken, userController.update);
router.delete('/deleteUser', verifyToken, userController.delete);

// Faculty Management
router.get('/getFaculty', facultyController.getFaculty);
router.post('/createFaculty', verifyToken, facultyController.createFaculty);
router.put('/updateFaculty', verifyToken, facultyController.updateFaculty);
router.post('/addStudentToFaculty', verifyToken, facultyController.addStudentToFaculty);
router.post('/addGuestToFaculty', facultyController.addGuestToFaculty);

// Contribution Management
router.post('/addCommentToContribution', verifyToken, contributionController.addCommentToContribution);
router.post('/createStudentContribution', verifyToken, upload, contributionController.createStudentContribution); // include minio
router.put('/updateStudentContribution', verifyToken, upload, contributionController.updateStudentContribution); // include minio
router.get('/getStudentContribution', contributionController.getStudentContribution);
router.put('/updateSubmissionStatus', verifyToken, contributionController.updateSubmissionStatus);

// Event Management
router.get('/getEvent', eventController.getEvent);
router.post('/createEvent', verifyToken, eventController.createEvent);
router.put('/updateEvent', verifyToken, eventController.updateEvent);
router.delete('/deleteEvent', verifyToken, eventController.deleteEvent);

// Analytics Management
router.get('/dashboard-stats', verifyToken, analyticsController.getDashboardStats);
router.get('/getDashboardStatsByUser', verifyToken, analyticsController.getDashboardStatsByUser);

// Browser Tracking Management
router.get('/trackBrowser', browserController.trackBrowser);
router.get('/getBrowserUsages', browserController.getBrowserUsages);

exports.api_router = router;
