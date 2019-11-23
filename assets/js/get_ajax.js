(function ($) {

    $.fn.getAjaxdata = function (fn, url, params) {
        $.ajax({
            "url": url,
            "data": params,
            "success": function (data) {
                fn(data)
            },
            "error": function (xhr, data, err) {
                console.error(`Error:`, xhr, data, err);
            }
        });
    };
}(jQuery));