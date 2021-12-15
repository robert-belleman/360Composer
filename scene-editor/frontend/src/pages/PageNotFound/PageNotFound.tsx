import React from "react";
import "./PageNotFound.scss";
import CenterCard from "../../components/UIComponents/CenterCard"
import { CardHeader, CardContent, Typography } from "@mui/material"

const PageNotFound: React.FC = () => {

  return (
    <CenterCard>
      <CardHeader title="Oops!" style={{textAlign:'center'}}/>
      <CardContent><Typography>Page Not Found: 404</Typography></CardContent>
    </CenterCard>
  )
}

export default PageNotFound;
