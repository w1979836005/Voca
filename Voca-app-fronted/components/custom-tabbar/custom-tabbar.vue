<template>
	<view class="custom-tabbar">
		<view
			v-for="(item, index) in tabList"
			:key="index"
			class="tabbar-item"
			:class="{ 'active': currentTab === item.pagePath }"
			@click="switchTab(item)"
		>
			<view class="tabbar-icon">
				<image
					:src="currentTab === item.pagePath ? item.selectedIconPath : item.iconPath"
					class="icon-image"
					mode="aspectFit"
				/>
			</view>
			<text class="tabbar-text">{{ item.text }}</text>
		</view>
	</view>
</template>

<script>
export default {
	name: 'CustomTabbar',
	data() {
		return {
			currentTab: '',
			tabList: [
				{
					pagePath: "pages/home/home",
					text: "首页",
					iconPath: "/static/tabbar/主页.png",
					selectedIconPath: "/static/tabbar/主页 (1).png"
				},
				{
					pagePath: "pages/wordlist/wordlist",
					text: "词单",
					iconPath: "/static/tabbar/词单.png",
					selectedIconPath: "/static/tabbar/词单(1).png"
				},
				{
					pagePath: "pages/profile/profile",
					text: "我的",
					iconPath: "/static/tabbar/用户.png",
					selectedIconPath: "/static/tabbar/用户 (1).png"
				}
			]
		}
	},
	mounted() {
		this.getCurrentTab()
	},
	methods: {
		getCurrentTab() {
			const pages = getCurrentPages()
			if (pages.length > 0) {
				const currentPage = pages[pages.length - 1]
				const route = currentPage.route
				this.currentTab = route
			}
		},
		switchTab(item) {
			if (this.currentTab !== item.pagePath) {
				uni.switchTab({
					url: `/${item.pagePath}`
				})
			}
		}
	}
}
</script>

<style lang="scss" scoped>
.custom-tabbar {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	height: 110rpx;
	background: linear-gradient(to bottom,
		rgba(255, 255, 255, 0.75) 0%,
		rgba(255, 255, 255, 0.85) 50%,
		rgba(255, 255, 255, 0.9) 100%
	);
	backdrop-filter: saturate(180%) blur(20px);
	-webkit-backdrop-filter: saturate(180%) blur(20px);
	display: flex;
	justify-content: space-around;
	align-items: center;
	padding: 10rpx 0;
	box-sizing: border-box;
	border-top: 1px solid rgba(0, 0, 0, 0.05);
	box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
	z-index: 1000;
}

.tabbar-item {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	height: 100%;
	position: relative;
	transition: all 0.3s ease;
}

.tabbar-icon {
	width: 50rpx;
	height: 50rpx;
	margin-bottom: 6rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.icon-image {
	width: 100%;
	height: 100%;
	transition: transform 0.3s ease;
}

.tabbar-text {
	font-family: 'Lexend', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
	font-weight: 500;
	font-size: 22rpx;
	color: rgba(0, 0, 0, 0.6);
	line-height: 1;
	transition: all 0.3s ease;
}

.tabbar-item.active {
	.tabbar-text {
		color: #000000;
		font-weight: 600;
	}

	.icon-image {
		transform: scale(1.1);
	}
}

/* 激活状态的光晕效果 */
.tabbar-item.active::before {
	content: '';
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	width: 80rpx;
	height: 80rpx;
	background: rgba(0, 0, 0, 0.05);
	border-radius: 50%;
	opacity: 0.5;
	pointer-events: none;
}
</style>