/**
 * 测试修复后的词单单词API
 */

const testWordListWordsAPI = async () => {
    try {
        console.log('测试获取词单单词API...')

        // 测试获取词单1中的单词
        const response = await fetch('http://localhost:3000/api/wordlist/1/words?page=1&limit=10')
        const data = await response.json()

        console.log('API响应状态:', response.status)
        console.log('API响应数据:', JSON.stringify(data, null, 2))

        if (data.code === 200) {
            console.log('✓ API调用成功')
            console.log('词单ID:', data.data.wordListId)
            console.log('词单名称:', data.data.wordListName)
            console.log('单词数量:', data.data.words?.length || 0)
            console.log('分页信息:', data.data.pagination)

            if (data.data.words && data.data.words.length > 0) {
                console.log('前3个单词示例:')
                data.data.words.slice(0, 3).forEach((word, index) => {
                    console.log(`${index + 1}. ${word.word} - ${word.pronunciation || 'N/A'} - ${word.definition || 'N/A'}`)
                })
            } else {
                console.log('⚠ 词单中没有单词数据')
            }
        } else {
            console.log('✗ API调用失败:', data.message)
        }

    } catch (error) {
        console.error('✗ API测试失败:', error.message)
    }
}

// 运行测试
testWordListWordsAPI()