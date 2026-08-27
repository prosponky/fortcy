using System.Text.Json;
using LibreHardwareMonitor.Hardware;
using LibreHardwareMonitor.PawnIo;

var computer = new Computer
{
    IsCpuEnabled = true,
    IsGpuEnabled = true
};

computer.Open();

try
{
    var cpuReading =
        FindBestCpuTemperature(
            computer.Hardware
        );

    var gpuReading =
        FindBestGpuTemperature(
            computer.Hardware
        );

    var result = new
    {
        cpuTemperatureC =
            cpuReading.Value,

        gpuTemperatureC =
            gpuReading.Value,

        cpuAvailable =
            cpuReading.Value.HasValue,

        gpuAvailable =
            gpuReading.Value.HasValue,

        cpuSource =
            cpuReading.Source,

        gpuSource =
            gpuReading.Source,

        pawnIoInstalled =
            PawnIo.IsInstalled,

        pawnIoVersion =
            PawnIo.Version?.ToString()
    };

    Console.WriteLine(
        JsonSerializer.Serialize(
            result
        )
    );
}
finally
{
    computer.Close();
}

static TemperatureReading
    FindBestCpuTemperature(
        IEnumerable<IHardware> hardwareItems
    )
{
    foreach (var hardware in hardwareItems)
    {
        if (
            hardware.HardwareType !=
            HardwareType.Cpu
        )
        {
            continue;
        }

        hardware.Update();

        var reading =
            FindTemperature(
                hardware,
                new[]
                {
                    "CPU Package",
                    "Tctl/Tdie",
                    "Core Average",
                    "Core Max",
                    "CPU Die",
                    "CCD Average"
                },
                "LibreHardwareMonitor"
            );

        if (reading.Value.HasValue)
        {
            return reading;
        }

        foreach (
            var subHardware
            in hardware.SubHardware
        )
        {
            subHardware.Update();

            reading =
                FindTemperature(
                    subHardware,
                    new[]
                    {
                        "CPU Package",
                        "Tctl/Tdie",
                        "Core Average",
                        "Core Max",
                        "CPU Die",
                        "CCD Average"
                    },
                    "LibreHardwareMonitor"
                );

            if (reading.Value.HasValue)
            {
                return reading;
            }
        }
    }

    return new TemperatureReading(
        null,
        "Unavailable"
    );
}

static TemperatureReading
    FindBestGpuTemperature(
        IEnumerable<IHardware> hardwareItems
    )
{
    TemperatureReading? fallback =
        null;

    foreach (var hardware in hardwareItems)
    {
        if (
            hardware.HardwareType !=
                HardwareType.GpuNvidia &&
            hardware.HardwareType !=
                HardwareType.GpuAmd &&
            hardware.HardwareType !=
                HardwareType.GpuIntel
        )
        {
            continue;
        }

        hardware.Update();

        var reading =
            FindTemperature(
                hardware,
                new[]
                {
                    "GPU Core",
                    "GPU Temperature",
                    "GPU Package"
                },
                "LibreHardwareMonitor"
            );

        if (!reading.Value.HasValue)
        {
            foreach (
                var subHardware
                in hardware.SubHardware
            )
            {
                subHardware.Update();

                reading =
                    FindTemperature(
                        subHardware,
                        new[]
                        {
                            "GPU Core",
                            "GPU Temperature",
                            "GPU Package"
                        },
                        "LibreHardwareMonitor"
                    );

                if (reading.Value.HasValue)
                {
                    break;
                }
            }
        }

        if (!reading.Value.HasValue)
        {
            continue;
        }

        if (
            hardware.HardwareType ==
                HardwareType.GpuNvidia ||
            hardware.HardwareType ==
                HardwareType.GpuAmd
        )
        {
            return reading;
        }

        fallback ??= reading;
    }

    return fallback ??
        new TemperatureReading(
            null,
            "Unavailable"
        );
}

static TemperatureReading
    FindTemperature(
        IHardware hardware,
        string[] preferredNames,
        string source
    )
{
    var temperatureSensors =
        hardware.Sensors
            .Where(
                sensor =>
                    sensor.SensorType ==
                        SensorType.Temperature &&
                    sensor.Value.HasValue
            )
            .ToList();

    foreach (
        var preferredName
        in preferredNames
    )
    {
        var sensor =
            temperatureSensors
                .FirstOrDefault(
                    item =>
                        string.Equals(
                            item.Name,
                            preferredName,
                            StringComparison
                                .OrdinalIgnoreCase
                        )
                );

        if (
            sensor?.Value
            is float value
        )
        {
            return new TemperatureReading(
                value,
                source
            );
        }
    }

    var fallbackSensor =
        temperatureSensors
            .FirstOrDefault();

    if (
        fallbackSensor?.Value
        is float fallbackValue
    )
    {
        return new TemperatureReading(
            fallbackValue,
            source
        );
    }

    return new TemperatureReading(
        null,
        "Unavailable"
    );
}

readonly record struct
    TemperatureReading(
        float? Value,
        string Source
    );