/**
 * 工具函数集合
 */

/**
 * 格式化日期
 * @param {Date|string|number} date 日期
 * @param {string} format 格式 'YYYY-MM-DD' | 'YYYY-MM-DD HH:mm:ss'
 */
export const formatDate = (date, format = 'YYYY-MM-DD') => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');

    return format
        .replace('YYYY', year)
        .replace('MM', month)
        .replace('DD', day)
        .replace('HH', hours)
        .replace('mm', minutes)
        .replace('ss', seconds);
};

/**
 * 相对时间格式化
 * @param {Date|string|number} date 日期
 */
export const formatRelativeTime = (date) => {
    const now = new Date();
    const target = new Date(date);
    const diff = now.getTime() - target.getTime();

    const minute = 60 * 1000;
    const hour = minute * 60;
    const day = hour * 24;
    const week = day * 7;
    const month = day * 30;

    if (diff < minute) {
        return '刚刚';
    } else if (diff < hour) {
        return `${Math.floor(diff / minute)}分钟前`;
    } else if (diff < day) {
        return `${Math.floor(diff / hour)}小时前`;
    } else if (diff < week) {
        return `${Math.floor(diff / day)}天前`;
    } else if (diff < month) {
        return `${Math.floor(diff / week)}周前`;
    } else {
        return formatDate(date);
    }
};

/**
 * 存储管理
 */
export const storage = {
    /**
     * 设置存储
     * @param {string} key 键
     * @param {any} value 值
     */
    set: (key, value) => {
        try {
            const serializedValue = JSON.stringify(value);
            uni.setStorageSync(key, serializedValue);
        } catch (error) {
            console.error('存储设置失败:', error);
        }
    },

    /**
     * 获取存储
     * @param {string} key 键
     * @param {any} defaultValue 默认值
     */
    get: (key, defaultValue = null) => {
        try {
            const value = uni.getStorageSync(key);
            return value ? JSON.parse(value) : defaultValue;
        } catch (error) {
            console.error('存储获取失败:', error);
            return defaultValue;
        }
    },

    /**
     * 删除存储
     * @param {string} key 键
     */
    remove: (key) => {
        try {
            uni.removeStorageSync(key);
        } catch (error) {
            console.error('存储删除失败:', error);
        }
    },

    /**
     * 清空存储
     */
    clear: () => {
        try {
            uni.clearStorageSync();
        } catch (error) {
            console.error('存储清空失败:', error);
        }
    }
};

/**
 * 用户认证相关工具
 */
export const auth = {
    /**
     * 保存登录信息
     * @param {Object} loginData 登录数据
     */
    saveLoginInfo: (loginData) => {
        const { token, refreshToken, user } = loginData;

        // 保存token
        uni.setStorageSync('token', token);
        uni.setStorageSync('refreshToken', refreshToken);

        // 保存用户信息
        storage.set('userInfo', user);

        // 保存登录状态
        storage.set('isLoggedIn', true);
    },

    /**
     * 清除登录信息
     */
    clearLoginInfo: () => {
        uni.removeStorageSync('token');
        uni.removeStorageSync('refreshToken');
        storage.remove('userInfo');
        storage.remove('isLoggedIn');
    },

    /**
     * 退出登录
     * @param {boolean} showConfirm 是否显示确认弹窗
     * @returns {Promise<boolean>} 是否成功退出
     */
    logout: async (showConfirm = true) => {
        if (showConfirm) {
            return new Promise((resolve) => {
                uni.showModal({
                    title: '退出登录',
                    content: '确定要退出登录吗？',
                    success: async (res) => {
                        if (res.confirm) {
                            const success = await auth._performLogout();
                            resolve(success);
                        } else {
                            resolve(false);
                        }
                    }
                });
            });
        } else {
            return await auth._performLogout();
        }
    },

    /**
     * 执行退出登录操作
     * @private
     * @returns {Promise<boolean>} 是否成功退出
     */
    _performLogout: async () => {
        try {
            // 显示加载提示
            uni.showLoading({
                title: '退出中...'
            });

            // 调用后端退出API
            const authAPI = require('@/api/auth.js').default;
            await authAPI.logout();

            // 清除本地登录信息
            auth.clearLoginInfo();

            uni.hideLoading();

            // 显示退出成功提示
            uni.showToast({
                title: '退出成功',
                icon: 'success',
                duration: 1500
            });

            // 跳转到登录页面
            setTimeout(() => {
                uni.reLaunch({
                    url: '/pages/login/login'
                });
            }, 1500);

            return true;

        } catch (error) {
            console.error('退出登录失败:', error);

            // 即使后端退出失败，也清除本地登录信息
            auth.clearLoginInfo();

            uni.hideLoading();

            // 显示退出成功（本地清除成功）
            uni.showToast({
                title: '退出成功',
                icon: 'success',
                duration: 1500
            });

            // 跳转到登录页面
            setTimeout(() => {
                uni.reLaunch({
                    url: '/pages/login/login'
                });
            }, 1500);

            return true; // 本地清除成功
        }
    },

    /**
     * 检查是否已登录
     */
    isLoggedIn: () => {
        return storage.get('isLoggedIn', false) && !!uni.getStorageSync('token');
    },

    /**
     * 获取用户信息
     */
    getUserInfo: () => {
        return storage.get('userInfo', {});
    },

    /**
     * 获取token
     */
    getToken: () => {
        return uni.getStorageSync('token');
    },

    /**
     * 获取refreshToken
     */
    getRefreshToken: () => {
        return uni.getStorageSync('refreshToken');
    }
};

/**
 * 页面跳转工具
 */
export const navigation = {
    /**
     * 跳转到指定页面
     * @param {string} url 页面路径
     * @param {Object} options 跳转选项
     */
    navigateTo: (url, options = {}) => {
        uni.navigateTo({
            url,
            ...options
        });
    },

    /**
     * 重定向到指定页面
     * @param {string} url 页面路径
     * @param {Object} options 跳转选项
     */
    redirectTo: (url, options = {}) => {
        uni.redirectTo({
            url,
            ...options
        });
    },

    /**
     * 切换到指定页面
     * @param {string} url 页面路径
     * @param {Object} options 跳转选项
     */
    switchTab: (url, options = {}) => {
        uni.switchTab({
            url,
            ...options
        });
    },

    /**
     * 返回上一页
     * @param {number} delta 返回页面数
     */
    navigateBack: (delta = 1) => {
        uni.navigateBack({
            delta
        });
    },

    /**
     * 重新启动应用
     * @param {string} url 页面路径
     * @param {Object} options 跳转选项
     */
    reLaunch: (url, options = {}) => {
        uni.reLaunch({
            url,
            ...options
        });
    }
};

/**
 * 提示消息工具
 */
export const toast = {
    /**
     * 显示成功消息
     * @param {string} message 消息内容
     * @param {Object} options 选项
     */
    success: (message, options = {}) => {
        uni.showToast({
            title: message,
            icon: 'success',
            duration: 2000,
            ...options
        });
    },

    /**
     * 显示错误消息
     * @param {string} message 消息内容
     * @param {Object} options 选项
     */
    error: (message, options = {}) => {
        uni.showToast({
            title: message,
            icon: 'none',
            duration: 2000,
            ...options
        });
    },

    /**
     * 显示普通消息
     * @param {string} message 消息内容
     * @param {Object} options 选项
     */
    info: (message, options = {}) => {
        uni.showToast({
            title: message,
            icon: 'none',
            duration: 2000,
            ...options
        });
    },

    /**
     * 显示加载消息
     * @param {string} message 消息内容
     * @param {Object} options 选项
     */
    loading: (message = '加载中...', options = {}) => {
        uni.showLoading({
            title: message,
            mask: true,
            ...options
        });
    },

    /**
     * 隐藏加载消息
     */
    hideLoading: () => {
        uni.hideLoading();
    }
};

/**
 * 数据验证工具
 */
export const validator = {
    /**
     * 验证邮箱格式
     * @param {string} email 邮箱地址
     */
    isEmail: (email) => {
        const reg = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return reg.test(email);
    },

    /**
     * 验证手机号格式
     * @param {string} phone 手机号
     */
    isPhone: (phone) => {
        const reg = /^1[3-9]\d{9}$/;
        return reg.test(phone);
    },

    /**
     * 验证密码强度
     * @param {string} password 密码
     * @param {Object} options 验证选项
     */
    isPassword: (password, options = {}) => {
        const {
            minLength = 6,
            requireNumber = true,
            requireUppercase = false,
            requireLowercase = false,
            requireSpecial = false
        } = options;

        if (password.length < minLength) {
            return false;
        }

        if (requireNumber && !/\d/.test(password)) {
            return false;
        }

        if (requireUppercase && !/[A-Z]/.test(password)) {
            return false;
        }

        if (requireLowercase && !/[a-z]/.test(password)) {
            return false;
        }

        if (requireSpecial && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            return false;
        }

        return true;
    },

    /**
     * 验证是否为空
     * @param {any} value 值
     */
    isEmpty: (value) => {
        return value === null || value === undefined || value === '';
    },

    /**
     * 验证URL格式
     * @param {string} url URL地址
     */
    isUrl: (url) => {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }
};

/**
 * 设备信息工具
 */
export const device = {
    /**
     * 获取设备信息
     */
    getSystemInfo: () => {
        try {
            return uni.getSystemInfoSync();
        } catch (error) {
            console.error('获取设备信息失败:', error);
            return {};
        }
    },

    /**
     * 获取平台信息
     */
    getPlatform: () => {
        const systemInfo = device.getSystemInfo();
        return systemInfo.platform || 'unknown';
    },

    /**
     * 判断是否为iOS
     */
    isIOS: () => {
        return device.getPlatform() === 'ios';
    },

    /**
     * 判断是否为Android
     */
    isAndroid: () => {
        return device.getPlatform() === 'android';
    },

    /**
     * 判断是否为H5
     */
    isH5: () => {
        return device.getPlatform() === 'h5';
    },

    /**
     * 判断是否为小程序
     */
    isMiniProgram: () => {
        const platform = device.getPlatform();
        return ['mp-weixin', 'mp-alipay', 'mp-baidu', 'mp-toutiao', 'mp-qq'].includes(platform);
    }
};

/**
 * 防抖函数
 * @param {Function} func 要防抖的函数
 * @param {number} delay 延迟时间（毫秒）
 */
export const debounce = (func, delay = 300) => {
    let timer = null;
    return function (...args) {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
};

/**
 * 节流函数
 * @param {Function} func 要节流的函数
 * @param {number} delay 节流时间（毫秒）
 */
export const throttle = (func, delay = 300) => {
    let timer = null;
    return function (...args) {
        if (!timer) {
            func.apply(this, args);
            timer = setTimeout(() => {
                timer = null;
            }, delay);
        }
    };
};