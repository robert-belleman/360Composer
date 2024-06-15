import React, {useState} from 'react';

import { range } from 'lodash';

//import { Container, Draggable } from "react-smooth-dnd";

import { createTheme } from '@mui/material/styles';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';

import DragHandleIcon from '@mui/icons-material/DragHandle';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

import Skeleton from '@mui/material/Skeleton';

import TimelineAddScenarioDialog from './TimelineAddScenarioDialog';

const theme = createTheme();

type ScenarioListProps = {
  timelineID: string;
  projectID: string;
  randomized: boolean;
  timelineScenarios: any[];
  onScenariosAdded: any;
  deleteCheckedScenarios: any;
  loadingTimelineScenarios: any;
  onSortEnd: any;
}

const TimelineScenarioList:React.FC<ScenarioListProps> = ({
  projectID,
  timelineID,
  randomized,
  timelineScenarios,
  onScenariosAdded,
  deleteCheckedScenarios,
  onSortEnd,
  loadingTimelineScenarios
}:ScenarioListProps) => {
  const [scenarioDialogOpen, setScenarioDialogOpen] = useState(false);
  const [checked, setChecked] = useState([] as any[])

  const handleToggle = (value: number) => () => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
  };

  const onScenariosAdded_ = () => {
    setScenarioDialogOpen(false);
    onScenariosAdded()
  }


  const ScenarioItem = ({scenario, i}:any) => (
    <ListItem key={`${scenario.id}-${i}`} button>
      <ListItemAvatar className="drag-handle">
        <DragHandleIcon/>
      </ListItemAvatar>
      <ListItemText
        id={scenario.id}
        primary={`${!randomized ? `${i+1}. ` : ''}${scenario.scenario.name}`}
        secondary={scenario.scenario.description} 
      />
      <ListItemSecondaryAction>
          <Checkbox
            edge="end"
            onChange={handleToggle(scenario.id)}
            checked={checked.indexOf(scenario.id) !== -1}
            inputProps={{ 'aria-labelledby': scenario.id }}
          />
      </ListItemSecondaryAction>
    </ListItem>
  )

  const ScenarioList = ({scenarios} :any) => (
    <List sx={{ height: 300, width: 400, overflow: 'auto' }}>
      {/*<Container dragHandleSelector=".drag-handle" lockAxis="y" onDrop={onSortEnd}>
        {scenarios.map((scenario:any, i:number) => (
          <Draggable key={scenario.id}>
            <ScenarioItem key={scenario.id} i={i} scenario={scenario} />
          </Draggable>
        ))}
      </Container>*/}
    </List>
  )

  const renderScenarios = () => {
    if (timelineScenarios.length === 0) {
      return <Box sx={{ height: 300, width: 400, overflow: 'auto' }}><Typography variant="subtitle1" component="p">No scenarios have been added yet</Typography></Box>
    }

    return <ScenarioList scenarios={timelineScenarios} onSortEnd={onSortEnd} useDragHandle/>
  }

  const deleteChecked = () => deleteCheckedScenarios(checked)
    .then(() => setChecked([]))

  const renderScenariosList = () => {
    if (loadingTimelineScenarios) {
      return (
        <Box sx={{ height: 300, width: 400, overflow: 'auto' }}>
          {range(6).map((elem:number) => ( <Skeleton key={elem} animation="wave" /> ))}
        </Box>
      )
    }

    return renderScenarios();
  }

  return (
    <Paper elevation={0} variant="outlined"
    sx={{
      padding: theme.spacing(2),
      boxSizing: 'border-box'
    }}
    >
      <Typography variant="h4" component="p"
        sx={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          fontSize: '1.1rem',
          fontWeight: 700,
          color: '#2196f3',
          marginBottom: 10
        }}
      >
        <AccountTreeIcon style={{marginRight:5}}/> Scenarios
      </Typography>
      {renderScenariosList()}
      <Grid container>
        <Grid item xs={4}>
          <Button style={{marginTop: 10}} color="primary" startIcon={<AddIcon />} onClick={() => setScenarioDialogOpen(true)}>Add</Button>
        </Grid>
        <Grid item xs={2}>
          <Box sx={{ flexGrow: 1 }}></Box>
        </Grid>
        <Grid item xs={6}>
          <Button 
            style={{marginTop: 10}}
            color="secondary"
            startIcon={<DeleteIcon />}
            disabled={checked.length === 0}
            onClick={deleteChecked}>Remove</Button>
        </Grid>
      </Grid>
      <TimelineAddScenarioDialog
        projectID={projectID!}
        timelineID={timelineID}
        open={scenarioDialogOpen}
        closeHandler={() => setScenarioDialogOpen(false)}
        onScenariosAdded={onScenariosAdded_}
        addedScenarios={timelineScenarios.map((scenario:any) => scenario.id)}
      />
    </Paper>
  )
}

export default TimelineScenarioList;