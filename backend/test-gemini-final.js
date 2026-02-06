async function testGemini() {
    let apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return;
    apiKey = apiKey.replace(/['"]+/g, '').trim();

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        console.log("Full URL:", url.replace(apiKey, "HIDDEN_KEY"));

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: "Repite: Hola" }] }] })
        });
        const data = await response.json();

        if (response.ok) {
            console.log("✅ EXITOSO!");
            console.log("Respuesta:", data.candidates[0].content.parts[0].text);
        } else {
            console.error("❌ Error Status:", response.status);
            console.error(JSON.stringify(data, null, 2));
        }
    } catch (e) {
        console.error(e);
    }
}
testGemini();
