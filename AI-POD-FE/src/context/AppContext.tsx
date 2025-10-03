import axios from 'axios';
import { createContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';

interface IUserData{
	name: string;
	isVerified: boolean;
}

interface AppContextType {
	backendUrl: string;
	isLoggedIn: boolean;
	isAuthResolved: boolean;
	userData: IUserData | undefined;
	setIsLoggedIn: (value: boolean) => void;
	setUserData: (value: any) => void;
	getUserData: () => void;
}

export const AppContext = createContext<AppContextType>({
	backendUrl: '',
	isLoggedIn: false,
	isAuthResolved: false,
	userData: undefined,
	setIsLoggedIn: () => {},
	setUserData: () => {},
	getUserData: () => {}
});

export const AppContextProvider = ({ children }: any) => {
	// To send the cookies with API request
	axios.defaults.withCredentials = true
	
	const backendUrl = import.meta.env.VITE_BACKEND_URL;
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [userData, setUserData] = useState(undefined);
	const [isAuthResolved, setIsAuthResolved] = useState(false);

	const getAuthState = async () => {
		try{
			const {data} = await axios.get(backendUrl + '/api/auth/is-authenticated');
			if(data.status === 200){
				setIsLoggedIn(true)
				await getUserData();
			}
		}catch(error: any){
			console.log(error.message);
		}finally{
			setIsAuthResolved(true);
		}
	}

	const getUserData = async () => {
		try{
			const {data} = await axios.get(backendUrl + '/api/user/getUserData');
			data.status === 200 ? setUserData(data.data) : toast.error(data.message);
		}catch(error: any){
			toast.error(error.message);
		}
	}

	const value = {
		backendUrl,
		isLoggedIn,
		userData,
		isAuthResolved,
		setIsLoggedIn,
		setUserData,
		getUserData
	};

	useEffect(()=>{
		getAuthState();
	}, [])

	return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
