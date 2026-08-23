from flask import Flask, render_template, request
import database

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

if __name__ == "__main__":
	app.run(debug=True)
