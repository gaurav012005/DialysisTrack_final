import pymysql
import sys

def setup_mysql():
    try:
        # Connect to MySQL server
        connection = pymysql.connect(
            host='localhost',
            user='root',
            password='',  # Change this to your MySQL root password
            charset='utf8mb4'
        )
        
        cursor = connection.cursor()
        
        # Create database
        cursor.execute("CREATE DATABASE IF NOT EXISTS dialysis_track")
        
        # Create user
        cursor.execute("CREATE USER IF NOT EXISTS 'gaurav_dialysis'@'localhost' IDENTIFIED BY 'MyStrongPass@123'")
        
        # Grant privileges
        cursor.execute("GRANT ALL PRIVILEGES ON dialysis_track.* TO 'gaurav_dialysis'@'localhost'")
        cursor.execute("FLUSH PRIVILEGES")
        
        print("✅ MySQL database and user created successfully!")
        
        cursor.close()
        connection.close()
        
    except Exception as e:
        print(f"❌ Error: {e}")
        print("Make sure MySQL is running and root password is correct")
        sys.exit(1)

if __name__ == "__main__":
    setup_mysql()