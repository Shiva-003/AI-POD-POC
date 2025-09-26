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
	setIsLoggedIn: (value: boolean) => void;
	userData: IUserData | undefined;
	setUserData: (value: any) => void;
	getUserData: () => void;
}

export const AppContext = createContext<AppContextType>({
	backendUrl: '',
	isLoggedIn: false,
	setIsLoggedIn: () => {},
	userData: undefined,
	setUserData: () => {},
	getUserData: () => {}
});

export const AppContextProvider = ({ children }: any) => {
	// To send the cookies with API request
	axios.defaults.withCredentials = true
	
	const backendUrl = import.meta.env.VITE_BACKEND_URL;
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [userData, setUserData] = useState(undefined);

	const getAuthState = async () => {
		try{
			const {data} = await axios.get(backendUrl + '/api/auth/is-authenticated');
			if(data.status === 200){
				setIsLoggedIn(true)
				getUserData();
			}
		}catch(error: any){
			console.log(error.message);
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
		setIsLoggedIn,
		userData,
		setUserData,
		getUserData
	};

	useEffect(()=>{
		getAuthState();
	}, [])

	return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
