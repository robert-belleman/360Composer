import React, {useState} from "react";
import { Button, Container, Grid, TextField, Paper } from '@mui/material';
import { UserTestComponentProps } from "./ComponentProps";

const HomePage: React.FC<UserTestComponentProps> = ({onFinish, userInput, submit, skip}) => {

    const [deviceText, setDeviceText] = useState(userInput['device']);
    const [osText, setOsText] = useState(userInput['os']);
    const [browserText, setBrowserText] = useState(userInput['browser']);
    const [hmdText, setHmdText] = useState(userInput['hmd']);
    
    const handleOsChange = (event: any) => {
        setOsText(event.target.value);
    };

    const handleDeviceChange = (event: any) => {
        setDeviceText(event.target.value);
    };

    const handleBrowserChange = (event: any) => {
        setBrowserText(event.target.value);
    };
    const handleHmdChange = (event: any) => {
        setHmdText(event.target.value);
    };

    const startTest = async () => {
        var newUserinput = userInput;
        newUserinput.device = deviceText;
        newUserinput.os = osText;
        newUserinput.browser = browserText;
        newUserinput.hmd = hmdText;
        submit(newUserinput);
        onFinish();
    };

    return (
        <Container>
            <Grid container spacing={2} alignItems="center" >
                <Grid xs={12} item={true}>
                    <h1>360 COMPOSER QUESTIONAIRRE</h1>
                </Grid>
                <Grid xs={12} >
                    <Paper className="box">
                    Welcome to the questionaire of 360Composer. In this experiment we are going 
                    to test the compatibility of our viewing application on your device. This should 
                    only take a few minutes.                        
                    </Paper>
                </Grid>
                <Grid xs={12} >
                    <Paper className="box">Please enter the following information:</Paper>
                </Grid>
                <Grid xs={12} md={6}>
                    <Paper className="box">Name of your device. (e.g. Iphone, Quest 2, Desktop)</Paper>
                </Grid>
                <Grid xs={12} md={6}>
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
                </Grid>
                <Grid xs={12} md={6}>
                    Your operating system (e.g. iOS, Windows, Android)
                </Grid>
                <Grid xs={12} md={6}>
                    <TextField
                        margin="dense"
                        id="os"
                        label="Operating system"
                        type="text"
                        fullWidth
                        value={osText}
                        onChange={handleOsChange} 
                    />
                </Grid>
                <Grid xs={12} md={6}>
                    Your browser (e.g. Safari, Chrome, Firefox)
                </Grid>
                <Grid xs={12} md={6}>
                    <TextField
                        margin="dense"
                        id="os"
                        label="Browser"
                        type="text"
                        fullWidth
                        value={browserText}
                        onChange={handleBrowserChange} 
                    />
                </Grid>
                <Grid xs={12} md={6}>
                    Your HMD, if you are using one. E.g. Meta Quest 2, Google Cardboard, HTC VIVE. 
                </Grid>
                <Grid xs={12} md={6}>
                    <TextField
                        margin="dense"
                        id="os"
                        label="Hmd"
                        type="text"
                        fullWidth
                        value={hmdText}
                        onChange={handleHmdChange} 
                    />
                </Grid>
                <Grid xs={12}>
                    The next step is using the application. You can control the application by gazing. 
                    On mobile devices this can be done by rotating the device. On desktop devices this can be done
                    by using the mouse. You can hover over the available options to make a choice.
                    <br/><br/>
                    In the first scene you will see a baboon and during the second and third scene you will see all orange.
                    This is supposed to happen.

                    Good luck and thank you for participating. 
                </Grid>
                <Grid xs={12}>
                    <Button onClick={() => { startTest(); } } color="primary">
                        Continue
                    </Button>
                </Grid>
                <Grid xs={12}>
                    If the application was not working please click the following button to skip.
                </Grid>
                <Grid xs={12}>
                    <Button onClick={skip ? () => { skip() } : () => {} } color="primary">
                        Skip
                    </Button>
                </Grid>
            </Grid>
        </Container>
    );
};

export default HomePage;