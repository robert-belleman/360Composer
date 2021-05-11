import React,  { useEffect, useState } from 'react';
import { useHistory } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';

import {range} from 'lodash';

import axios from 'axios';

import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import AddIcon from '@material-ui/icons/Add';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import EditIcon from '@material-ui/icons/Edit';
import Tooltip from '@material-ui/core/Tooltip';
import Snackbar from '@material-ui/core/Snackbar';

import VideocamIcon from '@material-ui/icons/Videocam';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import DeleteIcon from '@material-ui/icons/Delete';

import Skeleton from '@material-ui/lab/Skeleton';

import NewSceneDialog from "./SceneViewComponents/NewSceneDialog";
import MuiAlert, { AlertProps } from '@material-ui/lab/Alert';

import { fetchScenes } from '../../actions/sceneActions';

type SceneViewProps = {
  activeProject: string;
  fullWidth: boolean;
};

type SceneTileProps = {
  name: string;
  id: string;
  activeProject: string;
  description: string;
  created_at: string;
  fullWidth: boolean;
  setWarningState: any
};

const Alert = (props: AlertProps) => {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const ScenarioSnackbar = ({open, message, severity, handleClose}:any) => {
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
      <DialogTitle id="alert-dialog-slide-title">{"Are you sure you want to remove this scene?"}</DialogTitle>
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

const SceneTile: React.FC<SceneTileProps> = ({ name, id, activeProject, description, created_at, fullWidth, setWarningState }) => {
  const history = useHistory();

  return (
    <Grid item xs={12} md={6} lg={fullWidth ? 3 : 6} xl={fullWidth ? 3 : 4}>
      <Card style={{backgroundColor: '#eeeeee'}} variant="outlined">
        <CardHeader
          action={
            <IconButton aria-label="settings">
              <MoreVertIcon />
            </IconButton>
          }
          titleTypographyProps={{variant:"subtitle1"}}
          title={name}
          subheader={created_at}
        />
        <CardContent>
          <Typography variant="body2" color="textSecondary" component="p">
          {description}
          </Typography>
        </CardContent>
        <CardActions disableSpacing>
          <Tooltip title="Play Scene" arrow>
            <IconButton aria-label="Open in player" onClick={() => {
                history.push("/scene-player/" + id);
              }}>
            <PlayArrowIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit" arrow>
            <IconButton aria-label="edit" onClick={() => {
                history.push(`/editor/${activeProject}/${id}`);
            }}>
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Scene" arrow>
            <IconButton aria-label="share" onClick={() => setWarningState({open: true, id})}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </CardActions>
      </Card>
    </Grid>
  );
};

const SceneView: React.FC<SceneViewProps> = ({activeProject, fullWidth}) => {
  const [openSceneDialog, setOpenSceneDialog] = useState(false);
  const [loadingScenes, setLoadingScenes] = useState(true);
  const [scenes, setScenes] = useState([] as any[]);

  const [warningState, setWarningState] = useState({open: false, id: ""});
  const [alertState, setAlertState] = useState({open: false, message: "", severity: ""})

  const onSceneCreated = () => {
    setOpenSceneDialog(false);
    fetchScenes();
  };

  useEffect(() => {
    setLoadingScenes(true);
    fetchScenes();
  }, [])

  const fetchScenes = () => axios.get(`/api/project/${activeProject}/scenes`)
    .then((res:any) => setScenes(res.data))
    .then(() => setLoadingScenes(false))
    .catch((e:any) => { console.log('error while fetching scenes', e); setLoadingScenes(false)} )

  const classes = (makeStyles((theme: Theme) =>
    createStyles({
      root: {
        flexGrow: 1,
        padding: theme.spacing(2),
      },
      paper: {
        padding: theme.spacing(2),
        boxSizing: 'border-box'
      },
      overview: {
        height: fullWidth ? 400 : 300,
        minHeight: 100,
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
  ))();

  const handleDelete = (id:string) => {
    axios.post(`/api/scenes/${id}/delete`)
      .then(fetchScenes)
      .then(() => setWarningState({open: false, id: ""}))
      .then(() => setAlertState({open: true, message: "Scene successfully deleted.", severity: "success"}))
      .catch((e:any) => {
        setWarningState({open: false, id: ""})
        if (e.response && e.response.status === 409) {
          setAlertState({open: true, message: "Scene cannot be deleted because it is still in use.", severity: "warning"})
          return
        }

        setAlertState({open: true, message: "Unable to delete scenario.", severity: "error"})
      })
  }

  const renderOverview = () => {
    const loading_ = () => range(6).map((elem:number) => {
      return (
        <Grid item xs={12} md={6} lg={3} xl={2} key={elem}>
          {range(5).map((elem:number) => ( <Skeleton key={elem} animation="wave" /> ))}
        </Grid>   
      )
    })

    const scenes_ = () => scenes.length == 0 
    ? <Typography variant="subtitle1" component="p">No scenes have been added yet.</Typography>
    : scenes.map((scene: any) => (
        <SceneTile 
            id={scene.id}
            key={scene.id}
            name={scene.name}
            activeProject={activeProject}
            created_at={scene.created_at}
            description={scene.description}
            fullWidth={fullWidth}
            setWarningState={setWarningState}
        />
    ));

    return (
      <Grid container spacing={2} className={classes.overview} style={{margin: 0}}>
        { loadingScenes ? loading_() : scenes_() }
      </Grid>
    )
  }


  return (
    <Paper elevation={0} variant="outlined" className={classes.paper}>
      <Typography variant="h4" component="p" className={classes.header}><VideocamIcon style={{marginRight:5}}/> 2. Scenes</Typography>
      <Grid container spacing={2} style={{margin: 0}}>
        { renderOverview() }
        <Grid item xs={12}>
          <Button
            color="primary"
            onClick={() => setOpenSceneDialog(true)}
            startIcon={<AddIcon />}
            style={{marginTop: 10}}
            >
            Add Scene
          </Button>
        </Grid>
      </Grid>
      <DeleteWarningDialog id={warningState.id} open={warningState.open} handleDelete={() => handleDelete(warningState.id)} handleClose={() => setWarningState({open: false, id: ""})} />
      <NewSceneDialog activeProject={activeProject} open={openSceneDialog} closeHandler={setOpenSceneDialog} onSceneCreated={onSceneCreated} />
    </Paper>
  );
};

export default SceneView;
