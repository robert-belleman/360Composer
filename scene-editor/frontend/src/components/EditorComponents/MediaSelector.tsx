import React, {useState, useEffect} from "react";

import { find } from 'lodash';

import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import Chip from '@material-ui/core/Chip';
import Avatar from '@material-ui/core/Avatar';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';

import axios from "axios";


type MediaSelectorProps = {
  sceneID: string;
  onMediaSelected: any;
  onMediaDeleted: any;
  media: never[];
  activeMedia: string | undefined;
}


const MediaSelector: React.FC<MediaSelectorProps> = ({sceneID, onMediaSelected, onMediaDeleted, media, activeMedia}) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedMediaID, setSelectedMediaID] = useState(activeMedia);

    const handleMediaDelete = () => {
      axios.put(`/api/scenes/${sceneID}/media`, {id: sceneID, video_id:null})
        .then(() => setSelectedMediaID(undefined))
        .then(onMediaDeleted)
        .catch((e) => console.log(e))
    }

    const handleSelectMedia = (m:any) => {
      axios.put(`/api/scenes/${sceneID}/media`, {id: sceneID, video_id:m.id})
        .then((res) => setSelectedMediaID(res.data.video_id))
        .then(() => setDialogOpen(false))
        .then(onMediaSelected)
        .catch((e) => console.log(e))
    }

    useEffect(() => {
      setSelectedMediaID(activeMedia)
    }, [activeMedia])

    // ******************************

    // Helpers
    const getVideo = () => find(media, (m:any) => m.id === selectedMediaID)

    const renderSelectedMedia = () => {
      const usedVideo = getVideo();
    
      return usedVideo 
        ? <Chip size="medium" clickable={false} label={usedVideo.name} onDelete={handleMediaDelete} />
        : <Typography variant="subtitle1" component="p">No media selected</Typography>
    }
    
    const mediaSelectionDialog = () => {
      const handleClose = () => setDialogOpen(false);
    
      return (
        <Dialog onClose={handleClose} aria-labelledby="simple-dialog-title" open={dialogOpen}>
          <DialogTitle id="simple-dialog-title">Choose 360° Media</DialogTitle>
          <List>
            {media.map((m:any) => (
              <ListItem button onClick={() => handleSelectMedia(m)} key={m.id}>
                <ListItemAvatar>
                  <Avatar src={`/api/asset/${m.id}/thumbnail`} alt={m.name} />
                </ListItemAvatar>
                <ListItemText primary={`Video: ${m.name}`} secondary={`Duration: ${formatDuration(m.duration)}`} />
              </ListItem>
            ))}
          </List>
        </Dialog>
      )
    }

    const formatDuration = (duration:number) => {
      const minutes = Math.floor(duration / 60);
      const seconds = duration % 60;
    
      return `${minutes} min ${seconds} sec`
    }

      
    return (
        <Grid container spacing={1} style={{marginTop: 20}}>
          <Grid item xs={6}>
            <Button
              variant="contained"
              color="primary"
              size="small"
              endIcon={<ArrowForwardIosIcon/>}
              onClick={() => setDialogOpen(true)}
            >
              Select media
            </Button>
          </Grid>
          <Grid item xs={6}>
            {renderSelectedMedia()}
          </Grid>
          {mediaSelectionDialog()}
        </Grid>
    )
}

export default MediaSelector;

