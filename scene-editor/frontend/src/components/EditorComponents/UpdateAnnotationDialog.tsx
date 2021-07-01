import React, { useState, useEffect } from 'react';

import { concat } from 'lodash'

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
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
import Box from '@material-ui/core/Box';

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

type tempAction = {
  id?: string,
  payload: any,
  type: string
}

type tempOption = {
  action: tempAction
  feedback: string
  id?: string,
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

type AnnotationType = {
  id: number;
  text: string;
};

const valueLabelFormat = (value:number) => {
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60);

  const minutesLabel = minutes < 10 ? `0${minutes}` : minutes
  const secondsLabel = seconds < 10 ? `0${seconds}` : seconds

  return `${minutesLabel}:${secondsLabel}`
}

const movementOptions: Array<string> = ["Geknikt", "Geschud", "Geen reactie"]
const blowingOptions: Array<string> = ["Geblazen", "Geen reactie"]

let addQueue: Array<string> = []
let deleteQueue: Array<string> = []
let tempId = 0
let initialOptions: Array<string> = []
let types: Array<AnnotationType> = []

export default ({sceneID, annotationID, open, closeHandler, onError, videoLength}:UpdateAnnotationDialogProps) => {
  const [annotation, setAnnotation] = useState(INITIAL_ANNOTATION)
  const [defaultOptions, setDefaultOptions] = useState(false);

  useEffect(() => {
    fetchAnnotation()
    const getAnnotationTypes = () => {
      axios.get(`/api/annotation/types`)
        .then((res) => types = res.data)
        .catch((e) => console.log(e))
    }

    getAnnotationTypes()
  }, [])

  useEffect (() => {
    if (!annotation.options.length) {
      if (annotation.type === 1) {
        handleAddOptions(null, movementOptions)
      } else if (annotation.type === 2) {
        handleAddOptions(null, blowingOptions)
      }
    }
  }, [annotation.options])

  useEffect(() => {
    /* This function is based on:
     * https://stackoverflow.com/questions/6229197/how-to-know-if-two-arrays-have-the-same-values
     */
    const equals = (_arr1: string[], _arr2: string[]) => {
      if (!Array.isArray(_arr1)
          || !Array.isArray(_arr2)
          || _arr1.length !== _arr2.length) {
        return false
      }
      const arr1 = _arr1.concat().sort()
      const arr2 = _arr2.concat().sort()

      for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) {
          return false
        }
      }

      return true
    }

    const ids = annotation.options.map(option => option.id)
    const texts = annotation.options.map(option => option.text)


    if (annotation.type === 1) {
      if (!equals(texts, movementOptions)) {
        handleDeleteOptions(null, ids)
      }
    }
    else if (annotation.type === 2) {
      if (!equals(texts, blowingOptions)) {
        handleDeleteOptions(null, ids)
      }
    }
  }, [annotation.type])

  const fetchAnnotation = () => {
    axios.get(`/api/scenes/${sceneID}/annotation?id=${annotationID}`)
      .then((res) => res.data)
      .then((data) => {
        setAnnotation(data)
        if (data.type == 1 || data.type == 2) {
          setDefaultOptions(true)
        }

        const options: string[] = []
        data.options.forEach((option: Option) => {
          options.push(option.id)
        })
        initialOptions = options
      })
  }

  const handleDescriptionChange = (event: any) => {
    setAnnotation({...annotation, text: event.target.value});
  }

  const handleTypeChange = (event: any) => {
    setAnnotation({...annotation, type: event.target.value})
    if (event.target.value === 1 || event.target.value === 2) {
      setDefaultOptions(true)
    }
    else {
      setDefaultOptions(false)
    }
  }

  const handleOptionChange = (index: number, event: any) => {
    // TODO: check if this will scale for many options
    const newList: Option[] = annotation.options.map((option: Option, i: number) => {
      if (i === index) {
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

  const commitDeleteOptions = () => {
    const deleteOption = (id: string) => {
      axios.post(`/api/annotation/${annotationID}/option/delete`, {id})
        .then(() => {})
        .catch((e) => {console.log(e)})
    }

    const promise = new Promise((resolve, reject) => {
      deleteQueue.forEach((id) => {
        if (initialOptions.includes(id)) {
          deleteOption(id)
        }
      })
      resolve(1)
    })

    return promise
  }

  const handleDeleteOptions = async (event: any, ids: string[]) => {
    if (event) {
      event.preventDefault();
    }

    const newDeleteQueue = deleteQueue
    const newAddQueue = addQueue
    const newList = annotation.options.filter((item: Option) => !ids.includes(item.id))

    ids.forEach((id) => {
      if (initialOptions.includes(id)) {
        newDeleteQueue.push(id)
      } else {
        const index = newAddQueue.indexOf(id)
        if (index > -1) {
          newAddQueue.splice(index, 1)
        }
      }
    })

    return new Promise ((resolve, reject) => {
      setAnnotation({...annotation, options: newList})
      addQueue = newAddQueue
      deleteQueue = newDeleteQueue
      setAnnotation({...annotation, options: newList})
      resolve(1)
    })
  }

  const commitAddOptions = () => {
    const promise = new Promise((resolve, reject) => {
      const newOptions: Option[] = []

      addQueue.forEach((id) => {
        const option = annotation.options.find(option => {
          return option.id === id
        })

        if (option) {
          const newOption = option as tempOption
          delete newOption.id
          delete newOption.action.id

          axios.post(`/api/annotation/${annotationID}/options`, {text: option.text, feedback: option.feedback, scene_id: sceneID, action: { type: "next_scene", payload: null}})
            .then((res:any) => res.data)
            .then((option:any) => {
              handleDeleteOptions(null, [id])
              newOptions.push(option)
            })
            .catch((e:any) => console.log(e))
        }
      })

      setAnnotation({...annotation, options: (concat(annotation.options, newOptions))})
      resolve(1)
    })

    return promise
  }

  const handleAddOptions = (event: any, textVals: string[]) => {
    const newOptions = annotation.options.concat()
    const newAddQueue = addQueue.concat()
    let i = 0
    let newId: number
    textVals.forEach((text) => {
      newId = tempId + i
      newAddQueue.push(newId.toString())
      newOptions.push({id: newId.toString(), text: text, feedback: "", action: { id: "", type: "next_scene", payload: null}})
      i++
    })

    tempId += i
    addQueue = newAddQueue
    setAnnotation({...annotation, options: newOptions})
  }

  const updateOptions = () => {
    // TODO: fix
    //@ts-ignore
    const put = (option:any) => axios.put(`/api/annotation/${annotation.id}/options`, {...option})

    const updatedOptions = annotation.options.filter((option) => {
      return initialOptions.includes(option.id)
    })

    return Promise.all([updatedOptions.map(put)])
  }

  const updateAnnotation = () => {
    return axios.put(`/api/scenes/${sceneID}/annotation`, annotation)
      .catch((e) => console.log(e))
  }

  const reset = () => {
    addQueue = []
    deleteQueue = []
    tempId = 0
    fetchAnnotation()
  }

  const save = () => {
    commitDeleteOptions()
      .then(() => commitAddOptions())
      .then(() => updateOptions())
      .then(updateAnnotation)
      .then(() => reset())
      .then(() => closeHandler(true))
      .catch((e) => onError())
  }

  const cancel = () => {
    reset()
    closeHandler(false)
  }

  const updateTimestamp = (event: any, value: number | number[]) => {
    const timestamp = value as number
    setAnnotation({...annotation, timestamp: timestamp})
  }

  const typeSelection = () => {
    return (
      <TextField
        select
        label="Type"
        value={annotation.type}
        onChange={handleTypeChange}
        helperText="Select the annotation type"
      >
        {types.map((type: AnnotationType) => (
          <MenuItem key={type.id} value={type.id}>
            {type.text}
          </MenuItem>
        ))}
      </TextField>
    )
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
                        disabled={defaultOptions}
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
                  <Box display={defaultOptions ? "none" : "block"}>
                    <ListItemSecondaryAction>
                      <IconButton edge="end" aria-label="delete"
                        onClick={(event) => {
                          handleDeleteOptions(event, [option.id]);
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </Box>
                </ListItem>
              ))}
              <Box display={defaultOptions ? "none" : "block"}>
                <ListItem autoFocus button onClick={(event) => handleAddOptions(event, [""])}>
                  <ListItemAvatar>
                    <Avatar>
                      <AddIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText primary="Add Option" />
                </ListItem>
              </Box>
          </List>
      </div>
    )
  }

  return (
      <Dialog open={open} aria-labelledby="form-dialog-title" fullWidth={true} maxWidth="xl">
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
              {typeSelection()}
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
          <Button onClick={() => cancel()} color="primary">
            Cancel
          </Button>
          <Button onClick={save} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
  );
}
