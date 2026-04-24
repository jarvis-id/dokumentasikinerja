function activateAndHide() {
    Jarvis.activate();
    document.getElementById('activation-gate').style.display = 'none';
}

let itemCount = 0, map, marker, activeInputId, activeAddrId, tempCoords;
let cameraStream = null, activePreviewId = null, currentStage = null;
let wmInterval = null;
let editContextId = null;

function getWatermarkData(itemId) {
    const now = new Date();
    const dateStr = new Intl.DateTimeFormat('id-ID', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(now);
    let gpsLat = "0.000000", gpsLng = "0.000000", addrText = "Alamat: Belum diset";
    
    if (itemId) {
        const gpsVal = document.getElementById(`gps-res-${itemId}`)?.value;
        const addrVal = document.getElementById(`addr-res-${itemId}`)?.innerText;
        if (gpsVal && gpsVal.includes('query=')) {
            const coords = gpsVal.split('query=')[1].split(',');
            gpsLat = parseFloat(coords[0]).toFixed(6);
            gpsLng = parseFloat(coords[1]).toFixed(6);
        }
        if (addrVal && addrVal !== "Alamat otomatis..." && !addrVal.includes("Menerjemahkan")) {
            addrText = addrVal;
        }
    }
    return { dateStr, gpsLat, gpsLng, addrText };
}

function applyWatermarkToCanvas(canvas, itemId) {
    const ctx = canvas.getContext('2d');
    const wm = getWatermarkData(itemId);
    
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    const padding = 20;

    // Dapatkan Data Waktu
    const now = new Date();
    const hhmm = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const ddMMyyyy = now.getDate() + ' ' + months[now.getMonth()] + ' ' + now.getFullYear();
    const dddd = days[now.getDay()];

    // 1. Gambar Waktu Besar (Kiri Bawah)
    ctx.font = "bold 60px 'Arial Narrow', Arial, sans-serif";
    ctx.fillStyle = "white";
    let timeY = canvas.height - 70; // Dinaikkan tinggi jembatannya agar muat 2 baris teks di bawah!
    ctx.fillText(hhmm, padding, timeY);

    // Mengukur lebar teks waktu untuk penentuan letak elemen berikutnya
    let timeWidth = ctx.measureText(hhmm).width;

    // 2. Gambar Garis Vertikal Kuning
    let lineX = padding + timeWidth + 15;
    ctx.beginPath();
    ctx.moveTo(lineX, timeY - 50); // Tarik atas
    ctx.lineTo(lineX, timeY + 2);  // Tarik bawah
    ctx.strokeStyle = "#FFD700";
    ctx.lineWidth = 4;
    ctx.stroke();

    // 3. Gambar Tanggal & Hari (Kanan)
    ctx.font = "bold 20px Arial";
    ctx.fillStyle = "white";
    let dateX = lineX + 15;
    ctx.fillText(ddMMyyyy, dateX, timeY - 25);
    ctx.fillText(dddd, dateX, timeY + 2);

    // 4. Gambar Keterangan GPS & Alamat (Kecil di bawah balok waktu)
    ctx.font = "14px Arial";
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.fillText(`GPS : ${wm.gpsLat}, ${wm.gpsLng}`, padding, timeY + 22);
    ctx.fillText(`Alamat: ${wm.addrText}`, padding, timeY + 40);
}

function formatIndoDate(dateString) {
    if (!dateString) return "Pilih tanggal...";
    return new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(dateString));
}

function handleDateChange(id) {
    const val = document.getElementById(`date-in-${id}`).value;
    document.getElementById(`date-lbl-${id}`).innerText = formatIndoDate(val);
    saveDraft();
    Jarvis.pandu('lokasi');
}

function addNewJobItem() {
    itemCount++;
    const container = document.getElementById('job-container');
    const stages = ['sebelum', 'proses', 'sesudah'];
    let html = `
        <div class="job-item" id="item-${itemCount}">
            <div class="header-main"><span>ITEM #${itemCount}</span><button onclick="this.closest('.job-item').remove(); saveDraft();" style="background:none; border:1px solid white; color:white; font-size:9px;">Hapus</button></div>
            <div class="input-group">
                <div class="date-section">
                    <input type="date" class="date-input" id="date-in-${itemCount}" onchange="handleDateChange(${itemCount})">
                    <div id="date-lbl-${itemCount}" style="margin-top:5px; color:#27ae60; font-weight:bold;">Pilih tanggal...</div>
                    <div style="margin-top:10px;">
                        <label style="font-size:10px; font-weight:bold; color:#666;">NAMA PETUGAS:</label>
                        <input type="text" class="officer-input" id="officer-in-${itemCount}" oninput="saveDraft()" placeholder="Nama petugas..." style="width:100%; padding:8px; border:1px solid #ddd; border-radius:4px; font-size:11px;">
                    </div>
                </div>
                <button class="btn-map-trigger" onclick="openMap('gps-res-${itemCount}', 'addr-res-${itemCount}')">📍 Cari/Pusatkan Lokasi</button>
                <input type="text" class="gps-res" id="gps-res-${itemCount}" readonly placeholder="Koordinat...">
                <div class="address-output" id="addr-res-${itemCount}">Alamat otomatis...</div>
            </div>
            <div class="grid-header"><div>SEBELUM</div><div>PROSES</div><div>SESUDAH</div></div>
            <div class="grid-content">`;
    stages.forEach((s, idx) => {
        const labels = { 'sebelum': 'SEBELUM', 'proses': 'PROSES', 'sesudah': 'SESUDAH' };
        html += `
            <div class="column" data-label="${labels[s]}">
                <div class="photo-actions">
                    <button class="btn-photo" onclick="openCustomCamera('p${idx+1}-${itemCount}', '${s}')">📷</button>
                    <button class="btn-photo" onclick="document.getElementById('gal-${idx+1}-${itemCount}').click()">📁</button>
                </div>
                <input type="file" id="gal-${idx+1}-${itemCount}" accept="image/*" style="display:none" onchange="processGalleryImg(this, 'p${idx+1}-${itemCount}', '${s}')">
                <div class="image-preview" id="p${idx+1}-${itemCount}"><span>Preview</span></div>
            </div>`;
    });
    html += `</div>
            <div class="footer-section"><textarea id="ta-${itemCount}" onfocus="Jarvis.pandu('keterangan')" oninput="saveDraft()" placeholder="Keterangan..."></textarea></div>
        </div>`;
    container.insertAdjacentHTML('beforeend', html);
    Jarvis.pandu('tanggal');
}

function openMap(g, a) {
    activeInputId = g; activeAddrId = a;
    document.getElementById('map-modal').style.display = 'block';
    if (!map) {
        map = L.map('map-container').setView([-2.9691, 119.8972], 11); // Center: Rantepao (Torut)

        L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
            keepBuffer: 4,
            updateWhenIdle: true,
            maxZoom: 20
        }).addTo(map);

        // Fetch Data Poligon Wilayah Kabupaten Toraja Utara (OSM Nominatim)
        fetch('https://nominatim.openstreetmap.org/search.php?q=Toraja+Utara&polygon_geojson=1&format=jsonv2')
        .then(res => res.json())
        .then(data => {
            if(data && data.length > 0 && data[0].geojson) {
                L.geoJSON(data[0].geojson, {
                    style: {
                        color: '#ff3333', // Merah terang
                        weight: 3,        // Ketebalan garis pinggir
                        opacity: 0.8,     // Transparansi garis
                        fillColor: '#ff0000', 
                        fillOpacity: 0.08, // Sangat transparan (Arsiran dalam merah tipis)
                        dashArray: '5, 8'  // Garis putus-putus
                    }
                }).addTo(map);
            }
        }).catch(e => console.warn("Gagal merender poligon referensi:", e));

        marker = L.marker([-2.9691, 119.8972], {draggable: true}).addTo(map);
        marker.on('dragend', function(e) {
            const latlng = e.target.getLatLng();
            setMapMarker(latlng.lat, latlng.lng);
        });
        map.on('click', (e) => setMapMarker(e.latlng.lat, e.latlng.lng));
    }
    setTimeout(() => map.invalidateSize(), 300);
}

function getCurrentLocation() { if(map) map.locate({setView: true, maxZoom: 18, enableHighAccuracy: true, maximumAge: 10000, timeout: 5000}); }
function setMapMarker(lat, lng) {
    tempCoords = `${lat.toFixed(6)},${lng.toFixed(6)}`;
    if (marker) marker.setLatLng([lat, lng]);
    else marker = L.marker([lat, lng]).addTo(map);
}

async function confirmLocation() {
    if (!tempCoords) return;
    document.getElementById(activeInputId).value = `https://www.google.com/maps/search/?api=1&query=${tempCoords}`;
    document.getElementById(activeAddrId).innerText = "Menerjemahkan koordinat...";
    const [lat, lng] = tempCoords.split(',');
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
        .then(res => res.json())
        .then(data => document.getElementById(activeAddrId).innerText = data.display_name || "Lokasi tersimpan.")
        .catch(() => document.getElementById(activeAddrId).innerText = "Lokasi tersimpan (Gagal memuat alamat lengkap).");
    saveDraft(); closeMap();
    Jarvis.pandu('foto_sebelum');
}

function closeMap() { document.getElementById('map-modal').style.display = 'none'; }

async function openCustomCamera(p, stage) { 
    activePreviewId = p; currentStage = stage;
    Jarvis.pandu('foto_' + stage);
    const itemId = p.split('-')[1];

    document.getElementById('cam-overlay').style.display = 'block';
    wmInterval = setInterval(() => {
        const wm = getWatermarkData(itemId);
        const now = new Date();
        const hhmm = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
        
        const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        const ddMMyyyy = now.getDate() + ' ' + months[now.getMonth()] + ' ' + now.getFullYear();
        const dddd = days[now.getDay()];

        document.getElementById('val-time').innerText = hhmm;
        document.getElementById('val-date').innerText = ddMMyyyy;
        document.getElementById('val-day').innerText = dddd;
        document.getElementById('val-gps').innerText = `GPS : ${wm.gpsLat}, ${wm.gpsLng}`;
        document.getElementById('val-addr').innerText = wm.addrText;
    }, 1000);

    try {
        cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        document.getElementById('cam-video').srcObject = cameraStream;
        document.getElementById('cam-modal').style.display = 'block';
    } catch(e) { alert("Kamera tidak diizinkan."); }
}

function capturePhoto() {
    const video = document.getElementById('cam-video');
    const canvas = document.createElement('canvas');
    
    // Logika Aspect Ratio Murni
    // Tanpa pemotongan kotak/crop, gambar menyesuaikan dimensi sensor aslinya sepenuhnya!
    const MAX_DIM = 1200; // Standar resolusi HD agar efisien
    let w = video.videoWidth;
    let h = video.videoHeight;
    
    if (w > MAX_DIM || h > MAX_DIM) {
        if (w > h) {
            h = Math.floor(h * (MAX_DIM / w));
            w = MAX_DIM;
        } else {
            w = Math.floor(w * (MAX_DIM / h));
            h = MAX_DIM;
        }
    }
    
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    
    // Gambar murni kamera ke dalam ukuran aslinya
    ctx.drawImage(video, 0, 0, w, h);
    
    const itemId = activePreviewId.split('-')[1];
    // Baru Terapkan Stempel
    applyWatermarkToCanvas(canvas, itemId);

    document.getElementById(activePreviewId).innerHTML = `<img src="${canvas.toDataURL('image/jpeg', 0.8)}">`;
    saveDraft(); closeCamera();
    handleAutoNextStep(currentStage);
}

function processGalleryImg(input, p, stage) {
    const file = input.files[0];
    if(!file) return;
    const itemId = p.split('-')[1];
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            const c = document.createElement('canvas');
            
            // Cari rasio penyusutan agar sisi terpanjang maksimal 800px
            const maxDim = 800;
            let w = img.width;
            let h = img.height;
            
            if (w > h) {
                if (w > maxDim) { h *= maxDim / w; w = maxDim; }
            } else {
                if (h > maxDim) { w *= maxDim / h; h = maxDim; }
            }

            c.width = w; 
            c.height = h;
            c.getContext('2d').drawImage(img, 0, 0, w, h);

            document.getElementById(p).innerHTML = `<img src="${c.toDataURL('image/jpeg', 0.8)}">`;
            saveDraft();
            handleAutoNextStep(stage);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function handleAutoNextStep(stage) {
    if(stage === 'sebelum') Jarvis.pandu('foto_proses');
    else if(stage === 'proses') Jarvis.pandu('foto_sesudah');
    else if(stage === 'sesudah') Jarvis.pandu('keterangan');
}

function closeCamera() { 
    if(cameraStream) cameraStream.getTracks().forEach(t => t.stop());
    if(wmInterval) clearInterval(wmInterval);
    document.getElementById('cam-modal').style.display = 'none'; 
}

async function saveDraft() {
    const items = [];
    document.querySelectorAll('.job-item').forEach(item => {
        const id = item.id.split('-')[1];
        items.push({
            workDate: document.getElementById(`date-in-${id}`).value,
            officer: document.getElementById(`officer-in-${id}`).value,
            gps: document.getElementById(`gps-res-${id}`).value,
            addr: document.getElementById(`addr-res-${id}`).innerText,
            p1: document.getElementById(`p1-${id}`).querySelector('img')?.src || null,
            p2: document.getElementById(`p2-${id}`).querySelector('img')?.src || null,
            p3: document.getElementById(`p3-${id}`).querySelector('img')?.src || null,
            desc: document.getElementById(`ta-${id}`).value
        });
    });
    await localforage.setItem('lapdok_draft', items);
}

async function loadDraft() {
    editContextId = await localforage.getItem('lapdok_edit_context');
    if (editContextId) document.getElementById('edit-banner').style.display = 'block';

    const saved = await localforage.getItem('lapdok_draft');
    if (!saved || saved.length === 0) { addNewJobItem(); return; }
    saved.forEach((data, index) => {
        addNewJobItem();
        const id = index + 1;
        document.getElementById(`date-in-${id}`).value = data.workDate || "";
        document.getElementById(`date-lbl-${id}`).innerText = formatIndoDate(data.workDate);
        if (document.getElementById(`officer-in-${id}`)) {
            document.getElementById(`officer-in-${id}`).value = data.officer || "";
        }
        document.getElementById(`gps-res-${id}`).value = data.gps || "";
        document.getElementById(`addr-res-${id}`).innerText = data.addr || "Alamat otomatis...";
        document.getElementById(`ta-${id}`).value = data.desc || "";
        if(data.p1) document.getElementById(`p1-${id}`).innerHTML = `<img src="${data.p1}">`;
        if(data.p2) document.getElementById(`p2-${id}`).innerHTML = `<img src="${data.p2}">`;
        if(data.p3) document.getElementById(`p3-${id}`).innerHTML = `<img src="${data.p3}">`;
    });
}

async function saveToHistory() {
    const draft = await localforage.getItem('lapdok_draft') || [];
    if (!draft.length || draft.some(i => !i.workDate)) return alert("Mohon isi minimal satu item!");
    let historyRaw = await localforage.getItem('lapdok_history');
    let history = [];
    if (typeof historyRaw === 'string') {
        try { history = JSON.parse(historyRaw); } catch(e) {}
    } else if (Array.isArray(historyRaw)) {
        history = historyRaw;
    }
    if (editContextId) history = history.filter(h => h.id !== parseFloat(editContextId));
    history.push({ 
        id: Date.now(), 
        date: draft[0].workDate, 
        timestamp: formatIndoDate(draft[0].workDate), 
        data: draft 
    });
    await localforage.setItem('lapdok_history', history);
    await localforage.removeItem('lapdok_draft');
    await localforage.removeItem('lapdok_edit_context');
    alert("Berhasil disimpan!");
    Jarvis.pandu('selesai');
    location.href = "tampildata.html";
}

async function cancelEdit() { 
    await localforage.removeItem('lapdok_draft'); 
    await localforage.removeItem('lapdok_edit_context'); 
    location.reload(); 
}

window.onload = async () => { 
    // --- SKRIP PENYELAMAT DATA ---
    const oldHistory = localStorage.getItem('lapdok_history');
    if (oldHistory) {
        try {
            const parsedOld = JSON.parse(oldHistory);
            if (parsedOld && parsedOld.length > 0) {
                let currentHistoryRaw = await localforage.getItem('lapdok_history');
                let currentHistory = [];
                if (typeof currentHistoryRaw === 'string') {
                    try { currentHistory = JSON.parse(currentHistoryRaw); } catch(e) {}
                } else if (Array.isArray(currentHistoryRaw)) {
                    currentHistory = currentHistoryRaw;
                }

                const currentIds = currentHistory.map(h => h.id);
                const dataToMigrate = parsedOld.filter(h => !currentIds.includes(h.id));
                if (dataToMigrate.length > 0) {
                    await localforage.setItem('lapdok_history', [...currentHistory, ...dataToMigrate]);
                    console.log(`[Form Handler] Berhasil menyelamatkan ${dataToMigrate.length} laporan lama dari pages/ scope.`);
                }
            }
        } catch(e) { console.error("Gagal migrasi rekam jejak:", e); }
    }
    // -----------------------------
    await loadDraft(); 
};
