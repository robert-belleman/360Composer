import React, {useState, useEffect} from 'react';

import { makeStyles, createStyles } from '@mui/styles';
import { createTheme, ThemeProvider } from '@mui/material/styles';

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

type NewSceneDialog = {
  projectID: string;
  scenarioID: string;
  open: boolean;
  closeHandler: any;
  onScenesAdded: any;
};

const NewSceneDialog: React.FC<NewSceneDialog> = ({projectID, scenarioID, open, closeHandler, onScenesAdded}) => {
  const [scenes, setScenes] = useState([] as any);
  const [checked, setChecked] = useState([] as any[]);
  const [loadingScenes, setLoadingScenes] = useState(true);

  const classes = useStyles();

  useEffect(() => {
    fetchScenes();
  }, [open])

  const setScenesCallback = (fetchedScenes:any) => {
    console.log('fetchedScenes@@', fetchedScenes)
    setScenes(fetchedScenes);
  }

  const fetchScenes = () => {
    axios.get(`/api/project/${projectID}/scenes`)
      .then((res:any) => setScenesCallback(res.data))
      .then(() => setLoadingScenes(false))
      .catch((e:any) => {console.log('error while fetching scenes', e); setLoadingScenes(false)})
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

  const addScenes = () => {
    const requests = checked.map((id:string, i:number) => 
      axios.post(`/api/scenario/${scenarioID}/scenes`, {scene_id: id, position_x: i * 50, position_y: 0})
    )
    
    return Promise.all(requests)
      .then((res:any) => onScenesAdded(res.map((o:any) => o.data)))
      .then(() => setChecked([]))
      .then(() => setScenes([]))
      .catch((e:any) => console.log('something went wrong while adding scenarios', e))
  }

  const createScene = (scene:any) => (
    <ListItem key={scene.id} button>
      <ListItemAvatar>
        <Avatar><PersonIcon/></Avatar>
      </ListItemAvatar>
      <ListItemText id={scene.id} primary={scene.name} secondary={scene.description} />
      <ListItemSecondaryAction>
          <Checkbox
            edge="end"
            onChange={handleToggle(scene.id)}
            checked={checked.indexOf(scene.id) !== -1}
            inputProps={{ 'aria-labelledby': scene.id }}
            color="primary"
          />
      </ListItemSecondaryAction>
    </ListItem>
  )

  const renderSceneList = () => {
    if (loadingScenes) {
      return (
        <div className={classes.list}>
          {range(6).map((elem:number) => ( <Skeleton key={elem} animation="wave" /> ))}
        </div>
      )
    }

    return (<List className={classes.list}>{scenes.map(createScene)}</List>)
  }

  return (
      <Dialog open={open} aria-labelledby="form-dialog-title" style={{zIndex: 99999}}>
        <DialogTitle id="form-dialog-title">Add Scenes</DialogTitle>
        <DialogContent>
          {renderSceneList()}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {closeHandler(false);}} color="primary">
            Cancel
          </Button>
          <Button onClick={addScenes} color="primary">
            Add Scenes
          </Button>
        </DialogActions>
      </Dialog>
  );
}

export default NewSceneDialog;
