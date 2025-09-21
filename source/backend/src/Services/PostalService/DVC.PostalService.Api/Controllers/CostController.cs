using Microsoft.AspNetCore.Mvc;

namespace DVC.PostalService.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CostController : ControllerBase
{
    [HttpGet]
    public IActionResult Get() => Ok("Cost ok");
}
