import { Box, ButtonBase } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { isEmpty } from "lodash";

export const SideNavItem = (props) => {
  const {
    active = false,
    disabled,
    external,
    icon,
    path,
    title,
    permission,
    userRole,
  } = props;
  const theme = useTheme();

  if (
    isEmpty(permission) ||
    (!permission.includes("*") && !permission.includes(userRole))
  ) {
    return null;
  }
  const linkProps = path
    ? external
      ? {
          component: "a",
          href: path,
          target: "_blank",
        }
      : {
          href: path,
        }
    : {};

  return (
    <li>
      <ButtonBase
        sx={{
          alignItems: "center",
          borderRadius: 1,
          display: "flex",
          justifyContent: "flex-start",
          pl: "16px",
          pr: "16px",
          py: "6px",
          textAlign: "left",
          width: "100%",
          ...(active && {
            backgroundColor:
              theme.palette.mode === "dark"
                ? "rgba(255, 255, 255, 0.04)"
                : "rgba(0, 0, 0, 0.04)",
          }),
          "&:hover": {
            backgroundColor:
              theme.palette.mode === "dark"
                ? "rgba(255, 255, 255, 0.04)"
                : "rgba(0, 0, 0, 0.04)",
          },
        }}
        {...linkProps}
      >
        {icon && (
          <Box
            component="span"
            sx={{
              alignItems: "center",
              display: "inline-flex",
              justifyContent: "center",
              mr: 2,
              ...(active && {
                color: theme.palette.primary.main,
              }),
            }}
          >
            {icon}
          </Box>
        )}
        <Box
          component="span"
          sx={{
            flexGrow: 1,
            fontFamily: (theme) => theme.typography.fontFamily,
            fontSize: 14,
            fontWeight: 600,
            lineHeight: "24px",
            whiteSpace: "nowrap",
            ...(active && {
              color:
                theme.palette.mode === "dark"
                  ? theme.palette.common.white
                  : theme.palette.common.black,
            }),
            ...(disabled && {
              color: theme.palette.neutral[500],
            }),
          }}
        >
          {title}
        </Box>
      </ButtonBase>
    </li>
  );
};
