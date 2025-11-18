/**
 * MinIO配置文件
 */

module.exports = {
    // MinIO服务器配置
    minio: {
        endPoint: '127.0.0.1',     // MinIO服务器地址
        port: 9090,                // MinIO API端口
        useSSL: false,             // 是否使用SSL
        accessKey: 'root',         // 访问密钥
        secretKey: '12345678',     // 秘密密钥
        bucketName: 'voca',       // 存储桶名称（用户头像）
        avatarFolder: 'avatar',    // 头像文件夹名称
        publicUrl: 'http://127.0.0.1:9090'  // 公共访问URL
    }
};