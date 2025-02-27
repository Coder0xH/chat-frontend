import { useEffect } from 'react';
import { useRecoilState } from 'recoil';
import store from '~/store';

export default function useAuthRedirect() {
  const [user, setUser] = useRecoilState(store.user);

  useEffect(() => {
    // 设置一个虚拟用户，绕过登录流程
    setUser({
      id: 'guest-user',
      name: 'Guest',
      email: 'guest@example.com',
      username: 'guest',
      role: 'user',
      provider: 'local',
      expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7天后过期
      avatar: null
    });
  }, [setUser]);

  // 始终返回已授权状态
  return {
    isAuthenticated: true,
    user,
    error: null,
    isLoading: false
  };
}
