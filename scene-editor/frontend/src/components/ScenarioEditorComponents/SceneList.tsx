import React from 'react';

import {range} from 'lodash';

import Avatar from "@mui/material/Avatar";
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import ListItemText from '@mui/material/ListItemText';
import Tooltip from '@mui/material/Tooltip';

import AddIcon from '@mui/icons-material/Add';
import ImageIcon from '@mui/icons-material/Image';
import Skeleton from '@mui/material/Skeleton';

type SceneListProps = {
  scenes: any;
  addHandler: any;
  isLoading: any;
}

const SceneList:React.FC<SceneListProps> = ({isLoading, scenes, addHandler}:SceneListProps) => {
  const createListItems = () => scenes.map((scene:any) => {
    const avatar = scene.video_id
      ? <Avatar src={`/api/asset/${scene.video_id}/thumbnail`} />
      : <Avatar><ImageIcon/></Avatar>

    return (
      <ListItem key={scene.id}>
        <ListItemAvatar>
          {avatar}
        </ListItemAvatar>
        <ListItemText
          primary={scene.name}
          secondary={scene.description}
        />
        <ListItemSecondaryAction>
          <Tooltip title="Add to Timeline">
            <IconButton edge="end" aria-label="add" onClick={addHandler(scene.id)} size="large">
              <AddIcon />
            </IconButton>
          </Tooltip>
        </ListItemSecondaryAction>
      </ListItem>
    );
  })

  const renderLoadingElement = () => range(6).map((elem:number) => ( <Skeleton key={elem} animation="wave" /> ))

  return isLoading ? (<Box sx={{ overflow: 'auto' }}>{renderLoadingElement()}</Box>) : (<List sx={{ overflow: 'auto' }}>{createListItems()}</List>)
}

export default SceneList