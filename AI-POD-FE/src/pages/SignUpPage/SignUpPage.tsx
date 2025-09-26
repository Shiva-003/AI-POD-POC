import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const SignUpPage = () => {
	const navigate = useNavigate();

	const { backendUrl, setIsLoggedIn, setUserData } = useContext(AppContext);
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');

	const submitHandler = async (event: any) => {
        event.preventDefault();
		try {
			const { data }: any = await axios.post(
				backendUrl + '/api/auth/register',
				{
					name,
					email,
					password,
				}
			);

			if (data.status === 201) {
				axios.defaults.withCredentials = true;
				const {data: otpResponse} : any = await axios.post(backendUrl + '/api/auth/send-verification-otp');
				if (otpResponse.status === 200){
					setIsLoggedIn(true);
					setUserData(data.data);
					toast.success(otpResponse.message);
					navigate('/verify-email');
				}else{
					toast.error(otpResponse.message);
				}
			} else {
				toast.error(data.message);
			}
		} catch (error: any) {
			toast.error(error.message);
		}
	};

	return (
		<div className="h-full">
			<div className="h-full flex justify-center items-center">
				<div className="w-96 bg-card-light/50 backdrop-blur-md rounded-xl p-8 shadow-2xl shadow-slate-900/10">
					<h1 className="text-3xl font-bold text-center mb-3">
						Create Account
					</h1>
					<h2 className="text-muted-light text-center text-sm mb-5">
						Join to diagnose your diseases.
					</h2>

					<form onSubmit={submitHandler}>
						<input
							onChange={(e) => setName(e.target.value)}
							value={name}
							className="block w-full rounded-lg border-gray-300 bg-card-light py-3 px-4 text-foreground-light placeholder:text-muted-light outline-none focus:border-1 mb-6"
							type="text"
							placeholder="Full Name"
							required
						/>

						<input
							onChange={(e) => setEmail(e.target.value)}
							value={email}
							className="block w-full rounded-lg border-gray-300 bg-card-light py-3 px-4 text-foreground-light placeholder:text-muted-light outline-none focus:border-1 mb-6"
							type="email"
							placeholder="Email"
							required
						/>

						<input
							onChange={(e) => setPassword(e.target.value)}
							value={password}
							className="block w-full rounded-lg border-gray-300 bg-card-light py-3 px-4 text-foreground-light placeholder:text-muted-light outline-none focus:border-1 mb-6"
							type="password"
							placeholder="Password"
							required
						/>

						<button
							className="flex w-full justify-center rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-hover cursor-pointer mb-6"
							type="submit"
						>
							Create Account
						</button>

						<p className="text-center text-sm text-muted-light">
							Already have an account?
							<Link
								className="font-semibold leading-6 px-1 text-primary hover:text-primary-hover"
								to="/"
							>
								Log in
							</Link>
						</p>
					</form>
				</div>
			</div>
		</div>
	);
};

export default SignUpPage;
