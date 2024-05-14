import "./App.css";
import { BlocklyLayout } from "./pages/Blockly";
import { Layout } from "./components/Layout";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Dashboard } from "./pages/Dashboards";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="/blockly" element={<BlocklyLayout />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
