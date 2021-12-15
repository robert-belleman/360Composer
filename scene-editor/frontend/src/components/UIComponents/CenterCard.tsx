import React from "react";
import {Grid, Card} from "@mui/material"

const CenterCard: React.FC = (props) => {
    return (
        <Grid
          container
          spacing={0}
          direction="column"
          alignItems="center"
          justifyContent="center"
          style={{ minHeight: '100vh' }}
        >
            <Grid item xs={2}>
                <Card>
                    {props.children}
                </Card>
            </Grid>
        </Grid>
    )
};

export default CenterCard;
