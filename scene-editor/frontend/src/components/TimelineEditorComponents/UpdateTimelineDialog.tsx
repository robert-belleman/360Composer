import React, {useState, useEffect} from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import axios from "axios";

type UpdateTimelineDialogProps = {
    timeline: any;
    open: boolean;
    closeHandler: any;
    onTimelineUpdated: any;
};

const UpdateTimelineDialog: React.FC<UpdateTimelineDialogProps> = ({timeline, open, closeHandler, onTimelineUpdated}) => {
  const [state, setState] = useState(timeline)

  const updateTimeline = async () => {
    const payload = {...timeline, "name": state.name, "description": state.description}

    axios.put(`/api/timeline/${timeline.id}/`, payload )
      .then(() => {
          setState({name: "", description: ""})
          onTimelineUpdated(); 
      })
      .catch((e) => {
        console.log(e)
    });
  }; 

  useEffect(() => {
    setState(timeline)
  }, [timeline])

  const handleNameChange = (event: any) => {
    setState({...state, name: event.target.value});
  };

  const handleDescriptionChange = (event: any) => {
      setState({...state, description: event.target.value});
  }
  return (
      <Dialog open={open} aria-labelledby="form-dialog-title" style={{zIndex: 9999}}>
        <DialogTitle id="form-dialog-title">Update Timeline</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please enter a name and description for the timeline below.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Scene Name"
            type="text"
            fullWidth
            value={state.name}
            onChange={handleNameChange}
          />
          <TextField
            margin="dense"
            id="description"
            label="Scene Description"
            type="text"
            fullWidth
            value={state.description}
            onChange={handleDescriptionChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {setState({name: "", description: ""}); closeHandler(false)} } color="primary">
            Cancel
          </Button>
          <Button onClick={updateTimeline} color="primary">
            Update
          </Button>
        </DialogActions>
      </Dialog>
  );
}
export default UpdateTimelineDialog;
