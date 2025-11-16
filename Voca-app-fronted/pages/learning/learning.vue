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

		<!-- 单词学习卡片 -->
		<view class="word-card">
			<!-- 单词卡片头部 -->
			<view class="card-header">
				<text class="word-text">{{ currentWord.word }}</text>
				<view class="pronunciation-btn" @click="playPronunciation">
					<wd-icon name="sound" size="24" color="#000000"></wd-icon>
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

// 分组相关数据
const showGroupModal = ref(false)
const currentGroupId = ref(1) // 当前分组索引
const wordsPerGroup = 10 // 每组单词数量
const currentWordlistName = ref('CET-4核心词汇') // 当前词单名称

// 存储来源页面信息
const fromPage = ref('home') // 默认从首页进入

// 模拟完整词单数据（4000个CET-4单词）
const completeWordList = ref([])

// 计算分组数据
const wordGroups = computed(() => {
	const totalWords = completeWordList.value.length || 4000 // 模拟4000个单词
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

// 模拟单词数据
const wordsData = ref([
	{
		word: "abandon",
		phonetic: "/əˈbændən/",
		breakdown: ["a", "ban", "don"],
		meanings: [
			{ part: "v.", definition: "放弃；抛弃；遗弃" },
			{ part: "n.", definition: "放任；放纵" }
		],
		example: {
			sentence: "They had to abandon their car in the snow.",
			translation: "他们不得不把车遗弃在雪地里。"
		}
	},
	{
		word: "ability",
		phonetic: "/əˈbɪlɪti/",
		breakdown: ["a", "bil", "i", "ty"],
		meanings: [
			{ part: "n.", definition: "能力；才能；本领" }
		],
		example: {
			sentence: "She has the ability to solve complex problems.",
			translation: "她有解决复杂问题的能力。"
		}
	},
	{
		word: "absent",
		phonetic: "/ˈæbsənt/",
		breakdown: ["ab", "sent"],
		meanings: [
			{ part: "adj.", definition: "缺席的；不在的" },
			{ part: "v.", definition: "缺席" }
		],
		example: {
			sentence: "He was absent from the meeting.",
			translation: "他缺席了会议。"
		}
	},
	{
		word: "absolute",
		phonetic: "/ˈæbsəluːt/",
		breakdown: ["ab", "so", "lute"],
		meanings: [
			{ part: "adj.", definition: "绝对的；完全的；无条件的" }
		],
		example: {
			sentence: "I have absolute confidence in you.",
			translation: "我对你有绝对的信心。"
		}
	},
	{
		word: "absorb",
		phonetic: "/əbˈsɔːrb/",
		breakdown: ["ab", "sorb"],
		meanings: [
			{ part: "v.", definition: "吸收；吸引；使专心" }
		],
		example: {
			sentence: "Plants absorb water through their roots.",
			translation: "植物通过根部吸收水分。"
		}
	}
])

// 计算属性
const totalWords = computed(() => wordsData.value.length)
const currentWord = computed(() => wordsData.value[currentWordIndex.value])
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
	// 模拟从词单中获取特定组的单词
	// 实际项目中应该从数据库或API获取对应范围的单词
	const startIndex = (groupId - 1) * wordsPerGroup
	const endIndex = Math.min(startIndex + wordsPerGroup, completeWordList.value.length || 4000)

	// 模拟生成该组的单词数据
	const groupWords = []
	for (let i = 0; i < wordsPerGroup; i++) {
		const wordIndex = startIndex + i
		// 这里使用一些示例单词，实际项目中应该从词单数据中获取
		const sampleWords = [
			{
				word: `word${wordIndex + 1}`,
				phonetic: `/wɜːrd${wordIndex + 1}/`,
				breakdown: ["word"],
				meanings: [
					{ part: "n.", definition: `单词${wordIndex + 1}的释义` }
				],
				example: {
					sentence: `This is word${wordIndex + 1}.`,
					translation: `这是单词${wordIndex + 1}。`
				}
			}
		]

		// 前5个使用真实的单词示例
		if (i < 5 && startIndex < 5) {
			const realWords = [
				{
					word: "abandon",
					phonetic: "/əˈbændən/",
					breakdown: ["a", "ban", "don"],
					meanings: [{ part: "v.", definition: "放弃；抛弃；遗弃" }],
					example: {
						sentence: "They had to abandon their car in the snow.",
						translation: "他们不得不把车遗弃在雪地里。"
					}
				},
				{
					word: "ability",
					phonetic: "/əˈbɪlɪti/",
					breakdown: ["a", "bil", "i", "ty"],
					meanings: [{ part: "n.", definition: "能力；才能；本领" }],
					example: {
						sentence: "She has the ability to solve complex problems.",
						translation: "她有解决复杂问题的能力。"
					}
				},
				{
					word: "absent",
					phonetic: "/ˈæbsənt/",
					breakdown: ["ab", "sent"],
					meanings: [{ part: "adj.", definition: "缺席的；不在的" }],
					example: {
						sentence: "He was absent from the meeting.",
						translation: "他缺席了会议。"
					}
				},
				{
					word: "absolute",
					phonetic: "/ˈæbsəluːt/",
					breakdown: ["ab", "so", "lute"],
					meanings: [{ part: "adj.", definition: "绝对的；完全的；无条件的" }],
					example: {
						sentence: "I have absolute confidence in you.",
						translation: "我对你有绝对的信心。"
					}
				},
				{
					word: "absorb",
					phonetic: "/əbˈsɔːrb/",
					breakdown: ["ab", "sorb"],
					meanings: [{ part: "v.", definition: "吸收；吸引；使专心" }],
					example: {
						sentence: "Plants absorb water through their roots.",
						translation: "植物通过根部吸收水分。"
					}
				}
			]
			groupWords.push(realWords[i] || sampleWords[0])
		} else {
			groupWords.push(sampleWords[0])
		}
	}

	wordsData.value = groupWords
}

// 获取当前词单信息
const getCurrentWordlistInfo = computed(() => {
	const totalWords = completeWordList.value.length || 4000
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

// 播放发音
const playPronunciation = () => {
	// 使用uni-app的语音合成API
	uni.createInnerAudioContext().then(() => {
		// 实际项目中应该使用真实的发音文件
		uni.showToast({
			title: `播放 ${currentWord.value.word} 发音`,
			icon: 'none'
		})
	})
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

	// 初始化词单数据
	loadWordsForGroup(currentGroupId.value)

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