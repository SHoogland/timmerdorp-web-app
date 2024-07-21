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
  "knDC2JAquVJZ1jSPwARj53IhQCfpOPIDNKcgRMsD",
  "xnFIbFCrE1vjzWbRVehMO4QzPpNMCIdDgORKNlRI"
);
Parse.serverURL = 'https://api.timmerdorp.com/1'

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
