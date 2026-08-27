import {
  useEffect,
  useState,
} from "react";

import SplashScreen from "../components/SplashScreen";
import MainLayout from "../layouts/MainLayout";
import { useBenchmarkStore } from "../stores/benchmarkStore";

function App() {
  const [
    showSplash,
    setShowSplash,
  ] = useState(true);

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

  return showSplash ? <SplashScreen /> : <MainLayout />;
}

export default App;
