import fortcyLogo from "../assets/fortcy-logo.png";

function SplashScreen() {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "radial-gradient(circle at 50% 45%, rgba(0,153,255,0.07) 0%, rgba(0,80,150,0.025) 30%, transparent 58%), linear-gradient(180deg, #020916 0%, #020712 48%, #01050c 100%)",
        color: "#ffffff",
        fontFamily: '"Segoe UI", Arial, sans-serif',
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: "760px",
            maxWidth: "95vw",
            height: "230px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "visible",
          }}
        >
          <img
            src={fortcyLogo}
            alt="Fortcy by Optimize Prime"
            draggable={false}
            style={{
              width: "760px",
              maxWidth: "95vw",
              height: "auto",
              display: "block",
              objectFit: "contain",
              transform: "scale(1.6)",
              transformOrigin: "center",
              filter:
                "drop-shadow(0 12px 30px rgba(0,100,180,0.15))",
              userSelect: "none",
              pointerEvents: "none",
            }}
          />
        </div>

        <div
          style={{
            marginTop: "65px",
            color: "#91acd1",
            fontSize: "20px",
            fontWeight: 400,
            textShadow:
              "0 0 14px rgba(45,139,255,0.15)",
          }}
        >
          Beta
        </div>

        <div
          style={{
            width: "120px",
            height: "2px",
            marginTop: "38px",
            background:
              "linear-gradient(90deg, transparent 0%, #00d9ff 25%, #00f0ff 50%, #00d9ff 75%, transparent 100%)",
            boxShadow:
              "0 0 8px rgba(0,229,255,0.65), 0 0 20px rgba(0,229,255,0.15)",
          }}
        />

        <div
          style={{
            marginTop: "39px",
            color: "#8da4c5",
            fontSize: "9px",
          }}
        >
          Dev Credit :{" "}
          <span
            style={{
              color: "#00e5ff",
              textShadow:
                "0 0 8px rgba(0,229,255,0.3)",
            }}
          >
            Sponky
          </span>
        </div>
      </div>
    </div>
  );
}

export default SplashScreen;
