<template>
	<view class="edit-profile-container">
		<!-- 顶部导航栏 -->
		<view class="header-nav">
			<view class="nav-left" @click.stop="goBack">
				<wd-icon name="arrow-left" size="18" color="#000000"></wd-icon>
			</view>
			<view class="nav-title">编辑个人信息</view>
			<view class="nav-right" @click.stop="saveProfile">
				<text class="save-text">保存</text>
			</view>
		</view>

		<!-- 头像编辑区域 -->
		<view class="avatar-section">
			<view class="avatar-container" @click="changeAvatar">
				<view class="avatar-wrapper">
					<image
						:src="userInfo.avatar || '/static/default-avatar.png'"
						class="avatar-image"
						mode="aspectFill"
					></image>
					<view class="avatar-overlay">
						<wd-icon name="camera" size="24" color="#ffffff"></wd-icon>
					</view>
				</view>
				<text class="avatar-hint">点击更换头像</text>
			</view>
		</view>

		<!-- 信息编辑表单 -->
		<view class="form-section">
			<view class="form-item">
				<text class="form-label">用户名</text>
				<wd-input
					v-model="formData.username"
					placeholder="请输入用户名"
					class="form-input"
					maxlength="20"
				></wd-input>
			</view>

			<view class="form-item">
				<text class="form-label">邮箱</text>
				<wd-input
					v-model="formData.email"
					placeholder="请输入邮箱"
					class="form-input"
					type="email"
				></wd-input>
			</view>

			<view class="form-item">
				<text class="form-label">个人简介</text>
				<wd-textarea
					v-model="formData.bio"
					placeholder="请输入个人简介"
					class="form-textarea"
					maxlength="200"
					:show-word-limit="true"
				></wd-textarea>
			</view>

			<view class="form-item">
				<text class="form-label">学习目标</text>
				<wd-input
					v-model="formData.dailyGoal"
					placeholder="每日学习单词数量"
					class="form-input"
					type="number"
				></wd-input>
			</view>
		</view>

		<!-- 操作按钮 -->
		<view class="action-section">
			<wd-button
				type="primary"
				class="save-button"
				block
				round
				@click="saveProfile"
			>
				保存信息
			</wd-button>

			<wd-button
				class="cancel-button"
				block
				round
				@click="cancelEdit"
			>
				取消编辑
			</wd-button>
		</view>
	</view>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'

// 用户原始信息
const userInfo = reactive({
	avatar: '',
	username: 'ALEX',
	email: 'alex@example.com',
	bio: '热爱学习的英语爱好者',
	dailyGoal: '50'
})

// 表单数据
const formData = reactive({
	avatar: '',
	username: '',
	email: '',
	bio: '',
	dailyGoal: ''
})

// 页面加载时初始化表单数据
onMounted(() => {
	// 复制用户信息到表单
	formData.avatar = userInfo.avatar
	formData.username = userInfo.username
	formData.email = userInfo.email
	formData.bio = userInfo.bio
	formData.dailyGoal = userInfo.dailyGoal
})

// 返回上一页
const goBack = () => {
	uni.navigateBack({
		delta: 1
	})
}

// 更换头像
const changeAvatar = () => {
	uni.showActionSheet({
		itemList: ['拍照', '从相册选择'],
		success: (res) => {
			if (res.tapIndex === 0) {
				// 拍照
				uni.chooseImage({
					count: 1,
					sourceType: ['camera'],
					success: (imageRes) => {
						formData.avatar = imageRes.tempFilePaths[0]
					}
				})
			} else if (res.tapIndex === 1) {
				// 从相册选择
				uni.chooseImage({
					count: 1,
					sourceType: ['album'],
					success: (imageRes) => {
						formData.avatar = imageRes.tempFilePaths[0]
					}
				})
			}
		}
	})
}

// 保存个人信息
const saveProfile = () => {
	console.log('点击保存按钮')

	// 表单验证
	if (!formData.username.trim()) {
		uni.showToast({
			title: '请输入用户名',
			icon: 'none'
		})
		return
	}

	if (!formData.email.trim()) {
		uni.showToast({
			title: '请输入邮箱',
			icon: 'none'
		})
		return
	}

	// 邮箱格式验证
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
	if (!emailRegex.test(formData.email)) {
		uni.showToast({
			title: '请输入正确的邮箱格式',
			icon: 'none'
		})
		return
	}

	// 显示保存中状态
	uni.showLoading({
		title: '保存中...'
	})

	// 模拟保存操作
	setTimeout(() => {
		// 更新原始用户信息
		userInfo.avatar = formData.avatar
		userInfo.username = formData.username
		userInfo.email = formData.email
		userInfo.bio = formData.bio
		userInfo.dailyGoal = formData.dailyGoal

		uni.hideLoading()
		uni.showToast({
			title: '保存成功',
			icon: 'success'
		})

		// 返回上一页
		setTimeout(() => {
			uni.navigateBack()
		}, 1500)
	}, 1000)
}

// 取消编辑
const cancelEdit = () => {
	uni.showModal({
		title: '确认取消',
		content: '确定要取消编辑吗？未保存的更改将丢失',
		success: (res) => {
			if (res.confirm) {
				uni.navigateBack()
			}
		}
	})
}
</script>

<style lang="scss">
page {
	background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
	height: 100vh;
}

.edit-profile-container {
	height: 100vh;
	padding: 0 30rpx 40rpx 30rpx;
	display: flex;
	flex-direction: column;
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

.nav-right {
	.save-text {
		font-family: $voca-primary-font;
		font-weight: $font-weight-medium;
		font-size: 22rpx;
		color: #000000;
	}
}

/* 头像编辑区域 */
.avatar-section {
	padding: 30rpx 0 40rpx 0;
	display: flex;
	justify-content: center;
}

.avatar-container {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 12rpx;
	cursor: pointer;
}

.avatar-wrapper {
	position: relative;
	width: 150rpx;
	height: 150rpx;
	border-radius: 50%;
	overflow: hidden;
	border: 4rpx solid #f0f0f0;
}

.avatar-image {
	width: 100%;
	height: 100%;
	border-radius: 50%;
}

.avatar-overlay {
	position: absolute;
	bottom: 0;
	left: 0;
	right: 0;
	background: rgba(0, 0, 0, 0.6);
	padding: 8rpx 0;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: opacity 0.3s ease;
}

.avatar-hint {
	font-family: $voca-secondary-font;
	font-size: 26rpx;
	color: #666666;
}

/* 表单区域 */
.form-section {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 20rpx;
}

.form-item {
	display: flex;
	flex-direction: column;
	gap: 10rpx;
}

.form-label {
	font-family: $voca-primary-font;
	font-weight: $font-weight-medium;
	font-size: 28rpx;
	color: #000000;
}

.form-input {
	border: 1px solid #e9ecef;
	border-radius: 16rpx;
	padding: 18rpx 20rpx;
	font-size: 28rpx;
	background: #ffffff;
}

.form-textarea {
	border: 1px solid #e9ecef;
	border-radius: 16rpx;
	padding: 18rpx 20rpx;
	font-size: 28rpx;
	background: #ffffff;
	min-height: 120rpx;
}

/* 操作按钮 */
.action-section {
	margin-top: 30rpx;
	display: flex;
	flex-direction: column;
	gap: 16rpx;
}

.save-button {
	height: 80rpx;
	font-size: 28rpx;
	font-family: $voca-primary-font;
	font-weight: $font-weight-medium;
	border-radius: 16rpx;
}

.cancel-button {
	height: 80rpx;
	background: transparent !important;
	border: 2px solid #000000 !important;
	color: #000000 !important;
	font-size: 28rpx;
	font-family: $voca-primary-font;
	font-weight: $font-weight-medium;
	border-radius: 16rpx;
	margin-top: 0 !important;
}
</style>