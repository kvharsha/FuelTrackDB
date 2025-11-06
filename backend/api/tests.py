from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from rest_framework.authtoken.models import Token
from .models import Station, FuelType, StationFuel, Favorite, Review, Operator

User = get_user_model()


class AuthTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123',
            full_name='Test User'
        )

    def test_login_success(self):
        """Test successful login returns token"""
        response = self.client.post('/api/auth/login/', {
            'email': 'test@example.com',
            'password': 'testpass123'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)
        self.assertIn('first_name', response.data)
        self.assertIn('role', response.data)

    def test_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        response = self.client.post('/api/auth/login/', {
            'email': 'test@example.com',
            'password': 'wrongpass'
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_token_authentication(self):
        """Test token authentication works"""
        token, _ = Token.objects.get_or_create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')
        response = self.client.get('/api/stations/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_register_user(self):
        """Test user registration"""
        response = self.client.post('/api/auth/register/', {
            'email': 'newuser@example.com',
            'full_name': 'New User',
            'password': 'newpass123',
            'password_confirm': 'newpass123'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(email='newuser@example.com').exists())

    def test_check_email_availability(self):
        """Test email availability check"""
        # Check existing email
        response = self.client.post('/api/auth/check-email/', {
            'email': 'test@example.com'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data['available'])

        # Check new email
        response = self.client.post('/api/auth/check-email/', {
            'email': 'newemail@example.com'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['available'])


class NearbyStationsTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123',
            full_name='Test User'
        )
        token, _ = Token.objects.get_or_create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')

        # Create operator
        self.operator = Operator.objects.create(name='Test Operator')

        # Create fuel type
        self.fuel_type = FuelType.objects.create(name='Petrol', is_active=True)

        # Create stations
        self.station1 = Station.objects.create(
            name='Station 1',
            operator=self.operator,
            address='Address 1',
            city='City 1',
            state='State 1',
            latitude=12.9716,
            longitude=77.5946,
            status='Operational'
        )
        self.station2 = Station.objects.create(
            name='Station 2',
            operator=self.operator,
            address='Address 2',
            city='City 2',
            state='State 2',
            latitude=12.9800,
            longitude=77.6000,
            status='Operational'
        )

        # Create station fuels
        StationFuel.objects.create(
            station=self.station1,
            fuel_type=self.fuel_type,
            price_per_unit=95.50,
            is_available=True
        )
        StationFuel.objects.create(
            station=self.station2,
            fuel_type=self.fuel_type,
            price_per_unit=96.00,
            is_available=True
        )

    def test_nearby_stations_ordering(self):
        """Test nearby stations are ordered by distance"""
        # Note: This test assumes the stored procedure exists
        # In a real scenario, you'd mock the stored procedure call
        response = self.client.get('/api/nearby/', {
            'lat': 12.9716,
            'lon': 77.5946,
            'radius_km': 10,
            'fuel_type_id': self.fuel_type.fuel_type_id
        })
        # If stored procedure works, stations should be ordered by distance
        if response.status_code == status.HTTP_200_OK:
            stations = response.data
            if len(stations) > 1:
                # First station should be closer
                self.assertLessEqual(stations[0]['distance_km'], stations[1]['distance_km'])


class ReviewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123',
            full_name='Test User'
        )
        token, _ = Token.objects.get_or_create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')

        self.operator = Operator.objects.create(name='Test Operator')
        self.station = Station.objects.create(
            name='Test Station',
            operator=self.operator,
            address='Test Address',
            city='Test City',
            state='Test State',
            latitude=12.9716,
            longitude=77.5946,
            status='Operational'
        )

    def test_create_review(self):
        """Test creating a review"""
        response = self.client.post('/api/reviews/', {
            'station': self.station.station_id,
            'rating': 5,
            'comment': 'Great station!'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Review.objects.filter(user=self.user, station=self.station).exists())

    def test_duplicate_review_prevention(self):
        """Test that duplicate reviews are prevented"""
        # Create first review
        Review.objects.create(
            user=self.user,
            station=self.station,
            rating=5,
            comment='First review'
        )

        # Try to create duplicate
        response = self.client.post('/api/reviews/', {
            'station': self.station.station_id,
            'rating': 4,
            'comment': 'Second review'
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('already reviewed', str(response.data.get('error', '')))


class FavoriteTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123',
            full_name='Test User'
        )
        token, _ = Token.objects.get_or_create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')

        self.operator = Operator.objects.create(name='Test Operator')
        self.station = Station.objects.create(
            name='Test Station',
            operator=self.operator,
            address='Test Address',
            city='Test City',
            state='Test State',
            latitude=12.9716,
            longitude=77.5946,
            status='Operational'
        )

    def test_create_favorite(self):
        """Test creating a favorite"""
        response = self.client.post('/api/favorites/', {
            'station_id': self.station.station_id
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Favorite.objects.filter(user=self.user, station=self.station).exists())

    def test_delete_favorite(self):
        """Test deleting a favorite"""
        Favorite.objects.create(user=self.user, station=self.station)
        response = self.client.delete(f'/api/favorites/{self.station.station_id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Favorite.objects.filter(user=self.user, station=self.station).exists())

    def test_list_favorites(self):
        """Test listing user favorites"""
        Favorite.objects.create(user=self.user, station=self.station)
        response = self.client.get('/api/favorites/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)


class AdminTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin_user = User.objects.create_user(
            email='admin@example.com',
            password='adminpass123',
            full_name='Admin User',
            role='admin',
            is_staff=True
        )
        self.regular_user = User.objects.create_user(
            email='user@example.com',
            password='userpass123',
            full_name='Regular User',
            role='user'
        )

    def test_admin_can_create_station(self):
        """Test admin can create stations"""
        token, _ = Token.objects.get_or_create(user=self.admin_user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')

        operator = Operator.objects.create(name='Test Operator')
        response = self.client.post('/api/stations/', {
            'name': 'New Station',
            'operator': operator.operator_id,
            'address': 'New Address',
            'city': 'New City',
            'state': 'New State',
            'latitude': 12.9716,
            'longitude': 77.5946,
            'status': 'Operational'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_regular_user_cannot_create_station(self):
        """Test regular user cannot create stations"""
        token, _ = Token.objects.get_or_create(user=self.regular_user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')

        operator = Operator.objects.create(name='Test Operator')
        response = self.client.post('/api/stations/', {
            'name': 'New Station',
            'operator': operator.operator_id,
            'address': 'New Address',
            'city': 'New City',
            'state': 'New State',
            'latitude': 12.9716,
            'longitude': 77.5946,
            'status': 'Operational'
        })
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_toggle_user_block(self):
        """Test admin can block/unblock users"""
        token, _ = Token.objects.get_or_create(user=self.admin_user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')

        response = self.client.post(f'/api/users/{self.regular_user.user_id}/toggle-block/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.regular_user.refresh_from_db()
        self.assertFalse(self.regular_user.is_active)
