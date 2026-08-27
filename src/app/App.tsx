import {
  useEffect,
  useState,
} from "react";
import { check } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";

import SplashScreen from "../components/SplashScreen";
import MainLayout from "../layouts/MainLayout";
import { useBenchmarkStore } from "../stores/benchmarkStore";

function App() {
  const [
    showSplash,
    setShowSplash,
  ] = useState(true);
  const [update, setUpdate] = useState<any>(null);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void check().then((result) => setUpdate(result ?? null)).catch(() => undefined);
    }, 3500);
    return () => window.clearTimeout(timer);
  }, []);

  const installUpdate = async () => {
    if (!update) return;
    setIsInstalling(true);
    try {
      await update.downloadAndInstall();
      await relaunch();
    } catch {
      setIsInstalling(false);
    }
  };

  const checkMatchState =
    useBenchmarkStore(
      (state) =>
        state.checkMatchState,
    );

  useEffect(() => {
    const timer =
      window.setTimeout(() => {
        setShowSplash(false);
      }, 2500);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (showSplash) {
      return;
    }

    void checkMatchState();

    const interval =
      window.setInterval(() => {
        void checkMatchState();
      }, 2000);

    return () => {
      window.clearInterval(
        interval,
      );
    };
  }, [
    checkMatchState,
    showSplash,
  ]);

  return showSplash ? <SplashScreen /> : <><MainLayout />{update && <div style={{ position: "fixed", right: "18px", bottom: "18px", zIndex: 100, width: "280px", padding: "16px", color: "#fff", background: "linear-gradient(145deg,#0b2341,#061021)", border: "1px solid rgba(0,229,255,.5)", borderRadius: "12px", boxShadow: "0 18px 50px rgba(0,0,0,.55)" }}><div style={{ color: "#00e5ff", fontWeight: 900, fontSize: "12px" }}>UPDATE AVAILABLE</div><div style={{ marginTop: "6px", color: "#a9bad4", fontSize: "10px" }}>A newer Fortcy beta is ready.</div><button type="button" onClick={() => void installUpdate()} disabled={isInstalling} style={{ width: "100%", marginTop: "12px", padding: "9px", color: "#001018", background: "#00e5ff", border: 0, borderRadius: "7px", fontWeight: 850, cursor: "pointer" }}>{isInstalling ? "Installing..." : "Install update"}</button></div>}</>;
}

export default App;
