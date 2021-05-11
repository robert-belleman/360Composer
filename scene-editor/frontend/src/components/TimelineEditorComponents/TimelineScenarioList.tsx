import React, {useState} from 'react';

import { range } from 'lodash';

import { Container, Draggable } from "react-smooth-dnd";

import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';

import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';

import DragHandleIcon from '@material-ui/icons/DragHandle';
import AccountTreeIcon from '@material-ui/icons/AccountTree';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';

import Skeleton from '@material-ui/lab/Skeleton';

import TimelineAddScenarioDialog from './TimelineAddScenarioDialog';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
      root: {
        flexGrow: 1,
        padding: theme.spacing(2),
      },
      paper: {
        padding: theme.spacing(2),
        boxSizing: 'border-box'
      },
      box: {
        flexGrow: 1
      },
      list: {
        height: 300,
        overflow: 'auto'
      },
      header: {
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        fontSize: '1.1rem',
        fontWeight: 700,
        color: '#2196f3',
        marginBottom: 10
      }
    }),
  );

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

  const classes = useStyles();

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

  const ScenarioList = ({scenarios}:any) => (
    <List className={classes.list}>
      <Container dragHandleSelector=".drag-handle" lockAxis="y" onDrop={onSortEnd}>
        {scenarios.map((scenario:any, i:number) => (
          <Draggable key={scenario.id}>
            <ScenarioItem key={scenario.id} i={i} scenario={scenario} />
          </Draggable>
        ))}
      </Container>
    </List>
  )

  const renderScenarios = () => {
    if (timelineScenarios.length === 0) {
      return <div className={classes.list}><Typography variant="subtitle1" component="p">No scenarios have been added yet</Typography></div>
    }

    return <ScenarioList scenarios={timelineScenarios} onSortEnd={onSortEnd} useDragHandle/>
  }

  const deleteChecked = () => deleteCheckedScenarios(checked)
    .then(() => setChecked([]))

  const renderScenariosList = () => {
    if (loadingTimelineScenarios) {
      return (
        <div className={classes.list}>
          {range(6).map((elem:number) => ( <Skeleton key={elem} animation="wave" /> ))}
        </div>
      )
    }

    return renderScenarios();
  }

  return (
    <Paper elevation={0} variant="outlined" className={classes.paper}>
      <Typography variant="h4" component="p" className={classes.header}><AccountTreeIcon style={{marginRight:5}}/> Scenarios</Typography>
      {renderScenariosList()}
      <Grid container>
        <Grid item xs={4}>
          <Button style={{marginTop: 10}} color="primary" startIcon={<AddIcon />} onClick={() => setScenarioDialogOpen(true)}>Add</Button>
        </Grid>
        <Grid item xs={2}>
          <Box className={classes.box}></Box>
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
        projectID={projectID}
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