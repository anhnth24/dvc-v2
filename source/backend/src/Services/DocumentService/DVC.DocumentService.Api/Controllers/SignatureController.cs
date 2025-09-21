using Microsoft.AspNetCore.Mvc;

namespace DVC.DocumentService.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SignatureController : ControllerBase
{
    [HttpPost("sign")]
    public IActionResult Sign() => Ok("Signed");
}
