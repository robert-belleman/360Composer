/**
 * FilterOptions.tsx
 *
 * This component provides filtering options for the media library.
 * It includes options to filter by asset type, view type, duration,
 * and filter setting (Any or All).
 *
 */

import React, { ChangeEvent, useRef, useState } from "react";

import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";
import FilterListIcon from "@mui/icons-material/FilterList";
import { Box, Button, Divider, Menu, MenuItem, TextField } from "@mui/material";

import { useAssetsContext } from "./AssetsContext";

const SELECTED_COLOR = "paleturquoise";
const FILTER_VIDEO = "asset_type:AssetType.Video";
const FILTER_MODEL = "asset_type:AssetType.Model";
const FILTER_MONOSCOPIC = "view_type:ViewType.Mono";
const FILTER_SIDEBYSIDE = "view_type:ViewType.sidetoside";
const FILTER_TOP_BOTTOM = "view_type:ViewType.toptobottom";

interface FilterMenuItemProps {
  onClick: () => void;
  selected: boolean;
  label: string;
}

const FilterMenuItem: React.FC<FilterMenuItemProps> = ({
  onClick,
  label,
  selected,
}) => (
  <MenuItem
    onClick={onClick}
    disableRipple
    selected={selected}
    style={{
      backgroundColor: selected ? SELECTED_COLOR : "transparent",
    }}
  >
    {label}
  </MenuItem>
);

interface DurationFilterItemProps {
  label: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onApply: () => void;
  icon: React.ReactNode;
  type: string;
}

const FilterTextfieldItem: React.FC<DurationFilterItemProps> = ({
  label,
  value,
  onChange,
  onApply,
  icon,
  type,
}) => (
  <MenuItem>
    <TextField
      label={label}
      type={type}
      value={value}
      onChange={onChange}
      size="small"
    />
    <Button onClick={onApply}>{icon}</Button>
  </MenuItem>
);

const FilterOptions: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [durationFilterShorter, setDurationFilterShorter] =
    useState<string>("");
  const [durationFilterLonger, setDurationFilterLonger] = useState<string>("");
  const [searchFilter, setSearchFilter] = useState<string>("");
  const { filterOptions, toggleFilter, filterSetting, changeFilterSetting } =
    useAssetsContext();
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleFilterChange = (filter: string) => {
    toggleFilter(filter);
  };

  const handleSearchFilterChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchFilter(event.target.value);
  };

  const handleDurationFilterShorterChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    setDurationFilterShorter(event.target.value);
  };

  const handleDurationFilterLongerChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    setDurationFilterLonger(event.target.value);
  };

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

  return (
    <Box marginX={1}>
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
        <FilterMenuItem
          onClick={() => handleFilterChange(FILTER_VIDEO)}
          selected={filterOptions.includes(FILTER_VIDEO)}
          label="Video"
        />
        <FilterMenuItem
          onClick={() => handleFilterChange(FILTER_MODEL)}
          selected={filterOptions.includes(FILTER_MODEL)}
          label="Model"
        />
        <Divider sx={{ my: 0.5 }} />
        <FilterMenuItem
          onClick={() => handleFilterChange(FILTER_MONOSCOPIC)}
          selected={filterOptions.includes(FILTER_MONOSCOPIC)}
          label="Monoscopic"
        />
        <FilterMenuItem
          onClick={() => handleFilterChange(FILTER_SIDEBYSIDE)}
          selected={filterOptions.includes(FILTER_SIDEBYSIDE)}
          label="Side-By-Side"
        />
        <FilterMenuItem
          onClick={() => handleFilterChange(FILTER_TOP_BOTTOM)}
          selected={filterOptions.includes(FILTER_TOP_BOTTOM)}
          label="Top-Bottom"
        />
        <Divider sx={{ my: 0.5 }} />
        <FilterTextfieldItem
          type="text"
          label="Search..."
          value={searchFilter}
          onChange={handleSearchFilterChange}
          onApply={() => toggleFilter(`name:${searchFilter}`)}
          icon={
            isFilterApplied(`name:${searchFilter}`) ? (
              <ClearIcon sx={{ color: "red" }} />
            ) : (
              <CheckIcon sx={{ color: "green" }} />
            )
          }
        />
        <Divider sx={{ my: 0.5 }} />
        <FilterTextfieldItem
          type="number"
          label="Shorter than (seconds)"
          value={durationFilterShorter}
          onChange={handleDurationFilterShorterChange}
          onApply={handleApplyDurationFilterShorter}
          icon={
            isFilterApplied(`duration<:${durationFilterShorter}`) ? (
              <ClearIcon sx={{ color: "red" }} />
            ) : (
              <CheckIcon sx={{ color: "green" }} />
            )
          }
        />
        <FilterTextfieldItem
          type="number"
          label="Longer than (seconds)"
          value={durationFilterLonger}
          onChange={handleDurationFilterLongerChange}
          onApply={handleApplyDurationFilterLonger}
          icon={
            isFilterApplied(`duration>:${durationFilterLonger}`) ? (
              <ClearIcon sx={{ color: "red" }} />
            ) : (
              <CheckIcon sx={{ color: "green" }} />
            )
          }
        />
        <Divider sx={{ my: 0.5 }} />
        <FilterMenuItem
          onClick={() => changeFilterSetting("any")}
          selected={filterSetting === "any"}
          label="Any"
        />
        <FilterMenuItem
          onClick={() => changeFilterSetting("all")}
          selected={filterSetting === "all"}
          label="All"
        />
      </Menu>
    </Box>
  );
};

export default FilterOptions;
