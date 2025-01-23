# backend/models.py
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta
import json
import hashlib
import secrets

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    session_token = db.Column(db.String(256), nullable=True)
    vms = db.relationship('VM', backref='user', lazy=True)

    def set_password(self, password):
        self.password_hash = hashlib.sha256(password.encode()).hexdigest()

    def check_password(self, password):
        return self.password_hash == hashlib.sha256(password.encode()).hexdigest()

    def generate_session_token(self):
        self.session_token = secrets.token_hex(64)

class Network(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    type = db.Column(db.String(10), nullable=False)  # Example: 2G, 3G, 4G, 5G
    bandwidth = db.Column(db.Integer, nullable=False)  # Bandwidth in Mbps
    is_active = db.Column(db.Boolean, default=True)
    vms = db.relationship('VM', backref='network', lazy=True)

    def __init__(self, type, bandwidth):
        self.type = type
        self.bandwidth = bandwidth

class VM(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    ram = db.Column(db.Integer, nullable=False)
    cpu_cores = db.Column(db.Integer, nullable=False)
    rate_per_minute = db.Column(db.Integer, nullable=False)
    os_type = db.Column(db.String(20), nullable=False, default='Linux')  # Default OS
    network_id = db.Column(db.Integer, db.ForeignKey('network.id'), nullable=True)    
    is_running = db.Column(db.Boolean, default=False)
    uptime = db.Column(db.Interval, default=timedelta(0))
    start_time = db.Column(db.DateTime, nullable=True)  # Store start time for VM

    def start_timer(self):
        if not self.is_running:
            self.is_running = True
            self.start_time = datetime.utcnow()  # Store current time as start time
            db.session.commit()

    def stop_timer(self):
        if self.is_running:
            self.is_running = False
            if self.start_time:  # Make sure the start time is set
                elapsed_time = datetime.utcnow() - self.start_time
                self.uptime += elapsed_time  # Add elapsed time to uptime
            self.start_time = None  # Reset start time
            db.session.commit()

    def calculate_billing(self):
        # Assume rate_per_minute is the charge for running the VM for 1 minute
        return self.rate_per_minute * (self.uptime.total_seconds() / 60)

class Snapshot(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    vm_id = db.Column(db.Integer, db.ForeignKey('vm.id'), nullable=False)
    configuration = db.Column(db.String, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    vm = db.relationship('VM', backref='snapshots', lazy=True)


