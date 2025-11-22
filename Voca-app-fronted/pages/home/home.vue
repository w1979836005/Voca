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
				<wd-icon
					name="arrow-down"
					size="24"
					color="#000000"
					:class="{ 'icon-rotated': isIconRotated }"
				></wd-icon>
			</view>
		</view>

		<!-- 问候语部分 -->
		<view class="greeting-section">
			<text class="greeting-text">{{ greetingText }}</text>
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
		<view class="quote-section" @click="changeQuote">
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
		<wd-popup
			v-model="showWordListPopup"
			position="left"
			custom-style="background: rgba(0,0,0,0.5); z-index: 2000;"
			@close="resetIconState"
		>
			<view class="wordlist-popup">
				<view class="popup-header">
					<text class="popup-title">选择词单</text>
					<wd-icon name="cross" size="24" color="#666666" @click="closeWordListPopup"></wd-icon>
				</view>
				<view class="wordlist-list">
					<!-- 加载状态 -->
					<view v-if="loadingWordLists" class="loading-container">
						<wd-loading type="spinner" size="20px" />
						<text class="loading-text">加载中...</text>
					</view>

					<!-- 词单列表 -->
					<view v-else-if="wordLists.length > 0">
						<view
							class="wordlist-item"
							:class="{ 'wordlist-item-current': item.wordListId === currentWordlistId }"
							v-for="(item, index) in wordLists"
							:key="item.wordListId"
							@click="selectWordList(item)"
						>
							<view class="item-content">
								<text class="item-name">{{ item.wordListName }}</text>
								<text class="item-count">{{ item.wordCount }} 词</text>
							</view>
							<view class="item-status" v-if="item.wordListId === currentWordlistId">
								<wd-icon name="check" size="20" color="#000000"></wd-icon>
							</view>
						</view>
					</view>

					<!-- 空状态 -->
					<view v-else class="empty-container">
						<text class="empty-text">暂无词单</text>
						<text class="empty-desc">请先去词单页面添加词单</text>
					</view>
				</view>
			</view>
		</wd-popup>
	</template>

<script setup lang="ts">
import { reactive, computed, ref, onMounted, onUnmounted } from 'vue'
import CustomTabbar from '@/components/custom-tabbar/custom-tabbar.vue'
import { auth } from '@/utils/index.js'
import { wordlistAPI } from '@/api/wordlist.js'

// 用户数据
const userName = ref('用户')

// 响应式问候语
const greetingText = ref('早上好')

// 当前词单
const currentWordlist = computed(() => {
	if (currentWordlistInfo.value) {
		return currentWordlistInfo.value.wordListName
	}
	// 如果没有当前词单信息，从词单列表中找第一个当前词单或第一个词单
	if (wordLists.value.length > 0) {
		const currentWordlist = wordLists.value.find(item => item.isCurrent) || wordLists.value[0]
		return currentWordlist.wordListName
	}
	return '暂无词单'
})

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
const isIconRotated = ref(false)

// 用户已加入的词单列表
const wordLists = ref([])
const loadingWordLists = ref(false)

// 当前词单ID（从本地存储获取）
const currentWordlistId = ref(uni.getStorageSync('currentWordlistId') || null)

// 当前词单信息
const currentWordlistInfo = ref(null)

// 更新问候语
const updateGreeting = () => {
	const now = new Date()
	const hour = now.getHours()

	// 确保在不同平台（H5、小程序、App）都能正确获取时间
	console.log('当前时间:', now.toLocaleString(), '小时:', hour)

	let greeting = ''
	if (hour < 6) greeting = '凌晨好'
	else if (hour < 12) greeting = '早上好'
	else if (hour < 18) greeting = '下午好'
	else greeting = '晚上好'

	greetingText.value = greeting
	return greeting
}

// 获取问候语（保持模板兼容性）
const getGreeting = () => {
	return greetingText.value
}

// 随机获取名言
const getRandomQuote = () => {
	const randomIndex = Math.floor(Math.random() * quotes.length)
	const quote = quotes[randomIndex]
	currentQuote.text = quote.text
	currentQuote.author = quote.author
}

// 点击切换名言
const changeQuote = () => {
	// 获取当前名言的索引，避免显示相同的名言
	let currentIndex = quotes.findIndex(quote => quote.text === currentQuote.text && quote.author === currentQuote.author)
	let randomIndex

	// 确保获取到不同的名言
	do {
		randomIndex = Math.floor(Math.random() * quotes.length)
	} while (randomIndex === currentIndex && quotes.length > 1)

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
	console.log('switchWordList clicked')
	isIconRotated.value = !isIconRotated.value
	console.log('isIconRotated:', isIconRotated.value)
	showWordListPopup.value = true
}

// 重置图标状态
const resetIconState = () => {
	isIconRotated.value = false
}

// 关闭词单弹窗
const closeWordListPopup = () => {
	showWordListPopup.value = false
	isIconRotated.value = false
}

// 选择词单
const selectWordList = async (item: any) => {
	try {
		// 更新当前词单信息
		currentWordlistInfo.value = item
		currentWordlistId.value = item.wordListId

		// 保存到本地存储
		uni.setStorageSync('currentWordlistId', item.wordListId)

		// 关闭弹窗
		showWordListPopup.value = false
		isIconRotated.value = false

		// 重新加载该词单的学习数据
		loadWordlistProgress()

		uni.showToast({
			title: `已切换到${item.wordListName}`,
			icon: 'success'
		})
	} catch (error) {
		console.error('切换词单失败:', error)
		uni.showToast({
			title: '切换失败',
			icon: 'none'
		})
	}
}

// 加载用户词单列表
const loadMyWordLists = async () => {
	try {
		loadingWordLists.value = true
		const response = await wordlistAPI.getMyWordlists({ limit: 50 })

		if (response.code === 200 && response.data) {
			wordLists.value = response.data.wordLists || []

			// 设置当前词单信息
			if (currentWordlistId.value) {
				const currentWordlist = wordLists.value.find(item => item.wordListId === currentWordlistId.value)
				if (currentWordlist) {
					currentWordlistInfo.value = currentWordlist
				} else {
					// 如果本地存储的词单ID不在列表中，重置为第一个词单或当前词单
					const firstWordlist = wordLists.value.find(item => item.isCurrent) || wordLists.value[0]
					if (firstWordlist) {
						currentWordlistId.value = firstWordlist.wordListId
						currentWordlistInfo.value = firstWordlist
						uni.setStorageSync('currentWordlistId', firstWordlist.wordListId)
					}
				}
			} else {
				// 如果没有当前词单ID，选择第一个词单或当前词单
				const firstWordlist = wordLists.value.find(item => item.isCurrent) || wordLists.value[0]
				if (firstWordlist) {
					currentWordlistId.value = firstWordlist.wordListId
					currentWordlistInfo.value = firstWordlist
					uni.setStorageSync('currentWordlistId', firstWordlist.wordListId)
				}
			}
		}
	} catch (error) {
		console.error('加载用户词单列表失败:', error)
		uni.showToast({
			title: '加载词单失败',
			icon: 'none'
		})
	} finally {
		loadingWordLists.value = false
	}
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
	// 确保有当前词单ID
	if (!currentWordlistId.value) {
		uni.showToast({
			title: '请先选择词单',
			icon: 'none'
		})
		return
	}

	uni.navigateTo({
		url: `/pages/learning/learning?type=new&wordListId=${currentWordlistId.value}`
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

	// 确保有当前词单ID
	if (!currentWordlistId.value) {
		uni.showToast({
			title: '请先选择词单',
			icon: 'none'
		})
		return
	}

	uni.navigateTo({
		url: `/pages/learning/learning?type=review&wordListId=${currentWordlistId.value}`
	})
}

// 加载用户信息
const loadUserInfo = () => {
	try {
		const localUserInfo = auth.getUserInfo()
		if (localUserInfo && localUserInfo.username) {
			userName.value = localUserInfo.username
		}
	} catch (error) {
		console.error('获取用户信息失败:', error)
		// 保持默认用户名
	}
}

// 页面加载时初始化
onMounted(() => {
	getRandomQuote()
	loadWordlistProgress()
	loadUserInfo()
	loadMyWordLists() // 加载用户词单列表
	updateGreeting()

	// 每分钟更新一次问候语，确保跨时段时自动更新
	setInterval(() => {
		updateGreeting()
	}, 60000)

	// 监听用户信息更新事件
	uni.$on('userProfileUpdated', () => {
		console.log('首页收到用户信息更新事件，刷新用户名')
		loadUserInfo()
	})

	// 监听词单变化事件
	uni.$on('wordlistChanged', (data) => {
		console.log('首页收到词单变化事件:', data)
		// 刷新词单列表
		loadMyWordLists()

		// 如果移除的是当前词单，需要重新设置当前词单
		if (data.action === 'remove' && data.wordListId === currentWordlistId.value) {
			console.log('当前词单被移除，需要重新设置')
			// 从本地存储中移除
			uni.removeStorageSync('currentWordlistId')
			currentWordlistId.value = null
			currentWordlistInfo.value = null

			// 显示提示
			uni.showToast({
				title: '当前词单已被移除',
				icon: 'none'
			})
		}
	})

	// 页面显示时刷新词单列表（确保数据最新）
	uni.$on('onShow', () => {
		console.log('首页显示，刷新词单列表')
		loadMyWordLists()
	})
})

// 组件卸载时移除事件监听
onUnmounted(() => {
	uni.$off('userProfileUpdated')
	uni.$off('wordlistChanged')
	uni.$off('onShow')
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

.icon-rotated {
	display: inline-block;
	transform: rotate(180deg);
	transition: transform 0.3s ease;
}

/* 提升弹窗层级 */
:deep(.wd-popup) {
	z-index: 2000 !important;
}

:deep(.wd-popup__content) {
	z-index: 2001 !important;
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
	cursor: pointer;
	transition: all 0.3s ease;

	&:active {
		background: #e9ecef;
		transform: scale(0.98);
	}

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
	width: 500rpx;
	height: 100vh;
	background: #ffffff;
	display: flex;
	flex-direction: column;
	position: relative;
	z-index: 2001;
}

.popup-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 40rpx 40rpx 30rpx 40rpx;
	border-bottom: 1px solid #f0f0f0;

	.popup-title {
		font-family: $voca-primary-font;
		font-weight: $font-weight-bold;
		font-size: 32rpx;
		color: #2c3e50;
		margin-top: 20rpx;
	}
}

.wordlist-list {
	flex: 1;
	overflow-y: auto;
	padding-bottom: 120rpx; /* 为tabbar留出空间 */
}

.wordlist-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 30rpx 40rpx;
	border-bottom: 1px solid #f8f9fa;
	cursor: pointer;
	transition: all 0.3s ease;
	position: relative;

	&:active {
		background-color: #f8f9fa;
	}

	/* 当前选中词单的特殊效果 */
	&.wordlist-item-current {
		/* 保持原有的普通背景，不添加特殊背景色 */
		box-shadow: none;

		&:active {
			background-color: #f8f9fa;
		}
	}

	.item-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 8rpx;
	}

	.item-name {
		font-family: $voca-primary-font;
		font-size: 28rpx;
		color: #2c3e50;
		font-weight: 500;

		.wordlist-item-current & {
			font-weight: 600;
			/* 保持原有颜色 */
		}
	}

	.item-count {
		font-family: $voca-primary-font;
		font-size: 24rpx;
		color: #666666;

		.wordlist-item-current & {
			/* 保持原有颜色 */
		}
	}

	.item-status {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 40rpx;
		height: 40rpx;
	}
}

/* 加载状态 */
.loading-container {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 60rpx 0;
	gap: 20rpx;

	.loading-text {
		font-family: $voca-primary-font;
		font-size: 26rpx;
		color: #666666;
	}
}

/* 空状态 */
.empty-container {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 80rpx 40rpx;
	text-align: center;

	.empty-text {
		font-family: $voca-primary-font;
		font-size: 28rpx;
		color: #666666;
		margin-bottom: 12rpx;
	}

	.empty-desc {
		font-family: $voca-primary-font;
		font-size: 24rpx;
		color: #999999;
		line-height: 1.4;
	}
}
</style>