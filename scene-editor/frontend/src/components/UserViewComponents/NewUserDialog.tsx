import React, {useState} from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import LinearProgress from '@mui/material/LinearProgress';
import axios from "axios";


type NewUserDialog = {
    open: boolean;
    closeHandler: any;
    onUserCreated: any;
    userID: string;
};

const NewUserDialog: React.FC<NewUserDialog> = ({open, userID, closeHandler, onUserCreated}) => {
  const [name, setName] = useState("")
  const [accessCode, setAccessCode] = useState("")
  const [tag, setTag] = useState("")
  
  const createUser = async () => {
    axios
      .post(`/api/customer/create`, {name, tag, access_code: accessCode, therapist_id: userID})
      .then((res) => { 
        setName(""); 
        setAccessCode("");
        setTag("")
        onUserCreated();
      })
      .catch((e) => {
        console.log(e)
    });
  }; 

  const handleChange = (f:any) => (event: any) => {
    f(event.target.value);
  };

  return (
      <Dialog open={open} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">New User</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="User Name"
            type="text"
            fullWidth
            value={name}
            onChange={handleChange(setName)}
            helperText="Please fill in the name of the user"
          />
          <TextField
            margin="dense"
            id="tag"
            label="User Tag"
            type="text"
            fullWidth
            value={tag}
            onChange={handleChange(setTag)}
            helperText="Please fill in the unique tag of the user"
          />
          <TextField
            margin="dense"
            id="name"
            label="Access Code"
            type="text"
            fullWidth
            value={accessCode}
            onChange={handleChange(setAccessCode)}
            helperText="Please fill in the access code of the user"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setName("");
            setAccessCode("");
            setTag("")
            closeHandler(false);
          }} color="primary">
            Cancel
          </Button>
          <Button onClick={createUser} color="primary">
            Create
          </Button>
        </DialogActions>
      </Dialog>
  );
}
export default NewUserDialog;
