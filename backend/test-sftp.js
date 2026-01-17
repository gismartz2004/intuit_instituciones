
const Client = require('ssh2-sftp-client');
const fs = require('fs');
const path = require('path');

const sftp = new Client();

// Manual .env parsing with Windows support
const envPath = path.join(__dirname, '.env');
let env = {};
try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    // Normalize line endings to \n then split
    envContent.replace(/\r\n/g, '\n').split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            let key = match[1].trim();
            let value = match[2].trim();
            if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
            if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
            env[key] = value;
        }
    });
} catch (e) {
    console.error("Could not read .env file");
    process.exit(1);
}

const config = {
    host: env.FTP_HOST,
    port: parseInt(env.FTP_PORT || '22'),
    username: env.FTP_USER,
    password: env.FTP_PASSWORD,
};

async function run() {
    try {
        console.log('Connecting with config:');
        console.log(`Host: ${config.host}`);
        console.log(`Port: ${config.port}`);
        console.log(`User: ${config.username}`);
        // console.log(`Password: ${config.password}`); // Checking if loaded
        console.log(`Remote Path: ${env.FTP_REMOTE_PATH}`);

        if (!config.host || !config.password) {
            throw new Error("Missing FTP_HOST or FTP_PASSWORD in .env");
        }

        await sftp.connect(config);
        console.log('✅ Connection successful!');

        const remotePath = env.FTP_REMOTE_PATH;

        // 1. Check if directory exists
        const exists = await sftp.exists(remotePath);
        if (!exists) {
            console.log(`⚠️ Remote path '${remotePath}' does not exist. Attempting to create it...`);
            try {
                await sftp.mkdir(remotePath, true);
                console.log(`✅ Directory created.`);
            } catch (mkErr) {
                console.error(`❌ Failed to create directory: ${mkErr.message}`);
                console.log("Listing parent directory to help debug:");
                try {
                    // Try to list parent
                    const parent = path.dirname(remotePath).replace(/\\/g, '/'); // ensure forward slashes for sftp
                    const list = await sftp.list(parent);
                    console.log(list.map(i => i.name).join(', '));
                } catch (e) { }
                return; // Stop here if we can't create dir
            }
        } else {
            console.log(`✅ Remote directory exists.`);
        }

        // 2. Test Upload
        const testFileName = 'test-upload-' + Date.now() + '.txt';
        const buffer = Buffer.from('Testing SFTP Upload from GeniosBot App');

        console.log(`Uploading test file: ${testFileName}...`);
        await sftp.put(buffer, `${remotePath}/${testFileName}`);
        console.log(`✅ Upload successful!`);

        // 3. Verify Public URL
        console.log(`\n🎉 VERIFICATION COMPLETE`);
        console.log(`If configured correctly, you should see the file at:`);
        console.log(`${env.FTP_PUBLIC_URL}/${testFileName}`);

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await sftp.end();
    }
}

run();
