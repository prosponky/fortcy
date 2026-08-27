import type { LucideIcon } from "lucide-react";
import { useState } from "react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  compact?: boolean;
  helperText?: string;
}

function StatCard({
  icon: Icon,
  label,
  value,
  compact = false,
  helperText,
}: StatCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        minHeight: compact ? "105px" : "130px",
        padding: compact ? "18px" : "22px",
        background: hovered
          ? "linear-gradient(145deg, rgba(13,29,54,0.98), rgba(6,13,25,0.99))"
          : "linear-gradient(145deg, rgba(11,24,45,0.96), rgba(5,11,22,0.98))",
        border: hovered
          ? "1px solid rgba(0,229,255,0.22)"
          : "1px solid rgba(42,73,128,0.42)",
        borderRadius: "12px",
        boxShadow: hovered
          ? "0 0 20px rgba(0,229,255,0.05)"
          : "none",
        transform: hovered
          ? "translateY(-1px)"
          : "translateY(0)",
        transition:
          "background 150ms ease, border-color 150ms ease, box-shadow 150ms ease, transform 150ms ease",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "9px",
          color: hovered ? "#9db0cf" : "#8090ad",
          fontSize: "10px",
          fontWeight: 700,
          letterSpacing: "1px",
          textTransform: "uppercase",
          transition: "color 150ms ease",
        }}
      >
        <Icon
          size={16}
          strokeWidth={1.7}
          color="#00e5ff"
        />

        {label}
      </div>

      <div
        style={{
          marginTop: compact ? "15px" : "18px",
          color: "#ffffff",
          fontSize: compact ? "24px" : "26px",
          fontWeight: 700,
          textShadow: hovered
            ? "0 0 12px rgba(0,229,255,0.06)"
            : "none",
          transition: "text-shadow 150ms ease",
        }}
      >
        {value}
      </div>

      {helperText ? (
        <div
          style={{
            marginTop: "8px",
            color: "#7f90ad",
            fontSize: "12px",
            fontWeight: 500,
            lineHeight: 1.3,
          }}
        >
          {helperText}
        </div>
      ) : null}
    </div>
  );
}

export default StatCard;