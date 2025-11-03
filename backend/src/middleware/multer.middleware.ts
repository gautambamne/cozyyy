import type { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import ApiError from '../advices/ApiError';

// Configure multer for temporary storage
const storage = multer.memoryStorage();

// Allowed image MIME types
const ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml'
];

// File type validation
const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(null, false); // Don't throw here, let the error middleware handle it
    }
};

// Multer configuration
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max file size
        files: 10 // Max 10 files at once
    }
});

// Custom middleware to handle file upload errors
const handleUploadError = (err: any, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            next(new ApiError(400, 'File size too large. Maximum size is 5MB'));
        } else if (err.code === 'LIMIT_FILE_COUNT') {
            next(new ApiError(400, 'Too many files. Maximum is 10 files'));
        } else {
            next(new ApiError(400, 'File upload error: ' + err.message));
        }
    } else {
        next(err);
    }
};

// Middleware to validate file types after upload
const validateFileTypes = (req: Request, res: Response, next: NextFunction) => {
    const files = req.files as Express.Multer.File[] | undefined;
    const file = req.file as Express.Multer.File | undefined;

    if (files?.length === 0 || (!files && !file)) {
        return next(new ApiError(400, 'No files were uploaded'));
    }

    const uploadedFiles = files || (file ? [file] : []);
    const invalidFile = uploadedFiles.find(file => !ALLOWED_MIME_TYPES.includes(file.mimetype));

    if (invalidFile) {
        return next(
            new ApiError(400, 'Invalid file type. Only .png, .jpg, .jpeg, .gif, .webp and .svg formats are allowed')
        );
    }

    next();
};

// Export combined middleware for single and multiple file uploads
export const uploadSingle = [
    upload.single('image'),
    handleUploadError,
    validateFileTypes
];

export const uploadMultiple = [
    upload.array('images', 10),
    handleUploadError,
    validateFileTypes
];
