import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom';

import Home from './pages/Home.tsx';
import ErrorPage from './pages/ErrorPage.tsx';
import Login from './pages/Login.tsx';
import SearchPage from './pages/Search.tsx';
import Attendance from './pages/Attendance.tsx';
import ChangeWijk from './pages/ChangeWijk.tsx';
import ScanTicket from './pages/ScanTicket.tsx';
import HutjesManagement from './pages/HutjesManagement.tsx';
import Statistics from './pages/Statistics.tsx';
import Birthdays from './pages/Birthdays.tsx';
import Map from './pages/Map.tsx';
import PhotosAndAttachments from './pages/PhotosAndAttachments.tsx';
import Settings from './pages/Settings.tsx';
import Wristband from './pages/Wristband.tsx';
import './scss/styles.scss';
import initParse from './utils/initParse.ts';
import ForgotPassword from './pages/ForgotPassword.tsx';
import NewPassword from './pages/NewPassword.tsx';
import IsNoAdmin from './pages/IsNoAdmin.tsx';
import Register from './pages/Register.tsx';
import EmailNotConfirmed from './pages/EmailNotConfirmed.tsx';
import VerifyEmail from './pages/VerifyEmaii.tsx';
import EditTicket from './pages/EditTicket.tsx';
import ViewTicket from './pages/ViewTicket.tsx';

initParse();

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/zoek',
    element: <SearchPage />,
  },
  {
    path: '/aanwezigheid',
    element: <Attendance />,
  },
  {
    path: '/scan',
    element: <ScanTicket />,
  },
  {
    path: '/hutjes',
    element: <HutjesManagement />,
  },
  {
    path: '/statistieken',
    element: <Statistics />,
  },
  {
    path: '/verjaardagen',
    element: <Birthdays />,
  },
  {
    path: '/kaart',
    element: <Map />,
  },
  {
    path: '/fotos',
    element: <PhotosAndAttachments />,
  },
  {
    path: '/instellingen',
    element: <Settings />,
  },
  {
    path: '/polsbandje',
    element: <Wristband />,
  },
  {
	path: '/wijzig-wijk',
	element: <ChangeWijk />,
  },
  {
	path: '/wachtwoord-vergeten',
	element: <ForgotPassword />,
  },
  {
	path: '/new-password',
	element: <NewPassword />,
  },
  {
	path: '/is-geen-beheerder',
	element: <IsNoAdmin />,
  },
  {
	path: '/registreren',
	element: <Register />,
  },
  {
	path: '/email-niet-bevestigd',
	element: <EmailNotConfirmed />,
  },
  {
	path: '/verify-email',
	element: <VerifyEmail />,
  },
  {
	path: '/bewerk-ticket',
	element: <EditTicket />,
  },
  {
	path: '/bekijk-ticket',
	element: <ViewTicket />,
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);