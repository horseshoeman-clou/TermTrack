const form = document.getElementById('upload-form');
const result = document.getElementById('result');

form.addEventListener('submit',async(e) =>{
    e.preventDefault();

    const fileInput = document.getElementById('history');

    if(!fileInput.files.length){
        result.textContent = "Pick a file.";
        return;
    }

    const formData = new FormData();
    formData.append('history', fileInput.files[0]);

    const response = await fetch('/upload',{
        method : 'POST',
        body : formData
    });

    const data = await response.json();
    result.textContent = `Uploaded! ${data.lines} lines received.`;
});