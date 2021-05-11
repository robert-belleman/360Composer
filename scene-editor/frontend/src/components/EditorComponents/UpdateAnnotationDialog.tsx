import React, {useState, useEffect} from 'react';

import { concat } from 'lodash'

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Divider from '@material-ui/core/Divider';

import Avatar from '@material-ui/core/Avatar';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Slider from '@material-ui/core/Slider'
import Typography from '@material-ui/core/Typography'

import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';

import axios from "axios";

import "./NewAnnotationDialog.scss";
import Annotation from './Annotation';

type Annotation = {
  id: string,
  options: Option[],
  scene_id: string,
  text: string,
  timestamp: number,
  type: number,
}

type Option = {
  action: Action,
  feedback: string,
  id: string,
  text: string
}

type Action = {
  id: string,
  payload: any,
  type: string
}

const INITIAL_ANNOTATION: Annotation = {
  id: "",
  options: [],
  scene_id: "",
  text: "",
  timestamp: 0,
  type: 0,
}

type UpdateAnnotationDialogProps = {
    sceneID: string;
    annotationID: string;
    open: boolean;
    closeHandler: any;
    videoLength: number;
    onError: any;
};

const valueLabelFormat = (value:number) => {
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60);

  const minutesLabel = minutes < 10 ? `0${minutes}` : minutes
  const secondsLabel = seconds < 10 ? `0${seconds}` : seconds

  return `${minutesLabel}:${secondsLabel}`
}

export default ({sceneID, annotationID, open, closeHandler, onError, videoLength}:UpdateAnnotationDialogProps) => {
  useEffect(() => {
    fetchAnnotation()
  }, [])

  const [annotation, setAnnotation] = useState(INITIAL_ANNOTATION)

  const fetchAnnotation = () => {
    axios.get(`/api/scenes/${sceneID}/annotation?id=${annotationID}`)
      .then((res) => res.data)
      .then((data) => {
        setAnnotation(data)
      })
  }

  const handleDescriptionChange = (event: any) => {
    setAnnotation({...annotation, text: event.target.value});
  }

  const handleTypeChange = (event: any) => {
    setAnnotation({...annotation, type: event.target.value});
  }

  const handleOptionChange = (index: number, event: any) => {
    // TODO: check if this will scale for many options
    console.log(`comes here for ${index} ${event.target.value}`)
    const newList: Option[] = annotation.options.map((option: Option, i: number) => {
      if (i === index) {
        console.log('option', option)
        return {
          ...option,
          text: event.target.value,
        }
      } else {
        return option
      }
    })

    setAnnotation({...annotation, options: newList})
  }

  const handleFeedbackChange = (index: number, event: any) => {
    // TODO: check if this will scale for many options
    const newList: Option[] = annotation.options.map((option: Option, i: number) => {
      if (i === index) {
        return {
          ...option,
          feedback: event.target.value,
        }
      } else {
        return option
      }
    })

    setAnnotation({...annotation, options: newList})
  }

  const handleDeleteOption = (id:string) => (event: any) => {
    event.preventDefault();

    const deleteOption = (id:string) => {
      const newList = annotation.options.filter((item: Option, i: number) => item.id !== id);
      setAnnotation({...annotation, options: newList})
    }

    axios.post(`/api/annotation/${annotationID}/option/delete`, {id})
      .then(() => deleteOption(id))
      .catch((e) => console.log(e))
  }

  const handleAddOption = (event: any) => {
    //@ts-ignore
    axios.post(`/api/annotation/${annotationID}/options`, {text: "", feedback: "", scene_id: sceneID, action: { type: "next_scene", payload: null}})
      .then((res:any) => res.data)
      .then((option:any) => setAnnotation({...annotation, options: (concat(annotation.options, option))}))
      .catch((e:any) => console.log(e))
  }

  const updateOptions = () => {
    // TODO: fix
    //@ts-ignore
    const put = (option:any) => axios.put(`/api/annotation/${annotation.id}/options`, {...option})

    return Promise.all([annotation.options.map(put)])
  }

  const updateAnnotation = () => {
    return axios.put(`/api/scenes/${sceneID}/annotation`, annotation)
      .then((res:any) => console.log(res))
      .catch((e) => console.log(e))
  }

  const save = () => {
    updateOptions()
      .then(updateAnnotation)
      .then(() => closeHandler(true))
      .catch((e) => onError())
  }

  const updateTimestamp = (event: any, value: number | number[]) => {
    const timestamp = value as number
    setAnnotation({...annotation, timestamp: timestamp})
  }

  const optionTable = () => {
    return (
        <div>
            <List>
              {annotation.options.map((option:Option, index:number) => (
                <ListItem key={index}>
                  <ListItemAvatar>
                    <Avatar >
                      {index + 1}
                    </Avatar>
                  </ListItemAvatar>
                  <Grid container>
                    <Grid item xs={6} style={{padding: 5}}>
                      <TextField
                        className={"textField"}
                        size="medium"
                        label="Option"
                        helperText="This will be displayed as the text of the option"
                        multiline
                        fullWidth
                        rowsMax={4}
                        value={option.text}
                        onChange={(event) => {handleOptionChange(index, event)}}
                      />
                    </Grid>
                    <Grid item xs={6} style={{padding: 5}}>
                      <TextField
                        className={"textField"}
                        size="medium"
                        label="Feedback"
                        helperText="This will be shown after choosing this option"
                        value={option.feedback}
                        multiline
                        fullWidth
                        rowsMax={4}
                        onChange={(event) => {handleFeedbackChange(index, event)}}
                        />
                    </Grid>
                  </Grid>
                  <ListItemSecondaryAction>
                    <IconButton edge="end" aria-label="delete" onClick={handleDeleteOption(option.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>

                </ListItem>
              ))}
               <ListItem autoFocus button onClick={handleAddOption}>
                <ListItemAvatar>
                    <Avatar>
                    <AddIcon />
                    </Avatar>
                </ListItemAvatar>
                <ListItemText primary="Add Option" />
              </ListItem>
          </List>
      </div>
    )
  }


  return (
      <Dialog open={open} aria-labelledby="form-dialog-title" fullWidth={true} maxWidth="xl" style={{zIndex: 9999}}>
        <DialogTitle id="form-dialog-title">Update Annotation</DialogTitle>
        <DialogContent>
          <DialogContentText>
          </DialogContentText>
          <Grid container>
            <Grid item xs={12}><Typography variant="subtitle1">Annotation</Typography></Grid>
            <Grid item xs={12}><Divider style={{marginTop: 10, marginBottom: 10}} /></Grid>
            <Grid item xs={12} style={{padding: 15}}>
              <TextField
                autoFocus
                margin="dense"
                id="name"
                label="Annotation"
                type="text"
                fullWidth
                value={annotation.text}
                onChange={handleDescriptionChange}
              />
              <Typography variant="body1">Select the annotation type: </Typography>
                <select id="select-annotation-type" onChange={handleTypeChange} value={annotation.type}>
                  <option value="0" >Tekst</option>
                  <option value="1">Beweging</option>
                  <option value="2">Blazen</option>
                  <option value="3">Klinkers</option>
                  <option value="4">Woorden</option>
                </select>
            </Grid>
          </Grid>
          <Grid container style={{marginTop: 20}}>
            <Grid item xs={12}><Typography variant="subtitle1">Options</Typography></Grid>
            <Grid item xs={12}><Divider style={{marginTop: 10, marginBottom: 10}} /></Grid>
            <Grid item xs={12}>
              {optionTable()}
            </Grid>
          </Grid>
          <Grid container style={{marginTop: 20}}>
            <Grid item xs={12}><Typography variant="subtitle1">Timestamp</Typography></Grid>
            <Grid item xs={12}><Divider style={{marginTop: 10, marginBottom: 10}} /></Grid>
            <Grid item xs={1} style={{marginTop: 30, textAlign: 'center'}}>
              <p>Start: 00:00</p>
            </Grid>
            <Grid item xs={10}>
              <Slider
                  value={annotation.timestamp}
                  defaultValue={0}
                  min={0}
                  max={videoLength}
                  valueLabelFormat={valueLabelFormat}
                  onChange={updateTimestamp}
                  step={0.1}
                  valueLabelDisplay="on"
                  style={{marginTop: 40}}
                />
            </Grid>
              <Grid item xs={1} style={{marginTop: 30, textAlign: 'center'}}>
                <p>End: {valueLabelFormat(videoLength)}</p>
              </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => closeHandler(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={save} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
  );
}
