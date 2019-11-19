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

        function setSelectSingle(url, select, field){
            $.ajax({
                "url": proxy_url,
                "data": { path: url },
                "success": function (data) {
                    let fields = parseXmlDataSingle(data, field);
                    $.each(fields, function (i) {
                        select.append($("<option></option>").attr("value", fields[i]).text(fields[i]));
                    });
                },
                "error": function (xhr, data, err) {
                    console.error(`Error:`, xhr, data, err);
                }
            });
        }
        

        function parseXmlDataSingle(xmlData, field) {
            let states = []
            $("row", xmlData).each(function (data) {
                let state = $(field, this).text();
                states.push(state);
            });
            return states;
        }

        function setStates() {
            let url = `/States`;
            let select = $("#select-states");
            let fieldName = "State";
            setSelectSingle(url, select, fieldName);
        }

        function setCities(){
            let url = `/Cities`;
            let select = $("#select-cities");
            let fieldName = "city";
            setSelectSingle(url, select, fieldName);
        }

        function initForm() {
            setOrgTypes();
            setStates();
            setCities();
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