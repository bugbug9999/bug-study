import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useStore from '../store/useStore';

export default function AuthCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { setUser } = useStore();

  useEffect(() => {
    const token = params.get('token');
    if (token) {
      localStorage.setItem('lair_token', token);
      fetch('/auth/verify', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((user) => {
          setUser(user);
          navigate('/');
        })
        .catch(() => navigate('/login'));
    } else {
      navigate('/login');
    }
  }, [params, navigate, setUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-lair-bg">
      <div className="text-lair-muted text-lg">로그인 처리 중...</div>
    </div>
  );
}
