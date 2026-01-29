"""Backend package initialization.

Use PyMySQL as a drop-in replacement for MySQLdb so Django can connect
to MySQL using the `pymysql` driver without changing settings.
"""
try:
    import pymysql
    pymysql.install_as_MySQLdb()
except Exception:
    # Import errors will surface when running the app; keep top-level import
    # lightweight to avoid hiding unexpected issues during import time.
    pass
