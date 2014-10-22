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
            icon: getItemIcon("Folder", "16"),
            state: {
                opened: true
            },
            data: {
                itemType: "Folder",
                itemUrl: parentNode.data.itemUrl + folder + "/",
                itemName: folder,
                itemJson: undefined
            }
        }, "last", null, null);
}

function getItemIcon(itemType, iconSize) {
    switch (itemType) {
        case "Folder":
        case "MapServer":
        case "FeatureServer":
        case "GPServer":
        case "ImageServer":
        case "MobileServer":
        case "Server":
        case "GeocodeServer":
        case "NAServer":
        case "GeometryServer":
        case "Layer":
            return "img/TreeIcons/treeicon_" + itemType + "_" + iconSize + ".png";
        default:
            return "img/TreeIcons/treeicon_other_" + iconSize + ".png";
    }
}

function getServiceIconFromUrl(serviceUrl, iconSize) {
    return getItemIcon(getServiceType(serviceUrl), iconSize);
}

function getTemplatePath(itemType) {
    switch (itemType) {
        case "Folder":
            return "templates/folderInfo.html";
        case "GPServer":
        case "MapServer":
        case "ImageServer":
        case "MobileServer":
        case "FeatureServer":
        case "NAServer":
        case "GeocodeServer":
        case "GeometryServer":
        case "Layer":
            return "templates/serviceInfo_" + itemType + ".html";
        case "Server":
            return "templates/serviceInfo_Server.html";
        default:
            return "templates/serviceInfo.html";
    }
}

function getServiceType(serviceUrl) {
    var serviceTypeArray = serviceUrl.split('/');
    var serviceType = serviceTypeArray[serviceTypeArray.length - 1];
    return serviceType;
}

function getServiceNameFromUrl(serviceUrl) {
    var serviceNameArray = serviceUrl.split('/');
    return serviceNameArray[serviceNameArray.length - 2];
}

function getServiceNameFromAgsServiceName(agsServiceName) {
    var serviceNameArray = agsServiceName.split('/');
    return serviceNameArray[serviceNameArray.length - 1];
}

function addServiceToTree(service, treeObject, parentNode) {
    var serviceName = getServiceNameFromAgsServiceName(service.name);
    treeObject.create_node(parentNode,
        {
            text: serviceName + " (" + service.type + ")",
            icon: getItemIcon(service.type, "16"),
            state: {
                opened: true
            },
            data: {
                itemType: service.type,
                itemUrl: parentNode.data.itemUrl + serviceName + "/" + service.type,
                itemName: serviceName,
                itemJson: undefined
            }
        }, "last", null, null);
}

function addLayerToTree(layer, treeObject, parentNode) {
    treeObject.create_node(parentNode,
        {
            text: layer.name + " (" + layer.id + ")",
            icon: getItemIcon("Layer", "16"),
            state: {
                opened: true
            },
            data: {
                itemType: "Layer",
                itemUrl: parentNode.data.itemUrl + "/" + layer.id,
                itemName: layer.name,
                itemJson: undefined
            }
        }, "last", null, null);
}

function writeItemToTree(treeObject, treeNode) {
    try {
        switch (treeNode.data.itemType) {
            case "Server":
            case "Folder":
                treeNode.data.itemJson.folders.forEach(function (folder) { addFolderToTree(folder, treeObject, treeNode); });
                treeNode.data.itemJson.services.forEach(function (service) { addServiceToTree(service, treeObject, treeNode); });
                break;
            case "MapServer":
            case "FeatureServer":
                treeNode.data.itemJson.layers.forEach(function (layer) { addLayerToTree(layer, treeObject, treeNode) });
                break;
            default:
                break;
        }
    }
    catch (error) {
        console.log(error);
    }
}

function getItemDetails(url, treeNode, callback) {
    // Go to the server only if the item's JSON wasn't retrieved before.
    if (!treeNode.data.itemJson) {
        $.getJSON(url + "?f=json&callback=?", function (json) {
            // Write the JSON response to the node
            treeNode.data.itemJson = json;
            // Call callback function
            callback();
        }).fail(function () {
            treeObject.delete_node(treeNode);
            $('#errorDialog').modal();
        });
    }
    else {
        callback();
    }
}

function btnGetServerInfo_Click(serverUrl) {
    if (serverUrl) {
        if (!serverUrl.endsWith("/")) {
            serverUrl = serverUrl + "/";
        }
        var baseUrl = getBaseUrl(serverUrl);
        var serverNodeName = treeObject.create_node("#",
                    {
                        text: baseUrl,
                        icon: getItemIcon("Server", "16"),
                        state: {
                            opened: true
                        },
                        data: {
                            itemType: "Server",
                            itemUrl: serverUrl,
                            itemName: baseUrl,
                            itemJson: undefined
                        }
                    }, "last", null, null);
        getItemDetails(serverUrl, treeObject.get_node(serverNodeName), function () {
            writeItemToTree(treeObject, treeObject.get_node(serverNodeName));
            displayItemInfo(treeObject.get_node(serverNodeName).data);
        });
    }
}

function displayBooleanAsImage(boolValue, trueTitle, falseTitle) {
    if (boolValue) {
        return "<img class='infoHeaderIcon' src='img/GreenCheckMark.png' alt='" + trueTitle + "' title='" + trueTitle + "' />";
    }
    else {
        return "<img class='infoHeaderIcon' src='img/RedXMark.png' alt='" + falseTitle + "' title='" + falseTitle + "' />";
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

function convertSubTypesDomainsToList(subTypesDomains) {
    if (subTypesDomains == undefined | subTypesDomains === "" | subTypesDomains === "null") {
        return "N/A";
    }
    else {
        var domainsList = "<ul>";
        Object.keys(subTypesDomains).forEach(function (key) {
            domainsList += "<li>";
            domainsList += key + " (" + subTypesDomains[key].type + ")";
            domainsList += "</li>";
        });
        domainsList += "</ul>";
        return domainsList;
    }
}

function convertSubTypesTemplatesToList(subTypesTemplates) {
    if (subTypesTemplates == undefined | subTypesTemplates === "" | subTypesTemplates === "null") {
        return "N/A";
    }
    else {
        var templatesList = "<ul>";
        subTypesTemplates.forEach(function (template) {
            templatesList += "<li><b>Name: </b>" + template.name + "</li>";
            templatesList += "<li><b>Description: </b>" + template.description + "</li>";
            templatesList += "<li><b>Drawing Tool: </b>" + convertEnumToString("esriFeatureEditTool", template.drawingTool) + "</li>";
            templatesList += "<li><b>Prototype Attributes: </b></li><ul>";
            Object.keys(template.prototype.attributes).forEach(function (key) {
                templatesList += "<li>";
                templatesList += key + ": " + template.prototype.attributes[key];
                templatesList += "</li>";
            });
            templatesList += "</ul>"
        });
        templatesList += "</ul>";
        return templatesList;
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
    if (textValue === undefined | textValue === null | textValue === "") {
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

function getSpatialReferenceInfo(wkid) {
    if (wkid === undefined) {
        return "N/A";
    }
    else {
        // Set the global configs to synchronous.
        $.ajaxSetup({ async: false });
        // $.getJSON() request is now synchronous.
        var srName;
        $.getJSON('data/SRs/' + wkid + '.json', function (sr) {
            srName = sr.name + " (" + wkid + ")";
        }).fail(function () { srName = wkid; });
        // Set the global configs back to asynchronous.
        $.ajaxSetup({ async: true });
        return srName;
    }
}

function getSymbolDetails(symbolJson) {
    // Set the global configs to synchronous.
    $.ajaxSetup({ async: false });
    var srName;
    // $.getJSON() request is now synchronous.
    var symbolHtml;
    $.get("templates/partial_Symbol.html", function (symbolTemplate) {
        var symbolCompiledTemplate = Handlebars.compile(symbolTemplate);
        symbolHtml = symbolCompiledTemplate(symbolJson);
    });
    // Set the global configs back to asynchronous.
    $.ajaxSetup({ async: true });
    return symbolHtml;
}

function getColorDetails(colorArray) {
    if (colorArray) {
        var rgb = "rgb(" + colorArray[0] + "," + colorArray[1] + "," + colorArray[2] + ")";
        return "<span class='colorCircle' style='background-color:"
            + rgb + ";"
            + "color:"
            + rgb + ";"
            + "'>&bull;</span>"
            + "Red: " + colorArray[0]
            + ", Green: " + colorArray[1]
            + ", Blue: " + colorArray[2]
            + ", " + RgbToHex(colorArray[0], colorArray[1], colorArray[2])
            + ", Alpha: " + colorArray[3];
    }
    else {
        return "N/A"
    }
}

function RgbToHex(rValue, gValue, bValue) {
    var red = returnHex(rValue);
    var green = returnHex(gValue);
    var blue = returnHex(bValue);
    return "#" + red + green + blue;
}

// Convert to Hex
function returnHex(num) {
    // Hex can store 16 different values in 1 character
    if (num == null) return "00";
    num = num.length < 2 ? "0" + num : num
    return num.toString(16);
}

function getFullUrlOfSelectedNode(relativeUrl) {
    return treeObject.get_selected("#" + name_divTree, true)[0].data.itemUrl + relativeUrl;
}

function ifequal(val1, val2, equalValue) {
    if (val1 === val2) {
        return equalValue.fn(this);
    }
}

function beautifyJson(jsonObject) {
    return JSON.stringify(jsonObject, null, "\t");
}

function construct(constructor, args) {
    function F() {
        return constructor.apply(this, args);
    }
    F.prototype = constructor.prototype;
    return new F();
}

function ifEqualToAny() {
    for (var i = 1; i < arguments.length - 2; i++) {
        if (arguments[0] == arguments[i]) {
            return arguments[arguments.length - 1].fn(this);
        }
    }
}

function generateTable(jsonArray, tableDescriptionString, naValue) {
    var tableDescription = JSON.parse(tableDescriptionString);

    if (jsonArray == 'undefined' | jsonArray == 'null' | jsonArray.length === 0) {
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
                    case "esriSymbol":
                        cellValue = getSymbolDetails(dataItem[tableItem.name]);
                        break;
                    case "subTypesDomain":
                        cellValue = convertSubTypesDomainsToList(dataItem[tableItem.name]);
                        break;
                    case "subTypesTemplates":
                        cellValue = convertSubTypesTemplatesToList(dataItem[tableItem.name]);
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

        return "<table class='table table-striped table-hover'><thead>"
                + headerHtml
                + "</thead><tbody>"
                + rowsHtml
                + "</tbody></table>";
    }
}

function setupHandlebarsHelpers() {
    // getFolderName: gets name of folder from URL.
    Handlebars.registerHelper('getFolderName', function (url) {
        var folderNameArray = url.split('/');
        var folderName = folderNameArray[folderNameArray.length - 2];
        return folderName;
    });

    // getServiceNameFromUrl: extracts name of service from the service URL.
    // "http://sampleserver5.arcgisonline.com/arcgis/rest/services/Elevation/ESRI_Elevation_World/MapServer" ---> "ESRI_Elevation_World"
    Handlebars.registerHelper('getServiceNameFromUrl', function (serviceUrl) {
        return getServiceNameFromUrl(serviceUrl);
    });

    // getServiceNameFromAgsServiceName: extracts name of service from AGS service name.
    // "folder/ESRI_Elevation_World" ---> "ESRI_Elevation_World"
    Handlebars.registerHelper('getServiceNameFromAgsServiceName', function (agsServiceName) {
        return getServiceNameFromAgsServiceName(agsServiceName);
    });

    // getServiceType: extracts name of service from the name returned from AGS.
    // "Elevation/ESRI_Elevation_World" ---> "ESRI_Elevation_World"
    Handlebars.registerHelper('getServiceType', function (serviceUrl) {
        return getServiceType(serviceUrl);
    });

    // getItemIcon: gets a image that represents the service based on its type.
    Handlebars.registerHelper('getItemIcon', function (itemType, iconSize) {
        return getItemIcon(itemType, iconSize);
    });

    // getServiceIconFromUrl: gets a image that represents the service based on its URL.
    Handlebars.registerHelper('getServiceIconFromUrl', function (serviceUrl, iconSize) {
        return getServiceIconFromUrl(serviceUrl, iconSize);
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

    // getSpatialReferenceInfo: gets the full name of a spatial reference given its WKID.
    Handlebars.registerHelper('getSpatialReferenceInfo', getSpatialReferenceInfo);

    // getColorDetails: Generates a circle with the input color
    Handlebars.registerHelper('getColorDetails', getColorDetails);

    // generateTable: generate Table from a JSON array and a Description.
    // If the array is empty, the output is the N/A value.
    Handlebars.registerHelper('generateTable', generateTable);

    // ifequal: Block-helper that executes the inner-block if the two arguments test as strict equal (===). 
    // This also supports else blocks.
    Handlebars.registerHelper('ifequal', ifequal);

    // getFullUrlOfSelectedNode
    Handlebars.registerHelper('getFullUrlOfSelectedNode', getFullUrlOfSelectedNode);

    // json-stringify: Converts JSON object to string.
    Handlebars.registerHelper("json-stringify", JSON.stringify);

    // json-beautify: Converts JSON object to string.
    Handlebars.registerHelper("json-beautify", beautifyJson);

    // ifEqualToAny: Returns true if the first value is equal to any of the other values.
    Handlebars.registerHelper("ifEqualToAny", ifEqualToAny);
}

function setupHandlebarsPartials() {
    // extentDetails: Writes out the details of an Extent.
    $.get("templates/partial_Extent.html", function (template) {
        Handlebars.registerPartial("extentDetails", template)
    });

    // spatialReferenceDetails: Writes out the details of a Spatial Reference.
    $.get("templates/partial_SpatialReference.html", function (template) {
        Handlebars.registerPartial("spatialReferenceDetails", template)
    });

    // extentPreviewIcon: Displays icon that shows a map with extent rectangle.
    $.get("templates/partial_ExtentPreviewIcon.html", function (template) {
        Handlebars.registerPartial("extentPreviewIcon", template)
    });

    // serviceInfoHeader: Writes out the header of a service.
    $.get("templates/partial_ServiceInfoHeader.html", function (template) {
        Handlebars.registerPartial("serviceInfoHeader", template)
    });

    // rendererDetails: Writes out the details of a Renderer.
    $.get("templates/partial_Renderer.html", function (template) {
        Handlebars.registerPartial("rendererDetails", template)
    });

    // symbolDetails: Writes out the details of a Symbol.
    $.get("templates/partial_Symbol.html", function (template) {
        Handlebars.registerPartial("symbolDetails", template)
    });

    // labelingInfoDetails: Writes out the details of a Symbol.
    $.get("templates/partial_LabelingInfo.html", function (template) {
        Handlebars.registerPartial("labelingInfoDetails", template)
    });
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
        // Add loading indicator. It will be replaced after loading is compelete.
        $('#' + name_divInfo).html("<h2>Loading...</h2><div class='progress infoPanelLoading'><div class='progress-bar progress-bar-striped active'  role='progressbar' aria-valuenow='95' aria-valuemin='0' aria-valuemax='100' style='width: 95%'><span class='sr-only'>Loading...</span></div></div>");

        // Get item's details and loads them into view.
        getItemDetails(data.node.data.itemUrl, data.node, function () {
            // Add folder's children to the tree if they're not already added.
            //if (data.node.data.itemType === "Folder" && data.node.children.length == 0) {
            if (data.node.children.length == 0) {
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
});

function displayItemInfo(itemData) {
    $.get(getTemplatePath(itemData.itemType), function (itemTemplate) {
        var itemCompiledTemplate = Handlebars.compile(itemTemplate);
        var itemInfoHtml = itemCompiledTemplate(itemData);
        $('#' + name_divInfo).html(itemInfoHtml);

        // Initialize highlighter.js
        $('pre code').each(function (i, block) {
            hljs.highlightBlock(block);
        });
        // Initialize tooltips
        $('.bstooltip').tooltip();
    });
}

// prevent accidental closing of window
window.onbeforeunload = function () {
    return "Are you sure you want to navigate away?";
}
