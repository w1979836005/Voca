/**
 * 自定义异常基类
 */
class CustomException extends Error {
    constructor(message, code = 500, data = null) {
        super(message);
        this.name = this.constructor.name;
        this.code = code;
        this.data = data;
        this.timestamp = new Date().toISOString();

        // 保持堆栈跟踪
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }

    /**
     * 转换为响应格式
     * @returns {Object} 响应对象
     */
    toResponse() {
        return {
            code: this.code,
            message: this.message,
            data: this.data,
            error: process.env.NODE_ENV === 'development' ? this.stack : undefined,
            timestamp: this.timestamp
        };
    }
}

/**
 * 参数验证异常
 */
class ValidationException extends CustomException {
    constructor(message = '参数验证失败', data = null) {
        super(message, 400, data);
    }
}

/**
 * 认证异常
 */
class AuthenticationException extends CustomException {
    constructor(message = '认证失败', data = null) {
        super(message, 401, data);
    }
}

/**
 * 授权异常
 */
class AuthorizationException extends CustomException {
    constructor(message = '权限不足', data = null) {
        super(message, 403, data);
    }
}

/**
 * 资源未找到异常
 */
class NotFoundException extends CustomException {
    constructor(message = '资源未找到', data = null) {
        super(message, 404, data);
    }
}

/**
 * 资源冲突异常
 */
class ConflictException extends CustomException {
    constructor(message = '资源冲突', data = null) {
        super(message, 409, data);
    }
}

/**
 * 业务逻辑异常
 */
class BusinessException extends CustomException {
    constructor(message = '业务逻辑错误', code = 422, data = null) {
        super(message, code, data);
    }
}

module.exports = {
    CustomException,
    ValidationException,
    AuthenticationException,
    AuthorizationException,
    NotFoundException,
    ConflictException,
    BusinessException
};