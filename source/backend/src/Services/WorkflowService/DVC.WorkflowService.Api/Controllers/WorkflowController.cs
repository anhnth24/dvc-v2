using Microsoft.AspNetCore.Mvc;

namespace DVC.WorkflowService.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class WorkflowController : ControllerBase
{
    [HttpGet]
    public IActionResult Get() => Ok("Workflow ok");
}
