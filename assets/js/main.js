"use strict";
$(function () {
    let helpMe = (function () {
        let proxy_url;

        function setOrgTypes() {
            let url = `/OrgTypes`;
            $.ajax({
                "url": proxy_url,
                "data": { path: url },
                "success": function (data) {
                    let orgTypes = parseOrgTypes(data);
                    let select = $("#select-orgType");
                    $.each(orgTypes, function (key, value) {
                        select.append($("<option></option>").attr("value", key).text(value));
                    });
                },
                "error": function (xhr, data, err) {
                    console.error(`Error:`, xhr, data, err);
                }
            });
        }

        function parseOrgTypes(xmlData) {
            let orgTypes = {}
            $("row", xmlData).each(function (data) {
                let id = parseInt($("typeId", this).text());
                let type = $("type", this).text()
                orgTypes[id] = type;
            });
            return orgTypes;
        }

        function setStates() {
            let url = `/States`;
            $.ajax({
                "url": proxy_url,
                "data": { path: url },
                "success": function (data) {
                    let states = parseStates(data);
                    let select = $("#select-states");
                    $.each(states, function (i) {
                        select.append($("<option></option>").attr("value", states[i]).text(states[i]));
                    });
                },
                "error": function (xhr, data, err) {
                    console.error(`Error:`, xhr, data, err);
                }
            });
        }

        function parseStates(xmlData) {
            let states = []
            $("row", xmlData).each(function (data) {
                let state = $("State", this).text();
                states.push(state);
            });
            return states;
        }

        function initForm() {
            setOrgTypes();
            setStates();
        }
        return {
            init: function () {
                // init data members
                proxy_url = `https://people.rit.edu/dmgics/754/23/proxy.php`;
                initForm();
            }
        }
    })();
    helpMe.init();
});