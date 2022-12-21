import React from "react";

import { useSelector } from 'react-redux';
import { Button } from '@mui/material';

import CircularProgress from '@mui/material/CircularProgress';


const UserTest: React.FC = () => {
    const token = useSelector((state:any) => state.token)

    const form = () => (
        <div className="user-test-page">
            <p>HELLO WORLD</p>
            <Button>Click To Continue</Button>
        </div>
    );

    return token.loading ? <CircularProgress /> : form();
};

export default UserTest;
