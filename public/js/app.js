const pageSize = 200;
let startPage = 1;
let endPage = 1;
let pageNumber = 1;
let all_data = JSON.parse(localStorage.getItem('__agric_data__'));
let data = {};
let sortHistory = [];
const el = $('#app');

// Compile Handlebar Templates
const errorTemplate = Handlebars.compile($('#error-template').html());
const detailTemplate = Handlebars.compile($('#detail-template').html());
const tableTemplate = Handlebars.compile($('#table-template').html());

window.addEventListener('load', () => {


    // Instantiate api handler
    const api = axios.create({
        baseURL: window.location.origin + '/api',
        timeout: 10000,
    });

    const router = new Router({
        mode: 'history'
    });

    // Display Error Banner
    const showError = (error) => {
        const {title, message} = error.response.data;
        const html = errorTemplate({color: 'red', title, message});
        el.html(html);
    };

    // Display Latest Currency Rates
    router.add('/', async () => {
        // Display loader first
        let html = tableTemplate();
        el.html(html);
        try {
            // Load Currency Rates

            if (!all_data.length) {
                const response = await api.get('/');
                all_data = response.data;
                localStorage.setItem('__agric_data__', JSON.stringify(all_data));
            }
            // Display Rates Table
            const selectedPageNumber = 1;
            [startPage, endPage, pageNumber] = getPaginationValues(all_data.length, selectedPageNumber);

            data = all_data.slice(startPage, endPage);
            html = tableTemplate({data, pageNumber});
            el.html(html);
            $('.loading').removeClass('loading');
        } catch (error) {
            showError(error);
        }
    });


    router.navigateTo(window.location.pathname);

});

document.addEventListener('click', function (event) {

    // If the clicked element doesn't have the right selector, bail
    if (event.target.matches('.page-number')) {
        // Don't follow the link
        event.preventDefault();

        // Log the clicked element in the console
        // console.log(event.target);

        const target = $(event.target);
        // $('.item').removeClass('active');
        // target.addClass('active');

        // new page

        const selectedPageNumber = target.attr('data-value');

        [startPage, endPage, pageNumber] = getPaginationValues(all_data.length, selectedPageNumber);

        data = all_data.slice(startPage, endPage);
        let html = tableTemplate({data, pageNumber});
        el.html(html);
        $('.loading').removeClass('loading');
    }

    if (event.target.matches('.column-head')) {
        // Don't follow the link
        event.preventDefault();

        const target = $(event.target);
        // $('.item').removeClass('active');
        // target.addClass('sorted');

        // new page

        const selectedColumn = target.attr('data-value');
        const reverse = sortHistory.includes(selectedColumn);
        !reverse ? sortHistory.push(selectedColumn) : sortHistory.splice( sortHistory.indexOf(selectedColumn), 1 );

        data = data.sort(columnSorter(selectedColumn, reverse));
        let html = tableTemplate({data, pageNumber});
        el.html(html);
        $('.loading').removeClass('loading');
    }
    if (event.target.matches('.row-item')) {
        // Don't follow the link
        event.preventDefault();

        const target = $(event.target);
        // $('.item').removeClass('active');
        // target.addClass('sorted');

        // new page

        const selectedRow = target.attr('data-value');
        const rowItem = data.find(x => x['sn'] === selectedRow);
        let html = detailTemplate(rowItem);
        el.html(html);
        $('.loading').removeClass('loading');
    }
}, false);


Handlebars.registerHelper('times', function (n, block) {
    let sum = '';
    for (let i = 1; i <= n; ++i)
        sum += block.fn(i);
    return sum;
});


columnSorter = function (column, reverse = false) {
    return function (a, b) {
        let val;
        if (!isNaN(a[column]) && !isNaN(b[column])) {
            val = parseFloat(a[column]) - parseFloat(b[column]);
        } else {
            val = a[column] > b[column] ? 1 : -1;
        }
        return reverse ? val * -1 : val;
    }
};

getPaginationValues = function (totalRows, pageNumber) {
    let startPage = pageSize * (pageNumber - 1);
    let endPage = pageSize * (pageNumber);
    let totalPageNumber = Math.ceil(totalRows / pageSize);

    return [startPage, endPage, totalPageNumber]
};