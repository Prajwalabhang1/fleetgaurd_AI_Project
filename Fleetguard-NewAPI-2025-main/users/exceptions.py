from rest_framework.views import exception_handler
from rest_framework_simplejwt.exceptions import InvalidToken
from rest_framework.exceptions import AuthenticationFailed, NotAuthenticated

def custom_exception_handler(exc, context):
    # Call the default exception handler first
    response = exception_handler(exc, context)

    # If the response is None, we can't modify it
    if response is not None:
        # Handle JWT errors
        if isinstance(exc, InvalidToken):
            response.data = {
                "message": "Authorization Failed. Please log in again.",
                "code": "token_not_valid"
            }
        # Handle NotAuthenticated errors
        elif isinstance(exc, NotAuthenticated):
            response.data = {"message": "Authentication credentials were not provided"}
        # Handle AuthenticationFailed errors
        elif isinstance(exc, AuthenticationFailed):
            error_message = exc.detail if isinstance(exc.detail, str) else exc.detail.get('message', str(exc.detail))
            response.data = {"message": error_message}
    return response