from django.contrib import admin
from django.urls import path
from .views import AdminRegisterView, AdminLoginView, UserRegisterView, UserLoginView, UserView, LogoutView, sendOTPView
from .views import AdminChangePasswordView, AdminUserListView,ChangePasswordView,OTPVerificationView
from rest_framework_simplejwt.views import (TokenObtainPairView, TokenRefreshView, TokenVerifyView)

urlpatterns = [
    path('admin-register/', AdminRegisterView.as_view()),
    path('admin-login/', AdminLoginView.as_view()),
    path('user-register/', UserRegisterView.as_view()),
    path('user-login/', UserLoginView.as_view()),
    # path('login/', TokenObtainPairView.as_view(),name='token_obtain_pair'),
    path('verify/', TokenVerifyView.as_view(), name='token_verify'),
    path('refresh/',TokenRefreshView.as_view(), name='token_refresh'),
    path('user/', UserView.as_view()),
    path('logout/', LogoutView.as_view()),
    path('send-otp/', sendOTPView.as_view()),
    path('verify-otp/', OTPVerificationView.as_view()),
    # path('token/',TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('user-change-password/', ChangePasswordView.as_view()),
    path('admin-change-password/', AdminChangePasswordView.as_view()),
    path('list-all-users/', AdminUserListView.as_view())
]
