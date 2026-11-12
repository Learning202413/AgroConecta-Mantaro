using System;
using System.Collections.Generic;

namespace MantaroFrostAlert.Application.DTOs;

public class CorridorZoneDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Station { get; set; } = string.Empty;
    public string Ubigeo { get; set; } = string.Empty;
    public string Province { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public int ElevationM { get; set; }
    public bool IsReferenceStation { get; set; }
    public string Description { get; set; } = string.Empty;
}

public class ExcludedZoneDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string AltitudeRange { get; set; } = string.Empty;
    public string Reason { get; set; } = string.Empty;
}

public class ZonesBoundaryResponseDto
{
    public string Region { get; set; } = "Junin - Mantaro Valley";
    public int[] AltitudeRangeM { get; set; } = new[] { 3150, 3450 };
    public string ReferenceStation { get; set; } = "IGP Observatorio de Huayao (UBIGEO 120904, 3,314 msnm)";
    public IReadOnlyList<CorridorZoneDto> CorridorZones { get; set; } = Array.Empty<CorridorZoneDto>();
    public IReadOnlyList<ExcludedZoneDto> ExcludedZones { get; set; } = Array.Empty<ExcludedZoneDto>();
}
