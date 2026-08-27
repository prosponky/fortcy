import {
  BarChart3,
  ExternalLink,
  Gamepad2,
  Settings,
  Signal,
} from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { openUrl } from "@tauri-apps/plugin-opener";
import fortcyLogo from "../assets/fortcy-logo.png";

const navItems = [
  {
    to: "/benchmark",
    label: "Benchmark",
    icon: Gamepad2,
  },
  {
    to: "/ping",
    label: "Ping",
    icon: Signal,
  },
  {
    to: "/settings",
    label: "Fortnite Settings",
    icon: Settings,
  },
  {
    to: "/results",
    label: "Results",
    icon: BarChart3,
  },
];

function Sidebar() {
  const [hoveredPath, setHoveredPath] =
    useState<string | null>(null);

  const [discordHovered, setDiscordHovered] =
    useState(false);

  return (
    <aside
      style={{
        height: "100%",
        padding: "24px 14px 18px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background:
          "linear-gradient(180deg, #07101f 0%, #040914 100%)",
        borderRight:
          "1px solid rgba(0,229,255,0.12)",
        boxShadow:
          "6px 0 24px rgba(0,0,0,0.16)",
      }}
    >
      <div>
        <div
          style={{
            height: "110px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "14px",
            overflow: "hidden",
          }}
        >
          <img
            src={fortcyLogo}
            alt="Fortcy"
            draggable={false}
            style={{
              width: "190px",
              height: "auto",
              transform: "scale(1.55)",
              transformOrigin: "center",
              objectFit: "contain",
              userSelect: "none",
              pointerEvents: "none",
              filter:
                "drop-shadow(0 0 12px rgba(0,229,255,0.06))",
            }}
          />
        </div>

        <nav
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "6px",
          }}
        >
          {navItems.map(
            ({
              to,
              label,
              icon: Icon,
            }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                onMouseEnter={() =>
                  setHoveredPath(to)
                }
                onMouseLeave={() =>
                  setHoveredPath(null)
                }
                style={({ isActive }) => {
                  const isHovered =
                    hoveredPath === to;

                  return {
                    position: "relative",
                    height: "46px",
                    padding: "0 14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    overflow: "hidden",
                    textDecoration: "none",
                    color: isActive
                      ? "#ffffff"
                      : isHovered
                        ? "#b7c5dd"
                        : "#7f8ca8",
                    background: isActive
                      ? "linear-gradient(90deg, rgba(0,229,255,0.13), rgba(0,120,255,0.03))"
                      : isHovered
                        ? "rgba(15,31,55,0.62)"
                        : "transparent",
                    border: isActive
                      ? "1px solid rgba(0,229,255,0.22)"
                      : isHovered
                        ? "1px solid rgba(63,101,156,0.22)"
                        : "1px solid transparent",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: isActive
                      ? 650
                      : 600,
                    boxShadow: isActive
                      ? "inset 2px 0 0 #00e5ff, 0 0 18px rgba(0,229,255,0.04)"
                      : "none",
                    transform: isHovered
                      ? "translateX(2px)"
                      : "translateX(0)",
                    transition:
                      "color 150ms ease, background 150ms ease, border-color 150ms ease, transform 150ms ease, box-shadow 150ms ease",
                  };
                }}
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      size={18}
                      strokeWidth={1.8}
                      color={
                        isActive
                          ? "#00e5ff"
                          : undefined
                      }
                    />

                    <span>
                      {label}
                    </span>
                  </>
                )}
              </NavLink>
            ),
          )}
        </nav>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        <button
          type="button"
          onClick={() => void openUrl("https://discord.gg/jfxCQwzbQu")}
          onMouseEnter={() =>
            setDiscordHovered(true)
          }
          onMouseLeave={() =>
            setDiscordHovered(false)
          }
          style={{
            height: "40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            color: discordHovered
              ? "#ffffff"
              : "#9eacc7",
            background: discordHovered
              ? "rgba(13,30,52,0.95)"
              : "#081221",
            border: discordHovered
              ? "1px solid rgba(0,229,255,0.24)"
              : "1px solid #152844",
            borderRadius: "8px",
            cursor: "pointer",
            transform: discordHovered
              ? "translateY(-1px)"
              : "translateY(0)",
            boxShadow: discordHovered
              ? "0 0 18px rgba(0,229,255,0.06)"
              : "none",
            transition:
              "all 150ms ease",
          }}
        >
          <ExternalLink
            size={15}
            color={
              discordHovered
                ? "#00e5ff"
                : undefined
            }
          />
          Discord
        </button>

        <div
          style={{
            textAlign: "center",
            color: "#00e5ff",
            fontSize: "8px",
            fontWeight: 800,
            letterSpacing: "2px",
          }}
        >
          OPTIMIZE PRIME
        </div>

        <div
          style={{
            textAlign: "center",
            color: "#44516a",
            fontSize: "10px",
          }}
        >
          Fortcy v{__APP_VERSION__}
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
