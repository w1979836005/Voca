/**
 * API测试脚本
 */

const testBackend = async () => {
  try {
    console.log('测试后端连接...')
    const response = await fetch('http://localhost:3000/api/test-db')
    const data = await response.json()
    console.log('✓ 后端连接成功:', data)
    return true
  } catch (error) {
    console.error('✗ 连接失败:', error.message)
    return false
  }
}

testBackend()
