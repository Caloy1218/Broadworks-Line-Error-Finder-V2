document.getElementById('fileInput').addEventListener('change', handleFileChange);
document.getElementById('downloadButton').addEventListener('click', downloadAllFiles);

let processedFiles = [];
let existingFileNames = {};

function handleFileChange(e) {
    const files = e.target.files;
    if (files.length > 10) {
        alert("Please select up to 10 files.");
        return;
    }

    processedFiles = [];
    document.getElementById('filesContainer').innerHTML = '';
    document.getElementById('downloadButton').disabled = true;

    Array.from(files).forEach(file => {
        const fileReader = new FileReader();

        const fileContainer = document.createElement('div');
        fileContainer.className = 'file-container';
        fileContainer.innerHTML = `<h3>${file.name}</h3>
                                    <p>Excess Lines: <span id="excessCount-${file.name}">0</span></p>
                                    <p>Lacking Lines: <span id="lackingCount-${file.name}">0</span></p>
                                    <div class="paper">
                                        <h4>Deleted Excess Lines:</h4>
                                        <div id="excessLines-${file.name}"></div>
                                    </div>
                                    <div class="paper">
                                        <h4>Deleted Lacking Lines:</h4>
                                        <div id="lackingLines-${file.name}"></div>
                                    </div>`;
        document.getElementById('filesContainer').appendChild(fileContainer);

        fileReader.onload = function(event) {
            processFileContent(event.target.result, file.name);
        };

        fileReader.onerror = function() {
            alert(`Failed to read file: ${file.name}`);
        };

        fileReader.readAsText(file);
    });
}

function processFileContent(content, fileName) {
    const linesArray = content.split('\n');
    let excessCount = 0;
    let lackingCount = 0;
    const excessLines = [];
    const lackingLines = [];
    const validLines = [];

    linesArray.forEach((line, index) => {
        const trimmedLine = line.trim();
        if (trimmedLine === "") return;

        if (trimmedLine.length > 421) {
            excessCount++;
            excessLines.push(`Line ${index + 1}: ${line}`);
        } else if (trimmedLine.length < 421) {
            lackingCount++;
            lackingLines.push(`Line ${index + 1}: ${line}`);
        } else {
            validLines.push(line);
        }
    });

    // Check if the file is abnormal
    if (excessCount >= 5000 || lackingCount >= 5000) {
        alert(`This file (${fileName}) is abnormal and will be skipped.`);
        return; // Skip processing this file
    }

    document.getElementById(`excessCount-${fileName}`).innerText = excessCount;
    document.getElementById(`lackingCount-${fileName}`).innerText = lackingCount;
    displayLines(excessLines, `excessLines-${fileName}`);
    displayLines(lackingLines, `lackingLines-${fileName}`);

    const processedContent = validLines.join('\n');
    processedFiles.push({ fileName, content: processedContent });

    if (processedFiles.length > 0) {
        document.getElementById('downloadButton').disabled = false;
    }
}


function displayLines(lines, elementId) {
    const element = document.getElementById(elementId);
    element.innerHTML = '';
    lines.forEach(line => {
        const div = document.createElement('div');
        div.textContent = line;
        element.appendChild(div);
    });
}

function downloadAllFiles() {
    processedFiles.forEach(file => {
        createNewFile(file.fileName, file.content);
    });
}

function createNewFile(originalFileName, content) {
    const parts = originalFileName.split('.');
    const baseName = parts.slice(0, -1).join('.');
    const extension = parts[parts.length - 1];

    if (!existingFileNames[baseName]) {
        existingFileNames[baseName] = 0;
    } else {
        existingFileNames[baseName]++;
    }

    const newFileName = `${baseName}.${String(existingFileNames[baseName]).padStart(6, '0')}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = newFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
