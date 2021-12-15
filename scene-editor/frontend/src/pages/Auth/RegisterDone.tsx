import React from "react";
import {Link} from "react-router-dom";
import CenterCard from "../../components/UIComponents/CenterCard";
import { CardHeader, CardContent, Typography } from "@mui/material"

const Register: React.FC = () => {
    const form = () => (
        <CenterCard>
            <CardHeader 
              style={{textAlign:'center'}}
              title="Registration succesfull!"/>
            <CardContent>
                <Typography> Now you can proceed to <Link to="/">login</Link>.</Typography>
            </CardContent>
        </CenterCard>
    );

    return form();
};

export default Register;
