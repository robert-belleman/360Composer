import React from 'react';
import { useSelector } from 'react-redux';

import { useNavigate } from "react-router-dom";

import { View } from '../types/views';

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

type SideMenuProps = {
    activeView: View
};

const SideMenu: React.FC<SideMenuProps> = ({activeView}:SideMenuProps) => {
  const navigate = useNavigate();

  const sidebarOpen = useSelector((state:any) => state.sidebarOpen);

  const SideMenuList = () => (
    <List sx={{ padding: 2, boxSizing: 'border-box' }}>
      <ListItem component="button"
                onClick={() => navigate('/app/projects')}
                sx={{
                  bgcolor: activeView === View.Project ? 'action.selected' : 'inherit',
                  '&:hover': { bgcolor: 'action.hover' },
                }}
      >
        <ListItemIcon>
          <AccountTreeIcon />
        </ListItemIcon>
        <ListItemText primary="Projects"/>
      </ListItem>
      <ListItem component="button"
                onClick={() => navigate('/app/users')}
                sx={{
                  bgcolor: activeView === View.Users ? 'action.selected' : 'inherit',
                  '&:hover': { bgcolor: 'action.hover' },
                }}
      >
        <ListItemIcon>
          <PeopleIcon />
        </ListItemIcon>
        <ListItemText primary="Users"/>
      </ListItem>
      <ListItem component="button"
                onClick={() => navigate('/app/analytics')}
                sx={{
                  bgcolor: activeView === View.Analytics ? 'action.selected' : 'inherit',
                  '&:hover': { bgcolor: 'action.hover' },
                }}
      >
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
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              height: 'calc(100% - 64px)',
              top: '64px',
            },
            zIndex: 0,
          }}
          anchor="left"
          open
        >
          <SideMenuList />
        </Drawer>
      </Hidden>
      <Hidden smUp>
        <Drawer
          variant="temporary"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              height: 'calc(100% - 64px)',
              top: '64px',
            },
            zIndex: 0,
          }}
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
