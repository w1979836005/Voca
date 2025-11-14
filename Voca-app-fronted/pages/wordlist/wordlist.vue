<template>
	<view class="wordlist-container">
		<!-- 搜索栏 -->
		<view class="search-section">
			<wd-input
				v-model="searchText"
				class="search-input"
				clearable
				placeholder="搜索词单名称"
				@input="onSearch"
			/>
		</view>

		<!-- 词单列表 -->
		<scroll-view
			class="wordlist-scroll"
			scroll-y
			@scrolltolower="loadMore"
			@scroll="handleScroll"
			:style="{ height: scrollHeight + 'px' }"
			:scroll-top="scrollTop"
			scroll-with-animation="true"
		>
			<view class="wordlist-grid">
				<view
					class="wordlist-card"
					v-for="(item, index) in displayWordlist"
					:key="index"
					@click="selectWordlist(item)"
				>
					<view class="card-content">
						<!-- 左侧信息区域 -->
						<view class="card-left">
							<!-- 词单卡片头部 -->
							<view class="card-header">
								<view class="wordlist-basic">
									<text class="wordlist-name">{{ item.name }}</text>
									<text class="wordlist-category">{{ item.category }}</text>
								</view>
							</view>

							<!-- 词单描述 -->
							<view class="card-description">
								<text class="wordlist-description">{{ item.description }}</text>
							</view>

							<!-- 词单统计信息 -->
							<view class="card-stats">
								<view class="stat-item">
									<text class="stat-number">{{ item.wordCount.toLocaleString() }}</text>
									<text class="stat-label">总词汇</text>
								</view>
								<view class="stat-divider"></view>
								<view class="stat-item">
									<text class="stat-number">{{ item.learnedCount.toLocaleString() }}</text>
									<text class="stat-label">已学习</text>
								</view>
								<view class="stat-divider"></view>
								<view class="stat-item">
									<text class="stat-number">{{ item.progress }}%</text>
									<text class="stat-label">进度</text>
								</view>
							</view>

							<!-- 进度条 -->
							<view class="progress-section">
								<view class="progress-bar">
									<view
										class="progress-fill"
										:style="{ width: item.progress + '%' }"
									></view>
								</view>
							</view>
						</view>

						<!-- 右侧操作按钮区域 -->
						<view class="card-right">
							<view class="card-actions">
								<wd-button
									:type="isInMyWordlist(item.id) ? 'info' : 'primary'"
									size="small"
									@click.stop="addToMyWordlist(item)"
								>
									{{ isInMyWordlist(item.id) ? '已加入' : '加入词单' }}
								</wd-button>
								<wd-button
									type="info"
									size="small"
									@click.stop="viewDetails(item)"
								>
									查看详情
								</wd-button>
							</view>
						</view>
					</view>
				</view>
			</view>

			<!-- 加载更多提示 -->
			<view class="load-more" v-if="hasMore">
				<text class="load-more-text">加载中...</text>
			</view>
			<view class="no-more" v-else-if="displayWordlist.length > 0">
				<text class="no-more-text">已加载全部词单</text>
			</view>
		</scroll-view>

		<!-- 返回顶部按钮 -->
		<view
			class="back-to-top"
			:class="{ 'back-to-top-visible': showBackToTop }"
			@click="scrollToTop"
		>
			<wd-icon name="arrow-up" size="16" color="#ffffff"></wd-icon>
		</view>

		<!-- 自定义TabBar -->
		<custom-tabbar />
	</view>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import CustomTabbar from '@/components/custom-tabbar/custom-tabbar.vue'

// 搜索关键词
const searchText = ref('')

// 当前词单ID
const currentWordlistId = ref('wordlist-1')

// 用户已加入的词单列表
const myWordlistIds = ref(['wordlist-1', 'wordlist-3', 'wordlist-5'])

// 分页相关
const pageSize = 10
const currentPage = ref(1)
const hasMore = ref(true)
const scrollHeight = ref(0)

// 返回顶部相关
const showBackToTop = ref(true) // 临时设置为true来测试按钮显示
const scrollTop = ref(0)
const scrollViewRef = ref()

// 词单数据
const wordlistData = reactive([
	{
		id: 'wordlist-1',
		name: 'CET-4核心词汇',
		category: '考试词汇',
		description: '大学英语四级考试核心词汇，涵盖最常考的高频词汇',
		wordCount: 4500,
		learnedCount: 1200,
		progress: 27,
		difficulty: 'intermediate',
		createdTime: '2024-01-15',
		status: 'learning'
	},
	{
		id: 'wordlist-2',
		name: 'CET-6核心词汇',
		category: '考试词汇',
		description: '大学英语六级考试必备词汇，包含学术和商务用语',
		wordCount: 2500,
		learnedCount: 800,
		progress: 32,
		difficulty: 'advanced',
		createdTime: '2024-01-20',
		status: 'learning'
	},
	{
		id: 'wordlist-3',
		name: '雅思核心词汇',
		category: '考试词汇',
		description: 'IELTS考试高频词汇，适合出国留学准备',
		wordCount: 3500,
		learnedCount: 1500,
		progress: 43,
		difficulty: 'advanced',
		createdTime: '2024-02-01',
		status: 'learning'
	},
	{
		id: 'wordlist-4',
		name: '托福核心词汇',
		category: '考试词汇',
		description: 'TOEFL考试必备词汇，涵盖学术和日常生活用语',
		wordCount: 3000,
		learnedCount: 900,
		progress: 30,
		difficulty: 'advanced',
		createdTime: '2024-02-10',
		status: 'not-started'
	},
	{
		id: 'wordlist-5',
		name: '商务英语词汇',
		category: '职场应用',
		description: '商务场景常用词汇，包含会议、谈判、邮件等',
		wordCount: 2000,
		learnedCount: 500,
		progress: 25,
		difficulty: 'intermediate',
		createdTime: '2024-02-15',
		status: 'learning'
	},
	{
		id: 'wordlist-6',
		name: '日常口语词汇',
		category: '日常应用',
		description: '日常生活中最常用的口语词汇，适合日常交流',
		wordCount: 1500,
		learnedCount: 1200,
		progress: 80,
		difficulty: 'basic',
		createdTime: '2024-02-20',
		status: 'learning'
	},
	{
		id: 'wordlist-7',
		name: '学术英语词汇',
		category: '学术应用',
		description: '学术论文和研究中的专业词汇',
		wordCount: 1800,
		learnedCount: 300,
		progress: 17,
		difficulty: 'advanced',
		createdTime: '2024-03-01',
		status: 'not-started'
	},
	{
		id: 'wordlist-8',
		name: 'GRE核心词汇',
		category: '考试词汇',
		description: 'GRE考试高频词汇，适合研究生申请',
		wordCount: 4000,
		learnedCount: 600,
		progress: 15,
		difficulty: 'expert',
		createdTime: '2024-03-05',
		status: 'not-started'
	},
	{
		id: 'wordlist-9',
		name: 'IT英语词汇',
		category: '专业应用',
		description: '计算机和IT行业专业术语词汇',
		wordCount: 1200,
		learnedCount: 800,
		progress: 67,
		difficulty: 'intermediate',
		createdTime: '2024-03-10',
		status: 'learning'
	},
	{
		id: 'wordlist-10',
		name: '医学英语词汇',
		category: '专业应用',
		description: '医学领域的专业英语词汇',
		wordCount: 2500,
		learnedCount: 400,
		progress: 16,
		difficulty: 'advanced',
		createdTime: '2024-03-15',
		status: 'not-started'
	}
])

// 添加更多模拟数据用于分页
for (let i = 11; i <= 50; i++) {
	wordlistData.push({
		id: `wordlist-${i}`,
		name: `词单 ${i}`,
		category: ['考试词汇', '职场应用', '日常应用', '学术应用', '专业应用'][Math.floor(Math.random() * 5)],
		description: `这是第${i}个词单的描述信息`,
		wordCount: Math.floor(Math.random() * 3000) + 500,
		learnedCount: Math.floor(Math.random() * 1000),
		progress: Math.floor(Math.random() * 100),
		difficulty: ['basic', 'intermediate', 'advanced', 'expert'][Math.floor(Math.random() * 4)],
		createdTime: `2024-03-${Math.floor(Math.random() * 28) + 1}`,
		status: ['not-started', 'learning', 'completed'][Math.floor(Math.random() * 3)]
	})
}

// 过滤后的词单列表
const filteredWordlist = computed(() => {
	if (!searchText.value) {
		return wordlistData
	}

	const searchLower = searchText.value.toLowerCase()
	return wordlistData.filter(item =>
		item.name.toLowerCase().includes(searchLower) ||
		item.description.toLowerCase().includes(searchLower) ||
		item.category.toLowerCase().includes(searchLower)
	)
})

// 显示的词单列表（分页）
const displayWordlist = computed(() => {
	const filtered = filteredWordlist.value
	const start = 0
	const end = currentPage.value * pageSize
	return filtered.slice(start, end)
})

// 检查词单是否已加入
const isInMyWordlist = (wordlistId: string) => {
	return myWordlistIds.value.includes(wordlistId)
}

// 搜索处理
const onSearch = () => {
	currentPage.value = 1
	checkHasMore()
}

// 加载更多
const loadMore = () => {
	if (hasMore.value) {
		currentPage.value++
		checkHasMore()
	}
}

// 检查是否还有更多数据
const checkHasMore = () => {
	const filtered = filteredWordlist.value
	const totalItems = filtered.length
	const displayedItems = currentPage.value * pageSize
	hasMore.value = displayedItems < totalItems
}


// 选择词单
const selectWordlist = (item: any) => {
	console.log('选择词单:', item.name)

	// 这里可以切换到该词单的学习页面
	uni.showModal({
		title: '切换词单',
		content: `确定要切换到"${item.name}"吗？`,
		success: (res) => {
			if (res.confirm) {
				// 更新当前词单ID
				currentWordlistId.value = item.id

				// 返回首页
				uni.switchTab({
					url: '/pages/home/home'
				})

				uni.showToast({
					title: `已切换到${item.name}`,
					icon: 'success'
				})
			}
		}
	})
}

// 加入词单
const addToMyWordlist = (item: any) => {
	if (isInMyWordlist(item.id)) {
		// 如果已加入，则移除
		const index = myWordlistIds.value.indexOf(item.id)
		if (index > -1) {
			myWordlistIds.value.splice(index, 1)
		}

		uni.showToast({
			title: `已从词单中移除${item.name}`,
			icon: 'success'
		})

		// 如果移除的是当前词单，切换到第一个词单
		if (item.id === currentWordlistId.value && myWordlistIds.value.length > 0) {
			currentWordlistId.value = myWordlistIds.value[0]
		}
	} else {
		// 如果未加入，则添加
		myWordlistIds.value.push(item.id)

		uni.showToast({
			title: `已添加${item.name}到词单`,
			icon: 'success'
		})
	}
}

// 开始学习
const startLearning = (item: any) => {
	// 跳转到学习页面
	uni.navigateTo({
		url: `/pages/learning/learning?type=new&wordlist=${item.id}`
	})
}

// 查看详情
const viewDetails = (item: any) => {
	uni.showModal({
		title: item.name,
		content: `分类：${item.category}\n词汇数：${item.wordCount}\n已学习：${item.learnedCount}\n进度：${item.progress}%\n描述：${item.description}`,
		showCancel: false
	})
}

// 计算滚动区域高度
const calculateScrollHeight = () => {
	const systemInfo = uni.getSystemInfoSync()
	const windowHeight = systemInfo.windowHeight
	// 减去搜索栏高度和tabbar高度
	const searchHeight = 120 // 搜索栏高度
	const tabbarHeight = 110 // tabbar高度
	scrollHeight.value = windowHeight - searchHeight - tabbarHeight
}

// 监听滚动事件
const handleScroll = (e: any) => {
	scrollTop.value = e.detail.scrollTop
	// 只有当用户滚动超过300rpx时才显示按钮
	showBackToTop.value = scrollTop.value > 300
}

// 返回顶部
const scrollToTop = () => {
	// 先设置一个临时值来触发滚动
	scrollTop.value = 1
	// 然后在下一帧设置为0，确保滚动到顶部
	nextTick(() => {
		scrollTop.value = 0
	})
}

// 页面加载时初始化
onMounted(() => {
	nextTick(() => {
		calculateScrollHeight()
		checkHasMore()
	})
})
</script>

<style lang="scss">
page {
	background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
	height: 100vh;
}

.wordlist-container {
	height: 100vh;
	display: flex;
	flex-direction: column;
	box-sizing: border-box;
}

/* 搜索栏 */
.search-section {
	padding: 40rpx 30rpx 20rpx 30rpx;
	background: #ffffff;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
}

.search-input {
	padding: 16rpx;
	height: 80rpx;
	border-radius: 40rpx;
	background: #f8f9fa;
	border: 1px solid #e9ecef;
	font-size: 28rpx;
}

/* 滚动区域 */
.wordlist-scroll {
	flex: 1;
	padding: 20rpx 30rpx 140rpx 30rpx;
}

/* 词单网格 */
.wordlist-grid {
	display: flex;
	flex-direction: column;
	gap: 24rpx;
}

/* 词单卡片 */
.wordlist-card {
	background: #ffffff;
	border-radius: 20rpx;
	padding: 30rpx;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
	border: 1px solid #f0f0f0;
	transition: all 0.3s ease;

	&:active {
		transform: translateY(-4rpx);
		box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.12);
	}
}

/* 卡片头部 */
.card-header {
	margin-bottom: 20rpx;
}

.wordlist-basic {
	width: 100%;
}

.wordlist-name {
	font-family: $voca-primary-font;
	font-weight: $font-weight-bold;
	font-size: 32rpx;
	color: #000000;
	margin-bottom: 8rpx;
	display: block;
}

.wordlist-category {
	font-family: $voca-secondary-font;
	font-size: 24rpx;
	color: #666666;
	display: block;
}

/* 卡片描述 */
.card-description {
	margin-bottom: 24rpx;
}

.wordlist-description {
	font-family: $voca-secondary-font;
	font-size: 26rpx;
	color: #666666;
	line-height: 1.5;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
}

/* 统计信息 */
.card-stats {
	display: flex;
	align-items: center;
	justify-content: space-around;
	margin-bottom: 20rpx;
	padding: 20rpx 0;
	background: #f8f9fa;
	border-radius: 12rpx;
}

.stat-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	flex: 1;

	.stat-number {
		font-family: $voca-primary-font;
		font-weight: $font-weight-bold;
		font-size: 28rpx;
		color: #000000;
		margin-bottom: 4rpx;
	}

	.stat-label {
		font-family: $voca-secondary-font;
		font-size: 22rpx;
		color: #666666;
	}
}

.stat-divider {
	width: 1px;
	height: 40rpx;
	background: #e9ecef;
}

/* 进度条 */
.progress-section {
	margin-bottom: 24rpx;
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

/* 卡片内容布局 */
.card-content {
	display: flex;
	align-items: stretch;
	gap: 30rpx;
}

/* 左侧信息区域 */
.card-left {
	flex: 1;
	display: flex;
	flex-direction: column;
}

/* 右侧操作区域 */
.card-right {
	display: flex;
	align-items: flex-end;
	padding-bottom: 24rpx; /* 与进度条对齐 */
}

/* 操作按钮 */
.card-actions {
	display: flex;
	flex-direction: column;
	gap: 12rpx;
	width: 140rpx;

	wd-button {
		height: 50rpx;
		border-radius: 25rpx;
		font-size: 22rpx;
		flex: 1;
	}
}

/* 加载状态 */
.load-more,
.no-more {
	text-align: center;
	padding: 40rpx 0;
}

.load-more-text,
.no-more-text {
	font-family: $voca-secondary-font;
	font-size: 26rpx;
	color: #999999;
}

/* 返回顶部按钮 */
.back-to-top {
	position: fixed;
	right: 30rpx;
	bottom: 200rpx; /* 留出tabbar的高度 */
	width: 80rpx;
	height: 80rpx;
	background: #000000;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.5);
	z-index: 9999; /* 提高层级确保在tabbar之上 */
	opacity: 0; /* 默认隐藏 */
	visibility: hidden; /* 默认隐藏 */
	transform: translateY(20rpx);
	transition: all 0.3s ease;

	&.back-to-top-visible {
		opacity: 1;
		visibility: visible;
		transform: translateY(0);
	}

	&:active {
		transform: scale(0.9);
		background: #333333;
	}
}
</style>