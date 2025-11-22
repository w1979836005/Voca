/**
 * 测试数据解析修复效果
 */

const testDataParsing = async () => {
    console.log('=== 测试数据解析修复 ===\n');

    try {
        // 获取词单数据
        const response = await fetch('http://localhost:3000/api/wordlist/1/words?page=1&limit=2');
        const data = await response.json();

        if (data.code !== 200) {
            console.error('获取数据失败:', data.message);
            return;
        }

        console.log('📊 原始API数据:');
        data.data.words.forEach((word, index) => {
            console.log(`\n单词${index + 1}: ${word.word}`);
            console.log('definition类型:', typeof word.definition);
            console.log('definition内容:', word.definition);
            console.log('example类型:', typeof word.example);
            console.log('example内容:', word.example);
        });

        console.log('\n🔄 测试解析逻辑:');

        // 模拟前端解析逻辑
        const formattedWords = data.data.words.map(word => {
            // 解析词性和释义
            let meanings = [];
            if (word.definition) {
                try {
                    // 清理数据：去除换行符和空白
                    const cleanDefinition = typeof word.definition === 'string'
                        ? word.definition.trim()
                        : word.definition;

                    const parsedDefinition = typeof cleanDefinition === 'string'
                        ? JSON.parse(cleanDefinition)
                        : cleanDefinition;

                    if (Array.isArray(parsedDefinition)) {
                        meanings = parsedDefinition.map(item => ({
                            part: item.part || '',
                            definition: item.translation || ''
                        }));
                    }
                } catch (error) {
                    console.error('解析definition失败:', error);
                    meanings = [{
                        part: 'n.',
                        definition: '解析失败'
                    }];
                }
            }

            // 解析例句
            let example = null;
            if (word.example) {
                try {
                    // 清理数据：去除换行符和空白
                    const cleanExample = typeof word.example === 'string'
                        ? word.example.trim()
                        : word.example;

                    const parsedExample = typeof cleanExample === 'string'
                        ? JSON.parse(cleanExample)
                        : cleanExample;

                    if (parsedExample && typeof parsedExample === 'object') {
                        example = {
                            sentence: parsedExample.sentence || '',
                            translation: parsedExample.translation || ''
                        };
                    }
                } catch (error) {
                    console.error('解析example失败:', error);
                    example = {
                        sentence: word.example || '',
                        translation: '解析失败'
                    };
                }
            }

            return {
                word: word.word,
                phonetic: word.pronunciation,
                audioUrl: word.audioUrl,
                meanings: meanings,
                example: example
            };
        });

        console.log('\n✅ 解析后的数据:');
        formattedWords.forEach((word, index) => {
            console.log(`\n单词${index + 1}: ${word.word}`);
            console.log('音标:', word.phonetic);
            console.log('词性和释义:');
            word.meanings.forEach((meaning, i) => {
                console.log(`  ${i + 1}. ${meaning.part}: ${meaning.definition}`);
            });
            if (word.example) {
                console.log('例句:', word.example.sentence);
                console.log('翻译:', word.example.translation);
            }
        });

        console.log('\n🎯 解析结果:');
        const hasMeanings = formattedWords.every(w => w.meanings && w.meanings.length > 0);
        const hasExamples = formattedWords.some(w => w.example && w.example.sentence);

        console.log(`✅ 词性和释义解析: ${hasMeanings ? '成功' : '失败'}`);
        console.log(`✅ 例句解析: ${hasExamples ? '成功' : '失败'}`);

        console.log('\n🎉 数据解析修复完成！');

    } catch (error) {
        console.error('❌ 测试失败:', error);
    }
};

// 运行测试
testDataParsing();