import {
  Globe2,
  Radio,
  Trophy,
} from "lucide-react";
import { useEffect, useState } from "react";

import PageHeader from "../../components/PageHeader";
import PrimaryButton from "../../components/PrimaryButton";
import { fortnitePingRegions } from "../../services/PingService";
import { usePingStore } from "../../stores/pingStore";
import { services } from "../../services";

function PingPage() {
  const {
    isTesting,
    hasTested,
    values,
    testAllRegions,
  } = usePingStore();

  const [hoveredRegion, setHoveredRegion] =
    useState<string | null>(null);

  const [bestRegionHovered, setBestRegionHovered] =
    useState(false);
  const [matchRecommendation, setMatchRecommendation] = useState<{ games: number; region: string; ping: number } | null>(null);

  useEffect(() => {
    void services.storage.getBenchmarks().then((benchmarks) => {
      const samples = benchmarks.map(({ result }) => ({
        region: result.serverLocation ?? result.matchRegion,
        ping: result.metrics.gameServerPingMs ?? result.metrics.averagePingMs,
      })).filter((sample): sample is { region: string; ping: number } => Boolean(sample.region) && sample.ping != null);
      if (samples.length < 2) return;
      const grouped = new Map<string, number[]>();
      samples.forEach(({ region, ping }) => grouped.set(region, [...(grouped.get(region) ?? []), ping]));
      const recommendation = [...grouped.entries()].map(([region, pings]) => ({ region, ping: Math.round(pings.reduce((sum, value) => sum + value, 0) / pings.length), games: pings.length })).sort((a, b) => a.ping - b.ping)[0];
      if (recommendation) setMatchRecommendation(recommendation);
    }).catch(() => undefined);
  }, []);

  let bestRegionIndex = -1;
  let bestLatency: number | null = null;

  if (hasTested) {
    values.forEach((latency, index) => {
      if (
        latency !== null &&
        (
          bestLatency === null ||
          latency < bestLatency
        )
      ) {
        bestLatency = latency;
        bestRegionIndex = index;
      }
    });
  }

  const bestRegion =
    bestRegionIndex >= 0
      ? fortnitePingRegions[bestRegionIndex]
      : null;

  return (
    <>
      <PageHeader
        title="Ping"
        subtitle="Fortnite Region Latency"
      />

      <div
        style={{
          width: "100%",
          maxWidth: "700px",
          marginTop: "26px",
        }}
      >
        <PrimaryButton
          label={
            isTesting
              ? "TESTING..."
              : "TEST REGIONS"
          }
          onClick={() => {
            void testAllRegions();
          }}
          icon={Radio}
          disabled={isTesting}
        />

        <div
          style={{
            marginTop: "20px",
            display: "grid",
            gridTemplateColumns:
              "repeat(2, minmax(0, 1fr))",
            gap: "8px",
          }}
        >
          {fortnitePingRegions.map(
            (item, index) => {
              const isHovered =
                hoveredRegion === item.id;

              const latency =
                values[index] ?? null;

              const hasLatency =
                latency !== null;

              return (
                <div
                  key={item.id}
                  onMouseEnter={() =>
                    setHoveredRegion(item.id)
                  }
                  onMouseLeave={() =>
                    setHoveredRegion(null)
                  }
                  style={{
                    height: "66px",
                    padding: "9px 13px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent:
                      "space-between",
                    background: isHovered
                      ? "linear-gradient(145deg, rgba(13,29,54,0.98), rgba(6,13,25,0.99))"
                      : "linear-gradient(145deg, rgba(11,24,45,0.96), rgba(5,11,22,0.98))",
                    border: isHovered
                      ? "1px solid rgba(0,229,255,0.22)"
                      : "1px solid rgba(42,73,128,0.42)",
                    borderRadius: "9px",
                    boxShadow: isHovered
                      ? "0 0 20px rgba(0,229,255,0.05)"
                      : "none",
                    transform: isHovered
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
                        gap: "7px",
                        color: "#ffffff",
                        fontSize: "12px",
                        fontWeight: 700,
                      }}
                    >
                      <Globe2
                        size={13}
                        color="#00e5ff"
                      />

                      {item.name}
                    </div>

                    <div
                      style={{
                        marginTop: "4px",
                        marginLeft: "20px",
                        color: isHovered
                          ? "#7284a3"
                          : "#637491",
                        fontSize: "7px",
                        fontWeight: 600,
                        letterSpacing: "0.6px",
                        textTransform:
                          "uppercase",
                        transition:
                          "color 150ms ease",
                      }}
                    >
                      {item.location}
                    </div>
                  </div>

                  <div
                    style={{
                      minWidth: "54px",
                      display: "flex",
                      alignItems: "baseline",
                      justifyContent:
                        "flex-end",
                      gap: "4px",
                    }}
                  >
                    <span
                      style={{
                        color:
                          hasTested &&
                          hasLatency
                            ? "#00e5ff"
                            : "#ffffff",
                        fontSize: "19px",
                        fontWeight: 750,
                        textShadow:
                          hasTested &&
                          hasLatency
                            ? "0 0 12px rgba(0,229,255,0.2)"
                            : "none",
                      }}
                    >
                      {isTesting
                        ? "..."
                        : hasTested
                          ? hasLatency
                            ? latency
                            : "--"
                          : "--"}
                    </span>

                    {hasTested &&
                      hasLatency && (
                        <span
                          style={{
                            color: "#72809b",
                            fontSize: "8px",
                            fontWeight: 600,
                          }}
                        >
                          ms
                        </span>
                      )}
                  </div>
                </div>
              );
            },
          )}

          <div
            onMouseEnter={() =>
              setBestRegionHovered(true)
            }
            onMouseLeave={() =>
              setBestRegionHovered(false)
            }
            style={{
              height: "66px",
              padding: "9px 13px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: bestRegionHovered
                ? "linear-gradient(145deg, rgba(9,42,31,0.98), rgba(5,18,17,0.99))"
                : "linear-gradient(145deg, rgba(7,34,27,0.96), rgba(5,15,18,0.98))",
              border: bestRegionHovered
                ? "1px solid rgba(56,229,77,0.72)"
                : "1px solid rgba(56,229,77,0.48)",
              borderRadius: "9px",
              boxShadow: bestRegionHovered
                ? "0 0 26px rgba(56,229,77,0.18), inset 0 0 18px rgba(56,229,77,0.04)"
                : "0 0 18px rgba(56,229,77,0.10)",
              transform: bestRegionHovered
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
                  gap: "7px",
                  color: "#ffffff",
                  fontSize: "12px",
                  fontWeight: 750,
                }}
              >
                <Trophy
                  size={13}
                  color="#38e54d"
                />

                BEST REGION
              </div>

              <div
                style={{
                  marginTop: "4px",
                  marginLeft: "20px",
                  color: bestRegion
                    ? "#38e54d"
                    : "#70827b",
                  fontSize: "7px",
                  fontWeight: 700,
                  letterSpacing: "0.6px",
                  textTransform: "uppercase",
                  textShadow: bestRegion
                    ? "0 0 10px rgba(56,229,77,0.18)"
                    : "none",
                }}
              >
                {isTesting
                  ? "Calculating..."
                  : bestRegion
                    ? bestRegion.name
                    : "Run Test"}
              </div>
            </div>

            <div
              style={{
                minWidth: "54px",
                display: "flex",
                alignItems: "baseline",
                justifyContent: "flex-end",
                gap: "4px",
              }}
            >
              <span
                style={{
                  color: bestLatency !== null
                    ? "#38e54d"
                    : "#ffffff",
                  fontSize: "19px",
                  fontWeight: 800,
                  textShadow:
                    bestLatency !== null
                      ? "0 0 14px rgba(56,229,77,0.34)"
                      : "none",
                }}
              >
                {isTesting
                  ? "..."
                  : bestLatency !== null
                    ? bestLatency
                    : "--"}
              </span>

              {bestLatency !== null &&
                !isTesting && (
                  <span
                    style={{
                      color: "#7fa98a",
                      fontSize: "8px",
                      fontWeight: 600,
                    }}
                  >
                    ms
                  </span>
                )}
            </div>
          </div>
        </div>

        <div style={{ marginTop: "12px", padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", background: "linear-gradient(145deg, rgba(10,27,43,.98), rgba(5,13,25,.99))", border: "1px solid rgba(0,229,255,.3)", borderRadius: "9px" }}>
          <div>
            <div style={{ color: "#00e5ff", fontSize: "10px", fontWeight: 900, letterSpacing: ".7px" }}>MATCH SERVER RECOMMENDATION</div>
            <div style={{ marginTop: "5px", color: "#91a3bf", fontSize: "9px" }}>{matchRecommendation ? `Based on ${matchRecommendation.games} completed game${matchRecommendation.games === 1 ? "" : "s"}.` : "Complete at least 2 tracked games to compare real server performance."}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ color: matchRecommendation ? "#38e54d" : "#71829d", fontSize: "12px", fontWeight: 900 }}>{matchRecommendation?.region ?? "Waiting for games"}</div>
            {matchRecommendation && <div style={{ marginTop: "3px", color: "#fff", fontSize: "11px", fontWeight: 800 }}>{matchRecommendation.ping} ms average</div>}
          </div>
        </div>
      </div>
    </>
  );
}

export default PingPage;
