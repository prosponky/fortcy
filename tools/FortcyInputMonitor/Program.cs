using System.Runtime.InteropServices;
using System.Text.Json;

internal static class Program
{
    private const int CaptureDurationSeconds = 10;

    private const uint WmInput = 0x00FF;
    private const uint RidevInputSink = 0x00000100;

    private static readonly List<double> Samples = new();
    private static readonly object Sync = new();

    private static readonly WndProc WindowProcedureDelegate =
        WindowProcedure;

    private static void Main()
    {
        var collectorThread =
            new Thread(
                RunRawInputCollector
            )
            {
                IsBackground = true,
                Name = "Fortcy Raw Input Collector"
            };

        collectorThread.Start();

        Thread.Sleep(
            TimeSpan.FromSeconds(
                CaptureDurationSeconds
            )
        );

        double? averageLatencyMs = null;
        int sampleCount;

        lock (Sync)
        {
            sampleCount =
                Samples.Count;

            if (sampleCount > 0)
            {
                averageLatencyMs =
                    Samples.Average();
            }
        }

        var result = new
        {
            averageLatencyMs =
                averageLatencyMs.HasValue
                    ? Math.Round(
                        averageLatencyMs.Value,
                        2
                    )
                    : (double?)null,

            sampleCount,

            available =
                sampleCount > 0
        };

        Console.WriteLine(
            JsonSerializer.Serialize(
                result
            )
        );
    }

    private static void RunRawInputCollector()
    {
        var moduleHandle =
            GetModuleHandle(
                null
            );

        if (moduleHandle == IntPtr.Zero)
        {
            return;
        }

        const string ClassName =
            "FortcyInputMonitorWindow";

        var windowClass =
            new WndClass
            {
                lpfnWndProc =
                    Marshal
                        .GetFunctionPointerForDelegate(
                            WindowProcedureDelegate
                        ),

                hInstance =
                    moduleHandle,

                lpszClassName =
                    ClassName
            };

        var atom =
            RegisterClass(
                ref windowClass
            );

        if (atom == 0)
        {
            return;
        }

        var windowHandle =
            CreateWindowEx(
                0,
                ClassName,
                "Fortcy Input Monitor",
                0,
                0,
                0,
                0,
                0,
                IntPtr.Zero,
                IntPtr.Zero,
                moduleHandle,
                IntPtr.Zero
            );

        if (windowHandle == IntPtr.Zero)
        {
            return;
        }

        var devices =
            new[]
            {
                new RawInputDevice
                {
                    UsagePage = 0x01,
                    Usage = 0x02,
                    Flags = RidevInputSink,
                    Target = windowHandle
                },

                new RawInputDevice
                {
                    UsagePage = 0x01,
                    Usage = 0x06,
                    Flags = RidevInputSink,
                    Target = windowHandle
                }
            };

        var registered =
            RegisterRawInputDevices(
                devices,
                (uint)devices.Length,
                (uint)Marshal.SizeOf<
                    RawInputDevice
                >()
            );

        if (!registered)
        {
            return;
        }

        while (
            GetMessage(
                out var message,
                IntPtr.Zero,
                0,
                0
            ) > 0
        )
        {
            if (
                message.Message ==
                WmInput
            )
            {
                RecordLatencySample(
                    message.Time
                );
            }

            TranslateMessage(
                ref message
            );

            DispatchMessage(
                ref message
            );
        }
    }

    private static void RecordLatencySample(
        uint messageTime
    )
    {
        var nowMs =
            GetTickCount64();

        var nowLow32 =
            unchecked(
                (uint)nowMs
            );

        var latencyMs =
            unchecked(
                nowLow32 -
                messageTime
            );

        if (latencyMs > 100)
        {
            return;
        }

        lock (Sync)
        {
            Samples.Add(
                latencyMs
            );
        }
    }

    private static IntPtr WindowProcedure(
        IntPtr windowHandle,
        uint message,
        IntPtr wParam,
        IntPtr lParam
    )
    {
        return DefWindowProc(
            windowHandle,
            message,
            wParam,
            lParam
        );
    }

    [UnmanagedFunctionPointer(
        CallingConvention.Winapi
    )]
    private delegate IntPtr WndProc(
        IntPtr windowHandle,
        uint message,
        IntPtr wParam,
        IntPtr lParam
    );

    [StructLayout(
        LayoutKind.Sequential,
        CharSet = CharSet.Unicode
    )]
    private struct WndClass
    {
        public uint style;
        public IntPtr lpfnWndProc;
        public int cbClsExtra;
        public int cbWndExtra;
        public IntPtr hInstance;
        public IntPtr hIcon;
        public IntPtr hCursor;
        public IntPtr hbrBackground;
        public string? lpszMenuName;
        public string lpszClassName;
    }

    [StructLayout(
        LayoutKind.Sequential
    )]
    private struct RawInputDevice
    {
        public ushort UsagePage;
        public ushort Usage;
        public uint Flags;
        public IntPtr Target;
    }

    [StructLayout(
        LayoutKind.Sequential
    )]
    private struct NativeMessage
    {
        public IntPtr HWnd;
        public uint Message;
        public UIntPtr WParam;
        public IntPtr LParam;
        public uint Time;
        public Point Point;
        public uint Private;
    }

    [StructLayout(
        LayoutKind.Sequential
    )]
    private struct Point
    {
        public int X;
        public int Y;
    }

    [DllImport(
        "kernel32.dll",
        CharSet = CharSet.Unicode
    )]
    private static extern IntPtr GetModuleHandle(
        string? moduleName
    );

    [DllImport(
        "kernel32.dll"
    )]
    private static extern ulong GetTickCount64();

    [DllImport(
        "user32.dll",
        CharSet = CharSet.Unicode,
        SetLastError = true
    )]
    private static extern ushort RegisterClass(
        ref WndClass windowClass
    );

    [DllImport(
        "user32.dll",
        CharSet = CharSet.Unicode,
        SetLastError = true
    )]
    private static extern IntPtr CreateWindowEx(
        uint extendedStyle,
        string className,
        string windowName,
        uint style,
        int x,
        int y,
        int width,
        int height,
        IntPtr parent,
        IntPtr menu,
        IntPtr instance,
        IntPtr parameter
    );

    [DllImport(
        "user32.dll",
        SetLastError = true
    )]
    private static extern bool RegisterRawInputDevices(
        RawInputDevice[] devices,
        uint deviceCount,
        uint deviceSize
    );

    [DllImport(
        "user32.dll"
    )]
    private static extern int GetMessage(
        out NativeMessage message,
        IntPtr windowHandle,
        uint messageFilterMin,
        uint messageFilterMax
    );

    [DllImport(
        "user32.dll"
    )]
    private static extern bool TranslateMessage(
        ref NativeMessage message
    );

    [DllImport(
        "user32.dll"
    )]
    private static extern IntPtr DispatchMessage(
        ref NativeMessage message
    );

    [DllImport(
        "user32.dll"
    )]
    private static extern IntPtr DefWindowProc(
        IntPtr windowHandle,
        uint message,
        IntPtr wParam,
        IntPtr lParam
    );
}