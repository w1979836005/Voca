<template>
	<!-- 忘记密码页面 -->
	<view class="forgot-container">
		<!-- 头部标题区域 -->
		<view class="header-section">
			<view class="logo-wrapper">
				<image class="logo" src="/static/logo.png" mode="aspectFit"></image>
			</view>
			<view class="title">Voca</view>
			<text class="subtitle">通过邮箱重置您的密码</text>
		</view>

		<!-- 找回密码表单区域 -->
		<view class="form-section">
			<!-- 邮箱 -->
			<view class="input-group">
				<wd-input
					v-model="formData.email"
					class="email-input"
					clearable
					placeholder="请输入注册邮箱"
					@change="handleChange"
				/>
			</view>

			<!-- 验证码 -->
			<view class="verification-group">
				<wd-input
					v-model="formData.code"
					class="code-input"
					clearable
					placeholder="邮箱验证码"
					@change="handleChange"
				/>
				<wd-button
					class="code-button"
					type="info"
					size="small"
					@click="sendVerificationCode"
					:disabled="!canSendCode || countdown > 0"
				>
					{{ countdown > 0 ? `${countdown}s后重发` : '获取验证码' }}
				</wd-button>
			</view>

			<!-- 新密码 -->
			<view class="input-group">
				<wd-input
					v-model="formData.newPassword"
					class="password-input"
					clearable
					placeholder="设置新密码"
					show-password
					@change="handleChange"
				/>
			</view>

			<!-- 确认新密码 -->
			<view class="input-group">
				<wd-input
					v-model="formData.confirmPassword"
					class="confirm-password-input"
					clearable
					placeholder="确认新密码"
					show-password
					@change="handleChange"
				/>
			</view>

			<!-- 重置密码按钮 -->
			<wd-button
				type="primary"
				class="reset-button"
				block
				round
				@click="handleResetPassword"
				:disabled="!canReset"
			>
				重置密码
			</wd-button>

			<!-- 辅助操作 -->
			<view class="helper-actions">
				<text class="helper-text back-link" @click="goToLogin">返回登录</text>
				<text class="helper-text register-link" @click="goToRegister">注册账号</text>
			</view>
		</view>

		<!-- 底部信息 -->
		<view class="footer-section">
			<text class="copyright">© 2025 Voca - 专注学习</text>
		</view>

		<!-- 成功提示弹窗 -->
		<wd-popup v-model="showSuccessPopup" position="center" custom-style="border-radius: 24rpx;">
			<view class="success-popup">
				<view class="success-icon">✓</view>
				<view class="success-title">密码重置成功</view>
				<text class="success-message">您的密码已成功重置</text>
				<wd-button
					type="primary"
					class="success-button"
					block
					round
					@click="goToLogin"
				>
					返回登录
				</wd-button>
			</view>
		</wd-popup>
	</view>
</template>

<script setup lang="ts">
import { reactive, computed, ref, onBeforeUnmount } from 'vue'

// 表单数据
const formData = reactive({
	email: '',
	code: '',
	newPassword: '',
	confirmPassword: ''
})

// 验证码倒计时
const countdown = ref(0)
const timer = ref<NodeJS.Timeout | null>(null)

// 成功提示弹窗
const showSuccessPopup = ref(false)

// 检查是否可以发送验证码
const canSendCode = computed(() => {
	return formData.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
})

// 检查是否可以重置密码
const canReset = computed(() => {
	return (
		formData.email &&
		formData.code &&
		formData.newPassword &&
		formData.confirmPassword &&
		!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) &&
		formData.newPassword === formData.confirmPassword &&
		formData.newPassword.length >= 6
	)
})

// 处理输入变化
const handleChange = (value: string) => {
	console.log('输入变化:', value)
}

// 发送验证码
const sendVerificationCode = async () => {
	if (!canSendCode.value) {
		uni.showToast({
			title: '请输入正确的邮箱地址',
			icon: 'none'
		})
		return
	}

	try {
		// 这里调用发送验证码的API
		console.log('发送密码重置验证码到:', formData.email)

		// 模拟API调用
		uni.showLoading({
			title: '发送中...'
		})

		// TODO: 替换为实际的API调用
		// const res = await sendResetCodeApi(formData.email)

		setTimeout(() => {
			uni.hideLoading()
			uni.showToast({
				title: '验证码已发送',
				icon: 'success'
			})

			// 开始倒计时
			countdown.value = 60
			timer.value = setInterval(() => {
				countdown.value--
				if (countdown.value <= 0) {
					clearInterval(timer.value!)
					timer.value = null
				}
			}, 1000)
		}, 1000)

	} catch (error) {
		uni.hideLoading()
		uni.showToast({
			title: '发送失败，请重试',
			icon: 'none'
		})
	}
}

// 处理重置密码
const handleResetPassword = async () => {
	if (!canReset.value) {
		uni.showToast({
			title: '请完善信息',
			icon: 'none'
		})
		return
	}

	try {
		uni.showLoading({
			title: '重置中...'
		})

		// 准备重置密码数据
		const resetData = {
			email: formData.email,
			code: formData.code,
			newPassword: formData.newPassword
		}

		console.log('重置密码数据:', resetData)

		// TODO: 替换为实际的API调用
		// const res = await resetPasswordApi(resetData)

		// 模拟重置成功
		setTimeout(() => {
			uni.hideLoading()

			// 显示成功弹窗
			showSuccessPopup.value = true
		}, 1000)

	} catch (error) {
		uni.hideLoading()
		uni.showToast({
			title: '重置失败，请重试',
			icon: 'none'
		})
	}
}

// 跳转到登录页面
const goToLogin = () => {
	uni.redirectTo({
		url: '/pages/login/login'
	})
}

// 跳转到注册页面
const goToRegister = () => {
	uni.navigateTo({
		url: '/pages/register/register'
	})
}

// 组件卸载时清理定时器
onBeforeUnmount(() => {
	if (timer.value) {
		clearInterval(timer.value)
	}
})
</script>

<style lang="scss">
page {
	background: #ffffff;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
}

.forgot-container {
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	padding: 60rpx 40rpx;
}

.header-section {
	display: flex;
	flex-direction: column;
	align-items: center;
	margin-bottom: 80rpx;
	text-align: center;
}

.logo-wrapper {
	width: 120rpx;
	height: 120rpx;
	border-radius: 60rpx;
	display: flex;
	justify-content: center;
	align-items: center;
	margin-bottom: 30rpx;
}

.logo {
	width: 80rpx;
	height: 80rpx;
	border-radius: 40rpx;
}

.title {
	font-family: 'Lexend', sans-serif;
	font-weight: 700;
	font-size: 60rpx;
	color: #000000;
	margin-bottom: 10rpx;
}

.subtitle {
	font-family: 'Itim', sans-serif;
	font-size: 24rpx;
	color: #666666;
}

.form-section {
	width: 100%;
	max-width: 600rpx;
}

.input-group {
	margin-bottom: 30rpx;
}

.verification-group {
	display: flex;
	align-items: center;
	gap: 20rpx;
	margin-bottom: 30rpx;

	.code-input {
		flex: 1;
		height: 80rpx;
		border-radius: 40rpx;
		background: #f8f9fa;
		border: 1px solid #e9ecef;
		padding: 0 30rpx;
		font-size: 28rpx;
		font-family: 'Lexend', sans-serif;
		color: #333333;
		box-sizing: border-box;
	}

	.code-button {
		height: 80rpx;
		min-width: 160rpx;
		font-family: 'Lexend', sans-serif;
		font-size: 24rpx;
		white-space: nowrap;
	}
}

.email-input,
.password-input,
.confirm-password-input {
	width: 100%;
	height: 80rpx;
	border-radius: 40rpx;
	background: #f8f9fa;
	border: 1px solid #e9ecef;
	padding: 0 30rpx;
	font-size: 28rpx;
	font-family: 'Lexend', sans-serif;
	color: #333333;
	box-sizing: border-box;
}

.reset-button {
	width: 100%;
	height: 80rpx;
	font-size: 28rpx;
	font-family: 'Lexend', sans-serif;
	font-weight: bold !important;
	letter-spacing: 2px;
	margin: 40rpx 0 30rpx 0;
	display: flex;
	justify-content: center;
	align-items: center;
}

.helper-actions {
	display: flex;
	justify-content: center;
	align-items: center;
	width: 100%;
	gap: 40rpx;
}

.helper-text {
	font-family: 'Lexend', sans-serif;
	font-size: 24rpx;
	color: #666666;
	padding: 15rpx 0;
}

.back-link {
	color: #000000 !important;
	font-weight: 500;
}

.register-link {
	color: #000000 !important;
	font-weight: 500;
}

.footer-section {
	margin-top: auto;
	padding-top: 40rpx;
}

.copyright {
	font-family: 'Lexend', sans-serif;
	font-size: 22rpx;
	color: #999999;
	text-align: center;
}

/* 成功提示弹窗样式 */
.success-popup {
	padding: 60rpx 40rpx;
	text-align: center;
	min-width: 500rpx;
}

.success-icon {
	width: 80rpx;
	height: 80rpx;
	line-height: 80rpx;
	border-radius: 40rpx;
	background: #27ae60;
	color: #ffffff;
	font-size: 40rpx;
	font-weight: bold;
	margin: 0 auto 30rpx auto;
	display: flex;
	justify-content: center;
	align-items: center;
}

.success-title {
	font-family: 'Lexend', sans-serif;
	font-size: 32rpx;
	font-weight: 700;
	color: #000000;
	margin-bottom: 20rpx;
}

.success-message {
	font-family: 'Lexend', sans-serif;
	font-size: 24rpx;
	color: #666666;
	margin-bottom: 40rpx;
	display: block;
}

.success-button {
	width: 100%;
	height: 80rpx;
	font-size: 28rpx;
	font-family: 'Lexend', sans-serif;
	font-weight: bold !important;
	letter-spacing: 2px;
}
</style>