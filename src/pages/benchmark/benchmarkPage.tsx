import {
  Activity,
  CircleCheck,
  CircleDot,
  Cpu,
  Gauge,
  Keyboard,
  MapPin,
  Server,
  Wifi,
} from "lucide-react";

import PageHeader from "../../components/PageHeader";
import StatCard from "../../components/StatCard";
import { useBenchmarkStore } from "../../stores/benchmarkStore";

function BenchmarkPage() {
  const {
    matchState,
    logFound,
    matchRegion,
    gameServerIp,
    gameServerPort,
    serverLocation,
    averageFps,
    gpuTemperatureC,
    cpuTemperatureC,
    allInputLatencyMs,
    averagePingMs,
    gameServerPingMs,
  } = useBenchmarkStore();

  const benchmarkStats = [
    {
      label: "INPUT DELAY",
      icon: Keyboard,
      value:
        allInputLatencyMs === null
          ? "0 ms"
          : `${allInputLatencyMs.toFixed(2)} ms`,
    },
    {
      label: "GPU TEMP",
      icon: Gauge,
      value:
        gpuTemperatureC === null
          ? "0°C"
          : `${gpuTemperatureC}°C`,
    },
    {
      label: "CPU TEMP",
      icon: Cpu,
      value:
        cpuTemperatureC === null
          ? "0°C"
          : `${cpuTemperatureC}°C`,
    },
    {
      label: "AVG FPS",
      icon: Activity,
      value:
        averageFps === null
          ? "0"
          : String(averageFps),
    },
    {
      label: "IN-GAME PING",
      icon: Server,
      value:
        gameServerPingMs === null
          ? "0 ms"
          : `${gameServerPingMs} ms`,
    },
    {
      label: "ACTUAL PING",
      icon: Wifi,
      value:
        averagePingMs === null
          ? "0 ms"
          : `${averagePingMs} ms`,
    },
  ];

  const matchStatus =
    matchState === "in_match"
      ? {
          label: "MATCH IN PROGRESS",
          detail: "Automatic benchmark is active",
          color: "#38e54d",
          background: "rgba(56, 229, 77, 0.08)",
          border: "rgba(56, 229, 77, 0.24)",
          icon: CircleCheck,
        }
      : matchState === "match_ended"
        ? {
            label: "MATCH ENDED",
            detail: "Last game session detected",
            color: "#00e5ff",
            background: "rgba(0, 229, 255, 0.07)",
            border: "rgba(0, 229, 255, 0.22)",
            icon: CircleCheck,
          }
        : {
            label: "WAITING FOR MATCH",
            detail: logFound
              ? "Fortcy is watching FortniteGame.log"
              : "FortniteGame.log not found",
            color: "#9aa9c2",
            background: "rgba(154, 169, 194, 0.06)",
            border: "rgba(154, 169, 194, 0.18)",
            icon: CircleDot,
          };

  const MatchStatusIcon = matchStatus.icon;

  const gameServer =
    gameServerIp !== null
      ? `${gameServerIp}${
          gameServerPort !== null
            ? `:${gameServerPort}`
            : ""
        }`
      : "--";

  return (
    <>
      <PageHeader
        title="Benchmark"
        subtitle="Live Performance Test"
      />

      <div
        style={{
          width: "100%",
          maxWidth: "900px",
          marginTop: "32px",
        }}
      >
        <div style={{ marginBottom: "14px", padding: "13px 16px", color: "#b7c8df", background: "rgba(0,229,255,.06)", border: "1px solid rgba(0,229,255,.25)", borderRadius: "10px", fontSize: "11px", lineHeight: 1.5 }}>
          <strong style={{ color: "#00e5ff" }}>Keep Fortcy open while gaming.</strong> We’ll monitor the current match in real time and show its server, ping, FPS, temperatures, and input latency here.
        </div>
        <div
          style={{
            minHeight: "82px",
            padding: "18px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: matchStatus.background,
            border: `1px solid ${matchStatus.border}`,
            borderRadius: "12px",
          }}
        >
          <div>
            <div
              style={{
                color: matchStatus.color,
                fontSize: "11px",
                fontWeight: 800,
                letterSpacing: "1.1px",
              }}
            >
              {matchStatus.label}
            </div>

            <div
              style={{
                marginTop: "7px",
                color: "#8e9bb2",
                fontSize: "12px",
              }}
            >
              {matchStatus.detail}
            </div>
          </div>

          <div
            style={{
              width: "34px",
              height: "34px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
              background: matchStatus.background,
              border: `1px solid ${matchStatus.border}`,
            }}
          >
            <MatchStatusIcon
              size={17}
              color={matchStatus.color}
            />
          </div>
        </div>

        <div
          style={{
            marginTop: "14px",
            padding: "14px 16px",
            display: "grid",
            gridTemplateColumns:
              "repeat(3, minmax(0, 1fr))",
            gap: "16px",
            background:
              "linear-gradient(145deg, rgba(11,24,45,0.96), rgba(5,11,22,0.98))",
            border:
              "1px solid rgba(42,73,128,0.42)",
            borderRadius: "12px",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "7px",
                color: "#8090ad",
                fontSize: "9px",
                fontWeight: 800,
                letterSpacing: "1px",
              }}
            >
              <Server
                size={13}
                color="#00e5ff"
              />
              GAME SERVER
            </div>

            <div
              style={{
                marginTop: "8px",
                color: "#d9e3f2",
                fontSize: "12px",
                fontWeight: 650,
              }}
            >
              {gameServer}
            </div>
          </div>

          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "7px",
                color: "#8090ad",
                fontSize: "9px",
                fontWeight: 800,
                letterSpacing: "1px",
              }}
            >
              <Wifi
                size={13}
                color="#00e5ff"
              />
              MATCH REGION
            </div>

            <div
              style={{
                marginTop: "8px",
                color: "#d9e3f2",
                fontSize: "12px",
                fontWeight: 650,
              }}
            >
              {matchRegion ?? "--"}
            </div>
          </div>

          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "7px",
                color: "#8090ad",
                fontSize: "9px",
                fontWeight: 800,
                letterSpacing: "1px",
              }}
            >
              <MapPin
                size={13}
                color="#00e5ff"
              />
              SERVER LOCATION
            </div>

            <div
              style={{
                marginTop: "8px",
                color: "#d9e3f2",
                fontSize: "12px",
                fontWeight: 650,
              }}
            >
              {serverLocation ?? "--"}
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: "22px",
            display: "grid",
            gridTemplateColumns:
              "repeat(3, minmax(0, 1fr))",
            gap: "14px",
          }}
        >
          {benchmarkStats.map(
            ({
              label,
              icon,
              value,
            }) => (
              <StatCard
                key={label}
                label={label}
                icon={icon}
                value={value}
                compact
              />
            ),
          )}
        </div>
      </div>
    </>
  );
}

export default BenchmarkPage;
