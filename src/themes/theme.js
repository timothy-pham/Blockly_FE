import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "hsl(12, 90%, 63%)", // Custom primary color
    },
    background: {
      default: "hsl(12, 90%, 63%)", // Background color
    },
    text: {
      primary: "#333333", // Primary text color
      secondary: "#555555", // Secondary text color
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          color: "#FFFFFF",
          //   backgroundColor: "hsl(12, 90%, 63%)",
          "&:hover": {
            backgroundColor: "hsl(12, 100%, 60%)",
          },
          borderRadius: "8px", // Custom button border radius
          textTransform: "none", // Prevent uppercase text by default
          "&.Mui-disabled": {
            color: "#BBBBBB", // Disabled text color
            backgroundColor: "#E0E0E0", // Disabled background color
          },
        },
      },
    },
  },
});

export default theme;
