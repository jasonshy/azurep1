let isScanning = true; // Toggle to prevent multiple scans of the same item

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

// Logic when a barcode is detected
Quagga.onDetected(function (data) {
    if (!isScanning) return; // Skip if we are currently editing an item

    const code = data.codeResult.code;
    isScanning = false; // "Pause" scanning logic
    
    // Visual cue that scan is paused
    document.getElementById('scanner-container').style.opacity = "0.5";
    document.getElementById('status').innerText = `Scanned: ${code}`;
    
    fetchProductData(code);
});

async function fetchProductData(barcode) {
    const url = `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`;
    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.status === 1) {
            const product = data.product;
            document.getElementById('brand').innerText = product.brands || "Unknown Brand";
            document.getElementById('name').innerText = product.product_name || "Unknown Name";
            document.getElementById('volume').innerText = product.quantity || "Not specified";
            document.getElementById('status').innerText = "Product Found! Edit & Submit.";
        } else {
            document.getElementById('status').innerText = "Not found. Try again.";
            resumeScanning(); // Restart if nothing found
        }
    } catch (error) {
        document.getElementById('status').innerText = "API Error.";
        resumeScanning();
    }
}

// Function to turn scanning back on
function resumeScanning() {
    isScanning = true;
    document.getElementById('scanner-container').style.opacity = "1";
    document.getElementById('status').innerText = "Scanning...";
}

// SUBMIT BUTTON
document.getElementById('submit-btn').addEventListener('click', function() {
    const activeBtn = document.querySelector('.btn.active');
    if (!activeBtn) {
        alert("Please select Reclamation or Waste!");
        return;
    }

    // 1. (Your Database Logic Here)
    console.log("Submitted successfully");

    // 2. Clear UI
    document.getElementById('brand').innerText = "-";
    document.getElementById('name').innerText = "-";
    document.getElementById('volume').innerText = "-";
    document.getElementById('quantity').value = 1;
    document.querySelectorAll('.btn').forEach(btn => btn.classList.remove('active'));

    // 3. Resume the scan logic without restarting the hardware
    resumeScanning();
});

// Button Selection Logic
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', function() {
        document.querySelectorAll('.btn').forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
    });
});

// Start for the first time
startScanner();
