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
						:src="formData.avatar || userInfo.avatar || '/static/default-avatar.png'"
						class="avatar-image"
						mode="aspectFill"
						@error="onAvatarError"
					></image>
					<view class="avatar-overlay">
						<wd-icon name="camera" size="24" color="#ffffff"></wd-icon>
						<view class="uploading-status" v-if="isUploading">
							<wd-loading type="ring" size="20" color="#ffffff"></wd-loading>
						</view>
					</view>
				</view>
				<text class="avatar-hint">点击更换头像</text>
				<text class="avatar-size">支持JPG、PNG、GIF格式，不超过2MB</text>
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
					:disabled="true"
					style="background: #f8f9fa;"
				></wd-input>
				<text class="form-hint">邮箱地址不可修改</text>
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
import { auth } from '@/utils/index.js'
import { userAPI } from '@/api/user.js'

// 用户原始信息
const userInfo = reactive({
	avatar: '',
	username: '',
	email: '',
	bio: '',
	dailyGoal: 20
})

// 表单数据
const formData = reactive({
	avatar: '',
	username: '',
	email: '',
	bio: '',
	dailyGoal: 20
})

// 上传状态
const isUploading = ref(false)

// 页面加载时加载用户信息
onMounted(() => {
	loadUserInfo()
})

// 加载用户信息
const loadUserInfo = async () => {
	try {
		// 首先从本地存储获取用户信息
		const localUserInfo = auth.getUserInfo()
		if (localUserInfo) {
			userInfo.avatar = localUserInfo.userAvatar || ''
			userInfo.username = localUserInfo.username || ''
			userInfo.email = localUserInfo.email || ''
			userInfo.bio = localUserInfo.userProfile || ''
			userInfo.dailyGoal = localUserInfo.studyGoal || 20

			// 复制到表单
			formData.avatar = userInfo.avatar
			formData.username = userInfo.username
			formData.email = userInfo.email
			formData.bio = userInfo.bio
			formData.dailyGoal = userInfo.dailyGoal
		}

		// 从服务器获取最新用户信息
		const response = await userAPI.getProfile()
		if (response && response.code === 200) {
			const serverUserInfo = response.data
			userInfo.avatar = serverUserInfo.userAvatar || ''
			userInfo.username = serverUserInfo.username || ''
			userInfo.email = serverUserInfo.email || ''
			userInfo.bio = serverUserInfo.userProfile || ''
			userInfo.dailyGoal = serverUserInfo.studyGoal || 20

			// 复制到表单
			formData.avatar = userInfo.avatar
			formData.username = userInfo.username
			formData.email = userInfo.email
			formData.bio = userInfo.bio
			formData.dailyGoal = userInfo.dailyGoal
		}
	} catch (error) {
		console.error('获取用户信息失败:', error)
		uni.showToast({
			title: '获取用户信息失败',
			icon: 'none',
			duration: 2000
		})
	}
}

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
					sizeType: ['compressed'], // 压缩图片
					success: (imageRes) => {
						const tempFilePath = imageRes.tempFilePaths[0]
						console.log('拍照获取图片:', tempFilePath)

						// 立即显示预览
						formData.avatar = tempFilePath

						// 延迟一下再上传，确保图片准备就绪
						setTimeout(() => {
							uploadAvatar(tempFilePath)
						}, 100)
					},
					fail: (error) => {
						console.error('拍照失败:', error)
						uni.showToast({
							title: '拍照失败，请重试',
							icon: 'none'
						})
					}
				})
			} else if (res.tapIndex === 1) {
				// 从相册选择
				uni.chooseImage({
					count: 1,
					sourceType: ['album'],
					sizeType: ['compressed'], // 压缩图片
					success: (imageRes) => {
						const tempFilePath = imageRes.tempFilePaths[0]
						console.log('相册选择图片:', tempFilePath)

						// 立即显示预览
						formData.avatar = tempFilePath

						// 延迟一下再上传，确保图片准备就绪
						setTimeout(() => {
							uploadAvatar(tempFilePath)
						}, 100)
					},
					fail: (error) => {
						console.error('选择图片失败:', error)
						uni.showToast({
							title: '选择图片失败，请重试',
							icon: 'none'
						})
					}
				})
			}
		},
		fail: (error) => {
			console.error('显示选择框失败:', error)
			uni.showToast({
				title: '操作失败，请重试',
				icon: 'none'
			})
		}
	})
}

// 头像加载失败处理
const onAvatarError = () => {
	console.log('头像加载失败，使用默认头像')
	// 可以选择显示一个默认头像或者保持当前状态
}

// 上传头像
const uploadAvatar = async (filePath) => {
	try {
		isUploading.value = true
		console.log('开始上传头像:', filePath)

		const response = await userAPI.uploadAvatar(filePath)
		console.log('头像上传响应:', response)

		if (response && response.code === 200) {
			// 上传成功，更新头像URL
			const avatarUrl = response.data.userAvatar
			userInfo.avatar = avatarUrl
			formData.avatar = avatarUrl

			console.log('头像上传成功:', avatarUrl)

			uni.showToast({
				title: '头像上传成功',
				icon: 'success',
				duration: 2000
			})
		} else {
			// 显示具体的错误信息
			const errorMessage = response?.message || '头像上传失败'
			console.error('头像上传业务错误:', errorMessage)
			uni.showToast({
				title: errorMessage,
				icon: 'none',
				duration: 3000
			})
		}
	} catch (error) {
		console.error('上传头像网络错误:', error)

		// 根据错误类型显示不同的提示
		let errorMessage = '头像上传失败'
		if (error.code === 413) {
			errorMessage = '图片大小不能超过2MB'
		} else if (error.code === 415) {
			errorMessage = '不支持的图片格式'
		} else if (error.code === 401) {
			errorMessage = '请先登录后再上传头像'
		} else if (error.errMsg && error.errMsg.includes('file')) {
			errorMessage = '图片上传失败，请重试'
		}

		uni.showToast({
			title: errorMessage,
			icon: 'none',
			duration: 3000
		})
	} finally {
		isUploading.value = false
	}
}

// 保存个人信息
const saveProfile = async () => {
	console.log('点击保存按钮')

	// 表单验证
	if (!formData.username.trim()) {
		uni.showToast({
			title: '请输入用户名',
			icon: 'none'
		})
		return
	}

	if (formData.username.trim().length < 2) {
		uni.showToast({
			title: '用户名至少2个字符',
			icon: 'none'
		})
		return
	}

	if (formData.username.trim().length > 50) {
		uni.showToast({
			title: '用户名最多50个字符',
			icon: 'none'
		})
		return
	}

	if (formData.bio && formData.bio.length > 200) {
		uni.showToast({
			title: '个人简介最多200个字符',
			icon: 'none'
		})
		return
	}

	const dailyGoal = parseInt(formData.dailyGoal)
	if (isNaN(dailyGoal) || dailyGoal < 1 || dailyGoal > 100) {
		uni.showToast({
			title: '学习目标应为1-100之间的数字',
			icon: 'none'
		})
		return
	}

	// 显示保存中状态
	uni.showLoading({
		title: '保存中...'
	})

	try {
		// 准备更新数据（只包含后端允许的字段）
		const updateData = {
			username: formData.username.trim(),
			userProfile: formData.bio.trim(),
			studyGoal: dailyGoal
		}

		// 调用后端API更新用户信息
		const response = await userAPI.updateProfile(updateData)

		if (response && response.code === 200) {
			// 更新成功，更新本地存储的用户信息
			const updatedUserInfo = response.data
			auth.saveLoginInfo({
				token: auth.getToken(),
				refreshToken: auth.getRefreshToken(),
				user: {
					userId: updatedUserInfo.userId,
					username: updatedUserInfo.username,
					email: updatedUserInfo.email,
					userAvatar: updatedUserInfo.userAvatar,
					userProfile: updatedUserInfo.userProfile,
					studyGoal: updatedUserInfo.studyGoal,
					role: updatedUserInfo.role,
					createdAt: updatedUserInfo.createdAt
				}
			})

			// 更新本地用户信息
			userInfo.username = updatedUserInfo.username
			userInfo.bio = updatedUserInfo.userProfile
			userInfo.dailyGoal = updatedUserInfo.studyGoal

			uni.hideLoading()
			uni.showToast({
				title: '保存成功',
				icon: 'success'
			})

			// 返回上一页
			setTimeout(() => {
				// 触发个人中心页面刷新事件
				uni.$emit('userProfileUpdated')
				uni.navigateBack()
			}, 1500)
		} else {
			uni.hideLoading()
			uni.showToast({
				title: response?.message || '保存失败',
				icon: 'none'
			})
		}
	} catch (error) {
		uni.hideLoading()
		console.error('保存用户信息失败:', error)

		// 根据错误类型显示不同的提示
		if (error.code === 400) {
			uni.showToast({
				title: '请求参数错误',
				icon: 'none'
			})
		} else if (error.code === 422) {
			uni.showToast({
				title: error.message || '业务处理失败',
				icon: 'none'
			})
		} else {
			uni.showToast({
				title: '网络错误，请重试',
				icon: 'none'
			})
		}
	}
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
	margin-top: 8rpx;
}

.avatar-size {
	font-family: $voca-secondary-font;
	font-size: 22rpx;
	color: #999999;
	margin-top: 4rpx;
}

.uploading-status {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
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

.form-hint {
	font-family: $voca-secondary-font;
	font-size: 22rpx;
	color: #999999;
	margin-top: 8rpx;
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