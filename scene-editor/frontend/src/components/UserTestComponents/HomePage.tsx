import React, {useState} from "react";
import { Button, TextField } from '@mui/material';
import { UserTestComponentProps } from "./ComponentProps";

const HomePage: React.FC<UserTestComponentProps> = ({onFinish, userInput, setUserInput}) => {

    const [deviceText, setDeviceText] = useState(userInput['device']);
    const [osText, setOsText] = useState(userInput['os']);
    
    const handleOsChange = (event: any) => {
        setOsText(event.target.value);
    };

    const handleDeviceChange = (event: any) => {
        setDeviceText(event.target.value);
    };

    const startTest = async () => {
        setUserInput({device: deviceText, os: osText, ...userInput});
        onFinish();
    };

    return (
        <>
            <TextField
                autoFocus
                margin="dense"
                id="device"
                label="Device name"
                type="text"
                fullWidth
                value={deviceText}
                onChange={handleDeviceChange} 
            />
            <TextField
                autoFocus
                margin="dense"
                id="os"
                label="Operating system"
                type="text"
                fullWidth
                value={osText}
                onChange={handleOsChange} 
            />
            <Button onClick={() => { startTest(); } } color="primary">
                Submit
            </Button>
        </>
    );
};

export default HomePage;