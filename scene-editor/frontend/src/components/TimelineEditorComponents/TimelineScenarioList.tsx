import React, {useState} from 'react';

import { range } from 'lodash';

import { createTheme } from '@mui/material/styles';

import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

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
};

// React DnD Item type
const ItemType = "SCENARIO_ITEM";

// Scenario Item Component (Drag and Drop)
const ScenarioItem = ({ scenario, index, moveItem, checked, handleToggle }: any) => {
  const [, ref] = useDrag({
    type: ItemType,
    item: { index },
  });

  const [, drop] = useDrop({
    accept: ItemType,
    hover: (draggedItem: any) => {
      if (draggedItem.index !== index) {
        moveItem(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
  });

  return (
    <ListItem ref={(node) => ref(drop(node))} key={`${scenario.id}-${index}`} button>
      <ListItemAvatar className="drag-handle">
        <DragHandleIcon />
      </ListItemAvatar>
      <ListItemText
        id={scenario.id}
        primary={`${!scenario.randomized ? `${index + 1}. ` : ""}${scenario.scenario.name}`}
        secondary={scenario.scenario.description}
      />
      <ListItemSecondaryAction>
        <Checkbox
          edge="end"
          onChange={handleToggle(scenario.id)}
          checked={checked.indexOf(scenario.id) !== -1}
          inputProps={{ "aria-labelledby": scenario.id }}
        />
      </ListItemSecondaryAction>
    </ListItem>
  );
};

const TimelineScenarioList: React.FC<ScenarioListProps> = ({
  projectID,
  timelineID,
  randomized,
  timelineScenarios,
  onScenariosAdded,
  deleteCheckedScenarios,
  onSortEnd,
  loadingTimelineScenarios
}: ScenarioListProps) => {
  const [scenarioDialogOpen, setScenarioDialogOpen] = useState(false);
  const [checked, setChecked] = useState([] as any[]);

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
    onScenariosAdded();
  };

  const moveItem = (fromIndex: number, toIndex: number) => {
    const updatedScenarios = [...timelineScenarios];
    const [movedItem] = updatedScenarios.splice(fromIndex, 1);
    updatedScenarios.splice(toIndex, 0, movedItem);
    onSortEnd(updatedScenarios);
  };

  const ScenarioList = ({scenarios}: any) => (
    <List sx={{ height: 300, width: 400, overflow: "auto" }}>
      {scenarios.map((scenario: any, i: number) => (
        <ScenarioItem
          key={scenario.id}
          index={i}
          scenario={scenario}
          moveItem={moveItem}
          checked={checked}
          handleToggle={handleToggle}
        />
      ))}
    </List>
  );

  const renderScenarios = () => {
    if (timelineScenarios.length === 0) {
      return (
        <Box sx={{ height: 300, width: 400, overflow: 'auto' }}>
          <Typography variant="subtitle1" component="p">
            No scenarios have been added yet
          </Typography>
        </Box>
      );
    }

    return <ScenarioList scenarios={timelineScenarios}/>;
  };

  const deleteChecked = () => deleteCheckedScenarios(checked)
    .then(() => setChecked([]));

  const renderScenariosList = () => {
    if (loadingTimelineScenarios) {
      return (
        <Box sx={{ height: 300, width: 400, overflow: 'auto' }}>
          {range(6).map((elem: number) => ( <Skeleton key={elem} animation="wave" /> ))}
        </Box>
      );
    }

    return renderScenarios();
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <Paper
        elevation={0}
        variant="outlined"
        sx={{
          padding: theme.spacing(2),
          boxSizing: "border-box",
        }}
      >
        <Typography
          variant="h4"
          component="p"
          sx={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            fontSize: "1.1rem",
            fontWeight: 700,
            color: "#2196f3",
            marginBottom: 10,
          }}
        >
          <AccountTreeIcon style={{ marginRight: 5 }} /> Scenarios
        </Typography>
        {renderScenariosList()}
        <Grid container>
          <Grid item xs={4}>
            <Button
              style={{ marginTop: 10 }}
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => setScenarioDialogOpen(true)}
            >
              Add
            </Button>
          </Grid>
          <Grid item xs={2}>
            <Box sx={{ flexGrow: 1 }}></Box>
          </Grid>
          <Grid item xs={6}>
            <Button
              style={{ marginTop: 10 }}
              color="secondary"
              startIcon={<DeleteIcon />}
              disabled={checked.length === 0}
              onClick={deleteChecked}
            >
              Remove
            </Button>
          </Grid>
        </Grid>
        <TimelineAddScenarioDialog
          projectID={projectID!}
          timelineID={timelineID}
          open={scenarioDialogOpen}
          closeHandler={() => setScenarioDialogOpen(false)}
          onScenariosAdded={onScenariosAdded_}
          addedScenarios={timelineScenarios.map((scenario: any) => scenario.id)}
        />
      </Paper>
    </DndProvider>
  );
};

export default TimelineScenarioList;