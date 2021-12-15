import React, {useState, useEffect} from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import axios from "axios";

type UpdateScenarioDialogProps = {
    scenarioID: string;
    scenario: any;
    open: boolean;
    closeHandler: any;
    onScenarioUpdated: any;
};

const UpdateScenarioDialog: React.FC<UpdateScenarioDialogProps> = ({scenarioID, scenario, open, closeHandler, onScenarioUpdated}) => {
  const [state, setState] = useState(scenario)

  const updateScenario = async () => {
    const payload = {
        "name": state.name,
        "description": state.description,
    }

    axios
      .post(`/api/scenario/${scenarioID}/meta`, payload )
      .then(() => {
          setState({name: "", description: ""})
          onScenarioUpdated(); 
      })
      .catch((e) => {
        console.log(e)
    });
  }; 

  useEffect(() => {
    setState(scenario)
  }, [scenario])

  const handleNameChange = (event: any) => {
    setState({...state, name: event.target.value});
  };

  const handleDescriptionChange = (event: any) => {
      setState({...state, description: event.target.value});
  }
  return (
      <Dialog open={open} aria-labelledby="form-dialog-title" style={{zIndex: 9999}}>
        <DialogTitle id="form-dialog-title">Update Scenario</DialogTitle>
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
          <Button onClick={updateScenario} color="primary">
            Update
          </Button>
        </DialogActions>
      </Dialog>
  );
}
export default UpdateScenarioDialog;
