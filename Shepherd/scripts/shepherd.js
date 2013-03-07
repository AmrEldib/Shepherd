// Turn this boolean variable ON and OFF to control displaying debugging messages at the bottom of the page.
var isDebug = true;

$(function () {

    /**
     * This is a quick example of capturing the select event on tree leaves, not branches
     * (We're going to work on this a bit)
     */
    $("body").on("nodeselect.tree.data-api", "[role=leaf]", function (e) {

        if (isDebug) {
            
            var output = "<p>Node Type: leaf<br>"
              + "Value: " + ((e.node.value) ? e.node.value : e.node.el.text()) + "<br>"
              + "Service Type: " + (e.node.servicetype) + "<br>"
              + "Service URL: <a href='" + e.node.serviceurl + "' target='_blank'>" + e.node.serviceurl + "</a><br/>"
              + "Parentage: " + e.node.parentage.join("/") + "</p>";
            $('div#reporter').prepend(output);
            $('div#reporter').prepend("<span class='label label-info'>Node <b>nodeselect</b> event fired:<br></span>");

        }
        
        listServiceInfo(e.node.serviceurl, e.node.servicename, e.node.servicetype, "infoPanel");

    })

    /**
     * This is a quick example of capturing the select event on tree branches, not leaves
     * (We're going to work on this a bit)
     */
    $("body").on("nodeselect.tree.data-api", "[role=branch]", function (e) {

        if (isDebug) {
            
            var output = "<p>Node Type: branch<br>"
              + "Value: " + ((e.node.value) ? e.node.value : e.node.el.text()) + "<br>"
              + "Service URL: <a href='" + e.node.metadataserviceurl + "' target='_blank'>" + e.node.metadataserviceurl + "</a><br/>"
              + "Parentage: " + e.node.parentage.join("/") + "</p>";
            $('div#reporter').prepend(output);
            $('div#reporter').prepend("<span class='label label-info'>Node <b>nodeselect</b> event fired:<br></span>");

        }
        
        listFolderContent(e.node.metadataserviceurl, e.node.value + "_childNodes", "infoPanel");
        
    })

    /**
     * Listening for the 'openbranch' event. Look for e.node, which is the
     * actual node the user opens
     */
    $("body").on("openbranch.tree", "[data-toggle=branch]", function (e) {

        if (isDebug) {
            
            var output = "<p>Node Type: branch<br>"
              + "Value: " + ((e.node.value) ? e.node.value : e.node.el.text()) + "<br>"
              + "Parentage: " + e.node.parentage.join("/") + "</p>";
            $('div#reporter').prepend(output);
            $('div#reporter').prepend("<span class='label label-info'>Node <b>openbranch</b> event fired:<br></span>");

        }
        
        //listServiceInfo(e.node.serviceurl, e.node.servicename, e.node.servicetype, "infoPanel");

    })

    /**
     * Listening for the 'closebranch' event. Look for e.node, which is the
     * actual node the user closed
     */
    $("body").on("closebranch.tree", "[data-toggle=branch]", function (e) {

        if (isDebug) {

            var output = "<p>Node Type: branch<br>"
              + "Value: " + ((e.node.value) ? e.node.value : e.node.el.text()) + "<br>"
              + "Parentage: " + e.node.parentage.join("/") + "</p>";

            $('div#reporter').prepend(output);
            $('div#reporter').prepend("<span class='label label-info'>Node <b>closebranch</b> event fired:<br></span>");

        }

    })

})

function btnGetServerInfo_Click(serverUrl) {
    if (serverUrl == "") {
        $("#alertbox").append('<div class="alert"><button type="button" class="close" data-dismiss="alert">&times;</button><strong>Oops!</strong> Please enter a Server URL.</div>');
    }
    else {

        if (!serverUrl.endsWith("/")) {
            serverUrl = serverUrl + "/";
        }

        if (true) {
            var pathArray = serverUrl.split('/');
            var hostWithDots = pathArray[2];
            var host = hostWithDots.split('.').join("");

            var serverNode = '<li>'
                        + '<a href="#" role="branch" class="tree-toggle closed" data-toggle="branch" data-value="'
                        + host
                        + '" id="'
                        + host
                        + '" data-metadataServiceUrl="'
                        + serverUrl
                        + '">'
                        + host
                        + '</a><ul id="'
                        + host
                        + '_childNodes" class="branch"></ul></li>';
            $("#servicesTree").empty();
            $("#servicesTree").append(serverNode);

            listFolderContent(serverUrl, host + "_childNodes", "infoPanel");
        }
        else {

            listFolderContent(serverUrl, "servicesTree", "infoPanel");
        }
    }
}

function listFolderContent(folderUrl, treeName, infoDivName) {
    var requestUrl = folderUrl + "?f=json";

    $.getJSON(requestUrl, function (json) {
    
        //// Server Info
        //var pathArray = folderUrl.split('/');
        //var host = pathArray[2];

        //$("#serverInfo").empty();
        //$("#serverInfo").append("<p><b>Server:</b> " + host + "</p>");
        //$("#serverInfo").append("<p><b>Version:</b> " + json.currentVersion + "</p>");

        var folderContents = "";

        // List folders
        if (json.folders.length > 0) {
            json.folders.forEach(function (folder) {

                var folderNode = '<li>'
                    + '<a href="#" role="branch" class="tree-toggle closed" data-toggle="branch" data-value="'
                    + folder
                    + '" id="'
                    + folder
                    + '" data-metadataServiceUrl="'
                    + folderUrl
                    + folder
                    + "/"
                    + '">'
                    + folder
                    + '</a><ul id="'
                    + folder
                    + '_childNodes" class="branch"></ul></li>';

                folderContents = folderContents + folderNode;
            });
        }

        // Update content of tree
        $("#" + treeName).empty();
        $("#" + treeName).append(folderContents);

        // List services
        if (json.services.length > 0) {
            
            json.services.forEach(function (service)
            {
                var serviceName = service.name.substr(service.name.lastIndexOf("/") + 1);

                var serviceObject = '<li><a href="#" role="leaf" data-serviceUrl="'
                    + folderUrl
                    + serviceName + "/"
                    + service.type
                    + '" id="'
                    + serviceName + "_" + service.type
                    + '" data-serviceType="'
                    + service.type
                    + '" data-serviceName="'
                    + serviceName
                    + '">'
                    + serviceName + ' (' + service.type + ')'
                    + '</a></li>';
                
                $("#" + treeName).append(serviceObject);
            });
        }

        displayFolderInfo(folderUrl, json, infoDivName);
    });
}

function displayFolderInfo(folderUrl, json, infoDivName) {

    // Clear div
    $("#" + infoDivName).empty();
    
    // Get version of ArcGIS Server
    $("#" + infoDivName).append('<p>ArcGIS Server version: ' + json.currentVersion + '</p>');

    // List folders
    if (json.folders.length > 0) {
        $("#" + infoDivName).append('<h2>Folders:</h2>');
        json.folders.forEach(function (folder) {
                        
            $("#" + infoDivName).append('<p><a href="' + folderUrl + folder + '/" target="_blank">' + folder + '</a></p>');
            
        });
    }

    // List services
    if (json.services.length > 0) {
        $("#" + infoDivName).append('<h2>Services:</h2>');
        json.services.forEach(function (service) {

            var serviceName = service.name.substr(service.name.lastIndexOf("/") + 1);
            $("#" + infoDivName).append('<p><a href="' + folderUrl + serviceName + "/" + service.type + '/" target="_blank">' + service.name + '</a> (' + service.type + ')</p>');

        });
    }

}

function listServiceInfo(serviceUrl, serviceName, serviceType, infoDivName) {
    var requestUrl = serviceUrl + "?f=json";

    $.getJSON(requestUrl, function (json) {

        // Clear div
        $("#" + infoDivName).empty();

        // Service name
        $("#" + infoDivName).append('<div class="text-right"><p><h2>' + serviceName + '</h2><i>' + serviceType + '</i></p></div>');
        $("#" + infoDivName).append('<hr />');

        // Service description
        $("#" + infoDivName).append('<p><b>Service Description: </b>');
        if (json.serviceDescription != "") {
            $("#" + infoDivName).append(json.serviceDescription + '</p>');
        }
        else {
            $("#" + infoDivName).append('N/A </p>');
        }

        switch (serviceType) {
            case "GPServer":
                listGPServerServiceInfo(json, infoDivName);
                break;
            case "MapServer":
                listMapServerServiceInfo(json, infoDivName);
                break;
            case "ImageServer":
                listImageServerServiceInfo(json, infoDivName);
                break;
            case "FeatureServer":
                listFeatureServerServiceInfo(json, infoDivName);
                break;
            case "NAServer":
                listNAServerServiceInfo(json, infoDivName);
                break;
            default:
                break;

        }

        if (isDebug) {
            $("#" + infoDivName).append('<hr/>');
            $("#" + infoDivName).append('<span class="label label-info">Service Full Details: </span>');
            // List all keys and values
            $.each(json, function (key, value) {
                $("#" + infoDivName).append('<p>' + key + ': ' + value + '</p>');
            });
        }

        if (isDebug) {
            $("#" + infoDivName).append('<hr/>');
            $("#" + infoDivName).append('<span class="label label-info">JSON String: </span><br/>');
            $("#" + infoDivName).append(JSON.stringify(json));
        }
    });
}

function listGPServerServiceInfo(json, infoDivName) {
    // executionType
    addMetadataEntryToServiceInfoDiv("Execution Type", json.executionType, infoDivName);
    // resultMapServerName
    addMetadataEntryToServiceInfoDiv("Result Map Server Name", json.resultMapServerName, infoDivName);
    // maximumRecords
    addMetadataEntryToServiceInfoDiv("Maximum Records", json.maximumRecords, infoDivName);
}

function listMapServerServiceInfo(json, infoDivName) {

    //mapName: Layers
    addMetadataEntryToServiceInfoDiv("Map Name", json.mapName, infoDivName);

    //description: FOR DEMO PURPOSES ONLY. The process of blending the elevation datasets is not complete.
    addMetadataEntryToServiceInfoDiv("Description", json.description, infoDivName);

    //copyrightText: SRTM, GTopo30, GEBCO
    addMetadataEntryToServiceInfoDiv("Copyright Text", json.copyrightText, infoDivName);

    //supportsDynamicLayers: false
    addMetadataEntryToServiceInfoDiv("Supports Dynamic Layers", json.supportsDynamicLayers, infoDivName);

    //layers: [object Object]
    addMetadataEntryToServiceInfoDiv("Layers", "", infoDivName);

    //tables:
    addMetadataEntryToServiceInfoDiv("Tables", "", infoDivName);

    //spatialReference: [object Object]
    addMetadataEntryToServiceInfoDiv("Spatial Reference", "", infoDivName);

    //singleFusedMapCache: false
    addMetadataEntryToServiceInfoDiv("Single Fused Map Cache", json.singleFusedMapCache, infoDivName);

    //initialExtent: [object Object]
    addMetadataEntryToServiceInfoDiv("Initial Extent", "", infoDivName);

    //fullExtent: [object Object]
    addMetadataEntryToServiceInfoDiv("Full Extent", "", infoDivName);

    //minScale: 0
    addMetadataEntryToServiceInfoDiv("Minimum Scale", json.minScale, infoDivName);

    //maxScale: 0
    addMetadataEntryToServiceInfoDiv("Maximum Scale", json.maxScale, infoDivName);

    //units: esriMeters
    addMetadataEntryToServiceInfoDiv("Units", json.units, infoDivName);

    //supportedImageFormatTypes: PNG32,PNG24,PNG,JPG,DIB,TIFF,EMF,PS,PDF,GIF,SVG,SVGZ,BMP
    addMetadataEntryToServiceInfoDiv("Supported Image Format Types", json.supportedImageFormatTypes, infoDivName);

    //documentInfo: [object Object]
    addMetadataEntryToServiceInfoDiv("Document Info", json.documentInfo, infoDivName);

    //capabilities: Map,Query,Data
    addMetadataEntryToServiceInfoDiv("Capabilities", json.capabilities, infoDivName);

    //supportedQueryFormats: JSON, AMF
    addMetadataEntryToServiceInfoDiv("Supported Query Formats", json.supportedQueryFormats, infoDivName);

    //maxRecordCount: 1000
    addMetadataEntryToServiceInfoDiv("Maximum Record Count", json.maxRecordCount, infoDivName);

    //maxImageHeight: 2048
    addMetadataEntryToServiceInfoDiv("Maximum Image Height", json.maxImageHeight, infoDivName);

    //maxImageWidth: 2048
    addMetadataEntryToServiceInfoDiv("Maximum Image Width", json.maxImageWidth, infoDivName);
}

function listImageServerServiceInfo(json, infoDivName) {

}

function listFeatureServerServiceInfo(json, infoDivName) {

}

function listNAServerServiceInfo(json, infoDivName) {
    // routeLayers
    addMetadataEntryToServiceInfoDiv("Route Layers", json.routeLayers, infoDivName);
    // serviceAreaLayers
    addMetadataEntryToServiceInfoDiv("Service Area Layers", json.serviceAreaLayers, infoDivName);
    // closestFacilityLayers
    addMetadataEntryToServiceInfoDiv("Closest Facility Layers", json.closestFacilityLayers, infoDivName);
}

function addMetadataEntryToServiceInfoDiv(metadataEntryTitle, metadataEntryValue, infoDivName) {
    // executionType
    $("#" + infoDivName).append('<p><b>' + metadataEntryTitle + ':</b> ' + ((metadataEntryValue != "") ? metadataEntryValue : "Not specified") + '</p>');
}

String.prototype.endsWith = function (suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};