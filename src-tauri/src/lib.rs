use ipnet::Ipv4Net;
use serde::{Deserialize, Serialize};
use std::env;
use std::fs;
use std::net::{
    IpAddr,
    Ipv4Addr,
    ToSocketAddrs,
};
use std::path::PathBuf;
use std::sync::OnceLock;
use std::time::Duration;
use tauri::{
    AppHandle,
    Window,
};
use tauri_plugin_shell::ShellExt;

#[cfg(windows)]
use windows::Win32::Graphics::Gdi::{
    EnumDisplaySettingsW,
    DEVMODEW,
    ENUM_CURRENT_SETTINGS,
};

#[cfg(windows)]
use windows::Win32::NetworkManagement::IpHelper::{
    IcmpCloseHandle,
    IcmpCreateFile,
    IcmpSendEcho,
    ICMP_ECHO_REPLY32,
};

#[cfg(windows)]
use windows::Win32::System::Diagnostics::ToolHelp::{
    CreateToolhelp32Snapshot,
    Process32FirstW,
    Process32NextW,
    PROCESSENTRY32W,
    TH32CS_SNAPPROCESS,
};

const AWS_IP_RANGES_URL: &str =
    "https://ip-ranges.amazonaws.com/ip-ranges.json";

static AWS_IP_RANGES:
    OnceLock<Option<Vec<AwsIpv4Prefix>>> =
    OnceLock::new();

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct SystemInformation {
    resolution: String,
    refresh_rate_hz: Option<u32>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct FortniteStatus {
    running: bool,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct LatencyResult {
    latency_ms: Option<u32>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct MatchStateResult {
    state: String,
    log_found: bool,
    region: Option<String>,

    game_server_ip: Option<String>,
    game_server_port: Option<u16>,

    ping_address: Option<String>,
    ping_port: Option<u16>,

    server_location: Option<String>,

    average_fps: Option<f64>,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct HardwareTemperatureResult {
    cpu_temperature_c: Option<f64>,
    gpu_temperature_c: Option<f64>,
    cpu_available: bool,
    gpu_available: bool,
    cpu_source: String,
    gpu_source: String,
    pawn_io_installed: bool,
    pawn_io_version: Option<String>,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct InputLatencyResult {
    average_latency_ms: Option<f64>,
    sample_count: u64,
    available: bool,
}

#[derive(Deserialize)]
struct AwsIpRangesResponse {
    prefixes: Vec<AwsIpv4Prefix>,
}

#[derive(Clone, Deserialize)]
struct AwsIpv4Prefix {
    ip_prefix: String,
    region: String,
    network_border_group: String,
}

#[cfg(windows)]
fn get_refresh_rate() -> Option<u32> {
    let mut dev_mode =
        DEVMODEW::default();

    dev_mode.dmSize =
        std::mem::size_of::<DEVMODEW>()
            as u16;

    let success =
        unsafe {
            EnumDisplaySettingsW(
                None,
                ENUM_CURRENT_SETTINGS,
                &mut dev_mode,
            )
        };

    if success.as_bool() {
        let refresh_rate =
            dev_mode.dmDisplayFrequency;

        if refresh_rate > 1 {
            Some(refresh_rate)
        } else {
            None
        }
    } else {
        None
    }
}

#[cfg(not(windows))]
fn get_refresh_rate() -> Option<u32> {
    None
}

#[cfg(windows)]
fn is_fortnite_running() -> bool {
    let snapshot =
        unsafe {
            CreateToolhelp32Snapshot(
                TH32CS_SNAPPROCESS,
                0,
            )
        };

    let Ok(snapshot) = snapshot else {
        return false;
    };

    let mut process_entry =
        PROCESSENTRY32W::default();

    process_entry.dwSize =
        std::mem::size_of::<
            PROCESSENTRY32W,
        >() as u32;

    let mut has_process =
        unsafe {
            Process32FirstW(
                snapshot,
                &mut process_entry,
            )
            .is_ok()
        };

    while has_process {
        let end =
            process_entry
                .szExeFile
                .iter()
                .position(
                    |character| {
                        *character == 0
                    },
                )
                .unwrap_or(
                    process_entry
                        .szExeFile
                        .len(),
                );

        let process_name =
            String::from_utf16_lossy(
                &process_entry
                    .szExeFile[..end],
            )
            .to_ascii_lowercase();

        if process_name.starts_with(
            "fortniteclient-win64-shipping",
        ) {
            return true;
        }

        has_process =
            unsafe {
                Process32NextW(
                    snapshot,
                    &mut process_entry,
                )
                .is_ok()
            };
    }

    false
}

#[cfg(not(windows))]
fn is_fortnite_running() -> bool {
    false
}

fn resolve_ipv4(
    host: &str,
) -> Option<Ipv4Addr> {
    let address =
        format!("{host}:0");

    address
        .to_socket_addrs()
        .ok()?
        .find_map(
            |socket_address| {
                match socket_address.ip() {
                    IpAddr::V4(ipv4) => {
                        Some(ipv4)
                    }

                    IpAddr::V6(_) => {
                        None
                    }
                }
            },
        )
}

#[cfg(windows)]
fn ping_once(
    host: &str,
) -> Option<u32> {
    let ipv4 =
        resolve_ipv4(host)?;

    let destination_address =
        u32::from_ne_bytes(
            ipv4.octets(),
        );

    let icmp_handle =
        unsafe {
            IcmpCreateFile()
        }
        .ok()?;

    let request_data =
        b"FORTCY";

    let reply_size =
        std::mem::size_of::<
            ICMP_ECHO_REPLY32,
        >()
            + request_data.len()
            + 32;

    let mut reply_buffer =
        vec![
            0u8;
            reply_size
        ];

    let reply_count =
        unsafe {
            IcmpSendEcho(
                icmp_handle,
                destination_address,
                request_data
                    .as_ptr()
                    .cast(),
                request_data.len()
                    as u16,
                None,
                reply_buffer
                    .as_mut_ptr()
                    .cast(),
                reply_buffer.len()
                    as u32,
                1000,
            )
        };

    let _ =
        unsafe {
            IcmpCloseHandle(
                icmp_handle,
            )
        };

    if reply_count == 0 {
        return None;
    }

    let reply =
        unsafe {
            &*(
                reply_buffer
                    .as_ptr()
                    as *const
                        ICMP_ECHO_REPLY32
            )
        };

    Some(
        reply.RoundTripTime,
    )
}

#[cfg(not(windows))]
fn ping_once(
    _host: &str,
) -> Option<u32> {
    None
}

fn measure_icmp_latency(
    host: &str,
) -> Option<u32> {
    let mut samples =
        Vec::new();

    for _ in 0..3 {
        if let Some(latency) =
            ping_once(host)
        {
            samples.push(
                latency,
            );
        }
    }

    if samples.is_empty() {
        return None;
    }

    samples.sort_unstable();

    Some(
        samples[
            samples.len() / 2
        ],
    )
}

fn get_fortnite_log_path()
    -> Option<PathBuf>
{
    let local_app_data =
        env::var(
            "LOCALAPPDATA",
        )
        .ok()?;

    Some(
        PathBuf::from(
            local_app_data,
        )
        .join("FortniteGame")
        .join("Saved")
        .join("Logs")
        .join(
            "FortniteGame.log",
        ),
    )
}

fn detect_matchmaking_region(
    log_contents: &str,
) -> Option<String> {
    let marker =
        "/Fortnite.com/Matchmaking:Region [";

    let marker_position =
        log_contents
            .rfind(marker)?;

    let region_start =
        marker_position
            + marker.len();

    let remaining =
        &log_contents[
            region_start..
        ];

    let region_end =
        remaining.find(']')?;

    let region =
        remaining[
            ..region_end
        ]
        .trim()
        .to_ascii_uppercase();

    if region.is_empty() {
        None
    } else {
        Some(region)
    }
}

fn parse_ipv4_and_port(
    address: &str,
) -> Option<(String, u16)> {
    let trimmed =
        address.trim();

    let (
        ip,
        port_text,
    ) =
        trimmed
            .rsplit_once(':')?;

    let parsed_ip =
        ip.parse::<Ipv4Addr>()
            .ok()?;

    let parsed_port =
        port_text
            .parse::<u16>()
            .ok()?;

    Some((
        parsed_ip.to_string(),
        parsed_port,
    ))
}

fn detect_game_server(
    log_contents: &str,
) -> (
    Option<String>,
    Option<u16>,
) {
    for line
        in log_contents
            .lines()
            .rev()
    {
        if !line.contains(
            "GameNetDriver",
        ) {
            continue;
        }

        let Some(
            remote_position,
        ) =
            line.find(
                "RemoteAddr: ",
            )
        else {
            continue;
        };

        let address_start =
            remote_position
                + "RemoteAddr: "
                    .len();

        let remaining =
            &line[
                address_start..
            ];

        let address_end =
            remaining
                .find(',')
                .unwrap_or(
                    remaining
                        .len(),
                );

        let address =
            &remaining[
                ..address_end
            ];

        if let Some((
            ip,
            port,
        )) =
            parse_ipv4_and_port(
                address,
            )
        {
            return (
                Some(ip),
                Some(port),
            );
        }
    }

    let browse_marker =
        "LogNet: Browse: ";

    if let Some(position) =
        log_contents
            .rfind(
                browse_marker,
            )
    {
        let start =
            position
                + browse_marker
                    .len();

        let remaining =
            &log_contents[start..];

        let end =
            remaining
                .find('/')
                .or_else(|| {
                    remaining
                        .find('\n')
                })
                .unwrap_or(
                    remaining
                        .len(),
                );

        let address =
            remaining[
                ..end
            ]
            .trim();

        if let Some((
            ip,
            port,
        )) =
            parse_ipv4_and_port(
                address,
            )
        {
            return (
                Some(ip),
                Some(port),
            );
        }
    }

    (None, None)
}

fn detect_ping_endpoint(
    log_contents: &str,
) -> (
    Option<String>,
    Option<u16>,
) {
    for line
        in log_contents
            .lines()
            .rev()
    {
        if !line.contains(
            "ServerSetPingAddress:",
        ) {
            continue;
        }

        let address_marker =
            " PingAddress: ";

        let port_marker =
            " PingPort: ";

        let ping_address =
            line.find(
                address_marker,
            )
            .and_then(
                |position| {
                    let start =
                        position
                            + address_marker
                                .len();

                    let remaining =
                        &line[start..];

                    let text =
                        remaining
                            .split(',')
                            .next()?
                            .trim();

                    text.parse::<
                        Ipv4Addr,
                    >()
                    .ok()
                    .map(
                        |ip| {
                            ip.to_string()
                        },
                    )
                },
            );

        let ping_port =
            line.find(
                port_marker,
            )
            .and_then(
                |position| {
                    let start =
                        position
                            + port_marker
                                .len();

                    let remaining =
                        &line[start..];

                    let port_text =
                        remaining
                            .split(
                                |character:
                                    char| {
                                    !character
                                        .is_ascii_digit()
                                },
                            )
                            .next()
                            .unwrap_or(
                                "",
                            );

                    port_text
                        .parse::<u16>()
                        .ok()
                },
            );

        if ping_address
            .is_some()
            || ping_port
                .is_some()
        {
            return (
                ping_address,
                ping_port,
            );
        }
    }

    (None, None)
}

fn download_aws_ip_ranges()
    -> Option<
        Vec<AwsIpv4Prefix>,
    >
{
    let client =
        reqwest::blocking::
            Client::builder()
            .timeout(
                Duration::from_secs(
                    4,
                ),
            )
            .build()
            .ok()?;

    let response =
        client
            .get(
                AWS_IP_RANGES_URL,
            )
            .header(
                reqwest::header::
                    USER_AGENT,
                "Fortcy/0.1",
            )
            .send()
            .ok()?
            .error_for_status()
            .ok()?;

    let ranges =
        response
            .json::<
                AwsIpRangesResponse,
            >()
            .ok()?;

    Some(
        ranges.prefixes,
    )
}

fn get_aws_ip_ranges()
    -> Option<
        &'static
            Vec<AwsIpv4Prefix>,
    >
{
    AWS_IP_RANGES
        .get_or_init(
            download_aws_ip_ranges,
        )
        .as_ref()
}

fn aws_region_display_name(
    region: &str,
) -> String {
    match region {
        "us-east-1" => {
            "N. VIRGINIA"
                .to_string()
        }

        "us-east-2" => {
            "OHIO"
                .to_string()
        }

        "us-west-1" => {
            "N. CALIFORNIA"
                .to_string()
        }

        "us-west-2" => {
            "OREGON"
                .to_string()
        }

        "ca-central-1" => {
            "CANADA CENTRAL"
                .to_string()
        }

        "ca-west-1" => {
            "CANADA WEST"
                .to_string()
        }

        "sa-east-1" => {
            "SAO PAULO"
                .to_string()
        }

        "eu-west-1" => {
            "IRELAND"
                .to_string()
        }

        "eu-west-2" => {
            "LONDON"
                .to_string()
        }

        "eu-west-3" => {
            "PARIS"
                .to_string()
        }

        "eu-central-1" => {
            "FRANKFURT"
                .to_string()
        }

        "eu-central-2" => {
            "ZURICH"
                .to_string()
        }

        "eu-north-1" => {
            "STOCKHOLM"
                .to_string()
        }

        "eu-south-1" => {
            "MILAN"
                .to_string()
        }

        "eu-south-2" => {
            "SPAIN"
                .to_string()
        }

        "ap-northeast-1" => {
            "TOKYO"
                .to_string()
        }

        "ap-northeast-2" => {
            "SEOUL"
                .to_string()
        }

        "ap-northeast-3" => {
            "OSAKA"
                .to_string()
        }

        "ap-southeast-1" => {
            "SINGAPORE"
                .to_string()
        }

        "ap-southeast-2" => {
            "SYDNEY"
                .to_string()
        }

        "ap-southeast-3" => {
            "JAKARTA"
                .to_string()
        }

        "ap-south-1" => {
            "MUMBAI"
                .to_string()
        }

        "ap-south-2" => {
            "HYDERABAD"
                .to_string()
        }

        "me-south-1" => {
            "BAHRAIN"
                .to_string()
        }

        "me-central-1" => {
            "UAE"
                .to_string()
        }

        "af-south-1" => {
            "CAPE TOWN"
                .to_string()
        }

        _ => {
            region
                .to_ascii_uppercase()
        }
    }
}

fn aws_border_group_display_name(
    border_group: &str,
    region: &str,
) -> String {
    if border_group == region {
        return aws_region_display_name(
            region,
        );
    }

    match border_group {
        "us-east-1-atl-1" => {
            "ATLANTA"
                .to_string()
        }

        "us-east-1-bos-1" => {
            "BOSTON"
                .to_string()
        }

        "us-east-1-chi-1" => {
            "CHICAGO"
                .to_string()
        }

        "us-east-1-dfw-2" => {
            "DALLAS"
                .to_string()
        }

        "us-east-1-iah-2" => {
            "HOUSTON"
                .to_string()
        }

        "us-east-1-mci-1" => {
            "KANSAS CITY"
                .to_string()
        }

        "us-east-1-mia-1" => {
            "MIAMI"
                .to_string()
        }

        "us-east-1-msp-1" => {
            "MINNEAPOLIS"
                .to_string()
        }

        "us-east-1-nyc-1" => {
            "NEW YORK"
                .to_string()
        }

        "us-east-1-phl-1" => {
            "PHILADELPHIA"
                .to_string()
        }

        "us-west-2-den-1" => {
            "DENVER"
                .to_string()
        }

        "us-west-2-las-1" => {
            "LAS VEGAS"
                .to_string()
        }

        "us-west-2-lax-1" => {
            "LOS ANGELES"
                .to_string()
        }

        "us-west-2-phx-2" => {
            "PHOENIX"
                .to_string()
        }

        "us-west-2-pdx-1" => {
            "PORTLAND"
                .to_string()
        }

        _ => {
            aws_region_display_name(
                region,
            )
        }
    }
}

fn detect_server_location(
    game_server_ip:
        Option<&str>,
) -> Option<String> {
    let ip_text =
        game_server_ip?;

    let ip =
        ip_text
            .parse::<Ipv4Addr>()
            .ok()?;

    let ranges =
        get_aws_ip_ranges()?;

    let mut best_match:
        Option<(
            u8,
            &AwsIpv4Prefix,
        )> =
        None;

    for range in ranges {
        let Ok(network) =
            range
                .ip_prefix
                .parse::<Ipv4Net>()
        else {
            continue;
        };

        if !network.contains(
            &ip,
        ) {
            continue;
        }

        let prefix_length =
            network.prefix_len();

        let should_replace =
            best_match
                .as_ref()
                .map(
                    |(
                        current_prefix_length,
                        _,
                    )| {
                        prefix_length
                            > *current_prefix_length
                    },
                )
                .unwrap_or(true);

        if should_replace {
            best_match =
                Some((
                    prefix_length,
                    range,
                ));
        }
    }

    let (
        _,
        matched_range,
    ) =
        best_match?;

    Some(
        aws_border_group_display_name(
            &matched_range
                .network_border_group,
            &matched_range.region,
        ),
    )
}

fn parse_average_fps_from_line(
    line: &str,
) -> Option<f64> {
    let fps_position =
        line.find(
            "AvgFPS:",
        )?;

    let fps_start =
        fps_position
            + "AvgFPS:".len();

    let fps_remaining =
        &line[fps_start..];

    let fps_text =
        fps_remaining
            .split(
                |character: char| {
                    character == ','
                        || character
                            .is_whitespace()
                },
            )
            .find(
                |value| {
                    !value.is_empty()
                },
            )?;

    fps_text
        .parse::<f64>()
        .ok()
}

fn detect_average_fps(
    log_contents: &str,
    match_start_position:
        Option<usize>,
) -> Option<f64> {
    let start_position =
        match_start_position?;

    let current_match_log =
        &log_contents[
            start_position..
        ];

    for line
        in current_match_log
            .lines()
            .rev()
    {
        if let Some(value) =
            parse_average_fps_from_line(
                line,
            )
        {
            return Some(value);
        }
    }

    None
}

fn latest_position(
    positions:
        &[Option<usize>],
) -> Option<usize> {
    positions
        .iter()
        .flatten()
        .copied()
        .max()
}

fn detect_match_state()
    -> MatchStateResult
{
    let Some(log_path) =
        get_fortnite_log_path()
    else {
        return MatchStateResult {
            state:
                "waiting"
                    .to_string(),

            log_found:
                false,

            region:
                None,

            game_server_ip:
                None,

            game_server_port:
                None,

            ping_address:
                None,

            ping_port:
                None,

            server_location:
                None,

            average_fps:
                None,
        };
    };

    if !log_path.exists() {
        return MatchStateResult {
            state:
                "waiting"
                    .to_string(),

            log_found:
                false,

            region:
                None,

            game_server_ip:
                None,

            game_server_port:
                None,

            ping_address:
                None,

            ping_port:
                None,

            server_location:
                None,

            average_fps:
                None,
        };
    }

    let Ok(log_contents) =
        fs::read_to_string(
            &log_path,
        )
    else {
        return MatchStateResult {
            state:
                "waiting"
                    .to_string(),

            log_found:
                true,

            region:
                None,

            game_server_ip:
                None,

            game_server_port:
                None,

            ping_address:
                None,

            ping_port:
                None,

            server_location:
                None,

            average_fps:
                None,
        };
    };

    let start_marker =
        "Snapshot: Start of Match (Athena_GameState_C";

    let end_snapshot_marker =
        "Snapshot: End of Match (Athena_GameState_C";

    let legacy_end_marker =
        "end game, not leaving session";

    let lobby_marker =
        "Old Location: {InGame} / New Location: {ReturningToFrontEnd}";

    let leaving_session_marker =
        "leaving session";

    let last_start =
        log_contents
            .rfind(
                start_marker,
            );

    let last_end_snapshot =
        log_contents
            .rfind(
                end_snapshot_marker,
            );

    let last_legacy_end =
        log_contents
            .rfind(
                legacy_end_marker,
            );

    let last_lobby =
        log_contents
            .rfind(
                lobby_marker,
            );

    let last_leaving_session =
        log_contents
            .rfind(
                leaving_session_marker,
            );

    let latest_stop =
        latest_position(
            &[
                last_end_snapshot,
                last_legacy_end,
                last_lobby,
                last_leaving_session,
            ],
        );

    let state =
        match (
            last_start,
            latest_stop,
        ) {
            (
                Some(start),
                Some(stop),
            )
                if start > stop =>
            {
                "in_match"
            }

            (
                Some(_),
                Some(_),
            ) => {
                "match_ended"
            }

            (
                Some(_),
                None,
            ) => {
                "in_match"
            }

            _ => {
                "waiting"
            }
        };

    let region =
        detect_matchmaking_region(
            &log_contents,
        );

    let (
        game_server_ip,
        game_server_port,
    ) =
        detect_game_server(
            &log_contents,
        );

    let (
        ping_address,
        ping_port,
    ) =
        detect_ping_endpoint(
            &log_contents,
        );

    let server_location =
        detect_server_location(
            game_server_ip
                .as_deref(),
        );

    let average_fps =
        detect_average_fps(
            &log_contents,
            last_start,
        );

    MatchStateResult {
        state:
            state.to_string(),

        log_found:
            true,

        region,

        game_server_ip,

        game_server_port,

        ping_address,

        ping_port,

        server_location,

        average_fps,
    }
}

#[tauri::command]
fn get_system_information(
    window: Window,
) -> SystemInformation {
    let resolution =
        window
            .current_monitor()
            .ok()
            .flatten()
            .map(
                |monitor| {
                    let size =
                        monitor.size();

                    format!(
                        "{} × {}",
                        size.width,
                        size.height
                    )
                },
            )
            .unwrap_or_else(
                || {
                    "--"
                        .to_string()
                },
            );

    SystemInformation {
        resolution,

        refresh_rate_hz:
            get_refresh_rate(),
    }
}

#[tauri::command]
fn get_fortnite_status()
    -> FortniteStatus
{
    FortniteStatus {
        running:
            is_fortnite_running(),
    }
}

#[tauri::command]
fn measure_latency(
    host: String,
) -> LatencyResult {
    LatencyResult {
        latency_ms:
            measure_icmp_latency(
                &host,
            ),
    }
}

#[tauri::command]
fn get_match_state()
    -> MatchStateResult
{
    detect_match_state()
}

#[tauri::command]
async fn get_hardware_temperatures(
    app: AppHandle,
) -> Result<
    HardwareTemperatureResult,
    String,
> {
    let sidecar =
        app
            .shell()
            .sidecar(
                "FortcyHardwareMonitor",
            )
            .map_err(
                |error| {
                    format!(
                        "Failed to prepare hardware monitor: {error}"
                    )
                },
            )?;

    let output =
        sidecar
            .output()
            .await
            .map_err(
                |error| {
                    format!(
                        "Failed to run hardware monitor: {error}"
                    )
                },
            )?;

    if !output
        .status
        .success()
    {
        let stderr =
            String::from_utf8_lossy(
                &output.stderr,
            )
            .trim()
            .to_string();

        return Err(
            if stderr.is_empty() {
                "Hardware monitor exited with an error."
                    .to_string()
            } else {
                format!(
                    "Hardware monitor error: {stderr}"
                )
            },
        );
    }

    let stdout =
        String::from_utf8(
            output.stdout,
        )
        .map_err(
            |error| {
                format!(
                    "Hardware monitor returned invalid UTF-8: {error}"
                )
            },
        )?;

    serde_json::from_str::<
        HardwareTemperatureResult,
    >(
        stdout.trim(),
    )
    .map_err(
        |error| {
            format!(
                "Failed to parse hardware monitor output: {error}"
            )
        },
    )
}

#[tauri::command]
async fn measure_input_latency(
    app: AppHandle,
) -> Result<
    InputLatencyResult,
    String,
> {
    let sidecar =
        app
            .shell()
            .sidecar(
                "FortcyInputMonitor",
            )
            .map_err(
                |error| {
                    format!(
                        "Failed to prepare input monitor: {error}"
                    )
                },
            )?;

    let output =
        sidecar
            .output()
            .await
            .map_err(
                |error| {
                    format!(
                        "Failed to run input monitor: {error}"
                    )
                },
            )?;

    if !output
        .status
        .success()
    {
        let stderr =
            String::from_utf8_lossy(
                &output.stderr,
            )
            .trim()
            .to_string();

        return Err(
            if stderr.is_empty() {
                "Input monitor exited with an error."
                    .to_string()
            } else {
                format!(
                    "Input monitor error: {stderr}"
                )
            },
        );
    }

    let stdout =
        String::from_utf8(
            output.stdout,
        )
        .map_err(
            |error| {
                format!(
                    "Input monitor returned invalid UTF-8: {error}"
                )
            },
        )?;

    serde_json::from_str::<
        InputLatencyResult,
    >(
        stdout.trim(),
    )
    .map_err(
        |error| {
            format!(
                "Failed to parse input monitor output: {error}"
            )
        },
    )
}

#[cfg_attr(
    mobile,
    tauri::mobile_entry_point
)]
pub fn run() {
    tauri::Builder::default()
        .plugin(
            tauri_plugin_fs::init(),
        )
        .plugin(
            tauri_plugin_opener::init(),
        )
        .plugin(
            tauri_plugin_shell::init(),
        )
        .invoke_handler(
            tauri::generate_handler![
                get_system_information,
                get_fortnite_status,
                measure_latency,
                get_match_state,
                get_hardware_temperatures,
                measure_input_latency
            ],
        )
        .run(
            tauri::generate_context!(),
        )
        .expect(
            "error while running tauri application",
        );
}