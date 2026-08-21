from flask import Flask, render_template, request

app = Flask(__name__)

@app.route("/")
def home():
	return render_template("index.html")

@app.route("/upload", methods=["POST"])
def upload():

	file = request.files["history"]
	text = file.read().decode("utf-8")

	print(f"Received {len(text)} characters")

	return{"status" : "ok",
		"lines" : len(text.splitlines())}

if __name__ == "__main__":
	app.run(debug=True)
