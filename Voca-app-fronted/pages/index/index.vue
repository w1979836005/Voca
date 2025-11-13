<template>
	<view class="content">
		<image class="logo" src="/static/logo.png"></image>

		<!-- 全局主题已在App.vue中配置，这里直接使用组件 -->
		<view class="button-group">

			<!-- 主要按钮 - 炭黑色背景 -->
			<wd-button type="primary">开始学习</wd-button>

			<!-- 成功按钮 - 薄荷绿背景 -->
			<wd-button type="success">完成</wd-button>

			<!-- 警告按钮 - 琥珀橙背景 -->
			<wd-button type="warning">注意</wd-button>

			<!-- 错误按钮 - 珊瑚红背景 -->
			<wd-button type="error">删除</wd-button>

			<!-- 信息按钮 - 清冷蓝背景 -->
			<wd-button type="info">详情</wd-button>

			<!-- 幽灵按钮 - 只有边框 -->
			<wd-button type="primary" plain>切换词库</wd-button>

			<!-- 文字按钮 - 只有文字 -->
			<wd-button type="text">了解更多</wd-button>
		</view>

		<text class="title">{{title}}</text>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				title: 'Hello Voca'
			}
		},
		onLoad() {

		},
		methods: {

		}
	}
</script>

<style>
	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.logo {
		height: 200rpx;
		width: 200rpx;
		margin-top: 200rpx;
		margin-left: auto;
		margin-right: auto;
		margin-bottom: 50rpx;
	}

	.button-group {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 20rpx;
		margin: 40rpx 0;
		width: 100%;
		padding: 0 40rpx;
		box-sizing: border-box;
	}

	.button-group .wd-button {
		width: 100%;
		margin: 10rpx 0;
	}

	.title {
		font-size: 36rpx;
		color: #8f8f94;
	}
</style>