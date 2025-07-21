import {
  createBrowserRouter,
  RouterProvider
} from 'react-router-dom';
import { AwaitAuthentication, ProtectedRoute, RedirectWhenAuthenticated } from '../authentication/routes';
import RootLayout from '../components/layout/RootLayout';
import ErrorPage from '../routes/ErrorPage';
import FocusedPost, { postLoader } from './FocusedPost';
import Home from './Home';
import { mainFeedTabs } from './Home/PostTabs';
import Login from './Login';
import Profile, { userLoader } from './Profile';
import { userActivityTabs } from './Profile/UserActivityTabs';
import Search from './Search';
import { searchTabs } from './Search/SearchPage';
import Trends from './Trends';
import { trendTabs } from './Trends/TrendsPage';
import FollowsOfUser from './FollowersOfUser';
import MainLayout, { MainLayoutError } from '../components/layout/mainLayout/MainLayout';
import WhoToFollowPage from './WhoToFollow';
import { notificationTabs } from './Notifications/NotificationsPage';
import Notifications from './Notifications';

// Disable the scroll restoration because it causes scroll jumping on the inifnite lists those have manual scroll restoration
window.history.scrollRestoration = 'manual'

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <RedirectWhenAuthenticated to="/home"><Login /></RedirectWhenAuthenticated>,
      },
      {
        path: "/",
        element: <AwaitAuthentication><MainLayout /></AwaitAuthentication>,
        children: [
          {
            path: "/home",
            element: <ProtectedRoute><Home /></ProtectedRoute>,
            children: mainFeedTabs.map(route => ({
              path: route.path,
              element: route.element,
              index: route.path === '',
            }))
          },
          {
            path: "/users/:userHandle/followers",
            element: <ProtectedRoute><FollowsOfUser type={"followers"} /></ProtectedRoute>,
          },
          {
            path: "/users/:userHandle/followed",
            element: <ProtectedRoute><FollowsOfUser type={"followed"} /></ProtectedRoute>,
          },
          {
            path: "/users/:user/status/:post",
            element: <FocusedPost />,
            errorElement: <MainLayoutError title={"Error while loading post"}/>,
            loader: postLoader,
          },
          {
            path: "/users/:id",
            element: <Profile />,
            loader: userLoader,
            errorElement: <MainLayoutError title={"Error while loading user"}/>,
            children: userActivityTabs.map(route => ({
              path: route.path,
              element: route.element,
              index: route.path === '',
            }))
          },
          {
            path: "/search",
            element: <ProtectedRoute><Search /></ProtectedRoute>,
            children: searchTabs.map(route => ({
              path: route.path,
              element: route.element,
              index: route.path === '',
            }))
          },
          {
            path: "/trends",
            element: <ProtectedRoute><Trends /></ProtectedRoute>,
            children: trendTabs.map(route => ({
              path: route.path,
              element: route.element,
              index: route.path === '',
            }))
          },
          {
            path: "/whoToFollow",
            element: <ProtectedRoute><WhoToFollowPage /></ProtectedRoute>,
          },
          {
            path: "/notifications",
            element: <ProtectedRoute><Notifications /></ProtectedRoute>,
            children: notificationTabs.map(route => ({
              path: route.path,
              element: route.element,
              index: route.path === '',
            }))
          }
        ]
      },
      {
        path: "*",
        element: <>not found</>
      }
    ],
  },
]);

export default function Router() {
  return <RouterProvider router={router} />;
}