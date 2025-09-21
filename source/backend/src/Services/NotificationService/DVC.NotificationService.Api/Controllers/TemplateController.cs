using Microsoft.AspNetCore.Mvc;

namespace DVC.NotificationService.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TemplateController : ControllerBase
{
    [HttpGet]
    public IActionResult Get() => Ok("Templates ok");
}
