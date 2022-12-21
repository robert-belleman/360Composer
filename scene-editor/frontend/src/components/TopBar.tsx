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


import { makeStyles, createStyles } from '@mui/styles';
import { createTheme } from '@mui/material/styles';

import logo from "../static/images/levvel-logo.png";

import "./TopBar.scss";

const theme = createTheme();
const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    zIndex: 1300,
    background: '#2196f3',
    boxShadow: 'none'
  },
  menuButton: {
    marginRight: theme.spacing(2),
    [theme.breakpoints.up('sm')]: {
      display: 'none',
    },
  },
  logo: {
    height: 35,
    marginTop: '8px'
  },
  box: {
    flexGrow: 1
  },
  toolbar: {
    height: 64,
    alignItems: 'flex-start',
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(2),
    boxSizing: 'border-box'
  }
}));

const TopBar: React.FC = () => {
  const classes = useStyles();

  const dispatch = useDispatch();
  const navigate = useNavigate();

  return (
    <AppBar className={classes.root} position="sticky">
      <Toolbar className={classes.toolbar}>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={() => dispatch(toggleSidebar())}
          className={classes.menuButton}
          size="large">
          <MenuIcon />
        </IconButton>
        <img onClick={() => navigate('/app/')} style={{cursor: 'pointer'}} src={logo} alt="PCIT-VR" className={classes.logo} />
        <Box className={classes.box}/>
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
