using Microsoft.AspNetCore.Mvc;

namespace DVC.DocumentService.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UploadController : ControllerBase
{
    [HttpPost]
    public IActionResult Post() => Ok("Uploaded");
}
