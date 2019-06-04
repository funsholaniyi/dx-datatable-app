// Initialise commonly used variables
const pageSize = 150;
let startPage = 1;
let endPage = 1;
let pageNumber = 1;
let all_data = localStorage.getItem('__agric_data__') ? JSON.parse(localStorage.getItem('__agric_data__')) : null;
let data = {};
let sortHistory = [];
const el = $('#app');
let cellData = 'Nothing';

// Compile Handlebar Templates
const errorTemplate = Handlebars.compile($('#error-template').html());
const tableTemplate = Handlebars.compile($('#table-template').html());
const loaderTemplate = Handlebars.compile($('#loader-template').html());

window.addEventListener('load', () => {

    // Instantiate api handler
    const api = axios.create({
        baseURL: 'https://dx-challenge-backend.herokuapp.com',
        timeout: 10000,
    });

    // Instantiate router handler
    const router = new Router({
        mode: 'history'
    });

    // Display Error Banner
    const showError = (error) => {
        const {title, message} = {title: 'Remote Error', message: 'An error occurred'};
        const html = errorTemplate({color: 'red', title, message});
        el.html(html);
    };

    // Get Page Data
    router.add('/', async () => {
        // Display loader first
        let html = loaderTemplate();
        el.html(html);
        try {
            // Load Data either from local storage or get new from endpoint
            if (all_data === null) {
                const response = await api.get('/');
                all_data = response.data;
                localStorage.setItem('__agric_data__', JSON.stringify(all_data));
            }

            // Display Data Table
            const selectedPageNumber = 1;
            [startPage, endPage, pageNumber] = getPaginationValues(all_data.length, selectedPageNumber);
            data = all_data.slice(startPage, endPage);
            html = tableTemplate({data, pageNumber});
            el.html(html);
        } catch (error) {
            showError(error);
        }
    });
    // tell router to go to the function that hnadles /
    router.navigateTo(window.location.pathname);
});

document.addEventListener('click', function (event) { // listen to all click event in the document

    // If the clicked element is page number
    if (event.target.matches('.page-number')) {
        // Don't follow the link
        event.preventDefault();
        const target = $(event.target);

        // get page number
        const selectedPageNumber = target.attr('data-value');

        // get pagination data
        [startPage, endPage, pageNumber] = getPaginationValues(all_data.length, selectedPageNumber);

        // get paginated data
        data = all_data.slice(startPage, endPage);
        // re-render
        let html = tableTemplate({data, pageNumber});
        el.html(html);
    }
    // If the clicked element is column head for sorting
    if (event.target.matches('.column-head')) {
        event.preventDefault();

        const target = $(event.target);

        const selectedColumn = target.attr('data-value');

        // find out if column has been clicked before
        const reverse = sortHistory.includes(selectedColumn);
        // remove or append new column to click history
        !reverse ? sortHistory.push(selectedColumn) : sortHistory.splice(sortHistory.indexOf(selectedColumn), 1);

        // call the data sort function with our special decorator function
        data = data.sort(columnSorter(selectedColumn, reverse));

        // re-render
        let html = tableTemplate({data, pageNumber});
        el.html(html);
    }
    // if table cell is clicked
    if (event.target.matches('.row-item')) {

        const target = $(event.target);
        $('tr').removeClass('branded-row'); // remove previous row branding
        target.parent().addClass('branded-row'); // get the parent element

        // get cell data and give to its view port
        cellData = target.html();
        $('#cell-data').html(cellData);

        // we can as well get the whole row, incase we need it
        // const selectedRow = target.attr('data-value');
        // const rowItem = data.find(x => x['sn'] === selectedRow);

    }
}, false);

$('.search-table').keyup(event => { // listen to button press events on the search bar

    const target = $(event.target);
    let search = target.val().toUpperCase(); // turn to uppercase since all of our string data is in uppercase

    data = all_data.filter(x => {
        return x['year'] === search || x['region'] === search || x['district'] === search // search by the three columns
    });

    if (data !== null) { // if we got something, re-render
        let html = tableTemplate({data});
        el.html(html);
    }


    if (!search) { // if input was cleared, get to normal life
        data = all_data.slice(0, pageSize);
        let html = tableTemplate({data, pageNumber});
        el.html(html);
    }
});

// Our dear helpers

Handlebars.registerHelper('times', function (n, block) { // to help loop by a specified number in the view
    let sum = '';
    for (let i = 1; i <= n; ++i)
        sum += block.fn(i);
    return sum;
});


columnSorter = function (column, reverse = false) { // return a function that sorts, and uses column and reverse to know how to sort it
    return function (a, b) {
        let val;
        if (!isNaN(a[column]) && !isNaN(b[column])) {
            val = parseFloat(a[column]) - parseFloat(b[column]);
        } else {
            val = a[column] > b[column] ? 1 : -1;
        }
        return reverse ? val * -1 : val; // if reversed, well, reverse it, since negative means reverse, we negate
    }
};

getPaginationValues = function (totalRows, pageNumber) { // crunch get pagination data
    let startPage = pageSize * (pageNumber - 1);
    let endPage = pageSize * (pageNumber);
    let totalPageNumber = Math.ceil(totalRows / pageSize);

    return [startPage, endPage, totalPageNumber]
};


// I really want this, hope to see you, yes you, soon! :), peace