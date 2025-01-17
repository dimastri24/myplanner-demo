$(document).ready(function () {
    $('.card-tools .btn-tool[data-card-widget="collapse"]').on('click', function() {
        var parent = $(this).closest('.card');
        if (parent.hasClass('collapsed-card')) {
            parent.removeClass('collapsed-card');
            parent.find('.card-body').slideDown();
            $(this).find('i').removeClass('fa-chevron-up').addClass('fa-chevron-down');
        } else {
            parent.addClass('collapsed-card');
            parent.find('.card-body').slideUp();
            $(this).find('i').removeClass('fa-chevron-down').addClass('fa-chevron-up');
        }
    })

    var allCard = $('.card.collapsed-card');
    allCard.find('.card-header i').removeClass('fa-chevron-down').addClass('fa-chevron-up');
    allCard.find('.card-body').hide();
});

function autoScrollDown(elem) {
    var anchorElement = $(elem);
    setTimeout(() => {
        if (anchorElement.length) {
            $('html, body').animate({scrollTop: anchorElement.offset().top - 60}, 500);
        }
    }, 500);
}

async function loadHeader() {
    const response = await fetch('feedback.html');
    const modalHtml = await response.text();

    var footer = $('footer');
    footer.after(modalHtml);
}

loadHeader();

// =============================================

function validate(elem) {
    let element = $(elem);
    let selector = elem.replace('#', '');
    let val = toNumber(element.val());
    if (val == '' || val == 0 || !val || val == null) {
        $('#err-' + selector)
            .html('Input requires')
            .show();
        return false;
    }
    return true;
}

function numberFormatter(number, dot = true, comma = false, currency = false) {
    if (typeof number == 'number') number = number.toString()
    number = number.replace(/^0+/, '');

    if (comma) {
        number = number.replace(/^,+/, '').replace(/[^\d,]/g, '');
    } else {
        number = number.replace(/\D/g, '');
    }

    if (dot) number = number.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    if (currency) number = 'Rp' + number;

    return number != '' ? number : '0';
}

function toNumber(string) {
    return string.replace(/\./g, '').replace(',', '.');
}

// ==========================================

function savedToLocal(name, data) {
    const dataString = JSON.stringify(data);
    localStorage.setItem(name, dataString);
    return data;
}

function getDataLocal(name) {
    return JSON.parse(localStorage.getItem(name));
}

function savedToSession(name, data) {
    const dataString = JSON.stringify(data);
    sessionStorage.setItem(name, dataString);
    return data;
}

function getDataSession(name) {
    return JSON.parse(sessionStorage.getItem(name));
}

var sample = {
    calc: { outcomeTotal: 6450000, outcomeFixedTotal: 6150000, leftover: 1550000 },
    income: { list: [{ title: 'gajian', nominal: 8000000 }], total: 8000000 },
    loan: { list: [{ title: 'motor', nominal: 950000 }], total: 950000 },
    worked: {
        list: [
            { title: 'transport', nominal: 500000 },
            { title: 'makan', nominal: 500000 },
            { title: 'lainnya', nominal: 300000 },
        ],
        total: 1300000,
    },
    houses: {
        list: [
            { title: 'belanja', nominal: 3000000 },
            { title: 'air', nominal: 100000 },
            { title: 'listrik', nominal: 400000 },
            { title: 'gas', nominal: 100000 },
            { title: 'lainnya', nominal: 300000 },
        ],
        total: 3900000,
    },
    childs: {
        list: [
            { title: 'produk bayi', nominal: 0 },
            { title: 'sekolah', nominal: 0 },
            { title: 'lainnya', nominal: 0 },
        ],
        total: 0,
    },
    varied: { list: [{ title: 'jajan', nominal: 300000 }], total: 300000 },
};