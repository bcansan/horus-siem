#!/usr/bin/env python3
import os
import sys
import psycopg2
from psycopg2.extras import RealDictCursor
from hashlib import sha256


def main():
    username = os.getenv('ADMIN_USER', 'admin')
    password = os.getenv('ADMIN_PASS', 'admin')
    dsn = os.getenv('POSTGRES_URL', 'postgresql://horus:horuspass@localhost:5432/horus')
    conn = psycopg2.connect(dsn)
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute("INSERT INTO users (username, password_hash, role) VALUES (%s, %s, 'admin') ON CONFLICT (username) DO NOTHING", (
        username, sha256(password.encode()).hexdigest()
    ))
    conn.commit()
    conn.close()
    print(f"Usuario admin '{username}' creado o ya existente")


if __name__ == '__main__':
    main()


