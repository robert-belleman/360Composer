import React from 'react';

import { range } from 'lodash';

import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';

import Skeleton from '@mui/material/Skeleton';

import InfoIcon from '@mui/icons-material/Info';

import { makeStyles, createStyles } from '@mui/styles';
import { createTheme } from '@mui/material/styles';

const theme = createTheme();
const useStyles = makeStyles((theme) =>
    createStyles({
      root: {
        flexGrow: 1,
        padding: theme.spacing(2),
      },
      paper: {
        padding: theme.spacing(2),
        boxSizing: 'border-box'
      },
      box: {
        flexGrow: 1
      },
      wrapper: {
        height: '333px',
        padding: 16,
        boxSizing: 'border-box',
        width: '100%'
      },
      header: {
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        fontSize: '1.1rem',
        fontWeight: 700,
        color: '#2196f3',
        marginBottom: 10
      }
    }),
  );


type TimelineOverviewCardProps = {
  onEditClick:any,
  loading:boolean,
  timeline:any,
  handleRandomizedToggle:any
}

const TimelineOverviewCard = ({timeline, loading, onEditClick, handleRandomizedToggle}:TimelineOverviewCardProps) => {
  const classes = useStyles();

  const renderInfo = () => {
    if (loading) {
      return (
        <div className={classes.wrapper}>
          {range(6).map((elem:number) => ( <Skeleton key={elem} animation="wave" /> ))}
        </div>
      )
    }

    return (
      <div className={classes.wrapper}>
        <Grid item xs={12}>
          <Typography gutterBottom variant="h5" component="h2">
            {timeline.name}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body2" component="p">
            {timeline.description}
          </Typography>
        </Grid>
        <Divider style={{marginTop: 10}} />
        <Grid item xs={12}>
          <FormControlLabel
            control={<Switch checked={timeline.randomized} onChange={handleRandomizedToggle} name="checkedB" color="primary" size="small" />}
            label={timeline.randomized ? "Randomized" : "Ordered"} 
            style={{marginTop: 10}}
          />
        </Grid>
      </div>
    )
  }

  return (
    <Paper elevation={0} variant="outlined" className={classes.paper}>
      <Typography variant="h4" component="p" className={classes.header}><InfoIcon style={{marginRight:5}}/> Timeline Information</Typography>
      <Grid container>
        {renderInfo()}
      </Grid>
      <Grid item xs={12}>
        <Button size="small" color="primary" onClick={onEditClick}>
          Edit
        </Button>
      </Grid>
    </Paper>
  )
}

export default TimelineOverviewCard