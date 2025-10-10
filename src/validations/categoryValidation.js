const yup = require('yup');

const createCategorySchema = yup.object({
    body: yup.object({
        title: yup.string().required().trim().min(2).max(50),
        description: yup.string().trim().max(200)
    })
});

const updateCategorySchema = yup.object({
    body: yup.object({
        title: yup.string().trim().min(2).max(50),
        description: yup.string().trim().max(200)
    })
});

module.exports = {
    createCategorySchema,
    updateCategorySchema
};
