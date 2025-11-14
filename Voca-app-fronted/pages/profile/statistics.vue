<template>
	<view class="statistics-container">
		<!-- 顶部导航栏 -->
		<view class="header-nav">
			<view class="nav-left" @click="goBack">
				<wd-icon name="arrow-left" size="18" color="#000000"></wd-icon>
			</view>
			<view class="nav-title">学习数据详情</view>
			<view class="nav-right" @click="exportData">
				<wd-icon name="download" size="16" color="#000000"></wd-icon>
			</view>
		</view>

		<!-- 总览统计卡片 -->
		<view class="overview-section">
			<view class="overview-grid">
				<view class="overview-item">
					<view class="overview-number">{{ stats.totalWords.toLocaleString() }}</view>
					<text class="overview-label">总学习词数</text>
				</view>
				<view class="overview-item">
					<view class="overview-number">{{ stats.continuousDays }}</view>
					<text class="overview-label">连续学习(天)</text>
				</view>
				<view class="overview-item">
					<view class="overview-number">{{ stats.totalDays }}</view>
					<text class="overview-label">累计学习(天)</text>
				</view>
				<view class="overview-item">
					<view class="overview-number">{{ Math.round(stats.averageDaily) }}</view>
					<text class="overview-label">日均词数</text>
				</view>
			</view>
		</view>

		<!-- 连续学习天数图表 -->
		<view class="chart-section">
			<view class="section-header">
				<text class="section-title">连续学习记录</text>
			</view>

			<view class="streak-chart">
				<!-- 月份切换 -->
				<view class="month-nav">
					<view class="month-btn" @click="previousMonth">
						<wd-icon name="arrow-left" size="16" color="#666666"></wd-icon>
					</view>
					<text class="month-text">{{ currentMonth }}</text>
					<view class="month-btn" @click="nextMonth">
						<wd-icon name="arrow-right" size="16" color="#666666"></wd-icon>
					</view>
				</view>

				<!-- 学习日历 -->
				<view class="calendar-grid">
					<view class="weekday-labels">
						<text class="weekday-label" v-for="day in weekDays" :key="day">{{ day }}</text>
					</view>
					<view class="calendar-days">
						<view
							class="calendar-day"
							v-for="(day, index) in calendarDays"
							:key="index"
							:class="{
								'day-learned': day.learned,
								'day-today': day.isToday,
								'day-empty': !day.day
							}"
						>
							<text class="day-number" v-if="day.day">{{ day.day }}</text>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 学习单词数量图表 -->
		<view class="chart-section">
			<view class="section-header">
				<text class="section-title">学习进度趋势</text>
			</view>

			<view class="chart-tabs">
				<view
					class="chart-tab"
					:class="{ 'tab-active': activeChart === 'week' }"
					@click="switchChart('week')"
				>
					<text class="tab-text">本周</text>
				</view>
				<view
					class="chart-tab"
					:class="{ 'tab-active': activeChart === 'month' }"
					@click="switchChart('month')"
				>
					<text class="tab-text">本月</text>
				</view>
				<view
					class="chart-tab"
					:class="{ 'tab-active': activeChart === 'year' }"
					@click="switchChart('year')"
				>
					<text class="tab-text">本年</text>
				</view>
			</view>

			<view class="bar-chart">
				<view class="chart-container">
					<view class="chart-bars">
						<view
							class="bar-item"
							v-for="(item, index) in chartData"
							:key="index"
						>
							<view class="bar-wrapper">
								<view
									class="bar-fill"
									:style="{ height: item.percentage + '%' }"
								></view>
							</view>
							<text class="bar-label">{{ item.label }}</text>
							<text class="bar-value">{{ item.value }}</text>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 成就徽章 -->
		<view class="achievements-section">
			<view class="section-header">
				<text class="section-title">学习成就</text>
			</view>

			<view class="achievements-grid">
				<view
					class="achievement-item"
					v-for="achievement in achievements"
					:key="achievement.id"
					:class="{ 'achievement-unlocked': achievement.unlocked }"
				>
					<view class="achievement-icon">{{ achievement.icon }}</view>
					<text class="achievement-name">{{ achievement.name }}</text>
					<text class="achievement-desc">{{ achievement.description }}</text>
				</view>
			</view>
		</view>

		<!-- 自定义TabBar -->
		<custom-tabbar />
	</view>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted } from 'vue'
import CustomTabbar from '@/components/custom-tabbar/custom-tabbar.vue'

// 统计数据
const stats = reactive({
	totalWords: 6845,
	continuousDays: 15,
	totalDays: 127,
	averageDaily: 53.9
})

const activeChart = ref('week')

// 当前月份
const currentDate = ref(new Date(2024, 2, 1)) // 2024年3月
const currentMonth = computed(() => {
	const year = currentDate.value.getFullYear()
	const month = currentDate.value.getMonth() + 1
	return `${year}年${month}月`
})

// 星期标签
const weekDays = ['日', '一', '二', '三', '四', '五', '六']

// 日历数据
const calendarDays = reactive([])

// 图表数据
const chartData = reactive([])

// 成就数据
const achievements = reactive([
	{
		id: 1,
		name: '初学者',
		description: '开始学习之旅',
		icon: '🌱',
		unlocked: true
	},
	{
		id: 2,
		name: '坚持者',
		description: '连续学习7天',
		icon: '🔥',
		unlocked: true
	},
	{
		id: 3,
		name: '词汇达人',
		description: '学习1000个单词',
		icon: '📚',
		unlocked: true
	},
	{
		id: 4,
		name: '学霸',
		description: '学习5000个单词',
		icon: '🎓',
		unlocked: true
	},
	{
		id: 5,
		name: '词汇大师',
		description: '学习10000个单词',
		icon: '🏆',
		unlocked: false
	},
	{
		id: 6,
		name: '学习专家',
		description: '学习365天不间断',
		icon: '💪',
		unlocked: false
	}
])

// 生成日历数据
const generateCalendarDays = () => {
	const days = []
	const year = currentDate.value.getFullYear()
	const month = currentDate.value.getMonth()
	const firstDay = new Date(year, month, 1).getDay()
	const daysInMonth = new Date(year, month + 1, 0).getDate()
	const today = new Date()
	const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month
	const todayDate = today.getDate()

	// 填充空白
	for (let i = 0; i < firstDay; i++) {
		days.push({ day: null, learned: false, isToday: false })
	}

	// 填充日期
	for (let day = 1; day <= daysInMonth; day++) {
		// 基于日期和月份生成更真实的学习记录
		const dateObj = new Date(year, month, day)
		const dayOfWeek = dateObj.getDay()

		// 周末学习概率较低，工作日较高
		let learnProbability = 0.7
		if (dayOfWeek === 0 || dayOfWeek === 6) {
			learnProbability = 0.4
		}

		// 如果是过去的日期，生成学习记录；如果是未来日期，不生成
		let learned = false
		if (dateObj <= today) {
			learned = Math.random() < learnProbability
		}

		days.push({
			day,
			learned,
			isToday: isCurrentMonth && day === todayDate
		})
	}

	calendarDays.length = 0
	calendarDays.push(...days)
}

// 生成图表数据
const generateChartData = (period: string) => {
	chartData.length = 0

	if (period === 'week') {
		// 本周数据
		const weekData = [
			{ label: '周一', value: 25 },
			{ label: '周二', value: 32 },
			{ label: '周三', value: 18 },
			{ label: '周四', value: 41 },
			{ label: '周五', value: 38 },
			{ label: '周六', value: 55 },
			{ label: '周日', value: 42 }
		]

		const maxValue = Math.max(...weekData.map(item => item.value))
		weekData.forEach(item => {
			chartData.push({
				...item,
				percentage: (item.value / maxValue) * 100
			})
		})
	} else if (period === 'month') {
		// 本月数据
		const monthData = [
			{ label: '第1周', value: 185 },
			{ label: '第2周', value: 242 },
			{ label: '第3周', value: 198 },
			{ label: '第4周', value: 267 }
		]

		const maxValue = Math.max(...monthData.map(item => item.value))
		monthData.forEach(item => {
			chartData.push({
				...item,
				percentage: (item.value / maxValue) * 100
			})
		})
	} else if (period === 'year') {
		// 本年数据 - 12个月，数量差异更大
		const yearData = [
			{ label: '1月', value: 423 },   // 年初，学习积极性一般
			{ label: '2月', value: 387 },   // 春节期间，学习较少
			{ label: '3月', value: 656 },   // 新学期开始，学习增加
			{ label: '4月', value: 892 },   // 期中考试前，学习高峰
			{ label: '5月', value: 745 },   // 考试后略有下降
			{ label: '6月', value: 934 },   // 期末冲刺
			{ label: '7月', value: 567 },   // 暑假开始，学习较少
			{ label: '8月', value: 412 },   // 暑假期间，学习最少
			{ label: '9月', value: 823 },   // 新学期，学习恢复
			{ label: '10月', value: 967 },  // 学习高峰
			{ label: '11月', value: 845 },  // 保持较高水平
			{ label: '12月', value: 0 }    // 当前月份
		]

		const maxValue = Math.max(...yearData.filter(item => item.value > 0).map(item => item.value))
		yearData.forEach(item => {
			chartData.push({
				...item,
				percentage: item.value > 0 ? (item.value / maxValue) * 100 : 0
			})
		})
	}
}

// 返回上一页
const goBack = () => {
	uni.navigateBack()
}

// 导出数据
const exportData = () => {
	uni.showActionSheet({
		itemList: ['导出PDF报告', '导出Excel数据', '分享学习报告'],
		success: (res) => {
			const actions = ['PDF报告', 'Excel数据', '学习报告']
			uni.showToast({
				title: `正在导出${actions[res.tapIndex]}...`,
				icon: 'loading'
			})

			setTimeout(() => {
				uni.showToast({
					title: '导出成功',
					icon: 'success'
				})
			}, 2000)
		}
	})
}


// 切换图表
const switchChart = (period: string) => {
	activeChart.value = period
	generateChartData(period)
}

// 上一月
const previousMonth = () => {
	const newDate = new Date(currentDate.value)
	newDate.setMonth(newDate.getMonth() - 1)

	// 限制不能超过一年的范围
	const minDate = new Date(2024, 0, 1) // 2024年1月
	if (newDate >= minDate) {
		currentDate.value = newDate
		generateCalendarDays()
	} else {
		uni.showToast({
			title: '已是最早月份',
			icon: 'none'
		})
	}
}

// 下一月
const nextMonth = () => {
	const newDate = new Date(currentDate.value)
	newDate.setMonth(newDate.getMonth() + 1)

	// 限制不能超过当前月份的下一个月
	const maxDate = new Date()
	maxDate.setMonth(maxDate.getMonth() + 1)
	if (newDate <= maxDate) {
		currentDate.value = newDate
		generateCalendarDays()
	} else {
		uni.showToast({
			title: '已是最新月份',
			icon: 'none'
		})
	}
}


// 页面加载时初始化
onMounted(() => {
	generateCalendarDays()
	generateChartData('week')
})
</script>

<style lang="scss">
page {
	background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
	height: 100vh;
}

.statistics-container {
	min-height: 100vh;
	padding: 0 30rpx 180rpx 30rpx;
	display: flex;
	flex-direction: column;
	gap: 18rpx;
	box-sizing: border-box;
	position: relative;
	z-index: 1; /* 确保在tabbar下方 */
}

/* 顶部导航栏 */
.header-nav {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 30rpx 0 15rpx 0;
}

.nav-left, .nav-right {
	width: 48rpx;
	height: 48rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	transition: opacity 0.3s ease;

	&:active {
		opacity: 0.7;
	}
}

.nav-title {
	font-family: $voca-primary-font;
	font-weight: $font-weight-medium;
	font-size: 26rpx;
	color: #000000;
}

/* 总览统计 */
.overview-section {
	background: #ffffff;
	border-radius: 24rpx;
	padding: 24rpx;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
	border: 1px solid #f0f0f0;
	position: relative;
	z-index: 1;
}

.overview-grid {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 16rpx;
}

.overview-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 16rpx;
	background: #f8f9fa;
	border-radius: 16rpx;
}

.overview-number {
	font-family: $voca-primary-font;
	font-weight: $font-weight-bold;
	font-size: 32rpx;
	color: #000000;
	margin-bottom: 6rpx;
}

.overview-label {
	font-family: $voca-secondary-font;
	font-size: 24rpx;
	color: #666666;
}

/* 图表区域 */
.chart-section {
	background: #ffffff;
	border-radius: 24rpx;
	padding: 24rpx;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
	border: 1px solid #f0f0f0;
	position: relative;
	z-index: 1;
	overflow: hidden; /* 防止内部元素溢出 */
}

.section-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 16rpx;
}

.section-title {
	font-family: $voca-primary-font;
	font-weight: $font-weight-bold;
	font-size: 28rpx;
	color: #000000;
}

.period-selector {
	display: flex;
	align-items: center;
	gap: 8rpx;
	cursor: pointer;

	.period-text {
		font-family: $voca-secondary-font;
		font-size: 24rpx;
		color: #666666;
	}
}

/* 连续学习记录 */
.month-nav {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 16rpx;
}

.month-btn {
	width: 60rpx;
	height: 60rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	border-radius: 50%;
	transition: all 0.3s ease;
	background: #f8f9fa;

	&:active {
		background: #e9ecef;
		transform: scale(0.95);
	}
}

.month-text {
	font-family: $voca-primary-font;
	font-weight: $font-weight-medium;
	font-size: 28rpx;
	color: #000000;
}

.calendar-grid {
	width: 100%;
}

.weekday-labels {
	display: grid;
	grid-template-columns: repeat(7, 1fr);
	margin-bottom: 6rpx;
}

.weekday-label {
	font-family: $voca-secondary-font;
	font-size: 22rpx;
	color: #666666;
	text-align: center;
	padding: 8rpx 0;
}

.calendar-days {
	display: grid;
	grid-template-columns: repeat(7, 1fr);
	gap: 4rpx;
}

.calendar-day {
	aspect-ratio: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 8rpx;
	position: relative;
	transition: all 0.3s ease;

	&.day-learned {
		background: #000000;
		box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.2);

		.day-number {
			color: #ffffff;
			font-weight: 500;
		}

		&:active {
			transform: scale(0.9);
		}
	}

	&.day-today {
		border: 2px solid #000000;
		background: #f8f9fa;

		.day-number {
			color: #000000;
			font-weight: bold;
		}

		&.day-learned {
			background: #000000;

			.day-number {
				color: #ffffff;
			}
		}
	}

	&.day-empty {
		visibility: hidden;
	}

	&:not(.day-empty):not(.day-learned) {
		background: #fafafa;

		&:active {
			background: #f0f0f0;
			transform: scale(0.95);
		}
	}
}

.day-number {
	font-family: $voca-primary-font;
	font-size: 22rpx;
	color: #666666;
}

/* 图表标签 */
.chart-tabs {
	display: flex;
	background: #f8f9fa;
	border-radius: 12rpx;
	padding: 4rpx;
	margin-bottom: 16rpx;
}

.chart-tab {
	flex: 1;
	padding: 10rpx 0;
	text-align: center;
	border-radius: 8rpx;
	cursor: pointer;
	transition: all 0.3s ease;

	&.tab-active {
		background: #000000;

		.tab-text {
			color: #ffffff;
		}
	}
}

.tab-text {
	font-family: $voca-primary-font;
	font-size: 24rpx;
	color: #666666;
}

/* 柱状图 */
.chart-container {
	width: 100%;
	height: 180rpx;
	position: relative;
	overflow: hidden; /* 防止柱状图溢出 */
}

.chart-bars {
	display: flex;
	align-items: flex-end;
	justify-content: space-around;
	height: 100%;
	padding-bottom: 40rpx;
	position: relative;
	z-index: 1; /* 确保柱状图在正确的层级 */
}

.bar-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	flex: 1;
	max-width: 50rpx;
	min-width: 30rpx;
}

.bar-wrapper {
	width: 20rpx;
	height: 120rpx;
	background: #f0f0f0;
	border-radius: 4rpx;
	position: relative;
	margin-bottom: 6rpx;
	overflow: hidden; /* 确保填充条不会溢出 */
}

.bar-fill {
	width: 100%;
	background: #000000;
	border-radius: 4rpx;
	position: absolute;
	bottom: 0;
	left: 0;
	right: 0;
	transition: height 0.5s ease;
	max-height: 100%; /* 确保不会超过容器高度 */
}

.bar-label {
	font-family: $voca-secondary-font;
	font-size: 18rpx;
	color: #666666;
	margin-bottom: 3rpx;
}

.bar-value {
	font-family: $voca-primary-font;
	font-weight: $font-weight-medium;
	font-size: 18rpx;
	color: #000000;
}

/* 成就徽章 */
.achievements-section {
	background: #ffffff;
	border-radius: 24rpx;
	padding: 24rpx;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
	border: 1px solid #f0f0f0;
	position: relative;
	z-index: 1;
	margin-bottom: 20rpx; /* 额外的底部间距确保不被tabbar遮盖 */
}

.achievements-grid {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 16rpx;
}

.achievement-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 16rpx 12rpx;
	background: #f8f9fa;
	border-radius: 16rpx;
	border: 2rpx solid #e9ecef;
	transition: all 0.3s ease;
	cursor: pointer;

	&.achievement-unlocked {
		background: #ffffff;
		border-color: #000000;
	}

	&:active {
		transform: scale(0.95);
	}
}

.achievement-icon {
	font-size: 28rpx;
	margin-bottom: 6rpx;
}

.achievement-name {
	font-family: $voca-primary-font;
	font-size: 20rpx;
	color: #000000;
	margin-bottom: 3rpx;
	text-align: center;
	font-weight: 500;
}

.achievement-desc {
	font-family: $voca-secondary-font;
	font-size: 16rpx;
	color: #666666;
	text-align: center;
	line-height: 1.2;
}

/* 提升所有弹出层和操作菜单的层级 */
:deep(.wd-action-sheet),
:deep(.wd-popup),
:deep(.wd-modal),
:deep(.uni-picker-container),
:deep(.uni-actionsheet) {
	z-index: 9999 !important;
}

/* 确保tabbar在最上方 */
:deep(.custom-tabbar) {
	z-index: 99999 !important;
	position: fixed !important;
}

</style>