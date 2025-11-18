/**
 * MinIO对象存储工具类
 * 用于处理文件上传、下载、删除等操作
 */

const minioConfig = require('../config/minio');
const { Client } = require('minio');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

/**
 * MinIO工具类
 */
class MinioUtil {
    constructor() {
        // 创建MinIO客户端
        this.client = new Client({
            endPoint: minioConfig.minio.endPoint,
            port: minioConfig.minio.port,
            useSSL: minioConfig.minio.useSSL,
            accessKey: minioConfig.minio.accessKey,
            secretKey: minioConfig.minio.secretKey
        });

        this.bucketName = minioConfig.minio.bucketName;
        this.avatarFolder = minioConfig.minio.avatarFolder;
        this.publicUrl = minioConfig.minio.publicUrl;
    }

    /**
     * 初始化存储桶
     * @returns {Promise<void>}
     */
    async initBucket() {
        try {
            // 检查存储桶是否存在
            const bucketExists = await this.client.bucketExists(this.bucketName);

            if (!bucketExists) {
                // 创建存储桶
                await this.client.makeBucket(this.bucketName);
                console.log(`✓ 存储桶 ${this.bucketName} 创建成功`);

                // 设置存储桶策略为公共读取
                const policy = {
                    Version: '2012-10-17',
                    Statement: [
                        {
                            Effect: 'Allow',
                            Principal: { AWS: ['*'] },
                            Action: ['s3:GetObject'],
                            Resource: [`arn:aws:s3:::${this.bucketName}/*`]
                        }
                    ]
                };

                await this.client.setBucketPolicy(this.bucketName, JSON.stringify(policy));
                console.log(`✓ 存储桶 ${this.bucketName} 公共读取策略设置成功`);
            } else {
                console.log(`✓ 存储桶 ${this.bucketName} 已存在`);
            }
        } catch (error) {
            console.error('初始化MinIO存储桶失败:', error);
            throw error;
        }
    }

    /**
     * 生成唯一文件名
     * @param {string} originalName 原始文件名
     * @param {string} prefix 文件前缀
     * @returns {string} 唯一文件名
     */
    generateUniqueFileName(originalName, prefix = '') {
        const ext = path.extname(originalName);
        const timestamp = Date.now();
        const randomStr = crypto.randomBytes(8).toString('hex');
        const cleanPrefix = prefix ? prefix + '/' : '';

        return `${cleanPrefix}${timestamp}_${randomStr}${ext}`;
    }

    /**
     * 验证文件类型
     * @param {string} mimeType 文件MIME类型
     * @param {Array} allowedTypes 允许的文件类型
     * @returns {boolean} 是否为允许的类型
     */
    validateFileType(mimeType, allowedTypes) {
        return allowedTypes.includes(mimeType);
    }

    /**
     * 验证文件大小
     * @param {number} fileSize 文件大小（字节）
     * @param {number} maxSize 最大允许大小（字节）
     * @returns {boolean} 是否在允许范围内
     */
    validateFileSize(fileSize, maxSize) {
        return fileSize <= maxSize;
    }

    /**
     * 上传文件到MinIO
     * @param {Buffer|string} fileData 文件数据（Buffer或文件路径）
     * @param {string} fileName 文件名
     * @param {string} mimeType 文件MIME类型
     * @returns {Promise<Object>} 上传结果
     */
    async uploadFile(fileData, fileName, mimeType) {
        try {
            const objectName = fileName;

            // 上传文件
            await this.client.putObject(this.bucketName, objectName, fileData, undefined, {
                'Content-Type': mimeType
            });

            // 生成公共访问URL
            const publicUrl = `${this.publicUrl}/${this.bucketName}/${objectName}`;

            return {
                success: true,
                objectName: objectName,
                publicUrl: publicUrl,
                message: '文件上传成功'
            };
        } catch (error) {
            console.error('文件上传失败:', error);
            throw new Error(`文件上传失败: ${error.message}`);
        }
    }

    /**
     * 上传头像
     * @param {Buffer|Stream} fileData 头像数据（Buffer或Stream）
     * @param {string} originalName 原始文件名
     * @param {string} userId 用户ID
     * @returns {Promise<Object>} 上传结果
     */
    async uploadAvatar(fileData, originalName, userId) {
        try {
            // 验证文件类型（只允许图片格式）
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            let mimeType;

            // 根据文件扩展名判断MIME类型
            const ext = path.extname(originalName).toLowerCase();
            switch (ext) {
                case '.jpg':
                case '.jpeg':
                    mimeType = 'image/jpeg';
                    break;
                case '.png':
                    mimeType = 'image/png';
                    break;
                case '.gif':
                    mimeType = 'image/gif';
                    break;
                case '.webp':
                    mimeType = 'image/webp';
                    break;
                default:
                    throw new Error('不支持的图片格式，仅支持 JPEG、PNG、GIF、WebP');
            }

            if (!this.validateFileType(mimeType, allowedTypes)) {
                throw new Error('不支持的图片格式，仅支持 JPEG、PNG、GIF、WebP');
            }

            // 获取文件大小（如果是Buffer直接获取，如果是Stream则跳过大小验证）
            let fileSize;
            if (Buffer.isBuffer(fileData)) {
                fileSize = fileData.length;
                const maxSize = 5 * 1024 * 1024; // 5MB
                if (!this.validateFileSize(fileSize, maxSize)) {
                    throw new Error('头像文件大小不能超过5MB');
                }
            }

            // 生成唯一文件名
            const uniqueFileName = this.generateUniqueFileName(originalName, this.avatarFolder);

            // 上传文件
            const result = await this.uploadFile(fileData, uniqueFileName, mimeType);

            return {
                ...result,
                fileSize: fileSize,
                mimeType: mimeType
            };

        } catch (error) {
            console.error('头像上传失败:', error);
            throw error;
        }
    }

    /**
     * 删除文件
     * @param {string} objectName 对象名称
     * @returns {Promise<boolean>} 删除结果
     */
    async deleteFile(objectName) {
        try {
            await this.client.removeObject(this.bucketName, objectName);
            console.log(`✓ 文件 ${objectName} 删除成功`);
            return true;
        } catch (error) {
            console.error('文件删除失败:', error);
            return false;
        }
    }

    /**
     * 删除用户头像
     * @param {string} avatarUrl 头像URL或对象名称
     * @returns {Promise<boolean>} 删除结果
     */
    async deleteAvatar(avatarUrl) {
        try {
            let objectName;

            // 如果传入的是完整URL，提取对象名称
            if (avatarUrl.startsWith('http')) {
                const urlParts = avatarUrl.split('/');
                objectName = urlParts.slice(4).join('/'); // 跳过协议和域名
            } else {
                objectName = avatarUrl;
            }

            return await this.deleteFile(objectName);
        } catch (error) {
            console.error('删除头像失败:', error);
            return false;
        }
    }

    /**
     * 检查文件是否存在
     * @param {string} objectName 对象名称
     * @returns {Promise<boolean>} 文件是否存在
     */
    async fileExists(objectName) {
        try {
            await this.client.statObject(this.bucketName, objectName);
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * 获取文件信息
     * @param {string} objectName 对象名称
     * @returns {Promise<Object|null>} 文件信息
     */
    async getFileInfo(objectName) {
        try {
            const stat = await this.client.statObject(this.bucketName, objectName);
            return {
                size: stat.size,
                lastModified: stat.lastModified,
                contentType: stat.contentType,
                etag: stat.etag
            };
        } catch (error) {
            console.error('获取文件信息失败:', error);
            return null;
        }
    }
}

// 创建单例实例
const minioUtil = new MinioUtil();

// 初始化存储桶
minioUtil.initBucket().catch(console.error);

module.exports = minioUtil;