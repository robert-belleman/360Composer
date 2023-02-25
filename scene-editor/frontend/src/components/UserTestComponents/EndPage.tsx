import React, { useState } from "react";
import { Button, Container } from '@mui/material';
import { UserTestComponentProps } from "./ComponentProps";

const EndPage: React.FC<UserTestComponentProps> = () => {
    return <Container>
        <h1>SUCCESFULLY SUBMITTED</h1>
        <h1>THANK YOU FOR PARTICIPATING</h1>
    </Container>
};

export default EndPage;