import * as React from "react";
import LinearProgress from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

function LinearProgressWithLabel(props) {
  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <Box sx={{ width: "100%", mr: 1 }}>
        <LinearProgress variant="determinate" />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography variant="body2" color="text.secondary">{`${Math.round(
          props?.value
        )}%`}</Typography>
      </Box>
    </Box>
  );
}

export default function LinearWithValueLabel({
  numberQuestions,
  currentQuestionIndex,
}) {
  const averagePercent = numberQuestions ? 100 / numberQuestions : 0;
  const [progress, setProgress] = React.useState(averagePercent);

  React.useEffect(() => {
    if (numberQuestions) {
      setProgress((prevProgress) =>
        prevProgress >= 100 ? 10 : prevProgress + averagePercent
      );
    }
  }, [currentQuestionIndex, numberQuestions, averagePercent]);

  if (!averagePercent) return null;

  return (
    <Box sx={{ width: "100%" }}>
      <LinearProgressWithLabel value={progress} />
    </Box>
  );
}
