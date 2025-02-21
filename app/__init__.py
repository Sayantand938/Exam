from flask import Flask
from flask_cors import CORS
from .routes import main_bp  # Import the blueprint

def create_app():
    app = Flask(__name__)
    CORS(app)  # Enable CORS for all routes

    app.register_blueprint(main_bp) # Register the blueprint

    return app