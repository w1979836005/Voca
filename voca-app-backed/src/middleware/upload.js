const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { ValidationException, BusinessException } = require('../exceptions/CustomException');

/**
 * 文件上传中间件配置
 */

// 确保上传目录存在
const ensureUploadDir = (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
};

// 配置存储路径
const uploadDir = path.join(__dirname, '../../uploads');
const avatarDir = path.join(uploadDir, 'avatars');

// 确保目录存在
ensureUploadDir(uploadDir);
ensureUploadDir(avatarDir);

/**
 * 文件过滤器 - 只允许图片文件
 * @param {Object} req - 请求对象
 * @param {Object} file - 文件对象
 * @param {Function} cb - 回调函数
 */
const fileFilter = (req, file, cb) => {
    // 允许的文件类型
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new ValidationException('只允许上传 JPG、PNG、GIF、WebP 格式的图片'), false);
    }
};

/**
 * 自定义文件名生成器
 * @param {Object} req - 请求对象
 * @param {Object} file - 文件对象
 * @param {Function} cb - 回调函数
 */
const fileNameGenerator = (req, file, cb) => {
    // 获取文件扩展名
    const ext = path.extname(file.originalname).toLowerCase();

    // 生成唯一文件名：用户ID_时间戳_UUID.扩展名
    const userId = req.user?.userId || 'unknown';
    const timestamp = Date.now();
    const uuid = uuidv4().substring(0, 8);

    const fileName = `${userId}_${timestamp}_${uuid}${ext}`;

    cb(null, fileName);
};

/**
 * Multer存储配置
 */
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, avatarDir);
    },
    filename: fileNameGenerator
});

/**
 * 内存存储配置（用于文件验证后再保存）
 */
const memoryStorage = multer.memoryStorage();

/**
 * 头像上传中间件
 */
const uploadAvatar = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 2 * 1024 * 1024, // 2MB限制
        files: 1 // 只允许上传一个文件
    }
}).single('avatar');

/**
 * 内存上传中间件（先验证再保存）
 */
const uploadToMemory = multer({
    storage: memoryStorage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 2 * 1024 * 1024, // 2MB限制
        files: 1 // 只允许上传一个文件
    }
}).single('avatar');

/**
 * 文件内容验证中间件
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 下一个中间件
 */
const validateFileContent = (req, res, next) => {
    try {
        if (!req.file) {
            throw new ValidationException('请选择要上传的头像文件');
        }

        const file = req.file;

        // 验证文件头信息，确保文件类型正确
        const buffer = file.buffer;
        const fileSignature = buffer.toString('hex', 0, 8);

        // 常见图片文件的文件头签名
        const imageSignatures = {
            'ffd8ffe0': 'image/jpeg', // JPEG
            'ffd8ffe1': 'image/jpeg', // JPEG
            '89504e47': 'image/png',  // PNG
            '47494638': 'image/gif',  // GIF
            '52494646': 'image/webp' // WebP (RIFF)
        };

        const isValidImage = Object.keys(imageSignatures).some(signature =>
            fileSignature.startsWith(signature)
        );

        if (!isValidImage) {
            throw new ValidationException('上传的文件不是有效的图片格式');
        }

        // 验证文件尺寸（简单的尺寸检查）
        // 这里可以添加更复杂的图片处理逻辑

        next();
    } catch (error) {
        next(error);
    }
};

/**
 * 保存文件到磁盘
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 下一个中间件
 */
const saveFileToDisk = (req, res, next) => {
    try {
        if (!req.file) {
            return next();
        }

        const file = req.file;
        const ext = path.extname(file.originalname).toLowerCase();

        // 生成唯一文件名
        const userId = req.user?.userId || 'unknown';
        const timestamp = Date.now();
        const uuid = uuidv4().substring(0, 8);
        const fileName = `${userId}_${timestamp}_${uuid}${ext}`;

        const filePath = path.join(avatarDir, fileName);

        // 保存文件
        fs.writeFileSync(filePath, file.buffer);

        // 更新文件信息
        req.file.filename = fileName;
        req.file.path = filePath;
        req.file.destination = avatarDir;

        next();
    } catch (error) {
        next(error);
    }
};

/**
 * 获取文件访问URL
 * @param {string} filename - 文件名
 * @returns {string} 文件访问URL
 */
const getFileUrl = (filename) => {
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
    return `${baseUrl}/uploads/avatars/${filename}`;
};

/**
 * 删除旧头像文件
 * @param {string} filename - 文件名
 */
const deleteOldAvatar = (filename) => {
    try {
        if (filename && filename !== 'default-avatar.png') {
            const filePath = path.join(avatarDir, filename);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                console.log(`已删除旧头像: ${filename}`);
            }
        }
    } catch (error) {
        console.error('删除旧头像失败:', error);
    }
};

/**
 * 文件上传错误处理中间件
 * @param {Object} error - 错误对象
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 下一个中间件
 */
const uploadErrorHandler = (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                code: 400,
                message: '文件大小不能超过2MB',
                data: null,
                error: error.message
            });
        }
        if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                code: 400,
                message: '只能上传一个文件',
                data: null,
                error: error.message
            });
        }
        if (error.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
                code: 400,
                message: '上传了未预期的文件字段',
                data: null,
                error: error.message
            });
        }
    }

    next(error);
};

module.exports = {
    uploadAvatar,           // 直接上传到磁盘
    uploadToMemory,         // 先上传到内存进行验证
    validateFileContent,     // 验证文件内容
    saveFileToDisk,         // 保存文件到磁盘
    uploadErrorHandler,      // 错误处理中间件
    getFileUrl,             // 获取文件URL
    deleteOldAvatar,        // 删除旧头像
    avatarDir               // 头像存储目录
};