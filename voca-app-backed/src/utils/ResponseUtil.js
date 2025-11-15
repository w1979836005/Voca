/**
 * 统一响应格式工具类
 */
class ResponseUtil {
    /**
     * 成功响应
     * @param {Object} data - 响应数据
     * @param {String} message - 响应消息
     * @param {Number} code - 响应码，默认200
     * @returns {Object} 统一格式的响应对象
     */
    static success(data = null, message = '操作成功', code = 200) {
        return {
            code,
            message,
            data,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * 错误响应
     * @param {String} message - 错误消息
     * @param {Number} code - 错误码，默认500
     * @param {Object} error - 错误详情
     * @returns {Object} 统一格式的错误响应对象
     */
    static error(message = '服务器内部错误', code = 500, error = null) {
        return {
            code,
            message,
            data: null,
            error: process.env.NODE_ENV === 'development' ? error : undefined,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * 分页响应
     * @param {Array} list - 数据列表
     * @param {Number} total - 总数量
     * @param {Number} page - 当前页码
     * @param {Number} size - 每页数量
     * @param {String} message - 响应消息
     * @returns {Object} 分页格式的响应对象
     */
    static page(list = [], total = 0, page = 1, size = 10, message = '查询成功') {
        return {
            code: 200,
            message,
            data: {
                list,
                pagination: {
                    total,
                    page: parseInt(page),
                    size: parseInt(size),
                    totalPages: Math.ceil(total / size),
                    hasNext: page * size < total,
                    hasPrev: page > 1
                }
            },
            timestamp: new Date().toISOString()
        };
    }

    /**
     * 参数验证失败响应
     * @param {String} message - 错误消息
     * @returns {Object} 参数验证失败的响应对象
     */
    static validationError(message = '参数验证失败') {
        return this.error(message, 400);
    }

    /**
     * 未授权响应
     * @param {String} message - 错误消息
     * @returns {Object} 未授权的响应对象
     */
    static unauthorized(message = '未授权访问') {
        return this.error(message, 401);
    }

    /**
     * 禁止访问响应
     * @param {String} message - 错误消息
     * @returns {Object} 禁止访问的响应对象
     */
    static forbidden(message = '禁止访问') {
        return this.error(message, 403);
    }

    /**
     * 资源未找到响应
     * @param {String} message - 错误消息
     * @returns {Object} 资源未找到的响应对象
     */
    static notFound(message = '资源未找到') {
        return this.error(message, 404);
    }

    /**
     * 冲突响应
     * @param {String} message - 错误消息
     * @returns {Object} 冲突的响应对象
     */
    static conflict(message = '资源冲突') {
        return this.error(message, 409);
    }
}

module.exports = ResponseUtil;