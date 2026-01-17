
const Client = require('ssh2-sftp-client');
const fs = require('fs');
const path = require('path');

const sftp = new Client();

// Manual .env parsing
const envPath = path.join(__dirname, '.env');
let env = {};
try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.replace(/\r\n/g, '\n').split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            let key = match[1].trim();
            let value = match[2].trim();
            if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
            env[key] = value;
        }
    });
} catch (e) { }

const config = {
    host: env.FTP_HOST,
    port: parseInt(env.FTP_PORT || '22'),
    username: env.FTP_USER,
    password: env.FTP_PASSWORD,
};

async function run() {
    try {
        console.log('Connecting...');
        await sftp.connect(config);
        console.log('✅ Connected!');

        const cwd = await sftp.cwd();
        console.log(`📂 Current Directory (CWD): ${cwd}`);

        console.log('📄 Listing files in CWD:');
        const list = await sftp.list(cwd);
        console.log(list.map(i => i.name).join(' | '));

        console.log('\n--- Checking common paths ---');
        const pathsToCheck = ['domains', 'public_html', 'www'];
        for (const p of pathsToCheck) {
            const full = path.posix.join(cwd, p); // safe join
            const exists = await sftp.exists(full);
            console.log(`Checking ${full}: ${exists ? 'EXISTS ✅' : 'NOT FOUND ❌'}`);
            if (exists) {
                const subList = await sftp.list(full);
                console.log(`  Contents: ${subList.map(i => i.name).join(' | ')}`);
            }
        }

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await sftp.end();
    }
}

run();
