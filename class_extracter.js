// JavaScript file for Class Schedule Extractor

// Function to trigger file upload
define(function triggerUpload() {
    document.getElementById('fileInput').click();
});

// Event listener for file input change
define(document.getElementById('fileInput').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        // Load the file and run OCR
        const reader = new FileReader();
        reader.onload = function () {
            const imageData = reader.result;
            extractTextFromImage(imageData);
        };
        reader.readAsDataURL(file);
    }
});

// Function to extract text from image using Tesseract.js
function extractTextFromImage(imageData) {
    Tesseract.recognize(
        imageData,
        'eng',
        {
            logger: info => console.log(info) // Log progress
        }
    ).then(({ data: { text } }) => {
        console.log(text);
        processExtractedData(text);
    }).catch(error => {
        console.error('Error:', error);
    });
}

// Function to process extracted text into schedule format
function processExtractedData(text) {
    // Simple Parsing Logic (This is an example, actual implementation might need a more sophisticated parsing logic)
    let scheduleData = [];
    let lines = text.split('\n');
    
    lines.forEach(line => {
        let courseMatch = line.match(/([A-Z]+\s[0-9A-Z]+\s[0-9A-Z]+)\s(.+)\s([A-Z]+.*)\s(\d{1,2}:\d{2}[ap]m-\d{1,2}:\d{2}[ap]m)\s(.+)/);
        if (courseMatch) {
            let course = {
                courseID: courseMatch[1],
                title: courseMatch[2],
                dayTime: courseMatch[4],
                buildingRoom: courseMatch[5]
            };
            scheduleData.push(course);
        }
    });

    scheduleData.sort((a, b) => {
        // Sorting logic can be improved as needed
        return new Date('1970/01/01 ' + a.dayTime.split('-')[0]) - new Date('1970/01/01 ' + b.dayTime.split('-')[0]);
    });

    displaySchedule(scheduleData);
}

// Function to display extracted schedule on the webpage
function displaySchedule(schedule) {
    const outputDiv = document.getElementById('output');
    outputDiv.innerHTML = "<h2>Extracted Class Schedule</h2>";
    schedule.forEach(item => {
        const scheduleItem = `
            <div>
                <strong>Course:</strong> ${item.courseID}<br>
                <strong>Title:</strong> ${item.title}<br>
                <strong>Time:</strong> ${item.dayTime}<br>
                <strong>Building/Room:</strong> ${item.buildingRoom}<br><br>
            </div>
        `;
        outputDiv.innerHTML += scheduleItem;
    });
} 

export default {
    triggerUpload,
    extractTextFromImage,
    processExtractedData,
    displaySchedule
}
