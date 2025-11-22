/**
 * 测试修复后的验证规则 - 模拟前端发送带 _t 参数的请求
 */

const testWithTimestampParam = async () => {
    try {
        console.log('测试带时间戳参数的API调用...')

        // 模拟前端可能发送的带 _t 参数的请求
        const response = await fetch('http://localhost:3000/api/wordlist/1/words?page=1&limit=10&_t=' + Date.now())
        const data = await response.json()

        console.log('API响应状态:', response.status)

        if (response.status === 200) {
            console.log('✓ 验证规则修复成功，API正常工作')
            console.log('返回单词数量:', data.data.words?.length || 0)
        } else {
            console.log('✗ API调用失败:', data.message)
        }

    } catch (error) {
        console.error('✗ 测试失败:', error.message)
    }
}

// 运行测试
testWithTimestampParam()