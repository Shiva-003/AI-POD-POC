import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import SkinExamination from './components/SkinExamination/SkinExamination.tsx';
import Home from './pages/HomePage/HomePage.tsx';
import EyeExamination from './components/EyeExamination/EyeExamination.tsx';
import WoundExamination from './components/WoundExamination/WoundExamination.tsx';
import LandingPage from './pages/LandingPage/LandingPage.tsx';
import SignUpPage from './pages/SignUpPage/SignUpPage.tsx';
import { AppContextProvider } from './context/AppContext.tsx';
import EmailVerifyPage from './pages/EmailVerifyPage/EmailVerifyPage.tsx';
import RouteGaurd from './gaurds/RouteGaurd.tsx';
import PublicRouteGaurd from './gaurds/PublicRouteGaurd.tsx';

const router = createBrowserRouter([
	{
		path: '/',
		element: <App />, // App can include an <Outlet />
		children: [
			{
				element: <PublicRouteGaurd />,
				children: [
					{ index: true, element: <LandingPage /> },
					{ path: 'sign-up', element: <SignUpPage /> },
				],
			},
			{
				element: <RouteGaurd />,
				children: [
					{ path: 'verify-email', element: <EmailVerifyPage /> },
					{ path: 'dashboard', element: <Home /> },
					{ path: 'skin-examination', element: <SkinExamination /> },
					{ path: 'eye-examination', element: <EyeExamination /> },
					{ path: 'wound-examination', element: <WoundExamination /> },
				],
			},
		],
	},
]);

createRoot(document.getElementById('root')!).render(
	<AppContextProvider>
		<RouterProvider router={router} />
	</AppContextProvider>
);
