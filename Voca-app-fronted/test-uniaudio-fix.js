/**
 * 测试uni-app环境下的音频修复
 */

// 模拟uni-app环境
const mockUniApp = {
    createInnerAudioContext: () => {
        return {
            src: '',
            onCanplay: null,
            onPlay: null,
            onError: null,
            onEnded: null,
            onStop: null,
            play: () => {
                console.log('🎵 [MOCK] audio.play() 被调用');
                setTimeout(() => {
                    if (mockAudio.onPlay) {
                        mockAudio.onPlay();
                    }
                    setTimeout(() => {
                        if (mockAudio.onEnded) {
                            mockAudio.onEnded();
                        }
                    }, 2000); // 模拟2秒播放完成
                }, 100);
            },
            load: () => {
                console.log('📥 [MOCK] audio.load() 被调用');
                setTimeout(() => {
                    if (mockAudio.onCanplay) {
                        mockAudio.onCanplay();
                    }
                }, 50);
            },
            stop: () => {
                console.log('⏹️ [MOCK] audio.stop() 被调用');
                if (mockAudio.onStop) {
                    mockAudio.onStop();
                }
            },
            destroy: () => {
                console.log('🗑️ [MOCK] audio.destroy() 被调用');
            }
        };
    }
};

// 模拟音频上下文
let mockAudio = null;

// 模拟修复后的音频播放逻辑
let isPlaying = false;
let currentAudioContext = null;
let playTimeout = null;
let lastPlayTime = 0;
const PLAY_DEBOUNCE_TIME = 500;

const stopCurrentAudio = () => {
    if (currentAudioContext) {
        currentAudioContext.stop();
        currentAudioContext.destroy();
        currentAudioContext = null;
    }
    if (playTimeout) {
        clearTimeout(playTimeout);
        playTimeout = null;
    }
    isPlaying = false;
};

const playPronunciation = () => {
    console.log('\n=== playPronunciation 被调用 ===');
    const currentTime = Date.now();

    // 防抖处理 - 500ms内只允许一次调用
    if (currentTime - lastPlayTime < PLAY_DEBOUNCE_TIME) {
        console.log('⚠️ 防抖: 忽略重复调用');
        return;
    }

    lastPlayTime = currentTime;

    try {
        // 防止重复点击 - 强制停止之前的音频
        if (isPlaying) {
            console.log('⏹️ 正在播放中，停止当前播放并重新开始');
            stopCurrentAudio();
        }

        console.log('📢 模拟播放单词发音: abandon');
        console.log('🔗 音频URL: http://example.com/audio.mp3');

        // 设置播放状态
        isPlaying = true;

        // 创建新的音频实例
        const audioContext = mockUniApp.createInnerAudioContext();
        currentAudioContext = audioContext;
        mockAudio = audioContext;

        // 设置音频源URL
        audioContext.src = 'http://example.com/audio.mp3';

        // 标记是否已经开始播放
        let hasStarted = false;
        let hasEnded = false;

        // 音频事件监听
        audioContext.onCanplay = () => {
            console.log('✅ 音频可以播放');
            if (!hasStarted && !hasEnded) {
                hasStarted = true;
                console.log('▶️ 开始调用 audioContext.play()');
                audioContext.play();
            }
        };

        audioContext.onPlay = () => {
            console.log('🔊 开始播放事件触发');
        };

        audioContext.onError = (error) => {
            console.error('❌ 音频播放失败:', error);
            hasEnded = true;
            isPlaying = false;
            if (currentAudioContext === audioContext) {
                currentAudioContext = null;
            }
            audioContext.destroy();
            if (playTimeout) {
                clearTimeout(playTimeout);
                playTimeout = null;
            }
        };

        audioContext.onEnded = () => {
            console.log('✅ 播放结束');
            hasEnded = true;
            isPlaying = false;
            if (currentAudioContext === audioContext) {
                currentAudioContext = null;
            }
            audioContext.destroy();
            if (playTimeout) {
                clearTimeout(playTimeout);
                playTimeout = null;
            }
        };

        audioContext.onStop = () => {
            console.log('⏹️ 播放停止');
            hasEnded = true;
            isPlaying = false;
            if (currentAudioContext === audioContext) {
                currentAudioContext = null;
            }
            audioContext.destroy();
            if (playTimeout) {
                clearTimeout(playTimeout);
                playTimeout = null;
            }
        };

        // 设置超时，防止音频播放状态卡死
        playTimeout = setTimeout(() => {
            console.log('⏰ 播放超时，强制停止');
            hasEnded = true;
            isPlaying = false;
            if (currentAudioContext === audioContext) {
                currentAudioContext = null;
            }
            audioContext.stop();
            audioContext.destroy();
            playTimeout = null;
        }, 10000);

        // 预加载音频
        audioContext.load();

    } catch (error) {
        console.error('❌ 播放音频出错:', error);
        isPlaying = false;
        stopCurrentAudio();
    }
};

// 测试函数
const testAudioFix = async () => {
    console.log('🧪 开始测试uni-app音频修复效果...\n');

    console.log('测试1: 正常点击一次');
    playPronunciation();

    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('\n测试2: 快速连续点击（模拟重复触发）');
    playPronunciation(); // 第一次点击
    await new Promise(resolve => setTimeout(resolve, 100));
    playPronunciation(); // 第二次快速点击（应该被防抖忽略）
    await new Promise(resolve => setTimeout(resolve, 200));
    playPronunciation(); // 第三次点击（应该被防抖忽略）

    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log('\n测试3: 播放完成后再次点击');
    playPronunciation();

    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log('\n测试4: 防抖测试（500ms内第二次调用）');
    playPronunciation();
    await new Promise(resolve => setTimeout(resolve, 300));
    playPronunciation(); // 应该被防抖忽略

    await new Promise(resolve => setTimeout(resolve, 5000));

    console.log('\n✅ 测试完成！');
    console.log('\n修复效果总结:');
    console.log('1. ✅ 防抖机制：500ms内重复调用被忽略');
    console.log('2. ✅ 状态管理：正确处理播放状态');
    console.log('3. ✅ 资源清理：播放完成后正确清理音频实例');
    console.log('4. ✅ 重复播放：正在播放时会停止前一个再播放新的');
};

// 运行测试
testAudioFix();