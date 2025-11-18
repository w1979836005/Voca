/**
 * MinIO连接测试脚本
 */

const MinioUtil = require('../utils/minioUtil');

async function testMinioConnection() {
    console.log('开始测试MinIO连接...');

    try {
        // 测试初始化存储桶
        console.log('1. 测试存储桶初始化...');
        await MinioUtil.initBucket();

        console.log('2. 测试头像上传功能...');

        // 创建一个测试图片Buffer
        const testImageData = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');

        const uploadResult = await MinioUtil.uploadAvatar(testImageData, 'test.png', 'test-user');
        console.log('上传结果:', uploadResult);

        console.log('3. 测试文件存在检查...');
        const exists = await MinioUtil.fileExists(uploadResult.objectName);
        console.log('文件是否存在:', exists);

        console.log('4. 测试文件信息获取...');
        const fileInfo = await MinioUtil.getFileInfo(uploadResult.objectName);
        console.log('文件信息:', fileInfo);

        console.log('5. 测试头像删除功能...');
        const deleteResult = await MinioUtil.deleteAvatar(uploadResult.objectName);
        console.log('删除结果:', deleteResult);

        console.log('\n✓ 所有MinIO测试通过！');

    } catch (error) {
        console.error('❌ MinIO测试失败:', error.message);
        process.exit(1);
    }
}

// 如果直接运行此文件，则执行测试
if (require.main === module) {
    testMinioConnection();
}

module.exports = testMinioConnection;