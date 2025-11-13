<template>
	<!-- 学习首页 -->
	<view class="home-container">
		<!-- 顶部导航栏 -->
		<view class="header-nav">
			<!-- 左上角：当前词单（点击跳转到词单列表详情） -->
			<view class="current-wordlist" @click="goToWordList">
				<text class="wordlist-name">当前词单</text>
				<text class="wordlist-title">{{ currentWordlist }}</text>
			</view>

			<!-- 右上角：词单切换图标（点击弹出选择弹窗） -->
			<view class="wordlist-switch" @click="switchWordList">
				<wd-icon name="list" size="24" color="#000000"></wd-icon>
			</view>
		</view>

		<!-- 问候语部分 -->
		<view class="greeting-section">
			<text class="greeting-text">{{ getGreeting() }}</text>
			<text class="user-name">{{ userName }}</text>
		</view>

		<!-- 单词进度卡片 -->
		<view class="progress-card">
			<!-- 进度标题 -->
			<view class="progress-header">
				<text class="progress-title">今日学习进度</text>
			</view>

			<!-- 进度条区域 -->
			<view class="progress-bars">
				<!-- 新词进度 -->
				<view class="progress-item">
					<view class="progress-info">
						<text class="progress-label">新词</text>
						<text class="progress-count">{{ newWordsCount }}/{{ newWordsTotal }}</text>
					</view>
					<view class="circular-progress">
						<view class="progress-circle">
							<svg width="85" height="85" viewBox="0 0 85 85">
								<circle
									cx="42.5"
									cy="42.5"
									r="37"
									fill="none"
									stroke="#e9ecef"
									stroke-width="6"
								/>
								<circle
									cx="42.5"
									cy="42.5"
									r="37"
									fill="none"
									stroke="#000000"
									stroke-width="6"
									stroke-linecap="round"
									:stroke-dasharray="`${2 * Math.PI * 37}`"
									:stroke-dashoffset="`${2 * Math.PI * 37 * (1 - newWordsPercentage / 100)}`"
									transform="rotate(-90 42.5 42.5)"
								/>
							</svg>
							<text class="progress-percentage">{{ Math.round(newWordsPercentage) }}%</text>
						</view>
					</view>
				</view>

				<!-- 复习进度 -->
				<view class="progress-item">
					<view class="progress-info">
						<text class="progress-label">复习</text>
						<text class="progress-count">{{ reviewWordsCount }}/{{ reviewWordsTotal }}</text>
					</view>
					<view class="circular-progress">
						<view class="progress-circle">
							<svg width="85" height="85" viewBox="0 0 85 85">
								<circle
									cx="42.5"
									cy="42.5"
									r="37"
									fill="none"
									stroke="#e9ecef"
									stroke-width="6"
								/>
								<circle
									cx="42.5"
									cy="42.5"
									r="37"
									fill="none"
									stroke="#000000"
									stroke-width="6"
									stroke-linecap="round"
									:stroke-dasharray="`${2 * Math.PI * 37}`"
									:stroke-dashoffset="`${2 * Math.PI * 37 * (1 - reviewWordsPercentage / 100)}`"
									transform="rotate(-90 42.5 42.5)"
								/>
							</svg>
							<text class="progress-percentage">{{ Math.round(reviewWordsPercentage) }}%</text>
						</view>
					</view>
				</view>
			</view>

			<!-- 每日目标 -->
			<view class="daily-goal">
				<text class="goal-text">每日目标</text>
				<text class="goal-count">{{ dailyGoal }} 个单词</text>
			</view>
		</view>

		<!-- 名人名言 -->
		<view class="quote-section">
			<view class="quote-icon">"</view>
			<text class="quote-text">{{ currentQuote.text }}</text>
			<text class="quote-author">—— {{ currentQuote.author }}</text>
		</view>

		<!-- 底部学习按钮 -->
		<view class="action-buttons">
			<wd-button
				type="primary"
				class="start-learning-btn"
				block
				round
				@click="startLearning"
			>
				开始学习
			</wd-button>

			<wd-button
				class="start-review-btn"
				block
				round
				@click="startReview"
			>
				开始复习
			</wd-button>
		</view>
	</view>

	<!-- 自定义TabBar -->
	<custom-tabbar />

	<!-- 词单选择弹窗 -->
		<wd-popup v-model="showWordListPopup" position="bottom" custom-style="border-radius: 24rpx 24rpx 0 0;">
			<view class="wordlist-popup">
				<view class="popup-header">
					<text class="popup-title">选择词单</text>
					<wd-icon name="cross" size="24" color="#666666" @click="showWordListPopup = false"></wd-icon>
				</view>
				<view class="wordlist-list">
					<view
						class="wordlist-item"
						v-for="(item, index) in wordLists"
						:key="index"
						@click="selectWordList(item)"
					>
						<text class="item-name">{{ item.name }}</text>
						<text class="item-count">{{ item.wordCount }} 词</text>
					</view>
				</view>
			</view>
		</wd-popup>
	</template>

<script setup lang="ts">
import { reactive, computed, ref, onMounted } from 'vue'
import CustomTabbar from '@/components/custom-tabbar/custom-tabbar.vue'

// 用户数据
const userName = ref('ALEX')

// 当前词单
const currentWordlist = ref('CET-4核心词汇')

// 学习进度数据
const newWordsCount = ref(15)
const newWordsTotal = ref(30)
const reviewWordsCount = ref(25)
const reviewWordsTotal = ref(50)
const dailyGoal = ref(50)

// 计算属性
const newWordsPercentage = computed(() => (newWordsCount.value / newWordsTotal.value) * 100)
const newWordsProgress = computed(() => (newWordsCount.value / newWordsTotal.value) * 360)
const reviewWordsPercentage = computed(() => (reviewWordsCount.value / reviewWordsTotal.value) * 100)
const reviewWordsProgress = computed(() => (reviewWordsCount.value / reviewWordsTotal.value) * 360)

// 名人名言
const quotes = [
	{ text: "学习永远不晚", author: "高尔基" },
	{ text: "活到老，学到老", author: "古希腊格言" },
	{ text: "书山有路勤为径，学海无涯苦作舟", author: "韩愈" },
	{ text: "读万卷书，行万里路", author: "刘彝" },
	{ text: "学习是进步的阶梯", author: "爱迪生" },
	{ text: "知识就是力量", author: "培根" },
	{ text: "学而时习之，不亦说乎", author: "孔子" },
	{ text: "千里之行，始于足下", author: "老子" },
	{ text: "业精于勤，荒于嬉", author: "韩愈" },
	{ text: "不积跬步，无以至千里", author: "荀子" }
]

const currentQuote = reactive({
	text: '',
	author: ''
})

// 词单数据
const showWordListPopup = ref(false)
const wordLists = reactive([
	{ name: 'CET-4核心词汇', wordCount: 4500 },
	{ name: 'CET-6核心词汇', wordCount: 2500 },
	{ name: '雅思核心词汇', wordCount: 3500 },
	{ name: '托福核心词汇', wordCount: 3000 },
	{ name: '商务英语词汇', wordCount: 2000 },
	{ name: '日常口语词汇', wordCount: 1500 }
])

// 获取问候语
const getGreeting = () => {
	const hour = new Date().getHours()
	if (hour < 6) return '凌晨好'
	if (hour < 12) return '早上好'
	if (hour < 14) return '中午好'
	if (hour < 17) return '下午好'
	if (hour < 19) return '傍晚好'
	return '晚上好'
}

// 随机获取名言
const getRandomQuote = () => {
	const randomIndex = Math.floor(Math.random() * quotes.length)
	const quote = quotes[randomIndex]
	currentQuote.text = quote.text
	currentQuote.author = quote.author
}

// 跳转到词单详情
const goToWordList = () => {
	uni.navigateTo({
		url: '/pages/wordlist/wordlist'
	})
}

// 切换词单 - 显示弹窗选择
const switchWordList = () => {
	showWordListPopup.value = true
}

// 选择词单
const selectWordList = (item: any) => {
	currentWordlist.value = item.name
	showWordListPopup.value = false

	// 重新加载该词单的学习数据
	loadWordlistProgress()

	uni.showToast({
		title: `已切换到${item.name}`,
		icon: 'success'
	})
}

// 加载词单进度
const loadWordlistProgress = () => {
	// 模拟加载不同词单的进度数据
	newWordsCount.value = Math.floor(Math.random() * 30)
	newWordsTotal.value = 30 + Math.floor(Math.random() * 20)
	reviewWordsCount.value = Math.floor(Math.random() * 50)
	reviewWordsTotal.value = 50 + Math.floor(Math.random() * 30)
	dailyGoal.value = 20 + Math.floor(Math.random() * 40)
}

// 开始学习
const startLearning = () => {
	uni.navigateTo({
		url: '/pages/learning/learning?type=new'
	})
}

// 开始复习
const startReview = () => {
	if (reviewWordsCount.value === 0) {
		uni.showToast({
			title: '暂无需要复习的单词',
			icon: 'none'
		})
		return
	}

	uni.navigateTo({
		url: '/pages/learning/learning?type=review'
	})
}

// 页面加载时初始化
onMounted(() => {
	getRandomQuote()
	loadWordlistProgress()
})
</script>

<style lang="scss">
page {
	background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
	height: 100%;
}

.home-container {
	height: 100vh;
	padding: 0 30rpx 130rpx 30rpx;
	position: relative;
	display: flex;
	flex-direction: column;
	box-sizing: border-box;
	gap: 25rpx;
}

/* 顶部导航栏 */
.header-nav {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding-top: 50rpx;
	padding-bottom: 15rpx;
}

.current-wordlist {
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	cursor: pointer;

	.wordlist-name {
		font-family: $voca-secondary-font;
		font-size: 24rpx;
		color: rgba(0, 0, 0, 0.5);
		margin-bottom: 8rpx;
	}

	.wordlist-title {
		font-family: $voca-primary-font;
		font-weight: $font-weight-medium;
		font-size: 28rpx;
		color: #000000;
	}
}

.wordlist-switch {
	cursor: pointer;
	padding: 10rpx;
	transition: opacity 0.3s ease;
	color: #000000;

	&:active {
		opacity: 0.7;
	}
}

/* 问候语部分 */
.greeting-section {
	margin: 30rpx 0 45rpx 0;

	.greeting-text {
		display: block;
		font-family: $voca-secondary-font;
		font-size: 30rpx;
		color: rgba(0, 0, 0, 0.6);
		margin-bottom: 12rpx;
	}

	.user-name {
		display: block;
		font-family: $voca-primary-font;
		font-weight: $font-weight-bold;
		font-size: 42rpx;
		color: #000000;
		letter-spacing: 1rpx;
	}
}

/* 进度卡片 */
.progress-card {
	background: #ffffff;
	border-radius: 20rpx;
	padding: 40rpx;
	margin-bottom: 40rpx;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
	border: 1px solid #f0f0f0;
}

.progress-header {
	margin-bottom: 35rpx;

	.progress-title {
		font-family: $voca-primary-font;
		font-weight: $font-weight-medium;
		font-size: 32rpx;
		color: #000000;
	}
}

.progress-bars {
	display: flex;
	justify-content: space-around;
	margin-bottom: 40rpx;
}

.progress-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 25rpx;
	justify-content: center;
}

.progress-info {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 8rpx;

	.progress-label {
		font-family: $voca-primary-font;
		font-size: 26rpx;
		color: #000000;
	}

	.progress-count {
		font-family: $voca-primary-font;
		font-size: 24rpx;
		color: #666666;
	}
}

.circular-progress {
	width: 100rpx;
	height: 100rpx;
	border-radius: 50%;
	background: #f8f9fa;
	display: flex;
	justify-content: center;
	align-items: center;
	position: relative;
}

.progress-circle {
	width: 85rpx;
	height: 85rpx;
	border-radius: 50%;
	position: relative;
	display: flex;
	justify-content: center;
	align-items: center;

	svg {
		width: 85rpx;
		height: 85rpx;
	}

	.progress-percentage {
		font-family: $voca-primary-font;
		font-weight: $font-weight-bold;
		font-size: 18rpx;
		color: #000000;
		position: absolute;
		z-index: 2;
	}
}

.daily-goal {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding-top: 28rpx;
	border-top: 1px solid #f0f0f0;

	.goal-text {
		font-family: $voca-primary-font;
		font-size: 26rpx;
		color: #666666;
	}

	.goal-count {
		font-family: $voca-primary-font;
		font-weight: $font-weight-medium;
		font-size: 26rpx;
		color: #000000;
	}
}

/* 名人名言 */
.quote-section {
	background: #f8f9fa;
	border-radius: 16rpx;
	padding: 45rpx 40rpx;
	margin-bottom: 25rpx;
	text-align: center;
	position: relative;
	border: 1px solid #f0f0f0;

	.quote-icon {
		font-family: $voca-primary-font;
		font-size: 52rpx;
		color: rgba(0, 0, 0, 0.1);
		position: absolute;
		top: 20rpx;
		left: 40rpx;
		line-height: 1;
	}

	.quote-text {
		display: block;
		font-family: $voca-secondary-font;
		font-size: 30rpx;
		color: #000000;
		line-height: 1.5;
		margin: 25rpx 0 30rpx 0;
		min-height: 85rpx;
	}

	.quote-author {
		display: block;
		font-family: $voca-primary-font;
		font-size: 28rpx;
		color: #666666;
		font-style: italic;
	}
}

/* 底部按钮 */
.action-buttons {
	display: flex;
	flex-direction: column;
	gap: 16rpx;
	margin-top: 64rpx;
}

.start-learning-btn {
	width: 100%;
	height: 100rpx;
	font-size: 28rpx;
	font-family: $voca-primary-font;
	font-weight: $font-weight-medium;
	border-radius: 16rpx;
}

.start-review-btn {
	width: 100%;
	height: 100rpx;
	background: transparent !important;
	border: 2px solid #000000 !important;
	color: #000000 !important;
	font-size: 28rpx;
	font-family: $voca-primary-font;
	font-weight: $font-weight-medium;
	border-radius: 16rpx;
	margin-top: 0 !important;
}

/* 词单弹窗 */
.wordlist-popup {
	padding: 40rpx 0;
	background: #ffffff;
	border-radius: 24rpx 24rpx 0 0;
	max-height: 80vh;
}

.popup-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 0 40rpx 30rpx 40rpx;
	border-bottom: 1px solid #f0f0f0;

	.popup-title {
		font-family: $voca-primary-font;
		font-weight: $font-weight-bold;
		font-size: 32rpx;
		color: #2c3e50;
	}
}

.wordlist-list {
	max-height: 60vh;
	overflow-y: auto;
}

.wordlist-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 30rpx 40rpx;
	border-bottom: 1px solid #f8f9fa;
	cursor: pointer;
	transition: background-color 0.3s ease;

	&:active {
		background-color: #f8f9fa;
	}

	.item-name {
		font-family: $voca-primary-font;
		font-size: 28rpx;
		color: #2c3e50;
	}

	.item-count {
		font-family: $voca-primary-font;
		font-size: 24rpx;
		color: #666666;
	}
}
</style>