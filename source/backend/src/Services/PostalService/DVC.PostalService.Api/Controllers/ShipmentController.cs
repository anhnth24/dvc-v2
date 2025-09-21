using Microsoft.AspNetCore.Mvc;

namespace DVC.PostalService.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ShipmentController : ControllerBase
{
    [HttpGet]
    public IActionResult Get() => Ok("Shipments ok");
}
