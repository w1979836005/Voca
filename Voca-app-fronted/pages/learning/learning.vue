<template>
	<view class="learning-container">
		<!-- 顶部导航区域 -->
		<view class="top-nav-area">
			<!-- 返回按钮 -->
			<wd-icon name="arrow-left" size="24" color="#000000" @click="goBack"></wd-icon>

			<!-- 分组按钮 -->
			<wd-icon name="list" size="24" color="#000000" @click="showGroupSelector"></wd-icon>
		</view>

		<!-- 顶部进度区域 -->
		<view class="progress-section">
			<!-- 词单信息 -->
			<view class="wordlist-info">
				<text class="wordlist-name">{{ getCurrentWordlistInfo.name }}</text>
				<text class="wordlist-range">{{ getCurrentWordlistInfo.currentRange }}</text>
			</view>

			<!-- 进度数量显示 -->
			<view class="progress-count">
				<text class="current-progress">{{ currentWordIndex + 1 }}</text>
				<text class="separator">/</text>
				<text class="total-words">{{ totalWords }}</text>
			</view>

			<!-- 进度条 -->
			<view class="progress-bar">
				<view
					class="progress-fill"
					:style="{ width: progressPercentage + '%' }"
				></view>
			</view>
		</view>

		<!-- 加载状态 -->
		<view v-if="loading" class="loading-container">
			<view class="loading-content">
				<wd-loading type="spinner" size="48" color="#000000" />
				<text class="loading-text">正在加载单词数据...</text>
			</view>
		</view>

		<!-- 空数据状态 -->
		<view v-else-if="!loading && currentWordListWords.length === 0" class="empty-container">
			<view class="empty-content">
				<wd-icon name="frown" size="48" color="#cccccc" />
				<text class="empty-text">暂无单词数据</text>
				<text class="empty-desc">该词单中还没有添加单词</text>
			</view>
		</view>

		<!-- 单词学习卡片 -->
		<view v-else class="word-card">
			<!-- 单词卡片头部 -->
			<view class="card-header">
				<text class="word-text">{{ currentWord.word }}</text>
				<view
					class="pronunciation-btn"
					:class="{ 'playing': isPlaying }"
					@click="playPronunciation"
					@touchend.stop.prevent="playPronunciation"
				>
					<wd-icon :name="isPlaying ? 'loading' : 'sound'" size="24" color="#000000"></wd-icon>
				</view>
			</view>

			<!-- 音标显示 -->
			<view class="phonetic-section">
				<text class="phonetic-text">{{ currentWord.phonetic }}</text>
			</view>

			<!-- 单词拆分显示 -->
			<view class="word-breakdown">
				<view class="breakdown-item" v-for="(part, index) in currentWord.breakdown" :key="index">
					<text class="part-text">{{ part }}</text>
					<text class="part-meaning">{{ getPartMeaning(part) }}</text>
				</view>
			</view>

			<!-- 词性和释义 -->
			<view class="word-meaning">
				<view class="meaning-item" v-for="(meaning, index) in currentWord.meanings" :key="index">
					<text class="part-of-speech">{{ meaning.part }}</text>
					<text class="definition">{{ meaning.definition }}</text>
				</view>
			</view>

			<!-- 例句 -->
			<view class="example-section" v-if="currentWord.example">
				<text class="example-label">例句</text>
				<text class="example-text">{{ currentWord.example.sentence }}</text>
				<text class="example-translation">{{ currentWord.example.translation }}</text>
			</view>
		</view>

		<!-- 底部按钮区域 -->
		<view class="button-section">
			<wd-button
				class="nav-button prev-button"
				:disabled="currentWordIndex === 0"
				@click="previousWord"
			>
				<wd-icon name="arrow-left" size="20"></wd-icon>
				上一个
			</wd-button>

			<wd-button
				type="primary"
				class="nav-button next-button"
				:disabled="currentWordIndex === totalWords - 1"
				@click="nextWord"
			>
				下一个
				<wd-icon name="arrow-right" size="20"></wd-icon>
			</wd-button>
		</view>

		<!-- 完成学习提示 -->
		<view class="completion-modal" v-if="showCompletionModal">
			<view class="modal-content">
				<view class="completion-header">
					<wd-icon name="check-circle" size="48" color="#000000"></wd-icon>
					<text class="completion-title">学习完成！</text>
				</view>
				<text class="completion-message">恭喜你完成了今日的学习任务</text>
				<view class="completion-stats">
					<text class="stats-text">共学习了 {{ totalWords }} 个单词</text>
				</view>
				<wd-button type="primary" class="completion-btn" @click="backToHome">
					返回首页
				</wd-button>
			</view>
		</view>

		<!-- 分组选择弹窗 -->
		<wd-popup v-model="showGroupModal" position="bottom" custom-style="border-radius: 24rpx 24rpx 0 0;">
			<view class="group-selector">
				<view class="selector-header">
					<text class="selector-title">选择单词分组</text>
					<wd-icon name="cross" size="24" color="#666666" @click="showGroupModal = false"></wd-icon>
				</view>
				<view class="group-list">
					<view
						class="group-item"
						v-for="(group, index) in wordGroups"
						:key="index"
						:class="{ 'group-active': currentGroupId === group.id }"
						@click="selectGroup(group)"
					>
						<view class="group-info">
							<text class="group-name">{{ group.name }}（{{ group.wordRange }}）</text>
							<text class="group-count">{{ group.completedCount }}/{{ group.wordCount }} 已完成</text>
						</view>
						<view class="group-progress">
							<text class="progress-text">{{ group.completedCount }}/{{ group.wordCount }}</text>
							<view class="progress-bar-small">
								<view
									class="progress-fill-small"
									:style="{ width: (group.completedCount / group.wordCount * 100) + '%' }"
								></view>
							</view>
						</view>
						<wd-icon v-if="currentGroupId === group.id" name="check" size="20" color="#000000"></wd-icon>
					</view>
				</view>
			</view>
		</wd-popup>
	</view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { wordlistAPI } from '@/api/wordlist.js'

// 接收路由参数
const props = defineProps({
	type: {
		type: String,
		default: 'new' // 'new' 或 'review'
	}
})

// 学习数据
const currentWordIndex = ref(0)
const showCompletionModal = ref(false)

// 音频播放状态
const isPlaying = ref(false)

// 分组相关数据
const showGroupModal = ref(false)
const currentGroupId = ref(1) // 当前分组索引
const wordsPerGroup = 10 // 每组单词数量
const currentWordlistName = ref('CET-4核心词汇') // 当前词单名称
const currentWordlistId = ref(1) // 当前词单ID

// 存储来源页面信息
const fromPage = ref('home') // 默认从首页进入

// 词单和单词数据
const completeWordList = ref([]) // 完整词单数据
const currentWordListWords = ref([]) // 当前词单的单词数据
const loading = ref(false) // 加载状态

// 计算分组数据
const wordGroups = computed(() => {
	const totalWords = completeWordList.value.length

	// 如果词单为空，返回空分组
	if (totalWords === 0) {
		return []
	}

	const totalGroups = Math.ceil(totalWords / wordsPerGroup)

	const groups = []
	for (let i = 1; i <= totalGroups; i++) {
		const startWord = (i - 1) * wordsPerGroup + 1
		const endWord = Math.min(i * wordsPerGroup, totalWords)
		const completedCount = Math.floor(Math.random() * (endWord - startWord + 1)) // 模拟已完成的单词数

		groups.push({
			id: i,
			name: `第${i}组`,
			wordRange: `${startWord}-${endWord}`,
			wordCount: endWord - startWord + 1,
			completedCount: i < currentGroupId.value ? wordsPerGroup : (i === currentGroupId.value ? currentWordIndex.value : 0),
			totalWordCount: totalWords
		})
	}

	// 只显示当前组附近的一些组，避免显示太多
	const displayRange = 20
	const startIndex = Math.max(1, currentGroupId.value - Math.floor(displayRange / 2))
	const endIndex = Math.min(totalGroups, currentGroupId.value + Math.floor(displayRange / 2))

	return groups.slice(startIndex - 1, endIndex)
})

// 获取词单中的单词数据
const fetchWordListWords = async (wordListId: number) => {
	try {
		loading.value = true
		const response = await wordlistAPI.getWordsInWordlist(wordListId, {
			page: 1,
			limit: 100 // 限制为100以符合后端验证规则
		})

		if (response.code === 200) {
			console.log('API响应数据:', response) // 调试输出
			const data = response.data
			currentWordlistName.value = data.wordListName
			console.log('词单名称:', data.wordListName)
			console.log('原始单词数据:', data.words)

			// 检查是否有单词数据
			if (!data.words || data.words.length === 0) {
				console.warn('词单中没有单词数据')
				// 不加载模拟数据，保持空状态显示
				completeWordList.value = []
				currentWordListWords.value = []
				return
			}

			// 转换数据格式以适配前端显示
			const formattedWords = data.words.map(word => {
				console.log('处理单词:', word)

				// 解析词性和释义（JSON字符串 -> 数组）
				let meanings = []
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
							}))
						}
					} catch (error) {
						console.error('解析definition失败:', error)
						// 如果解析失败，创建默认格式
						meanings = [{
							part: getPartOfSpeech(word.definition),
							definition: cleanDefinition(word.definition)
						}]
					}
				}

				// 解析例句（JSON字符串 -> 对象）
				let example = null
				if (word.example || word.exampleSentence) {
					try {
						const exampleData = word.example || word.exampleSentence;
						// 清理数据：去除换行符和空白
						const cleanExample = typeof exampleData === 'string'
							? exampleData.trim()
							: exampleData;

						const parsedExample = typeof cleanExample === 'string'
							? JSON.parse(cleanExample)
							: cleanExample;

						if (parsedExample && typeof parsedExample === 'object') {
							example = {
								sentence: parsedExample.sentence || '',
								translation: parsedExample.translation || ''
							}
						}
					} catch (error) {
						console.error('解析example失败:', error)
						// 如果解析失败，创建默认格式
						example = {
							sentence: word.example || word.exampleSentence || '',
							translation: getTranslation(word.example || word.exampleSentence)
						}
					}
				}

				// 解析单词拆分（affixes JSON字符串 -> 数组）
				let breakdown = []
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
							breakdown = parsedAffixes
						} else if (typeof parsedAffixes === 'string' && parsedAffixes.includes(' + ')) {
							// 兼容旧格式：字符串分割
							breakdown = parsedAffixes.split(' + ').filter(part => part.trim())
						} else {
							// 单个词缀
							breakdown = [String(parsedAffixes)]
						}
					} catch (error) {
						console.error('解析affixes失败:', error)
						// 如果解析失败，尝试按旧格式处理
						breakdown = typeof word.affixes === 'string' && word.affixes.includes(' + ')
							? word.affixes.split(' + ').filter(part => part.trim())
							: [word.affixes]
					}
				}

				return {
					word: word.word,
					phonetic: word.pronunciation || word.phonetic,
					audioUrl: word.audioUrl,
					breakdown: breakdown,
					meanings: meanings,
					example: example
				}
			})

			console.log('格式化后的单词数据:', formattedWords)
			completeWordList.value = formattedWords
			console.log('完整词单数据:', completeWordList.value)

			// 初始化当前分组的单词
			loadWordsForGroup(currentGroupId.value)
		}
	} catch (error) {
		console.error('获取词单单词失败:', error)
		uni.showToast({
			title: '加载失败，请重试',
			icon: 'none'
		})
		// 如果API失败，不加载模拟数据，保持空状态
		completeWordList.value = []
		currentWordListWords.value = []
	} finally {
		loading.value = false
	}
}

// 获取词性
const getPartOfSpeech = (definition: string) => {
	if (definition.startsWith('v.') || definition.startsWith('verb')) return 'v.'
	if (definition.startsWith('n.') || definition.startsWith('noun')) return 'n.'
	if (definition.startsWith('adj.') || definition.startsWith('adjective')) return 'adj.'
	if (definition.startsWith('adv.') || definition.startsWith('adverb')) return 'adv.'
	return 'n.'
}

// 清理定义
const cleanDefinition = (definition: string) => {
	return definition.replace(/^(v\.|n\.|adj\.|adv\.)\s*/, '')
}

// 获取翻译
const getTranslation = (sentence: string) => {
	// 这里是简单的翻译逻辑，实际项目可能需要调用翻译API
	return '翻译示例：' + sentence
}

// 备用模拟数据（已停用 - 空词单应显示空状态）
const loadMockData = (wordlistName?: string) => {
	console.warn('loadMockData已被停用，词单为空时应显示空状态')
	// 不加载模拟数据，保持空状态显示
	completeWordList.value = []
	currentWordListWords.value = []
}

// 计算属性
const totalWords = computed(() => currentWordListWords.value.length)
const currentWord = computed(() => currentWordListWords.value[currentWordIndex.value])
const progressPercentage = computed(() => ((currentWordIndex.value + 1) / totalWords.value) * 100)


// 返回上一页
const goBack = () => {
	// 根据来源页面决定返回逻辑
	if (fromPage.value === 'home') {
		uni.switchTab({
			url: '/pages/home/home'
		})
	} else {
		uni.navigateBack({
			delta: 1
		})
	}
}

// 显示分组选择器
const showGroupSelector = () => {
	showGroupModal.value = true
}

// 选择分组
const selectGroup = (group: any) => {
	if (currentGroupId.value !== group.id) {
		currentGroupId.value = group.id
		currentWordIndex.value = 0

		// 根据选择的分组加载对应的单词数据
		loadWordsForGroup(group.id)

		uni.showToast({
			title: `已切换到${group.name}（${group.wordRange}）`,
			icon: 'success'
		})
	}

	showGroupModal.value = false
}

// 根据分组加载单词数据
const loadWordsForGroup = (groupId: number) => {
	const startIndex = (groupId - 1) * wordsPerGroup
	const endIndex = Math.min(startIndex + wordsPerGroup, completeWordList.value.length)

	// 从完整词单数据中获取当前分组的单词
	const groupWords = completeWordList.value.slice(startIndex, endIndex)

	// 更新当前分组的单词数据
	currentWordListWords.value = groupWords
	currentWordIndex.value = 0 // 重置到第一个单词
}

// 获取当前词单信息
const getCurrentWordlistInfo = computed(() => {
	const totalWords = completeWordList.value.length

	// 如果词单为空，返回空状态信息
	if (totalWords === 0) {
		return {
			name: currentWordlistName.value,
			totalWords: 0,
			currentRange: '暂无单词'
		}
	}

	const currentStartWord = (currentGroupId.value - 1) * wordsPerGroup + 1
	const currentEndWord = Math.min(currentGroupId.value * wordsPerGroup, totalWords)

	return {
		name: currentWordlistName.value,
		totalWords,
		currentRange: `${currentStartWord}-${currentEndWord}`
	}
})

// 获取单词拆分部分的含义
const getPartMeaning = (part: string) => {
	const meanings: Record<string, string> = {
		"a": "前缀：表示'离开'、'否定'",
		"ab": "前缀：表示'离开'、'从'",
		"ban": "词根：禁止",
		"don": "词根：给予",
		"bil": "词根：能力",
		"i": "连接字母",
		"ty": "后缀：表示'性质'、'状态'",
		"sent": "词根：存在，走",
		"so": "词根：如此",
		"lute": "词根：冲洗",
		"sorb": "词根：吸收"
	}
	return meanings[part] || ""
}

// 音频播放状态管理
let currentAudioContext = null
let playTimeout = null
let lastPlayTime = 0
const PLAY_DEBOUNCE_TIME = 500 // 500ms防抖

// 停止当前播放
const stopCurrentAudio = () => {
	if (currentAudioContext) {
		try {
			currentAudioContext.stop()
			currentAudioContext.destroy()
		} catch (error) {
			console.warn('停止音频时出错:', error)
		}
		currentAudioContext = null
	}
	if (playTimeout) {
		clearTimeout(playTimeout)
		playTimeout = null
	}
	isPlaying.value = false
}

// 播放发音
const playPronunciation = () => {
	console.log('=== playPronunciation 被调用 ===')

	const currentTime = Date.now()

	// 防抖处理 - 500ms内只允许一次调用
	if (currentTime - lastPlayTime < PLAY_DEBOUNCE_TIME) {
		console.log('防抖: 忽略重复调用')
		return
	}

	lastPlayTime = currentTime

	try {
		// 防止重复点击 - 强制停止之前的音频
		if (isPlaying.value) {
			console.log('正在播放中，停止当前播放并重新开始')
			stopCurrentAudio()
		}

		const word = currentWord.value
		console.log('播放单词发音:', word.word)
		console.log('音频URL:', word.audioUrl)

		// 检查是否有音频URL
		if (!word.audioUrl || word.audioUrl.trim() === '') {
			console.log('无音频URL，使用TTS')
			useTextToSpeech(word.word)
			return
		}

		// 停止之前的音频（如果存在）
		stopCurrentAudio()

		// 设置播放状态
		isPlaying.value = true

		// 创建新的音频实例
		const audioContext = uni.createInnerAudioContext()
		currentAudioContext = audioContext

		// 设置音频源URL
		audioContext.src = word.audioUrl

		// 标记是否已经开始播放
		let hasStarted = false
		let hasEnded = false
		let hasPlayed = false // 防止重复播放

		// 尝试立即播放
		const tryPlay = () => {
			if (!hasPlayed && !hasEnded) {
				hasPlayed = true
				hasStarted = true
				console.log('尝试播放音频')
				audioContext.play()
			}
		}

		// 音频事件监听
		audioContext.onCanplay(() => {
			console.log('音频可以播放')
			tryPlay()
		})

		// 同时监听 loadeddata 事件，通常会更快触发
		audioContext.onLoadeddata = () => {
			console.log('音频数据已加载')
			tryPlay()
		}

		// 设置一个较短的超时时间来尝试播放
		const playTimeout2 = setTimeout(() => {
			if (!hasPlayed && !hasEnded) {
				console.log('超时尝试播放')
				tryPlay()
			}
		}, 200) // 200ms后尝试播放

		audioContext.onPlay(() => {
			console.log('开始播放事件触发')
			// 移除轻提示，用户可以通过视觉反馈知道正在播放
		})

		audioContext.onError((error) => {
			console.error('音频播放失败:', error)
			hasEnded = true
			// 重置播放状态
			isPlaying.value = false
			// 清理
			if (currentAudioContext === audioContext) {
				currentAudioContext = null
			}
			audioContext.destroy()
			if (playTimeout) {
				clearTimeout(playTimeout)
				playTimeout = null
			}
			// 清理播放超时
			clearTimeout(playTimeout2)
			// 如果音频URL失败，尝试使用TTS
			useTextToSpeech(word.word)
		})

		audioContext.onEnded(() => {
			console.log('播放结束')
			hasEnded = true
			// 重置播放状态
			isPlaying.value = false
			// 清理
			if (currentAudioContext === audioContext) {
				currentAudioContext = null
			}
			audioContext.destroy()
			if (playTimeout) {
				clearTimeout(playTimeout)
				playTimeout = null
			}
			clearTimeout(playTimeout2)
		})

		audioContext.onStop(() => {
			console.log('播放停止')
			hasEnded = true
			// 重置播放状态
			isPlaying.value = false
			// 清理
			if (currentAudioContext === audioContext) {
				currentAudioContext = null
			}
			audioContext.destroy()
			if (playTimeout) {
				clearTimeout(playTimeout)
				playTimeout = null
			}
			clearTimeout(playTimeout2)
		})

		// 设置超时，防止音频播放状态卡死
		playTimeout = setTimeout(() => {
			console.log('播放超时，强制停止')
			hasEnded = true
			isPlaying.value = false
			if (currentAudioContext === audioContext) {
				currentAudioContext = null
			}
			audioContext.stop()
			audioContext.destroy()
			playTimeout = null
			clearTimeout(playTimeout2)
		}, 10000) // 10秒超时

		// 预加载音频
		audioContext.load()

	} catch (error) {
		console.error('播放音频出错:', error)
		// 重置播放状态
		isPlaying.value = false
		// 清理
		stopCurrentAudio()
		// 降级到TTS
		useTextToSpeech(currentWord.value.word)
	}
}

// 文字转语音（降级方案）
const useTextToSpeech = (text) => {
	console.log('使用TTS播放:', text)
	// #ifdef H5
	// H5环境使用Web Speech API
	if ('speechSynthesis' in window) {
		const utterance = new SpeechSynthesisUtterance(text)
		utterance.lang = 'en-US'
		utterance.rate = 0.8
		window.speechSynthesis.speak(utterance)
	}
	// #endif

	// #ifdef MP-WEIXIN
	// 微信小程序环境使用TTS插件
	console.log('微信小程序环境，暂无TTS支持')
	// #endif

	// #ifdef APP-PLUS
	// APP环境使用原生TTS
	try {
		plus.speech.startSpeaking({
			content: text,
			lang: 'en-us',
			corpus: 'tts'
		})
	} catch (error) {
		console.error('TTS失败:', error)
	}
	// #endif
}

// 上一个单词
const previousWord = () => {
	if (currentWordIndex.value > 0) {
		currentWordIndex.value--
	}
}

// 下一个单词
const nextWord = () => {
	if (currentWordIndex.value < totalWords.value - 1) {
		currentWordIndex.value++
	} else {
		// 学习完成
		showCompletionModal.value = true
	}
}

// 返回首页
const backToHome = () => {
	uni.switchTab({
		url: '/pages/home/home'
	})
}

// 页面加载时初始化
onMounted(() => {
	// 获取来源页面信息
	const pages = getCurrentPages()
	if (pages.length > 1) {
		const prevPage = pages[pages.length - 2]
		const prevPageRoute = prevPage.route

		// 判断是否从tabbar页面进入
		if (prevPageRoute === 'pages/home/home' ||
			prevPageRoute === 'pages/wordlist/wordlist' ||
			prevPageRoute === 'pages/profile/profile') {
			fromPage.value = 'home'
		} else {
			fromPage.value = 'other'
		}
	}

	// 从URL参数获取词单ID，如果没有则使用默认值
	const currentPages = getCurrentPages()
	const currentPage = currentPages[currentPages.length - 1]
	const options = currentPage.options || {}

	// 如果URL参数中有wordListId，使用该ID，否则使用默认ID
	if (options.wordListId) {
		currentWordlistId.value = parseInt(options.wordListId)
	}

	// 获取词单单词数据
	fetchWordListWords(currentWordlistId.value)

	// 根据type参数加载不同的单词数据
	if (props.type === 'review') {
		// 这里可以加载复习单词数据，切换到对应的复习分组
		// currentGroupId.value = getReviewGroupId()
		// loadWordsForGroup(currentGroupId.value)
	}
})
</script>

<style lang="scss">
page {
	background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
	height: 100vh;
}

.learning-container {
	height: 100vh;
	padding: 40rpx 30rpx 140rpx 30rpx;
	display: flex;
	flex-direction: column;
	box-sizing: border-box;
}

/* 顶部导航区域 */
.top-nav-area {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 20rpx 0;
	margin-bottom: 20rpx;

	wd-icon {
		transition: all 0.2s ease;

		&:active {
			opacity: 0.7;
			transform: scale(0.9);
		}
	}
}

/* 进度区域 */
.progress-section {
	padding-top: 20rpx;
	margin-bottom: 50rpx;
}

/* 词单信息 */
.wordlist-info {
	text-align: center;
	margin-bottom: 20rpx;

	.wordlist-name {
		font-family: $voca-primary-font;
		font-weight: $font-weight-medium;
		font-size: 28rpx;
		color: #000000;
		margin-bottom: 8rpx;
		display: block;
	}

	.wordlist-range {
		font-family: $voca-secondary-font;
		font-size: 24rpx;
		color: #666666;
		display: block;
	}
}

.progress-count {
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 20rpx;

	.current-progress {
		font-family: $voca-primary-font;
		font-weight: $font-weight-bold;
		font-size: 32rpx;
		color: #000000;
	}

	.separator {
		font-family: $voca-primary-font;
		font-size: 28rpx;
		color: #666666;
		margin: 0 12rpx;
	}

	.total-words {
		font-family: $voca-primary-font;
		font-size: 28rpx;
		color: #666666;
	}
}

.progress-bar {
	width: 100%;
	height: 8rpx;
	background: #e9ecef;
	border-radius: 4rpx;
	overflow: hidden;

	.progress-fill {
		height: 100%;
		background: #000000;
		border-radius: 4rpx;
		transition: width 0.3s ease;
	}
}

/* 单词卡片 */
.word-card {
	background: #ffffff;
	border-radius: 24rpx;
	padding: 50rpx;
	box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
	border: 1px solid #f0f0f0;
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 30rpx;
	margin-bottom: 40rpx;
}

.card-header {
	display: flex;
	justify-content: space-between;
	align-items: center;

	.word-text {
		font-family: $voca-primary-font;
		font-weight: $font-weight-bold;
		font-size: 48rpx;
		color: #000000;
	}

	.pronunciation-btn {
		width: 60rpx;
		height: 60rpx;
		border-radius: 50%;
		background: #f8f9fa;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.3s ease;

		&:active {
			background: #e9ecef;
			transform: scale(0.95);
		}

		// 播放状态样式
		&.playing {
			background: #007bff;
			animation: pulse 1s infinite;

			wd-icon {
				color: #ffffff !important;
			}
		}
	}

	// 播放动画
	@keyframes pulse {
		0% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.1);
		}
		100% {
			transform: scale(1);
		}
	}
}

.phonetic-section {
	.phonetic-text {
		font-family: $voca-secondary-font;
		font-size: 32rpx;
		color: #666666;
		font-style: italic;
	}
}

.word-breakdown {
	display: flex;
	flex-wrap: wrap;
	gap: 16rpx;

	.breakdown-item {
		background: #f8f9fa;
		border-radius: 12rpx;
		padding: 16rpx 20rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		flex: 1;
		min-width: 80rpx;

		.part-text {
			font-family: $voca-primary-font;
			font-weight: $font-weight-medium;
			font-size: 24rpx;
			color: #000000;
			margin-bottom: 6rpx;
		}

		.part-meaning {
			font-family: $voca-secondary-font;
			font-size: 20rpx;
			color: #666666;
			text-align: center;
			line-height: 1.3;
		}
	}
}

.word-meaning {
	display: flex;
	flex-direction: column;
	gap: 20rpx;

	.meaning-item {
		display: flex;
		gap: 16rpx;

		.part-of-speech {
			font-family: $voca-primary-font;
			font-weight: $font-weight-medium;
			font-size: 24rpx;
			color: #000000;
			min-width: 60rpx;
		}

		.definition {
			font-family: $voca-secondary-font;
			font-size: 28rpx;
			color: #333333;
			line-height: 1.5;
			flex: 1;
		}
	}
}

.example-section {
	background: #f8f9fa;
	border-radius: 16rpx;
	padding: 30rpx;

	.example-label {
		font-family: $voca-primary-font;
		font-weight: $font-weight-medium;
		font-size: 26rpx;
		color: #000000;
		margin-bottom: 16rpx;
		display: block;
	}

	.example-text {
		font-family: $voca-secondary-font;
		font-size: 28rpx;
		color: #333333;
		line-height: 1.5;
		margin-bottom: 12rpx;
		display: block;
	}

	.example-translation {
		font-family: $voca-secondary-font;
		font-size: 26rpx;
		color: #666666;
		line-height: 1.5;
		display: block;
	}
}

/* 底部按钮 */
.button-section {
	display: flex;
	gap: 20rpx;

	.nav-button {
		flex: 1;
		height: 90rpx;
		border-radius: 45rpx;
		font-size: 28rpx;
		font-family: $voca-primary-font;
		font-weight: $font-weight-medium;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8rpx;
	}

	.prev-button {
		background: #f8f9fa !important;
		border: 2px solid #e9ecef !important;
		color: #666666 !important;

		&:disabled {
			opacity: 0.5;
		}
	}

	.next-button {
		background: #000000 !important;
		border: none !important;

		&:disabled {
			opacity: 0.5;
			background: #666666 !important;
		}
	}
}

/* 完成弹窗 */
.completion-modal {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.5);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 2000;
	padding: 40rpx;

	.modal-content {
		background: #ffffff;
		border-radius: 24rpx;
		padding: 60rpx 40rpx;
		text-align: center;
		width: 100%;
		max-width: 500rpx;
	}

	.completion-header {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-bottom: 30rpx;

		.completion-title {
			font-family: $voca-primary-font;
			font-weight: $font-weight-bold;
			font-size: 36rpx;
			color: #000000;
			margin-top: 20rpx;
		}
	}

	.completion-message {
		font-family: $voca-secondary-font;
		font-size: 28rpx;
		color: #666666;
		margin-bottom: 30rpx;
		display: block;
	}

	.completion-stats {
		margin-bottom: 40rpx;

		.stats-text {
			font-family: $voca-primary-font;
			font-size: 26rpx;
			color: #333333;
		}
	}

	.completion-btn {
		width: 100%;
		height: 80rpx;
		border-radius: 40rpx;
		font-size: 28rpx;
		font-family: $voca-primary-font;
		font-weight: $font-weight-medium;
	}
}

/* 加载状态样式 */
.loading-container {
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 40rpx;
}

.loading-content {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 30rpx;
}

.loading-text {
	font-family: $voca-secondary-font;
	font-size: 28rpx;
	color: #666666;
}

/* 空数据状态样式 */
.empty-container {
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 40rpx;
}

.empty-content {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 20rpx;
}

.empty-text {
	font-family: $voca-primary-font;
	font-size: 32rpx;
	font-weight: $font-weight-medium;
	color: #999999;
}

.empty-desc {
	font-family: $voca-secondary-font;
	font-size: 26rpx;
	color: #cccccc;
	text-align: center;
	margin-top: -10rpx;
}

/* 分组选择器样式 */
.group-selector {
	padding: 40rpx 0;
	background: #ffffff;
	border-radius: 24rpx 24rpx 0 0;
	max-height: 80vh;
}

.selector-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 0 40rpx 30rpx 40rpx;
	border-bottom: 1px solid #f0f0f0;

	.selector-title {
		font-family: $voca-primary-font;
		font-weight: $font-weight-bold;
		font-size: 32rpx;
		color: #2c3e50;
	}
}

.group-list {
	max-height: 60vh;
	overflow-y: auto;
}

.group-item {
	display: flex;
	align-items: center;
	padding: 30rpx 40rpx;
	border-bottom: 1px solid #f8f9fa;
	transition: background-color 0.3s ease;

	&:active {
		background-color: #f8f9fa;
	}

	&.group-active {
		background-color: #f0f8ff;
	}

	.group-info {
		flex: 1;
		margin-right: 20rpx;

		.group-name {
			font-family: $voca-primary-font;
			font-weight: $font-weight-medium;
			font-size: 30rpx;
			color: #000000;
			margin-bottom: 8rpx;
			display: block;
		}

		.group-count {
			font-family: $voca-secondary-font;
			font-size: 24rpx;
			color: #666666;
			display: block;
		}
	}

	.group-progress {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		margin-right: 20rpx;

		.progress-text {
			font-family: $voca-primary-font;
			font-size: 22rpx;
			color: #666666;
			margin-bottom: 8rpx;
		}

		.progress-bar-small {
			width: 100rpx;
			height: 6rpx;
			background: #e9ecef;
			border-radius: 3rpx;
			overflow: hidden;

			.progress-fill-small {
				height: 100%;
				background: #000000;
				border-radius: 3rpx;
				transition: width 0.3s ease;
			}
		}
	}
}
</style>