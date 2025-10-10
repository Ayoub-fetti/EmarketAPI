const validate = (schema) => async (req, res, next) => {
    try {
        await schema.validate({
            body: req.body,
            query: req.query,
            params: req.params
        });
        next();
    } catch (error) {
        return res.status(400).json({
            error: 'Validation failed',
            details: error.errors
        });
    }
};

module.exports = validate;
