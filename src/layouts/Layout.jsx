import React, {
  useCallback,
  useEffect,
  useState,
  useContext,
  useRef,
} from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Avatar,
  IconButton,
  Toolbar,
  Badge,
  Menu,
  MenuItem,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AuthContext from "../pages/auth/AuthContext/AuthContext";
import MuiAppBar from "@mui/material/AppBar";
import { SideNav } from "./SideNav";
import { get, set } from "lodash";
import { ContactButton } from "../components/ContactButton/ContactButton";
import { socket } from "../socket";
import EmailIcon from "@mui/icons-material/Email";
import { styled } from "@mui/material/styles";
import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";

const drawerWidth = 280;
const appBarHeight = 64;

const LayoutContainer = styled("div")(({ theme }) => ({
  display: "flex",
  flex: "1 1 auto",
  flexDirection: "column",
  width: "100%",
  backgroundColor: "#f0f0f0",
  minHeight: "94vh",
  padding: theme.spacing(3),
  overflow: "hidden",
}));

const Main = styled("main", { shouldForwardProp: (prop) => prop !== "open" })(
  ({ theme, open }) => ({
    flexGrow: 1,
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: open ? drawerWidth : 0,
    width: `calc(100% - ${open ? drawerWidth : 0}px)`,
    position: "relative",
    marginTop: appBarHeight,
  })
);

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  position: "fixed",
  top: 0,
  zIndex: 50,
  width: "100%",
  backgroundColor: theme.palette.mode === "dark" ? "#2d3748" : "#ffffff",
  borderBottom: `1px solid ${theme.palette.mode === "dark" ? "#4a5568" : "#e2e8f0"
    }`,
  transition: theme.transitions.create(["margin", "width"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth,
    height: appBarHeight,
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

export const Layout = () => {
  const { pathname } = useLocation();
  const [openNav, setOpenNav] = useState(true);
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [openContact, setOpenContact] = useState(false);
  const [inviteData, setInviteData] = useState([]);
  const [openInvite, setOpenInvite] = useState(false);

  const dropdownRef = useRef(null); // Create a ref for the dropdown

  const [avatar, setAvatar] = useState(""); // State for the avatar

  const info = localStorage.getItem("authToken");
  const user = get(JSON.parse(info), "user", {});

  // Set initial avatar from localStorage
  useEffect(() => {
    setAvatar(user?.meta_data?.avatar || "");
  }, [user]);

  // Listen for localStorage changes
  useEffect(() => {
    socket.emit("user_connected", user);
    const handleStorageChange = () => {
      const updatedUser = get(
        JSON.parse(localStorage.getItem("authToken")),
        "user",
        {}
      );
      setAvatar(updatedUser?.meta_data?.avatar || "");
    };

    const oldInviteData = localStorage.getItem("inviteData");
    if (oldInviteData) {
      setInviteData(JSON.parse(oldInviteData));
    }

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  useEffect(() => {
    socket.on("invite_user", (data) => {
      setInviteData((prev) => {
        let isExist = false;
        for (let i = 0;i < prev.length;i++) {
          if (prev[i].room.room_id === data.room.room_id) {
            isExist = true;
            break;
          }
        }
        if (isExist) {
          return prev;
        }

        const updatedInviteData = [...prev, data];
        localStorage.setItem("inviteData", JSON.stringify(updatedInviteData));
        return updatedInviteData;
      });
    });

    return () => {
      socket.off("invite_user");
    };
  }, [socket]);

  const toggleUserDropdown = () => {
    setIsUserDropdownOpen(!isUserDropdownOpen);
  };

  const closeUserDropdown = useCallback(() => {
    setIsUserDropdownOpen(false);
  }, []);

  // Close the dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        closeUserDropdown();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [closeUserDropdown]);

  useEffect(() => {
    if (pathname.includes("/play") || pathname.includes("/watch")) {
      setOpenNav(false);
      setOpenContact(false);
    } else if (pathname.includes("/message")) {
      setOpenContact(false);
      setOpenNav(true);
    } else {
      setOpenContact(true);
      setOpenNav(true);
    }
  }, [pathname]);

  const handleLogout = () => {
    logout();
    navigate(`/login`);
  };

  const getName = (name) => {
    if (!name) return "";
    const names = name.split(" ");
    const initials = names.map((n) => n.charAt(0).toUpperCase());
    return initials.join("");
  };

  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event?.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <AppBar position="fixed" open={openNav}>
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: !openNav ? "space-between" : "flex-end",
          }}
        >
          <IconButton
            aria-label="open drawer"
            onClick={() => setOpenNav(!openNav)}
            edge="start"
            sx={{ mr: 2, ...(openNav && { display: "none" }) }}
          >
            <MenuIcon color="primary" />
          </IconButton>

          {inviteData.length > 0 && (
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              {inviteData.map((row, index) => {
                const room = row.room;
                const user_from = row.user_from;
                return (
                  <MenuItem>
                    <div className="flex items-center ">
                      <img
                        src={
                          user_from?.meta_data?.avatar || "/default_avatar.png"
                        }
                        className="w-8 h-8 rounded-full  object-cover mr-2"
                        referrerPolicy="no-referrer"
                      />
                      <div className="font-bold">{user_from.name}</div>
                      <div className="ms-1">mời bạn tham gia phòng</div>
                      <div className="ms-1 font-bold">{room.name}</div>
                    </div>
                    <div className="flex ml-2">
                      <IconButton
                        color="success"
                        onClick={() => {
                          navigate(`/rooms/${room.room_id}`);
                          setInviteData((prev) => {
                            const newData = prev.filter(
                              (item) => item.room.room_id !== room.room_id
                            );
                            localStorage.setItem(
                              "inviteData",
                              JSON.stringify(newData)
                            );
                            return newData;
                          });
                          setOpenInvite(false);
                        }}
                      >
                        <CheckIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => {
                          setInviteData((prev) => {
                            const newData = prev.filter(
                              (item) => item.room.room_id !== room.room_id
                            );
                            localStorage.setItem(
                              "inviteData",
                              JSON.stringify(newData)
                            );
                            return newData;
                          });
                        }}
                      >
                        <ClearIcon />
                      </IconButton>
                    </div>
                  </MenuItem>
                );
              })}
            </Menu>
          )}
          <div className="flex">
            <Badge
              badgeContent={inviteData.length}
              color="error"
              sx={{
                fontSize: 12,
                fontWeight: "bold",
                marginRight: 1,
                "& .MuiBadge-badge": {
                  right: 5,
                  top: 8,
                },
              }}
            >
              <IconButton aria-label="Mời" onClick={handleClick}>
                <EmailIcon />
              </IconButton>
            </Badge>
            {avatar ? (
              <img
                className="cursor-pointer w-8 h-8 rounded-full"
                src={avatar}
                aria-expanded={isUserDropdownOpen}
                onClick={toggleUserDropdown}
                referrerPolicy="no-referrer"
              />
            ) : (
              <div
                aria-expanded={isUserDropdownOpen}
                onClick={toggleUserDropdown}
                style={{ backgroundColor: "#1976d2" }}
                className="w-8 h-8 rounded-full mr-2 flex items-center justify-center text-white font-bold select-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-600"
              >
                {getName(user?.name)}
              </div>
            )}

            <div
              ref={dropdownRef} // Attach ref to the dropdown
              className={`z-50 ${isUserDropdownOpen ? "" : "hidden"
                } my-4 text-base list-none bg-white divide-y divide-gray-100 rounded-lg shadow dark:bg-gray-700 dark:divide-gray-600 fixed top-[30px] right-[23px]`}
              id="user-dropdown"
            >
              <div className="px-4 py-3">
                <span className="block text-sm text-gray-900 dark:text-white">
                  {user?.name}
                </span>
                <span className="block text-sm text-gray-500 truncate dark:text-gray-400">
                  {user?.username}
                </span>
              </div>
              <ul className="py-2" aria-labelledby="user-menu-button">
                <li>
                  <a
                    onClick={() => navigate("/profile")}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
                  >
                    Trang cá nhân
                  </a>
                </li>
              </ul>
              <ul className="py-2" aria-labelledby="user-menu-button">
                <li>
                  <a
                    onClick={handleLogout}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
                  >
                    Đăng xuất
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </Toolbar>
      </AppBar>
      <SideNav setOpenNav={setOpenNav} open={openNav} />
      <Main open={openNav}>
        <LayoutContainer style={{
          padding: 0
        }}>
          <Outlet />
          {openContact && <ContactButton />}
        </LayoutContainer>
      </Main>
    </>
  );
};
