<template>
	<view class="profile-container">
		<!-- 用户信息头部 -->
		<view class="profile-header">
			<view class="user-info">
				<view class="avatar-section">
					<view class="avatar">
						<image
							class="avatar-img"
							src="/static/logo.png"
							mode="aspectFit"
						></image>
					</view>
				</view>
				<view class="user-details">
					<text class="username">{{ userInfo.username }}</text>
					<text class="email">{{ userInfo.email }}</text>
					<text class="join-date">加入时间：{{ userInfo.joinDate }}</text>
				</view>
			</view>
		</view>

		<!-- 学习统计 -->
		<view class="stats-section">
			<view class="section-title">
				<text class="title-text">学习统计</text>
			</view>
			<view class="stats-grid">
				<view class="stat-card">
					<view class="stat-number">{{ stats.totalWords }}</view>
					<text class="stat-label">总学习词数</text>
				</view>
				<view class="stat-card">
					<view class="stat-number">{{ stats.todayLearned }}</view>
					<text class="stat-label">今日学习</text>
				</view>
				<view class="stat-card">
					<view class="stat-number">{{ stats.totalDays }}</view>
					<text class="stat-label">学习天数</text>
				</view>
				<view class="stat-card">
					<view class="stat-number">{{ stats.continuousDays }}</view>
					<text class="stat-label">连续学习</text>
				</view>
			</view>
		</view>

		<!-- 学习成就 -->
		<view class="achievements-section">
			<view class="section-title">
				<text class="title-text">学习成就</text>
			</view>
			<view class="achievements-grid">
				<view
					class="achievement-item"
					v-for="(achievement, index) in achievements"
					:key="index"
					:class="{ 'achievement-unlocked': achievement.unlocked }"
				>
					<view class="achievement-icon">{{ achievement.icon }}</view>
					<view class="achievement-info">
						<text class="achievement-name">{{ achievement.name }}</text>
						<text class="achievement-desc">{{ achievement.description }}</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 功能菜单 -->
		<view class="menu-section">
			<view class="section-title">
				<text class="title-text">设置与帮助</text>
			</view>
			<view class="menu-list">
				<view class="menu-item" @click="goToSettings">
					<view class="menu-icon">
						<wd-icon name="setting" size="24" color="#000000"></wd-icon>
					</view>
					<view class="menu-content">
						<text class="menu-title">设置</text>
						<text class="menu-desc">个性化设置</text>
					</view>
					<view class="menu-arrow">
						<wd-icon name="arrow-right" size="16" color="#cccccc"></wd-icon>
					</view>
				</view>

				<view class="menu-item" @click="showStatistics">
					<view class="menu-icon">
						<wd-icon name="chart" size="24" color="#000000"></wd-icon>
					</view>
					<view class="menu-content">
						<text class="menu-title">学习统计</text>
						<text class="menu-desc">详细数据分析</text>
					</view>
					<view class="menu-arrow">
						<wd-icon name="arrow-right" size="16" color="#cccccc"></wd-icon>
					</view>
				</view>

				<view class="menu-item" @click="showBackup">
					<view class="menu-icon">
						<wd-icon name="cloud" size="24" color="#000000"></wd-icon>
					</view>
					<view class="menu-content">
						<text class="menu-title">数据备份</text>
						<text class="menu-desc">云端同步学习进度</text>
					</view>
					<view class="menu-arrow">
						<wd-icon name="arrow-right" size="16" color="#cccccc"></wd-icon>
					</view>
				</view>

				<view class="menu-item" @click="showHelp">
					<view class="menu-icon">
						<wd-icon name="question" size="24" color="#000000"></wd-icon>
					</view>
					<view class="menu-content">
						<text class="menu-title">帮助中心</text>
						<text class="menu-desc">使用指南和常见问题</text>
					</view>
					<view class="menu-arrow">
						<wd-icon name="arrow-right" size="16" color="#cccccc"></wd-icon>
					</view>
				</view>
			</view>
		</view>

		<!-- 退出登录 -->
		<view class="logout-section">
			<wd-button
				type="info"
				class="logout-btn"
				block
				round
				@click="showLogoutConfirm"
			>
				退出登录
			</wd-button>
		</view>
	</view>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'

// 用户信息
const userInfo = reactive({
	username: 'ALEX',
	email: 'alex@example.com',
	joinDate: '2024-01-15'
})

// 学习统计
const stats = reactive({
	totalWords: 6845,
	todayLearned: 25,
	totalDays: 127,
	continuousDays: 15
})

// 学习成就
const achievements = reactive([
	{
		name: '初学者',
		description: '开始学习之旅',
		icon: '🌱',
		unlocked: true
	},
	{
		name: '坚持者',
		description: '连续学习7天',
		icon: '🔥',
		unlocked: true
	},
	{
		name: '词汇达人',
		description: '学习1000个单词',
		icon: '📚',
		unlocked: true
	},
	{
		name: '学霸',
		description: '学习5000个单词',
		icon: '🎓',
		unlocked: true
	},
	{
		name: '词汇大师',
		description: '学习10000个单词',
		icon: '🏆',
		unlocked: false
	},
	{
		name: '学习专家',
		description: '连续学习30天',
		icon: '⭐',
		unlocked: false
	}
])

// 跳转到设置页面
const goToSettings = () => {
	uni.navigateTo({
		url: '/pages/settings/settings'
	})
}

// 显示统计详情
const showStatistics = () => {
	uni.showModal({
		title: '学习统计详情',
		content: '即将为您展示详细的学习数据分析',
		showCancel: false
	})
}

// 显示备份选项
const showBackup = () => {
	uni.showActionSheet({
		itemList: [
			{
				text: '备份到云端',
				color: '#007aff'
			},
			{
				text: '从云端恢复',
				color: '#007aff'
			}
		],
		success: (res) => {
			uni.showToast({
				title: res.tapIndex === 0 ? '开始备份' : '开始恢复',
				icon: 'success'
			})
		}
	})
}

// 显示帮助中心
const showHelp = () => {
	uni.showModal({
		title: '帮助中心',
		content: '欢迎查看Voca使用指南和常见问题解答',
		showCancel: false
	})
}

// 显示退出登录确认
const showLogoutConfirm = () => {
	uni.showModal({
		title: '退出登录',
		content: '确定要退出登录吗？',
		success: () => {
			// 清除登录状态
			// 这里可以调用登出API

			// 跳转到登录页面
			uni.reLaunch({
				url: '/pages/login/login'
			})

			uni.showToast({
				title: '已退出登录',
				icon: 'success'
			})
		}
	})
}

// 页面加载时
onMounted(() => {
	console.log('我的页面加载完成')
})
</script>

<style lang="scss">
page {
	background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
	height: 100vh;
}

.profile-container {
	padding: 40rpx;
	min-height: 100vh;
	padding-bottom: 120rpx; /* 为tabbar留出空间 */
}

/* 用户信息头部 */
.profile-header {
	background: #ffffff;
	border-radius: 24rpx;
	padding: 40rpx;
	margin-bottom: 40rpx;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
	border: 1px solid #f0f0f0;
	display: flex;
	align-items: center;
	gap: 30rpx;
}

.avatar-section {
	flex-shrink: 0;
}

.avatar {
	width: 100rpx;
	height: 100rpx;
	border-radius: 50rpx;
	background: #f8f9fa;
	display: flex;
	justify-content: center;
	align-items: center;
	overflow: hidden;
}

.avatar-img {
	width: 80rpx;
	height: 80rpx;
	border-radius: 40rpx;
}

.user-details {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 8rpx;
}

.username {
	font-family: $voca-primary-font;
	font-weight: $font-weight-bold;
	font-size: 32rpx;
	color: #000000;
}

.email {
	font-family: $voca-primary-font;
	font-size: 26rpx;
	color: #666666;
}

.join-date {
	font-family: $voca-primary-font;
	font-size: 24rpx;
	color: #999999;
}

/* 统计部分 */
.stats-section {
	margin-bottom: 40rpx;
}

.section-title {
	display: flex;
	align-items: center;
	margin-bottom: 30rpx;

	.title-text {
		font-family: $voca-primary-font;
		font-weight: $font-weight-medium;
		font-size: 32rpx;
		color: #000000;
	}
}

.stats-grid {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 20rpx;
}

.stat-card {
	background: #ffffff;
	border-radius: 16rpx;
	padding: 30rpx;
	text-align: center;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.1);
	border: 1px solid #f0f0f0;
}

.stat-number {
	font-family: $voca-primary-font;
	font-weight: $font-weight-bold;
	font-size: 36rpx;
	color: #000000;
	margin-bottom: 8rpx;
}

.stat-label {
	font-family: $voca-primary-font;
	font-size: 24rpx;
	color: #666666;
}

/* 成就部分 */
.achievements-section {
	margin-bottom: 40rpx;
}

.achievements-grid {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 20rpx;
}

.achievement-item {
	background: #ffffff;
	border-radius: 16rpx;
	padding: 30rpx;
	text-align: center;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.1);
	border: 1px solid #f0f0f0;
	opacity: 0.6;
	transition: all 0.3s ease;

	&.achievement-unlocked {
		opacity: 1;
	}
}

.achievement-icon {
	font-size: 40rpx;
	line-height: 1;
	margin-bottom: 12rpx;
}

.achievement-info {
	display: flex;
	flex-direction: column;
	gap: 4rpx;
}

.achievement-name {
	font-family: $voca-primary-font;
	font-weight: $font-weight-medium;
	font-size: 26rpx;
	color: #333333;
}

.achievement-desc {
	font-family: $voca-primary-font;
	font-size: 22rpx;
	color: #666666;
}

/* 菜单部分 */
.menu-section {
	margin-bottom: 40rpx;
}

.menu-list {
	background: #ffffff;
	border-radius: 16rpx;
	overflow: hidden;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.1);
	border: 1px solid #f0f0f0;
}

.menu-item {
	display: flex;
	align-items: center;
	padding: 30rpx;
	border-bottom: 1px solid #f8f9fa;
	transition: background-color 0.3s ease;

	&:last-child {
		border-bottom: none;
	}

	&:active {
		background-color: #f8f9fa;
	}
}

.menu-icon {
	width: 60rpx;
	height: 60rpx;
	border-radius: 30rpx;
	background: #f8f9fa;
	display: flex;
	justify-content: center;
	align-items: center;
	margin-right: 20rpx;
}

.menu-content {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 4rpx;
}

.menu-title {
	font-family: $voca-primary-font;
	font-size: 28rpx;
	font-weight: $font-weight-medium;
	color: #333333;
}

.menu-desc {
	font-family: $voca-primary-font;
	font-size: 24rpx;
	color: #666666;
}

.menu-arrow {
	width: 40rpx;
	height: 40rpx;
	display: flex;
	justify-content: center;
	align-items: center;
}

/* 退出登录部分 */
.logout-section {
	position: fixed;
	bottom: 160rpx; /* 为tabbar留出空间 */
	left: 40rpx;
	right: 40rpx;
	width: calc(100% - 80rpx);
	max-width: 600rpx;
}

.logout-btn {
	height: 100rpx;
	font-size: 32rpx;
	font-family: $voca-primary-font;
	font-weight: $font-weight-medium;
	background: transparent !important;
	border: 2px solid #000000 !important;
	color: #000000 !important;
	border-radius: 50rpx;
}
</style>