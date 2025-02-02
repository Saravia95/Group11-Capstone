import Login from './pages/Login';
import { Routes, Route } from 'react-router';
import Main from './pages/Main';
import Search from './pages/Search';
import Register from './pages/Register';
import Settings from './pages/Settings';
import ManageQRCode from './pages/QRCode';
import Subscription from './pages/Subscription';
import Preferences from './pages/Preferences';
import ResetPassword from './pages/ResetPassword';
import RegisterConfirmation from './pages/RegisterConfirmation';
import ProtectedRoute from './components/ProtectedRoute';
import { Header } from './components/Header';
import RequestPasswordChange from './pages/RequestPasswordChange';
import VerifyQRCode from './pages/VerifyQRCode';
import VerifyGoogleOAuth from './pages/VerifyGoogleOAuth';
import ChangePassword from './pages/ChangePassword';

const publicRoutes = [
  { path: '/login', page: <Login /> },
  { path: '/verify-oauth', page: <VerifyGoogleOAuth /> },
  { path: '/register', page: <Register /> },
  { path: '/register-confirmation', page: <RegisterConfirmation /> },
  { path: '/verify-qr/:id', page: <VerifyQRCode /> },
  { path: '/request-password-reset', page: <RequestPasswordChange /> },
  { path: '/reset-password', page: <ResetPassword /> },
];

const privateRoutes = [
  { path: '/main', page: <Main /> },
  { path: '/search', page: <Search /> },
  { path: '/settings', page: <Settings /> },
  { path: '/change-password', page: <ChangePassword /> },
  { path: '/subscription', page: <Subscription /> },
  { path: '/preferences', page: <Preferences /> },
  { path: '/qr-code', page: <ManageQRCode /> },
];

function App() {
  return (
    <>
      <Header />
      <Routes>
        {/* public routes */}
        {publicRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.page} />
        ))}
        {/* private (protected) route */}
        <Route element={<ProtectedRoute />}>
          {privateRoutes.map((route) => (
            <Route key={route.path} path={route.path} element={route.page} />
          ))}
        </Route>
        {/* Redirect to /login as a default */}
        <Route path="*" element={<Login />} />
      </Routes>
    </>
  );
}

export default App;
