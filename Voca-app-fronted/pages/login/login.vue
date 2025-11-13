<template>
	<!-- 黑白风格登录页面 -->
	<view class="login-container">
		<!-- Logo和标题区域 -->
		<view class="header-section">
			<view class="logo-wrapper">
				<image class="logo" src="/static/logo.png" mode="aspectFit"></image>
			</view>
			<view class="title">Voca</view>
			<text class="subtitle">专注学习，高效背单词</text>
		</view>

		<!-- 登录表单区域 -->
		<view class="form-section">
			<view class="input-group">
				<wd-input v-model="formData.username" class="account-input" clearable placeholder="邮箱或账号"
					@change="handleChange" />
			</view>

			<view class="input-group">
				<wd-input v-model="formData.password" class="password-input" clearable placeholder="密码" show-password
					@change="handleChange" />
			</view>

			<!-- 登录按钮 -->
			<wd-button type="primary" class="login-button" block round @click="handleLogin">
				登录
			</wd-button>

			<!-- 辅助操作 -->
			<view class="helper-actions">
				<text class="helper-text forgot-link" @click="goToForgotPassword">忘记密码？</text>
				<text class="helper-text register-link" @click="goToRegister">注册账号</text>
			</view>
		</view>

		<!-- 底部信息 -->
		<view class="footer-section">
			<text class="copyright">© 2025 Voca - 专注学习</text>
		</view>
	</view>
</template>

<script setup lang="ts">
	import { reactive } from 'vue'

	// 表单数据
	const formData = reactive({
		username: '',
		password: ''
	})

	// 处理输入变化
	const handleChange = (value : string) => {
		console.log('输入变化:', value)
	}

	// 处理登录
	const handleLogin = () => {
		console.log('登录数据:', formData)
		// 这里添加登录逻辑
	}

	// 跳转到注册页面
	const goToRegister = () => {
		uni.navigateTo({
			url: '/pages/register/register'
		})
	}

	// 跳转到忘记密码页面
	const goToForgotPassword = () => {
		uni.navigateTo({
			url: '/pages/forgot-password/forgot-password'
		})
	}
</script>

<style lang="scss">
	page {
		background: #ffffff;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.login-container {
		width: 90%;
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

	.account-input,
	.password-input {
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

	.login-button {
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
		justify-content: space-between;
		width: 100%;
	}

	.helper-text {
		font-family: 'Lexend', sans-serif;
		font-size: 24rpx;
		color: #666666;
		padding: 15rpx 0;
	}

	.forgot-link {
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
</style>