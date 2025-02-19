const Minio = require('minio');
const multer = require('multer');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Initialize MinIO client
const minioClient = new Minio.Client({
    endPoint: process.env.MINIO_ENDPOINT || 'localhost',
    port: 443,
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY
});

const bucketName = process.env.MINIO_BUCKET_NAME || 'images';

// Configure multer for handling file uploads
const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['.jpg', '.jpeg', '.png', '.heif'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowedTypes.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPG, JPEG, PNG, and HEIF files are allowed.'));
        }
    }
}).any();

// Upload file to MinIO
exports.uploadFile = async (req, res) => {
    try {
        upload(req, res, async (err) => {
            if (err) {
                console.error('Error uploading file:', err);
                return res.status(400).json({ error: err.message });
            }

            if (!req.files || req.files.length === 0) {
                return res.status(400).json({ error: 'No file uploaded' });
            }

            // Get the first file from the array
            const file = req.files[0];

            const fileName = `${Date.now()}-${file.originalname}`;
            const metaData = {
                'Content-Type': file.mimetype,
            };

            // Make bucket if it doesn't exist
            const bucketExists = await minioClient.bucketExists(bucketName);
            if (!bucketExists) {
                await minioClient.makeBucket(bucketName);
            }

            // Upload file
            await minioClient.putObject(
                bucketName,
                fileName,
                file.buffer,
                metaData
            );

            // Generate URL
            const fileUrl = await minioClient.presignedGetObject(bucketName, fileName, 24*60*60);

            if (fileUrl) {
                await prisma.tracking.update({
                    where: {
                        tracking_id: parseInt(req.body.trackingId)
                    },
                    data: {
                        photo_url: fileUrl
                    }
                })
            }

            res.status(200).json({
                message: 'File uploaded successfully',
                fileName: fileName,
                fileUrl: fileUrl
            });
        });
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({ error: 'Error uploading file' });
    }
};

// Get file from MinIO
exports.getFile = async (req, res) => {
    try {
        const { fileName } = req.params;
        const fileUrl = await minioClient.presignedGetObject(bucketName, fileName, 24*60*60);
        res.status(200).json({ fileUrl });
    } catch (error) {
        console.error('Error getting file:', error);
        res.status(500).json({ error: 'Error getting file' });
    }
};

// Delete file from MinIO
exports.deleteFile = async (req, res) => {
    try {
        const { fileName } = req.params;
        await minioClient.removeObject(bucketName, fileName);
        res.status(200).json({ message: 'File deleted successfully' });
    } catch (error) {
        console.error('Error deleting file:', error);
        res.status(500).json({ error: 'Error deleting file' });
    }
};
