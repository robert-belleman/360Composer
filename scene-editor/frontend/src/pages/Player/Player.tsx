import axios from 'axios';
import React,  { useEffect, useState } from 'react';
import { useParams } from "react-router-dom";
import { Button, Container, Grid, TextField } from '@mui/material';
import ViewingAppController from '../../components/ViewingAppComponents/ViewingAppController';

const Player: React.FC = () => {
    const {timelineID, uuID} = useParams<'timelineID'|'uuID'>();
    const [loggedIn, setLoggedIn] = useState(false);
    const [code, setCode] = useState("");
    
    const login = (id: any, code: string) => axios.post(`/api/user/customer-login`, {id, access_code: code})
        .catch(e => console.log('error login in', e))
        .then(res => {console.log(res); setLoggedIn(true)})

    const handleCodeChange = (event: any) => {
        setCode(event.target.value);
    };

    const handleSubmit = () => {
        if (code && uuID) {
            login(uuID, code);
        }
    };

    return loggedIn ? <ViewingAppController timelineId={timelineID}/> :
     (
        <Container>
            <Grid container spacing={2}>
                <Grid xs={8}>
                    <h1>360 COMPOSER</h1>
                </Grid>
                <Grid xs={4}>
                    {uuID}
                </Grid>
                <Grid xs={12}>
                    <h2>Welcome to 360 Composer. Please enter your user code to start.</h2>
                </Grid>
                <Grid xs={8}>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="Code"
                        label="User Code"
                        type="text"
                        fullWidth
                        value={code}
                        onChange={handleCodeChange} 
                    />
                </Grid>
                <Grid xs={4}>
                    <Button onClick={handleSubmit} color="primary">
                        Submit
                    </Button>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Player;
