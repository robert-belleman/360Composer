import React from 'react';
import { useSelector } from 'react-redux';

import { useHistory } from "react-router-dom";

import { View } from '../types/views';

import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';

import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import Hidden from '@material-ui/core/Hidden';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';

import AccountTreeIcon from '@material-ui/icons/AccountTree';
import PeopleIcon from '@material-ui/icons/People';
import PieChartIcon from '@material-ui/icons/PieChart';

const drawerWidth = 240;

const useStyles = makeStyles((theme: Theme) =>
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
  const history = useHistory();
  const classes = useStyles();

  const sidebarOpen = useSelector((state:any) => state.sidebarOpen);

  const SideMenuList = () => (
    <List className={classes.list}>
      <ListItem button component="a" selected={activeView === View.Project} onClick={() => history.push('/projects')}>
        <ListItemIcon>
          <AccountTreeIcon />
        </ListItemIcon>
        <ListItemText primary="Projects"/>
      </ListItem>
      <ListItem button component="a" selected={activeView === View.Users} onClick={() => history.push('/users')}>
        <ListItemIcon>
          <PeopleIcon />
        </ListItemIcon>
        <ListItemText primary="Users"/>
      </ListItem>
      <ListItem button component="a" selected={activeView === View.Analytics} onClick={() => history.push('/analytics')}>
        <ListItemIcon>
          <PieChartIcon />
        </ListItemIcon>
        <ListItemText primary="Analytics"/>
      </ListItem>
    </List>
  )

  return (
    <div>
      <Hidden xsDown>
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