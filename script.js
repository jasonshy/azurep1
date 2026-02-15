let isScanning = true;

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
    isScanning = false; // Stop processing new codes
    
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
            document.getElementById('status').innerText = "Product Found! Select tag and Submit.";
        } else {
            // Even if not found, we keep isScanning = false so the user can see the "Not Found" message
            document.getElementById('brand').innerText = "N/A";
            document.getElementById('name').innerText = "Not Found in Database";
            document.getElementById('volume').innerText = "-";
            document.getElementById('status').innerText = "Barcode unknown. Press Submit to scan next.";
        }
    } catch (error) {
        document.getElementById('status').innerText = "API Error. Press Submit to try again.";
    }
}

// THE RESET BUTTON (SUBMIT)
document.getElementById('submit-btn').addEventListener('click', function() {
    const activeBtn = document.querySelector('.btn.active');
    const statusEl = document.getElementById('status');
    const productName = document.getElementById('name').innerText;

    // 1. Check if we actually have a product and if a tag is selected
    // We only force a selection if a real product was found
    if (productName !== "-" && productName !== "Not Found in Database" && !activeBtn) {
        statusEl.innerText = "⚠️ PLEASE SELECT A TAG FIRST!";
        statusEl.style.color = "red";
        statusEl.style.fontWeight = "bold";
        return; // Exit function so camera stays paused but doesn't freeze
    }

    // 2. Clear UI (The "Success" path)
    document.getElementById('brand').innerText = "-";
    document.getElementById('name').innerText = "-";
    document.getElementById('volume').innerText = "-";
    document.getElementById('quantity').value = 1;
    document.querySelectorAll('.btn').forEach(btn => btn.classList.remove('active'));

    // 3. Reset Scanner
    isScanning = true;
    document.getElementById('scanner-container').style.opacity = "1";
    statusEl.innerText = "Scanning...";
    statusEl.style.color = "#333"; // Reset color to normal
    statusEl.style.fontWeight = "normal";
    
    Quagga.start(); 
});

// Tag selection logic
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', function() {
        document.querySelectorAll('.btn').forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
    });
});

startScanner();
