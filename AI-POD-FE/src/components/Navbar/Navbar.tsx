import { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const Navbar = () => {
	const { backendUrl, isLoggedIn, userData, setIsLoggedIn, setUserData } =
		useContext(AppContext);
	const navigate = useNavigate();

	const logout = async () => {
		axios.defaults.withCredentials = true;
		try {
			const { data } = await axios.post(backendUrl + '/api/auth/logout');
			if (data.status === 200) {
				toast.success(data.message);
				setIsLoggedIn(false);
				setUserData(false);
				navigate('/');
			} else {
				toast.error(data.message);
			}
		} catch (error: any) {
			toast.error(error.message);
		}
	};

	return (
		<div className="container mx-auto px-4 sm:px-6 lg:px-8 w-full">
			<div className="flex h-16 items-center justify-between">
				<NavLink
					className="text-2xl font-semibold"
					to="/"
				>
					MediBuddy
				</NavLink>

				{isLoggedIn && (
					<div className="w-8 h-8 cursor-pointer bg-gray-200 font-bold rounded-full flex justify-center items-center relative group">
						{userData?.name[0].toUpperCase()}

						<div className="w-35 absolute hidden cursor-pointer pt-2 top-7 right-0 z-10 group-hover:block">
							<ul className="list-none m-0 bg-gray-100 text-sm">
								<li
									onClick={logout}
									className="px-2 py-3 cursor-pointer hover:bg-gray-200 font-normal"
								>
									Logout
								</li>
							</ul>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default Navbar;
