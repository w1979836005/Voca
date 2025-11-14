<template>
	<view class="manage-container">
		<!-- 顶部导航栏 -->
		<view class="header-nav">
			<view class="nav-left" @click.stop="goBack">
				<wd-icon name="arrow-left" size="18" color="#000000"></wd-icon>
			</view>
			<view class="nav-title">词单管理</view>
			<view class="nav-right" @click="addWordlist">
				<wd-icon name="plus" size="18" color="#000000"></wd-icon>
			</view>
		</view>

		<!-- 搜索栏 -->
		<view class="search-section">
			<wd-input
				v-model="searchText"
				class="search-input"
				placeholder="搜索词单名称"
				clearable
				@input="onSearch"
			>
				<template #prefix>
					<wd-icon name="search" size="18" color="#999999"></wd-icon>
				</template>
			</wd-input>
		</view>

		<!-- 统计信息 -->
		<view class="stats-section">
			<view class="stats-card">
				<text class="stats-number">{{ myWordlistCount }}</text>
				<text class="stats-label">我的词单</text>
			</view>
			<view class="stats-card">
				<text class="stats-number">{{ getTotalWords() }}</text>
				<text class="stats-label">总词汇数</text>
			</view>
		</view>

		<!-- 词单列表 -->
		<view class="wordlist-section">
			<view class="section-header">
				<text class="section-title">我的词单</text>
				<view class="sort-selector" @click="showSortOptions">
					<text class="sort-text">{{ sortOption }}</text>
					<wd-icon name="arrow-down" size="16" color="#666666"></wd-icon>
				</view>
			</view>

			<view class="wordlist-list">
				<view
					class="wordlist-item"
					v-for="(item, index) in filteredWordlist"
					:key="item.id"
					@click="viewWordlistDetail(item)"
				>
					<view class="item-content">
						<view class="item-info">
							<text class="item-name">{{ item.name }}</text>
							<text class="item-category">{{ item.category }}</text>
						</view>
						<view class="item-stats">
							<view class="word-count">
								<text class="count-number">{{ item.wordCount }}</text>
								<text class="count-label">词</text>
							</view>
							<view class="progress-info">
								<view class="progress-bar">
									<view
										class="progress-fill"
										:style="{ width: item.progress + '%' }"
									></view>
								</view>
								<text class="progress-text">{{ item.progress }}%</text>
							</view>
						</view>
					</view>
					<view class="item-actions" @click.stop>
						<!-- <wd-button
							type="info"
							size="small"
							custom-class="action-btn"
							@click="editWordlist(item)"
						>
							编辑
						</wd-button> -->
						<wd-button
							type="danger"
							size="small"
							custom-class="action-btn"
							@click="removeWordlist(item)"
						>
							移除
						</wd-button>
					</view>
				</view>
			</view>
		</view>

		<!-- 空状态 -->
		<view class="empty-state" v-if="filteredWordlist.length === 0">
			<view class="empty-icon">
				<wd-icon name="file-text" size="60" color="#cccccc"></wd-icon>
			</view>
			<text class="empty-text">{{ searchText ? '未找到相关词单' : '暂无词单' }}</text>
			<wd-button
				v-if="!searchText"
				type="primary"
				round
				@click="addWordlist"
			>
				添加词单
			</wd-button>
		</view>

		<!-- 自定义TabBar -->
		<custom-tabbar />
	</view>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted } from 'vue'
import CustomTabbar from '@/components/custom-tabbar/custom-tabbar.vue'

// 搜索关键词
const searchText = ref('')

// 排序选项
const sortOption = ref('添加时间')
const sortOptions = ['添加时间', '名称', '词汇数', '进度']

// 我的词单数据（从首页复制并扩展）
const myWordlistIds = ref(['wordlist-1', 'wordlist-3', 'wordlist-5'])
const allWordlistData = reactive([
	{
		id: 'wordlist-1',
		name: 'CET-4核心词汇',
		category: '考试词汇',
		description: '大学英语四级考试核心词汇，涵盖最常考的高频词汇',
		wordCount: 4500,
		learnedCount: 1200,
		progress: 27,
		addedTime: '2024-01-15',
		difficulty: 'intermediate'
	},
	{
		id: 'wordlist-3',
		name: '雅思核心词汇',
		category: '考试词汇',
		description: 'IELTS考试高频词汇，适合出国留学准备',
		wordCount: 3500,
		learnedCount: 1500,
		progress: 43,
		addedTime: '2024-01-20',
		difficulty: 'advanced'
	},
	{
		id: 'wordlist-5',
		name: '商务英语词汇',
		category: '职场应用',
		description: '商务场景常用词汇，包含会议、谈判、邮件等',
		wordCount: 2000,
		learnedCount: 500,
		progress: 25,
		addedTime: '2024-02-15',
		difficulty: 'intermediate'
	}
])

// 我的词单列表
const myWordlist = computed(() => {
	return allWordlistData.filter(item => myWordlistIds.value.includes(item.id))
})

// 我的词单数量
const myWordlistCount = computed(() => {
	return myWordlist.value.length
})

// 过滤后的词单列表
const filteredWordlist = computed(() => {
	if (!searchText.value) {
		return sortWordlist(myWordlist.value)
	}

	const searchLower = searchText.value.toLowerCase()
	return sortWordlist(myWordlist.value.filter(item =>
		item.name.toLowerCase().includes(searchLower) ||
		item.category.toLowerCase().includes(searchLower) ||
		item.description.toLowerCase().includes(searchLower)
	))
})

// 排序词单
const sortWordlist = (wordlist: any[]) => {
	const sorted = [...wordlist]
	switch (sortOption.value) {
		case '添加时间':
			return sorted.sort((a, b) => new Date(b.addedTime).getTime() - new Date(a.addedTime).getTime())
		case '名称':
			return sorted.sort((a, b) => a.name.localeCompare(b.name))
		case '词汇数':
			return sorted.sort((a, b) => b.wordCount - a.wordCount)
		case '进度':
			return sorted.sort((a, b) => b.progress - a.progress)
		default:
			return sorted
	}
}

// 获取总词汇数
const getTotalWords = () => {
	return myWordlist.value.reduce((total, item) => total + item.wordCount, 0)
}

// 搜索处理
const onSearch = () => {
	// 搜索逻辑已在computed中处理
}

// 返回上一页
const goBack = () => {
	uni.navigateBack({
		delta: 1
	})
}

// 添加词单
const addWordlist = () => {
	uni.showModal({
		title: '添加词单',
		content: '这里可以添加新的词单功能',
		showCancel: true,
		success: (res) => {
			if (res.confirm) {
				uni.showToast({
					title: '功能开发中',
					icon: 'none'
				})
			}
		}
	})
}

// 编辑词单
// const editWordlist = (item: any) => {
// 	uni.showModal({
// 		title: '编辑词单',
// 		content: `正在编辑 "${item.name}"`,
// 		showCancel: true,
// 		success: (res) => {
// 			if (res.confirm) {
// 				uni.showToast({
// 					title: '功能开发中',
// 					icon: 'none'
// 				})
// 			}
// 		}
// 	})
// }

// 移除词单
const removeWordlist = (item: any) => {
	uni.showModal({
		title: '移除词单',
		content: `确定要将"${item.name}"从我的词单中移除吗？`,
		success: (res) => {
			if (res.confirm) {
				const index = myWordlistIds.value.indexOf(item.id)
				if (index > -1) {
					myWordlistIds.value.splice(index, 1)
				}

				uni.showToast({
					title: '已移除',
					icon: 'success'
				})
			}
		}
	})
}

// 查看词单详情
const viewWordlistDetail = (item: any) => {
	uni.showModal({
		title: item.name,
		content: `分类：${item.category}\n词汇数：${item.wordCount}\n已学习：${item.learnedCount}\n进度：${item.progress}%\n添加时间：${item.addedTime}`,
		showCancel: false
	})
}

// 显示排序选项
const showSortOptions = () => {
	uni.showActionSheet({
		itemList: sortOptions,
		success: (res) => {
			sortOption.value = sortOptions[res.tapIndex]
		}
	})
}

// 页面加载时初始化
onMounted(() => {
	console.log('词单管理页面加载完成')
})
</script>

<style lang="scss">
page {
	background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
	height: 100vh;
}

.manage-container {
	min-height: 100vh;
	padding: 0 30rpx 140rpx 30rpx;
	display: flex;
	flex-direction: column;
	gap: 24rpx;
	box-sizing: border-box;
	position: relative;
	z-index: 1;
}

/* 顶部导航栏 */
.header-nav {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 30rpx 0 15rpx 0;
	position: relative;
	z-index: 10;
}

.nav-left, .nav-right {
	width: 48rpx;
	height: 48rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all 0.3s ease;
	border-radius: 50%;
	background: transparent;
	pointer-events: auto;
	position: relative;
	z-index: 11;

	&:active {
		background: #f0f0f0;
		transform: scale(0.95);
	}
}

.nav-title {
	font-family: $voca-primary-font;
	font-weight: $font-weight-medium;
	font-size: 26rpx;
	color: #000000;
}

/* 搜索栏 */
.search-section {
	margin-top: 10rpx;
}

.search-input {
	height: 70rpx;
	border-radius: 35rpx;
	background: #ffffff;
	border: 1px solid #e9ecef;
	padding: 0 24rpx;
}

/* 统计信息 */
.stats-section {
	display: flex;
	gap: 16rpx;
}

.stats-card {
	flex: 1;
	background: #ffffff;
	border-radius: 16rpx;
	padding: 24rpx;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
	border: 1px solid #f0f0f0;
	display: flex;
	flex-direction: column;
	align-items: center;
}

.stats-number {
	font-family: $voca-primary-font;
	font-weight: $font-weight-bold;
	font-size: 32rpx;
	color: #000000;
	margin-bottom: 6rpx;
}

.stats-label {
	font-family: $voca-secondary-font;
	font-size: 24rpx;
	color: #666666;
}

/* 词单列表 */
.wordlist-section {
	background: #ffffff;
	border-radius: 24rpx;
	padding: 30rpx;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
	border: 1px solid #f0f0f0;
}

.section-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 24rpx;
}

.section-title {
	font-family: $voca-primary-font;
	font-weight: $font-weight-bold;
	font-size: 28rpx;
	color: #000000;
}

.sort-selector {
	display: flex;
	align-items: center;
	gap: 8rpx;
	cursor: pointer;

	.sort-text {
		font-family: $voca-secondary-font;
		font-size: 24rpx;
		color: #666666;
	}
}

.wordlist-list {
	display: flex;
	flex-direction: column;
	gap: 20rpx;
}

.wordlist-item {
	background: #f8f9fa;
	border-radius: 16rpx;
	padding: 24rpx;
	display: flex;
	align-items: center;
	gap: 20rpx;
	transition: all 0.3s ease;
	border: 1px solid transparent;

	&:active {
		background: #e9ecef;
		transform: scale(0.98);
	}
}

.item-content {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 12rpx;
}

.item-info {
	display: flex;
	flex-direction: column;
	gap: 6rpx;
}

.item-name {
	font-family: $voca-primary-font;
	font-weight: $font-weight-bold;
	font-size: 28rpx;
	color: #000000;
}

.item-category {
	font-family: $voca-secondary-font;
	font-size: 22rpx;
	color: #666666;
}

.item-stats {
	display: flex;
	align-items: center;
	gap: 20rpx;
}

.word-count {
	display: flex;
	align-items: baseline;
	gap: 4rpx;
}

.count-number {
	font-family: $voca-primary-font;
	font-weight: $font-weight-bold;
	font-size: 24rpx;
	color: #000000;
}

.count-label {
	font-family: $voca-secondary-font;
	font-size: 20rpx;
	color: #666666;
}

.progress-info {
	display: flex;
	align-items: center;
	gap: 12rpx;
	flex: 1;
}

.progress-bar {
	width: 60rpx;
	height: 6rpx;
	background: #e9ecef;
	border-radius: 3rpx;
	overflow: hidden;

	.progress-fill {
		height: 100%;
		background: #000000;
		border-radius: 3rpx;
		transition: width 0.3s ease;
	}
}

.progress-text {
	font-family: $voca-secondary-font;
	font-size: 20rpx;
	color: #000000;
	min-width: 50rpx;
	text-align: right;
}

.item-actions {
	display: flex;
	flex-direction: column;
	gap: 8rpx;
}

.action-btn {
	height: 60rpx;
	font-size: 20rpx;
	border-radius: 12rpx;
	margin: 0;
}

/* 空状态 */
.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 120rpx 0;
	gap: 24rpx;
}

.empty-icon {
	margin-bottom: 16rpx;
}

.empty-text {
	font-family: $voca-secondary-font;
	font-size: 28rpx;
	color: #999999;
}
</style>