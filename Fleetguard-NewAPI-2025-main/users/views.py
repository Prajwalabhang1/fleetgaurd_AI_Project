import re
from django.shortcuts import render
from django.utils.decorators import method_decorator
from rest_framework.exceptions import AuthenticationFailed, ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.permissions import IsAdminUser

from rest_framework.throttling import UserRateThrottle
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta
from .serializers import UserSerializer
from .models import User, PasswordHistory
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.exceptions import NotFound
import jwt, random
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.hashers import check_password
from django.utils.timezone import now
from rest_framework.exceptions import AuthenticationFailed
import logging
from django.http import HttpResponse
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.token_blacklist.models import OutstandingToken, BlacklistedToken
from django.core.mail import send_mail
from django.core.exceptions import PermissionDenied
from django.contrib.auth.hashers import make_password
from django.core.exceptions import ValidationError
from rest_framework.permissions import BasePermission, AllowAny

def send_password_expiry_reminder():
    warning_period = timedelta(days=3)
    expiry_period = timedelta(days=90)
    expiry_warning_date = timezone.now()-expiry_period + warning_period
    users_about_to_expire = User.objects.filter(
        password_last_changed__lte=expiry_warning_date,
        password_last_changed__gt=timezone.now()-expiry_period #password is not yet expired
        )
    for user in users_about_to_expire:
        send_mail(
            'Password ExpiryWarning',
            'You have not yet changed your Fleetguard 2D-CAD Compare Login Password ,which will expire on ',
            settings.EMAIL_HOST_USER,
            [user.email],
            fail_silently=False,

        )
def update_password(user, new_password):
    # Save old password to history
    old_password_hash = make_password(user.password)  # Hash the old password
    PasswordHistory.objects.create(user=user, email=user.email, old_password=old_password_hash)

    # Update the user's password
    user.set_password(new_password)
    user.password_last_changed = timezone.now()
    user.save()


def send_otp_email(user, recipient_email):
    otp = str(random.randint(100000, 999999))
    user.otp = otp
    user.otp_created_at = timezone.now()
    user.save()

    # HTML content for the email
    subject = "Your OTP Code for Password Change"

    body = f"""
    <html>
    <body>
        <p>Hello {user.name},</p>
        <p>Greetings from Fleetguard Filter's CAD Compare Software</p>
        <p>Your OTP for changing password is:</p>
        <p style="font-size: 24px; font-weight: bold;">{otp}</p>
        <p>This code is valid for the next 5 minutes only. Please do not share this code with anyone.</p>
        <p>If you did not request a password change, please ignore this email or contact our support team immediately.</p>
        <br>
        <p>Best regards,<br>
        Chordz Technologies Team</p>
    </body>
    </html>
    """

    # Send the email with HTML content
    send_mail(
        subject,
        '',
        settings.EMAIL_HOST_USER,
        [recipient_email],
        fail_silently=False,
        html_message=body  # HTML formatted message
    )


def enforce_password_policies(user, new_password):
    if user:
    # Enforce password history (last 3 passwords)
        recent_passwords = PasswordHistory.objects.filter(user=user).order_by('-changed_at')[:3]
        for pwd_history in recent_passwords:
            if check_password(new_password, pwd_history.old_password):
                raise ValidationError({"message": "You cannot reuse your last 3 passwords"})

    # Critical password enforcement
    if len(new_password) < 8:
        raise ValidationError({"message":"Password must be at least 8 characters long"})

    if not re.search(r'[A-Z]', new_password):
        raise ValidationError({"message":"Password must contain at least one uppercase letter"})

    if not re.search(r'[a-z]', new_password):
        raise ValidationError({"message":"Password must contain at least one lowercase letter"})

    if not re.search(r'\d', new_password):
        raise ValidationError({"message":"Password must contain at least one digit"})

    if not re.search(r'[!@#$%^&*(),?":.<>|{}]', new_password):
        raise ValidationError({"message":"Password must contain at least one special character"})

    if user:
    # Save the new password to history
        PasswordHistory.objects.create(user=user, email=user.email, old_password=user.password)
        user.set_password(new_password)
    # Update user's password change date
        user.password_last_changed = timezone.now()
        user.save()

class AdminRegisterView(APIView):
    permission_classes = [IsAdminUser]  # Only admins can register new admins
    def post(self, request):
        try:
            email = request.data.get('email')
            password = request.data.get('password')
            emp_id = request.data.get('emp_id')

            if not email or not password:
                return Response({"message": "Email and Password are required"}, status=400)

            if User.objects.filter(email=email).exists():
                return Response({"message": "User with this email already exists."}, status=400)

            if User.objects.filter(emp_id=emp_id).exists():
                return Response({"message": "User with this Employee ID already exists."}, status=400)
            # Enforce password policies
            try:
                enforce_password_policies(None, password)
            except ValidationError as e:
                return Response({"message": e.messages[0]}, status=400)

            # Create the admin user
            admin_user = User.objects.create_superuser(
                email=email,
                password=password,
                emp_id=emp_id,
                force_password_change=1  # Force password change on first login
            )

            # Save the password to password history
            PasswordHistory.objects.create(user=admin_user, email=admin_user.email, old_password=password)

            return Response({"message": "Registered successfully."}, status=201)
        except Exception as e:
            return Response({"message": str(e)}, status=500)
class UserRegisterView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]  # Only admins can register users

    def post(self, request):
        try:
            email = request.data.get('email')
            password = request.data.get('password')
            emp_id = request.data.get('emp_id')

            if not email or not password or not emp_id:
                return Response({"message": "Email, Password, and Employee ID are required"}, status=400)

            if User.objects.filter(email=email).exists():
                return Response({"message": "User with this email already exists."}, status=400)

            if User.objects.filter(emp_id=emp_id).exists():
                return Response({"message": "User with this Employee ID already exists."}, status=400)

            # Enforce password policies
            try:
                enforce_password_policies(None, password)
            except ValidationError as e:
                return Response({"message": e.messages[0]}, status=400)



            # Create the user
            user = User.objects.create_user(
                email=email,
                password=password,
                emp_id=emp_id
            )

            # Save the password to password history
            PasswordHistory.objects.create(user=user, email=user.email, old_password=password)

            return Response({"message": "User registered successfully."}, status=201)
        except Exception as e:
            return Response({"message": str(e)}, status=500)

class AdminLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        if not email or not password:
            raise AuthenticationFailed({'message': 'Email and Password are required'})

        user = User.objects.filter(email=email, is_superuser=True).first()

        if not user:
            raise AuthenticationFailed({'message': 'Admin not found!'})

        if not user.check_password(password):
            raise AuthenticationFailed({'message': 'Incorrect Password'})

        # Generate tokens
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)

        return Response({
            'refresh': str(refresh),
            'access': access_token,
            'message': 'Login Successful'
        }, status=200)

class UserLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        if not email or not password:
            raise AuthenticationFailed({'message': 'Email and Password are required'})

        user = User.objects.filter(email=email, is_superuser=False).first()

        if not user:
            raise AuthenticationFailed({'message': 'User not found!'})

        if not user.check_password(password):
            raise AuthenticationFailed({'message': 'Incorrect Password'})

        # Generate tokens
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)

        return Response({
            'refresh': str(refresh),
            'access': access_token,
            'message': 'User Login Successful'
        }, status=200)


class UserView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user  # Automatically retrieved from the token
        serializer = UserSerializer(user)
        return Response(serializer.data)

class LogoutView(APIView):
    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"message": "Logout successful"})
        except Exception as e:
            return Response({"error": str(e)}, status=400)


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        email = request.data.get('email')
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')
        confirm_password = request.data.get('confirm_password')

        if not email or not old_password or not new_password or not confirm_password:
            return Response({"message": "Email , Old password, new password and confirm password are required"}, status=400)

        user = User.objects.filter(email=email).first()

        if user is None:
            return Response({"message": "User not found!"}, status=404)

        if user.account_locked:
            return Response({"message":"account locked due to multiple wrong password attempts"}, status=403)

        # if not user.check_password(old_password):
                #return Response({"message":"Old password is incorrect"}, status=400)

        # Check if the old password is correct
        if not user.check_password(old_password):
            user.login_attempts += 1
            if user.login_attempts >= 3:
                user.account_locked = True
                user.save(update_fields=['login_attempts', 'account_locked'])
                return Response(
                        {
                            "message": "Account locked due to multiple incorrect password attempts. Please contact Admin support."},
                        status=403
                    )
            user.save(update_fields=['login_attempts'])
            remaining_attempts = 3 - user.login_attempts
            return Response(
                    {
                        "message": f"Old password is incorrect. {remaining_attempts} attempt(s) remaining before account lock."},
                    status=400
                )

            # Reset login attempts since the old password was correct
        user.login_attempts = 0
        user.save(update_fields=['login_attempts'])

        if new_password != confirm_password:
            return Response({"message":"New password and confirm password do not match"}, status=400)

            # Check if the new password matches any of the last 3 passwords
        password_history = PasswordHistory.objects.filter(user=user).order_by('-changed_at')[:3]
        for password_entry in password_history:
            if user.check_password(new_password):  # Check if new password matches any of the last 3 passwords
                return Response({"message": "You cannot reuse your last three passwords."}, status=400)

            # Enforce password policies
        try:
            enforce_password_policies(user, new_password)
        except ValidationError as e:
            return Response({"message": e.messages[0]}, status=400)

            # Set new password
        user.set_password(new_password)
        user.force_password_change = False  # Reset force password change flag
        user.password_last_changed = timezone.now()
        user.save(update_fields=['password', 'force_password_change', 'password_last_changed'])

            # Save the new password to history after successfully changing it
        PasswordHistory.objects.create(user=user, email=user.email, old_password=user.password)

        return Response({"message": "Password changed successfully"})
        # try:
        #     # Enforce password policies
        #     enforce_password_policies(user, new_password)
        # except ValidationError as e:
        #     # Return the validation error messages in the response
        #     return Response({"message": e.messages}, status=400)
        #
        # # Set new password
        # user.set_password(new_password)
        # user.force_password_change = False  # Reset force password change flag
        # user.password_last_changed = timezone.now()
        # user.save(update_fields = ['password','force_password_change','password_last_changed'])
        # # Save the new password to history after successfully changing it
        # PasswordHistory.objects.create(user=user, email=user.email, old_password=user.password)
        #
        # return Response({"message": "Password changed successfully"})

class sendOTPView(APIView):

    authelabelntication_classes = []  # Disable authentication
    permission_classes = [AllowAny]  # Allow access to anyone

    def post(self, request):
        email = request.data.get('email')
        user = User.objects.filter(email=email).first()
        if user is None:
            raise NotFound({"message": "User not found"})

        send_otp_email(user, email)
        return Response({"message": "OTP sent to your email"})


class OTPVerificationThrottle(UserRateThrottle):
    rate='5/min'
class OTPVerificationView(APIView):
    throttle_classes = [OTPVerificationThrottle]

    def post(self, request):
        # Retrieve email and OTP from request data
        email = request.data.get('email')
        otp = request.data.get('otp')

        if not email or not otp:
            return Response({"message": "Email and OTP are required"}, status=400)

        # Fetch user with the provided email
        user = User.objects.filter(email=email).first()

        if user is None:
            return Response({"message": "Invalid email or OTP"}, status=403)
            # raise AuthenticationFailed({"message":"User not found"})
        otp_is_valid = (
            user.otp == otp and
            (now() - user.otp_created_at).total_seconds() <= 300
        )
        if not otp_is_valid:
            return Response({"message": "Invalid email or OTP"}, status=403)
        # Check if the OTP matches and is within the validity period
        # if user.otp != otp or (timezone.now() - user.otp_created_at).seconds > 300:
        #     raise AuthenticationFailed({"message":"Invalid or expired OTP"})

        # Clear OTP after successful verification
        user.otp = None
        user.otp_created_at = None  # Clear OTP creation time if it's stored
        user.save()

        return Response({"message": "OTP verified successfully"})

class AdminUserListView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]
    def get(self, request, *args, **kwargs):
        # if request.user.role != 'admin':
        #     raise PermissionDenied("You do not have permission to view this resource.")

        users = User.objects.filter(is_staff=False)
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)

class AdminChangePasswordView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]
    def post(self, request):
        email = request.data.get('email')
        new_password = request.data.get('new_password')
        confirm_password = request.data.get('confirm_password')
        # Fetch the user based on email
        user = User.objects.filter(email=email).first()
        if not user:
            return Response({"message": "User not found"}, status=404)
        if new_password != confirm_password:
            return Response({"message": "Passwords do not match"}, status=400)
        try:
            # Enforce password policies including history
            enforce_password_policies(user, new_password)
        except ValidationError as e:
            # Return the validation error messages in the response
            return Response({"message": e.messages[0]}, status=400)
        # Save the new password
        user.set_password(new_password)
        user.force_password_change = False
        user.save(update_fields=['password', 'force_password_change', 'password_last_changed'])
        # Unlock the account if locked
        if user.account_locked:
            user.account_locked = False
            user.save(update_fields=['account_locked'])
        return Response({"message": "Password changed and account unlocked successfully"})
