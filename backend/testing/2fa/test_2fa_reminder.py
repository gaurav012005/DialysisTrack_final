"""
Complete 2FA Reminder System Test
Tests the entire flow of optional 2FA with smart reminders
"""

import os
import sys
import django
from datetime import timedelta
from django.utils import timezone

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from django_otp.plugins.otp_totp.models import TOTPDevice
from two_factor.models import TwoFactorReminder, BackupCode

User = get_user_model()


def print_header(text):
    """Print a formatted header"""
    print("\n" + "="*60)
    print(f"  {text}")
    print("="*60)


def print_success(text):
    """Print success message"""
    print(f"✅ {text}")


def print_info(text):
    """Print info message"""
    print(f"ℹ️  {text}")


def print_test(text):
    """Print test name"""
    print(f"\n🧪 TEST: {text}")


def setup_test_data():
    """Setup test user without 2FA"""
    print_header("Setting Up Test Environment")
    
    # Get or create test user
    email = "test@dialysistrack.com"
    user, created = User.objects.get_or_create(
        email=email,
        defaults={
            'first_name': 'Test',
            'last_name': 'User',
            'role': 'doctor',
            'is_active': True
        }
    )
    
    if created:
        user.set_password('test123')
        user.save()
        print_success(f"Created test user: {email}")
    else:
        print_info(f"Using existing user: {email}")
    
    # Clean up any existing 2FA setup
    TOTPDevice.objects.filter(user=user).delete()
    BackupCode.objects.filter(user=user).delete()
    TwoFactorReminder.objects.filter(user=user).delete()
    print_success("Cleaned up existing 2FA data")
    
    return user


def test_1_initial_login_no_reminder(user):
    """Test 1: First login - no reminder shown"""
    print_test("Initial Login - No Reminder")
    
    # Create reminder tracker
    reminder, created = TwoFactorReminder.objects.get_or_create(user=user)
    
    # Check if reminder should show (should be False for first login)
    should_show = reminder.should_show_reminder()
    
    if not should_show:
        print_success("✓ First login does NOT show reminder (correct)")
        print_info(f"  Logout count: {reminder.logout_count}")
        print_info(f"  Last reminder: {reminder.last_reminder_shown}")
        return True
    else:
        print("❌ ERROR: First login should not show reminder!")
        return False


def test_2_after_5_logouts(user):
    """Test 2: After 5 logouts - reminder shown"""
    print_test("After 5 Logouts - Reminder Shown")
    
    reminder = TwoFactorReminder.objects.get(user=user)
    
    # Simulate 5 logouts
    for i in range(5):
        reminder.increment_logout()
    
    print_info(f"Simulated {reminder.logout_count} logouts")
    
    # Check if reminder should show
    should_show = reminder.should_show_reminder()
    
    if should_show:
        print_success("✓ After 5 logouts, reminder SHOWS (correct)")
        print_info(f"  Logout count: {reminder.logout_count}")
        return True
    else:
        print("❌ ERROR: Should show reminder after 5 logouts!")
        return False


def test_3_after_24_hours(user):
    """Test 3: After 24 hours - reminder shown"""
    print_test("After 24 Hours - Reminder Shown")
    
    reminder = TwoFactorReminder.objects.get(user=user)
    
    # Reset logout count
    reminder.logout_count = 0
    
    # Set last reminder to 25 hours ago
    reminder.last_reminder_shown = timezone.now() - timedelta(hours=25)
    reminder.save()
    
    print_info(f"Set last reminder to 25 hours ago")
    
    # Check if reminder should show
    should_show = reminder.should_show_reminder()
    
    if should_show:
        print_success("✓ After 24 hours, reminder SHOWS (correct)")
        hours_ago = (timezone.now() - reminder.last_reminder_shown).total_seconds() / 3600
        print_info(f"  Hours since last reminder: {hours_ago:.1f}")
        return True
    else:
        print("❌ ERROR: Should show reminder after 24 hours!")
        return False


def test_4_skip_reminder(user):
    """Test 4: User skips reminder - counters reset"""
    print_test("Skip Reminder - Counters Reset")
    
    reminder = TwoFactorReminder.objects.get(user=user)
    
    # Set some values
    reminder.logout_count = 5
    reminder.save()
    
    print_info(f"Before skip - Logout count: {reminder.logout_count}")
    
    # User skips reminder
    reminder.reminder_skipped()
    
    reminder.refresh_from_db()
    
    if reminder.logout_count == 0:
        print_success("✓ After skip, logout count RESET to 0 (correct)")
        print_info(f"  Logout count: {reminder.logout_count}")
        print_info(f"  Last reminder shown: {reminder.last_reminder_shown}")
        return True
    else:
        print("❌ ERROR: Logout count should be reset after skip!")
        return False


def test_5_enable_2fa_stops_reminders(user):
    """Test 5: Enable 2FA - reminders stop"""
    print_test("Enable 2FA - Reminders Stop")
    
    # Create a TOTP device (simulating 2FA setup)
    device = TOTPDevice.objects.create(
        user=user,
        name='default',
        confirmed=True
    )
    
    print_success("Enabled 2FA for user")
    
    reminder = TwoFactorReminder.objects.get(user=user)
    reminder.logout_count = 10  # Even with high logout count
    reminder.save()
    
    # Check if reminder should show
    should_show = reminder.should_show_reminder()
    
    if not should_show:
        print_success("✓ With 2FA enabled, reminder DOES NOT show (correct)")
        print_info(f"  Has 2FA device: {TOTPDevice.objects.filter(user=user, confirmed=True).exists()}")
        
        # Clean up
        device.delete()
        return True
    else:
        print("❌ ERROR: Should NOT show reminder when 2FA is enabled!")
        device.delete()
        return False


def test_6_reset_counters_on_2fa_enable(user):
    """Test 6: Enabling 2FA resets reminder counters"""
    print_test("Enable 2FA - Counters Reset")
    
    reminder = TwoFactorReminder.objects.get(user=user)
    reminder.logout_count = 5
    reminder.reminder_skip_count = 3
    reminder.save()
    
    print_info(f"Before 2FA enable:")
    print_info(f"  Logout count: {reminder.logout_count}")
    print_info(f"  Skip count: {reminder.reminder_skip_count}")
    
    # Simulate enabling 2FA
    reminder.reset_counters()
    
    reminder.refresh_from_db()
    
    if reminder.logout_count == 0 and reminder.reminder_skip_count == 0:
        print_success("✓ After 2FA enable, all counters RESET (correct)")
        print_info(f"  Logout count: {reminder.logout_count}")
        print_info(f"  Skip count: {reminder.reminder_skip_count}")
        return True
    else:
        print("❌ ERROR: Counters should be reset when 2FA is enabled!")
        return False


def run_all_tests():
    """Run all tests and report results"""
    print_header("2FA Reminder System - Complete Integration Test")
    print_info("Testing optional 2FA with smart reminders (24h or 5 logouts)")
    
    # Setup
    user = setup_test_data()
    
    # Run tests
    results = []
    results.append(("Initial login - no reminder", test_1_initial_login_no_reminder(user)))
    results.append(("After 5 logouts - show reminder", test_2_after_5_logouts(user)))
    results.append(("After 24 hours - show reminder", test_3_after_24_hours(user)))
    results.append(("Skip reminder - reset counters", test_4_skip_reminder(user)))
    results.append(("Enable 2FA - stop reminders", test_5_enable_2fa_stops_reminders(user)))
    results.append(("Enable 2FA - reset counters", test_6_reset_counters_on_2fa_enable(user)))
    
    # Summary
    print_header("Test Results Summary")
    
    total = len(results)
    passed = sum(1 for _, result in results if result)
    failed = total - passed
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {test_name}")
    
    print("\n" + "-"*60)
    print(f"Total Tests: {total}")
    print(f"Passed: {passed} ✅")
    print(f"Failed: {failed} {'❌' if failed > 0 else ''}")
    print("-"*60)
    
    if passed == total:
        print_success("ALL TESTS PASSED! 🎉")
        print_info("2FA reminder system is working perfectly!")
        print_info("\nHow it works:")
        print_info("  1. Login without 2FA → goes to dashboard")
        print_info("  2. After 24 hours OR 5 logouts → redirected to 2FA setup")
        print_info("  3. User can enable 2FA or skip")
        print_info("  4. If skipped → reminded again after 24h or 5 logouts")
        print_info("  5. If enabled → login requires code, no more reminders")
        return True
    else:
        print("❌ SOME TESTS FAILED - Please review the errors above")
        return False


if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)
