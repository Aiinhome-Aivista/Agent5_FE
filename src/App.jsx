import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Telemetry from "./pages/Telemetry";
import Recommendations from "./pages/Recommendations";
import Rulebook from "./pages/Rulebook";
import Actions from "./pages/Actions";
import Chat from "./pages/Chat";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />

      <Route element={<Layout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/telemetry" element={<Telemetry />} />
        <Route path="/recommendations" element={<Recommendations />} />
        <Route path="/rulebook" element={<Rulebook />} />
        <Route path="/actions" element={<Actions />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}
