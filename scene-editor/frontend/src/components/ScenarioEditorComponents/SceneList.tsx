import React from 'react';

import {range} from 'lodash';

import Avatar from "@material-ui/core/Avatar";
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Tooltip from '@material-ui/core/Tooltip';

import AddIcon from '@material-ui/icons/Add';
import ImageIcon from '@material-ui/icons/Image';
import Skeleton from '@material-ui/lab/Skeleton';

import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
      list: {
        height: 200,
        overflow: 'auto'
      }
    })
  );


type SceneListProps = {
  scenes: any;
  addHandler:any;
  isLoading: any;
}

const SceneList:React.FC<SceneListProps> = ({isLoading, scenes, addHandler}:SceneListProps) => {
  const classes = useStyles();

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
            <IconButton edge="end" aria-label="add" onClick={addHandler(scene.id)}>
              <AddIcon />
            </IconButton>
          </Tooltip>
        </ListItemSecondaryAction>
      </ListItem>
    )
  })

  const renderLoadingElement = () => range(6).map((elem:number) => ( <Skeleton key={elem} animation="wave" /> ))

  return isLoading ? (<div className={classes.list}>{renderLoadingElement()}</div>) : (<List className={classes.list}>{createListItems()}</List>)
}

export default SceneList