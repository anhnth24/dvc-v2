using Microsoft.AspNetCore.Mvc;

namespace DVC.WorkflowService.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DesignerController : ControllerBase
{
    [HttpGet]
    public IActionResult Get() => Ok("Designer ok");
}
