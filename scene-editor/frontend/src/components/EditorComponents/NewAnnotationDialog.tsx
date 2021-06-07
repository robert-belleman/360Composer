import React, {useState} from 'react';

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import Avatar from '@material-ui/core/Avatar';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Grid from '@material-ui/core/Grid'

import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';

import axios from "axios";

import "./NewAnnotationDialog.scss";
import { Typography } from '@material-ui/core';

const valueLabelFormat = (value:number) => {
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60);

  const minutesLabel = minutes < 10 ? `0${minutes}` : minutes
  const secondsLabel = seconds < 10 ? `0${seconds}` : seconds

  return `${minutesLabel}:${secondsLabel}`
}

type NewAnnotationDialogProps = {
    sceneID: string;
    timeStamp: number;
    open: boolean;
    closeHandler: any;
    onAnnotationCreated: any;
};

const NewAnnotationDialog: React.FC<NewAnnotationDialogProps> = ({sceneID, timeStamp, open, closeHandler, onAnnotationCreated}) => {
  type AnnotationOption = {
    value: string;
    feedback: string;
  }
  const [options, setOptions] : any = useState([]);
  const [question, setQuestion] = useState("");
  const [type, setType] = useState(0);

  const createAnnotation = async () => {

    const payload = {
        text: question,
        timestamp: timeStamp,
        type: type,
    }

    axios.post(`/api/scenes/${sceneID}/annotation`, payload)
      .then((res) => {
        // After creating an annotation, post the options
        options.forEach((opt: any) => {
          const optionPayload ={
            text: opt.value,
            feedback: opt.feedback,
            action: { type: "next_scene", payload: null},
            scene_id: sceneID
          };

          axios.post(`/api/annotation/${res.data.id}/options`, optionPayload)
            .catch((e) => console.log(e))
        })

        // reset the dialog
        setOptions([]);
        setQuestion("");
        setType(0);
        closeHandler(false);
        onAnnotationCreated();
      })
      .catch((e) => console.log(e))

  };

  const handleDescriptionChange = (event: any) => {
    setQuestion(event.target.value);
  }

  const handleTypeChange = (event: any) => {
    setType(event.target.value)
  }

  const handleOptionChange = (index: number, event: any) => {
    // TODO: check if this will scale for many options
    const newList = options.map((option: AnnotationOption, i: number) => {
      if (i === index) {
        return {
          value: event.target.value,
          feedback: option.feedback
        }
      } else {
        return option
      }
    })

    setOptions(newList);
  }

  const handleFeedbackChange = (index: number, event: any) => {
    // TODO: check if this will scale for many options
    const newList = options.map((option: AnnotationOption, i: number) => {
      if (i === index) {
        return {
          value: option.value,
          feedback: event.target.value,
        }
      } else {
        return option
      }
    })

    setOptions(newList);
  }

  const handleDeleteOption = (index: number) => {
    const newList = options.filter((item: AnnotationOption, i: number) => index !== i);
    setOptions(newList);
  }

  const handleAddOption = (event: any) => {
    const opt: AnnotationOption = {
      value: "",
      feedback: ""
    }

    setOptions([
      ...options,
      opt
    ])
  }

  const optionTable = () => {
    return (
        <div>
            <List>
              {options.map((option:AnnotationOption, index:number) => (
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
                        size="small"
                        label="Option"
                        multiline
                        fullWidth
                        rowsMax={4}
                        helperText="This will be displayed as the text of the option"
                        value={option.value}
                        onChange={(event) => {handleOptionChange(index, event)}}
                      />
                    </Grid>
                    <Grid item xs={6} style={{padding: 5}}>
                      <TextField
                        className={"textField"}
                        size="small"
                        label="Feedback"
                        multiline
                        fullWidth
                        rowsMax={4}
                        helperText="This will be shown after choosing this option"
                        value={option.feedback}
                        onChange={(event) => {handleFeedbackChange(index, event)}}
                      />
                    </Grid>
                  </Grid>
                  <ListItemSecondaryAction>
                    <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteOption(index)}>
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
      <Dialog open={open} aria-labelledby="form-dialog-title" fullWidth={true} maxWidth={"xl"}>
        <DialogTitle id="form-dialog-title">New Annotation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Annotation will be added at <b>{valueLabelFormat(timeStamp)}</b>.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Annotation"
            type="text"
            fullWidth
            value={question}
            onChange={handleDescriptionChange}
          />
          <Typography variant="body1">Select the annotation type: </Typography>
          <select id="select-annotation-type" onChange={handleTypeChange}>
            <option value="0">Tekst</option>
            <option value="1">Knikken/schudden</option>
            <option value="2">Blazen</option>
            <option value="3">Anders</option>
          </select>
          {optionTable()}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {closeHandler(false)} } color="primary">
            Cancel
          </Button>
          <Button onClick={createAnnotation} color="primary">
            Create
          </Button>
        </DialogActions>
      </Dialog>
  );
}
export default NewAnnotationDialog;
