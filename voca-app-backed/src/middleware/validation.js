const { ValidationException } = require('../exceptions/customException');

/**
 * 验证请求体参数
 * @param {Object} schema - 验证规则
 * @returns {Function} 中间件函数
 */
const validateBody = (schema) => {
    return (req, res, next) => {
        try {
            const { error, value } = schema.validate(req.body);

            if (error) {
                const errors = error.details.map(detail => ({
                    field: detail.path.join('.'),
                    message: detail.message,
                    value: detail.context?.value
                }));
                throw new ValidationException('参数验证失败', errors);
            }

            // 将验证后的值赋值给请求体
            req.body = value;
            next();
        } catch (err) {
            next(err);
        }
    };
};

/**
 * 验证查询参数
 * @param {Object} schema - 验证规则
 * @returns {Function} 中间件函数
 */
const validateQuery = (schema) => {
    return (req, res, next) => {
        try {
            const { error, value } = schema.validate(req.query);

            if (error) {
                const errors = error.details.map(detail => ({
                    field: detail.path.join('.'),
                    message: detail.message,
                    value: detail.context?.value
                }));
                throw new ValidationException('查询参数验证失败', errors);
            }

            // 将验证后的值赋值给查询参数
            req.query = value;
            next();
        } catch (err) {
            next(err);
        }
    };
};

/**
 * 验证路径参数
 * @param {Object} schema - 验证规则
 * @returns {Function} 中间件函数
 */
const validateParams = (schema) => {
    return (req, res, next) => {
        try {
            const { error, value } = schema.validate(req.params);

            if (error) {
                const errors = error.details.map(detail => ({
                    field: detail.path.join('.'),
                    message: detail.message,
                    value: detail.context?.value
                }));
                throw new ValidationException('路径参数验证失败', errors);
            }

            // 将验证后的值赋值给路径参数
            req.params = value;
            next();
        } catch (err) {
            next(err);
        }
    };
};

module.exports = {
    validateBody,
    validateQuery,
    validateParams
};