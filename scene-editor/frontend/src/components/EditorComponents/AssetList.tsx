import React, {useEffect, useState} from "react";
import axios from "axios";

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import Avatar from '@material-ui/core/Avatar';
import CategoryIcon from '@material-ui/icons/Category';
import Tooltip from '@material-ui/core/Tooltip';

import "./AssetList.scss";

type AssetListProps = {
  activeProject: string;
  onAddAsset: (assetID: string) => void;
};

type AssetListItemProps = {
  assetName: string;
  assetID: string;
  onAddAsset: (assetID: string) => void;
}

const AssetListItem: React.FC<AssetListItemProps> = ({assetName, assetID, onAddAsset}) => {
  return (
    <ListItem key={assetID}>
      <ListItemAvatar>
        <Avatar>
          <CategoryIcon />
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={assetName}
      />
      <ListItemSecondaryAction>
      <Tooltip title="Add to scene" arrow>
        <IconButton edge="end" aria-label="add to scene" onClick={() => {onAddAsset(assetID)}}>
          <AddIcon />
        </IconButton>
      </Tooltip>
      </ListItemSecondaryAction>
    </ListItem>
  );
}

const AssetList: React.FC<AssetListProps> = ({activeProject, onAddAsset}) => {

  const [assets, setAssets] = useState([]);

  useEffect(() => {
    if (activeProject !== undefined)
      fetchProjectAssets();
  }, [activeProject]);

  const fetchProjectAssets = async () => {
    axios
      .get(`/api/project/` + activeProject + `/objects`, )
      .then((res) => {
        setAssets(res.data);
       })
      .catch(() => {
          console.error("Error in fetching project assets");
      });
  };

  const renderAssetList = () => {
    if (assets.length === 0) {
      return <p style={{textAlign: 'center'}}>No assets have been added yet...</p>
    }

    return (
      <List dense={true}>
        {assets.map((asset: any) => {
          return (
            <AssetListItem assetName={asset.name} assetID={asset.id} onAddAsset={onAddAsset}/>
          );
        })}
      </List>
    )
  }

  return (
    <div className="">
      <div className="assetList">
        {renderAssetList()}
      </div>
    </div>
  );
}

export default AssetList;

