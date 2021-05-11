import React, {useState} from 'react';
import { useSelector } from 'react-redux';

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import axios from "axios";

type NewProjectDialogProps = {
    open: boolean;
    closeHandler: any;
    onProjectCreated: any;
};



const NewProjectDialog: React.FC<NewProjectDialogProps> = ({open, closeHandler, onProjectCreated}) => {
  const token = useSelector((state:any) => state.token);
  const [text, setText] = useState("");

  const createProject = async () => {
      axios
          .post(`/api/project/create`, {'id': token.id, 'name': text} )
          .then((res) => {console.log(res); onProjectCreated() })
          .catch(() => {
              // setError(true);
          });
  }; 

  const handleChange = (event: any) => {
    setText (event.target.value);
  };
  return (
      <Dialog open={open} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">New Project</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please enter a the title for the project below.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Project Title"
            type="text"
            fullWidth
            value={text}
            onChange={handleChange}

          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {closeHandler(false)} } color="primary">
            Cancel
          </Button>
          <Button onClick={createProject} color="primary">
            Create
          </Button>
        </DialogActions>
      </Dialog>
  );
}
export default NewProjectDialog;
