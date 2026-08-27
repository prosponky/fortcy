import {
  Route,
  Routes,
  Navigate,
} from "react-router-dom";

import Sidebar from "../components/Sidebar";
import BenchmarkPage from "../pages/benchmark/benchmarkPage";
import FortniteSettingsPage from "../pages/fortniteSettings/FortniteSettingsPage";
import PingPage from "../pages/ping/PingPage";
import ResultsPage from "../pages/results/ResultsPage";

function MainLayout() {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "grid",
        gridTemplateColumns: "220px 1fr",
        background:
          "radial-gradient(circle at 75% 10%, rgba(0,229,255,0.05), transparent 28%), #020712",
        color: "#ffffff",
        fontFamily: '"Segoe UI", Arial, sans-serif',
      }}
    >
      <Sidebar />

      <main
        style={{
          height: "100%",
          padding: "30px 34px",
          overflow: "hidden",
        }}
      >
        <Routes>
          <Route path="/" element={<Navigate to="/benchmark" replace />} />

          <Route
            path="/benchmark"
            element={<BenchmarkPage />}
          />

          <Route
            path="/ping"
            element={<PingPage />}
          />

          <Route
            path="/settings"
            element={<FortniteSettingsPage />}
          />

          <Route
            path="/results"
            element={<ResultsPage />}
          />
        </Routes>
      </main>
    </div>
  );
}

export default MainLayout;
