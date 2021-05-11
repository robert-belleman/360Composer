import React, {useEffect} from 'react';
import {useHistory, useParams, useLocation} from 'react-router-dom'

import TopBar from "../../components/TopBar";
import SideMenu from "../../components/SideMenu";

import { View } from '../../types/views';
import { Grid,Typography, Box } from '@material-ui/core';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';

import AppsIcon from '@material-ui/icons/Apps';
import ClearAllIcon from '@material-ui/icons/ClearAll';

import AssetView from '../../components/ProjectComponents/AssetView';
import SceneView from '../../components/ProjectComponents/SceneView';
import ScenarioView from '../../components/ProjectComponents/ScenarioView';
import TimelineView from '../../components/ProjectComponents/TimelineView';

import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';

const GRID_VIEW = 'grid';
const PANEL_VIEW = 'panel';

const tabFor = (activeTab:string) => {
  const tabs:any = { "assets": 0, "scenes": 1, "scenarios": 2, "timelines": 3 }
  return tabs[activeTab] === undefined ? 0 : tabs[activeTab];
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: any;
  value: any;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography component={'span'}>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

const a11yProps = (index: any) => ({
  id: `simple-tab-${index}`,
  'aria-controls': `simple-tabpanel-${index}`,
});

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
      padding: theme.spacing(3),
      [theme.breakpoints.up('sm')]: {
        marginLeft: 240
      }
    },
    top: {
      padding: theme.spacing(2),
      boxSizing: 'border-box'
    },
    box: {
      flexGrow: 1
    },
    panel: {
      backgroundColor: 'white',
      boxShadow: 'none',
      borderRadius: '5px',
      border: '1px solid rgba(0, 0, 0, 0.12)'
    }
  })
)

type ProjectPageParams = {
  project_id: string;
};


const Project = () => {
  const { project_id }: ProjectPageParams = useParams();

  const useQuery = () => new URLSearchParams(useLocation().search);
  const queryTab:string|null = useQuery().get('activeTab');
  const activeTab = queryTab === null || queryTab === undefined ? 0 : tabFor(queryTab)

  const [value, setValue] = React.useState(activeTab);
  const [view, setView] = React.useState(localStorage.getItem('projectView') || PANEL_VIEW);

  useEffect(() => {
    localStorage.setItem('projectView', view);
  }, [view])

  const classes = useStyles();
  const history = useHistory();

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setValue(newValue);
  };

  const handleViewToggle = (event: React.MouseEvent<HTMLElement>, newView: string) => {
    // ignore if clicking on same button
    if (newView === null) {
      return;
    }

    setView(newView);
  }

  const toggleButtonGroup = () => (
    <ToggleButtonGroup
      value={view}
      exclusive
      onChange={handleViewToggle}
      aria-label="text alignment"
    >
      <ToggleButton value={PANEL_VIEW} aria-label="panel view">
        <ClearAllIcon />
      </ToggleButton>
      <ToggleButton value={GRID_VIEW} aria-label="grid view">
        <AppsIcon />
      </ToggleButton>
    </ToggleButtonGroup>
  )

  const panelView = () => (
    <Grid item xs={12}>
      <AppBar position="static" color="default" className={classes.panel}>
        <Tabs
          value={value}
          onChange={handleChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
          aria-label="full width tabs example"
        >
          <Tab label="1. Assets" {...a11yProps(0)} />
          <Tab label="2. Scenes" {...a11yProps(1)} />
          <Tab label="3. Scenarios" {...a11yProps(2)} />
          <Tab label="4. Timelines" {...a11yProps(2)} />
        </Tabs>
      </AppBar>
      <TabPanel value={value} index={0}>
        <AssetView fullWidth={true} activeProject={project_id} />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <SceneView fullWidth={true} activeProject={project_id} />
      </TabPanel>
      <TabPanel value={value} index={2}>
        <ScenarioView fullWidth={true} activeProject={project_id} />
      </TabPanel>
      <TabPanel value={value} index={3}>
        <TimelineView fullWidth={true} activeProject={project_id} />
      </TabPanel>
    </Grid>
  )

  const gridView = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={12} lg={6}>
        <AssetView fullWidth={false} activeProject={project_id} />
      </Grid>
      <Grid item xs={12} md={12} lg={6}>
        <SceneView fullWidth={false} activeProject={project_id} />
      </Grid>
      <Grid item xs={12} md={12} lg={6}>
        <ScenarioView fullWidth={false} activeProject={project_id} />
      </Grid>
      <Grid item xs={12} md={12} lg={6}>
        <TimelineView fullWidth={false} activeProject={project_id} />
      </Grid>
    </Grid>
  )

  return (
    <div>
      <TopBar/>
      <SideMenu activeView={View.Project}/>
      <div className={classes.root} >
        <Grid container spacing={3}>
          <Grid item xs={12}>
            {toggleButtonGroup()}
          </Grid>
          <Grid item xs={12}>
            { view === PANEL_VIEW ? panelView() : gridView() }
          </Grid>
        </Grid>
      </div>
    </div>
  )
}

export default Project;