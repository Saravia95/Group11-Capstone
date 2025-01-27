import OwnerLogin from './pages/owner/OwnerLogin';
import { Routes, Route } from 'react-router';
import Main from './pages/Main';
import Search from './pages/Search';
import OwnerRegister from './pages/owner/OwnerRegister';
import OwnerSettings from './pages/owner/OwnerSettings';
import OwnerQRCode from './pages/owner/OwnerQRCode';
import OwnerSubscription from './pages/owner/OwnerSubscription';
import OwnerPreferences from './pages/owner/OwnerPreferences';
import OwnerChangePassword from './pages/owner/OwnerChangePassword';
import OwnerRegisterConfirmation from './pages/owner/OwnerRegisterConfirmation';
import ProtectedRoute from './components/ProtectedRoute';
import { Header } from './components/Header';

const customerRoutes = [
  { path: '/listener-main', page: <Main /> },
  { path: '/search', page: <Search /> },
];

const ownerPublicRoutes = [
  { path: '/owner-login', page: <OwnerLogin /> },
  { path: '/owner-register', page: <OwnerRegister /> },
];

const ownerPrivateRoutes = [
  { path: '/owner-main', page: <Main /> },
  { path: '/owner-register-confirmation', page: <OwnerRegisterConfirmation /> },
  { path: '/owner-settings', page: <OwnerSettings /> },
  { path: '/owner-change-password', page: <OwnerChangePassword /> },
  { path: '/owner-subscription', page: <OwnerSubscription /> },
  { path: '/owner-preferences', page: <OwnerPreferences /> },
  { path: '/owner-qr-code', page: <OwnerQRCode /> },
];

function App() {
  return (
    <>
      <Header />
      <Routes>
        {/* Owner's public routes */}
        {ownerPublicRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.page} />
        ))}
        {/* Owner's protected route */}
        <Route element={<ProtectedRoute />}>
          {ownerPrivateRoutes.map((route) => (
            <Route key={route.path} path={route.path} element={route.page} />
          ))}
        </Route>
        {/* Customer's routes */}
        {customerRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.page} />
        ))}
        {/* Redirect to /login as a default */}
        <Route path="*" element={<OwnerLogin />} />
      </Routes>
    </>
  );
}

export default App;
