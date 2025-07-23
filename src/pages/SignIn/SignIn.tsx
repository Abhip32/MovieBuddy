import React from 'react';
import { useAuth } from '../../context/AuthContext/AuthContext';
import { GoogleLogin } from 'react-google-login';
import { useNavigate } from 'react-router-dom';

const SignIn = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const responseGoogle = async (response: any) => {
    const { profileObj } = response;
    const user = {
      name: profileObj.name,
      email: profileObj.email,
      avatar: profileObj.imageUrl,
    };
    await login(user);
    navigate('/');
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <GoogleLogin
        clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID || ''}
        buttonText="Login with Google"
        onSuccess={responseGoogle}
        onFailure={responseGoogle}
        cookiePolicy={'single_host_origin'}
      />
    </div>
  );
};

export default SignIn;
