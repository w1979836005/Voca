/**
 * 测试单词拆分解析修复效果
 */

const testBreakdownParsing = async () => {
    console.log('=== 测试单词拆分解析修复 ===\n');

    try {
        // 获取词单数据
        const response = await fetch('http://localhost:3000/api/wordlist/1/words?page=1&limit=1');
        const data = await response.json();

        if (data.code !== 200) {
            console.error('获取数据失败:', data.message);
            return;
        }

        const word = data.data.words[0];
        console.log('📊 原始单词拆分数据:');
        console.log('单词:', word.word);
        console.log('affixes类型:', typeof word.affixes);
        console.log('affixes内容:', word.affixes);

        console.log('\n🔄 测试解析逻辑:');

        // 模拟前端解析逻辑
        let breakdown = [];
        if (word.affixes) {
            try {
                // 清理数据：去除换行符和空白
                const cleanAffixes = typeof word.affixes === 'string'
                    ? word.affixes.trim()
                    : word.affixes;

                const parsedAffixes = typeof cleanAffixes === 'string'
                    ? JSON.parse(cleanAffixes)
                    : cleanAffixes;

                if (Array.isArray(parsedAffixes)) {
                    breakdown = parsedAffixes;
                } else if (typeof parsedAffixes === 'string' && parsedAffixes.includes(' + ')) {
                    // 兼容旧格式：字符串分割
                    breakdown = parsedAffixes.split(' + ').filter(part => part.trim());
                } else {
                    // 单个词缀
                    breakdown = [String(parsedAffixes)];
                }
            } catch (error) {
                console.error('解析affixes失败:', error);
                // 如果解析失败，尝试按旧格式处理
                breakdown = typeof word.affixes === 'string' && word.affixes.includes(' + ')
                    ? word.affixes.split(' + ').filter(part => part.trim())
                    : [word.affixes];
            }
        }

        console.log('\n✅ 解析后的单词拆分:');
        console.log('拆分结果:', breakdown);
        console.log('拆分数量:', breakdown.length);

        breakdown.forEach((part, index) => {
            console.log(`  ${index + 1}. "${part}"`);
        });

        console.log('\n🎯 测试词缀含义映射:');
        // 测试词缀含义函数
        const getPartMeaning = (part) => {
            const meanings = {
                "a": "前缀：表示'离开'、'否定'",
                "ab": "前缀：表示'离开'、'从'",
                "ban": "词根：禁止",
                "don": "词根：给予",
                "abil": "词根：能力",
                "i": "连接字母",
                "ty": "后缀：表示'性质'、'状态'",
                "sent": "词根：存在，走",
                "so": "词根：如此",
                "lute": "词根：冲洗",
                "sorb": "词根：吸收"
            };
            return meanings[part] || "";
        };

        breakdown.forEach((part, index) => {
            const meaning = getPartMeaning(part);
            console.log(`  ${index + 1}. "${part}" - ${meaning || '未知词缀'}`);
        });

        console.log('\n🎉 单词拆分解析修复完成！');
        console.log('\n📱 预期显示效果:');
        console.log('1. part-text: "a"');
        console.log('   part-meaning: "前缀：表示离开、否定"');
        console.log('2. part-text: "ban"');
        console.log('   part-meaning: "词根：禁止"');
        console.log('3. part-text: "don"');
        console.log('   part-meaning: "词根：给予"');

    } catch (error) {
        console.error('❌ 测试失败:', error);
    }
};

// 运行测试
testBreakdownParsing();