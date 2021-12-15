import React, {useState, useEffect} from "react";

import { find } from 'lodash';

import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

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

