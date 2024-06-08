import {
  Box,
  Divider,
  Drawer,
  IconButton,
  Stack,
  Typography,
  styled,
} from "@mui/material";
import { items } from "./items";
import { SideNavItem } from "./SideNavItems";
import SimpleBar from "simplebar-react";
import * as React from "react";
import MenuIcon from "@mui/icons-material/Menu";
import { useTheme } from "@mui/material/styles";

const Logo = () => {
  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <img
        src="/logo.webp"
        alt="adassadsd"
        width={64}
        height={64}
        style={{ filter: "brightness(1)" }}
        className="hover:brightness-90"
      />
      <Typography>DATONS</Typography>
    </Box>
  );
};

const Scrollbar = styled(SimpleBar)(({ theme }) => ({
  "& .simplebar-content": {
    height: "100%",
  },
  "& .simplebar-scrollbar:before": {
    backgroundColor: theme.palette.mode === "dark" ? "#718096" : "#A0AEC0", // dark: neutral.400
  },
  "& .simplebar-placeholder": {
    display: "none",
  },
}));

export const SideNav = ({ open, setOpenNav }) => {
  const theme = useTheme(); // Access the theme for dark mode support
  const authToken = JSON.parse(localStorage.getItem("authToken"));
  const userRole = authToken?.user?.role;

  const content = (
    <Scrollbar
      sx={{
        "& .simplebar-content": {
          height: "100%",
        },
        "& .simplebar-scrollbar:before": {
          backgroundColor:
            theme.palette.mode === "dark" ? "#718096" : "#A0AEC0", // dark: neutral.400
        },
        "& .simplebar-placeholder": {
          display: "none",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        <Box
          sx={{
            p: 3,
            display: "flex",
            height: 64,
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box
            href="/"
            sx={{
              display: "inline-flex",
              height: 64,
              width: 64,
            }}
          >
            <Logo />
          </Box>
          <IconButton onClick={() => setOpenNav(!open)}>
            <MenuIcon color="primary" />
          </IconButton>
        </Box>
        <Divider
          sx={{
            borderColor: theme.palette.mode === "dark" ? "#4a5568" : "#e2e8f0",
          }}
        />{" "}
        {/* dark: border-gray-700 */}
        <Box
          component="nav"
          sx={{
            flexGrow: 1,
            px: 2,
            py: 3,
            color: theme.palette.mode === "dark" ? "#ffffff" : "#111927", // dark: text-white, light: text-black
          }}
        >
          <Stack
            component="ul"
            spacing={0.5}
            sx={{
              listStyle: "none",
              p: 0,
              m: 0,
            }}
          >
            {items.map((item) => {
              return (
                <SideNavItem
                  active={true}
                  disabled={item?.disabled}
                  external={item?.external}
                  icon={item.icon}
                  key={item.title}
                  path={item.path}
                  title={item.title}
                  userRole={userRole}
                  permission={item.permission}
                />
              );
            })}
          </Stack>
        </Box>
        <Divider
          sx={{
            borderColor: theme.palette.mode === "dark" ? "#4a5568" : "#e2e8f0",
          }}
        />{" "}
        {/* dark: border-gray-700 */}
      </Box>
    </Scrollbar>
  );

  return (
    <Drawer
      sx={{
        width: 280,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: 280,
          boxSizing: "border-box",
        },
      }}
      variant="persistent"
      anchor="left"
      open={open}
      PaperProps={{
        sx: {
          backgroundColor:
            theme.palette.mode === "dark" ? "#111927" : "#ffffff", // dark: bg-gray-900, light: bg-white
          color: theme.palette.mode === "dark" ? "#ffffff" : "#111927", // dark: text-white, light: text-black
          width: 280,
        },
      }}
    >
      {content}
    </Drawer>
  );
};
