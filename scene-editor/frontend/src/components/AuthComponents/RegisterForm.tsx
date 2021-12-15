import React, {useState} from "react";
import { Card, 
         CardContent,
         TextField,
         Button, 
         Typography } from '@mui/material';
import { register } from '../../util/api';
import { useNavigate } from 'react-router-dom'

const RegisterForm: React.FC = () => {
  let navigate = useNavigate();
  const [userConflict, setUserConflict] = useState(false)
  const [passwordNoMatch, setPasswordNoMatch] = useState(false)

  const submitRegistration = ((event: any) => {
    let username = event.target.username.value;
    let password = event.target.password.value;
    let passwordConfirm = event.target.passwordConfirm.value;

    setUserConflict(false)

    if(password != passwordConfirm){
      setPasswordNoMatch(true) 
    }
    else{
      register(username, password)
        .then(()=>{
          navigate('/register-done', { replace: true })
        })
        .catch((e) => {
          if(e.response.status == 409){
            setUserConflict(true)
          }        
        });
    }

    event.preventDefault(); 
  });

  return (
        <form onSubmit={submitRegistration}>
          <TextField
            required
            id="username"
            label="Username" 
            variant="outlined"
            error={userConflict}
            helperText={userConflict ?"User name already exists!": "Please enter your username."}
            fullWidth
          />
          <TextField
            required
            id="password"
            label="Password" 
            variant="outlined"
            helperText="Please enter your password."
            fullWidth
            type="password"
          />
          <TextField
            required
            id="passwordConfirm"
            label="Confirm password" 
            variant="outlined"
            error={passwordNoMatch}
            helperText={passwordNoMatch ? "Password does not match!" :"Please confirm your password."}
            fullWidth
            type="password"
            style={{marginBottom:"1rem"}}
          />
          <Button fullWidth type="submit" variant="contained">Submit</Button>
        </form>
  );
}

export default RegisterForm;

