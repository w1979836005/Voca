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
				<wd-input v-model="formData.username" class="account-input" clearable placeholder="请输入邮箱或用户名"
					@change="handleChange" />
			</view>

			<view class="input-group">
				<wd-input v-model="formData.password" class="password-input" clearable placeholder="请输入密码" show-password
					@change="handleChange" />
			</view>

			<!-- 登录按钮 -->
			<wd-button
				type="primary"
				class="login-button"
				block
				round
				@click="handleLogin"
				:disabled="!canLogin"
			>
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
	import { reactive, computed, onMounted } from 'vue'
	import authAPI from '@/api/auth.js'
	import { auth, navigation, toast, validator } from '@/utils/index.js'

	// 表单数据
	const formData = reactive({
		username: '',
		password: ''
	})

	// 检查是否可以登录
	const canLogin = computed(() => {
		const usernameValid = formData.username.trim() !== ''
		const passwordValid = formData.password.trim() !== '' && formData.password.length >= 6
		const result = usernameValid && passwordValid

		return result
	})

	// 检查登录状态
	const checkLoginStatus = () => {
		if (auth.isLoggedIn()) {
			toast.info('您已登录，跳转中...')
			setTimeout(() => {
				navigation.switchTab('/pages/home/home')
			}, 1000)
			return true
		}
		return false
	}

	// 处理输入变化
	const handleChange = (value: string) => {
		// 可以在这里添加输入验证逻辑
	}

	// 处理登录
	const handleLogin = async () => {
		if (!canLogin.value) {
			toast.error('请输入用户名/邮箱和密码')
			return
		}

		try {
			toast.loading('登录中...')

			// 调用登录API（后端会自动判断是邮箱还是用户名）
			const res = await authAPI.login({
				email: formData.username, // 后端API接口字段名为email，但支持传入用户名或邮箱
				password: formData.password
			})

			if (res.code === 200) {
				// 保存登录信息
				const loginData = res.data; // 实际的登录数据
				auth.saveLoginInfo({
					token: loginData.token,
					refreshToken: loginData.refreshToken,
					user: {
						userId: loginData.userId,
						username: loginData.username,
						email: loginData.email,
						userAvatar: loginData.userAvatar,
						userProfile: loginData.userProfile,
						studyGoal: loginData.studyGoal,
						role: loginData.role,
						createdAt: new Date().toISOString()
					}
				})

				toast.success('登录成功！')

				// 延迟跳转，让用户看到成功提示
				setTimeout(() => {
					navigation.switchTab('/pages/home/home')
				}, 1500)
			} else {
				// 业务错误，显示后端返回的具体错误信息
				toast.error(res?.message || '登录失败')
			}
		} catch (error) {
			console.error('登录错误:', error)

			// 根据错误类型显示不同提示
			if (error.code === 400) {
				toast.error('用户名/邮箱或密码格式错误')
			} else if (error.code === 401) {
				toast.error('用户名/邮箱或密码错误')
			} else if (error.code === 403) {
				toast.error('账户已被禁用')
			} else if (error.code === 404) {
				toast.error('用户不存在')
			} else {
				toast.error('网络错误，请重试')
			}
		} finally {
			toast.hideLoading()
		}
	}

	// 跳转到注册页面
	const goToRegister = () => {
		navigation.navigateTo('/pages/register/register')
	}

	// 跳转到忘记密码页面
	const goToForgotPassword = () => {
		navigation.navigateTo('/pages/forgot-password/forgot-password')
	}

	// 组件挂载时检查登录状态
	onMounted(() => {
		checkLoginStatus()
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