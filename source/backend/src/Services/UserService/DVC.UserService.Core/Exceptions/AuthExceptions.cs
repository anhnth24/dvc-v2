namespace DVC.UserService.Core.Exceptions;

public class AuthenticationException : Exception
{
    public AuthenticationException(string message) : base(message) {}
}

public class AuthorizationException : Exception
{
    public AuthorizationException(string message) : base(message) {}
}
