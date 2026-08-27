import {
  Play,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";

interface PrimaryButtonProps {
  label: string;
  onClick?: () => void;
  icon?: LucideIcon;
  disabled?: boolean;
}

function PrimaryButton({
  label,
  onClick,
  icon: Icon = Play,
  disabled = false,
}: PrimaryButtonProps) {
  const [hovered, setHovered] =
    useState(false);

  const [pressed, setPressed] =
    useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => {
        if (!disabled) {
          setHovered(true);
        }
      }}
      onMouseLeave={() => {
        setHovered(false);
        setPressed(false);
      }}
      onMouseDown={() => {
        if (!disabled) {
          setPressed(true);
        }
      }}
      onMouseUp={() => {
        setPressed(false);
      }}
      style={{
        width: "220px",
        height: "48px",
        marginTop: "4px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "9px",
        color: "#001117",
        background: disabled
          ? "linear-gradient(110deg, #4a6874 0%, #506a78 100%)"
          : hovered
            ? "linear-gradient(110deg, #22edff 0%, #38c5ff 52%, #579cff 100%)"
            : "linear-gradient(110deg, #00e5ff 0%, #26b9ff 52%, #3e8fff 100%)",
        border: disabled
          ? "1px solid rgba(130,160,175,0.3)"
          : "1px solid rgba(0,229,255,0.65)",
        borderRadius: "9px",
        boxShadow: disabled
          ? "none"
          : hovered
            ? "0 0 0 1px rgba(0,229,255,0.22), 0 0 32px rgba(0,197,255,0.24)"
            : "0 0 0 1px rgba(0,229,255,0.14), 0 0 28px rgba(0,197,255,0.16)",
        fontSize: "11px",
        fontWeight: 900,
        letterSpacing: "1.1px",
        cursor: disabled
          ? "default"
          : "pointer",
        opacity: disabled ? 0.65 : 1,
        transform: pressed
          ? "translateY(1px) scale(0.99)"
          : hovered
            ? "translateY(-1px)"
            : "translateY(0)",
        transition:
          "background 150ms ease, box-shadow 150ms ease, transform 120ms ease, opacity 150ms ease",
      }}
    >
      <Icon size={16} />

      {label}
    </button>
  );
}

export default PrimaryButton;