import React, {useState} from 'react';
import { useSelector } from 'react-redux';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import axios from "axios";

type NewSceneDialogProps = {
    activeProject: string;
    open: boolean;
    closeHandler: any;
    onSceneCreated: any;
};

const NewAssetDialog: React.FC<NewSceneDialogProps> = ({activeProject, open, closeHandler, onSceneCreated}) => {
  const token = useSelector((state:any) => state.token)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")

  const createScene = async () => {

    const payload = {
        "name": name,
        "description": description,
        "user_id": token.id,
    }

    axios
      .post(`/api/project/` + activeProject + `/scenes`, payload )
      .then((res) => {  
          setDescription(""); 
          setName(""); 
          onSceneCreated(); 
      })
      .catch((e) => {
        console.log(e)
    });
  }; 


  const handleNameChange = (event: any) => {
    setName (event.target.value);
  };

  const handleDescriptionChange = (event: any) => {
      setDescription(event.target.value);
  }
  return (
      <Dialog open={open} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">New Project</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please enter a name and description for the scene below.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Scene Name"
            type="text"
            fullWidth
            value={name}
            onChange={handleNameChange}
          />
          <TextField
            margin="dense"
            id="name"
            label="Scene Description"
            type="text"
            fullWidth
            value={description}
            onChange={handleDescriptionChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {setName(""); setDescription(""); closeHandler(false)} } color="primary">
            Cancel
          </Button>
          <Button onClick={createScene} color="primary">
            Create
          </Button>
        </DialogActions>
      </Dialog>
  );
}
export default NewAssetDialog;
