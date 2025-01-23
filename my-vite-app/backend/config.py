# backend/config.py
import os

class Config:
    SECRET_KEY = os.urandom(24)
    SQLALCHEMY_DATABASE_URI = 'postgresql://my_app_user:your_password@localhost/my_app_db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False

