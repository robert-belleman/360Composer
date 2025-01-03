import React from "react";

import { useNavigate } from 'react-router-dom'

import { useSelector, useDispatch } from 'react-redux';

import { logOut } from '../actions/authActions';
import { toggleSidebar } from '../actions/sidebarActions';

import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Typography from '@mui/material/Typography';

import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import SettingsIcon from '@mui/icons-material/Settings';
import MenuIcon from '@mui/icons-material/Menu';

import logo from "../static/images/360_Composer_1.png";

import "./TopBar.scss";

const TopBar: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  return (
    <AppBar sx={{ flexGrow: 1, zIndex: 1300, background: '#2196f3', boxShadow: 'none' }} position="sticky">
      <Toolbar sx={{ height: 64, alignItems: 'flex-start', paddingTop: 1, paddingBottom: 2, boxSizing: 'border-box' }}>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={() => dispatch(toggleSidebar())}
          sx={{
            marginRight: 2,
            display: { sm: 'none' },
          }}
          size="large">
          <MenuIcon />
        </IconButton>
        <img onClick={() => navigate('/app/')} style={{ cursor: 'pointer', height: 35, marginTop: '8px' }} src={logo} alt="PCIT-VR" />
        <Box sx={{ flexGrow: 1 }}/>
        <IconButton
          edge="end"
          color="inherit"
          aria-label="log-out"
          onClick={() => navigate('/app/settings')}
          size="large">
          <SettingsIcon />
        </IconButton>
        <IconButton
          edge="end"
          color="inherit"
          aria-label="log-out"
          onClick={() => {dispatch(logOut()); navigate('/app/')}}
          size="large">
          <ExitToAppIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;
