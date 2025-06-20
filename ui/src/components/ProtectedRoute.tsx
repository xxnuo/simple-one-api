import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { isLoggedIn } from '../lib/api';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  if (!isLoggedIn()) {
    return null;
  }

  return <>{children}</>;
} 