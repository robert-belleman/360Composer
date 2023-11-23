import React, { useState, useRef } from "react";
import { Box, Button, Divider, Menu, MenuItem, TextField } from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import { useAssetsContext } from "../AssetsContext";

const FilterOptions = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [durationFilterShorter, setDurationFilterShorter] =
    useState<string>("");
  const [durationFilterLonger, setDurationFilterLonger] = useState<string>("");

  const { filterOptions, toggleFilter, filterSetting, changeFilterSetting } =
    useAssetsContext();
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const open = Boolean(anchorEl);

  const color = "paleturquoise";

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleFilterChange = (filter: string) => {
    toggleFilter(filter);
  };

  const handleDurationFilterShorterChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setDurationFilterShorter(event.target.value);
  };

  const handleDurationFilterLongerChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setDurationFilterLonger(event.target.value);
  };

  /**
   * Use regular expression to convert MM:SS format to seconds.
   * @param value string representation of time.
   * @returns numerical time value of string in seconds. NaN on parse error.
   */
  const convertMMSSToSeconds = (value: string) => {
    let filterValueInSeconds = Number(value);

    // Check if the entered value is in "MM:SS" format
    const mmssPattern = /^([0-5][0-9]):([0-5][0-9])$/;
    const mmssMatch = value.match(mmssPattern);

    if (mmssMatch) {
      const minutes = parseInt(mmssMatch[1], 10);
      const seconds = parseInt(mmssMatch[2], 10);
      filterValueInSeconds = minutes * 60 + seconds;
    }

    return filterValueInSeconds;
  };

  const handleApplyDurationFilterShorter = () => {
    if (durationFilterShorter !== "") {
      const filterValueInSeconds = convertMMSSToSeconds(durationFilterShorter);
      if (isNaN(filterValueInSeconds)) return;
      const filter = `duration<:${filterValueInSeconds.toFixed(0)}`;
      toggleFilter(filter);
    }
  };

  const handleApplyDurationFilterLonger = () => {
    if (durationFilterLonger !== "") {
      const filterValueInSeconds = convertMMSSToSeconds(durationFilterLonger);
      if (isNaN(filterValueInSeconds)) return;
      const filter = `duration>:${filterValueInSeconds.toFixed(0)}`;
      toggleFilter(filter);
    }
  };

  const isFilterApplied = (filter: string) => filterOptions.includes(filter);

  const getButtonLabel = (filter: string) => {
    return isFilterApplied(filter) ? "Remove" : "Apply";
  };

  return (
    <Box width={1}>
      <Button
        ref={buttonRef}
        id="filter-button"
        aria-controls="filter-menu"
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        variant="outlined"
        disableElevation
        onClick={handleClick}
        startIcon={<FilterListIcon />}
        style={{ width: "100%" }}
      >
        Filter By
      </Button>
      <Menu
        id="filter-menu"
        MenuListProps={{ "aria-labelledby": "filter-button" }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        {/* Video | Model */}
        <MenuItem
          onClick={() => handleFilterChange("asset_type:AssetType.Video")}
          disableRipple
          selected={filterOptions.includes("asset_type:AssetType.Video")}
          style={{
            backgroundColor: filterOptions.includes(
              "asset_type:AssetType.Video"
            )
              ? color
              : "transparent",
          }}
        >
          Video
        </MenuItem>
        <MenuItem
          onClick={() => handleFilterChange("asset_type:AssetType.Model")}
          disableRipple
          selected={filterOptions.includes("asset_type:AssetType.Model")}
          style={{
            backgroundColor: filterOptions.includes(
              "asset_type:AssetType.Model"
            )
              ? color
              : "transparent",
          }}
        >
          Model
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />
        {/* Monoscopic | Side-by-Side | Top-Bottom */}
        <MenuItem
          onClick={() => handleFilterChange("view_type:ViewType.Mono")}
          disableRipple
          selected={filterOptions.includes("view_type:ViewType.Mono")}
          style={{
            backgroundColor: filterOptions.includes("view_type:ViewType.Mono")
              ? color
              : "transparent",
          }}
        >
          Monoscopic
        </MenuItem>
        <MenuItem
          onClick={() => handleFilterChange("view_type:ViewType.sidetoside")}
          disableRipple
          selected={filterOptions.includes("view_type:ViewType.sidetoside")}
          style={{
            backgroundColor: filterOptions.includes(
              "view_type:ViewType.sidetoside"
            )
              ? color
              : "transparent",
          }}
        >
          Side-By-Side
        </MenuItem>
        <MenuItem
          onClick={() => handleFilterChange("view_type:ViewType.toptobottom")}
          disableRipple
          selected={filterOptions.includes("view_type:ViewType.toptobottom")}
          style={{
            backgroundColor: filterOptions.includes(
              "view_type:ViewType.toptobottom"
            )
              ? color
              : "transparent",
          }}
        >
          Top-Bottom
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />
        {/* Shorter than | Longer than */}
        <MenuItem>
          <TextField
            label="Shorter than (seconds)"
            type="number"
            value={durationFilterShorter}
            onChange={handleDurationFilterShorterChange}
            size="small"
          />
          <Button onClick={handleApplyDurationFilterShorter}>
            {getButtonLabel(`duration<:${durationFilterShorter}`)}
          </Button>
        </MenuItem>
        <MenuItem>
          <TextField
            label="Longer than (seconds)"
            type="number"
            value={durationFilterLonger}
            onChange={handleDurationFilterLongerChange}
            size="small"
          />
          <Button onClick={handleApplyDurationFilterLonger}>
            {getButtonLabel(`duration>:${durationFilterLonger}`)}
          </Button>
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />
        {/* Any | All */}
        <MenuItem
          onClick={() => changeFilterSetting("any")}
          disableRipple
          selected={filterSetting === "any"}
          style={{
            backgroundColor: filterSetting === "any" ? color : "transparent",
          }}
        >
          Any
        </MenuItem>
        <MenuItem
          onClick={() => changeFilterSetting("all")}
          disableRipple
          selected={filterSetting === "all"}
          style={{
            backgroundColor: filterSetting === "all" ? color : "transparent",
          }}
        >
          All
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default FilterOptions;
