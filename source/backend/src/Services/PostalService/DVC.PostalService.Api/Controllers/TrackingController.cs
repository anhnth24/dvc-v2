using Microsoft.AspNetCore.Mvc;

namespace DVC.PostalService.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TrackingController : ControllerBase
{
    [HttpGet]
    public IActionResult Get() => Ok("Tracking ok");
}
