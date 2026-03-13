function updateUI() {
    const fd = document.getElementById('f-date').value;
    let data = JSON.parse(localStorage.getItem('lapdok_history') || '[]');
    if(fd) data = data.filter(h => h.date === fd);
    data.sort((a,b) => b.id - a.id);

    const listDiv = document.getElementById('history-list');
    let html = '';
    
    data.forEach((h, index) => {
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

function prepareContent() {
    const selectedIds = Array.from(document.querySelectorAll('.report-cb:checked')).map(cb => parseFloat(cb.value));
    const allHistory = JSON.parse(localStorage.getItem('lapdok_history') || '[]');
    const reports = allHistory.filter(h => selectedIds.includes(h.id));
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

function triggerPrint() { prepareContent(); setTimeout(window.print, 500); }

async function triggerPDF() {
    const defaultName = "Laporan_Kinerja_" + new Date().toISOString().slice(0, 10);
    let fileName = prompt("Masukkan nama file PDF:", defaultName);

    if (fileName === null) return; 
    if (!fileName.toLowerCase().endsWith('.pdf')) fileName += '.pdf';

    prepareContent();
    const element = document.getElementById('print-content-target');
    
    // Paksa lebar elemen 210mm (A4 standar) agar snapshot 1:1
    const originalWidth = element.style.width;
    element.style.width = "794px"; 
    
    const opt = {
        margin: [0, 0, 0, 0], // Margin Sistem Nol untuk kontrol penuh CSS
        filename: fileName,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
            scale: 2, 
            windowWidth: 800, 
            scrollY: 0,
            useCORS: true,
            letterRendering: true
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['css', 'legacy'] }
    };

    Jarvis.pandu('memproses_pdf');
    
    try {
        await html2pdf().set(opt).from(element).save();
    } finally {
        // Kembalikan lebar asli setelah selesai
        element.style.width = originalWidth;
    }
}

function restoreToEditor(id) {
    const entry = JSON.parse(localStorage.getItem('lapdok_history')).find(h => h.id === id);
    localStorage.setItem('lapdok_draft', JSON.stringify(entry.data));
    localStorage.setItem('lapdok_edit_context', id);
    window.location.href = "form.html";
}

function deleteItem(e, id) { 
    e.stopPropagation(); 
    if(confirm("Hapus laporan?")) { 
        let h = JSON.parse(localStorage.getItem('lapdok_history')); 
        localStorage.setItem('lapdok_history', JSON.stringify(h.filter(x=>x.id!==id))); 
        updateUI(); 
        Jarvis.pandu('hapus');
    } 
}

// Gunakan DOMContentLoaded agar lebih cepat muncul dibanding window.onload
document.addEventListener('DOMContentLoaded', () => {
    console.log("PDF Engine Loaded. Checking database...");
    const checkData = localStorage.getItem('lapdok_history');
    console.log("History found:", checkData ? JSON.parse(checkData).length : 0, "records");
    
    updateUI();
    setTimeout(() => {
        if (document.querySelectorAll('.report-cb').length > 0) {
            Jarvis.pandu('pilih_cetak');
        }
    }, 500);
});
