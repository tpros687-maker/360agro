import axios from './axiosConfig';

export const getExpenses = async () => {
    return await axios.get('/expenses');
};

export const createExpense = async (data) => {
    return await axios.post('/expenses', data);
};

export const deleteExpense = async (id) => {
    return await axios.delete(`/expenses/${id}`);
};
