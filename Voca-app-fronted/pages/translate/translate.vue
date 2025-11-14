<template>
	<view class="translate-container">
		<!-- 顶部导航栏 -->
		<view class="header-nav">
			<view class="nav-title">翻译</view>
		</view>

		<!-- 翻译输入区域 -->
		<view class="translate-section">
			<!-- 语言选择器 -->
			<view class="language-selector">
				<view class="language-item" @click="showSourceLanguageOptions">
					<text class="language-text">{{ sourceLanguage }}</text>
					<wd-icon name="arrow-down" size="16" color="#666666"></wd-icon>
				</view>
				<view class="swap-button" @click="swapLanguages">
					<wd-icon name="refresh" size="20" color="#000000"></wd-icon>
				</view>
				<view class="language-item" @click="showTargetLanguageOptions">
					<text class="language-text">{{ targetLanguage }}</text>
					<wd-icon name="arrow-down" size="16" color="#666666"></wd-icon>
				</view>
			</view>

			<!-- 输入框 -->
			<view class="input-section">
				<wd-textarea
					v-model="sourceText"
					class="translate-input"
					placeholder="请输入要翻译的内容"
					:maxlength="5000"
					@input="onInputChange"
					:auto-height="true"
					:show-word-limit="true"
				></wd-textarea>
				<view class="input-actions">
					<wd-button
						v-if="sourceText"
						type="info"
						size="small"
						custom-class="clear-btn"
						@click="clearText"
					>
						清空
					</wd-button>
					<wd-button
						type="primary"
						size="small"
						custom-class="translate-btn"
						@click="translateText"
						:disabled="!sourceText || isTranslating"
					>
						{{ isTranslating ? '翻译中...' : '翻译' }}
					</wd-button>
				</view>
			</view>
		</view>

		<!-- 翻译结果区域 -->
		<view class="result-section" v-if="translatedText || isTranslating">
			<view class="result-header">
				<text class="result-title">翻译结果</text>
				<view class="result-actions" v-if="translatedText">
					<wd-button
						type="info"
						size="small"
						custom-class="copy-btn"
						@click="copyResult"
					>
						复制
					</wd-button>
					<wd-button
						type="info"
						size="small"
						custom-class="play-btn"
						@click="playAudio"
					>
						播放
					</wd-button>
				</view>
			</view>
			<view class="result-content">
				<text class="result-text" v-if="translatedText">{{ translatedText }}</text>
				<view class="loading-placeholder" v-else-if="isTranslating">
					<wd-loading type="circle" size="32rpx"></wd-loading>
					<text class="loading-text">正在翻译中...</text>
				</view>
			</view>
		</view>

	
		<!-- 常用语板块 -->
		<view class="phrases-section">
			<view class="phrases-header">
				<text class="phrases-title">常用语</text>
			</view>
			<view class="phrases-grid">
				<view
					class="phrase-item"
					v-for="(phrase, index) in commonPhrases"
					:key="index"
					@click="usePhrase(phrase)"
				>
					<text class="phrase-text">{{ phrase }}</text>
				</view>
			</view>
		</view>

		<!-- 自定义TabBar -->
		<custom-tabbar />
	</view>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import CustomTabbar from '@/components/custom-tabbar/custom-tabbar.vue'

// 语言选项
const languages = [
	{ code: 'zh', name: '中文' },
	{ code: 'en', name: '英语' },
	{ code: 'ja', name: '日语' },
	{ code: 'ko', name: '韩语' },
	{ code: 'fr', name: '法语' },
	{ code: 'de', name: '德语' },
	{ code: 'es', name: '西班牙语' },
	{ code: 'ru', name: '俄语' }
]

// 状态变量
const sourceLanguage = ref('中文')
const targetLanguage = ref('英语')
const sourceText = ref('')
const translatedText = ref('')
const isTranslating = ref(false)


// 常用语
const commonPhrases = [
	'你好，很高兴认识你',
	'今天天气怎么样',
	'请问洗手间在哪里',
	'谢谢你的帮助',
	'祝你有美好的一天',
	'再见，期待下次见面',
	'这个多少钱',
	'你能帮我个忙吗'
]

// 显示源语言选择
const showSourceLanguageOptions = () => {
	uni.showActionSheet({
		itemList: languages.map(item => item.name),
		success: (res) => {
			const selectedLang = languages[res.tapIndex]
			if (selectedLang.name !== targetLanguage.value) {
				sourceLanguage.value = selectedLang.name
			} else {
				uni.showToast({
					title: '源语言和目标语言不能相同',
					icon: 'none'
				})
			}
		}
	})
}

// 显示目标语言选择
const showTargetLanguageOptions = () => {
	uni.showActionSheet({
		itemList: languages.map(item => item.name),
		success: (res) => {
			const selectedLang = languages[res.tapIndex]
			if (selectedLang.name !== sourceLanguage.value) {
				targetLanguage.value = selectedLang.name
			} else {
				uni.showToast({
					title: '目标语言和源语言不能相同',
					icon: 'none'
				})
			}
		}
	})
}

// 交换语言
const swapLanguages = () => {
	const temp = sourceLanguage.value
	sourceLanguage.value = targetLanguage.value
	targetLanguage.value = temp

	// 如果有翻译结果，交换源文本和目标文本
	if (translatedText.value) {
		const tempText = sourceText.value
		sourceText.value = translatedText.value
		translatedText.value = tempText
	}
}

// 输入变化处理
const onInputChange = () => {
	// 可以在这里添加实时翻译功能
}

// 清空文本
const clearText = () => {
	sourceText.value = ''
	translatedText.value = ''
}

// 翻译文本
const translateText = async () => {
	if (!sourceText.value.trim()) {
		uni.showToast({
			title: '请输入要翻译的内容',
			icon: 'none'
		})
		return
	}

	isTranslating.value = true

	try {
		// 模拟翻译API调用
		await new Promise(resolve => setTimeout(resolve, 1500))

		// 这里应该调用实际的翻译API
		// 现在只是模拟翻译结果
		const mockTranslations = {
			'中文-英语': 'Hello, nice to meet you',
			'英语-中文': '你好，很高兴认识你',
			'中文-日语': 'こんにちは、はじめまして',
			'日语-中文': '你好，初次见面'
		}

		const langPair = `${sourceLanguage.value}-${targetLanguage.value}`
		translatedText.value = mockTranslations[langPair] || `[模拟翻译结果] ${sourceText.value}`

	
	} catch (error) {
		uni.showToast({
			title: '翻译失败，请重试',
			icon: 'none'
		})
	} finally {
		isTranslating.value = false
	}
}


// 复制结果
const copyResult = () => {
	uni.setClipboardData({
		data: translatedText.value,
		success: () => {
			uni.showToast({
				title: '已复制到剪贴板',
				icon: 'success'
			})
		}
	})
}

// 播放音频
const playAudio = () => {
	uni.showToast({
		title: '语音播放功能开发中',
		icon: 'none'
	})
}


// 使用常用语
const usePhrase = (phrase: string) => {
	sourceText.value = phrase
	// 自动翻译
	translateText()
}

// 页面加载时初始化
onMounted(() => {
	console.log('翻译页面加载完成')
})
</script>

<style lang="scss">
page {
	background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
	height: 100vh;
}

.translate-container {
	height: 100vh;
	padding: 40rpx 30rpx 140rpx 30rpx;
	display: flex;
	flex-direction: column;
	gap: 24rpx;
	box-sizing: border-box;
}

/* 顶部导航栏 */
.header-nav {
	display: flex;
	justify-content: center;
	align-items: center;
	padding: 30rpx 0;
}

.nav-title {
	font-family: $voca-primary-font;
	font-weight: $font-weight-medium;
	font-size: 26rpx;
	color: #000000;
}

/* 翻译输入区域 */
.translate-section {
	background: #ffffff;
	border-radius: 24rpx;
	padding: 30rpx;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
	border: 1px solid #f0f0f0;
}

/* 语言选择器 */
.language-selector {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 24rpx;
	padding: 20rpx 0;
}

.language-item {
	display: flex;
	align-items: center;
	gap: 8rpx;
	padding: 12rpx 20rpx;
	background: #f8f9fa;
	border-radius: 12rpx;
	cursor: pointer;
	transition: all 0.3s ease;

	&:active {
		background: #e9ecef;
		transform: scale(0.95);
	}
}

.language-text {
	font-family: $voca-primary-font;
	font-size: 26rpx;
	color: #000000;
	font-weight: 500;
}

.swap-button {
	width: 60rpx;
	height: 60rpx;
	background: #000000;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	transition: all 0.3s ease;

	&:active {
		transform: scale(0.9);
		background: #333333;
	}
}

/* 输入框区域 */
.input-section {
	position: relative;
}

.translate-input {
	width: 100%;
	min-height: 120rpx;
	border: 1px solid #e9ecef;
	border-radius: 16rpx;
	padding: 15rpx !important;
	font-size: 28rpx;
	line-height: 1.5;
	background: #ffffff;
}

.input-actions {
	display: flex;
	justify-content: flex-end;
	gap: 16rpx;
	margin-top: 16rpx;
}

.clear-btn, .translate-btn {
	height: 60rpx;
	border-radius: 12rpx;
	font-size: 24rpx;
}

/* 翻译结果区域 */
.result-section {
	background: #ffffff;
	border-radius: 24rpx;
	padding: 30rpx;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
	border: 1px solid #f0f0f0;
}

.result-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 20rpx;
}

.result-title {
	font-family: $voca-primary-font;
	font-weight: $font-weight-bold;
	font-size: 28rpx;
	color: #000000;
}

.result-actions {
	display: flex;
	gap: 12rpx;
}

.copy-btn, .play-btn {
	height: 50rpx;
	border-radius: 10rpx;
	font-size: 22rpx;
}

.result-content {
	min-height: 80rpx;
	display: flex;
	align-items: center;
}

.result-text {
	font-family: $voca-primary-font;
	font-size: 28rpx;
	color: #000000;
	line-height: 1.5;
}

.loading-placeholder {
	display: flex;
	align-items: center;
	gap: 12rpx;
}

.loading-text {
	font-family: $voca-secondary-font;
	font-size: 26rpx;
	color: #666666;
}

/* 历史记录区域 */
.history-section {
	background: #ffffff;
	border-radius: 24rpx;
	padding: 30rpx;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
	border: 1px solid #f0f0f0;
	max-height: 400rpx;
	overflow: hidden;
}

.history-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 20rpx;
}

.history-title {
	font-family: $voca-primary-font;
	font-weight: $font-weight-bold;
	font-size: 28rpx;
	color: #000000;
}

.clear-history-btn {
	height: 50rpx;
	border-radius: 10rpx;
	font-size: 22rpx;
}

.history-list {
	max-height: 300rpx;
	overflow-y: auto;
}

.history-item {
	padding: 20rpx;
	background: #f8f9fa;
	border-radius: 12rpx;
	margin-bottom: 12rpx;
	cursor: pointer;
	transition: all 0.3s ease;

	&:active {
		background: #e9ecef;
		transform: scale(0.98);
	}

	&:last-child {
		margin-bottom: 0;
	}
}

.history-content {
	display: flex;
	align-items: flex-start;
	gap: 16rpx;
	margin-bottom: 8rpx;
}

.history-source, .history-target {
	flex: 1;
}

.source-lang, .target-lang {
	font-family: $voca-secondary-font;
	font-size: 20rpx;
	color: #666666;
	margin-bottom: 4rpx;
	display: block;
}

.source-text, .target-text {
	font-family: $voca-primary-font;
	font-size: 24rpx;
	color: #000000;
	line-height: 1.4;
	display: block;
}

.history-arrow {
	display: flex;
	align-items: center;
	padding-top: 20rpx;
}

.history-time {
	font-family: $voca-secondary-font;
	font-size: 20rpx;
	color: #999999;
	text-align: right;
}

/* 常用语板块 */
.phrases-section {
	background: #ffffff;
	border-radius: 24rpx;
	padding: 30rpx;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
	border: 1px solid #f0f0f0;
}

.phrases-header {
	margin-bottom: 20rpx;
}

.phrases-title {
	font-family: $voca-primary-font;
	font-weight: $font-weight-bold;
	font-size: 28rpx;
	color: #000000;
}

.phrases-grid {
	display: flex;
	flex-wrap: wrap;
	gap: 12rpx;
}

.phrase-item {
	background: #f8f9fa;
	border-radius: 20rpx;
	padding: 16rpx 24rpx;
	cursor: pointer;
	transition: all 0.3s ease;

	&:active {
		background: #e9ecef;
		transform: scale(0.95);
	}
}

.phrase-text {
	font-family: $voca-primary-font;
	font-size: 24rpx;
	color: #000000;
}
</style>