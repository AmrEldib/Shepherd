/// <reference path="jquery-2.1.1.min.js" />
/// <reference path="handlebars.min.js" />
/// <reference path="bootstrap.min.js" />
/// <reference path="jquery.fancybox.js" />

var treeObject;
var esriEnums;
var name_divInfo = "infoPanel";
var name_txtServerUrl = "txtServerUrl";
var name_divTree = "treeDiv";
var name_btnEsriSampleServer = "esriSampleServerButton";
var name_ulEsriSampleServer = "esriSampleServersList";

String.prototype.endsWith = function (suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

function getBaseUrl(url) {
    pathArray = url.split('/');
    host = pathArray[2];
    return host;
}

function setServerUrl(serverUrl) {
    $("#" + name_txtServerUrl).val(serverUrl);
    btnGetServerInfo_Click(serverUrl);
}

function addFolderToTree(folder, treeObject, parentNode) {
    treeObject.create_node(parentNode,
        {
            text: folder,
            icon: getItemIcon("Folder"),
            state: {
                opened: true
            },
            data: {
                itemType: "Folder",
                itemUrl: parentNode.data.itemUrl + folder + "/",
                itemJson: undefined
            }
        }, "last", null, null);
}

function getServiceType(serviceUrl) {
    var serviceTypeArray = serviceUrl.split('/');
    var serviceType = serviceTypeArray[serviceTypeArray.length - 1];
    return serviceType;
}

function getItemIcon(itemType) {
    switch (itemType) {
        case "Folder":
        case "MapServer":
        case "FeatureServer":
        case "GPServer":
        case "ImageServer":
        case "MobileServer":
        case "Server":
            return "img/TreeIcons/treeicon_" + itemType + ".png";
        case "GeocodeServer":
        case "NAServer":
        case "GeometryServer":
        default:
            return "img/TreeIcons/treeicon_other.png";
    }
}

function getServiceIconFromUrl(serviceUrl) {
    return getItemIcon(getServiceType(serviceUrl));
}

function getTemplatePath(itemType) {
    if (itemType === "Folder") {
        return "templates/folderInfo.html";
    }
    else {
        switch (itemType) {
            case "GPServer":
            case "MapServer":
            case "ImageServer":
            case "MobileServer":
            case "FeatureServer":
            case "NAServer":
            case "GeocodeServer":
            case "GeometryServer":
                return "templates/serviceInfo_" + itemType + ".html";
            default:
                return "templates/serviceInfo.html";
        }

    }
}

function addServiceToTree(service, treeObject, parentNode) {

    var serviceNameArray = service.name.split('/');
    var serviceName = serviceNameArray[serviceNameArray.length - 1];

    treeObject.create_node(parentNode,
        {
            text: serviceName + " (" + service.type + ")",
            icon: getItemIcon(service.type),
            data: {
                itemType: service.type,
                itemUrl: parentNode.data.itemUrl + serviceName + "/" + service.type,
                itemJson: undefined
            }
        }, "last", null, null);
}

function writeItemToTree(treeObject, treeNode) {
    try {
        treeNode.data.itemJson.folders.forEach(function (folder) { addFolderToTree(folder, treeObject, treeNode); });
        treeNode.data.itemJson.services.forEach(function (service) { addServiceToTree(service, treeObject, treeNode); });
    }
    catch (error) {
        console.log(error);
    }
}

function getItemDetails(url, treeNode, callback) {
    // Go to the server only if the item's JSON wasn't retrieved before.
    if (!treeNode.data.itemJson) {
        $.getJSON(url + "?f=json&callback=?", function (json) {
            console.log(json);
            // Write the JSON response to the node
            treeNode.data.itemJson = json;
            // Call callback function
            callback();
        });
    }
    else {
        callback();
    }
}

function btnGetServerInfo_Click(serverUrl) {
    if (!serverUrl.endsWith("/")) {
        serverUrl = serverUrl + "/";
    }
    var baseUrl = getBaseUrl(serverUrl);
    var serverNodeName = treeObject.create_node("#",
                {
                    text: baseUrl,
                    icon: getItemIcon("Server"),
                    state: {
                        opened: true
                    },
                    data: {
                        itemType: "Server",
                        itemUrl: serverUrl,
                        itemJson: undefined
                    }
                }, "last", null, null);
    getItemDetails(serverUrl, treeObject.get_node(serverNodeName), function () {
        writeItemToTree(treeObject, treeObject.get_node(serverNodeName));
    });
}

function displayBooleanAsImage(boolValue, trueTitle, falseTitle) {
    if (boolValue) {
        return "<img src='img/GreenCheckMark.png' alt='" + trueTitle + "' title='" + trueTitle + "' />";
    }
    else {
        return "<img src='img/RedXMark.png' alt='" + falseTitle + "' title='" + falseTitle + "' />";
    }
}

function convertCommaSeparatedTextToList(textValue) {
    if (textValue == undefined | textValue === "") {
        return "N/A";
    }
    else {
        var textValueAsArray = textValue.split(",");
        var listHtml;
        listHtml = "<ul>"
        textValueAsArray.forEach(function (textItem) {
            listHtml += "<li>" + textItem + "</li>";
        });
        listHtml += "</ul>"
        return listHtml;
    }
}

function convertEsriDomainToList(esriDomainValue) {
    if (esriDomainValue == undefined | esriDomainValue === "" | esriDomainValue === "null") {
        return "N/A";
    }
    else {
        var esriDomainList = "";
        esriDomainList += esriDomainValue.name + " (" + esriDomainValue.type + ")<br/>";
        switch (esriDomainValue.type) {
            case "codedValue":
                esriDomainList += "<ul>";
                esriDomainValue.codedValues.forEach(function (codedValue) {
                    esriDomainList += "<li>" + codedValue.name + " (" + codedValue.code + ")</li>"
                });
                esriDomainList += "</ul>";
                break;
            case "range":
                esriDomainList += "Min: " + esriDomainValue.ranges.minValue + "<br/>";
                esriDomainList += "Max: " + esriDomainValue.ranges.maxValue + "<br/>";
                break;
            default:
                break;
        }
        return esriDomainList;
    }
}

function convertEnumToString(enumType, enumValue) {
    if (enumValue == undefined | enumValue === "") {
        return "N/A";
    }
    else {
        try {
            var targetEnumList = $.grep(esriEnums, function (enumList) {
                return enumList.type === enumType;
            });
            if (targetEnumList.length === 0) {
                return "N/A";
            }
            var targetEnumItem = $.grep(targetEnumList[0].values, function (enumItem) {
                return enumItem.value === enumValue;
            });
            if (!targetEnumItem.length === 0) {
                return "N/A";
            }
            if (!targetEnumItem[0].title) {
                return "N/A";
            }
            return targetEnumItem[0].title;
        } catch (e) {
            console.log(e);
        }
    }
}

function displayTextOrNA(textValue) {
    if (textValue === undefined | textValue === "") {
        return "N/A";
    }
    else {
        return textValue;
    }
}

function displayNumberOrNA(numberValue) {
    if (numberValue === undefined) {
        return "N/A";
    }
    else {
        return numberValue;
    }
}

function setupHandlebarsHelpers() {
    // getFolderName: gets name of folder from URL.
    Handlebars.registerHelper('getFolderName', function (url) {
        var folderNameArray = url.split('/');
        var folderName = folderNameArray[folderNameArray.length - 2];
        return folderName;
    });

    // extractServiceName: extracts name of service from the service URL.
    // "http://sampleserver5.arcgisonline.com/arcgis/rest/services/Elevation/WorldElevations/MapServer/" ---> "ESRI_Elevation_World"
    Handlebars.registerHelper('getServiceName', function (serviceUrl) {
        var serviceNameArray = serviceUrl.split('/');
        var serviceName = serviceNameArray[serviceNameArray.length - 2];
        return serviceName;
    });

    // getServiceType: extracts name of service from the name returned from AGS.
    // "Elevation/ESRI_Elevation_World" ---> "ESRI_Elevation_World"
    Handlebars.registerHelper('getServiceType', function (serviceUrl) {
        return getServiceType(serviceUrl);
    });

    // getItemIcon: gets an image that represents the service based on its type.
    Handlebars.registerHelper('getItemIcon', function (itemType) {
        return getItemIcon(itemType);
    });

    // getServiceIconFromUrl: gets an image that represents the service based on its URL.
    Handlebars.registerHelper('getServiceIconFromUrl', function (serviceUrl) {
        return getServiceIconFromUrl(serviceUrl);
    });

    // displayBooleanAsImage: Writes the HTML of an image that represents a Boolean value.
    // True as a Green checkmark. False as a Red X.
    Handlebars.registerHelper('displayBooleanAsImage', displayBooleanAsImage);

    // displayTextOrNA: writes text or replaces it with "N/A" if value is missing or empty string.
    Handlebars.registerHelper('displayTextOrNA', displayTextOrNA);

    // displayNumberOrNA: writes number or replaces it with "N/A" if value is missing.
    Handlebars.registerHelper('displayNumberOrNA', displayNumberOrNA);

    // convertCommaSeparatedTextToList: converts a comma-separated text to an HTML list.
    Handlebars.registerHelper('convertCommaSeparatedTextToList', convertCommaSeparatedTextToList);

    // convertEnumToString: converts an enumeration value to text.
    Handlebars.registerHelper('convertEnumToString', convertEnumToString);

    // generateTable: generate Table from a JSON array and a Description.
    // If the array is empty, the output is the N/A value.
    Handlebars.registerHelper('generateTable', function (jsonArray, block) {
        var blockObject = JSON.parse(block);
        var tableDescription = blockObject.tableDescription;
        var naValue = blockObject.naValue;

        if (jsonArray.length === 0) {
            return naValue;
        }
        else {
            var headerHtml = "<tr>";
            tableDescription.forEach(function (tableItem) {
                headerHtml += "<th>" + tableItem.title + "</th>";
            });
            headerHtml += "</tr>";

            var rowsHtml = "";
            jsonArray.forEach(function (dataItem) {
                rowsHtml += "<tr>";
                tableDescription.forEach(function (tableItem) {
                    rowsHtml += "<td>";
                    var cellValue;
                    switch (tableItem.type) {
                        case "text":
                            cellValue = displayTextOrNA(dataItem[tableItem.name]);
                            break;
                        case "boolean":
                            cellValue = displayBooleanAsImage(dataItem[tableItem.name], tableItem.trueTitle, tableItem.falseTitle);
                            break;
                        case "number":
                            cellValue = displayNumberOrNA(dataItem[tableItem.name]);
                            break;
                        case "enum":
                            cellValue = convertEnumToString(tableItem.enumType, dataItem[tableItem.name]);
                            break;
                        case "esriDomain":
                            cellValue = convertEsriDomainToList(dataItem[tableItem.name]);
                            break;
                        default:
                            cellValue = displayTextOrNA(dataItem[tableItem.name]);
                            break;
                    }
                    rowsHtml += cellValue;
                    rowsHtml += "</td>"
                });
                rowsHtml += "</tr>";
            });

            return "<table class='table table-hover'><thead>"
                    + headerHtml
                    + "</thead><tbody>"
                    + rowsHtml
                    + "</tbody></table>";
        }
    });
}

function setupHandlebarsPartials() {
    // extentDetails: Writes out the details of an Extent.
    $.get("templates/partial_Extent.html", function (template) {
        Handlebars.registerPartial("extentDetails", template)
    });

    // serviceInfoHeader: Writes out the header of a service.
    $.get("templates/partial_ServiceInfoHeader.html", function (template) {
        Handlebars.registerPartial("serviceInfoHeader", template)
    });

    // TODO: Try turning generateTable to Partial.
    //// tableDetails: Writes a JSON object to a Table.
    //$.get("templates/partial_Table.html", function (tableTemplate) {
    //    Handlebars.registerPartial("tableDetails", tableTemplate)
    //});
}

$(document).ready(function () {
    // Register Handlebars Helpers and Partials
    setupHandlebarsHelpers();
    setupHandlebarsPartials();

    // Create tree
    treeObject = $.jstree.create("#" + name_divTree, {
        core: { check_callback: true }
    });
    // Listen to tree events
    $("#" + name_divTree).on("select_node.jstree", function (e, data) {

        getItemDetails(data.node.data.itemUrl, data.node, function () {
            console.log(data);
            // Add folder's children to the tree if they're not already added.
            if (data.node.data.itemType === "Folder" && data.node.children.length == 0) {
                writeItemToTree(treeObject, data.node);
                data.node.state.opened = true;
            }
            // Display item's info
            displayItemInfo(data.node.data);
        });
    });

    // Set up the buttons for Esri Sample Servers.
    $.getJSON("data/esriSampleServers.json", function (esriSample) {
        $.get("templates/esriSampleServersList.html", function (listTemplate) {
            var listCompiledTemplate = Handlebars.compile(listTemplate);
            var listHtml = listCompiledTemplate(esriSample);
            $('#' + name_ulEsriSampleServer).html(listHtml);

            // Set up event handlers for the buttons.
            $("." + name_btnEsriSampleServer).click(function () {
                setServerUrl($(this).attr("data-serverUrl"));
            });
        });
    });

    // Load Esri Enum values.
    $.getJSON("data/esriEnums.json", function (esriEnumsJson) {
        esriEnums = esriEnumsJson;
    });

    // Setup fancy box for map extent
    $(".mapExtentFrame").fancybox({
        maxWidth: '90%',
        maxHeight: '90%',
        fitToView: false,
        width: '90%',
        height: '90%',
        autoSize: false,
        closeClick: false,
        openEffect: 'none',
        closeEffect: 'none'
    });

    // Setup fancy box for map extent
    $("#aboutDialogButton").fancybox({
        maxWidth: '90%',
        maxHeight: '90%',
        fitToView: false,
        autoSize: true,
        closeClick: false,
        openEffect: 'none',
        closeEffect: 'none'
    });
});

function displayItemInfo(itemData) {
    $.get(getTemplatePath(itemData.itemType), function (itemTemplate) {
        var itemCompiledTemplate = Handlebars.compile(itemTemplate);
        var itemInfoHtml = itemCompiledTemplate(itemData);
        $('#' + name_divInfo).html(itemInfoHtml);
    });
}
