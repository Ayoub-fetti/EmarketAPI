const yup = require('yup');

const createUserSchema = yup.object({
    body: yup.object({
        fullName: yup.string().required().trim().min(2).max(50),
        email: yup.string().required().email().lowercase(),
        password: yup.string().required().min(6),
        role: yup.string().oneOf(['user', 'admin']).default('user')
    })
});

const updateUserSchema = yup.object({
    body: yup.object({
        fullName: yup.string().trim().min(2).max(50),
        email: yup.string().email().lowercase(),
        password: yup.string().min(6),
        role: yup.string().oneOf(['user', 'admin'])
    })
});

module.exports = {
    createUserSchema,
    updateUserSchema
};
