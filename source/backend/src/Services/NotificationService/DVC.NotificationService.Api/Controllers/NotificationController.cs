using Microsoft.AspNetCore.Mvc;

namespace DVC.NotificationService.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class NotificationController : ControllerBase
{
    [HttpGet]
    public IActionResult Get() => Ok("Notifications ok");
}
