import React from "react";
import RegisterForm from "../../components/AuthComponents/RegisterForm";
import CenterCard from "../../components/UIComponents/CenterCard";
import { Typography, CardContent, CardHeader } from "@mui/material"

const Register: React.FC = () => {
    const form = () => (
        <CenterCard>
            <CardHeader 
                style={{ textAlign: 'center' }}
                title="Register"/>
            <CardContent>
                <RegisterForm />
            </CardContent>
        </CenterCard>
    );

    return form();
};

export default Register;
