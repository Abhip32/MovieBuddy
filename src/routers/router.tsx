import { createBrowserRouter, RouteObject } from 'react-router-dom';
import App from '../App';
import { lazy, Suspense } from 'react';
import Loader from '../components/Loader/Loader';
import ProtectedRoute from './ProtectedRoute';

const ListMovie = lazy(() => import('../pages/ListMovie/ListMovie'));
const Home = lazy(() => import('../pages/Home/Home'));
const Detail = lazy(() => import('../pages/Detail/Detail'));
const Search = lazy(() => import('../pages/Search/Search'));
const Error404Page = lazy(() => import('../pages/Error/Error404Page'));
const Streaming = lazy(() => import('../pages/Streaming/Streaming'));
const SignIn = lazy(() => import('../pages/SignIn/SignIn'));
const Profile = lazy(() => import('../pages/Profile/Profile'));

const routeObj: RouteObject[] = [
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<Loader />}>
            <Home />
          </Suspense>
        ),
      },
      {
        path: '/movies/:name/:id',
        element: (
          <Suspense fallback={<Loader />}>
            <Detail mediaType="movie" />
          </Suspense>
        ),
      },
      {
        path: '/tv-series/:name/:id',
        element: (
          <Suspense fallback={<Loader />}>
            <Detail mediaType="tv" />
          </Suspense>
        ),
      },
      {
        path: '/movies',
        element: (
          <Suspense fallback={<Loader />}>
            <ListMovie media_type="movie" key="movie" />
          </Suspense>
        ),
      },
      {
        path: '/tv-series',
        element: (
          <Suspense fallback={<Loader />}>
            <ListMovie media_type="tv" key="tv-series" />
          </Suspense>
        ),
      },
      {
        path: '/search',
        element: (
          <Suspense fallback={<Loader />}>
            <Search />
          </Suspense>
        ),
      },
      {
        path: '/stream/:type/:id',
        element: (
          <Suspense fallback={<Loader />}>
            <Streaming />
          </Suspense>
        ),
      },
      {
        path: '/tv-series/:name/:id/streaming/:type/:season/:episode',
        element: (
          <Suspense fallback={<Loader />}>
            <Streaming />
          </Suspense>
        ),
      },
      {
        path: '/movies/:name/:id/streaming/:type',
        element: (
          <Suspense fallback={<Loader />}>
            <Streaming />
          </Suspense>
        ),
      },
      {
        path: '/signin',
        element: (
          <Suspense fallback={<Loader />}>
            <SignIn />
          </Suspense>
        ),
      },
      {
        path: '/profile',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<Loader />}>
              <Profile />
            </Suspense>
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: '/notfound',
    element: (
      <Suspense fallback={<Loader />}>
        <Error404Page />
      </Suspense>
    ),
  },
  {
    path: '*',
    element: (
      <Suspense fallback={<Loader />}>
        <Error404Page />
      </Suspense>
    ),
  },
];

const routers = createBrowserRouter(routeObj);

export default routers;
