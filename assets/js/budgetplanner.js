const tables = [
    'table-income',
    'table-outcome-loan',
    'table-outcome-worked',
    'table-outcome-houses',
    'table-outcome-childs',
    'table-outcome-varied',
];

const colorPalettes = ["#fd7f6f", "#7eb0d5", "#b2e061", "#bd7ebe", "#ffb55a", "#ffee65", "#beb9db", "#fdcce5", "#8bd3c7"];

// loadData(sample, tables);
if (getDataLocal('load-1')) {
    loadData(getDataLocal('load-1'), tables);
}

var globalResult;

function loadData(jsonData, tables) {
    removeAllRows(tables);
    
    tables.forEach(table => {
        const tableName = table.split('-')[2] ? table.split('-')[2] : table.split('-')[1];
        const dataKey = tableName.replace('outcome', '').toLowerCase();

        const tableElement = document.getElementById(table);
        if (!tableElement) {
            console.error(`Table element ${table} not found.`);
            return;
        }

        const data = jsonData[dataKey];
        if (!data) {
            console.error(`Data for ${dataKey} not found in sample.`);
            return;
        }

        data.list.forEach(item => {
            var table = tableElement.getElementsByTagName('tbody')[0];
            var newRow = table.insertRow(table.rows.length);

            var cell1 = newRow.insertCell(0);
            var cell2 = newRow.insertCell(1);
            var cell3 = newRow.insertCell(2);

            var titleInput = document.createElement('input');
            titleInput.type = 'text';
            titleInput.name = 'title[]';
            titleInput.placeholder = 'masukan label';
            titleInput.value = item.title
            cell1.appendChild(titleInput);

            var infoInput = document.createElement('input');
            infoInput.type = 'text';
            infoInput.name = 'amount[]';
            infoInput.classList.add('currency');
            infoInput.placeholder = '0';
            infoInput.value = numberFormatter(item.nominal, true)
            cell2.classList.add('element-box');
            cell2.innerHTML = '<div class="icons">Rp</div>';
            cell2.appendChild(infoInput);

            var deleteButton = document.createElement('button');
            deleteButton.innerHTML = '<i class="fa fa-trash-o"></i>';
            deleteButton.onclick = function () {
                deleteRow(this);
            };
            cell3.appendChild(deleteButton);
        });
    })
}

function removeAllRows(tables) {
    tables.forEach(tableName => {
        var table = document.getElementById(tableName).getElementsByTagName('tbody')[0];
        while (table.rows.length > 0) {
            table.deleteRow(0);
        }
    });
}

function addRow(target) {
    var table = document.getElementById(target).getElementsByTagName('tbody')[0];
    var newRow = table.insertRow(table.rows.length);

    var cell1 = newRow.insertCell(0);
    var cell2 = newRow.insertCell(1);
    var cell3 = newRow.insertCell(2);

    var titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.name = 'title[]';
    titleInput.placeholder = 'masukan label';
    cell1.appendChild(titleInput);

    var infoInput = document.createElement('input');
    infoInput.type = 'text';
    infoInput.name = 'amount[]';
    infoInput.classList.add('currency')
    infoInput.placeholder = '0';
    cell2.classList.add('element-box')
    cell2.innerHTML = '<div class="icons">Rp</div>';
    cell2.appendChild(infoInput);

    var deleteButton = document.createElement('button');
    deleteButton.innerHTML = '<i class="fa fa-trash-o"></i>';
    deleteButton.onclick = function () {
        deleteRow(this);
    };
    cell3.appendChild(deleteButton);

    titleInput.focus();
}

function deleteRow(btn) {
    var row = btn.parentNode.parentNode;
    row.parentNode.removeChild(row);
}

function retrieveData(target) {
    var table = document.getElementById(target);
    var rows = table.getElementsByTagName('tr');

    var data = [];
    var total = 0;
    for (var i = 1; i < rows.length; i++) {
        var cells = rows[i].getElementsByTagName('td');
        var nominal = cells[1].querySelector('input').value
            ? cells[1].querySelector('input').value
            : '0';
        total += parseInt(toNumber(nominal));
        var rowData = {
            title: cells[0].querySelector('input').value,
            nominal: parseInt(toNumber(nominal)),
        };
        data.push(rowData);
    }

    return {list: data, total};
}

function calculate() {
    // var result = {
    //     income : retrieveData('table-income'), 
    //     loan : retrieveData('table-outcome-loan'), 
    //     worked : retrieveData('table-outcome-worked'), 
    //     houses : retrieveData('table-outcome-houses'), 
    //     childs : retrieveData('table-outcome-childs'), 
    //     varied : retrieveData('table-outcome-varied')};

    const result = { calc: {outcomeTotal: 0, outcomeFixedTotal: 0, leftover: 0} };
    tables.forEach((table) => {
        const tableName = table.split('-')[2] ? table.split('-')[2] : table.split('-')[1];
        const dataKey = tableName.replace('outcome', '').toLowerCase();

        result[dataKey] = retrieveData(table);
        result['calc'].outcomeFixedTotal += dataKey != 'income' && dataKey != 'varied' ? result[dataKey].total : 0;
        result['calc'].outcomeTotal += dataKey != 'income' ? result[dataKey].total : 0;
    });

    result['calc'].leftover = result['income'].total - result['calc'].outcomeTotal;
    
    // console.log(result);
    // console.log(JSON.stringify(result));
    return result;
}

function showResult() {
    $('#table-bp-result tbody').html('');

    // const result = calculate();
    const result = globalResult = savedToLocal('load-1', calculate());

    $('#table-bp-result').addClass('margin-bottom-xl');
    $('#table-bp-result tbody').append(`
    <tr class="table_header">
        <th colspan="2">Ringkasan Budget Bulanan Anda</th>
    </tr>
    <tr>
        <td>Total Pendapatan</td>
        <td>Rp${numberFormatter(result.income.total)}</td>
    </tr>
    <tr>
        <td>Total Pengeluaran</td>
        <td>Rp${numberFormatter(result.calc.outcomeTotal)}</td>
    </tr>
    <tr>
        <td>Total Sisa</td>
        <td>Rp${numberFormatter(result.calc.leftover)}</td>
    </tr>
    <tr class="table_header">
        <th colspan="2">Rincian Pengeluaran Bulanan Anda</th>
    </tr>
    <tr>
        <td>Hutang & Cicilan</td>
        <td>Rp${numberFormatter(result.loan.total)}</td>
    </tr>
    <tr>
        <td>Terkait Pekerjaan</td>
        <td>Rp${numberFormatter(result.worked.total)}</td>
    </tr>
    <tr>
        <td>Terkait Rumah Tangga</td>
        <td>Rp${numberFormatter(result.houses.total)}</td>
    </tr>
    <tr>
        <td>Tanggunan Anak</td>
        <td>Rp${numberFormatter(result.childs.total)}</td>
    </tr>
    <tr>
        <td>Total Pengeluaran Tetap</td>
        <td>Rp${numberFormatter(result.calc.outcomeFixedTotal)}</td>
    </tr>
    <tr>
        <td>Total Pengeluaran Tidak Tetap</td>
        <td>Rp${numberFormatter(result.varied.total)}</td>
    </tr>
    `);

    drawChartBreakdown(result);
    if (breakdownPPChart) {
        breakdownPPChart.canvas.removeEventListener('click', handleChartClick);
        breakdownPPChart.destroy();
        $('#breakdownPPChart').hide();
    }
    if (breakdownDetailPPChart) {
        breakdownDetailPPChart.destroy();
        $('#breakdownDetailPPChart').hide();
    }
    $('#to-anggaran').show();

    autoScrollDown('#div-result');
}

$('.table-input').on('input', '.currency', function () {
    $(this).val(numberFormatter($(this).val(), true))
});

// ==== CHART AREA =====
var breakdownChart;
var breakdownPPChart;
var breakdownDetailPPChart;

function drawChartBreakdown(data) {
    if (breakdownChart) {
        breakdownChart.canvas.removeEventListener('click', handleChartClick);
        breakdownChart.destroy();
    } 

    let label = ['Pendapatan', 'Pengeluaran'];
    let value = [data.income.total, data.calc.outcomeTotal];

    const ctx = $('#breakdownChart');
    ctx.show();
    const config = {
        type: "pie",
        data: {
            labels: label,
            datasets: [{
                backgroundColor: colorPalettes,
                data: value,
            }]
        },
        options: {
            plugins: {
                title : {
                    display: true,
                    text: 'Break Down Chart',
                    font: {
                        size: 16,
                    }
                },
                legend: {
                    labels: {
                        boxWidth: 20
                    }
                }
            },
        }
    }

    breakdownChart = new Chart(ctx, config);
    
    breakdownChart.canvas.addEventListener('click', function (event) {
        handleChartClick(event, breakdownChart);
    });
}


function drawChartPPBreakdown(type) {
    if (breakdownPPChart) {
        if (type === 1) breakdownPPChart.canvas.removeEventListener('click', handleChartClick);
        breakdownPPChart.destroy();
    }

    let data = globalResult
    let label = [];
    let value = [];
    let title = '';

    if (type === 0) {
        data = globalResult.income.list
        Object.entries(data).forEach(([key, val]) => {
            if (key != 'calc' && key != 'income') {
                label.push(val.title);
                value.push(val.nominal);
            }
        });
        title = 'Breakdown Detail Pendapatan';
        if (breakdownDetailPPChart) {
            breakdownDetailPPChart.destroy();
            $('#breakdownDetailPPChart').hide();
        }
    } else if (type === 1) {
        label = ['Hutang dan Cicilan', 'Pekerjaan', 'Rumah Tangga', 'Tanggunan', 'Pengeluaran Tidak Tetap'];
        Object.entries(data).forEach(([key, val]) => {
            if (key != 'calc' && key != 'income') {
                value.push(val.total)
            }
        })
        title = 'Breakdown Pengeluaran';
    }

    const ctx = $('#breakdownPPChart');
    ctx.show();
    const config = {
        type: 'pie',
        data: {
            labels: label,
            datasets: [
                {
                    backgroundColor: colorPalettes,
                    data: value,
                },
            ],
        },
        options: {
            plugins: {
                title: {
                    display: true,
                    text: title,
                    font: {
                        size: 16,
                    },
                },
                legend: {
                    labels: {
                        boxWidth: 20,
                    },
                },
            },
        },
    };
    
    breakdownPPChart = new Chart(ctx, config);
    if (type === 1){
        breakdownPPChart.canvas.addEventListener('click', function (event) {
            handleChartClick(event, breakdownPPChart);
        });
    }
}

function drawDetailChartPPBreakdown(type) {
    if (breakdownDetailPPChart) {
        breakdownDetailPPChart.destroy();
    } 

    let data;
    if (type === 0) {
        data = globalResult.loan.list;
    } else if (type === 1) {
        data = globalResult.worked.list;
    } else if (type === 2) {
        data = globalResult.houses.list;
    } else if (type === 3) {
        data = globalResult.childs.list;
    } else if (type === 4) {
        data = globalResult.varied.list;
    }
    
    let label = [];
    let value = [];
    
    Object.entries(data).forEach(([key, val]) => {
        if (key != 'calc' && key != 'income') {
            label.push(val.title)
            value.push(val.nominal)
        }
    })
    
    const ctx = $('#breakdownDetailPPChart');
    ctx.show();
    const config = {
        type: 'pie',
        data: {
            labels: label,
            datasets: [
                {
                    backgroundColor: colorPalettes,
                    data: value,
                },
            ],
        },
        options: {
            plugins: {
                title: {
                    display: true,
                    text: 'Breakdown Detail Pengeluaran',
                    font: {
                        size: 16,
                    },
                },
                legend: {
                    labels: {
                        boxWidth: 20,
                    },
                },
            },
        },
    };
    
    breakdownDetailPPChart = new Chart(ctx, config);
}

function handleChartClick(event, chart) {
    const segment = chart.getElementsAtEventForMode(event, 'nearest', { intersect: true }, true)[0];

    if (segment) {
        if (chart.canvas.id === 'breakdownChart') {
            drawChartPPBreakdown(segment.index)
        } else if (chart.canvas.id === 'breakdownPPChart') {
            drawDetailChartPPBreakdown(segment.index)
        }
    }
}

// ============= Converter =============
$('#cnv-money').on('input', function () {
    $(this).val(numberFormatter($(this).val(), true));
    const value = toNumber($(this).val());
    const opt = $('#cnv-interval-in').val();
    let res = 0

    if (opt === '1') res = value * 30;
    if (opt === '2') res = value * 4;
    if (opt === '3') res = value / 4;
    if (opt === '4') res = value / 12;
    
    res = Math.ceil(res);
    $('#cnv-hasil').val(numberFormatter(res));
});

$('#cnv-interval-in').on('change', function() {
    const value = toNumber($('#cnv-money').val());
    const opt = $(this).val();
    let res = 0;

    if (opt === '1') res = value * 30;
    if (opt === '2') res = value * 4;
    if (opt === '3') res = value / 4;
    if (opt === '4') res = value / 12;

    res = Math.ceil(res);
    $('#cnv-hasil').val(numberFormatter(res));
})

// ========== ANGGARAN CICILAN =============
