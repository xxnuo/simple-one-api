import { createBrowserRouter } from 'react-router-dom';
import App from '../App';
import LoginPage from '../pages/LoginPage';
import ConfigPage from '../pages/ConfigPage';
import HomePage from '../pages/HomePage';
import ProtectedRoute from '../components/ProtectedRoute';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'config',
        element: (
          <ProtectedRoute>
            <ConfigPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);

export default router; 