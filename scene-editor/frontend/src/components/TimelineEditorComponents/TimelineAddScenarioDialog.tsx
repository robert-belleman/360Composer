import React, {useState, useEffect} from 'react';

import { makeStyles, createStyles } from '@mui/styles';
import { createTheme } from '@mui/material/styles';

import {range} from 'lodash';

import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';

import Skeleton from '@mui/material/Skeleton';

import PersonIcon from '@mui/icons-material/Person';

import axios from "axios";

const theme = createTheme();
const useStyles = makeStyles((theme) =>
  createStyles({
    list: {
      height: 300,
      width: 400,
      overflow: 'auto'
    }
  })
);

type NewScenarioDialog = {
  projectID: string;
  timelineID: string;
  open: boolean;
  closeHandler: any;
  onScenariosAdded: any;
  addedScenarios:string[];
};

const NewScenarioDialog: React.FC<NewScenarioDialog> = ({projectID, timelineID, open, closeHandler, onScenariosAdded, addedScenarios}) => {
  const [scenarios, setScenarios] = useState([] as any);
  const [checked, setChecked] = useState([] as any[]);
  const [loadingScenarios, setLoadingScenarios] = useState(true);

  const classes = useStyles();

  useEffect(() => {
    fetchScenarios();
  }, [open])

  const setScenariosCallback = (fetchedScenarios:any) => {
    const filteredScenarios = fetchedScenarios.filter((scenario:any) => addedScenarios.indexOf(scenario.id) === -1);
    setScenarios(filteredScenarios);
  }

  const fetchScenarios = () => {
    axios.get(`/api/project/${projectID}/scenarios`)
      .then((res:any) => setScenariosCallback(res.data))
      .then(() => setLoadingScenarios(false))
      .catch((e:any) => {console.log('error while fetching scenarios', e); setLoadingScenarios(false)})
  }

  const handleToggle = (value: number) => () => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
  };

  const addScenarios = () => axios.post(`/api/timeline/${timelineID}/scenarios`, {scenarios: checked})
    .then(onScenariosAdded)
    .then(() => setChecked([]))
    .then(() => setScenarios([]))
    .catch((e:any) => console.log('something went wrong while adding scenarios', e))

  const createScenario = (scenario:any) => (
    <ListItem key={scenario.id} button>
      <ListItemAvatar>
        <Avatar><PersonIcon/></Avatar>
      </ListItemAvatar>
      <ListItemText id={scenario.id} primary={scenario.name} secondary={scenario.description} />
      <ListItemSecondaryAction>
          <Checkbox
            edge="end"
            onChange={handleToggle(scenario.id)}
            checked={checked.indexOf(scenario.id) !== -1}
            inputProps={{ 'aria-labelledby': scenario.id }}
            color="primary"
          />
      </ListItemSecondaryAction>
    </ListItem>
  )

  const renderScenarioList = () => {
    if (loadingScenarios) {
      return (
        <div className={classes.list}>
          {range(6).map((elem:number) => ( <Skeleton key={elem} animation="wave" /> ))}
        </div>
      )
    }

    return (<List className={classes.list}>{scenarios.map(createScenario)}</List>)
  }

  return (
      <Dialog open={open} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Add Scenarios</DialogTitle>
        <DialogContent>
          {renderScenarioList()}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {closeHandler(false);}} color="primary">
            Cancel
          </Button>
          <Button onClick={addScenarios} color="primary">
            Add Scenarios
          </Button>
        </DialogActions>
      </Dialog>
  );
}

export default NewScenarioDialog;
