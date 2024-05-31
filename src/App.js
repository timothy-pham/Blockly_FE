import "./App.css";
import { Layout } from "./layouts/Layout";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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

const PrivateRoute = ({ element: Component, ...rest }) => {
  const authToken = JSON.parse(localStorage.getItem("authToken"));
  return authToken ? <Component /> : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        <Route path="/" element={<Layout />}>
          <Route index element={<PrivateRoute element={Dashboard} />} />
          <Route path="/history" element={<PrivateRoute element={History} />} />
          <Route
            path="/groupManagement"
            element={<PrivateRoute element={GroupManagement} />}
          />
          <Route
            path="/blockManagement"
            element={<PrivateRoute element={BlockManagement} />}
          />
          <Route
            path="/collectionManagement"
            element={<PrivateRoute element={CollectionManagement} />}
          />
          <Route
            path="/blockManagement/create"
            element={<PrivateRoute element={CreateBlock} />}
          />
          <Route
            path="/blockManagement/:id/edit"
            element={<PrivateRoute element={EditBlock} />}
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
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
