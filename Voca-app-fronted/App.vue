<template>
	<!-- 在App.vue中使用ConfigProvider包裹整个应用 -->
	<wd-config-provider :theme-vars="globalThemeVars">
		<slot />
	</wd-config-provider>
</template>

<script>
	export default {
		data() {
			return {
				// 全局现代化主题配置
				globalThemeVars: {
					// 主要颜色 - 现代炭黑色
					colorTheme: '#000000',

					// 按钮颜色配置 - 现代化设计
					buttonPrimaryBgColor: '#000000',       // 主要按钮 - 炭黑色
					buttonPrimaryColor: '#ffffff',          // 主要按钮文字 - 纯白色

					// 成功按钮 - 薄荷绿系
					buttonSuccessBgColor: '#27ae60',
					buttonSuccessColor: '#ffffff',

					// 警告按钮 - 琥珀橙系
					buttonWarningBgColor: '#f39c12',
					buttonWarningColor: '#ffffff',

					// 错误按钮 - 珊瑚红系
					buttonErrorBgColor: '#e74c3c',
					buttonErrorColor: '#ffffff',

					// 信息按钮 - 清冷蓝系
					buttonInfoBgColor: '#3498db',
					buttonInfoColor: '#ffffff',

					// 默认按钮 - 淡雅灰色
					buttonNormalBgColor: '#ecf0f1',
					buttonNormalColor: '#2c3e50',

					// 其他组件颜色配置
					navbarBackground: '#2c3e50',           // 导航栏背景
					navbarColor: '#ffffff',                  // 导航栏文字

					tabbarActiveColor: '#2c3e50',           // 底部导航激活色
					tabbarInactiveColor: '#95a5a6',         // 底部导航非激活色
				}
			}
		},
		onLaunch: function() {
			console.log('App Launch - 现代化主题已加载')
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style>
	/*每个页面公共css */

	/* 全局样式补充 */
	page {
		/* 设置页面基础样式 */
		background-color: #f8f9fa;
		color: #2c3e50;
		/* 使用项目定义的字体 */
		font-family: 'Lexend', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
		font-weight: 400;
	}

	/* 全局主题变量 - 备用方案 */
	page {
		--wot-color-theme: #000000;
		--wot-color-success: #27ae60;
		--wot-color-warning: #f39c12;
		--wot-color-danger: #e74c3c;
		--wot-color-info: #3498db;
	}

	/* TabBar 样式优化 - 使用项目字体和毛玻璃效果 */
	.uni-tabbar {
		font-family: 'Lexend', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
		font-weight: 500 !important;
		background: rgba(255, 255, 255, 0.85) !important;
		backdrop-filter: blur(20px) !important;
		-webkit-backdrop-filter: blur(20px) !important;
		box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1) !important;
		border-top: 1px solid rgba(0, 0, 0, 0.05) !important;
	}

	/* TabBar 文字样式 */
	.uni-tabbar__item {
		font-family: 'Lexend', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
		font-weight: 500 !important;
	}

	.uni-tabbar__item__text {
		font-family: 'Lexend', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
		font-weight: 500 !important;
		font-size: 22rpx !important;
	}

	/* TabBar 图标容器 */
	.uni-tabbar__item__icon {
		width: 50rpx !important;
		height: 50rpx !important;
	}

	/* 毛玻璃背景增强 */
	.uni-tabbar {
		position: fixed !important;
		bottom: 0 !important;
		left: 0 !important;
		right: 0 !important;
		background: linear-gradient(to bottom,
			rgba(255, 255, 255, 0.75) 0%,
			rgba(255, 255, 255, 0.85) 50%,
			rgba(255, 255, 255, 0.9) 100%) !important;
		backdrop-filter: saturate(180%) blur(20px) !important;
		-webkit-backdrop-filter: saturate(180%) blur(20px) !important;
	}
</style>
