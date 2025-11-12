import api from './axios';
export const createOrder = async (coupons = []) => {
    const response = await api.post('/orders', {coupons});
    return response.data;
}