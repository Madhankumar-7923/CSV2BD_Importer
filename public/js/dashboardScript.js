/*SHOW OPTION MENU*/
const profileIcon = document.querySelector('.profileIcon');
const optionHover = document.querySelector('.optionHover');

profileIcon.addEventListener('click', (event) => {
    event.stopPropagation();
    optionHover.classList.toggle('show');
});

// Hide optionHover when clicking anywhere else on the document
document.addEventListener('click', (event) => {
    if (!profileIcon.contains(event.target) && !optionHover.contains(event.target)) {
        optionHover.classList.remove('show');
    }
});

/*FILE NAME*/
var loader = function (e) {
    let file = e.target.files;
    let show = "<span> <i class='bx bxs-file'></i> Imported File: </span>" + " " + file[0].name;

    let p = document.createElement('p');
    p.innerHTML = show;
    p.classList.add("fileImpName")

    let outputContainer = document.querySelector(".fileImp");
    outputContainer.innerHTML = "";
    outputContainer.appendChild(p);
    outputContainer.classList.add("active");
};

let fileInpt = document.getElementById("file");
fileInpt.addEventListener("change", loader);

/*ERROR FETCH API*/
// No file selection error by form
const submitButton = document.getElementById("importForm");

submitButton.addEventListener("submit", async function (event) {
    event.preventDefault();

    const fileInput = document.getElementById("file");
    const errorLine = document.getElementById("errorLine");
    errorLine.textContent = "";
    const maxSize = 2 * 1024 * 1024; // 2 MB

    if (!fileInput.files[0]) {
        errorLine.textContent = "No file Selected.";
        errorLine.classList.add("active3");
        return;
    }

    if (fileInput.files[0].size > maxSize) {
        errorLine.textContent = "File Size must be less than 50MB.";
        errorLine.classList.add("active3");
        return;
    }

    const formData = new FormData(this);

    try {
        const response = await fetch("/upload", {
            method: "POST",
            body: formData
        });

        //Parse the JSON response
        if (response.ok) {
            const data = await response.json();

            //Redirect to the success page with the necessary query parameters
            if (data.success) {
                const successUrl = `${data.redirectUrl}?icon=${encodeURIComponent(data.icon)}&message=${encodeURIComponent(data.message)}&output=${encodeURIComponent(data.output)}`;
                window.location.href = successUrl;
            }

            else {
                const failedUrl = `${data.redirectUrl}?icon=${encodeURIComponent(data.icon)}&message=${encodeURIComponent(data.message)}&output=${encodeURIComponent(data.output)}`;
                window.location.href = failedUrl;
            }

        }

        //If the response is not OK, display the error message
        else {
            const errorText = await response.text();
            errorLine.classList.add("active3");
            errorLine.textContent = errorText;
        }

    }

    catch (err) {
        errorLine.textContent = "Error importing file, try again!";
    }

});

// Error line reset when file selected
const fileInput = document.getElementById("file");

fileInput.addEventListener('change', function (e) {
    const file = e.target.files[0];

    if (file) {
        const p = document.createElement("p");
        p.textContent = "";
        const errorDiv = document.querySelector(".errorLine");
        errorDiv.classList.remove("active3");
    }
});

/*Preview TABLE*/
//fetching data from csv
const fileCSV = document.getElementById("file");

fileCSV.addEventListener('change', function (e) {
    const file = e.target.files[0];

    if (file) {
        Papa.parse(file, {
            header: true,
            complete: function (results) {
                const data = results.data.slice(0, 3);
                previewCSVTable(data);
            }
        });
    }

});

//assigning data to the table
function previewCSVTable(data) {
    const tableDiv = document.querySelector(".fileTable");
    tableDiv.innerHTML = "";

    const tablePreviewDiv = document.createElement('div'); //first div
    tablePreviewDiv.className = 'tablePreview';
    tablePreviewDiv.textContent = 'TABLE PREVIEW';
    tableDiv.appendChild(tablePreviewDiv);

    const dataTableDiv = document.createElement('div'); //second div
    dataTableDiv.className = 'dataTableDiv';

    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');

    //create table headers
    const headerRow = document.createElement('tr');
    const headers = Object.keys(data[0]);
    headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header.toUpperCase();
        headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);

    //create table body
    data.forEach(row => {
        const tr = document.createElement('tr');
        headers.forEach(header => {
            const td = document.createElement('td');
            td.textContent = row[header];
            tr.appendChild(td);
        });

        tbody.appendChild(tr);
    });

    table.appendChild(thead);
    table.appendChild(tbody);
    dataTableDiv.appendChild(table);
    tableDiv.appendChild(dataTableDiv);

    tableDiv.classList.add("active2");
};

/*RESET BUTTON*/
const resetButton = document.getElementById("resetButton");

resetButton.addEventListener("click", function () {
    //error line
    const errorLine = document.getElementById("errorLine");
    errorLine.textContent = "";
    errorLine.classList.remove("active3");

    //file name
    let outputContainer = document.querySelector(".fileImp");
    outputContainer.innerHTML = "";
    outputContainer.classList.remove("active");

    //table preview
    const tableDiv = document.querySelector(".fileTable");
    tableDiv.innerHTML = "";
    tableDiv.classList.remove("active2");
});