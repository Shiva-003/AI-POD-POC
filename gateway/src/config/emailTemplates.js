export const WELCOME_TEMPLATE = `<html>
<head>
    <title>Email Verification</title>
    <style>
        body {
            height: 100vh;
            margin: 0;
            font-family: Arial, sans-serif;
            background-color: #f9f9f9;
        }

        .center-element {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100%;
        }

        .email-container {
            padding: 30px 40px;
            background-color: #fff;
            max-width: 500px;
            text-align: center;
        }

        h1 {
            margin-top: 0;
            color: #333;
        }

        p {
            color: #555;
            line-height: 1.6;
        }

        .email-highlight {
            font-weight: bold;
            color: #007BFF;
        }
    </style>
</head>
<body>
    <div class="center-element">
        <div class="email-container">
            <h1>Welcome to MediBuddy!</h1>
            <p>Your account has been successfully created.</p>
            <p>Please use the following email address to log in to your account:</p>
            <p class="email-highlight">{{email}}</p>
            <p>If you did not sign up for this account, please ignore this message.</p>
        </div>
    </div>
</body>
</html>`;


export const VERIFY_EMAIL_TEMPLATE = `<html>
<head>
    <title>Email Verification</title>
    <style>
        body {
            height: 100vh;
            margin: 0;
            font-family: Arial, sans-serif;
            background-color: #f9f9f9;
        }

        .center-element {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100%;
        }

        .email-container {
            padding: 30px 40px;
            background-color: #fff;
            max-width: 500px;
            text-align: center;
        }

        h1 {
            margin-top: 0;
            color: #333;
        }

        p, h3 {
            color: #555;
            line-height: 1.6;
        }

        .otp-box {
            display: inline-block;
            background-color: #28a745;
            color: white;
            font-weight: bold;
            font-size: 24px;
            padding: 12px 20px;
            border-radius: 6px;
            margin: 15px 0;
            letter-spacing: 3px;
        }
    </style>
</head>
<body>
    <div class="center-element">
        <div class="email-container">
            <h1>Verify Your Email</h1>
            <p>You’re just one step away from verifying your account associated with the email address:</p>
            <p><strong>{{email}}</strong></p>

            <h3>Use the OTP below to verify your account:</h3>

            <div class="otp-box">
                {{otp}}
            </div>

            <p>This OTP is valid for 5 minutes.</p>
        </div>
    </div>
</body>
</html>
`;


export const PASSWORD_RESET_TEMPLATE = `<html>
<head>
    <title>Password Reset Request</title>
    <style>
        body {
            height: 100vh;
            margin: 0;
            font-family: Arial, sans-serif;
            background-color: #f9f9f9;
        }

        .center-element {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100%;
        }

        .email-container {
            padding: 30px 40px;
            background-color: #fff;
            max-width: 500px;
            text-align: center;
        }

        h1 {
            margin-top: 0;
            color: #333;
        }

        p, h3 {
            color: #555;
            line-height: 1.6;
        }

        .otp-box {
            display: inline-block;
            background-color: #28a745;
            color: white;
            font-weight: bold;
            font-size: 24px;
            padding: 12px 20px;
            border-radius: 6px;
            margin: 15px 0;
            letter-spacing: 3px;
        }
    </style>
</head>
<body>
    <div class="center-element">
        <div class="email-container">
            <h1>Forgot Your Password?</h1>
            <p>We received a request to reset the password for your account:</p>
            <p><strong>{{email}}</strong></p>

            <h3>Use the OTP below to reset your password:</h3>

            <div class="otp-box">
                {{otp}}
            </div>

            <p>This OTP is valid for the next 5 minutes. If you did not request a password reset, please ignore this email.</p>
        </div>
    </div>
</body>
</html>
`;