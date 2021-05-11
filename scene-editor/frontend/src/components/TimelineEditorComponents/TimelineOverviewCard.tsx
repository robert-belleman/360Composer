import React from 'react';

import { range } from 'lodash';

import Button from "@material-ui/core/Button";
import Divider from "@material-ui/core/Divider";
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';

import Skeleton from '@material-ui/lab/Skeleton';

import InfoIcon from '@material-ui/icons/Info';

import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) =>
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