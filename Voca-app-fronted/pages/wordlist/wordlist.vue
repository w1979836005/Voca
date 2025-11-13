<template>
	<view class="wordlist-container">
		<!-- 页面标题 -->
		<view class="page-header">
			<text class="page-title">词单管理</text>
		</view>

		<!-- 搜索栏 -->
		<view class="search-section">
			<wd-input
				v-model="searchText"
				class="search-input"
				clearable
				placeholder="搜索词单"
				@input="onSearch"
			/>
		</view>

		<!-- 词单列表 -->
		<view class="wordlist-list">
			<view
				class="wordlist-item"
				v-for="(item, index) in filteredWordlist"
				:key="index"
				@click="selectWordlist(item)"
			>
				<view class="wordlist-info">
					<view class="wordlist-header">
						<text class="wordlist-name">{{ item.name }}</text>
						<text class="wordlist-status" :class="getWordlistStatusClass(item.status)">
							{{ getWordlistStatusText(item.status) }}
						</text>
					</view>
					<text class="wordlist-description">{{ item.description }}</text>
					<view class="wordlist-stats">
						<text class="stat-item">{{ item.wordCount }} 词</text>
						<text class="stat-item">{{ item.learnedCount }} 已学</text>
						<text class="stat-item">{{ item.progress }}% 进度</text>
					</view>
				</view>
				<view class="wordlist-action">
					<text class="current-badge" v-if="item.id === currentWordlistId">当前</text>
				</view>
			</view>
		</view>

		<!-- 添加词单按钮 -->
		<view class="add-button-section">
			<wd-button
				type="primary"
				class="add-button"
				block
				round
				@click="addWordlist"
			>
				<wd-icon name="plus" size="18" color="#ffffff"></wd-icon>
				添加词单
			</wd-button>
		</view>
	</view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

// 搜索关键词
const searchText = ref('')

// 当前词单ID
const currentWordlistId = ref('wordlist-1')

// 词单数据
const wordlistData = ref([
	{
		id: 'wordlist-1',
		name: 'CET-4核心词汇',
		description: '大学英语四级考试必备词汇',
		wordCount: 4500,
		learnedCount: 2800,
		progress: 62,
		status: 'learning',
		category: '四级',
		difficulty: 'intermediate'
	},
	{
		id: 'wordlist-2',
		name: 'CET-6核心词汇',
		description: '大学英语六级考试必备词汇',
		wordCount: 2500,
		learnedCount: 1200,
		progress: 48,
		status: 'learning',
		category: '六级',
		difficulty: 'advanced'
	},
	{
		id: 'wordlist-3',
		name: '雅思核心词汇',
		description: 'IELTS考试核心词汇大全',
		wordCount: 3500,
		learnedCount: 1800,
		progress: 51,
		status: 'learning',
		category: '雅思',
		difficulty: 'advanced'
	},
	{
		id: 'wordlist-4',
		name: '托福核心词汇',
		description: 'TOEFL考试必备词汇集合',
		wordCount: 3000,
		learnedCount: 2200,
		progress: 73,
		status: 'completed',
		category: '托福',
		difficulty: 'advanced'
	},
	{
		id: 'wordlist-5',
		name: '商务英语词汇',
		description: '职场商务英语实用词汇',
		wordCount: 2000,
		learnedCount: 800,
		progress: 40,
		status: 'not-started',
		category: '商务',
		difficulty: 'intermediate'
	},
	{
		id: 'wordlist-6',
		name: '日常口语词汇',
		description: '日常口语高频词汇整理',
		wordCount: 1500,
		learnedCount: 900,
		progress: 60,
		status: 'learning',
		category: '口语',
		difficulty: 'basic'
	}
])

// 过滤后的词单列表
const filteredWordlist = computed(() => {
	if (!searchText.value) {
		return wordlistData.value
	}

	const searchLower = searchText.value.toLowerCase()
	return wordlistData.value.filter(item =>
		item.name.toLowerCase().includes(searchLower) ||
		item.description.toLowerCase().includes(searchLower) ||
		item.category.toLowerCase().includes(searchLower)
	)
})

// 获取词单状态文字
const getWordlistStatusText = (status: string) => {
	const statusMap: Record<string, string> = {
		'not-started': '未开始',
		'learning': '学习中',
		'completed': '已完成'
	}
	return statusMap[status] || '未知'
}

// 获取词单状态样式类
const getWordlistStatusClass = (status: string) => {
	const classMap: Record<string, string> = {
		'not-started': 'status-not-started',
		'learning': 'status-learning',
		'completed': 'status-completed'
	}
	return classMap[status] || 'status-unknown'
}

// 搜索处理
const onSearch = () => {
	console.log('搜索词单:', searchText.value)
}

// 选择词单
const selectWordlist = (item: any) => {
	console.log('选择词单:', item.name)

	// 这里可以切换到该词单的学习页面
	uni.showModal({
		title: '切换词单',
		content: `确定要切换到"${item.name}"吗？`,
		success: () => {
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
	})
}

// 添加词单
const addWordlist = () => {
	uni.showModal({
		title: '添加词单',
		content: '请输入词单名称',
		editable: true,
		placeholderText: '请输入词单名称',
		success: (res) => {
			if (res.content && res.content.trim()) {
				// 这里可以调用API添加词单
				const newWordlist = {
					id: `wordlist-${Date.now()}`,
					name: res.content.trim(),
					description: '自定义词单',
					wordCount: 0,
					learnedCount: 0,
					progress: 0,
					status: 'not-started',
					category: '自定义',
					difficulty: 'basic'
				}

				// 添加到词单列表
				wordlistData.value.push(newWordlist)

				uni.showToast({
					title: '词单添加成功',
					icon: 'success'
				})
			}
		}
	})
}

// 页面加载时
onMounted(() => {
	console.log('词单页面加载完成')
})
</script>

<style lang="scss">
page {
	background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
	height: 100vh;
}

.wordlist-container {
	padding: 40rpx;
	min-height: 100vh;
	padding-bottom: 120rpx; /* 为tabbar留出空间 */
}

/* 页面标题 */
.page-header {
	text-align: center;
	margin-bottom: 40rpx;
	padding-top: 40rpx;

	.page-title {
		font-family: $voca-primary-font;
		font-weight: $font-weight-bold;
		font-size: 40rpx;
		color: #000000;
	}
}

/* 搜索栏 */
.search-section {
	margin-bottom: 40rpx;
}

.search-input {
	height: 80rpx;
	border-radius: 40rpx;
	background: #ffffff;
	border: 1px solid #e9ecef;
}

/* 词单列表 */
.wordlist-list {
	margin-bottom: 80rpx;
}

.wordlist-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	background: #ffffff;
	border-radius: 16rpx;
	padding: 30rpx;
	margin-bottom: 20rpx;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.1);
	border: 1px solid #f0f0f0;
	transition: all 0.3s ease;

	&:active {
		transform: translateY(-2rpx);
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.15);
	}
}

.wordlist-info {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 12rpx;
}

.wordlist-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 8rpx;

	.wordlist-name {
		font-family: $voca-primary-font;
		font-weight: $font-weight-medium;
		font-size: 32rpx;
		color: #000000;
	}

	.wordlist-status {
		font-family: $voca-primary-font;
		font-size: 24rpx;
		padding: 4rpx 12rpx;
		border-radius: 12rpx;

		&.status-not-started {
			background: #f8f9fa;
			color: #666666;
		}

		&.status-learning {
			background: #e3f2fd;
			color: #1976d2;
		}

		&.status-completed {
			background: #e8f5e8;
			color: #2d572c;
		}
	}
}

.wordlist-description {
	font-family: $voca-secondary-font;
	font-size: 26rpx;
	color: #666666;
	line-height: 1.4;
	margin-bottom: 12rpx;
}

.wordlist-stats {
	display: flex;
	gap: 20rpx;

	.stat-item {
		font-family: $voca-primary-font;
		font-size: 24rpx;
		color: #666666;
	}
}

.wordlist-action {
	.current-badge {
		font-family: $voca-primary-font;
		font-size: 24rpx;
		color: #ffffff;
		background: #000000;
		padding: 8rpx 16rpx;
		border-radius: 12rpx;
		font-weight: $font-weight-medium;
	}
}

/* 添加按钮 */
.add-button-section {
	position: fixed;
	bottom: 160rpx; /* 为tabbar留出空间 */
	left: 40rpx;
	right: 40rpx;
	width: calc(100% - 80rpx);
	max-width: 600rpx;
}

.add-button {
	height: 100rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 12rpx;
	font-size: 32rpx;
	font-family: $voca-primary-font;
	font-weight: $font-weight-medium;
	border-radius: 50rpx;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.15);
}
</style>