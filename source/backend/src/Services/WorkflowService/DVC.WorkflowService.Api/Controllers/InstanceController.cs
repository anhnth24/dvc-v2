using Microsoft.AspNetCore.Mvc;

namespace DVC.WorkflowService.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InstanceController : ControllerBase
{
    [HttpGet]
    public IActionResult Get() => Ok("Instances ok");
}
