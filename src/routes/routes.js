const router = require("express").Router();

const helloController = require('../../Controller/helloController');
const userController = require('../../Controller/userController');
const loginController = require('../../Controller/loginController');
const rcController = require('../../Controller/rcController');
const minioController = require('../../Controller/minioController');
const { verifyToken } = require('../../middlewares/authMiddleware');
router.get("/hello", helloController.hello);

router.post("/login", loginController.login);

// User Management
router.get("/getUsers", verifyToken, userController.get);
router.post("/createUser", userController.createUser);
router.put("/updateUser", verifyToken, userController.update);
router.post('/sendVerificationMail', userController.sendVerificationMail);
router.post('/verifyUser', userController.verifyUser);

// RC Controller
router.post("/webhook", rcController.post);
router.post("/rc-login", verifyToken, rcController.rcLogin);
router.post('/createDM', verifyToken, rcController.createDirectMessage);

// Minio Controller
router.post('/upload', verifyToken, minioController.uploadFile);
router.get('/file/:fileName', verifyToken, minioController.getFile);
router.delete('/file/:fileName', verifyToken, minioController.deleteFile);

exports.api_router = router;
