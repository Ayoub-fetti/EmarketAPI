const yup = require('yup');

const createProductSchema = yup.object({
    body: yup.object({
        title: yup.string().required().trim().min(2).max(100),
        description: yup.string().required().min(10).max(500),
        price: yup.number().required().positive(),
        stock: yup.number().required().integer().min(0),
        category: yup.string().required().matches(/^[0-9a-fA-F]{24}$/, 'Invalid category ID'),
        imageUrl: yup.string().required().url()
    })
});

const updateProductSchema = yup.object({
    body: yup.object({
        title: yup.string().trim().min(2).max(100),
        description: yup.string().min(10).max(500),
        price: yup.number().positive(),
        stock: yup.number().integer().min(0),
        category: yup.string().matches(/^[0-9a-fA-F]{24}$/, 'Invalid category ID'),
        imageUrl: yup.string().url()
    })
});

const searchProductSchema = yup.object({
    query: yup.object({
        title: yup.string(),
        category: yup.string().matches(/^[0-9a-fA-F]{24}$/, 'Invalid category ID'),
        minPrice: yup.number().positive(),
        maxPrice: yup.number().positive(),
        inStock: yup.string().oneOf(['true', 'false'])
    })
});

module.exports = {
    createProductSchema,
    updateProductSchema,
    searchProductSchema
};
