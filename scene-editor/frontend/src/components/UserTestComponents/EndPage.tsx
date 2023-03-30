import React, { useState } from "react";
import { Button, Container, Grid } from '@mui/material';
import { UserTestComponentProps } from "./ComponentProps";

const EndPage: React.FC<UserTestComponentProps> = ({onFinish}) => {
    return <Container>
        <Grid container alignItems="center" >
                <Grid xs={12} item={true} className="paper textBox">
                    <h2>Thank you for participating</h2>
                    If you want to help more, please consider using another device and repeating the questionaire. You can also repeat the questionaire on this device and take the opposite action of the ENTER VR button?
                    <br></br>
                    <br></br>
                    If you were using an iOS device and the player did not behave correctly, could you be so kind to repeat the questionaire in a different browser such as Google Chrome?
                    <br></br>
                    <br></br>
                    <a target="_blank" href="https://apps.apple.com/us/app/google-chrome/id535886823">https://apps.apple.com/us/app/google-chrome/id535886823</a>
                    <br></br>
                    <br></br>
                    Contact info: menno.vanrooijen@student.uva.nl
                    <br></br>
                    <br></br>
                    You can now close this tab or click repeat to repeat the questionaire.
                    <br></br>
                    <br></br>
                    <Button onClick={onFinish} color="primary" variant="contained">
                        Repeat
                    </Button>
                </Grid>
        </Grid>
    </Container>
};

export default EndPage;