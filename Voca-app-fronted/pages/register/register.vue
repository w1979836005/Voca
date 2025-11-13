<template>
	<!-- 注册页面 -->
	<view class="register-container">
		<!-- 头部标题区域 -->
		<view class="header-section">
			<view class="logo-wrapper">
				<image class="logo" src="/static/logo.png" mode="aspectFit"></image>
			</view>
			<view class="title">Voca</view>
			<text class="subtitle">开启高效背单词之旅</text>
		</view>

		<!-- 注册表单区域 -->
		<view class="form-section">
			<!-- 账号（可选） -->
			<view class="input-group">
				<wd-input
					v-model="formData.username"
					class="account-input"
					clearable
					placeholder="账号（可选，不填则默认为邮箱）"
					@change="handleChange"
				/>
			</view>

			<!-- 邮箱 -->
			<view class="input-group">
				<wd-input
					v-model="formData.email"
					class="email-input"
					clearable
					placeholder="邮箱地址"
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

			<!-- 密码 -->
			<view class="input-group">
				<wd-input
					v-model="formData.password"
					class="password-input"
					clearable
					placeholder="设置密码"
					show-password
					@change="handleChange"
				/>
			</view>

			<!-- 确认密码 -->
			<view class="input-group">
				<wd-input
					v-model="formData.confirmPassword"
					class="confirm-password-input"
					clearable
					placeholder="确认密码"
					show-password
					@change="handleChange"
				/>
			</view>

			<!-- 注册按钮 -->
			<wd-button
				type="primary"
				class="register-button"
				block
				round
				@click="handleRegister"
				:disabled="!canRegister"
			>
				注册账号
			</wd-button>

			<!-- 辅助操作 -->
			<view class="helper-actions">
				<text class="helper-text">已有账号？</text>
				<text class="helper-text login-link" @click="goToLogin">立即登录</text>
			</view>
		</view>

		<!-- 底部信息 -->
		<view class="footer-section">
			<text class="copyright">© 2025 Voca - 专注学习</text>
		</view>
	</view>
</template>

<script setup lang="ts">
import { reactive, computed, ref, onBeforeUnmount } from 'vue'

// 表单数据
const formData = reactive({
	username: '',
	email: '',
	code: '',
	password: '',
	confirmPassword: ''
})

// 验证码倒计时
const countdown = ref(0)
const timer = ref<any>(null)

// 检查是否可以发送验证码
const canSendCode = computed(() => {
	return formData.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
})

// 检查是否可以注册
const canRegister = computed(() => {
	return (
		formData.email &&
		formData.code &&
		formData.password &&
		formData.confirmPassword &&
		/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) &&
		formData.password === formData.confirmPassword &&
		formData.password.length >= 6
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
		console.log('发送验证码到:', formData.email)

		// 模拟API调用
		uni.showLoading({
			title: '发送中...'
		})

		// TODO: 替换为实际的API调用
		// const res = await sendCodeApi(formData.email)

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

// 处理注册
const handleRegister = async () => {
	console.log('点击注册按钮')
	console.log('canRegister.value:', canRegister.value)
	console.log('formData:', formData)

	if (!canRegister.value) {
		uni.showToast({
			title: '请完善注册信息',
			icon: 'none'
		})
		return
	}

	try {
		uni.showLoading({
			title: '注册中...'
		})

		// 处理用户名（如果为空则使用邮箱）
		const username = formData.username || formData.email.split('@')[0]

		// 准备注册数据
		const registerData = {
			username: username,
			email: formData.email,
			password: formData.password,
			code: formData.code
		}

		console.log('注册数据:', registerData)

		// TODO: 替换为实际的API调用
		// const res = await registerApi(registerData)

		// 模拟注册成功
		setTimeout(() => {
			uni.hideLoading()
			uni.showToast({
				title: '注册成功',
				icon: 'success'
			})

			// 跳转到登录页面
			setTimeout(() => {
				uni.redirectTo({
					url: '/pages/login/login'
				})
			}, 1500)
		}, 1000)

	} catch (error) {
		uni.hideLoading()
		uni.showToast({
			title: '注册失败，请重试',
			icon: 'none'
		})
	}
}

// 跳转到登录页面
const goToLogin = () => {
	uni.navigateTo({
		url: '/pages/login/login'
	})
}

// 组件卸载时清理定时器
onBeforeUnmount(() => {
	if (timer.value) {
		clearInterval(timer.value)
		timer.value = null
	}
})
</script>

<style lang="scss">
page {
	background: #ffffff;
	width: 100%;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
}

.register-container {
	width: 99%;
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
	max-width: 500rpx;
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

.account-input,
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

.register-button {
  width: 100%;
  height: 80rpx;
  background: #000000;
  color: #ffffff;
  border: none;
  border-radius: 40rpx;
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
	gap: 20rpx;
}

.helper-text {
	font-family: 'Lexend', sans-serif;
	font-size: 24rpx;
	color: #666666;
	padding: 15rpx 0;
}

.login-link {
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
</style>