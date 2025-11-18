<template>
	<view class="wordlist-container">
		<!-- 搜索栏 -->
		<view class="search-section">
			<wd-input
				v-model="searchText"
				class="search-input"
				clearable
				placeholder="搜索词单名称"
				@input="debouncedSearch"
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
					:key="item.wordListId"
					@click="selectWordlist(item)"
				>
					<view class="card-content">
						<!-- 左侧信息区域 -->
						<view class="card-left">
							<!-- 词单卡片头部 -->
							<view class="card-header">
								<view class="wordlist-basic">
									<text class="wordlist-name">{{ item.wordListName }}</text>
									<text class="wordlist-category">{{ item.isSystem ? '系统词单' : '自定义词单' }}</text>
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
									<text class="stat-number">{{ Math.floor(item.wordCount * 0.3).toLocaleString() }}</text>
									<text class="stat-label">已学习</text>
								</view>
								<view class="stat-divider"></view>
								<view class="stat-item">
									<text class="stat-number">30%</text>
									<text class="stat-label">进度</text>
								</view>
							</view>

							<!-- 进度条 -->
							<view class="progress-section">
								<view class="progress-bar">
									<view class="progress-fill" style="width: 30%"></view>
								</view>
							</view>
						</view>

						<!-- 右侧操作按钮区域 -->
						<view class="card-right">
							<view class="card-actions">
								<wd-button
									:type="item.joined ? 'info' : 'primary'"
									size="small"
									round
									@click.stop="toggleWordlist(item)"
								>
									{{ item.joined ? '已添加' : '添加' }}
								</wd-button>
							</view>
						</view>
					</view>
				</view>
			</view>

			<!-- 加载更多提示 -->
			<view v-if="loading" class="loading-more">
				<wd-loading type="ring" size="20" color="#007bff"></wd-loading>
				<text class="loading-text">加载中...</text>
			</view>

			<!-- 没有更多数据 -->
			<view v-if="!hasMore && wordlistData.length > 0" class="no-more">
				<text class="no-more-text">没有更多词单了</text>
			</view>

			<!-- 空状态 -->
			<view v-if="!loading && wordlistData.length === 0" class="empty-state">
				<wd-icon name="search" size="48" color="#cccccc"></wd-icon>
				<text class="empty-text">暂无词单数据</text>
			</view>
		</scroll-view>

		<!-- 返回顶部按钮 -->
		<view
			v-if="showBackToTop"
			class="back-to-top"
			@click="scrollToTop"
		>
			<wd-icon name="arrow-up" size="24" color="#ffffff"></wd-icon>
		</view>

		<!-- 自定义底部导航栏 -->
		<CustomTabbar />
	</view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import CustomTabbar from '@/components/custom-tabbar/custom-tabbar.vue'
import { wordlistAPI } from '@/api/wordlist.js'

// 搜索关键词
const searchText = ref('')

// 搜索防抖定时器
let searchTimer: NodeJS.Timeout | null = null

// 防抖搜索函数
const debouncedSearch = () => {
	if (searchTimer) {
		clearTimeout(searchTimer)
	}
	searchTimer = setTimeout(async () => {
		await onSearch()
	}, 500) // 500ms防抖延迟
}

// 分页相关
const pageSize = 10
const currentPage = ref(1)
const hasMore = ref(true)
const scrollHeight = ref(0)

// 返回顶部相关
const showBackToTop = ref(true)
const scrollTop = ref(0)

// 词单数据（从API获取）
const wordlistData = ref([])

// 分页信息
const pagination = ref({
	current: 1,
	pageSize: 10,
	total: 0,
	pages: 0
})

// 加载状态
const loading = ref(false)

// 显示的词单列表（直接使用后端返回的数据）
const displayWordlist = computed(() => {
	return wordlistData.value
})

// 添加或移除词单
const toggleWordlist = async (item: any) => {
	try {
		if (item.joined) {
			// 移除词单
			await wordlistAPI.removeUserWordlist(item.wordListId)
			uni.showToast({
				title: '已移除词单',
				icon: 'success'
			})

			// 通知首页刷新词单列表
			uni.$emit('wordlistChanged', {
				action: 'remove',
				wordListId: item.wordListId,
				wordListName: item.wordListName
			})
		} else {
			// 添加词单
			await wordlistAPI.addUserWordlist(item.wordListId)
			uni.showToast({
				title: '已添加词单',
				icon: 'success'
			})

			// 通知首页刷新词单列表
			uni.$emit('wordlistChanged', {
				action: 'add',
				wordListId: item.wordListId,
				wordListName: item.wordListName
			})
		}

		// 重新加载词单列表以获取最新状态
		await loadWordlists(true)
	} catch (error) {
		console.error('操作失败:', error)
		uni.showToast({
			title: '操作失败',
			icon: 'none'
		})
	}
}

// 选择词单
const selectWordlist = (item: any) => {
	uni.navigateTo({
		url: `/pages/learning/learning?wordlistId=${item.wordListId}&wordlistName=${encodeURIComponent(item.wordListName)}`
	})
}

// 搜索处理
const onSearch = async () => {
	currentPage.value = 1
	await loadWordlists(true)
}

// 加载更多
const loadMore = async () => {
	if (!hasMore.value || loading.value) return

	currentPage.value++
	await loadWordlists(false)
}

// 滚动处理
const handleScroll = (e: any) => {
	const scrollTop = e.detail.scrollTop
	showBackToTop.value = scrollTop > 200
}

// 返回顶部
const scrollToTop = () => {
	scrollTop.value = 0
}

// 获取词单列表
const loadWordlists = async (reset = false) => {
	if (loading.value) return

	try {
		loading.value = true

		if (reset) {
			currentPage.value = 1
			wordlistData.value = []
		}

		const params = {
			page: currentPage.value,
			limit: pageSize,
			type: 'all',
			search: searchText.value
		}

		const response = await wordlistAPI.getWordlists(params)

		if (response && response.code === 200) {
			const { wordLists, pagination: pagi } = response.data

			if (reset) {
				wordlistData.value = wordLists
			} else {
				wordlistData.value.push(...wordLists)
			}

			pagination.value = pagi
			hasMore.value = currentPage.value < pagi.pages
		}
	} catch (error) {
		console.error('获取词单列表失败:', error)
		uni.showToast({
			title: '获取词单列表失败',
			icon: 'none'
		})
	} finally {
		loading.value = false
	}
}

// 页面加载时初始化
onMounted(async () => {
	await nextTick()

	// 获取系统信息计算滚动高度
	const systemInfo = uni.getSystemInfoSync()
	const windowHeight = systemInfo.windowHeight
	// 减去搜索栏、导航栏等高度
	scrollHeight.value = windowHeight - 200

	// 加载词单列表
	await loadWordlists(true)
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
	position: relative;
}

/* 搜索栏 */
.search-section {
	padding: 20rpx 30rpx;
	background: #ffffff;
	border-bottom: 1px solid #f0f0f0;
	position: sticky;
	top: 0;
	z-index: 10;
}

.search-input {
	background: #f8f9fa;
	border-radius: 20rpx;
	padding: 20rpx 30rpx;
	border: 1px solid #e9ecef;
}

/* 滚动容器 */
.wordlist-scroll {
	flex: 1;
	padding: 20rpx 30rpx 140rpx 30rpx;
}

/* 词单网格 */
.wordlist-grid {
	display: flex;
	flex-direction: column;
	gap: 20rpx;
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
		transform: scale(0.98);
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
	}
}

.card-content {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	gap: 20rpx;
}

/* 左侧信息区域 */
.card-left {
	flex: 1;
	min-width: 0;
}

.card-header {
	margin-bottom: 16rpx;
}

.wordlist-basic {
	display: flex;
	flex-direction: column;
	gap: 8rpx;
}

.wordlist-name {
	font-family: 'Lexend', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
	font-weight: 500;
	font-size: 32rpx;
	color: #000000;
	line-height: 1.4;
}

.wordlist-category {
	font-family: 'Itim', 'Lexend', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
	font-size: 24rpx;
	color: #666666;
	width: 120rpx;
	background: #f0f0f0;
	padding: 4rpx 12rpx;
	border-radius: 12rpx;
	display: inline-block;
}

.card-description {
	margin-bottom: 20rpx;
}

.wordlist-description {
	font-family: 'Itim', 'Lexend', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
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
	gap: 20rpx;
	margin-bottom: 16rpx;
}

.stat-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 4rpx;
}

.stat-number {
	font-family: 'Lexend', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
	font-weight: 700;
	font-size: 28rpx;
	color: #000000;
}

.stat-label {
	font-family: 'Itim', 'Lexend', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
	font-size: 22rpx;
	color: #999999;
}

.stat-divider {
	width: 1px;
	height: 40rpx;
	background: #e9ecef;
}

/* 进度条 */
.progress-section {
	margin-top: 12rpx;
}

.progress-bar {
	height: 6rpx;
	background: #e9ecef;
	border-radius: 3rpx;
	overflow: hidden;
}

.progress-fill {
	height: 100%;
	background: #000000;
	transition: width 0.3s ease;
}

/* 右侧操作区域 */
.card-right {
	display: flex;
	align-items: center;
}

.card-actions {
	display: flex;
	flex-direction: column;
	gap: 12rpx;
}

/* 加载状态 */
.loading-more {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 40rpx 0;
	gap: 16rpx;
}

.loading-text {
	font-family: 'Itim', 'Lexend', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
	font-size: 26rpx;
	color: #999999;
}

/* 没有更多数据 */
.no-more {
	display: flex;
	justify-content: center;
	padding: 40rpx 0;
}

.no-more-text {
	font-family: 'Itim', 'Lexend', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
	font-size: 26rpx;
	color: #cccccc;
}

/* 空状态 */
.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 120rpx 0;
	gap: 20rpx;
}

.empty-text {
	font-family: 'Itim', 'Lexend', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
	font-size: 28rpx;
	color: #999999;
}

/* 返回顶部按钮 */
.back-to-top {
	position: fixed;
	right: 30rpx;
	bottom: 180rpx;
	width: 80rpx;
	height: 80rpx;
	background: rgba(0, 0, 0, 0.6);
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 100;
	transition: all 0.3s ease;

	&:active {
		transform: scale(0.9);
		background: rgba(0, 0, 0, 0.8);
	}
}
</style>