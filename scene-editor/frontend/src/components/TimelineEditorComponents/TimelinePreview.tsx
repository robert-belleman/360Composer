import React from 'react';

import ReactFlow, { Handle, Controls, Background, isEdge } from 'react-flow-renderer';

import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';

import TimelineIcon from '@material-ui/icons/Timeline';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';

import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';

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
      },
      flowWrapper: {
        height: '360px'
      }
    }),
  );

type TimelinePreviewProps = {
  timelineScenarios: any[];
  randomized: boolean;
}

const TimelinePreview: React.FC<TimelinePreviewProps> = ({timelineScenarios, randomized}:TimelinePreviewProps) => {
  const classes = useStyles();

  const scenariosToEdges = () => timelineScenarios.reduce((acc:any[], scenario:any) => {
    if (scenario.next_scenario) {
      const edge = {
        id: `${scenario.id}-${scenario.next_scenario}`,
        source: scenario.id,
        target: scenario.next_scenario,
        animated: true,
        style: {strokeWidth: 1.6},
        arrowHeadType: 'arrow'
      }
      return [...acc, edge]
    }

    return acc;
  }, [])

  const graph = () => {

    const nodes = timelineScenarios.map((scenario:any, index: number) => ({
      id: scenario.id,
      position: {x: index * 250 + 100, y: 150},
      type: 'default',
      sourcePosition: 'right',
      targetPosition: 'left',
      style: {background: 'rgba(33, 150, 243, 0.1)', border: '1px solid #2196f3'},
      data: {
        label: `${randomized ? "" : `${index+1}. `}${scenario.scenario.name}` 
      }
    }))

    const edges = randomized ? [] : scenariosToEdges()

    return [...nodes, ...edges]
  }

  return (
    <Paper elevation={0} variant="outlined" className={classes.paper}>
      <Grid container>
        <Grid item xs={9}>
          <Typography variant="h4" component="p" className={classes.header}><TimelineIcon style={{marginRight:5}}/> Preview</Typography>
        </Grid>
        <Grid item xs={3}>
          <Button 
            color="secondary"
            startIcon={<PlayArrowIcon />}
          >
              Play Timeline
          </Button>
        </Grid>
        <Grid item xs={12}>
          <div className={classes.flowWrapper}>
            <ReactFlow
              nodesDraggable={false}
              elementsSelectable={false}
              zoomOnScroll={false}
              elements={graph()}
              defaultZoom={1.3}
            >
              <Controls />
            </ReactFlow>
          </div>
        </Grid>
      </Grid>
    </Paper>
  )
}

export default TimelinePreview;