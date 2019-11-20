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
                $("#search-results").children().remove();
                let h3 = document.createElement("h3");
                h3.append(document.createTextNode("Search Results"));
                $("#search-results").append(h3);

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
            let table = getTable();
            let tbody = document.createElement("tbody");
            table.append(tbody);
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
                    $(td).addClass("text-center");
                    if (i === 1) {
                        let btn = document.createElement("button");
                        btn.append(results[i]);
                        let access_link = proxy_url;
                        access_link += "?path=";
                        access_link += "/Application/Tabs?orgId="+id;
                        btn.setAttribute("data-href", access_link);
                        btn.setAttribute("href", "#");
                        $(btn).addClass("link-get-tabs");
                        $(btn).addClass("btn btn-link");
                        td.append(btn);
                    }
                    else {
                        td.append(results[i]);
                    }
                    tr.append(td);
                });
                tbody.append(tr);
            });
            $("#search-results").append(table);
            $("#table-search-results").tablesorter();
        }

        function getTable() {
            let table = document.createElement("table");
            table.setAttribute("id", "table-search-results");
            let thead = document.createElement("thead");
            let tr_thead = document.createElement("tr"); //Must be a <tr> inside thead
            thead.append(tr_thead);
            let headers = ["Type", "Name", "City", "Zip", "County", "State"];
            $(headers).each(function (i) {
                let th = document.createElement("th");
                $(th).addClass("text-center")
                th.append(headers[i]);
                tr_thead.append(th);
            });
            table.append(thead);

            $(table).addClass("table table-dark");
            $(table).addClass("table-striped")
            return table;
        }

        function addTabsListener(){
            $(document).on("click", ".link-get-tabs", function(e){
                e.preventDefault();
                let orgLink = $(this).data("href");
                showDetails(orgLink);
            });
        }

        function showDetails(orgLink){
            console.log("Received link", orgLink);
            $("#details-ui").children().remove();
            let h3 = document.createElement("h3");
            h3.append(document.createTextNode("Details"));
            $("details-ui").append(h3);

            
        }
        return {
            init: function () {
                // init data members
                proxy_url = `https://people.rit.edu/dmgics/754/23/proxy.php`;
                initForm();
                handleSearch();
                addTabsListener();
            }
        }

        function addNotFound(div) {
            let text = document.createTextNode("No results found");
            div.append(text);
        }
    })();
    helpMe.init();
});