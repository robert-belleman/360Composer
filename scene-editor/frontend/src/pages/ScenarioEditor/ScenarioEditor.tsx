import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import axios from 'axios';

import ReactFlow, { Handle, Controls, Background, isEdge } from 'react-flow-renderer';

import { concat, flatten } from 'lodash';

import { makeStyles, createStyles } from '@mui/styles';
import { createTheme } from '@mui/material/styles';

import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActionArea from '@mui/material/CardActionArea';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Collapse from '@mui/material/Collapse';
import Grid from "@mui/material/Grid";
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import Switch from '@mui/material/Switch';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import { green } from '@mui/material/colors';

import Alert from '@mui/material/Alert';

import RefreshIcon from '@mui/icons-material/Refresh';
import BackupIcon from '@mui/icons-material/Backup';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import HomeIcon from '@mui/icons-material/Home';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import CallSplitIcon from '@mui/icons-material/CallSplit';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CloseIcon from '@mui/icons-material/Close';

import Skeleton from '@mui/material/Skeleton';

import TopBar from "../../components/TopBar";
import SideMenu from "../../components/SideMenu";

import { View } from '../../types/views';

import NewSceneDialog from "../../components/ScenarioEditorComponents/AddSceneDialog";
import UpdateScenarioDialog from "../../components/ScenarioEditorComponents/UpdateScenarioDialog";

import './ScenarioEditor.scss';
import { Divider } from '@mui/material';

const theme = createTheme();

const BACKGROUND = (index:number) => {
  const colors = ["#2196f3", "#ffc107", "#795548", "#e91e63"]
  return colors[index] ? colors[index] : "#fff"
}

type SceneNodeProps = {
  data: any,
  selected:any
}

type ValidationResponse = {
  valid: boolean,
  message: string,
  invalid_nodes: string[]
}

const INITIAL_TIMELINE = {
  created_at: "",
  description: "",
  id: "",
  name: "",
  project_id: "",
  scenes: [] as any[],
  start_scene: "",
  updated_at: "",
  revalidate: false
}

const INITIAL_VALIDATION = {
  validating: false, 
  state: {valid: true, message: "", invalid_nodes: []}
}

const SceneNode = ({selected, data}:SceneNodeProps) => {
  const navigate = useNavigate();

  const isStartNode = () => data.id === data.timeline.start_scene

  const isPossibleEndNode = () => data.actions.length !== data.links.length

  const unreachable = data.timelineValidation.validating  && data.timelineValidation.state.invalid_nodes.indexOf(data.id) !== -1

  const classes = (makeStyles((theme) => createStyles({
    tooltip: {
      display: 'flex',
      alignItems: 'center',
      flexWrap: 'wrap',
      fontSize: '0.8rem'
    }
  })))();

  const possibleEndNodeText = () => {
    if (data.links.length === 0) {
      return <Typography component="p" className={classes.tooltip}><ExitToAppIcon style={{marginRight: 5}} fontSize="small" /> End</Typography>
    }

    return <Typography component="p" className={classes.tooltip}><CallSplitIcon style={{marginRight: 5}} fontSize="small" /> Possible End</Typography>
  }

  const tooltipTitle = () => {
    if (isStartNode()) {
      return <Typography component="p" className={classes.tooltip}><HomeIcon fontSize="small" style={{marginRight: 5}} /> Start</Typography>
    }

    if (unreachable) {
      return <Typography component="p" className={classes.tooltip}><HelpOutlineIcon fontSize="small" style={{marginRight: 5}} /> Unreachable</Typography>
    }

    return isPossibleEndNode() ? possibleEndNodeText() : "";
  }

  const border = () => {
    if (data.id === data.timeline.start_scene) {
      return `${selected ? '2' : '1'}px solid green`
    }

    if (unreachable) {
      return '2px solid #ff9800'
    }

    return selected ? `2px solid #c4c4c4` : '1px solid rgba(0, 0, 0, 0.12)';
  }

  const handleSetHome = (event:any) => {
    data.functions.setHome(data.id)

    // We do not want the button to select or drag the element.
    event.stopPropagation();
    event.preventDefault();
  }

  const handleEdit = () => {
    navigate(`/app/editor/${data.projectID}/${data.scene_id}?goBack=true`)
  }

  const renderHandles = () => data.actions.map((action:any, index:number) => {
    return (
      <Handle
        type="source"
        //@ts-ignore
        position="right"
        id={`${action.id}`}
        key={action.id}
        style={{top: `${(25 * (index)) + 12}%`, height: 18, width: 18, right: -9, background: BACKGROUND(index)}}
      />
    )
  })

  const renderLabels = () => {
    const labels = data.actions.map((action:any, index:number) => {
      const backgroundColor = BACKGROUND(index);
      return (
        <Grid container spacing={0} key={index}>
          <Grid item xs={1}>
            <div style={{marginTop: 2, height: 10, width: 10, borderRadius: '50%', background: backgroundColor}}></div>
          </Grid>
          <Grid item xs={11}>
            <Typography variant="body1" component="p" style={{marginTop: 0, marginBottom: 5, fontSize: '0.7rem', fontWeight: 400}}>{action.label}</Typography>
          </Grid>
        </Grid>
      )
    });

    return (
      <Grid container spacing={0}>
        <Grid item xs={12}>
          <Typography variant="body1" component="p" style={{marginTop: 5, marginBottom: 10, fontSize: '0.8rem', fontWeight: 400}}>Actions</Typography>
        </Grid>
        <Grid item xs={12}>
          {labels}
        </Grid>
      </Grid>
    )
  }
  
  const renderDescription = () => (
    <Grid container spacing={0}>
      <Grid item xs={12}>
        <Typography variant="subtitle1" component="p" style={{fontSize: '1.2rem', fontWeight: 500}}>{data.scene.name}</Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="body1" component="p" style={{marginBottom: 10, fontSize: '0.7rem', fontWeight: 300}}>{data.scene.description}</Typography>
      </Grid>
    </Grid>
  )

  const generalView = () => {
    return (
      <div>
        <Grid container spacing={0}>
          <Grid item xs={8}>
            <Typography variant="subtitle1" component="p" style={{fontSize: '0.8rem', color: '#cfcfcf', display: 'flex', alignItems: 'center', flexWrap: 'wrap'}}>{selected ? data.scene.name : 'Scene'}</Typography>
          </Grid>
          <Grid item xs={2}>
            <IconButton onClick={handleEdit} style={{color: selected? 'white' : '#757575'}} size="small">
              <EditIcon fontSize="inherit"/>
            </IconButton>
          </Grid>
          <Grid item xs={2}>
            <IconButton className="nodrag" color={data.is_start ? 'primary' : 'default'} style={{color: selected? 'white' : '#757575'}} onClick={handleSetHome} size="small">
              <HomeIcon fontSize="inherit"/>
            </IconButton>
          </Grid>
          <Grid item xs={12}>
            {selected ? renderLabels() : renderDescription()}
          </Grid>
        </Grid>
      </div>
    )
  }

  const customNodeStyles = {
    padding: 10,
    minHeight: 150,
    width: 200,
    border: border(),
    boxSizing: 'border-box',
    backgroundColor: selected ? '#212121e0' : 'rgba(255,255,255, 0.8)',
    color: selected ? 'white' : null
  } as React.CSSProperties;

  return (
    <Tooltip
      arrow
      open={unreachable || isStartNode() || isPossibleEndNode()}
      disableHoverListener={true}
      disableTouchListener={true}
      disableFocusListener={true}
      title={tooltipTitle()}
      placement="top"
    >
      <Paper
        variant="outlined"
        style={customNodeStyles}
      >
        <Handle
          type="target"
          //@ts-ignore
          position="left"
          style={{ borderRadius: 0, height: 15, width: 15, left: -13, background: "#dbdbdb", border: "1px solid #bfbfbf"}}
          id={`${data.id}`}
        />
        { generalView() }
        { renderHandles() }
      </Paper>
    </Tooltip>
  )
}

const ScenarioEditor:React.FC = () => {
  const {projectID, scenarioID} = useParams<'projectID'|'scenarioID'>();

  const [fetchingTimelines, setFetchingTimelines] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [timelineWarningOpen, setTimelineWarningOpen] = useState(false);

  const [timelineValidation, setTimelineValidation] = useState(INITIAL_VALIDATION)

  const [sceneNodeRenderState, setSceneNodeRenderState] = useState(0);

  const [timeline, setTimeline] = useState(INITIAL_TIMELINE);
  const [lastUpdated, setLastUpdated] = useState(new Date(Date.now()))
  const [selectedEdges, setSelectedEdges] = useState([] as any[])

  const navigate = useNavigate();

  useEffect(() => {
    if (timeline !== INITIAL_TIMELINE) {
      saveScenarioTimeline()
        .then(() => {
          if (timelineValidation.validating && timeline.revalidate) {
            validateTimeline(timelineValidation.validating)
          }
        })
    }
  }, [timeline])

  useEffect(() => {
    fetchScenarioTimeline()
  }, [])

  useEffect(() => {
    setTimelineWarningOpen(timelineValidation.validating);
  }, [timelineValidation])

  useEffect(() => {
    // Only rerender if validation is one when state changes.
    if (!timelineValidation.validating) {
      rerender()
    }
  }, [timelineValidation])

  useEffect(() => {
    console.log(timelineValidation)
  }, [timelineValidation])

  const OverviewCard = () => (
    <Card style={{marginTop: 20}} variant="outlined">
      <CardActionArea>
        <CardContent>
          <Typography style={{fontSize: 14}} color="textSecondary" gutterBottom>
            Scenario Information
          </Typography>
          <Divider style={{marginBottom: 10}}/>
          <Typography gutterBottom variant="h5" component="h2">
            {timeline.name}
          </Typography>
          <Typography variant="body2" component="p">
            {timeline.description}
          </Typography>
        </CardContent>
      </CardActionArea>
      <CardActions>
        <Button size="small" color="primary" onClick={() => setUpdateDialogOpen(true)}>
          Edit
        </Button>
      </CardActions>
    </Card>
  )

  const createEdges = (sourceID: string, scenarioScene:any) => {
    return scenarioScene.links.reduce((acc: any, link:any, i:number) => {
      if (link.target_id) {
        const actionObj = scenarioScene.actions.reduce((acc:any, action:any, i:number) => action.id === link.action_id ? {i, action} : acc, null);

        if (actionObj === null) {
          return acc;
        }

        const isSelected = (id:string) => selectedEdges.reduce((acc:boolean, edge:any) => edge.id === id || acc, false);

        const id = `${link.id}->${link.action_id}->${link.target_id}`
        const color = isSelected(id) ? "#a3a3a3" : `${BACKGROUND(actionObj.i)}`; 

        const edge = {
          id,
          source: sourceID,
          sourceHandle: `${link.action_id}`,
          target: link.target_id,
          targetHandle: `${link.target_id}`,
          type: 'smoothedge',
          style: {strokeWidth: 2.2, stroke: color},
          arrowHeadType: 'arrow',
        }

        return concat(acc, edge);
      }

      return acc
    }, [])
  }

  const timelineToElements = () => {
    const setHome = (sceneID:string) => setTimeline({...timeline, start_scene: sceneID, revalidate: true})

    const elements = flatten(timeline.scenes.map((scenarioScene:any) => {
      const node = {
        id: scenarioScene.id,
        data: { ...scenarioScene, timeline, timelineValidation, projectID, sceneNodeRenderState, functions: { setHome } },
        type: 'special',
        position: {x: scenarioScene.position_x, y: scenarioScene.position_y}
      };

      const edges = createEdges(scenarioScene.id, scenarioScene)

      return [node, ...edges]
    }));

    return elements;
  }

  const rerender = () => {
    // forces a node to rerender
    setSceneNodeRenderState(sceneNodeRenderState === 0 ? 1 : 0);
  }

  const previewScene = () => {
    saveScenarioTimeline();

    navigate(`/app/preview-player/scenario/${scenarioID}`)
  }

  const fetchScenarioTimeline = () => axios.get(`/api/scenario/${scenarioID}/`)
      .then((res:any) => setTimeline({...res.data, revalidate: false}))
      .then(() => setFetchingTimelines(false))
      .catch(e => console.log('error fetching timeline', e))

  const saveScenarioTimeline = () => {
    return axios.post(`/api/scenario/${scenarioID}/`, {start_scene: timeline.start_scene, scenes: timeline.scenes})
      .then(() => setLastUpdated(new Date(Date.now())))
      .catch(e => console.log(e));
  }

  const validateTimeline = (validating:boolean) => {
    return axios.post(`/api/scenario/${scenarioID}/validate`)
      .then((res:any) => setTimelineValidation({validating, state: res.data}))
      .then(rerender)
      .catch((e:any) => console.log('error while validating', e))
  }

  const clearValidation = () => {
    setTimelineValidation(INITIAL_VALIDATION);
    rerender();
  }

  const handleValidationToggle = () => {
    if (timelineValidation.validating) {
      clearValidation();
      return;
    }

    validateTimeline(true);
  }

  const handleOnConnect = (params:any) => {
    const source_id = params.source;
    const action_id = params.sourceHandle;
    const target_id = params.target;

    return axios.post(`/api/scenario/${scenarioID}/scenes/connect`, {source_id, action_id, target_id})
      .then((res:any) => addLink(res.data))
      .then(() => { if (timelineValidation.validating) { validateTimeline(timelineValidation.validating); } })
      .catch((e) => console.log('error while creating link', e))
  }

  const addLink = (link:any) => {
    const scenes:any = timeline.scenes.map((scene:any) => 
      scene.id === link.source_id  ? {...scene, links: concat(scene.links, link)} : scene
    )

    setTimeline({...timeline, scenes, revalidate: false})
  }

  const handleNodeDrag = (_:any, node:any) => {
    setTimeline({...timeline, revalidate: false, scenes: timeline.scenes.reduce((acc:any, scenarioScene:any) => {
      return concat(acc, scenarioScene.id === node.id ? {...scenarioScene, position_x: node.position.x, position_y: node.position.y} : scenarioScene)
    }, [])});
  }

  const onSelect = (elements:any) => {
    setSelectedEdges(elements === null ? [] : elements.filter(isEdge))
  }

  const deleteNodes = (ids:string[]) => axios.post(`/api/scenario/${scenarioID}/scenes/delete`, {ids})

  const removeLink = (edge:any) => {
    axios.post(`/api/scenario/${scenarioID}/scenes/link/delete`, {id: edge.id.split('->')[0]})
      .then(fetchScenarioTimeline)
      .then(() => validateTimeline(timelineValidation.validating))
      .catch((e:any) => console.log('error while deleting link', e))
  }

  const handleElementsRemove = (elements:any) => {
    const scenes = elements.filter((element:any) => !isEdge(element));
    const isSingleEdge = (scenes.length === 0 && elements.length === 1);

    if (isSingleEdge) {
      return removeLink(elements[0]);
    }

    return saveScenarioTimeline()
      .then(() => deleteNodes(scenes.map((scene:any) => scene.id)))
      .then(fetchScenarioTimeline)
      .then(() => validateTimeline(timelineValidation.validating))
      .catch((e) => console.log('something went wrong while removing nodes: ', e))
  }

  const onScenesAdded = (x:any) => {
    fetchScenarioTimeline()
      .then(() => setDialogOpen(false))
      .then(() => validateTimeline(timelineValidation.validating))
  }

  const classes = (makeStyles((theme) => createStyles({
    paper: {
      marginTop: 20,
      padding: theme.spacing(2)
    },
    top: {
      padding: theme.spacing(2),
      boxSizing: 'border-box'
    },
    box: {
      flexGrow: 1
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      flexWrap: 'wrap',
    },
    root: {
      flexGrow: 1,
      padding: theme.spacing(3),
      [theme.breakpoints.up('sm')]: {
        marginLeft: 240
      }
    },
    validateButton: {
      backgroundColor: green[500],
      color: 'white',
      '&:hover': {
        backgroundColor: green[700],
      }
    }
  })))();

  const nodePropsAreEqual = (prevProps:any, nextProps:any) => {
    return prevProps.data.sceneNodeRenderState === nextProps.data.sceneNodeRenderState
      && prevProps.data.timeline.start_scene === nextProps.data.timeline.start_scene
      && prevProps.selected === nextProps.selected
      && prevProps.data.links.length === nextProps.data.links.length
      && prevProps.data.actions.length === nextProps.data.actions.length
      && prevProps.xPos === nextProps.xPos
      && prevProps.yPos === nextProps.yPos;
  }

  const nodeTypes = {
    special: React.memo(SceneNode, nodePropsAreEqual)
  };

  const validationSwitch = () => (
    <div style={{position: 'absolute', top: '18px', right: '240px', zIndex: 1000}}>
      <Paper style={{padding: 5}}>
        <FormGroup style={{marginLeft: 15}}>
          <FormControlLabel
            control={<Switch size="small" checked={timelineValidation.validating} onChange={handleValidationToggle} />}
            label={`validation: ${timelineValidation.validating ? 'on' : 'off'}`}
          />
        </FormGroup>
      </Paper>
    </div>
  )

  const editor = () => fetchingTimelines 
    ? (<Skeleton style={{marginTop: 20}} variant="rectangular" height={700}/>)
    : (
        <div className="editor-view">
          <ReactFlow 
            onElementsRemove={handleElementsRemove}
            onNodeDragStop={handleNodeDrag}
            elements={timelineToElements()}
            onConnect={handleOnConnect}
            onSelectionChange={onSelect}
            onMove={rerender}
            selectNodesOnDrag={false}
            nodeTypes={nodeTypes}
            nodesDraggable={true}
            elementsSelectable={true}
            zoomOnScroll={false}
            snapToGrid
          >
            <Button
              variant="contained"
              size="small"
              endIcon={<AddIcon/>}
              onClick={() => setDialogOpen(true)}
              style={{position: 'absolute', top: '20px', left: '20px', zIndex: 1000}}>Add Scene</Button>
            { validationSwitch() }
            <Button
              variant="contained"
              color="primary"
              size="small"
              endIcon={<BackupIcon/>}
              onClick={saveScenarioTimeline}
              style={{position: 'absolute', top: '20px', right: '140px', zIndex: 1000}}
            >Save</Button>
            <Button
              variant="contained"
              color="secondary"
              size="small"
              endIcon={<PlayArrowIcon/>}
              onClick={previewScene}
              style={{position: 'absolute', top: '20px', right: '20px', zIndex: 1000}}
            >Preview</Button>
            <Controls
              onFitView={rerender}
              onZoomIn={rerender}
              onZoomOut={rerender}
            />
            <Background color="#aaa" gap={16} />
          </ReactFlow>
        </div>
     )

  const renderTop = () => (
    <div>
      <Grid container spacing={3}>
        <Grid item xs={1}>
          <Button color="primary" startIcon={<ArrowBackIosIcon />} onClick={() => navigate(`/app/project/${projectID}?activeTab=scenarios`)}>Back</Button>
        </Grid>
        <Grid item xs={11}>
          <Typography
            style={{float: "right", marginRight: "20px", marginTop: "5px", display: 'flex', alignItems: 'center', flexWrap: 'wrap'}}
            align="right"
            variant="body2"
            component="p">
              <RefreshIcon fontSize="small" style={{marginRight: 5}} /> Last Updated: {lastUpdated.toLocaleString('en-GB')}
          </Typography>
        </Grid>
      </Grid>
    </div>
  )

  return (
    <div>
      <TopBar />
      <SideMenu activeView={View.Project}/>
      <div className={classes.root}>
        <Grid container spacing={0}>
          <Grid item xs={12}>
            <Paper elevation={0} variant="outlined" className={classes.top}>
              {renderTop()}
            </Paper>
          </Grid>

          <Grid item xs={12} md={12} lg={3}>
            <OverviewCard />
          </Grid>

          <Grid item xs={12}>
            <Collapse in={timelineWarningOpen}>
            
            <Alert
              variant="filled"
              severity={timelineValidation.state.valid ? "success" : "warning"}
              style={{marginTop: 20}}
              action={
                <IconButton
                  aria-label="close"
                  color="inherit"
                  size="small"
                  onClick={() => {
                    setTimelineWarningOpen(false);
                  }}
                >
                  <CloseIcon fontSize="inherit" />
                </IconButton>
                }
            >
              {timelineValidation.state.valid ? "Scenario is valid" : timelineValidation.state.message}
            </Alert>
          </Collapse>
          </Grid>

          <Grid item xs={12}>
            { editor() }
          </Grid>
        </Grid>
        <NewSceneDialog
          projectID={projectID!}
          scenarioID={scenarioID!}
          open={dialogOpen}
          closeHandler={() => setDialogOpen(false)}
          onScenesAdded={onScenesAdded} 
        />
        
        <UpdateScenarioDialog
          scenarioID={scenarioID!}
          scenario={{name: timeline.name, description: timeline.description}}
          open={updateDialogOpen}
          closeHandler={() => setUpdateDialogOpen(false)}
          onScenarioUpdated={() => {setUpdateDialogOpen(false); fetchScenarioTimeline();}}
        />
      </div>
    </div>
  )
}

export default ScenarioEditor
