<template>
	<view class="profile-container">
		<!-- 下拉刷新 -->
		<scroll-view
			class="scroll-container"
			scroll-y
			refresher-enabled
			:refresher-triggered="isRefreshing"
			@refresherrefresh="onRefresh"
		>
		<!-- 用户信息卡片 -->
		<view class="user-card">
			<view class="user-avatar-section">
				<view class="user-avatar">
					<image
						v-if="userInfo.userAvatar"
						:src="userInfo.userAvatar"
						class="avatar-image"
						mode="aspectFill"
						@error="onAvatarError"
					></image>
					<text v-else class="avatar-text">{{ getAvatarText(userInfo.username) }}</text>
				</view>
				<view class="user-level">
					<text class="level-text">{{ getUserLevel() }}</text>
				</view>
			</view>
			<view class="user-info">
				<text class="username">{{ userInfo.username }}</text>
				<text class="user-email">{{ userInfo.email }}</text>
				<text class="join-date">{{ formatJoinDate(userInfo.joinDate) }}</text>
			</view>
			<!-- 编辑按钮 -->
			<view class="edit-button" @click="editUserInfo">
				<wd-icon name="edit" size="20" color="#666666"></wd-icon>
			</view>
		</view>

		<!-- 学习数据统计 -->
		<view class="stats-overview">
			<view class="stats-header">
				<text class="section-title">学习数据</text>
				<view class="view-details" @click="showDetailedStats">
					<text class="details-text">查看详情</text>
					<wd-icon name="arrow-right" size="16" color="#666666"></wd-icon>
				</view>
			</view>
			<view class="stats-cards">
				<view class="stat-item" @click="showWordStats">
					<view class="stat-number">{{ stats.totalWords.toLocaleString() }}</view>
					<text class="stat-label">总学习词数</text>
				</view>
				<view class="stat-divider"></view>
				<view class="stat-item" @click="showTodayStats">
					<view class="stat-number">{{ stats.todayLearned }}</view>
					<text class="stat-label">今日学习</text>
				</view>
				<view class="stat-divider"></view>
				<view class="stat-item" @click="showStreakStats">
					<view class="stat-number">{{ stats.continuousDays }}</view>
					<text class="stat-label">连续学习(天)</text>
				</view>
			</view>
		</view>

		<!-- 学习进度 -->
		<view class="progress-section">
			<view class="progress-header">
				<text class="section-title">学习进度</text>
			</view>
			<view class="progress-content">
				<view class="overall-progress">
					<view class="progress-info">
						<text class="progress-title">今日目标</text>
						<text class="progress-text">{{ stats.todayLearned }}/{{ stats.dailyGoal }}</text>
					</view>
					<view class="progress-bar">
						<view
							class="progress-fill"
							:style="{ width: (stats.todayLearned / stats.dailyGoal * 100) + '%' }"
						></view>
					</view>
				</view>
				<view class="week-progress">
					<text class="week-title">本周进度</text>
					<view class="week-chart">
						<view
							class="day-item"
							v-for="(day, index) in weekData"
							:key="index"
						>
							<view class="day-label">{{ day.label }}</view>
							<view class="day-progress">
								<view
									class="day-fill"
									:style="{ height: day.percentage + '%' }"
								></view>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 成就徽章 -->
		<view class="achievements-section">
			<view class="section-header">
				<text class="section-title">学习成就</text>
				<view class="achievement-count">
					<text class="count-text">{{ unlockedAchievements.length }}/{{ achievements.length }}</text>
				</view>
			</view>
			<scroll-view class="achievements-scroll" scroll-x>
				<view class="achievements-list">
					<view
						class="achievement-badge"
						v-for="(achievement, index) in achievements"
						:key="index"
						:class="{ 'badge-unlocked': achievement.unlocked }"
						@click="showAchievementDetail(achievement)"
					>
						<view class="badge-icon">{{ achievement.icon }}</view>
						<text class="badge-name">{{ achievement.name }}</text>
						<view class="badge-progress">
							<text class="badge-status">
								{{ achievement.unlocked ? '已获得' : achievement.progress + '%' }}
							</text>
						</view>
					</view>
				</view>
			</scroll-view>
		</view>

		<!-- 功能菜单 -->
		<view class="menu-section">
			<view class="menu-group">
				<view class="menu-item" @click="manageWordlist">
					<view class="menu-icon">
						<wd-icon name="list" size="24" color="#000000"></wd-icon>
					</view>
					<view class="menu-content">
						<text class="menu-title">词单管理</text>
						<text class="menu-desc">管理我的学习词单</text>
					</view>
					<view class="menu-badge">
						<text class="badge-text">{{ myWordlistCount }}</text>
					</view>
				</view>
				<view class="menu-item" @click="showLearningHistory">
					<view class="menu-icon">
						<wd-icon name="clock" size="24" color="#000000"></wd-icon>
					</view>
					<view class="menu-content">
						<text class="menu-title">学习历史</text>
						<text class="menu-desc">查看学习记录</text>
					</view>
				</view>
			</view>

			<view class="menu-group">
				<view class="menu-item" @click="showSettings">
					<view class="menu-icon">
						<wd-icon name="setting" size="24" color="#000000"></wd-icon>
					</view>
					<view class="menu-content">
						<text class="menu-title">设置</text>
						<text class="menu-desc">个性化设置</text>
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
				</view>
				<view class="menu-item" @click="showAbout">
					<view class="menu-icon">
						<wd-icon name="info" size="24" color="#000000"></wd-icon>
					</view>
					<view class="menu-content">
						<text class="menu-title">关于</text>
						<text class="menu-desc">版本信息</text>
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

		<!-- 自定义TabBar -->
		<custom-tabbar />
		</scroll-view>
	</view>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted, onUnmounted } from 'vue'
import CustomTabbar from '@/components/custom-tabbar/custom-tabbar.vue'
import { auth } from '@/utils/index.js'
import { userAPI } from '@/api/user.js'

// 下拉刷新状态
const isRefreshing = ref(false)

// 用户信息
const userInfo = reactive({
	username: '',
	email: '',
	userAvatar: '',
	joinDate: ''
})

// 学习统计
const stats = reactive({
	totalWords: 6845,
	todayLearned: 25,
	totalDays: 127,
	continuousDays: 15,
	dailyGoal: 50
})

// 本周学习数据
const weekData = reactive([
	{ label: '一', percentage: 80 },
	{ label: '二', percentage: 100 },
	{ label: '三', percentage: 60 },
	{ label: '四', percentage: 90 },
	{ label: '五', percentage: 70 },
	{ label: '六', percentage: 100 },
	{ label: '日', percentage: 50 }
])

// 学习成就
const achievements = reactive([
	{
		id: 1,
		name: '初学者',
		description: '开始学习之旅',
		icon: '🌱',
		unlocked: true,
		progress: 100
	},
	{
		id: 2,
		name: '坚持者',
		description: '连续学习7天',
		icon: '🔥',
		unlocked: true,
		progress: 100
	},
	{
		id: 3,
		name: '词汇达人',
		description: '学习1000个单词',
		icon: '📚',
		unlocked: true,
		progress: 100
	},
	{
		id: 4,
		name: '学霸',
		description: '学习5000个单词',
		icon: '🎓',
		unlocked: true,
		progress: 100
	},
	{
		id: 5,
		name: '词汇大师',
		description: '学习10000个单词',
		icon: '🏆',
		unlocked: false,
		progress: 68
	},
	{
		id: 6,
		name: '学习专家',
		description: '学习365天不间断',
		icon: '💪',
		unlocked: false,
		progress: 35
	}
])

// 我的词单数量
const myWordlistCount = ref(5)

// 计算已解锁的成就
const unlockedAchievements = computed(() => {
	return achievements.filter(item => item.unlocked)
})

// 获取头像文字
const getAvatarText = (username: string) => {
	if (username.length >= 2) {
		return username.substring(0, 2).toUpperCase()
	}
	return username.toUpperCase()
}

// 获取用户等级
const getUserLevel = () => {
	const totalWords = stats.totalWords
	if (totalWords < 1000) return '初学者'
	if (totalWords < 3000) return '进阶者'
	if (totalWords < 6000) return '熟练者'
	if (totalWords < 10000) return '专家'
	return '大师'
}

// 格式化加入日期
const formatJoinDate = (date: string) => {
	const joinDate = new Date(date)
	const now = new Date()
	const diffTime = Math.abs(now.getTime() - joinDate.getTime())
	const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
	return `加入${diffDays}天`
}

// 显示详细统计
const showDetailedStats = () => {
	// 跳转到学习数据详情页面
	uni.navigateTo({
		url: '/pages/profile/statistics'
	})
}

// 显示单词统计
const showWordStats = () => {
	uni.navigateTo({
		url: '/pages/statistics/words'
	})
}

// 显示今日统计
const showTodayStats = () => {
	uni.navigateTo({
		url: '/pages/statistics/today'
	})
}

// 显示连续学习统计
const showStreakStats = () => {
	uni.navigateTo({
		url: '/pages/statistics/streak'
	})
}

// 显示成就详情
const showAchievementDetail = (achievement: any) => {
	uni.showModal({
		title: achievement.name,
		content: `${achievement.icon} ${achievement.description}\n进度：${achievement.unlocked ? '已完成' : achievement.progress + '%'}`,
		showCancel: false
	})
}

// 管理词单
const manageWordlist = () => {
	uni.navigateTo({
		url: '/pages/profile/wordlist-manage'
	})
}

// 显示学习历史
const showLearningHistory = () => {
	uni.navigateTo({
		url: '/pages/history/learning'
	})
}

// 显示设置
const showSettings = () => {
	uni.navigateTo({
		url: '/pages/settings/profile'
	})
}

// 显示帮助
const showHelp = () => {
	uni.navigateTo({
		url: '/pages/help/index'
	})
}

// 显示关于
const showAbout = () => {
	uni.showModal({
		title: '关于Voca',
		content: '版本：1.0.0\n一款专注于词汇学习的应用',
		showCancel: false
	})
}

// 编辑用户信息
const editUserInfo = () => {
	// 直接跳转到用户信息编辑页面
	uni.navigateTo({
		url: '/pages/profile/edit-profile'
	})
}

// 显示退出确认
const showLogoutConfirm = () => {
	auth.logout(true)
}

// 下拉刷新处理
const onRefresh = async () => {
	isRefreshing.value = true
	await loadUserInfo()
	isRefreshing.value = false
}

// 加载用户信息
const loadUserInfo = async () => {
	try {
		// 首先从本地存储获取用户信息
		const localUserInfo = auth.getUserInfo()
		if (localUserInfo && localUserInfo.username) {
			// 使用本地用户信息作为默认显示
			userInfo.username = localUserInfo.username || '未知用户'
			userInfo.email = localUserInfo.email || ''
			userInfo.userAvatar = localUserInfo.userAvatar || ''
			userInfo.joinDate = localUserInfo.createdAt || new Date().toISOString()
		}

		// 然后从服务器获取最新的用户信息
		const response = await userAPI.getProfile()
		if (response && response.code === 200) {
			const serverUserInfo = response.data
			userInfo.username = serverUserInfo.username || userInfo.username
			userInfo.email = serverUserInfo.email || userInfo.email
			userInfo.userAvatar = serverUserInfo.userAvatar || userInfo.userAvatar
			userInfo.joinDate = serverUserInfo.createdAt || userInfo.joinDate

			// 更新本地存储的用户信息
			auth.saveLoginInfo({
				token: auth.getToken(),
				refreshToken: auth.getRefreshToken(),
				user: serverUserInfo
			})
		}
	} catch (error) {
		console.error('获取用户信息失败:', error)
		// 如果API调用失败，确保显示默认用户名而不是空字符串
		if (!userInfo.username) {
			const localUserInfo = auth.getUserInfo()
			userInfo.username = localUserInfo.username || '用户'
			userInfo.userAvatar = localUserInfo.userAvatar || ''
		}
		uni.showToast({
			title: '获取用户信息失败',
			icon: 'none',
			duration: 2000
		})
	}
}

// 页面加载时初始化
onMounted(() => {
	console.log('个人页面加载完成')
	loadUserInfo()

	// 监听用户信息更新事件
	uni.$on('userProfileUpdated', () => {
		console.log('收到用户信息更新事件，刷新数据')
		loadUserInfo()
	})
})

// 头像加载失败处理
const onAvatarError = () => {
	console.log('头像加载失败，显示默认文字头像')
	userInfo.userAvatar = ''
}

// 组件卸载时移除事件监听
onUnmounted(() => {
	uni.$off('userProfileUpdated')
})
</script>

<style lang="scss">
page {
	background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
	height: 100vh;
}

.profile-container {
	height: 100vh;
	display: flex;
	flex-direction: column;
}

.scroll-container {
	flex: 1;
	padding: 40rpx 30rpx 140rpx 30rpx;
	display: flex;
	flex-direction: column;
	gap: 24rpx;
	box-sizing: border-box;
}

/* 用户信息卡片 */
.user-card {
	background: #ffffff;
	border-radius: 24rpx;
	padding: 40rpx;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
	border: 1px solid #f0f0f0;
	display: flex;
	align-items: center;
	gap: 30rpx;
	position: relative; /* 为编辑按钮定位提供参考 */
}

/* 编辑按钮 */
.edit-button {
	position: absolute;
	right: 30rpx;
	bottom: 30rpx;
	width: 60rpx;
	height: 60rpx;
	background: #f8f9fa;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	transition: all 0.3s ease;

	&:active {
		background: #e9ecef;
		transform: scale(0.95);
	}
}

.user-avatar-section {
	position: relative;
	display: flex;
	flex-direction: column;
	align-items: center;
}

.user-avatar {
	width: 100rpx;
	height: 100rpx;
	border-radius: 50%;
	background: #000000;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 12rpx;
	overflow: hidden;
	position: relative;

	.avatar-image {
		width: 100%;
		height: 100%;
		border-radius: 50%;
		object-fit: cover;
	}

	.avatar-text {
		color: #ffffff;
		font-size: 32rpx;
		font-weight: bold;
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}
}

.user-level {
	background: #f0f0f0;
	border-radius: 12rpx;
	padding: 6rpx 16rpx;

	.level-text {
		font-size: 20rpx;
		color: #666666;
		font-weight: 500;
	}
}

.user-info {
	flex: 1;
}

.username {
	font-family: $voca-primary-font;
	font-weight: $font-weight-bold;
	font-size: 36rpx;
	color: #000000;
	margin-bottom: 8rpx;
	display: block;
}

.user-email {
	font-family: $voca-secondary-font;
	font-size: 26rpx;
	color: #666666;
	margin-bottom: 8rpx;
	display: block;
}

.join-date {
	font-family: $voca-secondary-font;
	font-size: 24rpx;
	color: #999999;
	display: block;
}

/* 学习数据统计 */
.stats-overview {
	background: #ffffff;
	border-radius: 24rpx;
	padding: 30rpx;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
	border: 1px solid #f0f0f0;
}

.stats-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 24rpx;

	.section-title {
		font-family: $voca-primary-font;
		font-weight: $font-weight-bold;
		font-size: 28rpx;
		color: #000000;
	}
}

.view-details {
	display: flex;
	align-items: center;
	gap: 8rpx;
	cursor: pointer;

	.details-text {
		font-family: $voca-secondary-font;
		font-size: 24rpx;
		color: #666666;
	}
}

.stats-cards {
	display: flex;
	align-items: center;
	justify-content: space-around;
}

.stat-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	flex: 1;
	cursor: pointer;

	.stat-number {
		font-family: $voca-primary-font;
		font-weight: $font-weight-bold;
		font-size: 40rpx;
		color: #000000;
		margin-bottom: 8rpx;
	}

	.stat-label {
		font-family: $voca-secondary-font;
		font-size: 22rpx;
		color: #666666;
	}
}

.stat-divider {
	width: 1px;
	height: 60rpx;
	background: #e9ecef;
}

/* 学习进度 */
.progress-section {
	background: #ffffff;
	border-radius: 24rpx;
	padding: 30rpx;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
	border: 1px solid #f0f0f0;
}

.progress-header {
	margin-bottom: 24rpx;
}

.overall-progress {
	margin-bottom: 32rpx;
}

.progress-info {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 16rpx;

	.progress-title {
		font-family: $voca-primary-font;
		font-size: 26rpx;
		color: #000000;
	}

	.progress-text {
		font-family: $voca-primary-font;
		font-weight: $font-weight-medium;
		font-size: 26rpx;
		color: #000000;
	}
}

.progress-bar {
	width: 100%;
	height: 8rpx;
	background: #f0f0f0;
	border-radius: 4rpx;
	overflow: hidden;

	.progress-fill {
		height: 100%;
		background: #000000;
		border-radius: 4rpx;
		transition: width 0.3s ease;
	}
}

.week-progress {
	.week-title {
		font-family: $voca-primary-font;
		font-size: 26rpx;
		color: #000000;
		margin-bottom: 20rpx;
		display: block;
	}
}

.week-chart {
	display: flex;
	align-items: flex-end;
	justify-content: space-between;
	height: 80rpx;
	padding: 0 20rpx;
}

.day-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	flex: 1;

	.day-label {
		font-family: $voca-secondary-font;
		font-size: 20rpx;
		color: #666666;
		margin-bottom: 12rpx;
	}
}

.day-progress {
	width: 20rpx;
	height: 40rpx;
	background: #f0f0f0;
	border-radius: 4rpx;
	position: relative;
	overflow: hidden;

	.day-fill {
		position: absolute;
		bottom: 0;
		left: 0;
		width: 100%;
		background: #000000;
		border-radius: 4rpx;
		transition: height 0.3s ease;
	}
}

/* 成就徽章 */
.achievements-section {
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

	.achievement-count {
		.count-text {
			font-family: $voca-secondary-font;
			font-size: 24rpx;
			color: #666666;
		}
	}
}

.achievements-scroll {
	margin: 0 -10rpx;
}

.achievements-list {
	display: flex;
	gap: 16rpx;
	padding: 0 10rpx;
}

.achievement-badge {
	display: flex;
	flex-direction: column;
	align-items: center;
	min-width: 120rpx;
	padding: 20rpx 16rpx;
	background: #f8f9fa;
	border-radius: 16rpx;
	border: 2rpx solid #e9ecef;
	transition: all 0.3s ease;
	cursor: pointer;

	&.badge-unlocked {
		background: #ffffff;
		border-color: #000000;
	}

	&:active {
		transform: scale(0.95);
	}
}

.badge-icon {
	font-size: 32rpx;
	margin-bottom: 8rpx;
}

.badge-name {
	font-family: $voca-primary-font;
	font-size: 22rpx;
	color: #000000;
	margin-bottom: 8rpx;
	text-align: center;
	font-weight: 500;
}

.badge-progress {
	.badge-status {
		font-family: $voca-secondary-font;
		font-size: 20rpx;
		color: #666666;
	}
}

/* 功能菜单 */
.menu-section {
	background: #ffffff;
	border-radius: 24rpx;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
	border: 1px solid #f0f0f0;
	overflow: hidden;
}

.menu-group {
	&:not(:last-child) {
		border-bottom: 1px solid #f0f0f0;
	}
}

.menu-item {
	display: flex;
	align-items: center;
	padding: 35rpx 30rpx;
	transition: background-color 0.3s ease;
	cursor: pointer;
	min-height: 120rpx;

	&:active {
		background-color: #f8f9fa;
	}
}

.menu-icon {
	width: 48rpx;
	height: 48rpx;
	margin-right: 20rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.menu-content {
	flex: 1;

	.menu-title {
		font-family: $voca-primary-font;
		font-size: 28rpx;
		color: #000000;
		margin-bottom: 4rpx;
		display: block;
	}

	.menu-desc {
		font-family: $voca-secondary-font;
		font-size: 22rpx;
		color: #666666;
		display: block;
	}
}

.menu-badge {
	background: #000000;
	border-radius: 12rpx;
	padding: 4rpx 12rpx;
	margin-left: 16rpx;

	.badge-text {
		font-family: $voca-primary-font;
		font-size: 20rpx;
		color: #ffffff;
		font-weight: 500;
	}
}

/* 退出登录 */
.logout-section {
	margin-top: auto;
	padding-top: 20rpx;
}

.logout-btn {
	height: 80rpx;
	border-radius: 40rpx;
	font-size: 28rpx;
	font-family: $voca-primary-font;
	font-weight: $font-weight-medium;
	background: transparent !important;
	border: 2px solid #000000 !important;
	color: #000000 !important;
}
</style>