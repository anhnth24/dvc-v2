using Microsoft.AspNetCore.Mvc;

namespace DVC.PostalService.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LabelController : ControllerBase
{
    [HttpGet]
    public IActionResult Get() => Ok("Label ok");
}
