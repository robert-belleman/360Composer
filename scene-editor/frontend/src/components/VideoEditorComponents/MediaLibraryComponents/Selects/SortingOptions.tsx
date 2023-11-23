import React, { useState, useRef } from "react";
import { Box, Button, Divider, Menu, MenuItem } from "@mui/material";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import { useAssetsContext } from "../AssetsContext";

const SortingOptions = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { sortOption, orderOption, changeSorting, changeOrdering } =
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

  const handleSortOptionChange = (option: string) => {
    changeSorting(option);
    handleClose();
  };

  const handleOrderOptionChange = (option: string) => {
    changeOrdering(option);
    handleClose();
  };

  return (
    <Box width={1}>
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
      <Menu
        id="sort-menu"
        MenuListProps={{ "aria-labelledby": "sort-button" }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        <MenuItem
          onClick={() => handleSortOptionChange("name")}
          disableRipple
          selected={sortOption === "name"}
          style={{
            backgroundColor: sortOption === "name" ? color : "transparent",
          }}
        >
          Name
        </MenuItem>
        <MenuItem
          onClick={() => handleSortOptionChange("date")}
          disableRipple
          selected={sortOption === "date"}
          style={{
            backgroundColor: sortOption === "date" ? color : "transparent",
          }}
        >
          Date
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem
          onClick={() => handleOrderOptionChange("asc")}
          disableRipple
          selected={orderOption === "asc"}
          style={{
            backgroundColor: orderOption === "asc" ? color : "transparent",
          }}
        >
          Ascending
        </MenuItem>
        <MenuItem
          onClick={() => handleOrderOptionChange("desc")}
          disableRipple
          selected={orderOption === "desc"}
          style={{
            backgroundColor: orderOption === "desc" ? color : "transparent",
          }}
        >
          Descending
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default SortingOptions;
