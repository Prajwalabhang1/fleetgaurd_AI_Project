from django.http import HttpResponseNotAllowed

class BlockOptionsMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.method == 'OPTIONS':
            return HttpResponseNotAllowed(['GET', 'POST', 'PUT', 'DELETE'])
        return self.get_response(request)
