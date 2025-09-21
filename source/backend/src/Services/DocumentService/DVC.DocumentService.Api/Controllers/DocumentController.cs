using Microsoft.AspNetCore.Mvc;

namespace DVC.DocumentService.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DocumentController : ControllerBase
{
    [HttpGet]
    public IActionResult Get() => Ok("Documents ok");
}
