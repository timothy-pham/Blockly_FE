import React from "react";
import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import { useLoader } from "./LoaderContext";
import { styled } from "@mui/material";

export const Loader = () => {
  const { loading } = useLoader();

  return loading ? (
    <LoaderWrapper>
      <LinearProgress color="primary" />
    </LoaderWrapper>
  ) : null;
};

const LoaderWrapper = styled("div")(({ theme }) => ({
  position: "fixed",
  top: 0,
  left: 0,
  zIndex: 2001,
  width: "100%",
  "& > * + *": {
    marginTop: theme.spacing(2),
  },
}));
