import type {
  CSSProperties,
  ReactNode,
} from "react";

interface PanelProps {
  children: ReactNode;
  padding?: string;
  style?: CSSProperties;
}

function Panel({
  children,
  padding = "22px",
  style,
}: PanelProps) {
  return (
    <section
      style={{
        padding,
        background:
          "linear-gradient(145deg, rgba(10,22,41,0.97), rgba(5,11,22,0.99))",
        border:
          "1px solid rgba(43,76,132,0.4)",
        borderRadius: "12px",
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.015), 0 10px 30px rgba(0,0,0,0.12)",
        ...style,
      }}
    >
      {children}
    </section>
  );
}

export default Panel;