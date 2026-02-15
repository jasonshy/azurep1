let isScanning = true;
let selectedCategory = "None"; // Track category

function startScanner() {
    Quagga.init({
        inputStream: {
            name: "Live",
            type: "LiveStream",
            target: document.querySelector('#scanner-container'),
            constraints: { facingMode: "environment" },
        },
        decoder: { readers: ["ean_reader", "ean_8_reader", "upc_reader"] }
    }, function (err) {
        if (err) {
            document.getElementById('status').innerText = "Camera Error";
            return;
        }
        Quagga.start();
    });
}

Quagga.onDetected(function (data) {
    if (!isScanning) return; 

    const code = data.codeResult.code;
    isScanning = false; 
    document.getElementById('display-upc').innerText = code;
    document.getElementById('scanner-container').style.opacity = "0.5";
    document.getElementById('status').innerText = `Scanned: ${code}`;
    
    fetchProductData(code);
});

async function fetchProductData(barcode) {
    const url = `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`;
    // Always ensure the UPC is ready for the payload
    document.getElementById('display-upc').innerText = barcode;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.status === 1) {
            const product = data.product;
            document.getElementById('brand').innerText = product.brands || "Unknown Brand";
            document.getElementById('name').innerText = product.product_name || "Unknown Name";
            document.getElementById('volume').innerText = product.quantity || "Not specified";
            document.getElementById('status').innerText = "Product Found! Select tag and Submit.";
        } else {
            document.getElementById('brand').innerText = "Unknown Brand";
            document.getElementById('name').innerText = "Manual Entry/Unknown";
            document.getElementById('volume').innerText = "N/A";
            document.getElementById('status').innerText = "Not in DB, but you can still Submit!";
        }
    } catch (error) {
        document.getElementById('status').innerText = "API Error. You can still try to Submit.";
    }
}

async function sendToAzure() {
    const brand = document.getElementById('brand').innerText;
    const name = document.getElementById('name').innerText;
    const volume = document.getElementById('volume').innerText;
    const combinedDescription = `${brand} | ${name} | ${volume}`;

    const payload = {
        upc: document.getElementById('display-upc').innerText,
        description: combinedDescription,
        quantity: document.getElementById('quantity').value,
        initials: "JY",
        category: selectedCategory 
    };

    try {
        // Change this URL to your Azure URL when you deploy!
        await fetch("http://localhost:7071/api/writeData", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        console.log("Data sent to Azure.");
    } catch (error) {
        console.error("Save failed:", error);
        alert("Failed to save to Azure. Check connection.");
    }
}

// THE RESET & SUBMIT BUTTON
document.getElementById('submit-btn').addEventListener('click', async function() {
    const statusEl = document.getElementById('status');
    const upcValue = document.getElementById('display-upc').innerText;

    // 1. Validation: Still check if a category is selected at least once
    if (upcValue === "-" || upcValue === "" || selectedCategory === "None") {
        statusEl.innerText = "⚠️ MUST SCAN AND SELECT CATEGORY!";
        statusEl.style.color = "red";
        return; 
    }

    // 2. TRIGGER THE SAVE
    statusEl.innerText = "Saving...";
    await sendToAzure(); 

    // 3. Clear PRODUCT UI only (Leave the button alone!)
    document.getElementById('display-upc').innerText = "-";
    document.getElementById('brand').innerText = "-";
    document.getElementById('name').innerText = "-";
    document.getElementById('volume').innerText = "-";
    document.getElementById('quantity').value = 1;
    
    // REMOVED: document.querySelectorAll('.btn').forEach(btn => btn.classList.remove('active'));
    // REMOVED: selectedCategory = "None";
    // This allows the last selected button to "stay" active for the next scan.

    // 4. Reset Scanner
    isScanning = true;
    document.getElementById('scanner-container').style.opacity = "1";
    statusEl.innerText = `Saved! Ready for next ${selectedCategory} item...`;
    statusEl.style.color = "green";
    Quagga.start(); 
});


// THE CANCEL BUTTON (Clean Slate)
document.getElementById('cancel-btn').addEventListener('click', function() {
    const statusEl = document.getElementById('status');

    // 1. Clear PRODUCT UI
    document.getElementById('display-upc').innerText = "-";
    document.getElementById('brand').innerText = "-";
    document.getElementById('name').innerText = "-";
    document.getElementById('volume').innerText = "-";
    
    // 2. Reset Quantity to 1
    document.getElementById('quantity').value = 1;

    // 3. Reset Scanner
    isScanning = true;
    document.getElementById('scanner-container').style.opacity = "1";
    statusEl.innerText = "Scan cancelled. Ready again...";
    statusEl.style.color = "#333";
    
    Quagga.start(); 
    console.log("Entry discarded by user.");
});

// TAG SELECTION LOGIC
// This handles the "keeping it selected" behavior
document.querySelectorAll('.btn-reclamation, .btn-waste').forEach(button => {
    button.addEventListener('click', function() {
        // Remove 'active' from all buttons in the group
        document.querySelectorAll('.btn-reclamation, .btn-waste').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Add 'active' to the one just clicked
        this.classList.add('active');
        
        // Update our variable (using trim to avoid hidden spaces)
        selectedCategory = this.innerText.trim(); 
        
        // Update status to show user it's selected
        document.getElementById('status').innerText = "Category: " + selectedCategory;
        document.getElementById('status').style.color = "green";
    });
});
