const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Node.js 18+ has built-in fetch, otherwise use node-fetch
let fetch;
try {
    fetch = global.fetch || require('node-fetch');
} catch (e) {
    console.error('需要安装 node-fetch: npm install node-fetch@2');
    process.exit(1);
}

// 模拟测试头像上传功能
async function testAvatarUpload() {
    console.log('🧪 开始测试头像上传功能...\n');

    try {
        // 1. 测试用户登录获取token
        console.log('📝 步骤1: 模拟用户登录...');
        const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'test@example.com',
                password: '123456'
            })
        });

        const loginData = await loginResponse.json();
        console.log('登录响应:', JSON.stringify(loginData, null, 2));

        if (loginData.code !== 200) {
            console.error('❌ 登录失败，无法继续测试');
            return;
        }

        const token = loginData.data.token;
        console.log('✅ 登录成功，获取到token\n');

        // 2. 检查测试图片是否存在
        const testImagePath = path.join(__dirname, 'test-avatar.png');
        if (!fs.existsSync(testImagePath)) {
            console.error('❌ 测试图片不存在:', testImagePath);
            console.log('提示: 请先准备一个名为 test-avatar.png 的图片文件');
            return;
        }

        console.log('📷 步骤2: 准备上传头像...');
        console.log('测试图片路径:', testImagePath);

        // 3. 上传头像
        console.log('\n📤 步骤3: 上传头像到服务器...');

        const form = new FormData();
        form.append('avatar', fs.createReadStream(testImagePath));

        const uploadResponse = await fetch('http://localhost:3000/api/user/avatar', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                ...form.getHeaders()
            },
            body: form
        });

        const uploadData = await uploadResponse.json();
        console.log('上传响应:', JSON.stringify(uploadData, null, 2));

        if (uploadData.code === 200) {
            console.log('✅ 头像上传成功!');
            console.log('头像URL:', uploadData.data.userAvatar);

            // 4. 验证用户信息是否更新
            console.log('\n🔍 步骤4: 验证用户信息...');
            const profileResponse = await fetch('http://localhost:3000/api/user/profile', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const profileData = await profileResponse.json();
            console.log('用户信息:', JSON.stringify(profileData, null, 2));

            if (profileData.data.userAvatar === uploadData.data.userAvatar) {
                console.log('✅ 用户信息更新成功，头像URL已保存');
            } else {
                console.log('❌ 用户信息更新失败，头像URL不匹配');
            }
        } else {
            console.log('❌ 头像上传失败');
        }

        console.log('\n🎉 测试完成!');

    } catch (error) {
        console.error('❌ 测试过程中发生错误:', error.message);
        console.error('错误详情:', error);
    }
}

// 运行测试
testAvatarUpload();