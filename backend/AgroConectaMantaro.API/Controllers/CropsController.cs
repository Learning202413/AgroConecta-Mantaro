using Microsoft.AspNetCore.Mvc;

namespace AgroConectaMantaro.API.Controllers;

public record CropItemDto(
    int Id,
    string Name,
    string Category,
    string ScientificName,
    string TypicalUnit,
    decimal ReferencePriceKg
);

public record CropSearchResponseDto(
    int TotalCount,
    int Page,
    int PageSize,
    int TotalPages,
    List<CropItemDto> Items
);

public record CreateCropRequestDto(
    string Name,
    string Category,
    string ScientificName,
    string TypicalUnit,
    decimal ReferencePriceKg
);

[ApiController]
[Route("api/[controller]")]
public class CropsController : ControllerBase
{
    private static readonly List<CropItemDto> RegionalCatalog = new()
    {
        // 1. Tubérculos y Raíces Andinas
        new(1, "Papa Canchán", "Tubérculos y Raíces", "Solanum tuberosum", "Saco 50kg", 1.30m),
        new(2, "Papa Huayro", "Tubérculos y Raíces", "Solanum chaucha", "Saco 50kg", 1.85m),
        new(3, "Papa Amarilla Tumbay", "Tubérculos y Raíces", "Solanum goniocalyx", "Saco 45kg", 2.40m),
        new(4, "Papa Yungay", "Tubérculos y Raíces", "Solanum tuberosum", "Saco 50kg", 1.15m),
        new(5, "Papa Peruanita", "Tubérculos y Raíces", "Solanum tuberosum", "Saco 50kg", 2.20m),
        new(6, "Papa Huamantanga", "Tubérculos y Raíces", "Solanum tuberosum", "Saco 50kg", 2.10m),
        new(7, "Papa Única", "Tubérculos y Raíces", "Solanum tuberosum", "Saco 50kg", 1.25m),
        new(8, "Papa Perricholi", "Tubérculos y Raíces", "Solanum tuberosum", "Saco 50kg", 1.10m),
        new(9, "Papa Negra Andina", "Tubérculos y Raíces", "Solanum tuberosum", "Saco 50kg", 1.70m),
        new(10, "Olluco Amarillo de Concepción", "Tubérculos y Raíces", "Ullucus tuberosus", "Saco 40kg", 2.60m),
        new(11, "Olluco Rosado de Chupaca", "Tubérculos y Raíces", "Ullucus tuberosus", "Saco 40kg", 2.80m),
        new(12, "Mashua Amarilla", "Tubérculos y Raíces", "Tropaeolum tuberosum", "Saco 40kg", 1.80m),
        new(13, "Mashua Negra Medicinal", "Tubérculos y Raíces", "Tropaeolum tuberosum", "Saco 30kg", 3.20m),
        new(14, "Oca Blanca Dulce", "Tubérculos y Raíces", "Oxalis tuberosa", "Saco 40kg", 1.90m),
        new(15, "Oca Colorada Serrana", "Tubérculos y Raíces", "Oxalis tuberosa", "Saco 40kg", 2.05m),
        new(16, "Maca Amarilla de Junín", "Tubérculos y Raíces", "Lepidium meyenii", "Saco 25kg", 7.50m),
        new(17, "Maca Negra de Altura", "Tubérculos y Raíces", "Lepidium meyenii", "Saco 25kg", 11.00m),

        // 2. Hortalizas del Valle
        new(18, "Zanahoria Criolla", "Hortalizas", "Daucus carota", "Malla 60kg", 0.90m),
        new(19, "Cebolla Roja Arequipeña / Junín", "Hortalizas", "Allium cepa", "Malla 50kg", 1.45m),
        new(20, "Cebolla China de Huerta", "Hortalizas", "Allium fistulosum", "Atado 10kg", 1.20m),
        new(21, "Lechuga Crespa Hidropónica", "Hortalizas", "Lactuca sativa", "Caja 24 unid", 1.50m),
        new(22, "Lechuga Americana", "Hortalizas", "Lactuca sativa", "Caja 24 unid", 1.30m),
        new(23, "Apio Serrano", "Hortalizas", "Apium graveolens", "Docena", 1.60m),
        new(24, "Espinaca de Valle", "Hortalizas", "Spinacia oleracea", "Atado 15kg", 1.40m),
        new(25, "Acelga Verde", "Hortalizas", "Beta vulgaris", "Atado 15kg", 1.10m),
        new(26, "Betarraga Criolla", "Hortalizas", "Beta vulgaris", "Saco 40kg", 1.25m),
        new(27, "Alcachofa Criolla con Espina", "Hortalizas", "Cynara scolymus", "Jaba 20kg", 3.10m),
        new(28, "Alcachofa Imperial sin Espina", "Hortalizas", "Cynara scolymus", "Jaba 20kg", 3.80m),
        new(29, "Brócoli de Concepción", "Hortalizas", "Brassica oleracea", "Caja 15kg", 2.20m),
        new(30, "Coliflor Blanca", "Hortalizas", "Brassica oleracea", "Docena", 2.50m),
        new(31, "Poro de Huerta", "Hortalizas", "Allium ampeloprasum", "Docena", 1.80m),
        new(32, "Nabo Blanco", "Hortalizas", "Brassica rapa", "Malla 30kg", 1.00m),

        // 3. Leguminosas
        new(33, "Arveja Verde Criolla", "Leguminosas", "Pisum sativum", "Saco 50kg", 2.80m),
        new(34, "Arveja Usui Calidad Extra", "Leguminosas", "Pisum sativum", "Saco 50kg", 3.40m),
        new(35, "Haba Verde en Vaina (Chupaca)", "Leguminosas", "Vicia faba", "Saco 50kg", 1.60m),
        new(36, "Haba Seca Serrana", "Leguminosas", "Vicia faba", "Saco 50kg", 3.10m),
        new(37, "Frijol Canario Mantaro", "Leguminosas", "Phaseolus vulgaris", "Saco 50kg", 4.20m),
        new(38, "Tarwi / Chocho Desamargado", "Leguminosas", "Lupinus mutabilis", "Saco 40kg", 5.50m),
        new(39, "Pallar Serrano de Valle", "Leguminosas", "Phaseolus lunatus", "Saco 40kg", 4.80m),

        // 4. Granos y Cereales Andinos
        new(40, "Maíz Choclo Blanco Urubamba", "Granos y Cereales", "Zea mays", "Saco 100 espigas", 1.50m),
        new(41, "Maíz Morado Canteño / Junín", "Granos y Cereales", "Zea mays", "Saco 50kg", 2.90m),
        new(42, "Maíz Amarillo Duro", "Granos y Cereales", "Zea mays", "Saco 50kg", 1.35m),
        new(43, "Quinua Blanca Junín Seleccionada", "Granos y Cereales", "Chenopodium quinoa", "Saco 50kg", 6.80m),
        new(44, "Quinua Roja Pasankalla", "Granos y Cereales", "Chenopodium quinoa", "Saco 50kg", 7.90m),
        new(45, "Kiwicha / Amaranto Grano Oro", "Granos y Cereales", "Amaranthus caudatus", "Saco 40kg", 8.20m),
        new(46, "Cebada Grano Seleccionado", "Granos y Cereales", "Hordeum vulgare", "Saco 50kg", 1.60m),
        new(47, "Trigo Serrano para Harina", "Granos y Cereales", "Triticum aestivum", "Saco 50kg", 1.75m),

        // 5. Frutales y Hierbas del Valle
        new(48, "Aguaymanto Seleccionado", "Frutales y Hierbas", "Physalis peruviana", "Jaba 10kg", 5.20m),
        new(49, "Tumbo Serrano de Concepción", "Frutales y Hierbas", "Passiflora tarminiana", "Caja 15kg", 3.50m),
        new(50, "Capulí / Guinda del Mantaro", "Frutales y Hierbas", "Prunus serotina", "Caja 10kg", 4.00m),
        new(51, "Lúcuma de Sierra", "Frutales y Hierbas", "Pouteria lucuma", "Jaba 15kg", 4.60m),
        new(52, "Manzana Delicia Serrana", "Frutales y Hierbas", "Malus domestica", "Caja 18kg", 2.20m),
        new(53, "Tuna Blanca de Jauja", "Frutales y Hierbas", "Opuntia ficus-indica", "Caja 20kg", 2.70m),
        new(54, "Muña Serrana Aromática", "Frutales y Hierbas", "Minthostachys mollis", "Atado 5kg", 2.50m),
        new(55, "Huacatay Fresco", "Frutales y Hierbas", "Tagetes minuta", "Atado 5kg", 2.00m)
    };

    [HttpGet("categories")]
    public IActionResult GetCategories()
    {
        var categories = new List<string>
        {
            "Todos",
            "Tubérculos y Raíces",
            "Hortalizas",
            "Leguminosas",
            "Granos y Cereales",
            "Frutales y Hierbas"
        };
        return Ok(categories);
    }

    [HttpGet]
    public IActionResult Search(
        [FromQuery] string? category,
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 12)
    {
        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 12;
        if (pageSize > 50) pageSize = 50;

        var query = RegionalCatalog.AsQueryable();

        // 1. Filter by Category (Hierarchical Filter)
        if (!string.IsNullOrWhiteSpace(category) && !category.Equals("Todos", StringComparison.OrdinalIgnoreCase))
        {
            query = query.Where(c => c.Category.Equals(category, StringComparison.OrdinalIgnoreCase));
        }

        // 2. Filter by Search term (Typeahead filter)
        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim();
            query = query.Where(c => 
                c.Name.Contains(term, StringComparison.OrdinalIgnoreCase) ||
                c.ScientificName.Contains(term, StringComparison.OrdinalIgnoreCase)
            );
        }

        var totalCount = query.Count();
        var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

        var items = query
            .OrderBy(c => c.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToList();

        return Ok(new CropSearchResponseDto(
            totalCount,
            page,
            pageSize,
            totalPages,
            items
        ));
    }

    [HttpPost]
    public IActionResult CreateCrop([FromBody] CreateCropRequestDto request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            return BadRequest("El nombre del cultivo es obligatorio.");

        var newId = RegionalCatalog.Count > 0 ? RegionalCatalog.Max(c => c.Id) + 1 : 1;
        var newCrop = new CropItemDto(
            newId,
            request.Name.Trim(),
            string.IsNullOrWhiteSpace(request.Category) ? "Otros" : request.Category.Trim(),
            string.IsNullOrWhiteSpace(request.ScientificName) ? "Variedad Andina" : request.ScientificName.Trim(),
            string.IsNullOrWhiteSpace(request.TypicalUnit) ? "Saco 50kg" : request.TypicalUnit.Trim(),
            request.ReferencePriceKg > 0 ? request.ReferencePriceKg : 1.50m
        );

        RegionalCatalog.Add(newCrop);
        return Ok(newCrop);
    }
}
