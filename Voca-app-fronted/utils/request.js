/**
 * HTTP请求工具类
 * 适用于uniapp项目，支持Promise和async/await
 */

class Request {
    constructor() {
        // 配置默认请求配置
        this.config = {
            // 根据不同环境配置不同的baseURL
            baseURL: this.getBaseURL(),
            timeout: 10000,
            header: {
                'Content-Type': 'application/json'
            },
            // 是否显示loading
            showLoading: true,
            // loading文字
            loadingText: '加载中...',
            // 是否显示错误提示
            showError: true
        };

        // 存储当前请求任务
        this.requestTasks = [];
    }

    /**
     * 获取当前环境的baseURL
     */
    getBaseURL() {
        // 可以根据不同环境返回不同的baseURL
        // #ifdef H5
        return 'http://localhost:3000/api';  // 修正为后端实际端口
        // #endif

        // #ifdef MP-WEIXIN
        return 'https://your-domain.com/api';
        // #endif

        // #ifdef APP-PLUS
        // 开发环境
        if (process.env.NODE_ENV === 'development') {
            return 'http://192.168.1.100:3000/api'; // 替换为你的开发环境IP，修正端口
        }
        // 生产环境
        return 'https://your-domain.com/api';
        // #endif

        return 'http://localhost:3000/api';  // 修正为后端实际端口
    }

    /**
     * 设置全局配置
     * @param {Object} config 配置对象
     */
    setConfig(config) {
        this.config = { ...this.config, ...config };
    }

    /**
     * 显示loading
     */
    showLoading() {
        if (this.config.showLoading) {
            uni.showLoading({
                title: this.config.loadingText,
                mask: true
            });
        }
    }

    /**
     * 隐藏loading
     */
    hideLoading() {
        uni.hideLoading();
    }

    /**
     * 显示错误提示
     * @param {string} message 错误信息
     */
    showError(message) {
        if (this.config.showError) {
            uni.showToast({
                title: message,
                icon: 'none',
                duration: 2000
            });
        }
    }

    /**
     * 请求拦截器
     * @param {Object} config 请求配置
     */
    requestInterceptor(config) {
        // 添加token
        const token = uni.getStorageSync('token');
        if (token) {
            config.header = {
                ...config.header,
                'Authorization': `Bearer ${token}`
            };
        }

        // 添加时间戳防止缓存
        if (config.method === 'GET') {
            config.url = config.url.includes('?')
                ? `${config.url}&_t=${Date.now()}`
                : `${config.url}?_t=${Date.now()}`;
        }

        return config;
    }

    /**
     * 响应拦截器
     * @param {Object} response 响应数据
     */
    responseInterceptor(response) {
        const { data, statusCode } = response;

        // 打印后端响应用于调试
        console.log('后端响应:', {
            statusCode,
            data
        });

        // 直接返回原始响应数据，不做任何处理
        return data;
    }

    /**
     * 处理HTTP错误
     * @param {number} statusCode 状态码
     * @param {Object} data 响应数据
     */
    handleHTTPError(statusCode, data) {
        let message = '网络错误';

        switch (statusCode) {
            case 400:
                message = data?.message || '请求参数错误';
                break;
            case 422:
                message = data?.message || '业务处理失败';
                break;
            case 401:
                message = '登录已过期，请重新登录';
                // 清除token并跳转到登录页
                uni.removeStorageSync('token');
                uni.removeStorageSync('refreshToken');
                uni.reLaunch({
                    url: '/pages/login/login'
                });
                break;
            case 403:
                message = '权限不足';
                break;
            case 404:
                message = '请求的资源不存在';
                break;
            case 500:
                message = '服务器内部错误';
                break;
            case 502:
                message = '网关错误';
                break;
            case 503:
                message = '服务不可用';
                break;
            case 504:
                message = '网关超时';
                break;
        }

        this.showError(message);

        // 直接返回后端错误响应格式
        return {
            code: statusCode,
            message,
            data: null
        };
    }

    /**
     * 核心请求方法
     * @param {Object} options 请求选项
     */
    request(options) {
        return new Promise((resolve, reject) => {
            // 请求配置
            const config = {
                url: this.config.baseURL + options.url,
                method: options.method || 'GET',
                data: options.data || {},
                header: {
                    ...this.config.header,
                    ...options.header
                },
                timeout: options.timeout || this.config.timeout
            };

            // 应用请求拦截器
            const finalConfig = this.requestInterceptor(config);

            // 显示loading
            if (options.showLoading !== false) {
                this.showLoading();
            }

            // 发起请求
            const requestTask = uni.request({
                ...finalConfig,
                success: (response) => {
                    try {
                        const result = this.responseInterceptor(response);
                        resolve(result);
                    } catch (error) {
                        this.showError('响应处理失败');
                        reject(error);
                    }
                },
                fail: (error) => {
                    console.error('请求失败:', error);

                    // 处理网络错误
                    let message = '网络连接失败';
                    if (error.errMsg.includes('timeout')) {
                        message = '请求超时';
                    } else if (error.errMsg.includes('fail')) {
                        message = '网络连接失败，请检查网络设置';
                    }

                    this.showError(message);

                    reject({
                        code: -1,
                        message,
                        data: null,
                        error
                    });
                },
                complete: () => {
                    // 隐藏loading
                    if (options.showLoading !== false) {
                        this.hideLoading();
                    }
                }
            });

            // 存储请求任务（用于取消）
            if (options.storeTask !== false) {
                this.requestTasks.push(requestTask);
            }
        });
    }

    /**
     * GET请求
     * @param {string} url 请求地址
     * @param {Object} params 请求参数
     * @param {Object} options 请求选项
     */
    get(url, params = {}, options = {}) {
        const queryString = Object.keys(params)
            .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
            .join('&');

        const finalUrl = queryString ? `${url}?${queryString}` : url;

        return this.request({
            url: finalUrl,
            method: 'GET',
            ...options
        });
    }

    /**
     * POST请求
     * @param {string} url 请求地址
     * @param {Object} data 请求数据
     * @param {Object} options 请求选项
     */
    post(url, data = {}, options = {}) {
        return this.request({
            url,
            method: 'POST',
            data,
            ...options
        });
    }

    /**
     * PUT请求
     * @param {string} url 请求地址
     * @param {Object} data 请求数据
     * @param {Object} options 请求选项
     */
    put(url, data = {}, options = {}) {
        return this.request({
            url,
            method: 'PUT',
            data,
            ...options
        });
    }

    /**
     * DELETE请求
     * @param {string} url 请求地址
     * @param {Object} data 请求数据
     * @param {Object} options 请求选项
     */
    delete(url, data = {}, options = {}) {
        return this.request({
            url,
            method: 'DELETE',
            data,
            ...options
        });
    }

    /**
     * 上传文件
     * @param {string} url 上传地址
     * @param {string} filePath 文件路径
     * @param {Object} formData 表单数据
     * @param {Object} options 上传选项
     */
    upload(url, filePath, formData = {}, options = {}) {
        return new Promise((resolve, reject) => {
            const config = {
                url: this.config.baseURL + url,
                filePath,
                name: options.name || 'file',
                formData,
                header: {
                    // 不要手动设置Content-Type，让uni.uploadFile自动设置multipart boundary
                    // Authorization会自动添加
                }
            };

            // 添加token
            const token = uni.getStorageSync('token');
            if (token) {
                config.header.Authorization = `Bearer ${token}`;
            }

            // 显示loading
            if (options.showLoading !== false) {
                this.showLoading();
            }

            uni.uploadFile({
                ...config,
                success: (response) => {
                    try {
                        const data = JSON.parse(response.data);
                        const result = this.responseInterceptor({ data, statusCode: response.statusCode });
                        resolve(result);
                    } catch (error) {
                        this.showError('文件上传失败');
                        reject(error);
                    }
                },
                fail: (error) => {
                    console.error('文件上传失败:', error);
                    this.showError('文件上传失败');
                    reject(error);
                },
                complete: () => {
                    // 隐藏loading
                    if (options.showLoading !== false) {
                        this.hideLoading();
                    }
                }
            });
        });
    }

    /**
     * 取消所有请求
     */
    cancelAllRequests() {
        this.requestTasks.forEach(task => {
            task.abort();
        });
        this.requestTasks = [];
    }

    /**
     * 设置token
     * @param {string} token JWT token
     */
    setToken(token) {
        uni.setStorageSync('token', token);
    }

    /**
     * 获取token
     */
    getToken() {
        return uni.getStorageSync('token');
    }

    /**
     * 清除token
     */
    clearToken() {
        uni.removeStorageSync('token');
        uni.removeStorageSync('refreshToken');
    }

    /**
     * 检查是否登录
     */
    isLoggedIn() {
        return !!this.getToken();
    }
}

// 创建单例实例
const request = new Request();

// 导出实例和类
export default request;
export { Request };