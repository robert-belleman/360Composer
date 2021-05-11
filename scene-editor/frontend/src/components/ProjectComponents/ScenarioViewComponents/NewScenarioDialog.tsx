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

type NewScenarioDialogProps = {
    activeProject: string;
    open: boolean;
    closeHandler: any;
    onScenarioCreated: any;
    onScenarioCreationFailed:any;
};

const NewScenarioDialog: React.FC<NewScenarioDialogProps> = ({activeProject, open, closeHandler, onScenarioCreated, onScenarioCreationFailed}) => {
  const token = useSelector((state:any) => state.token)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")

  const createScenario = async () => {

    const payload = {
        "name": name,
        "description": description,
    }

    axios
      .post(`/api/project/${activeProject}/scenarios`, payload )
      .then((res) => {
          setName(""); 
          setDescription(""); 
          onScenarioCreated(); 
      })
      .catch((e) => {
        onScenarioCreationFailed();
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
        <DialogTitle id="form-dialog-title">New Scenario</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please enter a name and description for the scenario below.
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
          <Button onClick={createScenario} color="primary">
            Create
          </Button>
        </DialogActions>
      </Dialog>
  );
}
export default NewScenarioDialog;
