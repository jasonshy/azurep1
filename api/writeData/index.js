
const { app, output } = require('@azure/functions');

// 1. Setup the Table Link
const tableOutput = output.table({
    tableName: 'scannedItems',
    connection: 'AzureWebJobsStorage' 
});

// 2. Register the function with the name 'writeData'
app.http('writeData', {   // <--- MAKE SURE THIS SAYS 'writeData'
    methods: ['POST'],
    authLevel: 'anonymous',
    extraOutputs: [tableOutput],
    handler: async (request, context) => {
        try {
            const data = await request.json();

            const entry = {
                PartitionKey: data.category || 'Uncategorized',
                RowKey: Date.now().toString(),
                UPC: data.upc,
                ProductDetails: data.description, // This is your combined string
                Qty: data.quantity,
                UserInitials: data.initials
            };

            context.extraOutputs.set(tableOutput, entry);
            return { status: 201, body: "Saved" };
        } catch (error) {
            return { status: 400, body: error.message };
        }
    }
});

