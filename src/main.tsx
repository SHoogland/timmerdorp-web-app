import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom';
import Parse from 'parse';

import Root from './pages/Root.tsx';
import ErrorPage from './pages/ErrorPage.tsx';
import Home from './pages/Home.tsx';
import './scss/styles.scss'

Parse.initialize(
  "YOUR_APP_ID",
  "YOUR_JAVASCRIPT_KEY"
);
Parse.serverURL = 'http://YOUR_PARSE_SERVER:1337/parse'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    errorElement: <ErrorPage />,
  },
  {
    path: "home",
    element: <Home />,
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
