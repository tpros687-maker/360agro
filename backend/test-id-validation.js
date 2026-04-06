// Using a simple file to test without complex imports if possible, or ensuring ESM
// Since we are in an ESM project, we should use import correctly.

const testInvalidId = async () => {
    try {
        const url = 'http://localhost:5000/api/proveedores/undefined';
        console.log(`Testing PUT ${url}...`);

        // Note: Node 18+ has fetch built-in
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': 'Bearer invalid_token',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nombre: "Test" })
        });

        console.log(`Status: ${response.status}`);
        const data = await response.json();
        console.log(`Data:`, data);
    } catch (error) {
        console.log(`Error: ${error.message}`);
    }
};

testInvalidId();
