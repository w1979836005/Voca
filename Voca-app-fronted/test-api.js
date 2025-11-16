// 测试API响应格式
import request from './utils/request.js';

async function testAPI() {
    try {
        console.log('测试登录API...');

        const loginRes = await request.post('/auth/login', {
            email: 'test@example.com',
            password: '123456'
        });

        console.log('登录响应:', loginRes);

        if (loginRes.code === 200) {
            console.log('登录成功，用户:', loginRes.data.username);

            console.log('测试获取用户信息API...');
            const profileRes = await request.get('/user/profile');
            console.log('用户信息响应:', profileRes);

            if (profileRes.code === 200) {
                console.log('获取用户信息成功:', profileRes.data.username);
            } else {
                console.log('获取用户信息失败:', profileRes.message);
            }
        } else {
            console.log('登录失败:', loginRes.message);
        }
    } catch (error) {
        console.error('测试失败:', error);
    }
}

// testAPI();