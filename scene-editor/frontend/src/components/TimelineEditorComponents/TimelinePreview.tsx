import React from 'react';

import ReactFlow, { Handle, Controls, Background, isEdge, Position } from 'reactflow';
import 'reactflow/dist/style.css';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';

import TimelineIcon from '@mui/icons-material/Timeline';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

import { createTheme } from '@mui/material/styles';

const theme = createTheme();

type TimelinePreviewProps = {
  timelineScenarios: any[];
  randomized: boolean;
  preview?: Function;
}

const TimelinePreview: React.FC<TimelinePreviewProps> = ({timelineScenarios, randomized, preview}:TimelinePreviewProps) => {
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
    const nodes = timelineScenarios.map((scenario: any, index: number) => ({
      id: scenario.id,
      position: { x: index * 250 + 100, y: 150 },
      type: 'default',
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      style: { background: 'rgba(33, 150, 243, 0.1)', border: '1px solid #2196f3' },
      data: {
        label: `${randomized ? "" : `${index + 1}. `}${scenario.scenario.name}`
      }
    }));
  
    const edges = randomized ? [] : scenariosToEdges();
  
    return { nodes, edges };
  };

  const { nodes, edges } = graph();

  return (
    <Paper elevation={0} variant="outlined"
    sx={{
      padding: theme.spacing(2),
      boxSizing: 'border-box'
    }}
    >
      <Grid container>
        <Grid item xs={9}>
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
            <TimelineIcon style={{marginRight:5}}/> Preview
          </Typography>
        </Grid>
        <Grid item xs={3}>
          <Button 
            color="secondary"
            startIcon={<PlayArrowIcon />}
            onClick={ preview ? () => preview() : () => {}}
          >
              Play Timeline
          </Button>
        </Grid>
        <Grid item xs={12}>
          <Box sx={{ height: '360px' }}>
            <ReactFlow
              nodesDraggable={false}
              elementsSelectable={false}
              zoomOnScroll={false}
              nodes={nodes}
              edges={edges}
              defaultViewport={{ x: 0, y: 0, zoom: 1.3 }}
            >
              <Controls />
            </ReactFlow>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  )
}

export default TimelinePreview;