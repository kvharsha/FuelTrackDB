from django.shortcuts import render, get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework.decorators import action
from .models import FuelType, Station, StationFuel, Favorite, Review, OfflinePackage
from .serializers import (
    FuelTypeSerializer, StationSerializer, StationFuelSerializer,
    FavoriteSerializer, ReviewSerializer, OfflinePackageSerializer,
    UserRegisterSerializer, UserLoginSerializer
)
from rest_framework import status
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate, get_user_model
from django.db import connection
from django.db.models import Q, Avg

class TestView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request, *args, **kwargs):
        # Send a simple JSON response
        return Response({"message": "Hello from the Django Backend!"})
    
    def head(self, request, *args, **kwargs):
        # For latency testing
        return Response(status=status.HTTP_200_OK)

class HealthCheckView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        from django.db import connection
        db_status = False
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
                db_status = True
        except Exception:
            pass
        
        return Response({
            "status": "ok",
            "db": db_status
        })

# ViewSet for the 'FuelType' resource
class FuelTypeViewSet(viewsets.ModelViewSet):
    queryset = FuelType.objects.all()
    serializer_class = FuelTypeSerializer
    permission_classes = [IsAuthenticated]
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        return [IsAdminUser()]
    
# ViewSet for the 'Station' resource
class StationViewSet(viewsets.ModelViewSet):
    queryset = Station.objects.all()
    serializer_class = StationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        return [IsAdminUser()]

# ViewSet for StationFuel
class StationFuelViewSet(viewsets.ModelViewSet):
    queryset = StationFuel.objects.all()
    serializer_class = StationFuelSerializer
    permission_classes = [IsAuthenticated]
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        return [IsAdminUser()]

class RegisterView(APIView):
    permission_classes = ()
    authentication_classes = ()

    def post(self, request):
        serializer = UserRegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "User registered successfully. Please log in."}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    permission_classes = ()
    authentication_classes = ()

    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email'] # 🛑 Use email
            password = serializer.validated_data['password']
            
            # Authenticate using the configured USERNAME_FIELD (email for our custom user)
            UserModel = get_user_model()
            credentials = {UserModel.USERNAME_FIELD: email, 'password': password}
            user = authenticate(request, **credentials)

            if user:
                Token.objects.filter(user=user).delete() 
                token, created = Token.objects.get_or_create(user=user)
                
                # Check the role field from your custom model
                is_admin = user.role == 'admin' 

                return Response({
                    "token": token.key,
                    "email": user.email,
                    #  Use full_name for the welcome toast
                    "first_name": user.full_name.split(' ')[0], 
                    "role": user.role # Return the actual role
                })
            return Response({"error": "Invalid Credentials"}, status=status.HTTP_401_UNAUTHORIZED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CheckEmailAvailability(APIView):
    permission_classes = ()
    authentication_classes = ()
    
    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({"message": "Email required"}, status=status.HTTP_400_BAD_REQUEST)

        User = get_user_model()
        is_available = not User.objects.filter(email=email).exists()
        return Response({"available": is_available, "message": "Email is available." if is_available else "Email is taken."})


class CheckUsernameAvailability(APIView):
    permission_classes = ()
    authentication_classes = ()

    def post(self, request):
        username = request.data.get('username')
        if not username:
            return Response({"message": "Username required"}, status=status.HTTP_400_BAD_REQUEST)

        User = get_user_model()
        # Heuristic availability check: username unavailable if it matches any full_name or the local-part of any email
        exists_fullname = User.objects.filter(full_name__iexact=username).exists()
        exists_email_local = User.objects.filter(email__istartswith=(username + '@')).exists()
        is_available = not (exists_fullname or exists_email_local)
        return Response({"available": is_available, "message": "Username available." if is_available else "Username taken."})

# Admin views for user management
class UserListView(APIView):
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        User = get_user_model()
        search = request.query_params.get('search', '')
        queryset = User.objects.all()
        
        if search:
            queryset = queryset.filter(
                Q(email__icontains=search) |
                Q(full_name__icontains=search)
            )
        
        users = []
        for user in queryset:
            users.append({
                'user_id': user.user_id,
                'email': user.email,
                'full_name': user.full_name,
                'role': user.role,
                'is_active': user.is_active,
                'phone': user.phone,
            })
        
        return Response(users)

class UserBlockToggleView(APIView):
    permission_classes = [IsAdminUser]
    
    def post(self, request, user_id):
        User = get_user_model()
        user = get_object_or_404(User, user_id=user_id)
        user.is_active = not user.is_active
        user.save()
        return Response({
            'user_id': user.user_id,
            'is_active': user.is_active,
            'message': 'User blocked' if not user.is_active else 'User unblocked'
        })

# Favorites views
class FavoriteListCreateView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        favorites = Favorite.objects.filter(user=request.user)
        serializer = FavoriteSerializer(favorites, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        station_id = request.data.get('station_id')
        if not station_id:
            return Response({"error": "station_id required"}, status=status.HTTP_400_BAD_REQUEST)
        
        station = get_object_or_404(Station, station_id=station_id)
        favorite, created = Favorite.objects.get_or_create(
            user=request.user,
            station=station
        )
        
        if created:
            serializer = FavoriteSerializer(favorite)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response({"message": "Already favorited"}, status=status.HTTP_200_OK)

class FavoriteDeleteView(APIView):
    permission_classes = [IsAuthenticated]
    
    def delete(self, request, station_id):
        favorite = get_object_or_404(
            Favorite,
            user=request.user,
            station_id=station_id
        )
        favorite.delete()
        return Response({"message": "Favorite removed"}, status=status.HTTP_204_NO_CONTENT)

# Reviews views
class ReviewListCreateView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        station_id = request.query_params.get('station_id')
        if station_id:
            reviews = Review.objects.filter(station_id=station_id)
        else:
            reviews = Review.objects.all()
        
        serializer = ReviewSerializer(reviews, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        serializer = ReviewSerializer(data=request.data)
        if serializer.is_valid():
            # Check if user already reviewed this station
            station_id = serializer.validated_data['station'].station_id
            existing = Review.objects.filter(
                user=request.user,
                station_id=station_id
            ).exists()
            
            if existing:
                return Response(
                    {"error": "You have already reviewed this station"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Offline packages views
class OfflinePackageListCreateView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        packages = OfflinePackage.objects.filter(user=request.user)
        serializer = OfflinePackageSerializer(packages, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        serializer = OfflinePackageSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class OfflinePackageDeleteView(APIView):
    permission_classes = [IsAuthenticated]
    
    def delete(self, request, package_id):
        package = get_object_or_404(
            OfflinePackage,
            package_id=package_id,
            user=request.user
        )
        package.delete()
        return Response({"message": "Package deleted"}, status=status.HTTP_204_NO_CONTENT)

# Nearby stations view (calls stored procedure)
class NearbyStationsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        lat = request.query_params.get('lat')
        lon = request.query_params.get('lon')
        radius_km = request.query_params.get('radius_km', 10)
        fuel_type_id = request.query_params.get('fuel_type_id')
        
        if not lat or not lon:
            return Response(
                {"error": "lat and lon query parameters required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not fuel_type_id:
            return Response(
                {"error": "fuel_type_id query parameter required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            lat = float(lat)
            lon = float(lon)
            radius_km = float(radius_km)
            fuel_type_id = int(fuel_type_id)
        except ValueError:
            return Response(
                {"error": "Invalid parameter types"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Call stored procedure
        with connection.cursor() as cursor:
            cursor.callproc('sp_find_nearby_stations', [lat, lon, radius_km, fuel_type_id])
            results = cursor.fetchall()
            
            # Get column names
            columns = [col[0] for col in cursor.description]
            
            # Convert to list of dicts
            stations = []
            for row in results:
                station_dict = dict(zip(columns, row))
                # Convert Decimal to float for JSON serialization
                for key, value in station_dict.items():
                    if hasattr(value, '__float__'):
                        station_dict[key] = float(value)
                stations.append(station_dict)
        
        return Response(stations)