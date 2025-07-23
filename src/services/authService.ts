import { axiosInstance } from './axiosInstance';

const googleLogin = async (user: { name: string; email: string; avatar: string }) => {
  const { data } = await axiosInstance.post('/api/auth/google', user);
  return data;
};

const authService = {
  googleLogin,
};

export default authService;
