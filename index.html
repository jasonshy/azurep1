// Initialize QuaggaJS
Quagga.init({
    inputStream: {
        name: "Live",
        type: "LiveStream",
        target: document.querySelector('#scanner-container'),
        constraints: {
            facingMode: "environment" // Use back camera
        },
    },
    decoder: {
        readers: ["ean_reader", "ean_8_reader", "upc_reader"]
    }
}, function (err) {
    if (err) {
        console.error(err);
        document.getElementById('status').innerText = "Camera Error";
        return;
    }
    Quagga.start();
});

// Logic when a barcode is detected
Quagga.onDetected(function (data) {
    const code = data.codeResult.code;
    document.getElementById('status').innerText = `Scanned: ${code}`;
    Quagga.stop(); // Stop scanning while we fetch
    fetchProductData(code);
});

// MAIN FUNCTION: Fetch data and handle UI
// The fetch function now handles the UI update
async function fetchProductData(barcode) {
    const url = `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`;
    
    // Reset buttons for the new item
    document.querySelectorAll('.btn').forEach(btn => btn.classList.remove('active'));

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.status === 1) {
            const product = data.product;
            document.getElementById('brand').innerText = product.brands || "Unknown Brand";
            document.getElementById('name').innerText = product.product_name || "Unknown Name";
            document.getElementById('volume').innerText = product.quantity || "Not specified";
            document.getElementById('quantity').value = 1; 
            document.getElementById('status').innerText = "Product Found!";
        } else {
            document.getElementById('status').innerText = "Product not found.";
            // If not found, we should probably restart the camera immediately
            setTimeout(() => Quagga.start(), 2000);
        }
    } catch (error) {
        document.getElementById('status').innerText = "Error fetching data.";
        setTimeout(() => Quagga.start(), 2000);
    }
    
    // NOTE: Removed the automatic Quagga.start() timeout from here 
    // because we want the SUBMIT button to handle it now.
}


// SUBMIT BUTTON LOGIC
document.getElementById('submit-btn').addEventListener('click', function() {
    const brand = document.getElementById('brand').innerText;
    const name = document.getElementById('name').innerText;
    const activeBtn = document.querySelector('.btn.active');
    
    if (!activeBtn) {
        alert("Please select Reclamation or Waste first!");
        return;
    }

    // 1. Logic to gather data (your database part)
    console.log("Saving...", { name, brand, tag: activeBtn.innerText });

    // 2. Visual Feedback: Clear the info so you know it's sent
    document.getElementById('brand').innerText = "-";
    document.getElementById('name').innerText = "-";
    document.getElementById('volume').innerText = "-";
    document.getElementById('quantity').value = 1;
    document.querySelectorAll('.btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById('status').innerText = "Scanning...";

    // 3. RE-ACTIVATE CAMERA
    Quagga.start();
});

// BUTTON SELECTION LOGIC
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', function() {
        // Remove active class from all
        document.querySelectorAll('.btn').forEach(btn => btn.classList.remove('active'));
        // Add active class to clicked
        this.classList.add('active');
        
        console.log("Selected Tag:", this.innerText);
    });
});


