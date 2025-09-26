import type { RefObject } from "react";

interface OtpProps {
	inputRefs: RefObject<HTMLInputElement[]>;
	onChangeOtp: (otp: string) => void;
}

const OtpInput = ({inputRefs, onChangeOtp}: OtpProps) => {
	const handleInput = (e: any, index: number) => {
		const value = e.target.value;

		if (value.length > 0 && index < inputRefs.current.length - 1) {
		inputRefs.current[index + 1].focus();
		}

		sendOtpToParent();
	};

	const handleKeyDown = (e: any, index: number) => {
		if (e.key === 'Backspace' && e.target.value === '' && index > 0) {
		inputRefs.current[index - 1].focus();
		}
	};

	const handleOtpPaste = (e: any) => {
		const otp = e.clipboardData.getData('text');
		const otpArray = otp.split('');

		otpArray.forEach((char: string, index: number) => {
		if (inputRefs.current[index]) {
			inputRefs.current[index].value = char;
		}
		});

		sendOtpToParent();
	};

	const sendOtpToParent = () => {
		const otp = inputRefs.current.map((input) => input?.value || '').join('');
		onChangeOtp(otp);
	};


	return (
		<div
			className="flex justify-between mb-10"
			onPaste={(e) => handleOtpPaste(e)}
		>
			{Array(6)
				.fill(0)
				.map((_, index) => (
					<input
						className="w-12 h-12 bg-gray-200 text-center text-xl rounded-md"
						type="text"
						ref={(e: any) => (inputRefs.current[index] = e)}
						maxLength={1}
						key={index}
						onInput={(e) => handleInput(e, index)}
						onKeyDown={(e) => handleKeyDown(e, index)}
						required
					/>
				))}
		</div>
	);
};

export default OtpInput;
