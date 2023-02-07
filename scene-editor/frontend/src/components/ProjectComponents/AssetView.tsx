// @ts-nocheck
import React,  { useRef, useEffect, useState } from 'react';
import axios from "axios";

import { range } from 'lodash';

import { makeStyles, createStyles } from '@mui/styles';
import { createTheme } from '@mui/material/styles';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import IconButton from '@mui/material/IconButton';
import Checkbox from '@mui/material/Checkbox';
import Avatar from '@mui/material/Avatar';
import Snackbar from '@mui/material/Snackbar';

import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

import Alert from '@mui/material/Alert';
import Skeleton from '@mui/material/Skeleton';

import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';

import NewAssetDialog from "./AssetViewComponents/NewAssetDialog";

import defaultImage from "../../static/images/default.jpg";

enum AlertType {
  Error,
  Success,
  None
}

type AssetViewProps = {
  activeProject: string;
  fullWidth: boolean;
};

const assetTypeToText = (type:string) => {
  const typeText = {
    'AssetType.video': '360° media',
    'AssetType.model': '3D model'
  }[type]

  return typeText === undefined ? 'Unknown type' : typeText;
}

const viewTypeToText = (viewtype:string) => {
  const viewtypeText = {
    'ViewType.mono': 'Monoscopic',
    'ViewType.sidetoside': 'Side to Side',
    'ViewType.toptobottom': 'Top to Bottom',
  }[viewtype]

  return viewtypeText === undefined ? 'Unknown type' : viewtypeText;
}

const viewTypeToValue = (viewtype:string) => {
  const viewtypeText = {
    'ViewType.mono': 'mono',
    'ViewType.sidetoside': 'sidetoside',
    'ViewType.toptobottom': 'toptobottom',
  }[viewtype]

  return viewtypeText === undefined ? 'Unknown type' : viewtypeText;
}

const AssetsSnackbar = ({open, handleClose, message}:any) => {
  return (
    <Snackbar
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      open={open}
      autoHideDuration={3000}
      onClose={handleClose}
      message={message}
      action={
        <React.Fragment>
          <IconButton size="small" aria-label="close" color="inherit" onClick={handleClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </React.Fragment>
      }
    />
  )
}


const AssetView: React.FC<AssetViewProps> = ({activeProject, fullWidth}) => {
  const [assets, setAssets] = useState([]);
  const [openAssetDialog, setOpenAssetDialog] = useState(false);
  const [checked, setChecked] = useState([] as any[]);
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [alertMessage, setAlertMessage] = useState({show: false, message:"", type: AlertType.None})

  const onAssetCreated = () => {
    setOpenAssetDialog(false);
    setAlertMessage({show: true, message: "Asset(s) successfully created", type: Alert.Success})
    fetchAssets();
  };

  const theme = createTheme();
const useStyles = makeStyles((theme) =>
    createStyles({
      root: {
        flexGrow: 1,
        padding: theme.spacing(2),
      },
      paper: {
        padding: theme.spacing(2),
        boxSizing: 'border-box'
      },
      box: {
        flexGrow: 1
      },
      list: {
        height: fullWidth ? 400 : 300,
        overflow: 'auto'
      },
      header: {
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        fontSize: '1.1rem',
        fontWeight: 700,
        color: '#2196f3',
        marginBottom: 10
      }
    }),
  );

  const fetchAssets = async () => {
    setLoadingAssets(true);
    try {
      const res = await axios.get(`/api/project/${activeProject}/assets`, {});
      setAssets(res.data);
      return setLoadingAssets(false);
    } catch (e) {
      return console.log('error while fetching assets', e);
    }
  };
  
  const handleToggle = (value: number) => () => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
  };

  const handleSelect = async (value: string, id: string) => {
    console.log(value, id);
    await axios.post(`/api/asset/${id}/setview/${value}`)
      .then(() => setAlertMessage({show: true, 
                                   message: `Asset's view type succesfully changed to ${value}`,
                                   type: Alert.Success}))
      .catch((e:any) => console.log('An error occured whilst editing asset "view type"', e))
  };

  const deleteCheckedAssets = () => {
    Promise.all(checked.map((id:any) => axios.post(`/api/asset/${id}/delete`)))
      .then(() => setChecked([]))
      .then(fetchAssets)
      .then(() => setAlertMessage({show: true, message: "Asset(s) successfully deleted", type: Alert.Success}))
      .catch((e:any) => console.log('An error occured whilst deleting assets', e))
  };

  // use this to fetch the projects assets
  useEffect(() => {
    fetchAssets();
  }, [activeProject]);
  
  const classes = useStyles();

  const renderAssets = () => {
    if (assets.length === 0) {
      return <Typography variant="subtitle1" component="p">No assets have been added yet</Typography>
    }

    return assets.map((asset: any) => (
      <ListItem key={asset.id} button>
        <ListItemAvatar>
        <Avatar
            alt={asset.name}
            src={asset.thumbnail_path ? `/api/asset/${asset.id}/thumbnail` : defaultImage}
        />
        </ListItemAvatar>
        <ListItemText id={asset.id} primary={asset.name} secondary={assetTypeToText(asset.asset_type) + ', ' + viewTypeToText(asset.view_type)} />
        <ListItemSecondaryAction>
            <Select
              labelId="viewtype"
              id="viewtype-select"
              value={viewTypeToValue(asset.view_type)}
              label="View Type"
              onChange={(event) => handleSelect(event.target.value, asset.id)}
              autoWidth={true}
            >
              <MenuItem value={"mono"}>Monoscopic</MenuItem>
              <MenuItem value={"sidetoside"}>Side to Side</MenuItem>
              <MenuItem value={"toptobottom"}>Top to Bottom</MenuItem>
            </Select>
            <Checkbox
              edge="end"
              onChange={handleToggle(asset.id)}
              checked={checked.indexOf(asset.id) !== -1}
              inputProps={{ 'aria-labelledby': asset.id }}
            />
        </ListItemSecondaryAction>
      </ListItem>
    ))
  }

  const renderAssetsList = () => {
    if (loadingAssets) {
      return (
        <div className={classes.list}>
          {range(6).map((elem:number) => ( <Skeleton key={elem} animation="wave" /> ))}
        </div>
      )
    }

    return (<List className={classes.list}>{renderAssets()}</List>)
  }

  return (
    <Paper elevation={0} variant="outlined" className={classes.paper}>
      <Typography variant="h4" component="p" className={classes.header}><PhotoLibraryIcon style={{marginRight:5}}/> 1. Assets</Typography>
      {renderAssetsList()}
      <Grid container>
        <Grid item xs={4}>
          <Button style={{marginTop: 10}} color="primary" startIcon={<AddIcon />} onClick={() => setOpenAssetDialog(true)}>Add Asset</Button>
        </Grid>
        <Grid item xs={2}>
          <Box className={classes.box}></Box>
        </Grid>
        <Grid item xs={6}>
          <Button 
            style={{marginTop: 10}}
            color="secondary"
            startIcon={<DeleteIcon />}
            disabled={checked.length === 0}
            onClick={deleteCheckedAssets}>Delete Assets</Button>
        </Grid>
      </Grid>
      <NewAssetDialog activeProject={activeProject} open={openAssetDialog} closeHandler={() => setOpenAssetDialog(false)} onAssetCreated={onAssetCreated} />
      <AssetsSnackbar open={alertMessage.show} message={alertMessage.message} handleClose={() => setAlertMessage({...alertMessage, show: false})} />
    </Paper>
  );
};

export default AssetView;
