import React, {useEffect, useState} from 'react'
import axios from 'axios'

import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid'

import GetAppIcon from '@material-ui/icons/GetApp';


const Analytics = () => {

  const [days, setDays] = useState(30)

  const useStyles = makeStyles((theme: Theme) =>
    createStyles({
      root: {
          flexGrow: 1,
          padding: theme.spacing(2),
      }
    })
  )

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