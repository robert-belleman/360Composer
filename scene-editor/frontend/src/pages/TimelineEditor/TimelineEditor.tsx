import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from "react-router-dom";

import arrayMove from 'array-move';

import { View } from '../../types/views';
import TopBar from "../../components/TopBar";
import SideMenu from "../../components/SideMenu";
import TimelineUserList from "../../components/TimelineEditorComponents/TimelineUserList";
import TimelineScenarioList from "../../components/TimelineEditorComponents/TimelineScenarioList";
import TimelinePreview from "../../components/TimelineEditorComponents/TimelinePreview";
import TimelineOverviewCard from "../../components/TimelineEditorComponents/TimelineOverviewCard";
import UpdateTimelineDialog from "../../components/TimelineEditorComponents/UpdateTimelineDialog";

import { createTheme } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';

import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import { api } from '../../util/api';

const theme = createTheme();

const INITIAL_TIMELINE = {
  id: "",
  project_id: "",
  start: "",
  randomized: true,
  name: "",
  description: "",
  created_at: "",
  updated_at: ""
}

const TimelineEditor = () => {
  const {projectID, timelineID} = useParams<'projectID' | 'timelineID'>();

  const [timeline, setTimeline] = useState(INITIAL_TIMELINE)
  const [timelineScenarios, setTimelineScenarios] = useState([] as any[]);

  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [loadingTimeline, setLoadingTimeline] = useState(true);
  const [loadingTimelineScenarios, setLoadingTimelineScenarios] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    fetchTimeline();
    setLoadingTimelineScenarios(true)
    fetchTimelineScenarios()
  }, [])

  const fetchTimeline = () => api.get(`/api/timeline/${timelineID}/`)
      .then((res:any) => setTimeline(res.data))
      .then(() => setLoadingTimeline(false))
      .catch((e:any) => console.log('error while fetching data', e))

  const handleRandomizedToggle = (event:any) => {
    const randomized = event.target.checked;
    
    api.post(`/api/timeline/${timelineID}/randomize`, {randomized})
      .then((res:any) => setTimeline({...timeline, randomized}))
      .catch((e:any) => console.log('error while updating timeline', e))
  }

  const deleteCheckedScenarios = (checked:any) => api.post(`/api/timeline/${timelineID}/scenarios/delete`, {ids: checked})
      .then(fetchTimelineScenarios)
      .catch((e:any) => console.log('error while removing scenarios', e))

  const fetchTimelineScenarios = () => api.get(`/api/timeline/${timelineID}/scenarios`)
    .then((res:any) => setTimelineScenarios(res.data))
    .then(() => setLoadingTimelineScenarios(false))
    .catch((e:any) => {console.log('error while fetching timeline scenarios', e); setLoadingTimelineScenarios(false)})

  const updateOrder = (orderedScenarios:any[]) => {
    const order = orderedScenarios.map((scenario:any) => ({id: scenario.id, next: scenario.next_scenario}))
    return api.post(`/api/timeline/${timelineID}/scenarios/order`, order)
      .then(() => console.log('successfully updated order'))
      .catch((e:any) => console.log('Error while updating order', e))
  }

  // TODO: move elsewhere
  const updateScenarioList = (updatedIndexArr:any[]) => {
    const length = updatedIndexArr.length;

    return updatedIndexArr.map((elem:any, i:number) => ({
      ...elem,
      next_scenario: i === length - 1 ? null : updatedIndexArr[i+1].id
    }))
  }

  const onSortEnd = ({removedIndex, addedIndex}:any) => {
    const prevOrder = timelineScenarios;

    const updatedIndexArr = arrayMove(timelineScenarios, removedIndex, addedIndex);
    const updatedOrder = updateScenarioList(updatedIndexArr);

    setTimelineScenarios(updatedOrder)

    updateOrder(updatedOrder)
      .catch((e) => { console.log('error in onSortEnd', e); setTimelineScenarios(prevOrder); })
  }

  const onScenariosAdded = () => {
    setLoadingTimelineScenarios(true);
    fetchTimelineScenarios()
  }

  const startPreview = () => {
    navigate(`/app/preview-player/timeline/${timelineID}`);
  }

  const renderTop = () => (
    <div>
      <Grid container spacing={3}>
        <Grid item xs={1}>
          <Button color="primary" startIcon={<ArrowBackIosIcon />} onClick={() => navigate(`/app/project/${projectID}?activeTab=timelines`)}>Back</Button>
        </Grid>
        <Grid item xs={11}>
          <Box sx={{ flexGrow: 1 }}/>
        </Grid>
      </Grid>
    </div>
  )

  return (
    <div>
      <TopBar/>
      <SideMenu activeView={View.Project}/>
      <Box sx={{
        flexGrow: 1,
        padding: theme.spacing(3),
        [theme.breakpoints.up('sm')]: {
          marginLeft: '240px'
        }
      }}
      >
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper elevation={0} variant="outlined" sx={{
              padding: theme.spacing(2),
              boxSizing: 'border-box'
            }}
            >
              {renderTop()}
            </Paper>
          </Grid>
          <Grid item xs={12} md={12} lg={4}>
            <TimelineOverviewCard onEditClick={() => setUpdateDialogOpen(true)} timeline={timeline} handleRandomizedToggle={handleRandomizedToggle} loading={loadingTimeline} />
          </Grid>
          <Grid item xs={12} md={12} lg={4}>
            <TimelineScenarioList
              projectID={projectID!}
              timelineID={timelineID!}
              randomized={timeline.randomized}
              timelineScenarios={timelineScenarios}
              onScenariosAdded={onScenariosAdded}
              deleteCheckedScenarios={deleteCheckedScenarios}
              onSortEnd={onSortEnd}
              loadingTimelineScenarios={loadingTimelineScenarios}
            />
          </Grid>
          <Grid item xs={12} md={12} lg={4}>
            <TimelineUserList timelineID={timelineID!} />
          </Grid>
          <Grid item xs={12} md={12} lg={12}>
            <TimelinePreview 
              randomized={timeline.randomized}
              timelineScenarios={timelineScenarios!}
              preview={startPreview}/>
          </Grid>
        </Grid>
      </Box>
      <UpdateTimelineDialog
        timeline={timeline}
        open={updateDialogOpen}
        closeHandler={() => setUpdateDialogOpen(false)}
        onTimelineUpdated={() => {setUpdateDialogOpen(false); fetchTimeline()}}
      />
    </div>
  )
}

export default TimelineEditor;