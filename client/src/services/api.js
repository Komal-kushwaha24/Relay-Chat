import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

export const registerUser = (data) =>
  api.post('/auth/register', data);

export const loginUser = (data) =>
  api.post('/auth/login', data);

export const getCurrentUser = () =>
  api.get('/auth/me');

export const logCurrentUser = async () => {
  try {
    const response = await getCurrentUser();
    console.log(response.data);
  } catch (error) {
    console.error(error.response?.data ?? error.message);
  }
};
