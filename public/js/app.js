window.addEventListener('load', () => {
    const el = $('#app');

    // Compile Handlebar Templates
    const tableTemplate = Handlebars.compile($('#table-template').html());

    const html = tableTemplate();
    el.html(html);
});