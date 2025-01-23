# backend/app.py
from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
from datetime import datetime
from models import db, User, VM, Snapshot, Network
from config import Config
from flask_migrate import Migrate
import json

app = Flask(__name__)
app.config.from_object(Config)
db.init_app(app)
migrate = Migrate(app, db)
CORS(app, supports_credentials=True, origins="http://localhost:5173")

with app.app_context():
    db.create_all()

# Authentication and Registration Routes

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")
    user = User.query.filter_by(username=username).first()
    if user and user.check_password(password):
        user.generate_session_token()
        db.session.commit()
        response = make_response(jsonify({"success": True, "message": "Login successful"}))
        response.set_cookie('session_token', user.session_token, httponly=True, samesite='None', secure=True)
        return response
    return jsonify({"success": False, "message": "Invalid credentials"}), 401

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    if User.query.filter_by(username=username).first():
        return jsonify({"success": False, "message": "Username already exists"}), 400

    new_user = User(username=username)
    new_user.set_password(password)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"success": True, "message": "Registration successful"}), 201

@app.route('/api/check-session', methods=['GET'])
def check_session():
    session_token = request.cookies.get('session_token')
    if session_token:
        user = User.query.filter_by(session_token=session_token).first()
        if user:
            return jsonify({"loggedIn": True, "user": user.username})
    return jsonify({"loggedIn": False}), 401

@app.route('/api/logout', methods=['POST'])
def logout():
    session_token = request.cookies.get('session_token')
    user = User.query.filter_by(session_token=session_token).first()
    if user:
        user.session_token = None
        db.session.commit()
    response = make_response(jsonify({"success": True, "message": "Logged out successfully"}))
    response.delete_cookie('session_token')
    return response

# VM Management Routes

@app.route('/api/vm', methods=['POST'])
def create_vm():
    session_token = request.cookies.get('session_token')
    user = User.query.filter_by(session_token=session_token).first()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json()
    ram = data.get("ram")
    cpu_cores = data.get("cpu_cores")
    rate_per_minute = ram * 50
    network_id = data.get("network_id")  # Optional network
    os_type = data.get("os_type", "Linux")  # Default to Linux
    new_vm = VM(user_id=user.id, ram=ram, cpu_cores=cpu_cores, rate_per_minute=rate_per_minute,
                network_id=network_id, os_type=os_type)
    db.session.add(new_vm)
    db.session.commit()

    return jsonify({"message": "VM created successfully"}), 201

@app.route('/api/vms', methods=['GET'])
def get_vms():
    session_token = request.cookies.get('session_token')
    user = User.query.filter_by(session_token=session_token).first()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    vms = VM.query.filter_by(user_id=user.id).all()
    vm_list = [
        {
            "id": vm.id,
            "ram": vm.ram,
            "cpu_cores": vm.cpu_cores,
            "is_running": vm.is_running,
            "uptime": str(vm.uptime),
            "rate_per_minute": vm.rate_per_minute,
            "os_type": vm.os_type,  # Include OS
            "network": vm.network_id  # Include Network ID if available
        }
        for vm in vms
    ]
    return jsonify(vm_list)

@app.route('/api/vm/<int:vm_id>', methods=['PUT'])
def edit_vm(vm_id):
    session_token = request.cookies.get('session_token')
    user = User.query.filter_by(session_token=session_token).first()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    vm = VM.query.filter_by(id=vm_id, user_id=user.id).first()
    if vm:
        data = request.get_json()
        vm.ram = data.get("ram", vm.ram)
        vm.cpu_cores = data.get("cpu_cores", vm.cpu_cores)
        vm.os_type = data.get("os_type", vm.os_type)  # Fix attribute
        network_id = data.get("network_id")
        vm.network_id = int(network_id) if network_id else None
        db.session.commit()
        return jsonify({"message": "VM updated successfully"}), 200
    return jsonify({"error": "VM not found"}), 404

@app.route('/api/vm/<int:vm_id>', methods=['DELETE'])
def delete_vm(vm_id):
    session_token = request.cookies.get('session_token')
    user = User.query.filter_by(session_token=session_token).first()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    vm = VM.query.filter_by(id=vm_id, user_id=user.id).first()
    if vm:
        # Delete associated snapshots before deleting VM
        Snapshot.query.filter_by(vm_id=vm.id).delete()
        db.session.delete(vm)
        db.session.commit()
        return jsonify({"message": "VM deleted successfully"}), 200

    return jsonify({"error": "VM not found"}), 404

@app.route('/api/vm/<int:vm_id>/start', methods=['POST'])
def start_vm(vm_id):
    session_token = request.cookies.get('session_token')
    user = User.query.filter_by(session_token=session_token).first()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    vm = VM.query.filter_by(id=vm_id, user_id=user.id).first()
    if vm:
        vm.start_timer()
        db.session.commit()
        return jsonify({"message": "VM timer started"}), 200

    return jsonify({"error": "VM not found"}), 404

@app.route('/api/vm/<int:vm_id>/stop', methods=['POST'])
def stop_vm(vm_id):
    session_token = request.cookies.get('session_token')
    user = User.query.filter_by(session_token=session_token).first()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    vm = VM.query.filter_by(id=vm_id, user_id=user.id).first()
    if vm:
        vm.stop_timer()
        db.session.commit()
        return jsonify({"message": "VM timer stopped"}), 200

    return jsonify({"error": "VM not found"}), 404

@app.route('/api/vm/<int:vm_id>/billing', methods=['GET'])
def generate_billing(vm_id):
    session_token = request.cookies.get('session_token')
    user = User.query.filter_by(session_token=session_token).first()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    vm = VM.query.filter_by(id=vm_id, user_id=user.id).first()
    if vm:
        billing_amount = vm.calculate_billing()
        bill_generated_time = datetime.utcnow().isoformat()
        return jsonify({
            "vm_id": vm.id,
            "ram": vm.ram,
            "cpu_cores": vm.cpu_cores,
            "billing_amount": billing_amount,
            "uptime": str(vm.uptime),
            "rate_per_minute": vm.rate_per_minute,
            "bill_generated_time": bill_generated_time
        })

    return jsonify({"error": "VM not found"}), 404

@app.route('/api/networks', methods=['GET'])
def get_networks():
    networks = Network.query.all()
    network_list = [
        {
            "id": network.id,
            "type": network.type,
            "bandwidth": network.bandwidth,
            "is_active": network.is_active,
            "vms": [vm.id for vm in network.vms]
        }
        for network in networks
    ]
    return jsonify(network_list), 200

@app.route('/api/network', methods=['POST'])
def create_network():
    session_token = request.cookies.get('session_token')
    user = User.query.filter_by(session_token=session_token).first()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json()
    network_type = data.get("type")
    bandwidth = data.get("bandwidth")

    if not network_type or not bandwidth:
        return jsonify({"error": "Invalid data"}), 400

    new_network = Network(type=network_type, bandwidth=bandwidth)
    db.session.add(new_network)
    db.session.commit()

    return jsonify({"message": "Network created successfully"}), 201



# Snapshot Management Routes

@app.route('/api/vm/<int:vm_id>/snapshot', methods=['POST'])
def create_snapshot(vm_id):
    session_token = request.cookies.get('session_token')
    user = User.query.filter_by(session_token=session_token).first()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    vm = VM.query.filter_by(id=vm_id, user_id=user.id).first()
    if vm:
        snapshot = Snapshot(vm_id=vm.id, configuration=json.dumps({"ram": vm.ram, "cpu_cores": vm.cpu_cores}))
        db.session.add(snapshot)
        db.session.commit()
        return jsonify({"message": "Snapshot created successfully"}), 201
    return jsonify({"error": "VM not found"}), 404

@app.route('/api/vm/<int:vm_id>/snapshots', methods=['GET'])
def get_snapshots(vm_id):
    session_token = request.cookies.get('session_token')
    user = User.query.filter_by(session_token=session_token).first()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    snapshots = Snapshot.query.filter_by(vm_id=vm_id).order_by(Snapshot.created_at.desc()).all()
    snapshot_list = [{"id": s.id, "configuration": s.configuration, "created_at": s.created_at} for s in snapshots]
    return jsonify(snapshot_list)

@app.route('/api/vm/<int:vm_id>/snapshot/<int:snapshot_id>/revert', methods=['POST'])
def revert_snapshot(vm_id, snapshot_id):
    session_token = request.cookies.get('session_token')
    user = User.query.filter_by(session_token=session_token).first()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    snapshot = Snapshot.query.filter_by(id=snapshot_id, vm_id=vm_id).first()
    if snapshot:
        configuration = json.loads(snapshot.configuration)
        vm = VM.query.filter_by(id=vm_id, user_id=user.id).first()
        if vm:
            vm.ram = configuration.get('ram', vm.ram)
            vm.cpu_cores = configuration.get('cpu_cores', vm.cpu_cores)
            db.session.commit()
            return jsonify({"message": "VM reverted to snapshot successfully"}), 200
        return jsonify({"error": "VM not found"}), 404
    return jsonify({"error": "Snapshot not found"}), 404

# Main entry point
if __name__ == '__main__':
    app.run(debug=True)

