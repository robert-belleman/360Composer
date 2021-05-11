import React from "react";
import { useDispatch } from 'react-redux';

import { logIn } from '../actions/tokenActions'

import './LoginForm.scss';


const LoginForm: React.FC = () => {
  const dispatch = useDispatch()

  const handleSubmit = ((event: any) => {
    let username = event.target.username.value;
    let password = event.target.password.value;

    dispatch(logIn(username, password));

    event.preventDefault();
  });

  return (
      <div className="form">
        <form className="login-form" onSubmit={handleSubmit}>
          <input type="text" placeholder="username" id="username"/>
          <input type="password" placeholder="password" id="password"/>
          <input className="submitButton" type="submit" value="login"/>
          <p className="message">Not registered? <a href="/">Create an account</a></p>
        </form>
    </div>
  );
}

export default LoginForm;

