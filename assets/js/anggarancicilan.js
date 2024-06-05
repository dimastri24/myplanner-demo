// ========= initializing ============
// var globalResult = sample;
var globalResult; 
if (getDataLocal('load-1')) {
    globalResult = getDataLocal('load-1');
    console.log(globalResult);
}

var div_nominal = $('#ang-harga');
var div_tanggal = $('#ang-targetwaktu');
const optInputs = {
    harga: {elem: div_nominal, name: '#ang-harga'},
    tanggal: {elem: div_tanggal, name: '#ang-targetwaktu'},
}

// ========== main functions =========

function showResult() {
    $('#table-ang-result thead').html('');
    $('#table-ang-result tbody').html('');
    $('#result-text').html('')

    if (!globalResult) {
        $('#ang-info').removeClass('d-none').find('p').html('Mohon Maaf, Tampaknya Anda Belum Ada Data Keuangan yang Dimasukkan.');
        return;
    } else {
        $('#ang-info').addClass('d-none').find('p').html('');
    }

    const tujuan = $('#ang-tipe').val();
    if (tujuan == '1') drawTableLiburan();
    if (tujuan == '2') drawTableRumah();
}

function drawTableRumah() {
    const hargaRumah = toNumber(div_nominal.val());
    const dp = [5,10,15,20];
    const sukuBunga = 6;
    const tingkatBungaBulanan = sukuBunga / 12 / 100;
    const jangkaWaktu = [10,15,20,25,30];
    let tbody = '';

    if (!hargaRumah || hargaRumah == 0) {
        $(optInputs.harga.name + '-err').html('Silahkan masukan nominal data terlebih dahulu').removeClass('d-none');
        return
    }

    jangkaWaktu.forEach(val => {
        let jumlahJangkaWaktu = val * 12;
        dp.forEach((item, key) => {
            let uangMuka = hargaRumah * item / 100;
            let jumlahPokokPinjaman = hargaRumah - uangMuka;
            let angsuranBulanan = jumlahPokokPinjaman * (tingkatBungaBulanan * Math.pow(1 + tingkatBungaBulanan, jumlahJangkaWaktu)) / (Math.pow(1 + tingkatBungaBulanan, jumlahJangkaWaktu) - 1);
            let available = '';
            if (globalResult.calc.leftover >= angsuranBulanan) {
                available = `class="available"`
            } else {
                available = '';
            }
            tbody += `<tr ${available}>`;
            if (key+1 == 1) {
                tbody += `<td class="first" rowspan="${dp.length}">${val}</td>`;
            }
            tbody += `<td>${item}</td><td>${numberFormatter(uangMuka, true)}</td><td>${numberFormatter(angsuranBulanan.toFixed(0), true)}</td>`;
            tbody += `</tr>`
        })
    })

    $('#table-ang-result thead').append(`
    <tr>
        <th>Tenor</th>
        <th>DP (%)</th>
        <th>DP (Rp)</th>
        <th>Angsuran (Rp)</th>
    </tr>
    `);
    $('#table-ang-result tbody').append(tbody);
}

function drawTableLiburan() {
    const perkiraanBiaya = toNumber(div_nominal.val());
    const targetWaktu = getMonthDiff(div_tanggal.val());
    if (!perkiraanBiaya || perkiraanBiaya == 0) {
        $(optInputs.harga.name + '-err').html('Silahkan masukan nominal data terlebih dahulu').removeClass('d-none');
    }
    if (!targetWaktu) {
        $(optInputs.tanggal.name + '-err').html('Tanggal tidak boleh sama dengan tanggal ini atau sebelumnya').removeClass('d-none');
    }
    if (!perkiraanBiaya || !targetWaktu) return;

    let danadibutuhkan = perkiraanBiaya / targetWaktu;
    const leftover = globalResult.calc.leftover;
    const alokasi = leftover * 80 / 100;

    $('#table-ang-result tbody').append(`
    <tr class="table_header">
        <th colspan="2">Rancangan Anggaran</th>
    </tr>
    <tr>
        <td>Rentang Bulan untuk Menabung</td>
        <td>${targetWaktu} Bulan</td>
    </tr>
    <tr>
        <td>Dana yang Dibutuhkan</td>
        <td>Rp${numberFormatter(danadibutuhkan.toFixed(0),true)} / bulan</td>
    </tr>
    <tr>
        <td>Sisa Dana yang Ada</td>
        <td>Rp${numberFormatter(leftover,true)} / bulan</td>
    </tr>
    <tr>
        <td>Dana yang Dapat Dialokasikan</td>
        <td>Rp${numberFormatter(alokasi,true)} / bulan</td>
    </tr>
    `);

    let message = '';
    if (alokasi < danadibutuhkan) {
        console.log('kurang');
        message += `<p>Berdasarkan Hasil Perhitungan di atas, dana yang dapat dialokasikan untuk menabung masih kurang dari target. Maka dari itu berikut saran yang diberikan:</p>`;
        message += `<ul>
            <li>Memundurkan jadwal liburan anda agar dana dapat terkumpul terlebih dahulu.</li>
            <li>Atur kembali destinasi, moda transportasi, dan kegiatan selama liburan untuk memilih opsi yang lebih murah.</li>
            <li>Kurangi pengeluaran anda pada aspek lain.</li>
        </ul>`;
        $('#result-text').append(message);
    }
}

// ========= input events ===========

$('#ang-tipe').on('change', function () {
    $('#ang-info').addClass('d-none').find('p').html('');
    hideAllInputs();
    const tujuan = this.value;
    if (tujuan == '1') renderInput(optInputs.harga, optInputs.tanggal);
    else if (tujuan == '2') renderInput(optInputs.harga);
    else $('#ang-info').removeClass('d-none').find('p').html('Mohon Maaf, Masih dalam Pengembangan');
})

$('.box-filter').on('input', optInputs.harga.name, function () {
    $(this).val(numberFormatter($(this).val(), true))
    if (!$(optInputs.harga.name + '-err').hasClass('d-none')) {
        $(optInputs.harga.name + '-err').addClass('d-none').html('')
    }
});

$('.box-filter').on('change', optInputs.tanggal.name, function () {
    if (!$(optInputs.tanggal.name + '-err').hasClass('d-none')) {
        $(optInputs.tanggal.name + '-err').addClass('d-none').html('')
    }
});


// ======= utility functions ==========
function getMonthDiff(dateString) {
    var currentDate = new Date();
    
    var yearMonthArray = dateString.split("-");
    var year = parseInt(yearMonthArray[0]);
    var month = parseInt(yearMonthArray[1]) - 1;
    var firstDate = new Date(year, month);
    
    if (firstDate >= currentDate) {
        var monthsDifference = (currentDate.getFullYear() - firstDate.getFullYear()) * 12 + currentDate.getMonth() - firstDate.getMonth();
    
        return Math.abs(monthsDifference);
    } else {
        return false;
    }   
}

function renderInput(...args) {
    args.forEach(item => {
        let parent = item.elem.closest('.col-6');
        parent.removeClass('d-none');
    });
}

function hideAllInputs() {
    Object.entries(optInputs).forEach(([key, value]) => {
        let parent = value.elem.closest('.col-6');
        parent.addClass('d-none')
    })
}