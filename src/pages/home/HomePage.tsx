import {
  BarChart3,
  ChevronDown,
  Clock3,
  Crown,
  Crosshair,
  Gamepad2,
  Globe2,
  Medal,
  Monitor,
  Sparkles,
  Swords,
  Trophy,
  Users,
  X,
  RefreshCw,
  type LucideIcon,
} from "lucide-react";
import {
  useState,
  useEffect,
} from "react";
import { services } from "../../services";

type FilterOption = {
  label: string;
  value: string;
};

type FilterCardProps = {
  label: string;
  icon: LucideIcon;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
};

type SeasonStatCardProps = {
  label: string;
  value: string;
  icon: LucideIcon;
  accent: string;
  background: string;
  secondary?: string;
};

function FilterCard({
  label,
  icon: Icon,
  value,
  options,
  onChange,
}: FilterCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption =
    options.find(
      (option) =>
        option.value === value,
    );

  return (
    <div
      style={{
        position: "relative",
        height: "44px",
        minWidth: 0,
        display: "flex",
        alignItems: "center",
        gap: "6px",
        padding: "0 8px",
        background:
          "linear-gradient(145deg, rgba(9,20,37,0.98), rgba(4,11,21,0.99))",
        border:
          "1px solid rgba(35,70,115,0.5)",
        borderRadius: "8px",
      }}
    >
      <Icon
        size={13}
        color="#00e5ff"
        strokeWidth={1.8}
      />

      <div
        style={{
          minWidth: 0,
          flex: 1,
        }}
      >
        <div
          style={{
            color: "#71829d",
            fontSize: "6px",
            fontWeight: 900,
            letterSpacing: "0.7px",
          }}
        >
          {label}
        </div>

        <div
          style={{
            marginTop: "2px",
            overflow: "hidden",
            color: "#ffffff",
            fontSize: "9px",
            fontWeight: 750,
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
          }}
        >
          {selectedOption?.label}
        </div>
      </div>

      <ChevronDown
        size={10}
        color="#77859a"
      />

      <button
        type="button"
        aria-label={label}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer", border: 0 }}
      />
      {isOpen && (
        <div style={{ position: "absolute", zIndex: 20, top: "calc(100% + 5px)", left: 0, right: 0, maxHeight: "220px", overflowY: "auto", padding: "5px", background: "#071426", border: "1px solid rgba(0,229,255,.45)", borderRadius: "8px", boxShadow: "0 14px 28px rgba(0,0,0,.45)" }}>
          {options.map((option) => (
            <button
              type="button"
              key={option.value}
              onClick={() => { onChange(option.value); setIsOpen(false); }}
              style={{ width: "100%", padding: "8px 9px", textAlign: "left", color: option.value === value ? "#00e5ff" : "#d9e4f5", background: option.value === value ? "rgba(0,229,255,.12)" : "transparent", border: 0, borderRadius: "5px", cursor: "pointer", fontSize: "10px" }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SeasonStatCard({
  label,
  value,
  icon: Icon,
  accent,
  background,
  secondary,
}: SeasonStatCardProps) {
  return (
    <div
      style={{
        minWidth: 0,
        height: "94px",
        padding: "10px 8px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        background:
          "linear-gradient(145deg, rgba(8,20,37,0.98), rgba(4,11,21,0.99))",
        border:
          "1px solid rgba(35,70,115,0.45)",
        borderRadius: "9px",
      }}
    >
      <div
        style={{
          width: "28px",
          height: "28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "50%",
          background,
          border: `1px solid ${accent}`,
        }}
      >
        <Icon
          size={14}
          color={accent}
          strokeWidth={1.9}
        />
      </div>

      <div
        style={{
          marginTop: "6px",
          color: accent,
          fontSize: "7px",
          fontWeight: 900,
          letterSpacing: "0.55px",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </div>

      <div
        style={{
          marginTop: "3px",
          color: "#ffffff",
          fontSize: "18px",
          lineHeight: 1,
          fontWeight: 850,
        }}
      >
        {value}
      </div>

      {secondary && (
        <div
          style={{
            marginTop: "4px",
            color: "#8795aa",
            fontSize: "7px",
            fontWeight: 650,
          }}
        >
          {secondary}
        </div>
      )}
    </div>
  );
}

function HomePage({ displayName = "Sponk" }: { displayName?: string }) {
  const demoProfileName = "Falcon Peterbot";
  const [profileName, setProfileName] = useState(() => window.localStorage.getItem("fortcy.epicDisplayName") ?? "");
  const [profileOpen, setProfileOpen] = useState(() => !window.localStorage.getItem("fortcy.profilePromptSeen"));
  const [profileDraft, setProfileDraft] = useState(profileName);
  const [liveStats, setLiveStats] = useState<{ wins: number | null; kills: number | null; matches: number | null; winRate: number | null } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshStats = async () => {
    if (!profileName || !services.fortniteStats.isConfigured()) return;
    setIsRefreshing(true);
    try {
      setLiveStats(await services.fortniteStats.getPlayerStats(profileName));
    } catch {
      setLiveStats(null);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (!profileName || !services.fortniteStats.isConfigured()) return;
    void refreshStats();
  }, [profileName]);
  const [
    region,
    setRegion,
  ] = useState("nae");

  const [
    gameMode,
    setGameMode,
  ] = useState("zero-build");

  const [
    playlist,
    setPlaylist,
  ] = useState("ranked");

  const [
    partySize,
    setPartySize,
  ] = useState("solo");

  const regionOptions: FilterOption[] = [
    {
      label: "NAE",
      value: "nae",
    },
    {
      label: "NA Central",
      value: "nac",
    },
    {
      label: "NA West",
      value: "naw",
    },
    {
      label: "Europe",
      value: "eu",
    },
    {
      label: "Oceania",
      value: "oce",
    },
    {
      label: "Brazil",
      value: "br",
    },
    {
      label: "Asia",
      value: "asia",
    },
    {
      label: "Middle East",
      value: "me",
    },
  ];

  const gameModeOptions: FilterOption[] = [
    {
      label: "Zero Build",
      value: "zero-build",
    },
    {
      label: "Builds",
      value: "builds",
    },
    { label: "Reload", value: "reload" },
    { label: "Creative", value: "creative" },
    { label: "Team Rumble", value: "team-rumble" },
    { label: "LEGO Fortnite", value: "lego" },
    { label: "Rocket Racing", value: "rocket-racing" },
    { label: "Festival", value: "festival" },
  ];

  const playlistOptions: FilterOption[] = [
    {
      label: "Ranked",
      value: "ranked",
    },
    {
      label: "Pubs",
      value: "pubs",
    },
    { label: "Ranked Zero Build", value: "ranked-zero-build" },
    { label: "Ranked Builds", value: "ranked-builds" },
    { label: "Tournament", value: "tournament" },
    { label: "LTM", value: "ltm" },
    { label: "Creative Match", value: "creative-match" },
  ];

  const partySizeOptions: FilterOption[] = [
    {
      label: "Solo",
      value: "solo",
    },
    {
      label: "Duos",
      value: "duos",
    },
    {
      label: "Trios",
      value: "trios",
    },
    {
      label: "Squads",
      value: "squads",
    },
    { label: "Solo Fill", value: "solo-fill" },
    { label: "Duos Fill", value: "duos-fill" },
    { label: "Trios Fill", value: "trios-fill" },
    { label: "Squads Fill", value: "squads-fill" },
    { label: "Large Team", value: "large-team" },
  ];

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: "9px",
      }}
    >
      <div
        style={{
          height: "68px",
          display: "grid",
          gridTemplateColumns:
            "minmax(0, 1fr) 190px",
          gap: "10px",
        }}
      >
        <div>
          <div
            style={{
              color: "#00e5ff",
              fontSize: "8px",
              fontWeight: 900,
              letterSpacing: "1.6px",
            }}
          >
            FORTCY
          </div>

          <div
            style={{
              marginTop: "5px",
              color: "#ffffff",
              fontSize: "20px",
              lineHeight: 1,
              fontWeight: 850,
            }}
          >
            Welcome back, {profileName || displayName} 👋
          </div>

          <div
            style={{
              marginTop: "6px",
              color: "#8493aa",
              fontSize: "9px",
            }}
          >
            Your Fortnite stats overview
          </div>
          <div style={{ position: "relative", zIndex: 10, display: "flex", gap: "5px", marginTop: "8px" }}>
            <button type="button" onClick={() => { setProfileDraft(profileName); setProfileOpen(true); }} style={{ padding: "5px 9px", color: "#8defff", background: "#071a31", border: "1px solid rgba(0,229,255,.55)", borderRadius: "6px", fontSize: "9px", cursor: "pointer", boxShadow: "0 3px 10px rgba(0,0,0,.35)" }}>
              {profileName ? "Switch User" : "Look Up User"}
            </button>
          </div>
        </div>

        <div
          style={{
            height: "68px",
            padding: "8px 11px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            background:
              "linear-gradient(145deg, rgba(9,20,37,0.98), rgba(4,11,20,0.99))",
            border:
              "1px solid rgba(41,82,128,0.47)",
            borderRadius: "9px",
          }}
        >
          <div
            style={{
              width: "38px",
              height: "38px",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffc928",
              background:
                "rgba(255,201,40,0.08)",
              border:
                "1px solid rgba(255,201,40,0.55)",
              borderRadius: "50%",
            }}
          >
            <Sparkles
              size={19}
              strokeWidth={1.8}
            />
          </div>

          <div>
            <div
              style={{
                color: "#ffc928",
                fontSize: "6px",
                fontWeight: 900,
                letterSpacing: "0.55px",
              }}
            >
              LIFETIME POWERRANK
            </div>

            <div
              style={{
                marginTop: "2px",
                color: "#ffffff",
                fontSize: "20px",
                lineHeight: 1,
                fontWeight: 900,
              }}
            >
              5,672
            </div>

            <div
              style={{
                marginTop: "2px",
                color: "#9eabbc",
                fontSize: "7px",
              }}
            >
              PowerRank Points
            </div>

            <div
              style={{
                marginTop: "2px",
                color: "#78869b",
                fontSize: "7px",
              }}
            >
              #18,742
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          position: "relative",
          height: "106px",
          flexShrink: 0,
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          padding: "10px 16px",
          background:
            "linear-gradient(105deg, rgba(25,22,91,0.98), rgba(17,40,124,0.92) 60%, rgba(13,82,142,0.72))",
          border:
            "1px solid rgba(117,83,255,0.48)",
          borderRadius: "9px",
        }}
      >
        <div style={{ position: "absolute", top: "8px", right: "8px", zIndex: 4, display: "flex", gap: "6px" }}>
          <button type="button" aria-label="Refresh profile stats" title="Refresh stats" onClick={() => void refreshStats()} disabled={isRefreshing} style={{ width: "27px", height: "27px", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", background: isRefreshing ? "#4b8f94" : "#24c8a9", border: 0, borderRadius: "50%", cursor: isRefreshing ? "default" : "pointer", boxShadow: "0 3px 10px rgba(0,0,0,.25)" }}><RefreshCw size={15} style={{ animation: isRefreshing ? "fortcy-spin 900ms linear infinite" : undefined }} /></button>
          <button type="button" aria-label="Remove profile" title="Remove profile" onClick={() => { window.localStorage.removeItem("fortcy.epicDisplayName"); window.localStorage.removeItem("fortcy.profilePromptSeen"); setProfileName(""); setProfileDraft(""); setProfileOpen(true); }} style={{ width: "27px", height: "27px", display: "flex", alignItems: "center", justifyContent: "center", color: "#ff9aaa", background: "rgba(110,20,43,.72)", border: "1px solid rgba(255,72,96,.7)", borderRadius: "7px", cursor: "pointer" }}><X size={15} /></button>
        </div>
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 85% 45%, rgba(49,98,255,0.30), transparent 38%), linear-gradient(180deg, transparent 45%, rgba(2,8,18,0.42))",
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 1,
            width: "76px",
            height: "76px",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background:
              "linear-gradient(145deg, #152b54, #071326)",
            border:
              "3px solid rgba(169,105,255,0.85)",
            borderRadius: "50%",
          }}
        >
          <Gamepad2
            size={30}
            color="#9fafff"
          />

          <div
            style={{
              position: "absolute",
              bottom: "-7px",
              minWidth: "27px",
              height: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              fontSize: "8px",
              fontWeight: 900,
              background: "#6f38d9",
              border:
                "1px solid #a97cff",
              clipPath:
                "polygon(50% 0%,100% 20%,88% 82%,50% 100%,12% 82%,0% 20%)",
            }}
          >
            172
          </div>
        </div>

        <div
          style={{
            position: "relative",
            zIndex: 1,
            marginLeft: "18px",
          }}
        >
          <div
            style={{
              color: "#ce6cff",
              fontSize: "7px",
              fontWeight: 900,
              letterSpacing: "1px",
            }}
          >
            IGN
          </div>

          <div
            style={{
              marginTop: "4px",
              color: "#ffffff",
              fontSize: "27px",
              lineHeight: 1,
              fontWeight: 900,
            }}
          >
            {profileName || displayName}
          </div>

          <div
            style={{
              marginTop: "9px",
              display: "inline-flex",
              alignItems: "center",
              gap: "7px",
              padding: "5px 8px",
              color: "#bac5d7",
              fontSize: "8px",
              background:
                "rgba(2,8,20,0.44)",
              border:
                "1px solid rgba(97,119,171,0.43)",
              borderRadius: "6px",
            }}
          >
            <Globe2 size={10} />
            NAE

            <span>•</span>

            <Monitor size={10} />
            PC

            <span>•</span>

            <Gamepad2 size={10} />
            Epic
          </div>
        </div>
      </div>

      <div
        style={{
          height: "44px",
          flexShrink: 0,
          display: "grid",
          gridTemplateColumns:
            "repeat(4, minmax(0, 1fr))",
          gap: "7px",
        }}
      >
        <FilterCard
          label="REGION"
          icon={Globe2}
          value={region}
          options={regionOptions}
          onChange={setRegion}
        />

        <FilterCard
          label="GAME MODE"
          icon={Swords}
          value={gameMode}
          options={gameModeOptions}
          onChange={setGameMode}
        />

        <FilterCard
          label="PLAYLIST"
          icon={Crosshair}
          value={playlist}
          options={playlistOptions}
          onChange={setPlaylist}
        />

        <FilterCard
          label="PARTY SIZE"
          icon={Users}
          value={partySize}
          options={partySizeOptions}
          onChange={setPartySize}
        />
      </div>

      <div
        style={{
          height: "94px",
          flexShrink: 0,
          display: "grid",
          gridTemplateColumns:
            "repeat(4, minmax(0, 1fr))",
          gap: "7px",
        }}
      >
        <SeasonStatCard
          label="SEASON WINS"
          value={liveStats?.wins == null ? "42" : String(liveStats.wins)}
          icon={Trophy}
          accent="#38e54d"
          background="rgba(56,229,77,0.09)"
          secondary="Top 8%"
        />

        <SeasonStatCard
          label="SEASON KILLS"
          value={liveStats?.kills == null ? "1,286" : liveStats.kills.toLocaleString()}
          icon={Crosshair}
          accent="#24baff"
          background="rgba(36,186,255,0.09)"
          secondary="Top 4%"
        />

        <SeasonStatCard
          label="WIN RATE"
          value={liveStats?.winRate == null ? "12.8%" : `${liveStats.winRate}%`}
          icon={Medal}
          accent="#ca5cff"
          background="rgba(202,92,255,0.09)"
          secondary="Top 13%"
        />

        <SeasonStatCard
          label="CROWN WINS"
          value="18"
          icon={Crown}
          accent="#ffc928"
          background="rgba(255,201,40,0.09)"
          secondary="This Season"
        />
      </div>

      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflow: "hidden",
          background:
            "linear-gradient(145deg, rgba(8,20,37,0.98), rgba(4,11,21,0.99))",
          border:
            "1px solid rgba(35,70,115,0.45)",
          borderRadius: "9px",
        }}
      >
        <div
          style={{
            height: "38px",
            padding: "0 12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "7px",
            }}
          >
            <BarChart3
              size={14}
              color="#00e5ff"
            />

            <div>
              <div
                style={{
                  color: "#00e5ff",
                  fontSize: "8px",
                  fontWeight: 900,
                  letterSpacing: "0.8px",
                }}
              >
                SEASON OVERVIEW
              </div>

              <div
                style={{
                  marginTop: "1px",
                  color: "#8492a6",
                  fontSize: "6px",
                }}
              >
                Current Fortnite Season
              </div>
            </div>
          </div>

          <div
            style={{
              color: "#758197",
              fontSize: "6px",
            }}
          >
            Stats update automatically
          </div>
        </div>

        <div
          style={{
            height: "calc(100% - 38px)",
            display: "grid",
            gridTemplateColumns:
              "repeat(3, minmax(0, 1fr))",
            padding: "4px 10px 8px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              borderRight:
                "1px solid rgba(39,73,116,0.42)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                color: "#9ba8ba",
                fontSize: "7px",
              }}
            >
              <Clock3
                size={11}
                color="#ca5cff"
              />
              TIME PLAYED
            </div>

            <div
              style={{
                marginTop: "4px",
                color: "#ffffff",
                fontSize: "16px",
                fontWeight: 850,
              }}
            >
              42h 18m
            </div>

            <div
              style={{
                marginTop: "2px",
                color: "#79869a",
                fontSize: "6px",
              }}
            >
              This Season
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              borderRight:
                "1px solid rgba(39,73,116,0.42)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                color: "#9ba8ba",
                fontSize: "7px",
              }}
            >
              <BarChart3
                size={11}
                color="#38e54d"
              />
              LEADERBOARD
            </div>

            <div
              style={{
                marginTop: "4px",
                color: "#ffffff",
                fontSize: "16px",
                fontWeight: 850,
              }}
            >
              #12,458
            </div>

            <div
              style={{
                marginTop: "2px",
                color: "#38e54d",
                fontSize: "6px",
                fontWeight: 750,
              }}
            >
              Top 8%
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                color: "#9ba8ba",
                fontSize: "7px",
              }}
            >
              <Users
                size={11}
                color="#24baff"
              />
              MATCHES
            </div>

            <div
              style={{
                marginTop: "4px",
                color: "#ffffff",
                fontSize: "16px",
                fontWeight: 850,
              }}
            >
              162
            </div>

            <div
              style={{
                marginTop: "2px",
                color: "#79869a",
                fontSize: "6px",
              }}
            >
              This Season
            </div>
          </div>
        </div>
      </div>
      {profileOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", background: "rgba(1,5,14,.78)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}>
          <div role="dialog" aria-modal="true" aria-label="Fortnite profile lookup" style={{ position: "relative", width: "420px", maxWidth: "100%", padding: "26px", background: "linear-gradient(145deg, #0b1d3a, #040b18)", border: "1px solid rgba(0,229,255,.42)", borderRadius: "16px", boxShadow: "0 24px 80px rgba(0,0,0,.6)" }}>
          <button type="button" aria-label="Close profile lookup" onClick={() => { const fallback = profileName || demoProfileName; window.localStorage.setItem("fortcy.epicDisplayName", fallback); window.localStorage.setItem("fortcy.profilePromptSeen", "true"); setProfileName(fallback); setProfileOpen(false); }} style={{ position: "absolute", top: "12px", right: "14px", color: "#a8bad6", background: "transparent", border: 0, fontSize: "22px", cursor: "pointer" }}>×</button>
            <div style={{ color: "#00e5ff", fontSize: "10px", fontWeight: 900, letterSpacing: "1.4px" }}>FORTNITE PROFILE</div>
            <h2 style={{ margin: "8px 0 7px", color: "#fff", fontSize: "23px" }}>Look up a player</h2>
            <p style={{ margin: 0, color: "#91a3c2", fontSize: "11px", lineHeight: 1.5 }}>Enter an Epic display name to load profile stats through the approved provider.</p>
            <input autoFocus value={profileDraft} onChange={(event) => setProfileDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && profileDraft.trim()) { window.localStorage.setItem("fortcy.epicDisplayName", profileDraft.trim()); setProfileName(profileDraft.trim()); setProfileOpen(false); } }} placeholder="Epic display name" style={{ width: "100%", boxSizing: "border-box", marginTop: "18px", padding: "12px", color: "#fff", background: "#061326", border: "1px solid rgba(74,117,184,.7)", borderRadius: "8px" }} />
            <button type="button" disabled={!profileDraft.trim()} onClick={() => { window.localStorage.setItem("fortcy.epicDisplayName", profileDraft.trim()); window.localStorage.setItem("fortcy.profilePromptSeen", "true"); setProfileName(profileDraft.trim()); setProfileOpen(false); }} style={{ width: "100%", marginTop: "12px", padding: "12px", color: "#001018", fontWeight: 850, background: profileDraft.trim() ? "#00e5ff" : "#3d6873", border: 0, borderRadius: "8px", cursor: "pointer" }}>Save profile</button>
            <div style={{ marginTop: "12px", color: "#7185a5", fontSize: "10px" }}>Close this window to continue with the {demoProfileName} demo profile.</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HomePage;
