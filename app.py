from flask import Flask, render_template, request
from pathlib import Path
import database
import os

app = Flask(__name__)

database.init_db()

@app.route("/")
def home():
	return render_template("index.html")

@app.route("/upload", methods=["POST"])
def upload():

	file = request.files["history"]
	text = file.read().decode("utf-8")

	source = request.form.get("source", "bash")

	database.parse_and_store(text, source)

	return{"status" : "ok",
		"lines" : len(text.splitlines())}

@app.route("/stats")
def stats():

	source = request.args.get("source")

	return database.get_stats(source)

@app.route("/has-data")
def has_data():
	return database.has_data()

@app.route("/scan-folder", methods=["POST"])
def scan_folder():

    data = request.get_json(silent=True) or {}
    path = data.get("path", "").strip()

    if not path:
        return {"error": "No path provided"}, 400

    return database.scan_and_store_folder(path)

@app.route("/folder-stats")
def folder_stats():
	return database.get_folder_stats()

if __name__ == "__main__":

	port = int(os.environ.get("PORT", 5000))
	app.run(host="0.0.0.0", port=port, debug=False)
