import { useContext, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import OtpInput from "../../components/OtpInput/OtpInput";
import { MdMarkEmailRead } from "react-icons/md";
import axios from "axios";
import { toast } from "react-toastify";

const EmailVerifyPage = () => {
    const { backendUrl, getUserData } = useContext(AppContext);
	const navigate = useNavigate();

	const inputRefs = useRef<any>([]);

    const [otp, setOtp] = useState('');

    const submitHandler = async (event: any) => {
        event.preventDefault();
        axios.defaults.withCredentials = true;
		try {
			const { data } = await axios.post(
				backendUrl + '/api/auth/verify-email',
				{ otp }
			);

			if (data.status === 200) {
				toast.success(data.message);
                await getUserData();
				navigate('/dashboard');
			} else {
				toast.error(data.message);
			}
		} catch (error: any) {
			toast.error(error.message);
		}
	};

    return (
        <div className="h-full flex justify-center items-center">
            <div className="bg-card-light/10 backdrop-blur-md rounded-xl p-10 shadow-2xl shadow-slate-900/10">
                <div className="flex justify-center items-center mb-6">
                    <MdMarkEmailRead color="#4f46e5" size={52}/> 
                </div>
                <h1 className="text-3xl font-bold text-center mb-3">
                    Verify your email
                </h1>
                <p className="text-muted-light text-center text-sm mb-8">
                    Please enter the 6 digit code sent to your mail.
                </p>

                <form onSubmit={e => submitHandler(e)}>

                    <OtpInput inputRefs={inputRefs} onChangeOtp={(otp: string) => setOtp(otp)}/>
                    
                    <button
                        className="flex w-full justify-center rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-hover cursor-pointer mb-6"
                        type="submit"
                    >
                        Verify
                    </button>

                    <p className="text-center text-sm text-muted-light">
                        Didn't receive the code?
                        <Link
                            className="font-semibold leading-6 px-1 text-primary hover:text-primary-hover"
                            to="#"
                        >
                            Resend
                        </Link>
                    </p>               
                </form>
            </div>
        </div>
    );
};

export default EmailVerifyPage;