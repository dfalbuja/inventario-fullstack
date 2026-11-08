namespace ProductService.Exceptions;

public sealed class BusinessRuleException(string message) : Exception(message);
