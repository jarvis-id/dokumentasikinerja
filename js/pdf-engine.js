async function updateUI() {
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

    // Filter tanggal dihapus berdasarkan request pengguna (Tampilkan semua)
    
    // Urutan: Terbaru di Atas (Newest First) sesuai koreksi pengguna
    combinedData.sort((a,b) => b.id - a.id);

    const listDiv = document.getElementById('history-list');
    let html = '';
    
    combinedData.forEach((h, index) => {
        let thumb = null;
        let itemsList = '';
        let reportTitle = `📅 ${h.timestamp}`;
        let clickAction = `restoreToEditor(${h.id})`;

        if (h.type === 'lembur') {
            const dataArray = Array.isArray(h.data) ? h.data : [];
            const firstItem = dataArray[0] || {};
            
            // Handle legacy lembur data (single file)
            if (h.fileData && dataArray.length === 0) {
                thumb = h.fileData.startsWith('data:image') ? h.fileData : null;
                itemsList = `
                    <div class="preview-item-row">
                        <strong>FILE:</strong> ${h.fileName || 'Laporan'}
                    </div>
                    <div class="preview-item-row">
                        <strong>KET:</strong> ${h.keterangan || '-'}
                    </div>
                `;
                clickAction = `viewLembur(${h.id})`;
            } else {
                thumb = firstItem.p3 || firstItem.p2 || firstItem.p1 || null;
                itemsList = dataArray.map((item, idx) => `
                    <div class="preview-item-row">
                        <strong>LEM #${idx + 1}</strong>: ${item.desc || 'Tanpa keterangan'}
                        <br><small style="color: #d35400;">🕒 ${item.timeStart || '--:--'} s/d ${item.timeEnd || '--:--'}</small>
                    </div>
                `).join('');
                clickAction = `restoreToEditor(${h.id}, 'lembur')`;
            }
            reportTitle = `🕒 ${h.monthLabel || 'Laporan Lembur'}`;
        } else {
            const dataArray = Array.isArray(h.data) ? h.data : [];
            const firstItem = dataArray[0] || {};
            thumb = firstItem.p3 || firstItem.p2 || firstItem.p1 || null;
            
            itemsList = dataArray.map((item, idx) => `
                <div class="preview-item-row">
                    <strong>#${idx + 1}</strong>: ${item.desc || 'Tanpa keterangan'}
                </div>
            `).join('');
        }

        html += `
        <div class="report-card-wrapper">
            <input type="checkbox" class="report-cb" value="${h.id}" onchange="updateBtn()" style="width:22px; height:22px; flex-shrink: 0;">
            <div class="report-card-preview" onclick="${clickAction}">
                <button class="btn-del" onclick="deleteItem(event, ${h.id})">Hapus</button>
                <div class="report-card-content">
                    <div class="report-thumb">
                        ${thumb ? `<img src="${thumb}">` : (h.type === 'lembur' ? `<div class="no-thumb">📄</div>` : `<div class="no-thumb">🖼️</div>`)}
                    </div>
                    <div class="report-details">
                        <div class="report-title">${reportTitle}</div>
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
    reports.forEach(r => {
        if (Array.isArray(r.data)) {
            r.data.forEach(d => {
                // Attach report-level info to each item if it's lembur
                if (r.type === 'lembur') {
                    d.reportType = 'lembur';
                    d.monthLabel = r.monthLabel;
                }
                allItems.push(d);
            });
        } else if (r.type === 'lembur' && r.fileData) {
            // Handle legacy lembur data (single file)
            allItems.push({
                reportType: 'lembur',
                monthLabel: r.monthLabel || 'Laporan Lembur',
                addr: 'N/A (Laporan Lembur)',
                desc: `File: ${r.fileName || 'Laporan'}. Ket: ${r.keterangan || '-'}`,
                p1: r.fileData.startsWith('data:image') ? r.fileData : null,
                p2: null,
                p3: null,
                workDate: r.date
            });
        }
    });
    allItems.sort((a, b) => new Date(a.workDate) - new Date(b.workDate));

    const itemsPerPage = 3; // Kunci: 3 item per halaman
    const totalPages = Math.ceil(allItems.length / itemsPerPage);
    
    for (let i = 0; i < allItems.length; i += itemsPerPage) {
        const page = document.createElement('div');
        page.className = 'page-container';
        const chunk = allItems.slice(i, i + itemsPerPage);
        
        let html = `
            <div class="print-main-header" style="${reports[0].type === 'lembur' ? 'background:#e67e22;' : ''}">
                <h1>${reports[0].type === 'lembur' ? `LAPORAN LEMBUR PEKERJAAN ${reports[0].subBidang || ''}` : 'DOKUMENTASI LAPORAN KINERJA'}</h1>
                <div style="display:flex; justify-content:center; gap:20px; color:${reports[0].type === 'lembur' ? 'white' : 'black'}; font-size:11px; margin-top:5px;">
                    <span>${reports[0].type === 'lembur' ? `BULAN: ${reports[0].monthLabel}` : `TANGGAL: ${chunk[0].workDate}`}</span>
                </div>
            </div>`;
        
        chunk.forEach((item, idx) => {
            html += `
            <div class="print-job-item">
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #000; background:#f9f9f9; padding:4px 12px;">
                    <div style="font-size:8.5px;"><strong>LOKASI:</strong> ${item.gps || '-'}</div>
                    <div style="font-size:8.5px;"><strong>PETUGAS:</strong> ${item.officer || '-'}</div>
                    ${item.reportType === 'lembur' ? `<div style="font-size:8.5px; font-weight:bold; color:#e67e22;">🕒 ${item.timeStart || '--:--'} - ${item.timeEnd || '--:--'}</div>` : ''}
                </div>
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

        // Tambahkan Tanda Tangan jika ini halaman terakhir
        if (i + itemsPerPage >= allItems.length) {
            const sigHtml = `
                <div class="print-signature">
                    <div class="sig-col">
                        Dibuat,<br>
                        Ka. Subid. ${reports[0].subBidang || '-'}<br>
                        <div class="sig-space"></div>
                        <div class="sig-name">&nbsp;</div>
                    </div>
                    <div class="sig-col">
                        Diperiksa,<br>
                        Kepala Bagian Teknik<br>
                        <div class="sig-space"></div>
                        <div class="sig-name">Simri Tangke Marissing, ST</div>
                    </div>
                </div>`;
            page.insertAdjacentHTML('beforeend', sigHtml);
        }
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

async function viewLembur(id) {
    const rawData = await localforage.getItem('lapdok_history');
    let dbHistory = Array.isArray(rawData) ? rawData : (typeof rawData === 'string' ? JSON.parse(rawData || '[]') : []);
    const entry = dbHistory.find(h => h.id === id);
    
    if (entry && entry.fileData) {
        const newWindow = window.open();
        newWindow.document.write(`
            <html>
                <head><title>Lihat Laporan Lembur</title></head>
                <body style="margin:0; background:#333; display:flex; flex-direction:column; align-items:center;">
                    <div style="background:#fff; padding:20px; width:100%; box-sizing:border-box; display:flex; justify-content:space-between; align-items:center;">
                        <h2 style="margin:0;">${entry.monthLabel}</h2>
                        <button onclick="window.close()" style="padding:10px 20px; cursor:pointer;">Tutup</button>
                    </div>
                    <div style="flex-grow:1; width:100%; display:flex; justify-content:center; padding:20px; box-sizing:border-box;">
                        ${entry.fileData.startsWith('data:application/pdf') 
                            ? `<embed src="${entry.fileData}" type="application/pdf" width="100%" height="100%" />`
                            : `<img src="${entry.fileData}" style="max-width:100%; height:auto; box-shadow:0 0 20px rgba(0,0,0,0.5);" />`
                        }
                    </div>
                    <div style="background:#eee; padding:20px; width:100%; box-sizing:border-box;">
                        <strong>Keterangan:</strong><br>
                        ${entry.keterangan || '-'}
                    </div>
                </body>
            </html>
        `);
    }
}

async function restoreToEditor(id, type) {
    const rawData = await localforage.getItem('lapdok_history');
    let dbHistory = Array.isArray(rawData) ? rawData : (typeof rawData === 'string' ? JSON.parse(rawData || '[]') : []);
    
    let legacyData = [];
    const oldHistory = localStorage.getItem('lapdok_history');
    if (oldHistory) try { legacyData = JSON.parse(oldHistory); if(!Array.isArray(legacyData)) legacyData = []; } catch(e){}

    const combinedHistory = [...dbHistory, ...legacyData];
    const entry = combinedHistory.find(h => h.id === id);
    
    if (entry) {
        if (type === 'lembur' || entry.type === 'lembur') {
            await localforage.setItem('lapdok_lembur_draft', entry.data);
            await localforage.setItem('lapdok_lembur_edit_context', id);
            window.location.href = "form-lembur.html";
        } else {
            await localforage.setItem('lapdok_draft', entry.data);
            await localforage.setItem('lapdok_edit_context', id);
            window.location.href = "form.html";
        }
    }
}

async function deleteItem(e, id) { 
    e.stopPropagation(); 
    if(confirm("Hapus laporan?")) { 
        // 1. Hapus dari IndexedDB (Data baru)
        let h = await localforage.getItem('lapdok_history') || []; 
        await localforage.setItem('lapdok_history', h.filter(x=>x.id!==id)); 

        // 2. Hapus dari localStorage (Data lama/legacy)
        const oldHistory = localStorage.getItem('lapdok_history');
        if (oldHistory) {
            try {
                let parsedOld = JSON.parse(oldHistory);
                if (Array.isArray(parsedOld)) {
                    const newLegacy = parsedOld.filter(x => x.id !== id);
                    if (newLegacy.length !== parsedOld.length) {
                        localStorage.setItem('lapdok_history', JSON.stringify(newLegacy));
                        console.log(`[PDF Engine] Laporan legacy ID ${id} berhasil dihapus dari localStorage.`);
                    }
                }
            } catch(e) {}
        }

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
