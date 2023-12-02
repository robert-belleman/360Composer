/**
 * SortingOptions.tsx
 *
 * This component provides sorting options for the media library.
 * It includes options to sort by name and data in ascending or
 * descending order.
 *
 */

// Import statements
import SwapVertIcon from "@mui/icons-material/SwapVert";
import { Box, Button, Divider, Menu, MenuItem } from "@mui/material";
import React, { useRef, useState } from "react";
import { useAssetsContext } from "./AssetsContext";

const SELECTED_COLOR = "paleturquoise";

// Component definition
const SortingOptions = () => {
  // State and context hooks
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { sortOption, orderOption, changeSorting, changeOrdering } =
    useAssetsContext();
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  // State for menu open/close
  const open = Boolean(anchorEl);

  // Event handlers
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSortOptionChange = (option: string) => {
    changeSorting(option);
    handleClose();
  };

  const handleOrderOptionChange = (option: string) => {
    changeOrdering(option);
    handleClose();
  };

  // JSX structure
  return (
    <Box marginX={1}>
      {/* Sort button */}
      <Button
        ref={buttonRef}
        id="sort-button"
        aria-controls="sort-menu"
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        variant="outlined"
        disableElevation
        onClick={handleClick}
        startIcon={<SwapVertIcon />}
        style={{ width: "100%" }}
      >
        Sort By
      </Button>

      {/* Sort menu */}
      <Menu
        id="sort-menu"
        MenuListProps={{ "aria-labelledby": "sort-button" }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        {/* Name option */}
        <MenuItem
          onClick={() => handleSortOptionChange("name")}
          disableRipple
          selected={sortOption === "name"}
          style={{
            backgroundColor:
              sortOption === "name" ? SELECTED_COLOR : "transparent",
          }}
        >
          Name
        </MenuItem>

        {/* Date option */}
        <MenuItem
          onClick={() => handleSortOptionChange("date")}
          disableRipple
          selected={sortOption === "date"}
          style={{
            backgroundColor:
              sortOption === "date" ? SELECTED_COLOR : "transparent",
          }}
        >
          Date
        </MenuItem>

        {/* Divider */}
        <Divider sx={{ my: 0.5 }} />

        {/* Ascending option */}
        <MenuItem
          onClick={() => handleOrderOptionChange("asc")}
          disableRipple
          selected={orderOption === "asc"}
          style={{
            backgroundColor:
              orderOption === "asc" ? SELECTED_COLOR : "transparent",
          }}
        >
          Ascending
        </MenuItem>

        {/* Descending option */}
        <MenuItem
          onClick={() => handleOrderOptionChange("desc")}
          disableRipple
          selected={orderOption === "desc"}
          style={{
            backgroundColor:
              orderOption === "desc" ? SELECTED_COLOR : "transparent",
          }}
        >
          Descending
        </MenuItem>
      </Menu>
    </Box>
  );
};

// Export the component
export default SortingOptions;
