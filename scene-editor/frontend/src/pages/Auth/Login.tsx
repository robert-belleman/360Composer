import React from "react";
import LoginForm from "../../components/AuthComponents/LoginForm";
import "./Login.scss";

import { useSelector } from 'react-redux';

import CircularProgress from '@material-ui/core/CircularProgress';


const Login: React.FC = () => {
    const token = useSelector((state:any) => state.token)

    const form = () => (
        <div className="login-page">
            <LoginForm />
        </div>
    );

    return token.loading ? <CircularProgress /> : form();
};

export default Login;
