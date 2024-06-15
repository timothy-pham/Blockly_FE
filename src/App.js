import "./App.css";
import { Layout } from "./layouts/Layout";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { Dashboard } from "./pages/Dashboards";
import { GroupManagement } from "./pages/management/GroupManagement";
import { BlockManagement } from "./pages/management/BlockManagement";
import { CollectionManagement } from "./pages/management/CollectionManagement";
import { CreateBlock } from "./pages/management/Block/CreateBlock";
import { EditBlock } from "./pages/management/Block/EditBlock";
import Register from "./pages/auth/Register";
import Login from "./pages/auth/Login";
import { Lessons } from "./pages/lessons/Lesson";
import { LessonsDetail } from "./pages/lessons/LessonDetail/LessonDetail";
import { Rooms } from "./pages/rooms/Room";
import { History } from "./pages/History";
import { Waiting } from "./pages/rooms/Waiting";
import { Play } from "./pages/rooms/Play";
import { AlertProvider } from "./components/alert/AlertProvider";
import { EndGame } from "./pages/rooms/EndGame";
import { HistoryPlay } from "./pages/HistoryPlay";
import { toast } from "react-toastify";
import { Role } from "./constant/role";
import { useEffect } from "react";
import { RankingPage } from "./pages/Ranking";
import { toastOptions } from "./constant/toast";
import { UserManagement } from "./pages/management/UserManagement";
import { Profile } from "./pages/auth/Profile";
import MessageHome from "./pages/message/MessageHome";
import { LoaderProvider } from "./components/progress/LoaderContext";
import { Loader } from "./components/progress/Loader";
import ClassHome from "./pages/class/ClassHome";

const PrivateRoute = ({ element: Component, permission, ...rest }) => {
  const authToken = JSON.parse(localStorage.getItem("authToken"));
  const navigate = useNavigate();
  const role = authToken?.user?.role;

  useEffect(() => {
    if (authToken) {
      if (permission && !permission.includes(role)) {
        toast.error("Bạn không có quyền truy cập vào mục này.", toastOptions);
      }
    } else {
      navigate("/login");
    }
  }, [authToken, permission, role, navigate]);

  if (authToken && (!permission || permission.includes(role))) {
    return <Component />;
  }
  return null;
};

function App() {
  return (
    <AlertProvider>
      <LoaderProvider>
        <Loader />
        <BrowserRouter>
          <Routes>
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />

            <Route path="/" element={<Layout />}>
              <Route index element={<PrivateRoute element={Dashboard} />} />
              <Route
                path="/history"
                element={<PrivateRoute element={History} />}
              />
              <Route
                path="/profile"
                element={<PrivateRoute element={Profile} />}
              />
              <Route
                path="/messages"
                element={<PrivateRoute element={MessageHome} />}
              />
              <Route
                path="/class"
                element={<PrivateRoute element={ClassHome} />}
              />
              <Route
                path="/history-plays"
                element={<PrivateRoute element={HistoryPlay} />}
              />
              <Route
                path="/groupManagement"
                element={
                  <PrivateRoute
                    element={GroupManagement}
                    permission={[Role.ADMIN]}
                  />
                }
              />
              <Route
                path="/blockManagement"
                element={
                  <PrivateRoute
                    element={BlockManagement}
                    permission={[Role.ADMIN]}
                  />
                }
              />
              <Route
                path="/userManagement"
                element={
                  <PrivateRoute
                    element={UserManagement}
                    permission={[Role.ADMIN, Role.TEACHER]}
                  />
                }
              />
              <Route
                path="/collectionManagement"
                element={
                  <PrivateRoute
                    element={CollectionManagement}
                    permission={[Role.ADMIN]}
                  />
                }
              />
              <Route
                path="/blockManagement/create"
                element={
                  <PrivateRoute
                    element={CreateBlock}
                    permission={[Role.ADMIN]}
                  />
                }
              />
              <Route
                path="/blockManagement/:id/edit"
                element={
                  <PrivateRoute element={EditBlock} permission={[Role.ADMIN]} />
                }
              />
              <Route
                path="/collections/:id"
                element={<PrivateRoute element={Lessons} />}
              />
              <Route
                path="/collections/:collection_id/groups/:group_id"
                element={<PrivateRoute element={LessonsDetail} />}
              />
              <Route path="/rooms" element={<PrivateRoute element={Rooms} />} />
              <Route
                path="/rooms/:id"
                element={<PrivateRoute element={Waiting} />}
              />
              <Route
                path="/rooms/:id/play"
                element={<PrivateRoute element={Play} />}
              />
              <Route
                path="/rooms/:id/end-game"
                element={<PrivateRoute element={EndGame} />}
              />

              <Route
                path="/ranking"
                element={<PrivateRoute element={RankingPage} />}
              />
            </Route>
          </Routes>
        </BrowserRouter>
      </LoaderProvider>
    </AlertProvider>
  );
}

export default App;
