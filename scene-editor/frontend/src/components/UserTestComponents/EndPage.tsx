import React, { useState } from "react";
import { Button } from '@mui/material';
import { UserTestComponentProps } from "./ComponentProps";

const EndPage: React.FC<UserTestComponentProps> = ({onFinish}) => {
    const [submitted, setSubitted] = useState(false);
    const endTest = async () => {
        setSubitted(!onFinish());
        if (!onFinish()) {
            return <h1>SUCCESFULLY SUBMITTED</h1>
        }
    };

    return !submitted ?
            <><h1>THANK YOU FOR PARTICIPATING</h1>
            <Button onClick={() => { endTest() } } color="primary">
                Submit
            </Button></>
        :
            <h1>SUCCESFULLY SUBMITTED</h1>;
};

export default EndPage;