import axios from 'axios';
import React,  { useEffect, useState } from 'react';
import { useParams } from "react-router-dom";
import { Button, TextField } from '@mui/material';

const Player: React.FC = () => {
    const {timelineID, uuID} = useParams<'timelineID'|'uuID'>();
    const [timeline, setTimeline] = useState<any>(undefined);
    const [code, setCode] = useState("");
    
    const login = (id: any, code: string) => axios.post(`/api/user/customer-login`, {id, access_code: code})
        .catch(e => console.log('error login in', e))
        .then(res => console.log(res))
        .then(retrieveTimeline)
    
    const retrieveTimeline = async () => 
        await axios.get(`/api/timeline/${uuID}/export`)
            .then(res => setTimeline(res))
            .then(res => console.log(res))
            .catch(e => console.log('error retreiving timeline', e))

    const handleCodeChange = (event: any) => {
        setCode(event.target.value);
    };

    const handleSubmit = () => {
        if (code && uuID) {
            login(uuID, code);
        }
    };

    return (
        <>
            {timelineID}
            <br/>
            {uuID}
            <br/>
            <TextField
                autoFocus
                margin="dense"
                id="Code"
                label="User Code"
                type="text"
                fullWidth
                value={code}
                onChange={handleCodeChange} />
            <Button onClick={handleSubmit} color="primary">
                Submit
            </Button>
        </>
    );
};

export default Player;
