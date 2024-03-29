import React, { ReactElement, useState, useEffect } from 'react';
import {useNavigate} from 'react-router-dom';

import axios from 'axios';

import { range } from 'lodash';

import { makeStyles, createStyles } from '@mui/styles';
import { createTheme } from '@mui/material/styles';

import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Snackbar from '@mui/material/Snackbar';

import SwapVertIcon from '@mui/icons-material/SwapVert';
import TimelineIcon from '@mui/icons-material/Timeline';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

import Skeleton from '@mui/material/Skeleton';
import MuiAlert, { AlertProps } from '@mui/material/Alert';

type DialogProps = {
  open:boolean,
  handleSubmit:any,
  handleClose:any
}

type TimelineViewProps = {
  activeProject: string;
  fullWidth: boolean;
};

const Alert = (props: AlertProps) => {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const TimelineSnackbar = ({open, message, severity, handleClose}:any) => {
  return (
    <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
      <Alert onClose={handleClose} severity={severity}>
        {message}
      </Alert>
    </Snackbar>
  )
}

const DeleteWarningDialog = ({open, id, handleClose, handleDelete}:any) => {
  return (
    <Dialog
      open={open}
      keepMounted
      onClose={handleClose}
      aria-labelledby="alert-dialog-slide-title"
      aria-describedby="alert-dialog-slide-description"
    >
      <DialogTitle id="alert-dialog-slide-title">{"Are you sure you want to remove this timeline?"}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-slide-description">
          You cannot undo this action.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleDelete} color="primary">
          Remove
        </Button>
      </DialogActions>
    </Dialog>
  )
}

const AddTimelineDialog = ({open, handleSubmit, handleClose}:DialogProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const resetState = () => { setName(''); setDescription(''); }

  const handleCancel = () => {
    resetState();
    handleClose();
  }

  const handleAdd = () => {
    resetState();
    handleSubmit(name, description)
  }

  return (
    <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Add Timeline</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please enter a name and description for the timeline.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            required
          />
          <TextField
            margin="dense"
            label="Description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} color="primary">Cancel</Button>
          <Button onClick={handleAdd} color="primary">Add</Button>
        </DialogActions>
      </Dialog>
  )
}

export default ({activeProject, fullWidth}: TimelineViewProps): ReactElement => {
  const navigate = useNavigate();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [warningState, setWarningState] = useState({open: false, id: ""});
  const [alertState, setAlertState] = useState({open: false, message: "", severity: ""})
  const [timelines, setTimelines] = useState([] as any[])

  const [loadingTimelines, setLoadingTimelines] = useState(true)

  const fetchTimelines = async () => {
    return axios.get(`/api/project/${activeProject}/timelines`)
      .then((res:any) => setTimelines(res.data))
      .then(() => setLoadingTimelines(false))
      .catch((e) => {console.log('Error when fetching timelines: ', e); setLoadingTimelines(false)})
  }

  useEffect(() => {
    setLoadingTimelines(true)
    fetchTimelines()
  }, [])

  const theme = createTheme();
const useStyles = makeStyles((theme) =>
    createStyles({
        root: {
          flexGrow: 1,
          padding: theme.spacing(2),
        },
        addButton: {
          marginTop: '20px',
        },
        paper: {
          padding: theme.spacing(2),
          boxSizing: 'border-box'
        },
        overview: {
          height: fullWidth ? 400 :300,
          overflow: 'auto'
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

  const classes = useStyles();

  const handleDelete = (id:string) => {
    axios.post(`/api/timeline/${id}/delete`, {project_id: activeProject})
      .then(() => setWarningState({open: false, id: ""}))
      .then(() => setAlertState({open: true, message: "Successfully deleted timeline", severity: "success"}))
      .then(fetchTimelines)
      .catch((e) => {
        setAlertState({open: true, message: "Something went wrong while deleting timeline", severity: "error"});
        setWarningState({open: false, id: ""});
      })
  }

  const handleAddTimeline = (name:string, description:string) => {
    axios.post(`/api/project/${activeProject}/timelines`, {name, description, randomized: true})
      .then(() => { setDialogOpen(false); fetchTimelines(); })
      .then(() => setAlertState({open: true, message: "Successfully created timeline", severity: "success"}))
      .catch((e) => setAlertState({open: true, message: "Something went wrong while creating timeline", severity: "error"}))
  }

  const handleAlertClose = () => {
    setAlertState({...alertState, open: false})
  }

  const randomChip = () => (
    <Chip
      icon={<SwapVertIcon />}
      label="Randomized"
      color="primary"
      size="small"
    />
  )

  const orderedChip = () => (
    <Chip
      icon={<TimelineIcon />}
      label="Ordered"
      color="secondary"
      size="small"
    />
  )

  const timelineCard = (timeline:any) => (
    <Grid key={timeline.id} item xs={12} md={6} lg={fullWidth ? 3 : 6} xl={fullWidth ? 3 : 4}>
      <Card variant="outlined" style={{backgroundColor: '#eeeeee'}}>
        <CardHeader
          title={timeline.name}
          titleTypographyProps={{variant:"h5", gutterBottom: true}}
          subheader={timeline.randomized ? randomChip() : orderedChip()}
        />
        <CardContent>
          <Typography variant="body2" color="textSecondary" component="p">
            {timeline.description}
          </Typography>
        </CardContent>
        <CardActions>
          <Tooltip title="Edit Timeline">
            <IconButton
              aria-label="edit timeline"
              onClick={() => navigate(`/app/timeline-editor/${activeProject}/${timeline.id}`)}
              size="large">
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Remove Timeline">
            <IconButton
              aria-label="edit timeline"
              onClick={() => setWarningState({open: true, id: timeline.id})}
              size="large">
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </CardActions>
      </Card>
    </Grid>
  )

  const renderOverview = () => {
    const loading_ = () => range(6).map((elem:number) => {
      return (
        <Grid item xs={12} md={6} lg={3} xl={2} key={elem}>
          {range(5).map((elem:number) => ( <Skeleton key={elem} animation="wave" /> ))}
        </Grid>
      )
    })

    const timelines_ = () => timelines.length === 0
      ? <Typography variant="subtitle1" component="p">No timelines have been added yet.</Typography>
      : timelines.map(timelineCard)

    return (
      <Grid container spacing={2} className={classes.overview} style={{margin: 0}}>
        { loadingTimelines ? loading_() : timelines_() }
      </Grid>
    )
  }

  return (
    <Paper elevation={0} variant="outlined" className={classes.paper}>
      <Typography variant="h4" component="p" className={classes.header}><TimelineIcon style={{marginRight:5}}/> 4. Timelines</Typography>
      <Grid container spacing={2} style={{margin: 0}}>
        { renderOverview() }
        <Grid item xs={12}>
          <Button
            color="primary"
            onClick={() => setDialogOpen(true)}
            startIcon={<AddIcon />}
            style={{marginTop: 10}}
            >
            Add Timeline
          </Button>
        </Grid>
      </Grid>
      <DeleteWarningDialog id={warningState.id} open={warningState.open} handleDelete={() => handleDelete(warningState.id)} handleClose={() => setWarningState({open: false, id: ""})} />
      <AddTimelineDialog open={dialogOpen} handleSubmit={handleAddTimeline} handleClose={() => setDialogOpen(false)}/>
      <TimelineSnackbar open={alertState.open} message={alertState.message} severity={alertState.severity} handleClose={handleAlertClose}/>
    </Paper>
  )
}
