async function updateUI() {
    const fd = document.getElementById('f-date').value;
    
    // Ambil data baru dari IndexedDB
    let rawData = await localforage.getItem('lapdok_history');
    let data = [];
    if (typeof rawData === 'string') {
        try { data = JSON.parse(rawData); } catch(e) { data = []; }
    } else if (Array.isArray(rawData)) {
        data = rawData;
    }

    // Ambil data warisan (legacy) dari localStorage HANYA UNTUK DITAMPILKAN
    let legacyData = [];
    const oldHistory = localStorage.getItem('lapdok_history');
    if (oldHistory) {
        try {
            const parsedOld = JSON.parse(oldHistory);
            if (Array.isArray(parsedOld)) legacyData = parsedOld;
        } catch(e) {}
    }

    // Gabungkan keduanya sementara untuk UI (Mencegah duplikat ID)
    const currentIds = data.map(h => h.id);
    const uniqueLegacy = legacyData.filter(h => !currentIds.includes(h.id));
    let combinedData = [...data, ...uniqueLegacy];

    // Perbaikan filter tanggal khusus Mobile yang menangkap "string kosong" salah deteksi
    if(fd && fd.trim() !== '') {
        combinedData = combinedData.filter(h => h.date === fd);
    }
    
    combinedData.sort((a,b) => b.id - a.id);

    const listDiv = document.getElementById('history-list');
    let html = '';
    
    combinedData.forEach((h, index) => {
        const firstItem = h.data[0] || {};
        const thumb = firstItem.p3 || firstItem.p2 || firstItem.p1 || null;
        
        const itemsList = h.data.map((item, idx) => `
            <div class="preview-item-row">
                <strong>#${idx + 1}</strong>: ${item.desc || 'Tanpa keterangan'}
            </div>
        `).join('');

        html += `
        <div class="report-card-wrapper">
            <input type="checkbox" class="report-cb" value="${h.id}" onchange="updateBtn()" style="width:22px; height:22px; flex-shrink: 0;">
            <div class="report-card-preview" onclick="restoreToEditor(${h.id})">
                <button class="btn-del" onclick="deleteItem(event, ${h.id})">Hapus</button>
                <div class="report-card-content">
                    <div class="report-thumb">
                        ${thumb ? `<img src="${thumb}">` : `<div class="no-thumb">🖼️</div>`}
                    </div>
                    <div class="report-details">
                        <div class="report-title">📅 ${h.timestamp}</div>
                        <div class="report-items-preview">
                            ${itemsList}
                        </div>
                    </div>
                </div>
            </div>
        </div>`;

        // Sisipkan IKLAN IN-FEED setiap 5 item
        if ((index + 1) % 5 === 0) {
            html += `
            <div class="ad-infeed-wrapper" style="margin: 15px 0; background: #fff; border-radius: 8px; overflow: hidden; border: 1px dashed #ccc;">
                <ins class="adsbygoogle"
                     style="display:block"
                     data-ad-format="fluid"
                     data-ad-layout-key="-fb+5w+4e-db+86"
                     data-ad-client="ca-pub-2642522351768171"
                     data-ad-slot="7918954512"></ins>
                <script>
                     (adsbygoogle = window.adsbygoogle || []).push({});
                </script>
            </div>`;
        }
    });

    listDiv.innerHTML = html || '<div style="text-align:center; padding:20px; opacity:0.5;">Belum ada riwayat laporan.</div>';
    updateBtn();
}

function updateBtn() {
    const count = document.querySelectorAll('.report-cb:checked').length;
    const printBtn = document.getElementById('print-btn');
    const waBtn = document.getElementById('wa-btn');
    
    const wasDisabled = printBtn.disabled;
    printBtn.disabled = count === 0;
    waBtn.disabled = count === 0;
    
    printBtn.innerText = `🖨️ Cetak Terpilih (${count})`;
    waBtn.innerText = `💾 Download File (PDF) (${count})`;
    
    if (wasDisabled && count > 0) {
        Jarvis.pandu('siap_cetak');
    }
}

async function prepareContent() {
    const selectedIds = Array.from(document.querySelectorAll('.report-cb:checked')).map(cb => parseFloat(cb.value));
    
    const rawData = await localforage.getItem('lapdok_history');
    let dbHistory = Array.isArray(rawData) ? rawData : (typeof rawData === 'string' ? JSON.parse(rawData || '[]') : []);
    
    let legacyData = [];
    const oldHistory = localStorage.getItem('lapdok_history');
    if (oldHistory) try { legacyData = JSON.parse(oldHistory); if(!Array.isArray(legacyData)) legacyData = []; } catch(e){}

    const currentIds = dbHistory.map(h => h.id);
    const uniqueLegacy = legacyData.filter(h => !currentIds.includes(h.id));
    const combinedHistory = [...dbHistory, ...uniqueLegacy];

    const reports = combinedHistory.filter(h => selectedIds.includes(h.id));
    const target = document.getElementById('print-content-target');
    target.innerHTML = '';
    
    let allItems = [];
    reports.forEach(r => r.data.forEach(d => allItems.push(d)));
    allItems.sort((a, b) => new Date(a.workDate) - new Date(b.workDate));

    const itemsPerPage = 3; // Kunci: 3 item per halaman
    const totalPages = Math.ceil(allItems.length / itemsPerPage);
    
    for (let i = 0; i < allItems.length; i += itemsPerPage) {
        const page = document.createElement('div');
        page.className = 'page-container';
        const chunk = allItems.slice(i, i + itemsPerPage);
        
        let html = `
            <div class="print-main-header">
                <h1>DOKUMENTASI LAPORAN KINERJA</h1>
            </div>`;
        
        chunk.forEach((item, idx) => {
            html += `
            <div class="print-job-item">
                <div class="print-meta-location"><strong>LOKASI:</strong> ${item.addr}</div>
                <div class="print-grid">
                    <div class="print-col">
                        <div class="print-lbl">SEBELUM</div>
                        <div class="print-img-box">${item.p1 ? `<img src="${item.p1}">` : 'No Photo'}</div>
                    </div>
                    <div class="print-col">
                        <div class="print-lbl">PROSES</div>
                        <div class="print-img-box">${item.p2 ? `<img src="${item.p2}">` : 'No Photo'}</div>
                    </div>
                    <div class="print-col">
                        <div class="print-lbl">SESUDAH</div>
                        <div class="print-img-box">${item.p3 ? `<img src="${item.p3}">` : 'No Photo'}</div>
                    </div>
                </div>
                <div class="print-desc"><strong>KETERANGAN:</strong> ${item.desc}</div>
            </div>`;
        });
        html += `<div class="print-footer-page">Halaman ${Math.floor(i/itemsPerPage) + 1} dari ${totalPages}</div>`;
        page.innerHTML = html;
        target.appendChild(page);
    }
}

async function triggerPrint() { await prepareContent(); setTimeout(window.print, 500); }

/**
 * Alur Baru: Simpan ID terpilih dan alihkan ke halaman Preview khusus PDF
 */
function triggerPDF() {
    const selectedIds = Array.from(document.querySelectorAll('.report-cb:checked')).map(cb => parseFloat(cb.value));
    
    if (selectedIds.length === 0) {
        Jarvis.pandu('pilih_data_dulu');
        return;
    }

    // Simpan data terpilih ke session agar bisa dibaca halaman preview
    sessionStorage.setItem('selected_print_ids', JSON.stringify(selectedIds));
    
    Jarvis.pandu('memproses_pdf');
    
    // Alihkan ke halaman pratinjau khusus
    window.location.href = "print-preview.html";
}

async function restoreToEditor(id) {
    const rawData = await localforage.getItem('lapdok_history');
    let dbHistory = Array.isArray(rawData) ? rawData : (typeof rawData === 'string' ? JSON.parse(rawData || '[]') : []);
    
    let legacyData = [];
    const oldHistory = localStorage.getItem('lapdok_history');
    if (oldHistory) try { legacyData = JSON.parse(oldHistory); if(!Array.isArray(legacyData)) legacyData = []; } catch(e){}

    const combinedHistory = [...dbHistory, ...legacyData];
    const entry = combinedHistory.find(h => h.id === id);
    
    if (entry) {
        await localforage.setItem('lapdok_draft', entry.data);
        await localforage.setItem('lapdok_edit_context', id);
        window.location.href = "form.html";
    }
}

async function deleteItem(e, id) { 
    e.stopPropagation(); 
    if(confirm("Hapus laporan?")) { 
        let h = await localforage.getItem('lapdok_history') || []; 
        await localforage.setItem('lapdok_history', h.filter(x=>x.id!==id)); 
        await updateUI(); 
        Jarvis.pandu('hapus');
    } 
}

// Gunakan DOMContentLoaded agar lebih cepat muncul dibanding window.onload
document.addEventListener('DOMContentLoaded', async () => {
    console.log("PDF Engine Loaded. Checking database...");
    // Migrasi otomatis ke database dimatikan permanen berdasarkan request pengguna.
    // Data lama hanya akan di-render sebagai penggabungan visual di UI saja.
    
    const checkDataRaw = await localforage.getItem('lapdok_history');
    let checkData = [];
    if (typeof checkDataRaw === 'string') {
        try { checkData = JSON.parse(checkDataRaw); } catch(e) {}
    } else if (Array.isArray(checkDataRaw)) {
        checkData = checkDataRaw;
    }
    console.log("IndexedDB History found:", checkData.length, "records");
    
    await updateUI();
    setTimeout(() => {
        if (document.querySelectorAll('.report-cb').length > 0) {
            Jarvis.pandu('pilih_cetak');
        }
    }, 500);
});

function debugStorage() {
    let keys = [];
    for(let i=0; i<localStorage.length; i++) {
        keys.push(localStorage.key(i));
    }
    const history = localStorage.getItem('lapdok_history');
    let size = history ? history.length : 0;
    alert("Keys in localStorage: " + keys.join(", ") + "\nlapdok_history size: " + size);
}

async function exportData() {
    try {
        const history = await localforage.getItem('lapdok_history') || [];
        if (history.length === 0) return alert("Tidak ada data untuk diekspor.");
        
        const dataStr = JSON.stringify(history);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `LapDok_Backup_${new Date().toISOString().slice(0, 10)}.json`;
        
        let linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        Jarvis.pandu('selesai');
    } catch(e) {
        alert("Gagal mengekspor data.");
        console.error(e);
    }
}

async function importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const importedData = JSON.parse(e.target.result);
            if (!Array.isArray(importedData)) throw new Error("Format tidak valid.");
            
            const currentHistoryRaw = await localforage.getItem('lapdok_history');
            let currentHistory = [];
            if (typeof currentHistoryRaw === 'string') {
                try { currentHistory = JSON.parse(currentHistoryRaw); } catch(err) {}
            } else if (Array.isArray(currentHistoryRaw)) {
                currentHistory = currentHistoryRaw;
            }

            // Gabungkan tanpa duplikat ID
            const currentIds = currentHistory.map(h => h.id);
            const dataToMigrate = importedData.filter(h => !currentIds.includes(h.id));
            
            if (dataToMigrate.length > 0) {
                await localforage.setItem('lapdok_history', [...currentHistory, ...dataToMigrate]);
                alert(`Berhasil memulihkan ${dataToMigrate.length} laporan baru!`);
                await updateUI();
            } else {
                alert("Semua data dalam file backup ini sudah ada di dalam aplikasi.");
            }
        } catch (err) {
            alert("File backup tidak valid atau rusak.");
            console.error(err);
        }
        // Bersihkan input file
        document.getElementById('import-file').value = '';
    };
    reader.readAsText(file);
}
