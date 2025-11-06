from django.core.cache import cache
from django.http import JsonResponse
from django.utils import timezone
from datetime import timedelta

class RateLimitMiddleware:
    """
    Simple rate limiting middleware for login endpoints
    Limits to 5 attempts per minute per IP
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Only apply to login endpoint
        if request.path == '/api/auth/login/' and request.method == 'POST':
            ip = self.get_client_ip(request)
            cache_key = f'rate_limit_login_{ip}'
            
            attempts = cache.get(cache_key, 0)
            if attempts >= 5:
                return JsonResponse(
                    {'error': 'Too many login attempts. Please try again later.'},
                    status=429
                )
            
            # Increment attempts
            cache.set(cache_key, attempts + 1, 60)  # 60 seconds
        
        response = self.get_response(request)
        
        # Reset on successful login
        if request.path == '/api/auth/login/' and request.method == 'POST' and response.status_code == 200:
            ip = self.get_client_ip(request)
            cache_key = f'rate_limit_login_{ip}'
            cache.delete(cache_key)
        
        return response

    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip

