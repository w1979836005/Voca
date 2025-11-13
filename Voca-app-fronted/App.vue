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
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
	}

	/* 全局主题变量 - 备用方案 */
	page {
		--wot-color-theme: #000000;
		--wot-color-success: #27ae60;
		--wot-color-warning: #f39c12;
		--wot-color-danger: #e74c3c;
		--wot-color-info: #3498db;
	}
</style>
