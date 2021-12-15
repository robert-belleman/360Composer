import React from 'react';
import { useSelector } from 'react-redux';

import { useNavigate } from "react-router-dom";

import { View } from '../types/views';

import { makeStyles, createStyles } from '@mui/styles';
import { createTheme } from '@mui/material/styles';

import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import Hidden from '@mui/material/Hidden';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

import AccountTreeIcon from '@mui/icons-material/AccountTree';
import PeopleIcon from '@mui/icons-material/People';
import PieChartIcon from '@mui/icons-material/PieChart';

const drawerWidth = 240;

const theme = createTheme();
const useStyles = makeStyles((theme) =>
  createStyles({
    root: {
      display: 'flex',
    },
    appBar: {
      zIndex: theme.zIndex.drawer + 1,
    },
    drawer: {
      width: drawerWidth,
      flexShrink: 0,
      zIndex: 0,
    },
    drawerPaper: {
      width: drawerWidth,
      height: 'calc(100% - 64px)',
      top: '64px'
    },
    drawerContainer: {
      overflow: 'auto',
    },
    list: {
      padding: 16,
      boxSizing: 'border-box'
    }
  }),
);

type SideMenuProps = {
    activeView: View
};

const SideMenu: React.FC<SideMenuProps> = ({activeView}:SideMenuProps) => {
  const navigate = useNavigate();
  const classes = useStyles();

  const sidebarOpen = useSelector((state:any) => state.sidebarOpen);

  const SideMenuList = () => (
    <List className={classes.list}>
      <ListItem button component="a" selected={activeView === View.Project} onClick={() => navigate('/projects')}>
        <ListItemIcon>
          <AccountTreeIcon />
        </ListItemIcon>
        <ListItemText primary="Projects"/>
      </ListItem>
      <ListItem button component="a" selected={activeView === View.Users} onClick={() => navigate('/users')}>
        <ListItemIcon>
          <PeopleIcon />
        </ListItemIcon>
        <ListItemText primary="Users"/>
      </ListItem>
      <ListItem button component="a" selected={activeView === View.Analytics} onClick={() => navigate('/analytics')}>
        <ListItemIcon>
          <PieChartIcon />
        </ListItemIcon>
        <ListItemText primary="Analytics"/>
      </ListItem>
    </List>
  )

  return (
    <div>
      <Hidden smDown>
        <Drawer
          className={classes.drawer}
          variant="permanent"
          classes={{paper: classes.drawerPaper}}
          anchor="left"
          open
        >
          <SideMenuList />
        </Drawer>
      </Hidden>
      <Hidden smUp>
        <Drawer
          className={classes.drawer}
          variant="temporary"
          classes={{paper: classes.drawerPaper}}
          anchor="left"
          open={sidebarOpen}
        >
          <SideMenuList />
        </Drawer>
      </Hidden>
    </div>
  );
};

export default SideMenu;