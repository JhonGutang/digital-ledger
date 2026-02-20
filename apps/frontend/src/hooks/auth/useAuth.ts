import { useMutation } from '@tanstack/react-query';
import type { LoginDto, RegisterDto } from '../../services/auth/authService';
import { login, register } from '../../services/auth/authService';
import { useAuthContext } from '../../context/AuthContext';

export const useLogin = () => {
  const { setAuthData } = useAuthContext();

  return useMutation({
    mutationFn: (data: LoginDto) => login(data),
    onSuccess: (data) => {
      setAuthData(data);
    },
  });
};

export const useRegister = () => {
  const { token } = useAuthContext();
  
  return useMutation({
    mutationFn: (data: RegisterDto) => {
      if (!token) throw new Error('Not authenticated');
      return register(data, token);
    }
  });
};
