const form = document.getElementById('upload-form');
const result = document.getElementById('result');

form.addEventListener('submit',async(e) =>{
    e.preventDefault();

    const fileInput = document.getElementById('history');

    const sourceInput = document.getElementById('source');

    if(!fileInput.files.length){
        result.textContent = "Pick a file.";
        return;
    }

    const formData = new FormData();
    formData.append('history', fileInput.files[0]);
    formData.append('source', sourceInput.value);


    const response = await fetch('/upload',{
        method : 'POST',
        body : formData
    });

    const data = await response.json();
    
    const statsRes = await fetch('/stats');
    const stats = await statsRes.json();

    let html = `<p>Uploaded! ${data.lines} lines stored.<p>`;

    html += `<h3>Top Commands</h3><ul>`;

    stats.top_commands.forEach(([cmd, count]) =>{
        
        html += `<li>${cmd} : ${count}</li>`;
    });

    html += `</ul>`;
    html += `<h3>Categories</h3><ul>`;

    stats.categories.forEach(([cat, count]) =>{

        html += `<li>${cat} : ${count}</li>`;
    });
    
    html += `</ul>`;

    result.innerHTML = html;
});