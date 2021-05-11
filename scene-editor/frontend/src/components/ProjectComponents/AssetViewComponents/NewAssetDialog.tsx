import React, {useState, useEffect} from 'react';

import {concat} from 'lodash'

import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Chip from '@material-ui/core/Chip';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import LinearProgress from '@material-ui/core/LinearProgress';
import axios from "axios";
import NewAssetDropzone from './NewAssetDropzone';


type NewAssetDialog = {
    activeProject: string;
    open: boolean;
    closeHandler: any;
    onAssetCreated: any;
};

const NewAssetDialog: React.FC<NewAssetDialog> = ({activeProject, open, closeHandler, onAssetCreated}) => {
  const [showProgress, setShowProgess] = useState(false);
  const [files, setFiles] = useState([] as any[])

  const createAsset = async () => {
    setShowProgess(true);

    const requests = files.map((file:any) => {
      const data = new FormData(); 
      // @ts-ignore: 
      data.append("file", file)
      
      return axios.post(`/api/project/${activeProject}/assets?name=${file.name}`, data)
    })

    Promise.all(requests)
      .then(() => { 
        setShowProgess(false);
        setFiles([]);
        onAssetCreated();
      })
      .catch((e) => {
        console.log(e)
      });
  };

  const removeElement = (index:number) => {
    return files.reduce((acc:any[], elem:any, i:number) => {
      if (i === index) {
        return acc;
      }

      return concat(acc, elem);
    }, [])
  }

  const renderFileChips = () => files.map((file:any, i) => {
    return (
      <Grid key={`chip-${i}`} item xs={12}>
        <Chip
          size="small"
          key={`file-${i}`}
          style={{marginTop: 10, marginBottom: 10}}
          label={file.name}
          onDelete={() => setFiles(removeElement(i))}
        />
      </Grid>
    )
  })

  const addFiles = (selectedFiles:any[]) => {
    setFiles(files => [...files, ...selectedFiles])
  }

  return (
      <Dialog open={open} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">New Asset</DialogTitle>
        <DialogContent>
          <Grid container style={{maxHeight: '200px', width:'200px', marginBottom: '20px', overflow:'auto'}}>
            { renderFileChips() }
          </Grid>
          <NewAssetDropzone onFileSelect={addFiles} />
        </DialogContent>
        {showProgress  ? <LinearProgress /> : ""}
        <DialogActions>
          <Button onClick={() => closeHandler(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={createAsset} color="primary">
            Create
          </Button>
        </DialogActions>
      </Dialog>
  );
}
export default NewAssetDialog;
