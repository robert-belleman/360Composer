import React, {useState, useEffect, forwardRef} from 'react';

import { createTheme, ThemeProvider } from '@mui/material/styles';

import {range} from 'lodash';

import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
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

import { api } from '../../util/api';

const theme = createTheme();

type NewSceneDialogType = {
  projectID: string;
  scenarioID: string;
  open: boolean;
  closeHandler: any;
  onScenesAdded: any;
};

const NewSceneDialog = forwardRef<HTMLDivElement, NewSceneDialogType>(({projectID, scenarioID, open, closeHandler, onScenesAdded}, ref) => {
  const [scenes, setScenes] = useState([] as any);
  const [checked, setChecked] = useState([] as any[]);
  const [loadingScenes, setLoadingScenes] = useState(true);

  const fetchScenes = () => {
    api.get(`/api/project/${projectID}/scenes`)
      .then((res:any) => setScenesCallback(res.data))
      .then(() => setLoadingScenes(false))
      .catch((e:any) => {console.log('error while fetching scenes', e); setLoadingScenes(false)})
  }

  useEffect(() => {
    fetchScenes();
  }, [open])

  const setScenesCallback = (fetchedScenes:any) => {
    console.log('fetchedScenes@@', fetchedScenes)
    setScenes(fetchedScenes);
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
      api.post(`/api/scenario/${scenarioID}/scenes`, {scene_id: id, position_x: i * 50, position_y: 0})
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
        <Box sx={{
          overflow: 'auto'
        }}>
          {range(6).map((elem:number) => ( <Skeleton key={elem} animation="wave" /> ))}
        </Box>
      )
    }

    return (<List sx={{ overflow: 'auto' }}>{scenes.map(createScene)}</List>)
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
});

export default NewSceneDialog;
