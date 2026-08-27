import {
  Activity,
  Cpu,
  Gauge,
  Keyboard,
  MapPin,
  Server,
  Sparkles,
  Triangle,
  Wifi,
  X,
} from "lucide-react";
import {
  useEffect,
  useState,
} from "react";

import PageHeader from "../../components/PageHeader";
import { useResultsStore } from "../../stores/resultsStore";

type MetricDirection =
  | "higher"
  | "lower";

interface ComparisonMetric {
  label: string;
  icon: typeof Activity;
  previousValue: number | null;
  latestValue: number | null;
  unit: string;
  direction: MetricDirection;
  decimals?: number;
}

function formatMetricValue(
  value: number | null,
  unit: string,
  decimals = 0,
) {
  if (value === null) {
    return "--";
  }

  const formatted =
    decimals > 0
      ? value.toFixed(decimals)
      : Math.round(value).toString();

  return unit
    ? `${formatted} ${unit}`
    : formatted;
}

function formatTextValue(
  value: string | null | undefined,
) {
  if (!value) {
    return "--";
  }

  return value;
}

function getComparison(
  metric: ComparisonMetric,
) {
  const {
    previousValue,
    latestValue,
    direction,
  } = metric;

  if (
    previousValue === null ||
    latestValue === null
  ) {
    return {
      status: "missing" as const,
      difference: null,
      increased: false,
      decreased: false,
    };
  }

  const difference =
    latestValue - previousValue;

  if (difference === 0) {
    return {
      status: "same" as const,
      difference: 0,
      increased: false,
      decreased: false,
    };
  }

  const increased =
    difference > 0;

  const decreased =
    difference < 0;

  const improved =
    direction === "higher"
      ? increased
      : decreased;

  return {
    status:
      improved
        ? ("improved" as const)
        : ("declined" as const),
    difference,
    increased,
    decreased,
  };
}

function ComparisonIndicator({
  metric,
}: {
  metric: ComparisonMetric;
}) {
  const comparison =
    getComparison(metric);

  if (
    comparison.status === "missing" ||
    comparison.difference === null
  ) {
    return (
      <span
        style={{
          color: "#6f7f99",
          fontSize: "11px",
          fontWeight: 700,
        }}
      >
        —
      </span>
    );
  }

  if (
    comparison.status === "same"
  ) {
    return (
      <span
        style={{
          color: "#38e54d",
          fontSize: "11px",
          fontWeight: 800,
        }}
      >
        SAME
      </span>
    );
  }

  const improved =
    comparison.status === "improved";

  const difference =
    Math.abs(
      comparison.difference,
    );

  const decimals =
    metric.decimals ?? 0;

  const formattedDifference =
    decimals > 0
      ? difference.toFixed(decimals)
      : Math.round(
          difference,
        ).toString();

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        color: improved
          ? "#38e54d"
          : "#ff4d67",
        fontSize: "11px",
        fontWeight: 800,
      }}
    >
      <Triangle
        size={9}
        fill="currentColor"
        strokeWidth={0}
        style={{
          transform:
            comparison.decreased
              ? "rotate(180deg)"
              : "rotate(0deg)",
        }}
      />

      <span>
        {formattedDifference}
        {metric.unit
          ? ` ${metric.unit}`
          : ""}
      </span>
    </div>
  );
}

function ResultsPage() {
  const {
    latestResult,
    previousResult,
    isLoading,
    loadLatestResult,
  } = useResultsStore();

  const [
    showUtilityRibbon,
    setShowUtilityRibbon,
  ] = useState(true);

  useEffect(() => {
    void loadLatestResult();
  }, [loadLatestResult]);

  const metrics: ComparisonMetric[] = [
    {
      label: "AVG FPS",
      icon: Activity,
      previousValue:
        previousResult?.metrics
          .averageFps ?? null,
      latestValue:
        latestResult?.metrics
          .averageFps ?? null,
      unit: "",
      direction: "higher",
      decimals: 2,
    },
    {
      label: "INPUT DELAY",
      icon: Keyboard,
      previousValue:
        previousResult?.metrics
          .allInputLatencyMs ?? null,
      latestValue:
        latestResult?.metrics
          .allInputLatencyMs ?? null,
      unit: "ms",
      direction: "lower",
      decimals: 2,
    },
    {
      label: "IN-GAME PING",
      icon: Server,
      previousValue:
        previousResult?.metrics
          .gameServerPingMs ?? null,
      latestValue:
        latestResult?.metrics
          .gameServerPingMs ?? null,
      unit: "ms",
      direction: "lower",
    },
    {
      label: "ACTUAL PING",
      icon: Wifi,
      previousValue:
        previousResult?.metrics
          .averagePingMs ?? null,
      latestValue:
        latestResult?.metrics
          .averagePingMs ?? null,
      unit: "ms",
      direction: "lower",
    },
    {
      label: "GPU TEMP",
      icon: Gauge,
      previousValue:
        previousResult?.metrics
          .gpuTemperatureC ?? null,
      latestValue:
        latestResult?.metrics
          .gpuTemperatureC ?? null,
      unit: "°C",
      direction: "lower",
    },
    {
      label: "CPU TEMP",
      icon: Cpu,
      previousValue:
        previousResult?.metrics
          .cpuTemperatureC ?? null,
      latestValue:
        latestResult?.metrics
          .cpuTemperatureC ?? null,
      unit: "°C",
      direction: "lower",
    },
  ];

  const previousServerLocation =
    previousResult?.serverLocation ?? null;

  const latestServerLocation =
    latestResult?.serverLocation ?? null;

  const hasServerComparison =
    previousServerLocation !== null &&
    latestServerLocation !== null;

  const sameServerLocation =
    hasServerComparison &&
    previousServerLocation ===
      latestServerLocation;

  const serverChangeLabel =
    !hasServerComparison
      ? "—"
      : sameServerLocation
        ? "SAME"
        : "CHANGED";

  const serverChangeColor =
    !hasServerComparison
      ? "#6f7f99"
      : sameServerLocation
        ? "#38e54d"
        : "#00e5ff";

  if (isLoading) {
    return (
      <>
        <PageHeader
          title="Results"
          subtitle="Match Comparison"
        />

        <div
          style={{
            marginTop: "32px",
            color: "#8d9ab1",
            fontSize: "13px",
          }}
        >
          Loading results...
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Results"
        subtitle="Match Comparison"
      />

      <div
        style={{
          width: "100%",
          maxWidth: "960px",
          marginTop: "22px",
          paddingBottom: "22px",
        }}
      >
        <div
          style={{
            background:
              "linear-gradient(145deg, rgba(10,21,40,0.97), rgba(5,11,22,0.99))",
            border:
              "1px solid rgba(42,73,128,0.4)",
            borderRadius: "12px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "1.1fr 0.8fr 0.8fr 0.55fr",
              padding: "9px 16px",
              borderBottom:
                "1px solid rgba(42,73,128,0.26)",
              color: "#687995",
              fontSize: "9px",
              fontWeight: 850,
              letterSpacing: "1px",
            }}
          >
            <div>METRIC</div>
            <div>LAST GAME</div>
            <div>NEW GAME</div>
            <div>CHANGE</div>
          </div>

          <div
            style={{
              minHeight: "49px",
              display: "grid",
              gridTemplateColumns:
                "1.1fr 0.8fr 0.8fr 0.55fr",
              alignItems: "center",
              padding: "0 16px",
              borderBottom:
                "1px solid rgba(42,73,128,0.18)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: "#98a8c1",
                fontSize: "10px",
                fontWeight: 750,
                letterSpacing: "0.5px",
              }}
            >
              <MapPin
                size={13}
                color="#00e5ff"
                strokeWidth={1.7}
              />

              SERVER LOCATION
            </div>

            <div
              style={{
                color: "#8e9bb2",
                fontSize: "12px",
                fontWeight: 650,
              }}
            >
              {formatTextValue(
                previousServerLocation,
              )}
            </div>

            <div
              style={{
                color: "#ffffff",
                fontSize: "12px",
                fontWeight: 750,
              }}
            >
              {formatTextValue(
                latestServerLocation,
              )}
            </div>

            <div
              style={{
                color: serverChangeColor,
                fontSize: "11px",
                fontWeight: 800,
              }}
            >
              {serverChangeLabel}
            </div>
          </div>

          {metrics.map(
            (metric, index) => {
              const Icon =
                metric.icon;

              return (
                <div
                  key={metric.label}
                  style={{
                    minHeight: "49px",
                    display: "grid",
                    gridTemplateColumns:
                      "1.1fr 0.8fr 0.8fr 0.55fr",
                    alignItems: "center",
                    padding: "0 16px",
                    borderBottom:
                      index ===
                      metrics.length - 1
                        ? "none"
                        : "1px solid rgba(42,73,128,0.18)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      color: "#98a8c1",
                      fontSize: "10px",
                      fontWeight: 750,
                      letterSpacing:
                        "0.5px",
                    }}
                  >
                    <Icon
                      size={13}
                      color="#00e5ff"
                      strokeWidth={1.7}
                    />

                    {metric.label}
                  </div>

                  <div
                    style={{
                      color: "#8e9bb2",
                      fontSize: "12px",
                      fontWeight: 650,
                    }}
                  >
                    {formatMetricValue(
                      metric.previousValue,
                      metric.unit,
                      metric.decimals,
                    )}
                  </div>

                  <div
                    style={{
                      color: "#ffffff",
                      fontSize: "12px",
                      fontWeight: 750,
                    }}
                  >
                    {formatMetricValue(
                      metric.latestValue,
                      metric.unit,
                      metric.decimals,
                    )}
                  </div>

                  <ComparisonIndicator
                    metric={metric}
                  />
                </div>
              );
            },
          )}
        </div>

        {showUtilityRibbon && (
          <div
            style={{
              marginTop: "10px",
              minHeight: "54px",
              padding: "10px 12px",
              display: "flex",
              alignItems: "center",
              justifyContent:
                "space-between",
              gap: "14px",
              background:
                "linear-gradient(90deg, rgba(126,92,255,0.11), rgba(7,14,27,0.98))",
              border:
                "1px solid rgba(126,92,255,0.24)",
              borderRadius: "10px",
            }}
          >
            <div
              style={{
                minWidth: 0,
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <div
                style={{
                  width: "30px",
                  height: "30px",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent:
                    "center",
                  borderRadius: "8px",
                  background:
                    "rgba(126,92,255,0.1)",
                  border:
                    "1px solid rgba(126,92,255,0.18)",
                }}
              >
                <Sparkles
                  size={15}
                  color="#a789ff"
                />
              </div>

              <div
                style={{
                  minWidth: 0,
                  display: "flex",
                  alignItems: "baseline",
                  gap: "7px",
                  flexWrap: "wrap",
                }}
              >
                <span
                  style={{
                    color: "#ffffff",
                    fontSize: "11px",
                    fontWeight: 800,
                  }}
                >
                  Want better results?
                </span>

                <span
                  style={{
                    color: "#8493ab",
                    fontSize: "10px",
                  }}
                >
                  Optimize Prime Utility
                  is coming soon.
                </span>
              </div>
            </div>

            <div
              style={{
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <div
                style={{
                  padding: "7px 10px",
                  color: "#a78cff",
                  fontSize: "9px",
                  fontWeight: 850,
                  letterSpacing: "0.7px",
                  background:
                    "rgba(126,92,255,0.07)",
                  border:
                    "1px solid rgba(126,92,255,0.2)",
                  borderRadius: "7px",
                }}
              >
                COMING SOON
              </div>

              <button
                type="button"
                aria-label="Dismiss"
                onClick={() =>
                  setShowUtilityRibbon(
                    false,
                  )
                }
                style={{
                  width: "28px",
                  height: "28px",
                  padding: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent:
                    "center",
                  color: "#6f7f99",
                  background:
                    "transparent",
                  border: "none",
                  borderRadius: "7px",
                  cursor: "pointer",
                }}
              >
                <X
                  size={15}
                  strokeWidth={1.8}
                />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default ResultsPage;
