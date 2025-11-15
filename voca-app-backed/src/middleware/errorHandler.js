const ResponseUtil = require('../utils/ResponseUtil');
const {
    CustomException,
    ValidationException,
    AuthenticationException,
    AuthorizationException,
    NotFoundException,
    ConflictException,
    BusinessException
} = require('../exceptions/CustomException');

/**
 * 全局异常处理中间件
 * @param {Error} err - 错误对象
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 下一个中间件函数
 */
const errorHandler = (err, req, res, next) => {
    console.error('全局错误处理:', {
        error: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        body: req.body,
        query: req.query,
        params: req.params,
        timestamp: new Date().toISOString()
    });

    // 自定义异常处理
    if (err instanceof CustomException) {
        return res.status(err.code).json(err.toResponse());
    }

    // Sequelize 验证错误
    if (err.name === 'SequelizeValidationError') {
        const errors = err.errors.map(error => ({
            field: error.path,
            message: error.message,
            value: error.value
        }));

        return res.status(400).json(ResponseUtil.validationError('参数验证失败', errors));
    }

    // Sequelize 唯一约束错误
    if (err.name === 'SequelizeUniqueConstraintError') {
        const field = err.errors[0]?.path || 'unknown';
        return res.status(409).json(ResponseUtil.conflict(`${field} 已存在`));
    }

    // Sequelize 外键约束错误
    if (err.name === 'SequelizeForeignKeyConstraintError') {
        return res.status(400).json(ResponseUtil.validationError('关联数据不存在'));
    }

    // JWT 相关错误
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json(ResponseUtil.unauthorized('Token 无效'));
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json(ResponseUtil.unauthorized('Token 已过期'));
    }

    // 请求体过大错误
    if (err.type === 'entity.too.large') {
        return res.status(413).json(ResponseUtil.error('请求体过大'));
    }

    // 语法错误
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json(ResponseUtil.validationError('请求体格式错误'));
    }

    // 默认服务器错误
    const errorResponse = ResponseUtil.error(
        process.env.NODE_ENV === 'production' ? '服务器内部错误' : err.message,
        500,
        process.env.NODE_ENV === 'development' ? err.stack : undefined
    );

    res.status(500).json(errorResponse);
};

/**
 * 异步错误处理包装器
 * @param {Function} fn - 异步函数
 * @returns {Function} 包装后的函数
 */
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

/**
 * 404 处理中间件
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 下一个中间件函数
 */
const notFoundHandler = (req, res) => {
    res.status(404).json(ResponseUtil.notFound(`接口 ${req.method} ${req.originalUrl} 不存在`));
};

module.exports = {
    errorHandler,
    asyncHandler,
    notFoundHandler
};