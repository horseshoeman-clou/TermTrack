import sqlite3

DB_PATH = "history.db"

def get_db():
	return sqlite3.connect(DB_PATH)

def init_db():
	conn = get_db()
	conn.execute("""
	CREATE TABLE IF NOT EXISTS commands (
				id  INTEGER PRIMARY KEY,
				command TEXT,
				category TEXT,
				source TEXT DEFAULT 'bash'
				)
		""")
	conn.commit()
	conn.close()

def parse_and_store(history_text, source="bash"):

	conn = get_db()

	for line in history_text.split("\n"):
		cmd = line.strip()
		if not cmd:
			continue

		category = "other"
		if cmd.startswith("git"):
			category = "git"
		elif any(cmd.startswith(p) for p in ["cd", "ls", "pwd", "mkdir", "rm", "cp", "mv"]):
			category = "nav"
		elif any(cmd.startswith(p) for p in ["python", "node", "npm", "pip", "gcc", "g++", "make", "java", "javac"]):
			category = "build"
		elif any(cmd.startswith(p) for p in ["vim", "nano", "code", "cat", "less", "grep"]):
			category = "edit"

		conn.execute(
			"INSERT INTO commands (command, category, source)VALUES (?, ?, ?)",(cmd, category, source))

	conn.commit()
	conn.close()

def get_stats(source = None):
	conn = get_db()

	if source:
		top = conn.execute(
			"SELECT command, COUNT(*) as c FROM commands WHERE source = ? GROUP BY command ORDER BY c DESC LIMIT 10", (source,)).fetchall()
		cats = conn.execute(
			"SELECT category, COUNT(*) as c FROM commands WHERE source = ? GROUP BY category", (source)).fetchall()
	else:
		top = conn.execute(
			"SELECT command, COUNT(*) as c FROM commands GROUP BY command ORDER BY c DESC LIMIT 10").fetchall()
		cats = conn.execute(
			"SELECT category, COUNT(*) as c FROM commands GROUP BY category").fetchall()
		conn.close()

		return {"top_commands" : top,
			"categories" : cats}
