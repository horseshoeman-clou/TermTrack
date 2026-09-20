# TermTrack

Terminal command analytic + folder progress tracker. Built because I wanted to see what I actually type and track my Competitive Programming progress.

## What It Does

- **Upload shell history** - Drop `.bash_history` or any command log. Get top commands and category breakdown.
- **Multi-shell support** - Tag uploads as Bash or Custom Shell. Filter between them.
- **Folder tracker** - Scan any directory (e.g. `cses`) and see file counts per subfolder. Tracks coding practice progress.
- **Persists everything** - SQLite stores data between sessions. Refresh and charts reload automatically.

I built this after realizing I had no idea whether I actually spent more time navigating, building, editing, or committing. The answer turned out to be "clearing the terminal", but the data was worth it.

## Live Demo 

**https://termtrack.onrender.com/**

Hosted on Render.

**Commands Tab** - Upload `.bash_history` or any shell log. See top command and category breakdown.

**Folder Tracker Tab** - Scan `~/cses`, `~/projects`, or any path. Get per-subfolder file counts with totals.


> **Note — Folder Analysis is local-only.**
 The folder scanner reads the filesystem of the machine running the Flask
 server, so on the hosted demo it can only see Render's servers, not your
 folders. To use it, clone this repo and run the app locally:

# Installation

```bash
git clone https://github.com/horseshoeman-clou/TermTrack.git
cd TermTrack
pip install -r requirements.txt
python app.py
```


# Run 

```bash
pip install flask
python app.py
```

> Then open http://localhost:5000, switch to the **Folders** tab, and enter an
> absolute path like `/home/you/cses-solutions` or just `cses-solutions`.

## Stack

- Python + Flask
- SQLite (single file, zero setup)
- HTML/CSS/JS + Chart.js

## Structure
```bash
termtrack/
 ├── app.py          # Flask routes
 ├── database.py     # SQLite wrapper
 ├── templates/
 │    └── index.html  # Dashboard
 └── static/
      ├── style.css   # Terminal theme
      └── script.js   # Charts + logic
```
## What I learned

- SQLite is just a file with a query language. No server needed.
- Flask is Python with HTTP routes. Same logic as file I/O
- Chart.js turns JSON into charts with one constructor call. The hard part isn't the library - it's getting clean data to feed it.
- Building tools you actually use beats tutorial projects.

## Future Work

- Time-series analysis - commands per day, week, month
- Commands search/filter in the dashboard
- Export to CSV/JSON
- C++ shell structured log format integration

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.   
