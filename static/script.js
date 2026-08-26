const form = document.getElementById('upload-form');
const result = document.getElementById('result');
const chartsDiv = document.querySelector('.charts');

let topChartInstance = null;
let catChartInstance = null;

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
        const uploadRes = await fetch('/upload', {
            method: 'POST',
            body: formData
        });
        const uploadData = await uploadRes.json();
        result.textContent = `Uploaded! ${uploadData.lines} lines stored.`;

        console.log("Fetching /stats...");
        const statsRes = await fetch('/stats');
        console.log("Stats response status:", statsRes.status);
        
        const stats = await statsRes.json();
        console.log("Stats object:", stats);
        console.log("Top commands:", stats.top_commands);
        console.log("Categories:", stats.categories);

        if (!stats.top_commands || !stats.categories) {
            result.textContent = "Error: stats missing expected fields";
            return;
        }

        chartsDiv.style.display = 'flex';
        drawCharts(stats);
        
    } catch (err) {
        console.error("Error:", err);
        result.textContent = "Error: " + err.message;
    }
});

function drawCharts(stats) {

    const chartsDiv = document.querySelector('.charts');
    chartsDiv.style.display = 'flex';

    void chartsDiv.offsetHeight;

    const topCanvas = document.getElementById('topChart');
    const catCanvas = document.getElementById('catChart');
    
    if (!topCanvas || !catCanvas) {
        console.error("Canvas elements not found");
        return;
    }

    if (topChartInstance) topChartInstance.destroy();
    if (catChartInstance) catChartInstance.destroy();

    const topLabels = stats.top_commands.map(item => item[0]);
    const topData = stats.top_commands.map(item => Number(item[1]));
    
    const catLabels = stats.categories.map(item => item[0]);
    const catData = stats.categories.map(item => Number(item[1]));

    console.log("Drawing with topData:", topData);
    console.log("Drawing with catData:", catData);

    topChartInstance = new Chart(topCanvas.getContext('2d'), {
        type: 'bar',
        data: {
            labels: topLabels,
            datasets: [{
                label: 'Usage Count',
                data: topData,
                backgroundColor: '#238636',
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                title: { display: true, text: 'Top 10 Commands', color: '#c9d1d9' }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: '#8b949e' },
                    grid: { color: '#30363d' }
                },
                x: {
                    ticks: { color: '#8b949e' },
                    grid: { display: false }
                }
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
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: { display: true, text: 'Command Categories', color: '#c9d1d9' },
                legend: { labels: { color: '#8b949e' } }
            }
        }
    });
}