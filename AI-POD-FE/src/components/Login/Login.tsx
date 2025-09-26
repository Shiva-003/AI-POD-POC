import axios from 'axios';
import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { toast } from 'react-toastify';

const Login = () => {
	const navigate = useNavigate();
	const { backendUrl, setIsLoggedIn, setUserData } = useContext(AppContext);
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');

	const onSubmitHandler = async (event: any) => {
		event.preventDefault();

		axios.defaults.withCredentials = true;
		try {
			const { data }: any = await axios.post(backendUrl + '/api/auth/login', {
				email,
				password,
			});

			if (data.status === 200) {
				setIsLoggedIn(true);
				setUserData(data.data);
				navigate('/dashboard');
			} else {
				toast.error(data.message);
			}
		} catch (error: any) {
			toast.error(error.message);
		}
	};

	return (
		<div className="max-w-md bg-card-light/50 backdrop-blur-md rounded-xl p-8 shadow-2xl shadow-slate-900/10">
			<h1 className="text-3xl font-bold text-center mb-3">Get Started</h1>
			<p className="text-muted-light text-center text-sm mb-5">
				Sign in or create an account to access your AI diagnostic dashboard.
			</p>

			<form onSubmit={e => onSubmitHandler(e)}>
				<input
					className="block w-full rounded-lg border-gray-300 bg-card-light py-3 px-4 text-foreground-light placeholder:text-muted-light outline-none focus:border-1 mb-4"
					type="email"
					placeholder="Email address"
					value={email}
					onChange={e => setEmail(e.target.value)}
					required
				/>
				<input
					className="block w-full rounded-lg border-gray-300 bg-card-light py-3 px-4 text-foreground-light placeholder:text-muted-light outline-none focus:border-1 mb-4"
					type="password"
					placeholder="Password"
					value={password}
					onChange={e => setPassword(e.target.value)}
					required
				/>

				<div className="text-right text-sm mb-6">
					<Link
						className="font-medium text-primary hover:text-primary-hover"
						to="#"
					>
						Forgot password?
					</Link>
				</div>

				<button
					className="flex w-full justify-center rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-hover cursor-pointer mb-8"
					type="submit"
				>
					Log in
				</button>

				<p className="text-center text-sm text-muted-light">
					New to MediBuddy?
					<Link
						className="font-semibold leading-6 px-1 text-primary hover:text-primary-hover"
						to="/sign-up"
					>
						Sign up now
					</Link>
				</p>
			</form>
		</div>
	);
};

export default Login;
