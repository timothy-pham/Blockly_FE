import "./App.css";
import { BlocklyLayout } from "./components/Blockly";
import { Layout } from "./layouts/Layout";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Dashboard } from "./pages/Dashboards";
import { CategoryManagement } from "./pages/management/CategoryManagement";
import { BlockManagement } from "./pages/management/BlockManagement";
import { CollectionManagement } from "./pages/management/CollectionManagement";
import { CreateBlock } from "./pages/management/Block/CreateBlock";
import { EditBlock } from "./pages/management/Block/EditBlock";
import Register from "./pages/auth/Register";
import Login from "./pages/auth/Login";

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
          <Route
            path="/blockly"
            element={<PrivateRoute element={BlocklyLayout} />}
          />
          <Route
            path="/categoryManagement"
            element={<PrivateRoute element={CategoryManagement} />}
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
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
