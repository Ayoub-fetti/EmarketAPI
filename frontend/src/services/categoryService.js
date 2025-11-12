import api from './axios';

export const categoryService = {
    getCategories: async  () => {
        const response = await api.get('/categories');
        return response.data;
    }
}