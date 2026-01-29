"""
Script to clean up duplicate user accounts
Keeps the most recent user for each email
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.db.models import Count

User = get_user_model()

print("Checking for duplicate users...")
print("="*60)

# Find emails with multiple users
duplicate_emails = User.objects.values('email').annotate(
    count=Count('id')
).filter(count__gt=1)

if not duplicate_emails.exists():
    print("✓ No duplicate users found!")
else:
    print(f"Found {duplicate_emails.count()} emails with duplicates:")
    
    for dup in duplicate_emails:
        email = dup['email']
        count = dup['count']
        
        print(f"\n  Email: {email} ({count} accounts)")
        
        # Get all users with this email
        users = User.objects.filter(email=email).order_by('-date_joined')
        
        # Keep the most recent one
        keep_user = users.first()
        delete_users = users.exclude(id=keep_user.id)
        
        print(f"  Keeping: ID={keep_user.id}, Role={keep_user.role}, Created={keep_user.date_joined}")
        
        for user in delete_users:
            print(f"  Deleting: ID={user.id}, Role={user.role}, Created={user.date_joined}")
            user.delete()
        
        print(f"  ✓ Cleaned up {delete_users.count()} duplicate(s)")

print("\n" + "="*60)
print("Cleanup complete!")
print("="*60)

# Show all unique users
print("\nCurrent active users:")
all_users = User.objects.filter(is_active=True).values('email', 'role', 'first_name', 'last_name')
for user in all_users:
    print(f"  {user['email']:30s} | {user['role']:15s} | {user['first_name']} {user['last_name']}")
