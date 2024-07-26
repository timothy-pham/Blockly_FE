import React, {
  useCallback,
  useEffect,
  useState,
  useContext,
  useRef,
} from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Avatar, Dialog, IconButton, Table, TableBody, TableCell, TableContainer, TableRow, Toolbar, Typography, Button, styled, DialogContent, Badge } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AuthContext from "../pages/auth/AuthContext/AuthContext";
import MuiAppBar from "@mui/material/AppBar";
import { SideNav } from "./SideNav";
import { get, set } from "lodash";
import { ContactButton } from "../components/ContactButton/ContactButton";
import { socket } from "../socket";
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
        prev.push(data);
        localStorage.setItem("inviteData", JSON.stringify(prev));
        return prev;
      });
    });

    return () => {
      socket.off("invite_user");
    }
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
    if (pathname.includes("/play")) {
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

  return (
    <>
      <AppBar position="fixed" open={openNav}>
        <Dialog
          open={openInvite}
          onClose={() => setOpenInvite(false)}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          maxWidth="lg"
        >
          <DialogContent style={{ width: 800 }}>
            <Typography variant="h6" id="alert-dialog-title">
              Danh sách lời mời
            </Typography>
            <TableContainer
              sx={{
                height: '100%',
              }}
            >
              <Table aria-label="simple table">
                <TableBody >
                  {inviteData.map((row, index) => {
                    const room = row.room
                    const user_from = row.user_from
                    return (
                      <TableRow key={index}>
                        <TableCell component="th" scope="row">
                          <div className="flex items-center ">
                            <img
                              src={user_from?.meta_data?.avatar || "/default_avatar.png"}
                              className="w-8 h-8 rounded-full  object-cover mr-2"
                            />
                            <div
                              className="font-bold"
                            >{user_from.name}</div>
                            <div className="ms-1">
                              mời bạn tham gia phòng
                            </div>
                            <div className="ms-1 font-bold">
                              {room.name}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="mt-1 text-center">
                            Chủ đề: {room.meta_data?.group_data?.name}
                          </div>
                        </TableCell>
                        <TableCell style={{ width: '20%', alignItems: 'right' }}>
                          <div
                            className="flex gap-2"
                          >
                            <Button
                              variant="contained"
                              onClick={() => {
                                navigate(`/rooms/${room.room_id}`);
                                setInviteData((prev) => {
                                  const newData = prev.filter((item) => item.room.room_id !== room.room_id);
                                  localStorage.setItem("inviteData", JSON.stringify(newData));
                                  return newData;
                                });
                                setOpenInvite(false);
                              }}
                            >
                              Vào
                            </Button>
                            <Button
                              color="error"
                              variant="contained"
                              onClick={() => {
                                setInviteData((prev) => {
                                  const newData = prev.filter((item) => item.room.room_id !== room.room_id);
                                  localStorage.setItem("inviteData", JSON.stringify(newData));
                                  return newData;
                                });
                              }}
                            >
                              Xóa
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            <Button
              onClick={() => setOpenInvite(false)}
              className="mt-auto w-full"
              variant="contained"
              color="error"
            >
              Đóng
            </Button>

          </DialogContent>
        </Dialog>
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
          <div className="me-3"
            style={
              {
                backgroundColor: "#1976d2",
                width: "fit-content",
                display: "flex",
              }
            }
            onClick={() => {
              setOpenInvite(true);
            }}
          >
            <Badge
              badgeContent={inviteData.length}
              color="error"
              sx={{
                fontSize: 12,
                fontWeight: "bold",
              }}
            >
            </Badge>
            <Typography variant="h6" noWrap color={'black'} className="p-1">
              Lời mời
            </Typography>

          </div>
          <div>

            {avatar ? (
              <Avatar
                className="cursor-pointer"
                src={avatar}
                aria-expanded={isUserDropdownOpen}
                onClick={toggleUserDropdown}
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
        <LayoutContainer>
          <Outlet />
          {openContact && <ContactButton />}
        </LayoutContainer>
      </Main>
    </>
  );
};
