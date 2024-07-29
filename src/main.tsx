import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom';

import Home from './pages/Home.tsx';
import ErrorPage from './pages/ErrorPage.tsx';
import Login from './pages/Login.tsx';
import SearchPage from './pages/SearchPage.tsx';
import Attendance from './pages/Attendance.tsx';
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

initParse();

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
    errorElement: <ErrorPage />,
  },
  {
    path: 'login',
    element: <Login />,
  },
  {
    path: 'zoek',
    element: <SearchPage />,
  },
  {
    path: 'aanwezigheid',
    element: <Attendance />,
  },
  {
    path: 'scan',
    element: <ScanTicket />,
  },
  {
    path: 'hutjes',
    element: <HutjesManagement />,
  },
  {
    path: 'statistieken',
    element: <Statistics />,
  },
  {
    path: 'verjaardagen',
    element: <Birthdays />,
  },
  {
    path: 'kaart',
    element: <Map />,
  },
  {
    path: 'fotos',
    element: <PhotosAndAttachments />,
  },
  {
    path: 'instellingen',
    element: <Settings />,
  },
  {
	path: '/polsbandje',
	element: <Wristband />,
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);