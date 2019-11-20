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
                        select.append($("<option></option>").attr("value", value).text(value));
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

        function setSelectSingle(url, select, field) {
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

        function setCities() {
            let url = `/Cities`;
            let select = $("#select-cities");
            let fieldName = "city";
            setSelectSingle(url, select, fieldName);
        }

        function initForm() {
            setOrgTypes();
            setStates();
            setCities();
            $("#form-clear").on("click", function () {
                $('#form-search')[0].reset();
            });
        }

        function handleSearch() {
            $("#form-search").on("submit", function (event) {
                event.preventDefault();
                //First, clear prev results
                $("#search-results").children().not(":first").remove();

                let params = $(this).serialize();
                let searchUrl = "/Organizations";
                $.ajax({
                    "url": proxy_url,
                    "data": { "path": searchUrl + "?" + params },
                    "success": function (data) {
                        if ($("row", data).length != 0) {
                            showInTable(data);

                        }
                        else {
                            let div = $("#search-results");
                            addNotFound(div);
                        }
                    },
                    "error": function (xhr, data, err) {
                        console.error(`Error:`, xhr, data, err);
                    }
                });
            });
        }

        function showInTable(data) {
            console.log(data);
            let table = getTable();
            $("row", data).each(function () {
                let tr = document.createElement("tr");
                let results = []
                let id = $("OrganizationID", this).text();
                results.push($("type", this).text());
                results.push($("Name", this).text());
                results.push($("city", this).text());
                results.push($("zip", this).text());
                results.push($("CountyName", this).text());
                results.push($("State", this).text());
                $(results).each(function (i) {
                    let td = document.createElement("td");
                    if (i === 1) {
                        let link = document.createElement("a");
                        link.append(results[i]);
                        let access_link = proxy_url;
                        access_link += "?path=";
                        access_link += "/Application/Tabs?orgId="+id;
                        link.setAttribute("href", access_link);
                        td.append(link);
                    }
                    else {
                        td.append(results[i]);
                    }
                    tr.append(td);
                });
                table.append(tr);
            });
            $("#search-results").append(table);
        }

        function getTable() {
            let table = document.createElement("table");
            let thead = document.createElement("thead");
            let tbody = document.createElement("tbody");
            let headers = ["Type", "Name", "City", "Zip", "County", "State"];
            $(headers).each(function (i) {
                let th = document.createElement("th");
                th.append(headers[i]);
                thead.append(th);
            });
            table.append(thead);
            table.append(tbody);

            $(table).addClass("table");
            $(table).addClass("table-striped")
            $(thead).addClass("thead-dark");
            return table;
        }
        return {
            init: function () {
                // init data members
                proxy_url = `https://people.rit.edu/dmgics/754/23/proxy.php`;
                initForm();
                handleSearch();
            }
        }

        function addNotFound(div) {
            let text = document.createTextNode("No results found");
            div.append(text);
        }
    })();
    helpMe.init();
});