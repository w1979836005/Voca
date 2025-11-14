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
					iconPath: "/static/tabbar/home.png",
					selectedIconPath: "/static/tabbar/home-active.png"
				},
				{
					pagePath: "pages/wordlist/wordlist",
					text: "词单",
					iconPath: "/static/tabbar/wordlist.png",
					selectedIconPath: "/static/tabbar/wordlist-active.png"
				},
				{
					pagePath: "pages/translate/translate",
					text: "翻译",
					iconPath: "/static/tabbar/search.png",
					selectedIconPath: "/static/tabbar/search-active.png"
				},
				{
					pagePath: "pages/profile/profile",
					text: "我的",
					iconPath: "/static/tabbar/profile.png",
					selectedIconPath: "/static/tabbar/profile-active.png"
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
	background: rgba(255, 255, 255, 0.1);
	backdrop-filter: saturate(180%) blur(30px);
	-webkit-backdrop-filter: saturate(180%) blur(30px);
	display: flex;
	justify-content: space-around;
	align-items: center;
	padding: 10rpx 0;
	box-sizing: border-box;
	border-top: none;
	box-shadow: none;
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
	width: 42rpx;
	height: 42rpx;
	margin-bottom: 12rpx;
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
	font-weight: 600;
	font-size: 26rpx;
	color: rgba(0, 0, 0, 0.8);
	line-height: 1;
	transition: all 0.3s ease;
	text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
}

.tabbar-item.active {
	.tabbar-text {
		color: #000000;
		font-weight: 700;
		text-shadow: 0 1px 3px rgba(255, 255, 255, 0.9);
	}

	.icon-image {
		transform: none;
		filter: none;
	}
}
</style>