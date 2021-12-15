import React, { useRef, useEffect, useState } from 'react';

import { reduce, extend } from 'lodash';

import axios from 'axios';

import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { View } from '../../types/views';

import TopBar from "../../components/TopBar";
import SideMenu from "../../components/SideMenu";

import { makeStyles, createStyles } from '@mui/styles';
import { createTheme } from '@mui/material/styles';

import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';

import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import { Typography } from '@mui/material';

import MuiAlert, { AlertProps } from '@mui/material/Alert';

import Snackbar from '@mui/material/Snackbar';

const Alert = (props: AlertProps) => {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const SettingsSnackbar = ({open, message, severity, handleClose}:any) => {
  return (
    <Snackbar open={open} autoHideDuration={10000} onClose={handleClose}>
      <Alert onClose={handleClose} severity={severity}>
        {message}
      </Alert>
    </Snackbar>
  )
}

const theme = createTheme();
const useStyles = makeStyles((theme) =>
  createStyles({
    root: {
      flexGrow: 1,
      padding: theme.spacing(3),
      [theme.breakpoints.up('sm')]: {
        marginLeft: 240
      }
    },
    top: {
      padding: theme.spacing(2),
      boxSizing: 'border-box'
    },
    box: {
      flexGrow: 1
    },
    panel: {
      backgroundColor: 'white',
      boxShadow: 'none',
      borderRadius: '5px',
      border: '1px solid rgba(0, 0, 0, 0.12)'
    }
  })
)

const Settings = () => {
  const initialValidState: any = reduce(["new", "current", "verify"].map(x => ({[x]: {valid: true, message: ""}})), extend)

  const classes = useStyles();
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newVerifyPassword, setNewVerifyPassword] = useState("");

  const [newUser, setNewUser] = useState({username: "", password: ""});

  const [valid, setValid] = useState(initialValidState)

  const [alertState, setAlertState] = useState({open: false, message: "", severity: ""})

  const userID = useSelector((state:any) => state.token.id);

  const [username, setUsername] = useState("")

  const useDidUpdateEffect = (fn:any, inputs:any) => {
    const didMountRef = useRef(false);
  
    useEffect(() => {
      if (didMountRef.current)
        fn();
      else
        didMountRef.current = true;
    }, inputs);
  }


  useEffect(() => {
    fetchUserInformation()
  }, [])

  useDidUpdateEffect(() => {
    if (currentPassword.length === 0) {
      setValid({...valid, current: {valid: false, message: "cannot be empty"}})
      return
    }

    setValid({...valid, current: {valid: true, message: ""}})
  }, [currentPassword])

  useDidUpdateEffect(() => {
    if (newPassword.length < 8) {
      setValid({...valid, new: {valid: false, message: "passwords must be at least 8 characters"}})
      return
    }

    setValid({...valid, new: {valid: true, message: ""}})
  }, [newPassword])


  useDidUpdateEffect(() => {
    if (newPassword !== newVerifyPassword) {
      setValid({...valid, verify: {valid: false, message: "passwords do not match"}})
    } else {
      setValid({...valid, verify: {valid: true, message: ""}})
    }
  }, [newVerifyPassword])

  const fetchUserInformation = () => {
    axios.get(`/api/user/${userID}/`)
      .then((res) => setUsername(res.data.username))
      .catch((e) => console.log('error while fetching user information'))
  }

  const changePassword = () => {
    axios.post('/api/user/update-password', {id: userID, current_password: currentPassword, new_password: newPassword})
      .then(() => {
        setCurrentPassword("");
        setNewPassword("");
        setNewVerifyPassword("");
        setValid(initialValidState)
        setAlertState({open: true, message: "Successfully updated password", severity: "success"})
      })
      .catch((e) => {
        setAlertState({open: true, message: e.response.data, severity: "error"})
      })
  }

  const registerUser = () => {
    axios.post('/api/user/register', newUser)
      .then(() => setNewUser({username: "", password: ""}))
  }

  const handleAlertClose = () => {
    setAlertState({...alertState, open: false})
  }

  const submitPassword = () => {
    if (!valid.new.valid || !valid.current.valid || !valid.verify.valid) {
      return
    }

    changePassword()
  }

  const renderTop = () => (
    <div>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Button color="primary" startIcon={<ArrowBackIosIcon />} onClick={() => navigate(`/`)}>Back</Button>
        </Grid>
      </Grid>
    </div>
  )

  const addUser = () => (
    <Grid item xs={12} style={{marginTop: 20}}>
        <Paper elevation={0} variant="outlined" className={classes.top}>
          <Grid container spacing={1}>
            <Grid item xs={12} style={{marginTop: 20}}>
              <Grid container>
                <Grid item xs={12}>
                  <Typography variant="subtitle1">Create new user</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Divider style={{marginTop: 10, marginBottom:10}} />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    id="standard-error-helper-text"
                    label="Username"
                    defaultValue=""
                    value={newUser.username}
                    helperText={"username"}
                    onChange={(event) => setNewUser({username: event.target.value, password: newUser.password})}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    error={!valid.new.valid}
                    id="standard-error-helper-text"
                    label="Password"
                    type="password"
                    defaultValue=""
                    value={newUser.password}
                    helperText={"password"}
                    onChange={(event) => setNewUser({password: event.target.value, username: newUser.username})}
                  />
                </Grid>
                <Grid item xs={12} style={{marginTop: 10}}>
                  <Button color="primary" onClick={registerUser}>Submit</Button>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Paper>
      </Grid>
  )

  return (
    <div>
      <TopBar/>
      <SideMenu activeView={View.Project}/>
      <div className={classes.root}>
        <Grid container spacing={0}>
          <Grid item xs={12}>
            <Paper elevation={0} variant="outlined" className={classes.top}>
              {renderTop()}
            </Paper>
          </Grid>
          <Grid item xs={12} style={{marginTop: 20}}>
            <Paper elevation={0} variant="outlined" className={classes.top}>
              <Grid container spacing={1}>
                <Grid item xs={12}>
                  <Typography variant="h5">Welcome, {username}</Typography>
                </Grid>
                <Grid item xs={12} style={{marginTop: 20}}>
                  <Grid container>
                    <Grid item xs={12}>
                      <Typography variant="subtitle1">Update Password</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Divider style={{marginTop: 10, marginBottom:10}} />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        error={!valid.current.valid}
                        id="standard-error-helper-text"
                        label="Current Password"
                        type="password"
                        defaultValue=""
                        value={currentPassword}
                        helperText={!valid.current.valid ? valid.current.message : "current password"}
                        onChange={(event) => setCurrentPassword(event.target.value)}
                     />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        error={!valid.new.valid}
                        id="standard-error-helper-text"
                        label="New Password"
                        type="password"
                        defaultValue=""
                        value={newPassword}
                        helperText={!valid.new.valid ? valid.new.message : "current password"}
                        onChange={(event) => setNewPassword(event.target.value)}
                     />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        error={!valid.verify.valid}
                        id="standard-error-helper-text"
                        label="Verify New Password"
                        type="password"
                        defaultValue=""
                        value={newVerifyPassword}
                        helperText={!valid.verify.valid ? valid.verify.message : "current password"}
                        onChange={(event) => setNewVerifyPassword(event.target.value)}
                     />
                    </Grid>
                    <Grid item xs={12} style={{marginTop: 10}}>
                      <Button color="primary" onClick={submitPassword}>Submit</Button>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          {addUser()}
        </Grid>
      </div>
      <SettingsSnackbar open={alertState.open} message={alertState.message} severity={alertState.severity} handleClose={handleAlertClose} />
    </div>
  )
}

export default Settings