import React from "react";
import { Button } from '@mui/material';
import { UserTestComponentProps } from "./ComponentProps";

const EndPage: React.FC<UserTestComponentProps> = ({onFinish, userInput, setUserInput}) => {
    const startTest = async () => {
        onFinish();
    };

    return (
        <><h1>THANK YOU FOR PARTICIPATING</h1>
        <Button onClick={() => { startTest() } } color="primary">
            Submit
        </Button></>
    );
};

export default EndPage;