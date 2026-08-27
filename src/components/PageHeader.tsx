interface PageHeaderProps {
  title: string;
  subtitle: string;
}

function PageHeader({
  title,
  subtitle,
}: PageHeaderProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          marginBottom: "6px",
          color: "#00e5ff",
          fontSize: "9px",
          fontWeight: 800,
          letterSpacing: "3px",
          textTransform: "uppercase",
          textShadow:
            "0 0 10px rgba(0,229,255,0.12)",
        }}
      >
        FORTCY
      </div>

      <h1
        style={{
          margin: 0,
          color: "#ffffff",
          fontSize: "32px",
          lineHeight: 1.05,
          fontWeight: 700,
          letterSpacing: "-0.4px",
        }}
      >
        {title}
      </h1>

      <div
        style={{
          marginTop: "7px",
          color: "#7785a2",
          fontSize: "13px",
          lineHeight: 1.4,
        }}
      >
        {subtitle}
      </div>

      <div
        style={{
          width: "48px",
          height: "1px",
          marginTop: "14px",
          background:
            "linear-gradient(90deg, rgba(0,229,255,0.65), rgba(0,229,255,0))",
        }}
      />
    </div>
  );
}

export default PageHeader;