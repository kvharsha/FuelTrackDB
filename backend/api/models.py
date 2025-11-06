# from django.db import models

# # Corresponds to the 'fuel_types' table
# class FuelType(models.Model):
#     # 💡 FIX: Explicitly define the primary key to match the database column name
#     fuel_type_id = models.IntegerField(primary_key=True) 
    
#     name = models.CharField(max_length=50, unique=True)
#     unit = models.CharField(max_length=20, default='Litre') # e.g., Litre, kWh, KG
    
#     class Meta:
#         db_table = 'fuel_types'
#         verbose_name = 'Fuel Type'

#     def __str__(self):
#         return self.name

# # Corresponds to the 'stations' table
# class Station(models.Model):
#     # 💡 FIX: Explicitly define the primary key to match the database column name
#     station_id = models.IntegerField(primary_key=True)
    
#     name = models.CharField(max_length=200)
#     address = models.CharField(max_length=255)
#     city = models.CharField(max_length=100)
#     latitude = models.DecimalField(max_digits=10, decimal_places=6, null=True, blank=True)
#     longitude = models.DecimalField(max_digits=10, decimal_places=6, null=True, blank=True)
#     status = models.CharField(
#         max_length=20,
#         choices=[('Operational', 'Operational'), ('Closed', 'Closed'), ('Under Maintenance', 'Under Maintenance')],
#         default='Operational'
#     )

#     class Meta:
#         db_table = 'stations'
#         verbose_name = 'Fuel Station'

#     def __str__(self):
#         return f"{self.name} ({self.city})"

from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.utils import timezone
import hashlib

# ============================================================
# Custom User Manager and Model (Maps to 'users' table)
# ============================================================

class CustomUserManager(BaseUserManager):
    """Custom user manager to handle creating users and superusers using email."""
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('role', 'admin') # Set role based on SQL enum

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
            
        return self.create_user(email, password, **extra_fields)

class CustomUser(AbstractBaseUser, PermissionsMixin):
    """
    Custom User Model mapping to the `users` table:
    user_id (PK), full_name, email (UNIQUE), password_hash, phone, role
    """
    # Maps to user_id (PK)
    user_id = models.AutoField(primary_key=True) 
    
    # Maps to full_name
    full_name = models.CharField(max_length=200)
    
    # Maps to email (used as USERNAME_FIELD)
    email = models.EmailField(unique=True) 
    
    # Maps to phone
    phone = models.CharField(max_length=30, null=True, blank=True)
    
    # Maps to role ENUM
    ROLE_CHOICES = [
        ('user', 'User'),
        ('admin', 'Admin'),
    ]
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='user')
    
    # Django required fields
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    # Map existing SQL `created_at` column to Django's `date_joined` field.
    # This avoids adding a new column and preserves the original creation timestamp.
    date_joined = models.DateTimeField(default=timezone.now, db_column='created_at')
    
    # Set the fields used for authentication
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['full_name'] 
    
    objects = CustomUserManager()

    # The existing SQL uses `password_hash` column with SHA2 values.
    # Map Django's expected `password` field to that column so reads/writes
    # use the existing column. Use a larger max_length to allow Django's
    # password hash format when we migrate users to Django's hasher.
    password = models.CharField(max_length=255, db_column='password_hash')

    def check_password(self, raw_password: str) -> bool:
        """
        Support legacy SHA-256 hashed passwords stored in `password_hash`.
        If the stored value looks like a plain SHA-256 hex digest (64 hex chars),
        verify against that. On successful legacy verification, migrate the
        password to Django's preferred hasher by calling set_password and saving.
        Otherwise, fall back to Django's default check_password implementation.
        """
        stored = (self.password or "").strip()
        # quick detection: legacy SHA256 hex is 64 hex chars and contains only [0-9a-f]
        if stored and len(stored) == 64:
            try:
                int(stored, 16)
                # it's hex; compute sha256 of raw_password and compare
                hashed = hashlib.sha256(raw_password.encode('utf-8')).hexdigest()
                if hashed == stored:
                    # migrate to Django hasher
                    self.set_password(raw_password)
                    # save only the password field to avoid touching other columns
                    self.save(update_fields=['password'])
                    return True
            except ValueError:
                # not hex, fall through to default check
                pass

        # fallback to normal Django password check (supports PBKDF2, bcrypt, etc.)
        return super().check_password(raw_password)

    class Meta:
        # 🛑 IMPORTANT: Map to your existing SQL table name
        db_table = 'users' 
        verbose_name = 'User'
        verbose_name_plural = 'Users'

# ============================================================
# Other Models (Mapping to SQL tables)
# ============================================================

class Operator(models.Model):
    # Maps to operator_id (PK)
    operator_id = models.AutoField(primary_key=True) 
    name = models.CharField(max_length=200)
    # ... other fields ...

    class Meta:
        db_table = 'operators'

class FuelType(models.Model):
    # Maps to fuel_type_id (PK)
    fuel_type_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=50, unique=True)
    description = models.CharField(max_length=255, null=True, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'fuel_types'
        verbose_name = 'Fuel Type'
        verbose_name_plural = 'Fuel Types'

    def __str__(self):
        return self.name

class Station(models.Model):
    # Maps to station_id (PK)
    station_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=200)
    operator = models.ForeignKey(Operator, on_delete=models.RESTRICT, db_column='operator_id')
    address = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    pincode = models.CharField(max_length=20, null=True, blank=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    STATUS_CHOICES = [
        ('Operational', 'Operational'),
        ('Under Construction', 'Under Construction'),
        ('Closed', 'Closed'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Operational')

    class Meta:
        db_table = 'stations'
        verbose_name = 'Fuel Station'
        verbose_name_plural = 'Fuel Stations'

    def __str__(self):
        return f"{self.name} ({self.city})"

class StationFuel(models.Model):
    """Junction table: station <-> fuel_type with price and availability"""
    station = models.ForeignKey(Station, on_delete=models.CASCADE, db_column='station_id')
    fuel_type = models.ForeignKey(FuelType, on_delete=models.CASCADE, db_column='fuel_type_id')
    price_per_unit = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    is_available = models.BooleanField(default=True)
    last_price_update = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'station_fuels'
        unique_together = [['station', 'fuel_type']]
        verbose_name = 'Station Fuel'
        verbose_name_plural = 'Station Fuels'

    def __str__(self):
        return f"{self.station.name} - {self.fuel_type.name}"

class Favorite(models.Model):
    """User bookmarks for stations"""
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, db_column='user_id')
    station = models.ForeignKey(Station, on_delete=models.CASCADE, db_column='station_id')
    created_at = models.DateTimeField(auto_now_add=True, db_column='added_at')

    class Meta:
        db_table = 'favorites'
        unique_together = [['user', 'station']]
        verbose_name = 'Favorite'
        verbose_name_plural = 'Favorites'

    def __str__(self):
        return f"{self.user.email} - {self.station.name}"

class Review(models.Model):
    """User reviews for stations (one per user per station)"""
    review_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, db_column='user_id')
    station = models.ForeignKey(Station, on_delete=models.CASCADE, db_column='station_id')
    rating = models.PositiveSmallIntegerField()  # 1-5
    comment = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'reviews'
        unique_together = [['user', 'station']]  # DB trigger also enforces this
        verbose_name = 'Review'
        verbose_name_plural = 'Reviews'

    def __str__(self):
        return f"{self.user.email} - {self.station.name} ({self.rating}/5)"

class OfflinePackage(models.Model):
    """User-created bounding boxes for offline map downloads"""
    package_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, db_column='user_id')
    name = models.CharField(max_length=150, db_column='package_name')
    min_lat = models.DecimalField(max_digits=9, decimal_places=6, db_column='lat_min')
    max_lat = models.DecimalField(max_digits=9, decimal_places=6, db_column='lat_max')
    min_lon = models.DecimalField(max_digits=9, decimal_places=6, db_column='lon_min')
    max_lon = models.DecimalField(max_digits=9, decimal_places=6, db_column='lon_max')
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateField(null=True, blank=True)
    size_bytes = models.IntegerField(null=True, blank=True)

    class Meta:
        db_table = 'offline_packages'
        verbose_name = 'Offline Package'
        verbose_name_plural = 'Offline Packages'

    def __str__(self):
        return f"{self.user.email} - {self.name}"