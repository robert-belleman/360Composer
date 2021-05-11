import React, {useState} from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Chip from '@material-ui/core/Chip';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import LinearProgress from '@material-ui/core/LinearProgress';
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
