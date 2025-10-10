const yup = require('yup');

const mongoIdSchema = yup.object({
    params: yup.object({
        id: yup.string().required().matches(/^[0-9a-fA-F]{24}$/, 'Invalid ID format')
    })
});

module.exports = {
    mongoIdSchema
};
