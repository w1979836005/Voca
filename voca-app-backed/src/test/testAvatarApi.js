/**
 * 头像上传API测试脚本
 */

const { default: fetch } = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// 模拟测试用户登录和头像上传
async function testAvatarUpload() {
    console.log('开始测试头像上传API...');

    try {
        // 首先模拟用户登录获取token
        const loginData = {
            email: 'test@example.com',
            password: '123456'
        };

        const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
        });

        if (!loginResponse.ok) {
            throw new Error(`登录失败: ${loginResponse.status} ${loginResponse.statusText}`);
        }

        const loginResult = await loginResponse.json();
        const token = loginResult.data.token;
        console.log('✓ 用户登录成功');

        // 测试头像上传
        const form = new FormData();
        const imagePath = path.join(__dirname, '../../test-avatar.png');

        // 添加文件到表单
        form.append('avatar', fs.createReadStream(imagePath), {
            filename: 'test-avatar.png',
            contentType: 'image/png'
        });

        console.log('正在上传头像...');

        const uploadResponse = await fetch('http://localhost:3000/api/user/avatar', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                ...form.getHeaders()
            },
            body: form
        });

        const uploadResult = await uploadResponse.json();

        if (uploadResponse.ok) {
            console.log('✓ 头像上传成功:', uploadResult);

            // 测试获取用户信息，验证头像URL
            const profileResponse = await fetch('http://localhost:3000/api/user/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (profileResponse.ok) {
                const profileResult = await profileResponse.json();
                console.log('✓ 用户信息获取成功，头像URL:', profileResult.data.userAvatar);
            }

            // 测试头像删除
            console.log('正在测试头像删除...');
            const deleteResponse = await fetch('http://localhost:3000/api/user/avatar', {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const deleteResult = await deleteResponse.json();

            if (deleteResponse.ok) {
                console.log('✓ 头像删除成功:', deleteResult);
            } else {
                console.error('❌ 头像删除失败:', deleteResult);
            }

        } else {
            console.error('❌ 头像上传失败:', uploadResult);
        }

        console.log('\n✅ 头像上传API测试完成！');

    } catch (error) {
        console.error('❌ 测试失败:', error.message);
        if (error.stack) {
            console.error('堆栈信息:', error.stack);
        }
    }
}

// 如果直接运行此文件，则执行测试
if (require.main === module) {
    // 检查是否有fetch API（Node.js 18+有内置fetch，否则需要安装node-fetch）
    if (typeof fetch === 'undefined') {
        console.error('需要Node.js 18+或安装node-fetch包');
        console.log('安装命令: npm install node-fetch');
        process.exit(1);
    }

    // 检查FormData
    if (typeof FormData === 'undefined') {
        console.error('需要安装form-data包');
        console.log('安装命令: npm install form-data');
        process.exit(1);
    }

    testAvatarUpload();
}

module.exports = testAvatarUpload;