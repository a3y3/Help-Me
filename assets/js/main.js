"use strict";
$(function () {
    let helpMe = (function () {
        let proxy_url;
        let getOrgTypes = function () {
            let url = `/OrgTypes`;
            $.ajax({
                "url": proxy_url,
                "data": { path: url },
                "success": function (data) {
                    return parseOrgTypes(data);
                },
                "error": function (xhr, data, err) {
                    console.error( `Error:`, xhr, data, err);
                }
            });
        }
        function parseOrgTypes(xmlData){
            let orgTypes = {}
            $("row", xmlData).each(function(data){
                let id = parseInt($("typeId", this).text());
                let type = $("type", this).text()
                orgTypes[id] = type;
            });
            return orgTypes;
        }
        return {
            init: function () {
                // init data members
                proxy_url = `https://people.rit.edu/dmgics/754/23/proxy.php`;

                // init member functions
                getOrgTypes();
            }
        }
    })();
    helpMe.init();
});