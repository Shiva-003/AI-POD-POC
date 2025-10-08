// src/pages/ForgotPassword.tsx
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
	return (
		<div className="flex items-center justify-center min-h-screen bg-background">
			<div className="max-w-md w-full bg-card-light/50 backdrop-blur-md rounded-xl p-8 shadow-2xl shadow-slate-900/10">
				<h1 className="text-3xl font-bold text-center mb-3">Forgot Password</h1>
				<p className="text-muted-light text-center text-sm mb-5">
					Enter your registered email address, and we’ll send you a link to reset your password.
				</p>

				<form onSubmit={(e) => e.preventDefault()}>
					<input
						className="block w-full rounded-lg border-gray-300 bg-card-light py-3 px-4 text-foreground-light placeholder:text-muted-light outline-none focus:border-1 mb-6"
						type="email"
						placeholder="Email address"
						required
					/>

					<button
						className="flex w-full justify-center rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-hover cursor-pointer mb-6"
						type="submit"
					>
						Send Reset Link
					</button>

					<p className="text-center text-sm text-muted-light">
						Remembered your password?
						<Link
							to="/"
							className="font-semibold leading-6 px-1 text-primary hover:text-primary-hover"
						>
							Log in
						</Link>
					</p>
				</form>
			</div>
		</div>
	);
};

export default ForgotPassword;
