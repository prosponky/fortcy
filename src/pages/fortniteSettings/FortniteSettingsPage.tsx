import {
  Clock3,
  Download,
  FileUp,
  ShieldCheck,
  Upload,
  Zap,
} from "lucide-react";
import {
  useState,
  type CSSProperties,
} from "react";

import PageHeader from "../../components/PageHeader";
import Panel from "../../components/Panel";
import { useSettingsStore } from "../../stores/settingsStore";

const actionCardStyle: CSSProperties = {
  minHeight: "105px",
  padding: "17px",
  textAlign: "left",
  color: "#ffffff",
  background:
    "linear-gradient(145deg, rgba(11,24,45,0.96), rgba(5,11,22,0.98))",
  border:
    "1px solid rgba(42,73,128,0.42)",
  borderRadius: "11px",
  cursor: "pointer",
};

const actionTitleStyle: CSSProperties = {
  marginTop: "14px",
  fontSize: "13px",
  fontWeight: 700,
};

function FortniteSettingsPage() {
  const {
    lastBackup,
    status,
    isBusy,
    createBackup,
    restoreBackup,
    importSettings,
    applyPerformanceSettings,
    openBackupFolder,
  } = useSettingsStore();

  const [lastBackupHovered, setLastBackupHovered] =
    useState(false);

  const statusComplete =
    status === "Backup complete" ||
    status === "Restore complete" ||
    status === "Export complete" ||
    status === "Import complete" ||
    status === "Performance settings applied";

  return (
    <>
      <PageHeader
        title="Fortnite Settings"
        subtitle="Fortnite Configuration"
      />

      <div
        style={{
          width: "100%",
          maxWidth: "700px",
          marginTop: "30px",
          display: "flex",
          flexDirection: "column",
          gap: "14px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(2, minmax(0, 1fr))",
            gap: "12px",
          }}
        >
          <button
            type="button"
            disabled={isBusy}
            onClick={() => {
              void createBackup();
            }}
            style={{
              ...actionCardStyle,
              opacity: isBusy ? 0.6 : 1,
              cursor: isBusy
                ? "default"
                : "pointer",
            }}
          >
            <Download
              size={18}
              color="#00e5ff"
            />

            <div style={actionTitleStyle}>
              Save My Graphics Settings
            </div>
          </button>

          <button
            type="button"
            disabled={isBusy}
            onClick={() => {
              void restoreBackup();
            }}
            style={{
              ...actionCardStyle,
              opacity: isBusy ? 0.6 : 1,
              cursor: isBusy
                ? "default"
                : "pointer",
            }}
          >
            <Upload
              size={18}
              color="#00e5ff"
            />

            <div style={actionTitleStyle}>
              Restore My Saved Settings
            </div>
          </button>

        </div>

        <Panel style={{ padding: "16px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
          <div>
            <div style={{ color: "#ffffff", fontSize: "13px", fontWeight: 700 }}>Upload My Settings</div>
            <div style={{ marginTop: "5px", color: "#7f8ca8", fontSize: "11px" }}>Select your saved Fortcy settings backup.</div>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button type="button" disabled={isBusy} onClick={() => void openBackupFolder()} style={{ ...actionCardStyle, minHeight: "auto", padding: "9px 12px", display: "flex", alignItems: "center", gap: "7px", opacity: isBusy ? 0.6 : 1 }}>
              Open backup folder
            </button>
            <button type="button" disabled={isBusy} onClick={() => void importSettings()} style={{ ...actionCardStyle, minHeight: "auto", padding: "9px 12px", display: "flex", alignItems: "center", gap: "7px", opacity: isBusy ? 0.6 : 1 }}>
              <FileUp size={15} color="#00e5ff" /> Choose backup file
            </button>
          </div>
        </Panel>

        <div style={{ ...actionCardStyle, minHeight: "78px", display: "flex", alignItems: "center", gap: "14px", opacity: isBusy ? 0.6 : 1, background: "linear-gradient(135deg, rgba(0,183,255,.18), rgba(16,34,69,.98))", border: "1px solid rgba(0,229,255,.65)", boxShadow: "0 0 22px rgba(0,188,255,.12)" }}>
          <span style={{ width: "38px", height: "38px", display: "grid", placeItems: "center", flexShrink: 0, color: "#001018", background: "#00e5ff", borderRadius: "10px", boxShadow: "0 0 16px rgba(0,229,255,.35)" }}><Zap size={20} fill="currentColor" /></span>
          <span style={{ flex: 1, textAlign: "left" }}><span style={{ display: "block", color: "#ffffff", fontSize: "14px", fontWeight: 800 }}>Fortcy Performance Settings</span><span style={{ display: "block", marginTop: "6px", color: "#9db0cf", fontSize: "11px" }}>Backs up your current settings first, then applies a competitive low-latency preset.</span></span>
          <button type="button" disabled={isBusy} onClick={() => void applyPerformanceSettings()} style={{ padding: "11px 18px", color: "#001018", background: "#00e5ff", border: 0, borderRadius: "8px", fontSize: "12px", fontWeight: 850, cursor: isBusy ? "default" : "pointer", whiteSpace: "nowrap" }}>Apply</button>
        </div>

        <div
          onMouseEnter={() =>
            setLastBackupHovered(true)
          }
          onMouseLeave={() =>
            setLastBackupHovered(false)
          }
        >
          <Panel
            style={{
              minHeight: "92px",
              padding: "18px 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: lastBackupHovered
                ? "linear-gradient(145deg, rgba(13,29,54,0.98), rgba(6,13,25,0.99))"
                : "linear-gradient(145deg, rgba(10,22,41,0.97), rgba(5,11,22,0.99))",
              border: lastBackupHovered
                ? "1px solid rgba(0,229,255,0.22)"
                : "1px solid rgba(43,76,132,0.4)",
              boxShadow: lastBackupHovered
                ? "0 0 20px rgba(0,229,255,0.05)"
                : "inset 0 1px 0 rgba(255,255,255,0.015), 0 10px 30px rgba(0,0,0,0.12)",
              transform: lastBackupHovered
                ? "translateY(-1px)"
                : "translateY(0)",
              transition:
                "background 150ms ease, border-color 150ms ease, box-shadow 150ms ease, transform 150ms ease",
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  color: lastBackupHovered
                    ? "#9db0cf"
                    : "#8090ad",
                  fontSize: "9px",
                  fontWeight: 700,
                  letterSpacing: "0.9px",
                  textTransform: "uppercase",
                  transition: "color 150ms ease",
                }}
              >
                <Clock3
                  size={14}
                  color="#00e5ff"
                />

                Last Backup
              </div>

              <div
                style={{
                  marginTop: "10px",
                  color: "#ffffff",
                  fontSize: "17px",
                  fontWeight: 650,
                }}
              >
                {lastBackup}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: statusComplete
                  ? "#38e54d"
                  : "#7f8ca8",
                fontSize: "10px",
                fontWeight: 600,
              }}
            >
              <ShieldCheck size={15} />
              {status}
            </div>
          </Panel>
        </div>
      </div>

    </>
  );
}

export default FortniteSettingsPage;
