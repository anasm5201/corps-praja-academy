// check-ammo.js
const fs = require('fs');
const path = require('path');

const unitsToCheck = [7, 9, 11, 18, 19, 21, 26, 27, 28]; // Unit yang bermasalah
const dir = path.join(__dirname, 'data', 'speed-drill-source');

console.log("🔍 MEMULAI INSPEKSI AMUNISI...\n");

unitsToCheck.forEach(id => {
    const filename = `unit-${id}.json`;
    const filePath = path.join(dir, filename);

    if (!fs.existsSync(filePath)) {
        console.log(`❌ Unit ${id}: FILE TIDAK DITEMUKAN!`);
        return;
    }

    try {
        const rawData = fs.readFileSync(filePath, 'utf8');
        JSON.parse(rawData); // Coba baca
        console.log(`✅ Unit ${id}: VALID (Struktur Aman)`);
    } catch (error) {
        console.log(`⚠️  Unit ${id}: ERROR SINTAKS!`);
        console.log(`   Penyebab: ${error.message}`);
        // Tampilkan sedikit petunjuk posisi error jika ada
        const match = error.message.match(/position (\d+)/);
        if (match) {
            const pos = parseInt(match[1]);
            const snippet = fs.readFileSync(filePath, 'utf8').substring(pos - 20, pos + 20);
            console.log(`   Di sekitar teks: "...${snippet.replace(/\n/g, ' ')}..."`);
        }
        console.log("---------------------------------------------------");
    }
});