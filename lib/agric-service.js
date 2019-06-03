require('dotenv').config();
const axios = require('axios');

const api = axios.create({
    baseURL: 'http://127.0.0.1:5000',
    timeout: process.env.TIMEOUT || 5000,
});

const get = async (url) => {
    const response = await api.get(url);
    const {data} = response;
    if (response.status === 200) {
        return data;
    }
    throw new Error(data.error.type);
};

module.exports = {
    getAgricultureData: () => get(`/`),
};
