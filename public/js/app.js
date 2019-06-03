window.addEventListener('load', () => {
    const el = $('#app');

    // Compile Handlebar Templates
    const errorTemplate = Handlebars.compile($('#error-template').html());
    const tableTemplate = Handlebars.compile($('#table-template').html());

    // Instantiate api handler
    const api = axios.create({
        baseURL: window.location.origin+'/api',
        timeout: 5000,
    });

    const router = new Router({
        mode: 'history',
        page404: (path) => {
            const html = errorTemplate({
                color: 'yellow',
                title: 'Error 404 - Page NOT Found!',
                message: `The path '/${path}' does not exist on this site`,
            });
            el.html(html);
        },
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
            const response = await api.get('/');
            data = response.data;
            // localStorage.setItem('__agric_data__', JSON.stringify());
            // Display Rates Table
            html = tableTemplate({data});
            el.html(html);
            $('.loading').removeClass('loading');
        } catch (error) {
            showError(error);
        }
    });
    // Display Latest Currency Rates
    // router.add('/page/', async () => {
    //     // Display loader first
    //     let html = tableTemplate();
    //     el.html(html);
    //     try {
    //         // Load Currency Rates
    //         data = JSON.parse(localStorage.getItem('__agric_data__'));
    //         // Display Rates Table
    //         html = tableTemplate({base, date, rates});
    //         el.html(html);
    //         $('.loading').removeClass('loading');
    //     } catch (error) {
    //         showError(error);
    //     }
    // });


    router.navigateTo(window.location.pathname);

    // Highlight Active Menu on Load
    const link = $(`a[href$='${window.location.pathname}']`);
    link.addClass('active');

    $('a').on('click', (event) => {
        // Block page load
        event.preventDefault();

        // Highlight Active Menu on Click
        const target = $(event.target);
        $('.item').removeClass('active');
        target.addClass('active');

        // Navigate to clicked url
        const href = target.attr('href');
        const path = href.substr(href.lastIndexOf('/'));
        router.navigateTo(path);
    });
});
