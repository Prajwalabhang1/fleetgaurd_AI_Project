from celery import shared_task
from datetime import timedelta
from django.utils.timezone import now
from django.core.mail import send_mail
from django.contrib.auth import get_user_model

PASSWORD_EXPIRY_DAYS =   3# Password validity in days
REMINDER_DAYS_BEFORE_EXPIRY = 3  # Notify users 3 days before expiry

@shared_task
def send_password_expiry_notifications():
    """
    Celery task to notify users whose passwords will expire in 3 days.
    """
    User = get_user_model()  # Get the custom user model
    today = now()  # Get current timezone-aware datetime

    # Calculate the reminder threshold date
    expiry_reminder_date = today + timedelta(days=REMINDER_DAYS_BEFORE_EXPIRY)
    for user in User.objects.all():
        print(f"User: {user.email}, Password Last Changed: {user.password_last_changed}")

    # Find users whose passwords are nearing expiry
    users_to_notify = User.objects.filter(
        is_active=True,                      # Active users only
        account_locked=False,                # Skip locked accounts
        password_last_changed__isnull=False, # Exclude users without a password change
        password_last_changed__lte=expiry_reminder_date - timedelta(days=PASSWORD_EXPIRY_DAYS),
    )

    # Notify each user
    for user in users_to_notify:
        expiry_date = user.password_last_changed + timedelta(days=PASSWORD_EXPIRY_DAYS)
        try:
            send_mail(
                'Password Expiry Notification',
                (
                    f'Dear {user.name or "User"},\n\n'
                    f'Your account password will expire on {expiry_date.date()}. '
                    'Please update your password to avoid any disruption of service.\n\n'
                    'Regards,\nThe Chordz Team'
                ),
                'chordzconnect@gmail.com',  # From email
                [user.email],               # To email
                fail_silently=False,        # Raise an exception on email failure
            )
            print(f"Notification sent to {user.email}.")  # Logging for debug
        except Exception as e:
            print(f"Failed to send email to {user.email}: {e}")

# @shared_task
# def lock_expiry_accounts():
#     today=now().date()
#     users_to_lock = User.objects.filter(
#         password_last_changed__lte=today-timedelta(days=PASSWORD_EXPIRY_DAYS),
#         account_locked=False,
#         is_active=True
#     )
#     for user in users_to_lock:
#         user.account_locked = True
#         user.save()