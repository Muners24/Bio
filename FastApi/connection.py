from pymongo import MongoClient

usuario = "root"
contraseña = "admin"
host = "localhost"
puerto = 27017

uri = f"mongodb://{usuario}:{contraseña}@{host}:{puerto}/"
client = MongoClient(uri)

DB = client["WHarmonyHubDB"]
