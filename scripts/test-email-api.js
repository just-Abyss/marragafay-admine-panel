// Native fetch check
if (!globalThis.fetch) {
    console.error("Node version too old for native fetch");
    process.exit(1);
}

async function testEmail() {
    try {
        const response = await fetch('http://localhost:3000/api/send-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: "Debug User",
                package_title: "Debug Package",
                phone_number: "123456789",
                date: "2025-01-01",
                guests: 2,
                total_price: 500,
                status: "pending"
            })
        });

        if (!response.ok) {
            console.log("Response status:", response.status);
            const text = await response.text();
            console.log("Response body:", text);
        } else {
            const data = await response.json();
            console.log("Success:", data);
        }
    } catch (e) {
        console.error("Fetch error:", e);
    }
}

testEmail();
