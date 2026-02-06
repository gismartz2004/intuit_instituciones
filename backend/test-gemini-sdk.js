const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testGemini() {
    let apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "your_gemini_api_key_here") {
        console.error("❌ GEMINI_API_KEY no configurada en .env");
        return;
    }

    apiKey = apiKey.replace(/['"]+/g, '').trim();

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = "Di 'Conexión Exitosa' si puedes recibir este mensaje.";
        const result = await model.generateContent(prompt);
        const response = await result.response;

        console.log("✅ Conexión con SDK Exitosa!");
        console.log("Respuesta:", response.text());
    } catch (error) {
        console.error("❌ Error en el SDK:");
        console.error(error.message);
    }
}

testGemini();
