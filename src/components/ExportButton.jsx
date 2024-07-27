import { Button, Menu, MenuItem } from "@mui/material";
import { useState } from "react";
import { styled, alpha } from "@mui/material/styles";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

export const ExportExcelMenuButton = (props) => {
  const {
    icon = (
      <svg width="16" height="16" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M20 22H4a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1M8 7v2h8V7zm0 4v2h8v-2zm0 4v2h5v-2z"
        />
      </svg>
    ),
    label = "Xuất dữ liệu (1)",
    color = "success",
    items,
  } = props;

  const StyledMenu = styled((props) => (
    <Menu
      elevation={0}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      {...props}
    />
  ))(({ theme }) => ({
    "& .MuiPaper-root": {
      borderRadius: 6,
      marginTop: theme.spacing(1),
      minWidth: 180,
      color:
        theme.palette.mode === "light"
          ? "rgb(55, 65, 81)"
          : theme.palette.grey[300],
      boxShadow:
        "rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px",
      "& .MuiMenu-list": {
        padding: "4px 0",
      },
    },
  }));

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const onClick = async (click) => {
    try {
      setAnchorEl(null);
      click();
    } catch (e) {}
  };

  return (
    <div>
      <Button
        color={color}
        variant="contained"
        size="small"
        component="a"
        onClick={handleClick}
        sx={{ marginRight: 2 }}
        endIcon={<KeyboardArrowDownIcon />}
        startIcon={icon}
      >
        {label}
      </Button>

      <StyledMenu
        id="demo-customized-menu"
        MenuListProps={{
          "aria-labelledby": "demo-customized-button",
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        {items?.map((item, idx) => {
          const { label = "", handleClick, disabled = false } = item;
          return (
            <MenuItem
              key={idx}
              onClick={() => onClick(handleClick)}
              disableRipple
              disabled={disabled}
            >
              {label}
            </MenuItem>
          );
        })}
      </StyledMenu>
    </div>
  );
};
