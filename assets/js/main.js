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
                //First, clear prev results and details.
                $("#search-results").children().remove();
                $("#details-ui").children().remove();
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
                        btn.setAttribute("data-orgid", id);
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

        function addTabsListener() {
            $(document).on("click", ".link-get-tabs", function (e) {
                e.preventDefault();
                let id = $(this).data("orgid");
                showDetails(id);
            });
        }

        function showDetails(id) {
            //Clear results
            $("#search-results").children().remove();
            addDetailsBoilerplate();
            getTabs(id);
        }

        function addDetailsBoilerplate() {
            let detailsUI = $("#details-ui");
            detailsUI.children().remove();
            let h3 = document.createElement("h3");
            h3.append(document.createTextNode("Details"));
            detailsUI.append(h3);
            let div = document.createElement("div");
            $(div).attr("id", "tabs");
            detailsUI.append(div);
        }

        function getTabs(id) {
            let access_link = proxy_url;
            access_link += "?path=";
            access_link += "/Application/Tabs?orgId=" + id;
            $.ajax({
                "url": access_link,
                success: function (data) {
                    buildTabs(data, id);
                }
            });
        }

        function buildTabs(data, id) {
            let ul = getUlForData(data);
            $("#tabs").append(ul);
            let arrayOfDivs = getDivContentFordata(data, id);
            arrayOfDivs.forEach(function (div) {
                $("#tabs").append(div);
            });
            $("#tabs").tabs();
        }

        function getUlForData(data) {
            let ul = document.createElement("ul");
            $("row", data).each(function () {
                let organization = document.createTextNode($(this).text());

                let link = document.createElement("a");
                link.setAttribute("href", "#" + $(this).text());
                link.append(organization);

                let li = document.createElement("li");
                li.append(link);

                ul.append(li);
            });
            return ul;
        }

        function getDivContentFordata(data, id) {
            let divs = [];
            $("row", data).each(function () {
                let org = $(this).text();
                let div = document.createElement("div");
                div.setAttribute("id", org);
                let contentDiv = document.createElement("div");
                div.append(contentDiv);
                if (org === "General") {
                    let name = document.createElement("p");
                    name.setAttribute("id", "p-general-name");
                    let email = document.createElement("p");
                    email.setAttribute("id", "p-general-email");
                    let website = document.createElement("p");
                    website.setAttribute("id", "p-general-website");
                    let description = document.createElement("p");
                    description.setAttribute("id", "p-general-description");
                    let nummembers = document.createElement("p");
                    nummembers.setAttribute("id", "p-general-nummembers");
                    let numcalls = document.createElement("p");
                    numcalls.setAttribute("id", "p-general-numcalls");
                    let serviceArea = document.createElement("p");
                    serviceArea.setAttribute("id", "p-general-serviceArea");
                    let contents = [name, email, website, description, nummembers, numcalls, serviceArea];
                    $(contents).each(function (i) {
                        contentDiv.append(contents[i]);
                    });
                    setGeneralInfo(id, contentDiv);
                }
                else if (org === "Treatment") {
                    setTreatmentInfo(id, contentDiv);
                }
                else if (org === "Training") {
                    setTrainingInfo(id, contentDiv);
                }
                else if (org === "Facilities") {
                    setFacilitiesInfo(id, contentDiv);
                }
                else if (org === "Physicians") {
                    setPhysiciansInfo(id, contentDiv);
                }
                else if (org === "People") {
                    setPeopleInfo(id, contentDiv);
                }
                else if (org === "Locations") {
                    setLocationInfo(id, contentDiv);
                }
                divs.push(div);
            });
            return divs;
        }

        function setGeneralInfo(id, contentDiv) {
            let url = `/${id}/General`;
            $.ajax({
                "url": proxy_url,
                "data": { path: url },
                "success": function (data) {
                    let name = $("name", data).text(),
                        email = $("email", data).text(),
                        website = $("website", data).text(),
                        description = $("description", data).text(),
                        nummembers = $("nummembers", data).text(),
                        numcalls = $("numcalls", data).text(),
                        serviceArea = $("serviceArea", data).text();
                    $("#p-general-name").html(`Name: ${name}`);
                    $("#p-general-email").html(`Email: <a class="link-blue" href=mailto:${email}>${email}</a>`);
                    $("#p-general-website").html(`Website: <a class="link-blue" href=${website}>${website}</a>`);
                    $("#p-general-description").html(`Description: ${description}`);
                    $("#p-general-nummembers").html(`Number of Members: ${nummembers}`);
                    $("#p-general-numcalls").html(`Number of calls last year: ${numcalls}`);
                    $("#p-general-serviceArea").html(`Service Area: ${serviceArea}`);
                },
                "error": function (xhr, data, err) {
                    console.error(`Error:`, xhr, data, err);
                }
            });
        }

        function setTreatmentInfo(id, contentDiv) {
            let url = `/${id}/Treatments`;
            $.ajax({
                "url": proxy_url,
                "data": { path: url },
                "success": function (data) {
                    $("treatment", data).each(function (i) {
                        let type = $("type", $("treatment", data)[i]).text()
                        let abbreviation = $("abbreviation", $("treatment", data)[i]).text()
                        let p = document.createElement("p");
                        $(p).html(`${type}: <b>${abbreviation}</b>`);
                        contentDiv.append(p);
                    });
                },
                "error": function (xhr, data, err) {
                    console.error(`Error:`, xhr, data, err);
                }
            });
        }

        function setTrainingInfo(id, contentDiv) {
            let url = `/${id}/Training`;
            $.ajax({
                "url": proxy_url,
                "data": { path: url },
                "success": function (data) {
                    $("training", data).each(function (i) {
                        let type = $("type", $("training", data)[i]).text();
                        let abbreviation = $("abbreviation", $("training", data)[i]).text();
                        let p = document.createElement("p");
                        $(p).html(`${type}: <b>${abbreviation}</b>`);
                        contentDiv.append(p);
                    });
                },
                "error": function (xhr, data, err) {
                    console.error(`Error:`, xhr, data, err);
                }
            });
        }

        function setFacilitiesInfo(id, contentDiv) {
            let url = `/${id}/Facilities`;
            let table = document.createElement("table");
            $(table).addClass("table table-striped");
            contentDiv.append(table);
            let thead = document.createElement("thead");
            table.append(thead);
            let headers = ["Name", "Quantity", "Description"];
            $.each(headers, function (index, header) {
                let th = document.createElement("th");
                thead.append(th);
                th.append(header);
            });
            let tbody = document.createElement("tbody");
            table.append(tbody);
            $.ajax({
                "url": proxy_url,
                "data": { path: url },
                "success": function (data) {
                    $("facility", data).each(function (i) {
                        let tr = document.createElement("tr");
                        let type = $("type", $("facility", data)[i]).text();
                        let quantity = $("quantity", $("facility", data)[i]).text();
                        let description = $("description", $("facility", data)[i]).text();
                        let td = document.createElement("td");
                        td.append(type);
                        tr.append(td);
                        td = document.createElement("td");
                        td.append(quantity)
                        tr.append(td);
                        td = document.createElement("td");
                        td.append(description);
                        tr.append(td);
                        tbody.append(tr);
                    });
                },
                "error": function (xhr, data, err) {
                    console.error(`Error:`, xhr, data, err);
                }
            });
        }

        function setPhysiciansInfo(id, contentDiv) {
            let url = `/${id}/Physicians`;
            let table = document.createElement("table");
            $(table).addClass("table table-striped");
            contentDiv.append(table);
            let thead = document.createElement("thead");
            table.append(thead);
            let headers = ["Name", "License", "Contact"];
            $.each(headers, function (index, header) {
                let th = document.createElement("th");
                thead.append(th);
                th.append(header);
            });
            let tbody = document.createElement("tbody");
            table.append(tbody);
            $.ajax({
                "url": proxy_url,
                "data": { path: url },
                "success": function (data) {
                    $("physician", data).each(function (i) {
                        let tr = document.createElement("tr");
                        let fName = $("fName", $("physician", data)[i]).text();
                        let mName = $("mName", $("physician", data)[i]).text();
                        let lName = $("lName", $("physician", data)[i]).text();
                        let name = fName + " " + mName + " " + lName;
                        let license = $("license", $("physician", data)[i]).text();
                        let phone = $("phone", $("physician", data)[i]).text();
                        let td = document.createElement("td");
                        td.append(name);
                        tr.append(td);
                        td = document.createElement("td");
                        td.append(license)
                        tr.append(td);
                        td = document.createElement("td");
                        td.append(phone);
                        tr.append(td);
                        tbody.append(tr);
                    });
                },
                "error": function (xhr, data, err) {
                    console.error(`Error:`, xhr, data, err);
                }
            });
        }

        function setPeopleInfo(id, contentDiv) {
            let url = `/${id}/People`;
            let contentDisplayer = document.createElement("div");

            $.ajax({
                "url": proxy_url,
                "data": { path: url },
                "success": function (data) {
                    let select = getSelectForPeople(data, contentDisplayer);
                    contentDiv.append(select);
                    contentDiv.append(contentDisplayer);
                },
                "error": function (xhr, data, err) {
                    console.error(`Error:`, xhr, data, err);
                }
            });
        }

        function getSelectForPeople(data, contentDisplayer) {
            let select = document.createElement("select");
            $("site", data).each(function (i) {
                let site = $("site", data)[i];
                let siteId = $(site).attr("siteId");
                let siteAddr = $(site).attr("address");
                let option = document.createElement("option");
                option.append(siteAddr);
                $(option).attr("value", siteId);
                select.append(option);
            });
            changePeopleData(1, data, contentDisplayer);
            $(select).on("change", function () {
                changePeopleData(this.value, data, contentDisplayer)
            });
            return select;
        }

        function changePeopleData(siteId, data, contentDisplayer) {
            $(contentDisplayer).children().remove();
            let peopleData = $(data).find(`site[siteId=${siteId}]`);

            let table = document.createElement("table");
            $(table).addClass("table table-striped");
            contentDisplayer.append(table);
            let thead = document.createElement("thead");
            table.append(thead);
            let headers = ["Name", "Role"];
            $.each(headers, function (index, header) {
                let th = document.createElement("th");
                thead.append(th);
                th.append(header);
            });
            let tbody = document.createElement("tbody");
            table.append(tbody);

            $("person", peopleData).each(function (i) {
                let fname = $("fName", $("person", peopleData)[i]).text();
                let mName = $("mName", $("person", peopleData)[i]).text();
                let lName = $("lName", $("person", peopleData)[i]).text();
                let name = fname + " " + mName + " " + lName;
                let role = $("role", $("person", peopleData)[i]).text();
                let tr = document.createElement("tr");
                let td = document.createElement("td");
                td.append(name);
                tr.append(td);
                td = document.createElement("td");
                td.append(role);
                tr.append(td);
                tbody.append(tr);
            });
        }

        function setLocationInfo(id, contentDiv) {
            let url = `/${id}/Locations`;
            let contentDisplayer = document.createElement("div");
            $(contentDisplayer).addClass("contentDisplayer");
            contentDiv.append(contentDisplayer);
            let custom = document.createElement("div");
            $(custom).addClass("row");
            contentDiv.append(custom);
            contentDisplayer.append(custom);

            let rowDiv = document.createElement("div");
            $(rowDiv).addClass("row");
            contentDisplayer.append(rowDiv);
            let textInfo = document.createElement("div");
            $(textInfo).addClass("col-12 col-md-5");
            let mapDiv = document.createElement("div");
            $(mapDiv).attr("id", "mapid");
            $(mapDiv).addClass("col-12 col-md-7");
            rowDiv.append(textInfo);
            rowDiv.append(mapDiv);
            $.ajax({
                "url": proxy_url,
                "data": { path: url },
                "success": function (data) {
                    let map = L.map('mapid');
                    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    }).addTo(map);
                    let select = getSelectForLocations(data, textInfo, map);
                    contentDisplayer.prepend(select);
                },
                "error": function (xhr, data, err) {
                    console.error(`Error:`, xhr, data, err);
                }
            });
        }

        function getSelectForLocations(data, textInfo, map) {
            let select = document.createElement("select");
            let option = document.createElement("option");
            option.append(document.createTextNode("Select Location Type"));
            $(option).attr("value", "");
            select.append(option);
            let location = $("location", data);
            console.log(data);
            location.each(function (i) {
                let type = $("type", location[i]).text();
                let siteId = $("siteId", location[i]).text();
                let option = document.createElement("option");
                option.append(type);
                $(option).attr("value", siteId);
                select.append(option);
            });
            $(select).on("change", function () {
                changeLocationData(this.value, data, textInfo, map);
            });
            return select;
        }

        function changeLocationData(siteId, data, textInfo, map) {
            $(textInfo).children().remove();
            let location = $("location", data);
            location.each(function (i) {
                let id = $("siteId", location[i]).text();
                if (id === siteId) {
                    let infos = {
                        type: $("type", location[i]).text(),
                        address1: $("address1", location[i]).text(),
                        address2: $("address2", location[i]).text(),
                        city: $("city", location[i]).text(),
                        state: $("state", location[i]).text(),
                        zip: $("zip", location[i]).text(),
                        phone: $("phone", location[i]).text(),
                        ttyphone: $("ttyphone", location[i]).text(),
                        fax: $("fax", location[i]).text(),
                        latitude: $("latitude", location[i]).text(),
                        longitude: $("longitude", location[i]).text()
                    };
                    $.each(infos, function (key, value) {
                        let p = document.createElement("p");
                        $(p).html(`${key}: <b>${value}</b>`);
                        textInfo.append(p);
                    });
                    console.log(`"${infos.latitude}"`, `"${infos.longitude}"`);
                    map.setView([infos.latitude, infos.longitude], 13);
                    L.marker([infos.latitude, infos.longitude]).addTo(map).openPopup();
                }
            });
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