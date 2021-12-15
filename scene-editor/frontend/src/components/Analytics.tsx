import React, {useEffect, useState} from 'react'
import axios from 'axios'

import { makeStyles, createStyles } from '@mui/styles';
import { createTheme } from '@mui/material/styles';

import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid'

import GetAppIcon from '@mui/icons-material/GetApp';

const theme = createTheme();
const useStyles = makeStyles((theme) =>
  createStyles({
    root: {
        flexGrow: 1,
        padding: theme.spacing(2),
    }
  })
)

const Analytics = () => {

  const [days, setDays] = useState(30)

  const classes = useStyles()

  return (
    <div className={classes.root}>
      <Grid container>
        <Grid item xs={12}>
          <TextField
            id="standard-number"
            label="Days"
            type="number"
            value={days}
            onChange={(event:any) => setDays(event.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
            helperText="Specifies the last x days to be included in the export"
          />
        </Grid>
        <Grid item xs={12} style={{marginTop: 20}}>
          <Button startIcon={<GetAppIcon />} variant="contained" color="primary" href={`/api/analytics/legacy/export?days=${days}`}>
            Export to CSV
          </Button>
        </Grid>
      </Grid>
    </div>
  )
}

export default Analytics