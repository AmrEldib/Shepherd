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

            json.services.forEach(function (service) {
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
        $("#" + infoDivName).append('<div class="text-right"><p><h2>' + serviceName + '</h2><a href="' + serviceUrl + '" target="_blank"><i>' + serviceType + '</i></a></p></div>');
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
    /// <summary>List the metadata of an GPServer service into the Service Info Div.</summary>
    /// <param name="json" type="String">Description of service in JSON format.</param>
    /// <param name="infoDivName" type="String">Name of the info div.</param>

    //serviceDescription: The tool filters 911 calls based on the query provided by the client and creates a hotspot raster based on the frequency of calls. The hotspot raster is created using the Spatial Statistics Hot Spot Analysis tool, which ... (see Description)
    // serviceDescription is already displayed.

    //tasks: 911 Calls Hotspot

    //executionType: esriExecutionTypeAsynchronous
    addStringMetadataEntryToServiceInfoDiv("Execution Type", json.executionType, infoDivName);

    //resultMapServerName: 911CallsHotspot
    addStringMetadataEntryToServiceInfoDiv("Result Map Server Name", json.resultMapServerName, infoDivName);

    //maximumRecords: 1000
    addNumberMetadataEntryToServiceInfoDiv("Maximum Records", json.maximumRecords, infoDivName);
}

function listMapServerServiceInfo(json, infoDivName) {

    /// <summary>List the metadata of an MapServer service into the Service Info Div.</summary>
    /// <param name="json" type="String">Description of service in JSON format.</param>
    /// <param name="infoDivName" type="String">Name of the info div.</param>

    // serviceDescription: 
    // serviceDescription is already displayed.

    //mapName: Layers
    addStringMetadataEntryToServiceInfoDiv("Map Name", json.mapName, infoDivName);

    //description: FOR DEMO PURPOSES ONLY. The process of blending the elevation datasets is not complete.
    addStringMetadataEntryToServiceInfoDiv("Description", json.description, infoDivName);

    //copyrightText: SRTM, GTopo30, GEBCO
    addCommaSeparatedListMetadataEntryToServiceInfoDiv("Copyright Text", json.copyrightText, infoDivName);

    //supportsDynamicLayers: false
    addBooleanMetadataEntryToServiceInfoDiv("Supports Dynamic Layers", json.supportsDynamicLayers, infoDivName);

    //layers: [object Object]
    addLayersObjectMetadataEntryToServiceInfoDiv("Layers", "", infoDivName);

    //tables:
    addTablesObjectMetadataEntryToServiceInfoDiv("Tables", "", infoDivName);

    //spatialReference: [object Object]
    addSpatialReferenceObjectMetadataEntryToServiceInfoDiv("Spatial Reference", "", infoDivName);

    //singleFusedMapCache: false
    addBooleanMetadataEntryToServiceInfoDiv("Single Fused Map Cache", json.singleFusedMapCache, infoDivName);

    //initialExtent: [object Object]
    addGeometryObjectMetadataEntryToServiceInfoDiv("Initial Extent", "", infoDivName);

    //fullExtent: [object Object]
    addGeometryObjectMetadataEntryToServiceInfoDiv("Full Extent", "", infoDivName);

    //minScale: 0
    addNumberMetadataEntryToServiceInfoDiv("Minimum Scale", json.minScale, infoDivName);

    //maxScale: 0
    addNumberMetadataEntryToServiceInfoDiv("Maximum Scale", json.maxScale, infoDivName);

    //units: esriMeters
    addUnitsObjectMetadataEntryToServiceInfoDiv("Units", json.units, infoDivName);

    //supportedImageFormatTypes: PNG32,PNG24,PNG,JPG,DIB,TIFF,EMF,PS,PDF,GIF,SVG,SVGZ,BMP
    addCommaSeparatedListMetadataEntryToServiceInfoDiv("Supported Image Format Types", json.supportedImageFormatTypes, infoDivName);

    //documentInfo: [object Object]
    addDocumentInfoObjectMetadataEntryToServiceInfoDiv("Document Info", json.documentInfo, infoDivName);

    //capabilities: Map,Query,Data
    addStringMetadataEntryToServiceInfoDiv("Capabilities", json.capabilities, infoDivName);

    //supportedQueryFormats: JSON, AMF
    addCommaSeparatedListMetadataEntryToServiceInfoDiv("Supported Query Formats", json.supportedQueryFormats, infoDivName);

    //maxRecordCount: 1000
    addNumberMetadataEntryToServiceInfoDiv("Maximum Record Count", json.maxRecordCount, infoDivName);

    //maxImageHeight: 2048
    addNumberMetadataEntryToServiceInfoDiv("Maximum Image Height", json.maxImageHeight, infoDivName);

    //maxImageWidth: 2048
    addNumberMetadataEntryToServiceInfoDiv("Maximum Image Width", json.maxImageWidth, infoDivName);
}

function listImageServerServiceInfo(json, infoDivName) {
    /// <summary>List the metadata of an ImageServer service into the Service Info Div.</summary>
    /// <param name="json" type="String">Description of service in JSON format.</param>
    /// <param name="infoDivName" type="String">Name of the info div.</param>

    //serviceDescription: This image service contains 9 LAS files covering North Carolina’s, City of Charlotte downtown area. The lidar data was collected in 2007. First return points are used to generate an on-the-fly seamless elevation surface with a 10-foot pixel resolution. The elevation unit is foot. LAS files were provided by Mecklenburg County, NC and are managed using a mosaic dataset. Esri reserves the right to change or remove this service at any time and without notice.
    // serviceDescription is already displayed.

    //    name: CharlotteLAS
    addStringMetadataEntryToServiceInfoDiv("Name", json.name, infoDivName);

    //description: This image service contains 9 LAS files covering North Carolina’s, City of Charlotte downtown area. The lidar data was collected in 2007. First return points are used to generate an on-the-fly seamless elevation surface with a 10-foot pixel resolution. The elevation unit is foot. LAS files were provided by Mecklenburg County, NC and are managed using a mosaic dataset. Esri reserves the right to change or remove this service at any time and without notice.
    addStringMetadataEntryToServiceInfoDiv("Description", json.description, infoDivName);

    //    extent: [object Object]
    addGeometryObjectMetadataEntryToServiceInfoDiv("Extent", json.extent, infoDivName);

    //initialExtent: [object Object]
    addGeometryObjectMetadataEntryToServiceInfoDiv("Initial Extent", json.initialExtent, infoDivName);

    //fullExtent: [object Object]
    addGeometryObjectMetadataEntryToServiceInfoDiv("Full Extent", json.fullExtent, infoDivName);

    //pixelSizeX: 10
    addNumberMetadataEntryToServiceInfoDiv("Pixel Size X", json.pixelSizeX, infoDivName);

    //pixelSizeY: 10
    addNumberMetadataEntryToServiceInfoDiv("Pixel Size Y", json.pixelSizeY, infoDivName);

    //bandCount: 1
    addNumberMetadataEntryToServiceInfoDiv("Band Count", json.bandCount, infoDivName);

    //pixelType: F32
    addStringMetadataEntryToServiceInfoDiv("Pixel Type", json.pixelType, infoDivName);

    //minPixelSize: 0
    addNumberMetadataEntryToServiceInfoDiv("Minimum Pixel Size", json.minPixelSize, infoDivName);

    //maxPixelSize: 0
    addNumberMetadataEntryToServiceInfoDiv("Maximum Pixel Size", json.maxPixelSize, infoDivName);

    //copyrightText: Copyright © 2007 Mecklenburg County
    addStringMetadataEntryToServiceInfoDiv("Copyright Text", json.copyrightText, infoDivName);

    //serviceDataType: esriImageServiceDataTypeElevation
    addServiceDataTypeObjectMetadataEntryToServiceInfoDiv("Service Data Type", json.serviceDataType, infoDivName);

    //minValues: 515.6699829101562
    addNumberMetadataEntryToServiceInfoDiv("Minimum Value", json.minValues, infoDivName);

    //maxValues: 1611.125
    addNumberMetadataEntryToServiceInfoDiv("Maximum Value", json.maxValues, infoDivName);

    //meanValues: 712.371337411377
    addNumberMetadataEntryToServiceInfoDiv("Mean Value", json.meanValues, infoDivName);

    //stdvValues: 45.56883666949917
    addNumberMetadataEntryToServiceInfoDiv("Standard Value", json.stdvValues, infoDivName);

    //objectIdField: OBJECTID
    addStringMetadataEntryToServiceInfoDiv("Object ID Field", json.objectIdField, infoDivName);

    //fields: [object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object]
    addFieldsListMetadataEntryToServiceInfoDiv("Fields", json.fields, infoDivName);

    //capabilities: Image,Metadata,Catalog,Mensuration
    addCommaSeparatedListMetadataEntryToServiceInfoDiv("Capabilities", json.capabilities, infoDivName);

    //defaultMosaicMethod: Northwest
    addStringMetadataEntryToServiceInfoDiv("Default Mosaic Method", json.defaultMosaicMethod, infoDivName);

    //allowedMosaicMethods: NorthWest,Center,LockRaster,ByAttribute,Nadir,Viewpoint,Seamline,None
    addCommaSeparatedListMetadataEntryToServiceInfoDiv("Allowed Mosaic Methods", json.allowedMosaicMethods, infoDivName);

    //sortField:
    addStringMetadataEntryToServiceInfoDiv("Sort Field", json.sortField, infoDivName);

    //sortValue: null
    addStringMetadataEntryToServiceInfoDiv("Sort Value", json.sortValue, infoDivName);

    //mosaicOperator: First
    addStringMetadataEntryToServiceInfoDiv("Mosaic Operator", json.mosaicOperator, infoDivName);

    //defaultCompressionQuality: 75
    addNumberMetadataEntryToServiceInfoDiv("Default Compression Quality", json.defaultCompressionQuality, infoDivName);

    //defaultResamplingMethod: Bilinear
    addStringMetadataEntryToServiceInfoDiv("Default Resampling Method", json.defaultResamplingMethod, infoDivName);

    //maxImageHeight: 4100
    addNumberMetadataEntryToServiceInfoDiv("Maximum Image Height", json.maxImageHeight, infoDivName);

    //maxImageWidth: 15000
    addNumberMetadataEntryToServiceInfoDiv("Maximum Image Width", json.maxImageWidth, infoDivName);

    //maxRecordCount: 1000
    addNumberMetadataEntryToServiceInfoDiv("Maximum Record Count", json.maxRecordCount, infoDivName);

    //maxDownloadImageCount: 0
    addNumberMetadataEntryToServiceInfoDiv("Maximum Download Image Count", json.maxDownloadImageCount, infoDivName);

    //maxDownloadSizeLimit: 0
    addNumberMetadataEntryToServiceInfoDiv("Maximum Download Size Limit", json.maxDownloadSizeLimit, infoDivName);

    //maxMosaicImageCount: 20
    addNumberMetadataEntryToServiceInfoDiv("Maximum Mosaic Image Count", json.maxMosaicImageCount, infoDivName);

    //allowRasterFunction: true
    addBooleanMetadataEntryToServiceInfoDiv("Allow Raster Function", json.allowRasterFunction, infoDivName);

    //rasterFunctionInfos: [object Object],[object Object],[object Object],[object Object]
    addRasterFunctionInfosObjectMetadataEntryToServiceInfoDiv("Raster Function Infos", json.rasterFunctionInfos, infoDivName);

    //rasterTypeInfos: [object Object]
    addRasterTypeInfosObjectMetadataEntryToServiceInfoDiv("Raster Type Infos", json.rasterTypeInfos, infoDivName);

    //mensurationCapabilities: Basic
    addStringMetadataEntryToServiceInfoDiv("Mensuration Capabilities", json.mensurationCapabilities, infoDivName);

    //hasHistograms: true
    addBooleanMetadataEntryToServiceInfoDiv("Has Histograms", json.hasHistograms, infoDivName);

    //hasColormap: false
    addBooleanMetadataEntryToServiceInfoDiv("Has Colormap", json.hasColormap, infoDivName);

    //hasRasterAttributeTable: false
    addBooleanMetadataEntryToServiceInfoDiv("Has Raster Attribute Table", json.hasRasterAttributeTable, infoDivName);

    //minScale: 0
    addNumberMetadataEntryToServiceInfoDiv("Minimum Scale", json.minScale, infoDivName);

    //maxScale: 0
    addNumberMetadataEntryToServiceInfoDiv("Maximum Scale", json.maxScale, infoDivName);

    //editFieldsInfo: null
    addStringMetadataEntryToServiceInfoDiv("Edit Fields Info", json.editFieldsInfo, infoDivName);

    //ownershipBasedAccessControlForRasters: null
    addStringMetadataEntryToServiceInfoDiv("Ownership Based Access Control for Rasters", json.ownershipBasedAccessControlForRasters, infoDivName);

    //spatialReference: [object Object]
    addSpatialReferenceObjectMetadataEntryToServiceInfoDiv("Spatial Reference", json.spatialReference, infoDivName);
}

function listFeatureServerServiceInfo(json, infoDivName) {
    /// <summary>List the metadata of an FeatureServer service into the Service Info Div.</summary>
    /// <param name="json" type="String">Description of service in JSON format.</param>
    /// <param name="infoDivName" type="String">Name of the info div.</param>

    //serviceDescription: This is a sample map of data entered by city residents. This is a sample service hosted by ESRI, powered by ArcGIS Server. ESRI reserves the right to change or remove this service at any time and without notice.
    // serviceDescription is already displayed.

    //hasVersionedData: false
    addBooleanMetadataEntryToServiceInfoDiv("Has Version Data", json.hasVersionedData, infoDivName);

    //supportsDisconnectedEditing: true
    addBooleanMetadataEntryToServiceInfoDiv("Supports Disconnected Editing", json.supportsDisconnectedEditing, infoDivName);

    //supportedQueryFormats: JSON, AMF
    addCommaSeparatedListMetadataEntryToServiceInfoDiv("Supported Query Formats", json.supportedQueryFormats, infoDivName);

    //maxRecordCount: 1000
    addNumberMetadataEntryToServiceInfoDiv("Maximum Record Count", json.maxRecordCount, infoDivName);

    //capabilities: Create,Delete,Query,Update,Uploads,Editing
    addCommaSeparatedListMetadataEntryToServiceInfoDiv("Capabilities", json.capabilities, infoDivName);

    //description: This is a sample map of data entered by city residents. This is a sample service hosted by ESRI, powered by ArcGIS Server. ESRI reserves the right to change or remove this service at any time and without notice.
    addStringMetadataEntryToServiceInfoDiv("Description", json.description, infoDivName);

    //copyrightText:
    addStringMetadataEntryToServiceInfoDiv("Copyright Text", json.copyrightText, infoDivName);

    //spatialReference: [object Object]
    addSpatialReferenceObjectMetadataEntryToServiceInfoDiv("Spatial Reference", json.spatialReference, infoDivName);

    //initialExtent: [object Object]
    addGeometryObjectMetadataEntryToServiceInfoDiv("Initial Extent", json.initialExtent, infoDivName);

    //fullExtent: [object Object]
    addGeometryObjectMetadataEntryToServiceInfoDiv("Full Extent", json.fullExtent, infoDivName);

    //allowGeometryUpdates: true
    addBooleanMetadataEntryToServiceInfoDiv("Allow Geometry Updates", json.allowGeometryUpdates, infoDivName);

    //units: esriDecimalDegrees
    addStringMetadataEntryToServiceInfoDiv("Units", json.units, infoDivName);

    //documentInfo: [object Object]
    addStringMetadataEntryToServiceInfoDiv("Document Info", json.documentInfo, infoDivName);

    //layers: [object Object]
    addLayersObjectMetadataEntryToServiceInfoDiv("Layers", json.layers, infoDivName);

    //tables: [object Object]
    addTablesObjectMetadataEntryToServiceInfoDiv("Tables", json.tables, infoDivName);

    //enableZDefaults: false
    addBooleanMetadataEntryToServiceInfoDiv("Enable ZDefaults", json.enableZDefaults, infoDivName);
}

function listNAServerServiceInfo(json, infoDivName) {
    /// <summary>List the metadata of an NAServer service into the Service Info Div.</summary>
    /// <param name="json" type="String">Description of service in JSON format.</param>
    /// <param name="infoDivName" type="String">Name of the info div.</param>

    //serviceDescription: null
    // serviceDescription is already displayed.

    //routeLayers: Route
    addStringMetadataEntryToServiceInfoDiv("Route Layers", json.routeLayers, infoDivName);

    //serviceAreaLayers: ServiceArea
    addStringMetadataEntryToServiceInfoDiv("Service Area Layers", json.serviceAreaLayers, infoDivName);

    //closestFacilityLayers: ClosestFacility
    addStringMetadataEntryToServiceInfoDiv("Closest Facility Layers", json.closestFacilityLayers, infoDivName);
}

function addStringMetadataEntryToServiceInfoDiv(metadataEntryTitle, metadataEntryValue, infoDivName) {
    /// <summary>Adds a metadata entry with 'String' formatting to the Service Info Div.</summary>
    /// <param name="metadataEntryTitle" type="String">The title that will appear in the info div.</param>
    /// <param name="metadataEntryValue" type="String">Value of the metadata entry.</param>
    /// <param name="infoDivName" type="String">Name of the info div.</param>
    $("#" + infoDivName).append('<p><b>' + metadataEntryTitle + ':</b> ' + ((metadataEntryValue != "") ? metadataEntryValue : "Not specified") + '</p>');
}

function addNumberMetadataEntryToServiceInfoDiv(metadataEntryTitle, metadataEntryValue, infoDivName) {
    /// <summary>Adds a metadata entry with 'Number' formatting to the Service Info Div.</summary>
    /// <param name="metadataEntryTitle" type="String">The title that will appear in the info div.</param>
    /// <param name="metadataEntryValue" type="String">Value of the metadata entry.</param>
    /// <param name="infoDivName" type="String">Name of the info div.</param>
    $("#" + infoDivName).append('<p><b>' + metadataEntryTitle + ':</b> ' + ((metadataEntryValue != "") ? metadataEntryValue : "Not specified") + '</p>');
}

function addBooleanMetadataEntryToServiceInfoDiv(metadataEntryTitle, metadataEntryValue, infoDivName) {
    /// <summary>Adds a metadata entry with 'Boolean' formatting to the Service Info Div.</summary>
    /// <param name="metadataEntryTitle" type="String">The title that will appear in the info div.</param>
    /// <param name="metadataEntryValue" type="String">Value of the metadata entry.</param>
    /// <param name="infoDivName" type="String">Name of the info div.</param>
    
    $("#" + infoDivName).append('<p>'
        + ((metadataEntryValue)
            ? '<img src="images/GreenCheckMark.png" alt="True" />'
            : '<img src="images/RedXMark.png" alt="False" />')
        + '<b>   ' + metadataEntryTitle + '</b></p>');
}

function addCommaSeparatedListMetadataEntryToServiceInfoDiv(metadataEntryTitle, metadataEntryValue, infoDivName) {
    /// <summary>Adds a metadata entry with a value of comma-separated list to the Service Info Div.</summary>
    /// <param name="metadataEntryTitle" type="String">The title that will appear in the info div.</param>
    /// <param name="metadataEntryValue" type="String">Value of the metadata entry.</param>
    /// <param name="infoDivName" type="String">Name of the info div.</param>
    
    if (metadataEntryValue == "") {
        $("#" + infoDivName).append('<p><b>' + metadataEntryTitle + ':</b> ' + "Not specified" + '</p>');
    }
    else {
        var listItems = metadataEntryValue.split(',');
        var listHtml = '<p><b>' + metadataEntryTitle + ':</b> ' + "<ul>";
        function writeListItem(item) {
            listHtml += "<li>" + item + "</li>";
        };
        listItems.forEach(writeListItem);        
        listHtml += "</ul>" + '</p>';
        $("#" + infoDivName).append(listHtml);
    }
}

function addSpatialReferenceObjectMetadataEntryToServiceInfoDiv(metadataEntryTitle, metadataEntryValue, infoDivName) {
    /// <summary>Adds a metadata entry with 'Spatial Reference' object to the Service Info Div.</summary>
    /// <param name="metadataEntryTitle" type="String">The title that will appear in the info div.</param>
    /// <param name="metadataEntryValue" type="String">Value of the metadata entry.</param>
    /// <param name="infoDivName" type="String">Name of the info div.</param>
    $("#" + infoDivName).append('<p><b>' + metadataEntryTitle + ':</b> ' + ((metadataEntryValue != "") ? metadataEntryValue : "Not specified") + '</p>');
}

function addGeometryObjectMetadataEntryToServiceInfoDiv(metadataEntryTitle, metadataEntryValue, infoDivName) {
    /// <summary>Adds a metadata entry with 'Geometry' object to the Service Info Div.</summary>
    /// <param name="metadataEntryTitle" type="String">The title that will appear in the info div.</param>
    /// <param name="metadataEntryValue" type="String">Value of the metadata entry.</param>
    /// <param name="infoDivName" type="String">Name of the info div.</param>
    $("#" + infoDivName).append('<p><b>' + metadataEntryTitle + ':</b> ' + ((metadataEntryValue != "") ? metadataEntryValue : "Not specified") + '</p>');
}

function addLayersObjectMetadataEntryToServiceInfoDiv(metadataEntryTitle, metadataEntryValue, infoDivName) {
    /// <summary>Adds a metadata entry with 'Layers' object to the Service Info Div.</summary>
    /// <param name="metadataEntryTitle" type="String">The title that will appear in the info div.</param>
    /// <param name="metadataEntryValue" type="String">Value of the metadata entry.</param>
    /// <param name="infoDivName" type="String">Name of the info div.</param>
    $("#" + infoDivName).append('<p><b>' + metadataEntryTitle + ':</b> ' + ((metadataEntryValue != "") ? metadataEntryValue : "Not specified") + '</p>');
}

function addTablesObjectMetadataEntryToServiceInfoDiv(metadataEntryTitle, metadataEntryValue, infoDivName) {
    /// <summary>Adds a metadata entry with 'Tables' object to the Service Info Div.</summary>
    /// <param name="metadataEntryTitle" type="String">The title that will appear in the info div.</param>
    /// <param name="metadataEntryValue" type="String">Value of the metadata entry.</param>
    /// <param name="infoDivName" type="String">Name of the info div.</param>
    $("#" + infoDivName).append('<p><b>' + metadataEntryTitle + ':</b> ' + ((metadataEntryValue != "") ? metadataEntryValue : "Not specified") + '</p>');
}

function addDocumentInfoObjectMetadataEntryToServiceInfoDiv(metadataEntryTitle, metadataEntryValue, infoDivName) {
    /// <summary>Adds a metadata entry with 'Document Info' object to the Service Info Div.</summary>
    /// <param name="metadataEntryTitle" type="String">The title that will appear in the info div.</param>
    /// <param name="metadataEntryValue" type="String">Value of the metadata entry.</param>
    /// <param name="infoDivName" type="String">Name of the info div.</param>
    $("#" + infoDivName).append('<p><b>' + metadataEntryTitle + ':</b> ' + ((metadataEntryValue != "") ? metadataEntryValue : "Not specified") + '</p>');
}

function addServiceDataTypeObjectMetadataEntryToServiceInfoDiv(metadataEntryTitle, metadataEntryValue, infoDivName) {
    /// <summary>Adds a metadata entry with 'Service Data Type' object to the Service Info Div.</summary>
    /// <param name="metadataEntryTitle" type="String">The title that will appear in the info div.</param>
    /// <param name="metadataEntryValue" type="String">Value of the metadata entry.</param>
    /// <param name="infoDivName" type="String">Name of the info div.</param>
    $("#" + infoDivName).append('<p><b>' + metadataEntryTitle + ':</b> ' + ((metadataEntryValue != "") ? metadataEntryValue : "Not specified") + '</p>');
}

function addUnitsObjectMetadataEntryToServiceInfoDiv(metadataEntryTitle, metadataEntryValue, infoDivName) {
    /// <summary>Adds a metadata entry with 'Service Data Type' object to the Service Info Div.</summary>
    /// <param name="metadataEntryTitle" type="String">The title that will appear in the info div.</param>
    /// <param name="metadataEntryValue" type="String">Value of the metadata entry.</param>
    /// <param name="infoDivName" type="String">Name of the info div.</param>
    $("#" + infoDivName).append('<p><b>' + metadataEntryTitle + ':</b> ' + ((metadataEntryValue != "") ? metadataEntryValue : "Not specified") + '</p>');
}

function addRasterTypeInfosObjectMetadataEntryToServiceInfoDiv(metadataEntryTitle, metadataEntryValue, infoDivName) {
    /// <summary>Adds a metadata entry with 'Raster Type Infos' object to the Service Info Div.</summary>
    /// <param name="metadataEntryTitle" type="String">The title that will appear in the info div.</param>
    /// <param name="metadataEntryValue" type="String">Value of the metadata entry.</param>
    /// <param name="infoDivName" type="String">Name of the info div.</param>
    $("#" + infoDivName).append('<p><b>' + metadataEntryTitle + ':</b> ' + ((metadataEntryValue != "") ? metadataEntryValue : "Not specified") + '</p>');
}

function addRasterFunctionInfosObjectMetadataEntryToServiceInfoDiv(metadataEntryTitle, metadataEntryValue, infoDivName) {
    /// <summary>Adds a metadata entry with 'Raster Function Infos' object to the Service Info Div.</summary>
    /// <param name="metadataEntryTitle" type="String">The title that will appear in the info div.</param>
    /// <param name="metadataEntryValue" type="String">Value of the metadata entry.</param>
    /// <param name="infoDivName" type="String">Name of the info div.</param>
    $("#" + infoDivName).append('<p><b>' + metadataEntryTitle + ':</b> ' + ((metadataEntryValue != "") ? metadataEntryValue : "Not specified") + '</p>');
}

function addFieldsListMetadataEntryToServiceInfoDiv(metadataEntryTitle, metadataEntryValue, infoDivName) {
    /// <summary>Adds a metadata entry with list of 'Fields' to the Service Info Div.</summary>
    /// <param name="metadataEntryTitle" type="String">The title that will appear in the info div.</param>
    /// <param name="metadataEntryValue" type="String">Value of the metadata entry.</param>
    /// <param name="infoDivName" type="String">Name of the info div.</param>
    $("#" + infoDivName).append('<p><b>' + metadataEntryTitle + ':</b> ' + ((metadataEntryValue != "") ? metadataEntryValue : "Not specified") + '</p>');
}

String.prototype.endsWith = function (suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};