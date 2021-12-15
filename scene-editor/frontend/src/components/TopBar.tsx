import React from "react";

import { useNavigate } from 'react-router-dom'

import { useSelector, useDispatch } from 'react-redux';

import { logOut } from '../actions/authActions';
import { toggleSidebar } from '../actions/sidebarActions';

import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Box from "@material-ui/core/Box";
import IconButton from "@material-ui/core/IconButton";
import Typography from '@material-ui/core/Typography';

import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import SettingsIcon from '@material-ui/icons/Settings';
import MenuIcon from '@material-ui/icons/Menu';

import { makeStyles } from '@material-ui/core/styles';

import logo from "../static/images/levvel-logo.png";

import "./TopBar.scss";

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
        >
          <MenuIcon />
        </IconButton>
        <img onClick={() => navigate('/')} style={{cursor: 'pointer'}} src={logo} alt="PCIT-VR" className={classes.logo} />
        <Box className={classes.box}/>
        <IconButton edge="end" color="inherit" aria-label="log-out" onClick={() => navigate('/settings')}>
          <SettingsIcon />
        </IconButton>
        <IconButton edge="end" color="inherit" aria-label="log-out" onClick={() => {dispatch(logOut()); navigate('/')}}>
          <ExitToAppIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;
