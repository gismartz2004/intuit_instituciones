async function testGemini() {
    let apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return;
    apiKey = apiKey.replace(/['"]+/g, '').trim();

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
        const response = await fetch(url);
        const data = await response.json();

        if (response.ok) {
            console.log("Modelos encontrados:");
            data.models.forEach(m => console.log(`- ${m.name}`));
        } else {
            console.error("Status:", response.status);
            console.error(data);
        }
    } catch (e) {
        console.error(e);
    }
}
testGemini();
