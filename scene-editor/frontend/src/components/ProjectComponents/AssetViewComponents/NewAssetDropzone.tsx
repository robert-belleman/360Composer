import React, {useCallback} from 'react';

import {FileWithPath, useDropzone} from 'react-dropzone';
import styled from 'styled-components';

const getColor = (props:any) => {
  if (props.isDragAccept) {
      return '#00e676';
  }
  if (props.isDragReject) {
      return '#ff1744';
  }
  if (props.isDragActive) {
      return '#2196f3';
  }
  return '#eeeeee';
}

const Container = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  border-width: 2px;
  border-radius: 2px;
  border-color: ${props => getColor(props)};
  border-style: dashed;
  background-color: #fafafa;
  color: #bdbdbd;
  outline: none;
  transition: border .24s ease-in-out;
`;

const NewAssetDialog = (props: any) => {
  const { onFileSelect } = props; // Destructure the specific prop you need

  const onDrop = useCallback((acceptedFiles: FileWithPath[]) => {
    onFileSelect(acceptedFiles)
  }, [onFileSelect])

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject
  } = useDropzone({onDrop, multiple: true, accept:".mp4,.glb"});
  
  return (
    <div className="container">
      <Container {...getRootProps({isDragActive, isDragAccept, isDragReject})}>
        <input {...getInputProps()} />
        <p>Drag and drop files here, or click to select manually</p>
      </Container>
    </div>
  );
}

export default NewAssetDialog;
