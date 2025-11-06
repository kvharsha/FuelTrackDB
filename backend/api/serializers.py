from rest_framework import serializers
from .models import FuelType, Station, StationFuel, Favorite, Review, OfflinePackage
from django.contrib.auth import get_user_model

class FuelTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = FuelType
        fields = '__all__'

class StationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Station
        fields = '__all__'

class StationFuelSerializer(serializers.ModelSerializer):
    station_name = serializers.CharField(source='station.name', read_only=True)
    fuel_type_name = serializers.CharField(source='fuel_type.name', read_only=True)
    
    class Meta:
        model = StationFuel
        fields = '__all__'

class FavoriteSerializer(serializers.ModelSerializer):
    station_name = serializers.CharField(source='station.name', read_only=True)
    station_address = serializers.CharField(source='station.address', read_only=True)
    station_latitude = serializers.DecimalField(source='station.latitude', max_digits=9, decimal_places=6, read_only=True)
    station_longitude = serializers.DecimalField(source='station.longitude', max_digits=9, decimal_places=6, read_only=True)
    
    class Meta:
        model = Favorite
        fields = '__all__'

class ReviewSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source='user.email', read_only=True)
    station_name = serializers.CharField(source='station.name', read_only=True)
    
    class Meta:
        model = Review
        fields = '__all__'
        read_only_fields = ('user', 'created_at')

class OfflinePackageSerializer(serializers.ModelSerializer):
    class Meta:
        model = OfflinePackage
        fields = '__all__'
        read_only_fields = ('user', 'created_at')

User = get_user_model()


class UserRegisterSerializer(serializers.ModelSerializer):
    """Handles user registration using email as the username field.
    Exposes password_confirm for simple client-side matching.
    """
    password_confirm = serializers.CharField(style={'input_type': 'password'}, write_only=True)
    # Optional frontend-only fields (declared explicitly so DRF doesn't try to map them to model fields)
    username = serializers.CharField(write_only=True, required=False, allow_blank=True)
    gender = serializers.CharField(write_only=True, required=False, allow_blank=True)
    age = serializers.IntegerField(write_only=True, required=False)
    exact_home_address = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        # Include model fields and explicitly-declared frontend-only fields so
        # ModelSerializer composes both without trying to auto-map unknown names.
        fields = ('email', 'full_name', 'password', 'password_confirm', 'phone', 'username', 'gender', 'age', 'exact_home_address')
        extra_kwargs = {'password': {'write_only': True}}

    def validate(self, data):
        if data.get('password') != data.get('password_confirm'):
            raise serializers.ValidationError("Passwords do not match.")

        # Check if email is already taken
        if User.objects.filter(email=data.get('email')).exists():
            raise serializers.ValidationError("Email is already taken.")

        return data

    def create(self, validated_data):
        # Remove confirm field and any extras that are not fields on the model
        validated_data.pop('password_confirm', None)

        # Pop known model fields
        email = validated_data.pop('email')
        password = validated_data.pop('password')
        full_name = validated_data.pop('full_name', '')
        phone = validated_data.pop('phone', None)

        # Remove optional frontend-only fields to avoid errors
        validated_data.pop('username', None)
        validated_data.pop('gender', None)
        validated_data.pop('age', None)
        validated_data.pop('exact_home_address', None)

        # Use the custom manager to create the user
        user = User.objects.create_user(email=email, password=password, full_name=full_name, phone=phone)
        return user

class UserLoginSerializer(serializers.Serializer):
    """Handles user login via email and password."""
    email = serializers.CharField()
    password = serializers.CharField(style={'input_type': 'password'}, write_only=True)

    def validate(self, data):
        # Basic presence validation; authentication happens in the view
        if not data.get('email') or not data.get('password'):
            raise serializers.ValidationError('Email and password are required.')
        return data