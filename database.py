import sqlite3
from pathlib import Path
from datetime import datetime

DB_PATH = "history.db"

def get_db():
    return sqlite3.connect(DB_PATH)

def init_db():
    conn = get_db()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS commands (
            id INTEGER PRIMARY KEY,
            command TEXT,
            category TEXT,
            source TEXT DEFAULT 'bash'
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS folder_progress (
            id INTEGER PRIMARY KEY,
            parent_folder TEXT,
            subfolder TEXT,
            file_count INTEGER,
            scanned_at TEXT
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
        elif any(cmd.startswith(p) for p in ["python", "node", "npm", "pip", "gcc", "make"]):
            category = "build"
        elif any(cmd.startswith(p) for p in ["vim", "nano", "code", "cat", "less", "grep"]):
            category = "edit"
        conn.execute(
            "INSERT INTO commands (command, category, source) VALUES (?, ?, ?)",
            (cmd, category, source)
        )
    conn.commit()
    conn.close()

def get_stats(source=None):
    conn = get_db()
    if source:
        top = conn.execute(
            "SELECT command, COUNT(*) as c FROM commands WHERE source = ? GROUP BY command ORDER BY c DESC LIMIT 10",
            (source,)
        ).fetchall()
        cats = conn.execute(
            "SELECT category, COUNT(*) as c FROM commands WHERE source = ? GROUP BY category",
            (source,)
        ).fetchall()
    else:
        top = conn.execute(
            "SELECT command, COUNT(*) as c FROM commands GROUP BY command ORDER BY c DESC LIMIT 10"
        ).fetchall()
        cats = conn.execute(
            "SELECT category, COUNT(*) as c FROM commands GROUP BY category"
        ).fetchall()
    conn.close()
    return {"top_commands": top, "categories": cats}

def has_data():
    conn = get_db()
    count = conn.execute("SELECT COUNT(*) FROM commands").fetchone()[0]
    conn.close()
    return {"count": count}

def clear_data():
    conn = get_db()
    conn.execute("DELETE FROM commands")
    conn.execute("DELETE FROM folder_progress")
    conn.commit()
    conn.close()

def scan_and_store_folder(base_path):
    if not base_path.startswith(("/", "~")):
        base_path = "~/" + base_path
    
    base = Path(base_path).expanduser()
    if not base.exists():
        return {"error": "Path does not exist"}, 400
    
    conn = get_db()
    conn.execute("DELETE FROM folder_progress WHERE parent_folder = ?", (str(base),))
    total = 0
    children = []
    
    for child in base.iterdir():
        if child.is_dir() and not child.name.startswith("."):
            count = len([f for f in child.iterdir() if f.is_file()])
            children.append({"name": child.name, "count": count})
            total += count
            conn.execute(
                "INSERT INTO folder_progress (parent_folder, subfolder, file_count, scanned_at) VALUES (?, ?, ?, ?)",
                (str(base), child.name, count, datetime.now().isoformat())
            )
    
    conn.commit()
    conn.close()
    return {"parent": str(base), "total": total, "children": children}

def get_folder_stats():
    conn = get_db()
    rows = conn.execute(
        "SELECT parent_folder, subfolder, file_count FROM folder_progress ORDER BY parent_folder, subfolder"
    ).fetchall()
    conn.close()
    result = {}
    for parent, sub, count in rows:
        if parent not in result:
            result[parent] = {"total": 0, "children": []}
        result[parent]["children"].append({"name": sub, "count": count})
        result[parent]["total"] += count
    return result
