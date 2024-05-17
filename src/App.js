import "./App.css";
import { BlocklyLayout } from "./components/Blockly";
import { Layout } from "./layouts/Layout";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Dashboard } from "./pages/Dashboards";
import { CategoryManagement } from "./pages/management/CategoryManagement";
import { BlockManagement } from "./pages/management/BlockManagement";
import { CollectionManagement } from "./pages/management/CollectionManagement";
import { CreateBlock } from "./pages/management/Block/CreateBlock";
import { EditBlock } from "./pages/management/Block/EditBlock";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="/blockly" element={<BlocklyLayout />} />
          <Route path="/categoryManagement" element={<CategoryManagement />} />
          <Route path="/blockManagement" element={<BlockManagement />} />
          <Route
            path="/collectionManagement"
            element={<CollectionManagement />}
          />
          <Route path="/blockManagement/create" element={<CreateBlock />} />
          <Route path="/blockManagement/:id/edit" element={<EditBlock />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
