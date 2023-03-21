import React, { useState } from "react";
import { Button, Container, Grid } from '@mui/material';
import { UserTestComponentProps } from "./ComponentProps";

const EndPage: React.FC<UserTestComponentProps> = () => {
    return <Container>
        <Grid container alignItems="center" >
                <Grid xs={12} item={true} className="paper textBox">
                    <h2>Thank you for participating</h2>
                    If you want to help more, please consider using another device and repeating the questionaire. You can also repeat the questionaire on this device and take the opposite action of the ENTER VR button?
                    <br></br>
                    <br></br>
                    You can now close this tab
                </Grid>
        </Grid>
    </Container>
};

export default EndPage;