const form = document.getElementById('upload-form');
const result = document.getElementById('result');
const chartsDiv = document.querySelector('.charts');
const sourceBtns = document.querySelectorAll('.source-btn');
const clearBtn = document.getElementById('clear-btn');
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const scanBtn = document.getElementById('scan-btn');
const folderPathInput = document.getElementById('folder-path');
const folderResult = document.getElementById('folder-result');
const subtitle = document.getElementById('subtitle');

let topChartInstance = null;
let catChartInstance = null;
let currentSource = 'all';


tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        tabContents.forEach(c => c.classList.remove('active'));
        document.getElementById(`${btn.dataset.tab}-tab`).classList.add('active');

	if(btn.dataset.tab === 'commands'){
	subtitle.textContent = 'Uplaod your shell history. See what you actually type.';
	}
	else{
	subtitle.textContent = 'Scan any folder. Track files per subfolder.';
	}
    });
});


sourceBtns.forEach(btn => {
    if (btn.id === 'clear-btn') return;
    btn.addEventListener('click', () => {
        sourceBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentSource = btn.dataset.source;
        loadStats(currentSource);
    });
});


clearBtn.addEventListener('click', async () => {
    if (!confirm('Clear all data?')) return;
    const res = await fetch('/clear', { method: 'POST' });

    if (!res.ok){
	result.textContent = 'Clear failed: '+res.status;
	return;
    }
    chartsDiv.style.display = 'none';
    folderResult.innerHTML = '';
    result.textContent = 'Data cleared.';
});


form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fileInput = document.getElementById('history');
    const sourceInput = document.getElementById('source');
    if (!fileInput.files.length) {
        result.textContent = "Pick a file first.";
        return;
    }
    const formData = new FormData();
    formData.append('history', fileInput.files[0]);
    formData.append('source', sourceInput.value);
    result.textContent = "Uploading...";
    try {
        const uploadRes = await fetch('/upload', { method: 'POST', body: formData });
        const uploadData = await uploadRes.json();
        result.textContent = `Uploaded! ${uploadData.lines} lines stored.`;
        await loadStats(currentSource);
    } catch (err) {
        result.textContent = "Error: " + err.message;
    }
});

async function loadStats(source) {
    try {
        const url = source === 'all' ? '/stats' : `/stats?source=${source}`;
        const statsRes = await fetch(url);
        const stats = await statsRes.json();
        if (!stats.top_commands || !stats.top_commands.length) {
            chartsDiv.style.display = 'none';
            result.textContent = 'No data for this source.';
            return;
        }
        chartsDiv.style.display = 'flex';
        drawCharts(stats);
    } catch (err) {
        result.textContent = "Error loading stats: " + err.message;
    }
}

function drawCharts(stats) {
    const chartsDivEl = document.querySelector('.charts');
    chartsDivEl.style.display = 'flex';
    void chartsDivEl.offsetHeight;
    const topCanvas = document.getElementById('topChart');
    const catCanvas = document.getElementById('catChart');
    if (!topCanvas || !catCanvas) return;
    if (topChartInstance) topChartInstance.destroy();
    if (catChartInstance) catChartInstance.destroy();

    const topLabels = stats.top_commands.map(item => item[0]);
    const topData = stats.top_commands.map(item => Number(item[1]));
    const catLabels = stats.categories.map(item => item[0]);
    const catData = stats.categories.map(item => Number(item[1]));

    topChartInstance = new Chart(topCanvas.getContext('2d'), {
        type: 'bar',
        data: {
            labels: topLabels,
            datasets: [{
                label: 'Usage Count',
                data: topData,
                backgroundColor: '#238636',
                hoverBackgroundColor: '#3fb950',
                borderColor: '#238636',
                hoverBorderColor: '#56d364',
                borderWidth: 0,
                hoverBorderWidth: 2,
                borderRadius: 6,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                
                title: {
                	 display: true,
                	 text: 'Top 10 Commands',
                	 color: '#c9d1d9',
                	 font: { size: 16,
                	 	 weight: 'bold'
                	       }
                	 },

          tooltip: {
		backgroundColor: '#161b22',
		titleColor: '#58a6ff',
		bodyColor: '#c9d1d9',
		borderColor: '#30363d',
		borderWidth: 1,
		padding: 12,
		cornerRadius: 8,
		displayColors: false
		}
            },

            scales: {
                y: { beginAtZero: true,
                     ticks: { color: '#8b949e' },
                     grid: { color: '#30363d' }
                    },

                x: { ticks: { color: '#8b949e' },
                     grid: { display: false }
                    }
            },
            interactions: {
            	mode: 'index',
            	intersect: false
            	},
            animation: {
            	duration: 800,
            	easing: 'easeOutQuart'
            	}
        }
    });

    const colors = ['#238636', '#1f6feb', '#8957e5', '#d29922', '#f85149', '#58a6ff'];
    catChartInstance = new Chart(catCanvas.getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: catLabels,
            datasets: [{
                data: catData,
                backgroundColor: colors,
                borderWidth: 0,
		borderRadius: 8,
		hoverOffset: 15,
		offset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '65%',
            plugins: {
                title: { display: true,
                	 text: 'Command Categories',
                	 color: '#c9d1d9' },

                legend: { labels: { color: '#8b949e',
                		    padding: 20,
                		    usePointStyle: true,
                		    pointStytle: 'circle'
                		    } },

                tooltip: { backgroundColor: '#161b22',
                	  titleColor: '#58a6ff',
                	  bodyColor: '#c9d1d9',
                	  borderColor: '#30363d',
                	  borderWidth: 1,
                	  padding: 12,
                	  corderRadius: 8
                	  }},

               animation: {
               		 animateScale: true,
               		 animateRotate: true
               		 }}
    });
}


scanBtn.addEventListener('click', async () => {
    const path = folderPathInput.value.trim();
    if (!path) {
        folderResult.textContent = 'Enter a folder path.';
        return;
    }
    folderResult.textContent = 'Scanning...';
    try {
        const res = await fetch('/scan-folder', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path })
        });
        
        if (!res.ok) {
            const text = await res.text();
            folderResult.textContent = `Server error ${res.status}: ${text.substring(0, 200)}`;
            return;
        }
        
        const data = await res.json();
        console.log("SCAN RESPONSE:", JSON.stringify(data, null, 2));
        
        if (data.error) {
            folderResult.textContent = 'Error: ' + data.error;
            return;
        }
        
        if (!data.children) {
            folderResult.textContent = 'Error: response missing children field';
            console.error("Bad response structure:", data);
            return;
        }
        
        if (!Array.isArray(data.children)) {
            folderResult.textContent = 'Error: children is not an array';
            console.error("Children type:", typeof data.children, data.children);
            return;
        }
        
        let html = `<h3 style="color:#58a6ff;margin-bottom:0.5rem;">${data.parent}</h3>`;
        html += `<table class="folder-table"><tr><th>Subfolder</th><th>Files</th></tr>`;
        data.children.forEach(child => {
            html += `<tr><td>${child.name}</td><td>${child.count}</td></tr>`;
        });
        html += `<tr class="total-row"><td>Total</td><td>${data.total}</td></tr></table>`;
        folderResult.innerHTML = html;
        
    } catch (err) {
        folderResult.textContent = 'Error: ' + err.message;
        console.error(err);
    }
});

function renderFolderStats(data) {
    let html = '';
    for (const [parent, info] of Object.entries(data)) {
        html += `<h3 style="color:#58a6ff;margin-bottom:0.5rem;">${parent}</h3>`;
        html += `<table class="folder-table"><tr><th>Subfolder</th><th>Files</th></tr>`;
        info.children.forEach(child => {
            html += `<tr><td>${child.name}</td><td>${child.count}</td></tr>`;
        });
        html += `<tr class="total-row"><td>Total</td><td>${info.total}</td></tr></table>`;
    }
    folderResult.innerHTML = html;
}


window.addEventListener('DOMContentLoaded', async () => {
    const res = await fetch('/has-data');
    const { count } = await res.json();
    if (count > 0) {
        await loadStats('all');
        result.textContent = `${count} commands loaded`;
    }
    try {
        const folderRes = await fetch('/folder-stats');
        const folderData = await folderRes.json();
        if (Object.keys(folderData).length > 0) {
            renderFolderStats(folderData);
        }
    } catch (e) {}
});
