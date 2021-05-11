import React, {useState, useEffect} from 'react';
import { useHistory } from "react-router-dom";
import axios from 'axios';

import {range} from 'lodash';

import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';

import AddIcon from '@material-ui/icons/Add';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Snackbar from '@material-ui/core/Snackbar';

import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import EditIcon from '@material-ui/icons/Edit';
import Tooltip from '@material-ui/core/Tooltip';
import Paper from '@material-ui/core/Paper';

import AccountTreeIcon from '@material-ui/icons/AccountTree';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import DeleteIcon from '@material-ui/icons/Delete';

import MuiAlert, { AlertProps } from '@material-ui/lab/Alert';
import Skeleton from '@material-ui/lab/Skeleton';

import NewScenarioDialog from './ScenarioViewComponents/NewScenarioDialog';

type ScenarioTileProps = {
  name: string;
  activeProject: string;
  id: string;
  description: string;
  created_at: string;
  fullWidth: boolean;
  setWarningState: any;
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
      <DialogTitle id="alert-dialog-slide-title">{"Are you sure you want to remove this scenario?"}</DialogTitle>
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

const ScenarioTile: React.FC<ScenarioTileProps> = ({ name, activeProject, id, description, created_at, fullWidth, setWarningState }) => {
  const history = useHistory();
  return (
    <Grid item xs={12} md={6} lg={fullWidth ? 3 : 6} xl={fullWidth ? 3 : 4}>
      <Card variant="outlined" style={{backgroundColor: '#eeeeee'}}>
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
            <Tooltip title="Edit" arrow>
                <IconButton aria-label="edit" onClick={() => history.push(`/scenario-editor/${activeProject}/${id}`)}>
                    <EditIcon />
                </IconButton>
            </Tooltip>

            <Tooltip title="Remove Scenario">
              <IconButton aria-label="remove scenario" onClick={() => setWarningState({open: true, id})}>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </CardActions>
        </Card>
    </Grid>
  );
};


type ScenarioViewProps = {
  activeProject:string;
  fullWidth: boolean;
}

export default ({activeProject, fullWidth}:ScenarioViewProps) => {
  const [openScenarioDialog, setOpenScenarioDialog] = useState(false);
  const [loadingScenarios, setLoadingScenarios] = useState(true);

  const [scenarios, setScenarios] = useState([]);

  const [warningState, setWarningState] = useState({open: false, id: ""});
  const [alertState, setAlertState] = useState({open: false, message: "", severity: ""})

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
        },
        cardHeader: {
          fontSize: '1.2rem'
        }
    }),
))();

  useEffect(() => {
    setLoadingScenarios(true);
    fetchScenarios();
  }, []);

  const onScenarioCreated = () => {
      setOpenScenarioDialog(false);
      fetchScenarios();
      setAlertState({open: true, message: "Scenario successfully created.", severity: "success"})
  };

  const onScenarioCreationFailed = () => {
    setAlertState({open: true, message: "Something failed while creating scenario.", severity: "error"})
  };

  const fetchScenarios = () => {
    axios.get(`/api/project/${activeProject}/scenarios`)
      .then((res:any) => setScenarios(res.data))
      .then(() => setLoadingScenarios(false))
      .catch((e) => {console.log(e); setLoadingScenarios(false)});
  }

  const handleAlertClose = () => {
    setAlertState({...alertState, open: false})
  }

  const handleDelete = (id:string) => {
    axios.post(`/api/scenario/${id}/delete`)
      .then(fetchScenarios)
      .then(() => setWarningState({open: false, id: ""}))
      .then(() => setAlertState({open: true, message: "Scenario successfully deleted.", severity: "success"}))
      .catch((e:any) => {
        setWarningState({open: false, id: ""})
        if (e.response && e.response.status === 409) {
          setAlertState({open: true, message: "Scenario cannot be deleted because it is still in use.", severity: "warning"})
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

    const scenarios_ = () => scenarios.length === 0 
      ? <Typography variant="subtitle1" component="p">No scenarios have been added yet.</Typography>
      : scenarios.map((scenario: any) => (
          <ScenarioTile
            id={scenario.id}
            key={scenario.id}
            activeProject={activeProject}
            name={scenario.name}
            created_at={scenario.created_at}
            description={scenario.description}
            fullWidth={fullWidth}
            setWarningState={setWarningState}
        />
    ));

    return (
      <Grid container spacing={2} className={classes.overview} style={{margin: 0}}>
        { loadingScenarios ? loading_() : scenarios_() }
      </Grid>
    )
  }

  return (
    <Paper elevation={0} variant="outlined" className={classes.paper}>
      <Typography variant="h4" component="p" className={classes.header}><AccountTreeIcon style={{marginRight:5}}/> 3. Scenarios</Typography>
      <Grid container spacing={2} style={{margin: 0}}>
        { renderOverview() }
        <Grid item xs={12}>
          <Button
            color="primary"
            onClick={() => setOpenScenarioDialog(true)}
            startIcon={<AddIcon />}
            style={{marginTop: 10}}
            >
            Add Scenario
          </Button>
        </Grid>
      </Grid>
      <DeleteWarningDialog id={warningState.id} open={warningState.open} handleDelete={() => handleDelete(warningState.id)} handleClose={() => setWarningState({open: false, id: ""})} />
      <NewScenarioDialog activeProject={activeProject} open={openScenarioDialog} closeHandler={setOpenScenarioDialog} onScenarioCreated={onScenarioCreated} onScenarioCreationFailed={onScenarioCreationFailed}/>
      <ScenarioSnackbar open={alertState.open} message={alertState.message} severity={alertState.severity} handleClose={handleAlertClose} />
    </Paper>
  );
}