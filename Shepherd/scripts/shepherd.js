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
    var requestUrl = folderUrl + "?f=json&callback=?";
    
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
    var requestUrl = serviceUrl + "?f=json&callback=?";

    $.getJSON(requestUrl, function (json) {

        // Debug info
        if (isDebug) {

            var debugHtml = "";
            debugHtml += '<span class="label label-info">Service Full Details: </span>';
            // List all keys and values
            $.each(json, function (key, value) {
                debugHtml += '<p>' + key + ': ' + value + '</p>';
            });

            debugHtml += '<hr/>';
            debugHtml += '<span class="label label-info">JSON String: </span><br/>';
            debugHtml += JSON.stringify(json);

            $("#jsonDiv").empty();
            $("#jsonDiv").append(debugHtml);
        }

        // Clear div
        $("#" + infoDivName).empty();
        var htmlOutput = "";

        // Service name
        htmlOutput += '<div class="text-right"><p><h2>' + serviceName + '</h2>';
        htmlOutput += '<i>' + serviceType + '</i>  ';
        htmlOutput += '<a href="' + serviceUrl + '" target="_blank"><img src="images/OpenLinkInNewTabSmall.png" alt="View service in Services Directory" /></a></p></div>';
        // '<img src="images/GreenCheckMark.png" alt="True" />'
        htmlOutput += '<hr />';

        // Service description
        htmlOutput += '<p><b>Service Description: </b>';
        if (json.serviceDescription != "") {
            htmlOutput += json.serviceDescription + '</p>';
        }
        else {
            htmlOutput += 'N/A </p>';
        }

        $("#" + infoDivName).append(htmlOutput);

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
            case "MobileServer":
                listMobileServerServiceInfo(json, infoDivName);
                break;
            default:
                break;

        }

    });
}

function listMobileServerServiceInfo(json, infoDivName) {
    /// <summary>List the metadata of a MobileServer service into the Service Info Div.</summary>
    /// <param name="json" type="String">Description of service in JSON format.</param>
    /// <param name="infoDivName" type="String">Name of the info div.</param>

    var serviceInfoHtml = "";

    //{"serviceDescription":"","mapName":"Layers","description":"","layers":[{"id":0,"name":"TurbineInspections"}],"spatialReference":{"wkid":3857},"initialExtent":{"xmin":-13008649.1062614,"ymin":3974076.6861476,"xmax":-12941693.6967706,"ymax":4040139.35684514,"spatialReference":{"wkid":3857}},"fullExtent":{"xmin":-13008649.1062614,"ymin":3974076.6861476,"xmax":-12941693.6967706,"ymax":4040139.35684514,"spatialReference":{"wkid":3857}},"units":"esriMeters"}

    //serviceDescription:
    //service Description is already added.

    //mapName: Layers
    serviceInfoHtml += writeStringMetadataEntryToHtml("Map Name", json.mapName);
    //description:
    serviceInfoHtml += writeStringMetadataEntryToHtml("Description", json.description);
    //layers: [object Object]
    serviceInfoHtml += writeLayersObjectMetadataEntryToHtml("Layers", json.layers);
    //spatialReference: [object Object]
    serviceInfoHtml += writeSpatialReferenceObjectMetadataEntryToHtml("spatialReference", json.spatialReference);
    //initialExtent: [object Object]
    serviceInfoHtml += writeExtentObjectMetadataEntryToHtml("Initial Extent", json.initialExtent);
    //fullExtent: [object Object]
    serviceInfoHtml += writeExtentObjectMetadataEntryToHtml("Full Extent", json.fullExtent);
    //units: esriMeters
    serviceInfoHtml += writeUnitsObjectMetadataEntryToHtml("Units", json.units);
    
    $("#" + infoDivName).append(serviceInfoHtml);

}

function listGPServerServiceInfo(json, infoDivName) {
    /// <summary>List the metadata of a GPServer service into the Service Info Div.</summary>
    /// <param name="json" type="String">Description of service in JSON format.</param>
    /// <param name="infoDivName" type="String">Name of the info div.</param>

    var serviceInfoHtml = "";

    //serviceDescription: The tool filters 911 calls based on the query provided by the client and creates a hotspot raster based on the frequency of calls. The hotspot raster is created using the Spatial Statistics Hot Spot Analysis tool, which ... (see Description)
    // serviceDescription is already displayed.

    //tasks: 911 Calls Hotspot

    //executionType: esriExecutionTypeAsynchronous
    serviceInfoHtml += writeStringMetadataEntryToHtml("Execution Type", json.executionType);

    //resultMapServerName: 911CallsHotspot
    serviceInfoHtml += writeStringMetadataEntryToHtml("Result Map Server Name", json.resultMapServerName);

    //maximumRecords: 1000
    serviceInfoHtml += writeStringMetadataEntryToHtml("Maximum Records", json.maximumRecords);

    $("#" + infoDivName).append(serviceInfoHtml);
}

function listMapServerServiceInfo(json, infoDivName) {

    /// <summary>List the metadata of an MapServer service into the Service Info Div.</summary>
    /// <param name="json" type="String">Description of service in JSON format.</param>
    /// <param name="infoDivName" type="String">Name of the info div.</param>

    var serviceInfoHtml = "";

    // serviceDescription: 
    // serviceDescription is already displayed.

    //mapName: Layers
    serviceInfoHtml += writeStringMetadataEntryToHtml("Map Name", json.mapName);

    //description: FOR DEMO PURPOSES ONLY. The process of blending the elevation datasets is not complete.
    serviceInfoHtml += writeStringMetadataEntryToHtml("Description", json.description);

    //copyrightText: SRTM, GTopo30, GEBCO
    serviceInfoHtml += writeStringMetadataEntryToHtml("Copyright Text", json.copyrightText);

    //supportsDynamicLayers: false
    serviceInfoHtml += writeBooleanMetadataEntryToHtml("Supports Dynamic Layers", json.supportsDynamicLayers);

    //layers: [object Object]
    serviceInfoHtml += writeLayersObjectMetadataEntryToHtml("Layers", json.layers);

    //tables:
    serviceInfoHtml += writeTablesObjectMetadataEntryToHtml("Tables", json.tables);

    //spatialReference: [object Object]
    serviceInfoHtml += writeSpatialReferenceObjectMetadataEntryToHtml("Spatial Reference", json.spatialReference);

    //singleFusedMapCache: false
    serviceInfoHtml += writeBooleanMetadataEntryToHtml("Single Fused Map Cache", json.singleFusedMapCache);

    //initialExtent: [object Object]
    serviceInfoHtml += writeExtentObjectMetadataEntryToHtml("Initial Extent", json.initialExtent);

    //fullExtent: [object Object]
    serviceInfoHtml += writeExtentObjectMetadataEntryToHtml("Full Extent", json.fullExtent);

    //minScale: 0
    serviceInfoHtml += writeNumberMetadataEntryToHtml("Minimum Scale", json.minScale);

    //maxScale: 0
    serviceInfoHtml += writeNumberMetadataEntryToHtml("Maximum Scale", json.maxScale);

    //units: esriMeters
    serviceInfoHtml += writeUnitsObjectMetadataEntryToHtml("Units", json.units);

    //supportedImageFormatTypes: PNG32,PNG24,PNG,JPG,DIB,TIFF,EMF,PS,PDF,GIF,SVG,SVGZ,BMP
    serviceInfoHtml += writeCommaSeparatedListMetadataEntryToHtml("Supported Image Format Types", json.supportedImageFormatTypes);

    //documentInfo: [object Object]
    serviceInfoHtml += writeDocumentInfoObjectMetadataEntryToHtml("Document Info", json.documentInfo);
    
    //capabilities: Map,Query,Data
    serviceInfoHtml += writeCommaSeparatedListMetadataEntryToHtml("Capabilities", json.capabilities);

    //supportedQueryFormats: JSON, AMF
    serviceInfoHtml += writeCommaSeparatedListMetadataEntryToHtml("Supported Query Formats", json.supportedQueryFormats);

    //maxRecordCount: 1000
    serviceInfoHtml += writeNumberMetadataEntryToHtml("Maximum Record Count", json.maxRecordCount);

    //maxImageHeight: 2048
    serviceInfoHtml += writeNumberMetadataEntryToHtml("Maximum Image Height", json.maxImageHeight);

    //maxImageWidth: 2048
    serviceInfoHtml += writeNumberMetadataEntryToHtml("Maximum Image Width", json.maxImageWidth);

    $("#" + infoDivName).append(serviceInfoHtml);
}

function listImageServerServiceInfo(json, infoDivName) {
    /// <summary>List the metadata of an ImageServer service into the Service Info Div.</summary>
    /// <param name="json" type="String">Description of service in JSON format.</param>
    /// <param name="infoDivName" type="String">Name of the info div.</param>

    var serviceInfoHtml = "";

    //serviceDescription: This image service contains 9 LAS files covering North Carolina�s, City of Charlotte downtown area. The lidar data was collected in 2007. First return points are used to generate an on-the-fly seamless elevation surface with a 10-foot pixel resolution. The elevation unit is foot. LAS files were provided by Mecklenburg County, NC and are managed using a mosaic dataset. Esri reserves the right to change or remove this service at any time and without notice.
    // serviceDescription is already displayed.

    //    name: CharlotteLAS
    serviceInfoHtml += writeStringMetadataEntryToHtml("Name", json.name);

    //description: This image service contains 9 LAS files covering North Carolina�s, City of Charlotte downtown area. The lidar data was collected in 2007. First return points are used to generate an on-the-fly seamless elevation surface with a 10-foot pixel resolution. The elevation unit is foot. LAS files were provided by Mecklenburg County, NC and are managed using a mosaic dataset. Esri reserves the right to change or remove this service at any time and without notice.
    serviceInfoHtml += writeStringMetadataEntryToHtml("Description", json.description);

    //    extent: [object Object]
    serviceInfoHtml += writeExtentObjectMetadataEntryToHtml("Extent", json.extent);

    //initialExtent: [object Object]
    serviceInfoHtml += writeExtentObjectMetadataEntryToHtml("Initial Extent", json.initialExtent);

    //fullExtent: [object Object]
    serviceInfoHtml += writeExtentObjectMetadataEntryToHtml("Full Extent", json.fullExtent);

    //pixelSizeX: 10
    serviceInfoHtml += writeNumberMetadataEntryToHtml("Pixel Size X", json.pixelSizeX);

    //pixelSizeY: 10
    serviceInfoHtml += writeNumberMetadataEntryToHtml("Pixel Size Y", json.pixelSizeY);

    //bandCount: 1
    serviceInfoHtml += writeNumberMetadataEntryToHtml("Band Count", json.bandCount);

    //pixelType: F32
    serviceInfoHtml += writeStringMetadataEntryToHtml("Pixel Type", json.pixelType);

    //minPixelSize: 0
    serviceInfoHtml += writeNumberMetadataEntryToHtml("Minimum Pixel Size", json.minPixelSize);

    //maxPixelSize: 0
    serviceInfoHtml += writeNumberMetadataEntryToHtml("Maximum Pixel Size", json.maxPixelSize);

    //copyrightText: Copyright � 2007 Mecklenburg County
    serviceInfoHtml += writeStringMetadataEntryToHtml("Copyright Text", json.copyrightText);

    //serviceDataType: esriImageServiceDataTypeElevation
    serviceInfoHtml += writeServiceDataTypeObjectMetadataEntryToHtml("Service Data Type", json.serviceDataType);

    //minValues: 515.6699829101562
    serviceInfoHtml += writeNumberMetadataEntryToHtml("Minimum Value", json.minValues);

    //maxValues: 1611.125
    serviceInfoHtml += writeNumberMetadataEntryToHtml("Maximum Value", json.maxValues);

    //meanValues: 712.371337411377
    serviceInfoHtml += writeNumberMetadataEntryToHtml("Mean Value", json.meanValues);

    //stdvValues: 45.56883666949917
    serviceInfoHtml += writeNumberMetadataEntryToHtml("Standard Value", json.stdvValues);

    //objectIdField: OBJECTID
    serviceInfoHtml += writeStringMetadataEntryToHtml("Object ID Field", json.objectIdField);

    //fields: [object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object]
    serviceInfoHtml += writeFieldsListMetadataEntryToHtml("Fields", json.fields);

    //capabilities: Image,Metadata,Catalog,Mensuration
    serviceInfoHtml += writeCommaSeparatedListMetadataEntryToHtml("Capabilities", json.capabilities);

    //defaultMosaicMethod: Northwest
    serviceInfoHtml += writeStringMetadataEntryToHtml("Default Mosaic Method", json.defaultMosaicMethod);

    //allowedMosaicMethods: NorthWest,Center,LockRaster,ByAttribute,Nadir,Viewpoint,Seamline,None
    serviceInfoHtml += writeCommaSeparatedListMetadataEntryToHtml("Allowed Mosaic Methods", json.allowedMosaicMethods);

    //sortField:
    serviceInfoHtml += writeStringMetadataEntryToHtml("Sort Field", json.sortField);

    //sortValue: null
    serviceInfoHtml += writeStringMetadataEntryToHtml("Sort Value", json.sortValue);

    //mosaicOperator: First
    serviceInfoHtml += writeStringMetadataEntryToHtml("Mosaic Operator", json.mosaicOperator);

    //defaultCompressionQuality: 75
    serviceInfoHtml += writeNumberMetadataEntryToHtml("Default Compression Quality", json.defaultCompressionQuality);

    //defaultResamplingMethod: Bilinear
    serviceInfoHtml += writeStringMetadataEntryToHtml("Default Resampling Method", json.defaultResamplingMethod);

    //maxImageHeight: 4100
    serviceInfoHtml += writeNumberMetadataEntryToHtml("Maximum Image Height", json.maxImageHeight);

    //maxImageWidth: 15000
    serviceInfoHtml += writeNumberMetadataEntryToHtml("Maximum Image Width", json.maxImageWidth);

    //maxRecordCount: 1000
    serviceInfoHtml += writeNumberMetadataEntryToHtml("Maximum Record Count", json.maxRecordCount);

    //maxDownloadImageCount: 0
    serviceInfoHtml += writeNumberMetadataEntryToHtml("Maximum Download Image Count", json.maxDownloadImageCount);

    //maxDownloadSizeLimit: 0
    serviceInfoHtml += writeNumberMetadataEntryToHtml("Maximum Download Size Limit", json.maxDownloadSizeLimit);

    //maxMosaicImageCount: 20
    serviceInfoHtml += writeNumberMetadataEntryToHtml("Maximum Mosaic Image Count", json.maxMosaicImageCount);

    //allowRasterFunction: true
    serviceInfoHtml += writeBooleanMetadataEntryToHtml("Allow Raster Function", json.allowRasterFunction);

    //rasterFunctionInfos: [object Object],[object Object],[object Object],[object Object]
    serviceInfoHtml += writeRasterFunctionInfosObjectMetadataEntryToHtml("Raster Function Infos", json.rasterFunctionInfos);

    //rasterTypeInfos: [object Object]
    serviceInfoHtml += writeRasterTypeInfosObjectMetadataEntryToHtml("Raster Type Infos", json.rasterTypeInfos);
    
    //mensurationCapabilities: Basic
    serviceInfoHtml += writeStringMetadataEntryToHtml("Mensuration Capabilities", json.mensurationCapabilities);

    //hasHistograms: true
    serviceInfoHtml += writeBooleanMetadataEntryToHtml("Has Histograms", json.hasHistograms);

    //hasColormap: false
    serviceInfoHtml += writeBooleanMetadataEntryToHtml("Has Colormap", json.hasColormap);

    //hasRasterAttributeTable: false
    serviceInfoHtml += writeBooleanMetadataEntryToHtml("Has Raster Attribute Table", json.hasRasterAttributeTable);

    //minScale: 0
    serviceInfoHtml += writeNumberMetadataEntryToHtml("Minimum Scale", json.minScale);

    //maxScale: 0
    serviceInfoHtml += writeNumberMetadataEntryToHtml("Maximum Scale", json.maxScale);

    //editFieldsInfo: null
    serviceInfoHtml += writeStringMetadataEntryToHtml("Edit Fields Info", json.editFieldsInfo);

    //ownershipBasedAccessControlForRasters: null
    serviceInfoHtml += writeStringMetadataEntryToHtml("Ownership Based Access Control for Rasters", json.ownershipBasedAccessControlForRasters);

    //spatialReference: [object Object]
    serviceInfoHtml += writeSpatialReferenceObjectMetadataEntryToHtml("Spatial Reference", json.spatialReference);

    $("#" + infoDivName).append(serviceInfoHtml);
}

function listFeatureServerServiceInfo(json, infoDivName) {
    /// <summary>List the metadata of an FeatureServer service into the Service Info Div.</summary>
    /// <param name="json" type="String">Description of service in JSON format.</param>
    /// <param name="infoDivName" type="String">Name of the info div.</param>

    var serviceInfoHtml = "";

    //serviceDescription: This is a sample map of data entered by city residents. This is a sample service hosted by ESRI, powered by ArcGIS Server. ESRI reserves the right to change or remove this service at any time and without notice.
    // serviceDescription is already displayed.

    //hasVersionedData: false
    serviceInfoHtml += writeBooleanMetadataEntryToHtml("Has Version Data", json.hasVersionedData);

    //supportsDisconnectedEditing: true
    serviceInfoHtml += writeBooleanMetadataEntryToHtml("Supports Disconnected Editing", json.supportsDisconnectedEditing);

    //supportedQueryFormats: JSON, AMF
    serviceInfoHtml += writeCommaSeparatedListMetadataEntryToHtml("Supported Query Formats", json.supportedQueryFormats);

    //maxRecordCount: 1000
    serviceInfoHtml += writeNumberMetadataEntryToHtml("Maximum Record Count", json.maxRecordCount);

    //capabilities: Create,Delete,Query,Update,Uploads,Editing
    serviceInfoHtml += writeCommaSeparatedListMetadataEntryToHtml("Capabilities", json.capabilities);

    //description: This is a sample map of data entered by city residents. This is a sample service hosted by ESRI, powered by ArcGIS Server. ESRI reserves the right to change or remove this service at any time and without notice.
    serviceInfoHtml += writeStringMetadataEntryToHtml("Description", json.description);

    //copyrightText:
    serviceInfoHtml += writeStringMetadataEntryToHtml("Copyright Text", json.copyrightText);

    //spatialReference: [object Object]
    serviceInfoHtml += writeSpatialReferenceObjectMetadataEntryToHtml("Spatial Reference", json.spatialReference);

    //initialExtent: [object Object]
    serviceInfoHtml += writeExtentObjectMetadataEntryToHtml("Initial Extent", json.initialExtent);

    //fullExtent: [object Object]
    serviceInfoHtml += writeExtentObjectMetadataEntryToHtml("Full Extent", json.fullExtent);

    //allowGeometryUpdates: true
    serviceInfoHtml += writeBooleanMetadataEntryToHtml("Allow Geometry Updates", json.allowGeometryUpdates);

    //units: esriDecimalDegrees
    serviceInfoHtml += writeUnitsObjectMetadataEntryToHtml("Units", json.units);

    //documentInfo: [object Object]
    serviceInfoHtml += writeDocumentInfoObjectMetadataEntryToHtml("Document Info", json.documentInfo);

    //layers: [object Object]
    serviceInfoHtml += writeLayersObjectMetadataEntryToHtml("Layers", json.layers);

    //tables: [object Object]
    serviceInfoHtml += writeTablesObjectMetadataEntryToHtml("Tables", json.tables);

    //enableZDefaults: false
    serviceInfoHtml += writeBooleanMetadataEntryToHtml("Enable ZDefaults", json.enableZDefaults);

    $("#" + infoDivName).append(serviceInfoHtml);
}

function listNAServerServiceInfo(json, infoDivName) {
    /// <summary>List the metadata of an NAServer service into the Service Info Div.</summary>
    /// <param name="json" type="String">Description of service in JSON format.</param>
    /// <param name="infoDivName" type="String">Name of the info div.</param>

    var serviceInfoHtml = "";

    //serviceDescription: null
    // serviceDescription is already displayed.

    //routeLayers: Route
    serviceInfoHtml += writeStringMetadataEntryToHtml("Route Layers", json.routeLayers);

    //serviceAreaLayers: ServiceArea
    serviceInfoHtml += writeStringMetadataEntryToHtml("Service Area Layers", json.serviceAreaLayers);

    //closestFacilityLayers: ClosestFacility
    serviceInfoHtml += writeStringMetadataEntryToHtml("Closest Facility Layers", json.closestFacilityLayers);

    $("#" + infoDivName).append(serviceInfoHtml);
}

function writeStringValueOrEmptyAlt(stringValue, altText) {
    /// <summary>Writes the value of a string variable or an alternative "Not specified" if the string is empty.</summary>
    /// <param name="stringValue" type="String">Value of a string variable.</param>
    /// <returns type="String">Html value.</returns>
    
    altText = altText || "Not specified";
    if (stringValue) {
        return ((stringValue != "") ? stringValue : altText);
    }
    else {
        return altText;
    };
}

function writeStringMetadataEntryToHtml(metadataEntryTitle, metadataEntryValue) {
    /// <summary>Adds a metadata entry with 'String' formatting to the Service Info Div.</summary>
    /// <param name="metadataEntryTitle" type="String">The title that will appear in the info div.</param>
    /// <param name="metadataEntryValue" type="String">Value of the metadata entry.</param>
    /// <returns type="String">Html value.</returns>

    return '<p><b>' + metadataEntryTitle + ':</b> ' + writeStringValueOrEmptyAlt(metadataEntryValue) + '</p>';
}

function writeNumberMetadataEntryToHtml(metadataEntryTitle, metadataEntryValue) {
    /// <summary>Adds a metadata entry with 'Number' formatting to the Service Info Div.</summary>
    /// <param name="metadataEntryTitle" type="String">The title that will appear in the info div.</param>
    /// <param name="metadataEntryValue" type="String">Value of the metadata entry.</param>
    /// <returns type="String">Html value.</returns>
    
    return '<p><b>' + metadataEntryTitle + ':</b> ' + (metadataEntryValue ? metadataEntryValue : "Not specified") + '</p>';
}

function writeBooleanMetadataEntryToHtml(metadataEntryTitle, metadataEntryValue) {
    /// <summary>Adds a metadata entry with 'Boolean' formatting to the Service Info Div.</summary>
    /// <param name="metadataEntryTitle" type="String">The title that will appear in the info div.</param>
    /// <param name="metadataEntryValue" type="String">Value of the metadata entry.</param>
    /// <returns type="String">Html value.</returns>

    return '<p>'
        + ((metadataEntryValue)
            ? '<img src="images/GreenCheckMark.png" alt="True" />'
            : '<img src="images/RedXMark.png" alt="False" />')
        + '<b>   ' + metadataEntryTitle + '</b></p>';
}

function writeCommaSeparatedListMetadataEntryToHtml(metadataEntryTitle, metadataEntryValue) {
    /// <summary>Writes a comma-separated list to the Service Info Div as an HTML bulleted list.</summary>
    /// <param name="metadataEntryTitle" type="String">The title that will appear in the info div.</param>
    /// <param name="metadataEntryValue" type="String">Value of the metadata entry.</param>
    /// <returns type="String">Html value.</returns>

    if (metadataEntryValue) {
        var listItems = metadataEntryValue.split(',');
        if (listItems.length == 0) {
            return '<p><b>' + metadataEntryTitle + ':</b> ' + "Not specified" + '</p>';
        }
        else {
            var listHtml = '<p><b>' + metadataEntryTitle + ':</b> ' + "<ul>";
            function writeListItem(item) {
                listHtml += "<li>" + item + "</li>";
            };
            listItems.forEach(writeListItem);
            listHtml += "</ul>" + '</p>';
            return listHtml;
        }
    }
    else {
        return '<p><b>' + metadataEntryTitle + ':</b> ' + "Not specified" + '</p>';
    }
}

function writeSpatialReferenceObjectMetadataEntryToHtml(metadataEntryTitle, metadataEntryValue) {
    /// <summary>Adds a metadata entry with 'SpatialReference' object type to the Service Info Div.</summary>
    /// <param name="metadataEntryTitle" type="String">The title that will appear in the info div.</param>
    /// <param name="metadataEntryValue" type="String">Value of the metadata entry.</param>
    /// <returns type="String">Html value.</returns>
    //"spatialReference":{"wkid":102726,"latestWkid":102726}
    var output = '<p><b>' + metadataEntryTitle + ':</b><br/> ';

    if (metadataEntryValue) {
        output += metadataEntryValue.wkid + " (" + metadataEntryValue.latestWkid + ")" + "<br /></p>";
    }
    else {
        output += "N/A </p>";
    };
    return output;
}

function writeExtentObjectMetadataEntryToHtml(metadataEntryTitle, metadataEntryValue) {
    /// <summary>Adds a metadata entry with 'Extent' object type to the Service Info Div.</summary>
    /// <param name="metadataEntryTitle" type="String">The title that will appear in the info div.</param>
    /// <param name="metadataEntryValue" type="String">Value of the metadata entry.</param>
    /// <returns type="String">Html value.</returns>

    var output = '<p><b>' + metadataEntryTitle + ':</b><br/> ';

    if (metadataEntryValue) {
        //XMin: -9835077.1346837
        output += "XMin: " + metadataEntryValue.xmin + "<br />";
        //YMin: 5106205.549332272
        output += "YMin: " + metadataEntryValue.ymin + "<br />";
        //XMax: -9786978.591968672
        output += "XMax: " + metadataEntryValue.xmax + "<br />";
        //YMax: 5147391.143600403
        output += "YMax: " + metadataEntryValue.ymax + "<br />";
        //Spatial Reference: 102726  (102726) 
        //{"wkid":102726,"latestWkid":102726}}
        output += "Spatial Reference: " + metadataEntryValue.spatialReference.wkid + " (" + metadataEntryValue.spatialReference.latestWkid + ")" + "<br />";
    }
    else {
        output += "N/A";
    };

    output += '</p>';
    return output;
}

function writeGeometryObjectMetadataEntryToHtml(metadataEntryTitle, metadataEntryValue) {
    /// <summary>Adds a metadata entry with 'Geometry' object type to the Service Info Div.</summary>
    /// <param name="metadataEntryTitle" type="String">The title that will appear in the info div.</param>
    /// <param name="metadataEntryValue" type="String">Value of the metadata entry.</param>
    /// <returns type="String">Html value.</returns>

    return '<p><b>' + metadataEntryTitle + ':</b> ' + (metadataEntryValue ? metadataEntryValue : "Not specified") + '</p>';
}

function writeLayersObjectMetadataEntryToHtml(metadataEntryTitle, metadataEntryValue) {
    /// <summary>Adds a metadata entry with Layers object type to the Service Info Div.</summary>
    /// <param name="metadataEntryTitle" type="String">The title that will appear in the info div.</param>
    /// <param name="metadataEntryValue" type="String">Value of the metadata entry.</param>
    /// <returns type="String">Html value.</returns>

    var listHtml = '<p><b>' + metadataEntryTitle + ':</b><br /> ';
    if (metadataEntryValue) {
        if (metadataEntryValue.length === 0) {
            listHtml += ' N/A </p>';
        }
        else {
            listHtml += '<table class="table table-hover"><thead>'
            + '<tr><th>ID</th>'
            + '<th>Name</th>'
            + '<th>Parent Layer ID</th>'
            + '<th>Default Visibility</th>'
            + '<th>Sub Layer Ids</th>'
            + '<th>Min Scale</th>'
            + '<th>Max Scale</th>'
            + '</tr></thead> '
            + '<tbody>';

            function writeLayerObjectMetadataEntryToHtml(layerObject) {
                //{"id":0,"name":"Census Block Points","parentLayerId":-1,"defaultVisibility":true,"subLayerIds":null,"minScale":99999.99998945338,"maxScale":0}
                // id:0
                var output = "<tr><td>" + layerObject.id + "</td>";
                // name:Census Block Points
                output += "<td><b>" + layerObject.name + "</b></td>";
                // parentLayerId:-1
                output += "<td>" + (layerObject.parentLayerId ? layerObject.parentLayerId : "N/A") + "</td>";
                // defaultVisibility:true
                output += "<td>" + (layerObject.defaultVisibility
                    ? '<img src="images/GreenCheckMark.png" alt="Visible by default" />'
                    : '<img src="images/RedXMark.png" alt="Hidden by default" />') + "</td>";
                // subLayerIds:null 
                output += "<td>" + (layerObject.subLayerIds ? layerObject.subLayerIds : "N/A") + "</td>";
                // minScale:99999.99998945338
                output += "<td>" + (layerObject.minScale ? layerObject.minScale : "N/A") + "</td>";
                // maxScale:0
                output += "<td>" + (layerObject.maxScale ? layerObject.maxScale : "N/A") + "</td>";
                output += "</tr>";
                listHtml += output;
            };
            metadataEntryValue.forEach(writeLayerObjectMetadataEntryToHtml);
            listHtml += "</tbody>";
            listHtml += '</table></p>';
        };
    }
    else {
        listHtml += ' N/A </p>';
    };

    return listHtml;
}

function writeTablesObjectMetadataEntryToHtml(metadataEntryTitle, metadataEntryValue) {
    /// <summary>Adds a metadata entry with Tables object type to the Service Info Div.</summary>
    /// <param name="metadataEntryTitle" type="String">The title that will appear in the info div.</param>
    /// <param name="metadataEntryValue" type="String">Value of the metadata entry.</param>
    /// <returns type="String">Html value.</returns>

    var listHtml = '<p><b>' + metadataEntryTitle + ':</b><br /> ';
    if (metadataEntryValue) {
        if (metadataEntryValue.length === 0) {
            listHtml += ' N/A </p>';
        }
        else {
            listHtml += '<table class="table table-hover"><thead>'
            + '<tr><th>ID</th>'
            + '<th>Name</th>'
            + '</tr></thead> '
            + '<tbody>';

            function writeTableObjectMetadataEntryToHtml(tableObject) {
                // "tables":[{"id":1,"name":"ServiceRequestComment"}]
                // id:1
                var output = "<tr><td><b>" + tableObject.id + "</b></td>";
                // name:ServiceRequestComment
                output += "<td>" + tableObject.name + "</td>";
                output += "</tr>";
                listHtml += output;
            };
            metadataEntryValue.forEach(writeTableObjectMetadataEntryToHtml);
            listHtml += "</tbody>";
            listHtml += '</table></p>';
        };
    }
    else {
        listHtml += ' N/A </p>';
    };
    
    return listHtml;
}

function writeDocumentInfoObjectMetadataEntryToHtml(metadataEntryTitle, metadataEntryValue) {
    /// <summary>Adds a metadata entry with 'Document Info' object to the Service Info Div.</summary>
    /// <param name="metadataEntryTitle" type="String">The title that will appear in the info div.</param>
    /// <param name="metadataEntryValue" type="String">Value of the metadata entry.</param>
    /// <returns type="String">Html value.</returns>

    var output = '<p><b>' + metadataEntryTitle + ':</b><br/> ';
    
    if (metadataEntryValue) {
        //Title: Damage Assessment
        output += "Title: <i>" + writeStringValueOrEmptyAlt(metadataEntryValue.Title) + "</i><br />";
        //Author: Esri., Inc.
        output += "Author: <i>" + writeStringValueOrEmptyAlt(metadataEntryValue.Author) + "</i><br />";
        //Comments: This map is used with ArcGIS Mobile to collect structural damage assessment.
        output += "Comments: <i>" + writeStringValueOrEmptyAlt(metadataEntryValue.Comments) + "</i><br />";
        //Subject: This map is used with ArcGIS Mobile to collect structural damage assessment.
        output += "Subject: <i>" + writeStringValueOrEmptyAlt(metadataEntryValue.Subject) + "</i><br />";
        //Category:
        output += "Category: <i>" + writeStringValueOrEmptyAlt(metadataEntryValue.Category) + "</i><br />";
        //Keywords: Emergency Management,Damage Assessment,Public Safety
        output += "Keywords: <i>" + writeStringValueOrEmptyAlt(metadataEntryValue.Keywords) + "</i><br />";
        //AntialiasingMode: None
        output += "Antialiasing Mode: <i>" + writeStringValueOrEmptyAlt(metadataEntryValue.AntialiasingMode) + "</i><br />";
        //TextAntialiasingMode: Force
        output += "Text Antialiasing Mode: <i>" + writeStringValueOrEmptyAlt(metadataEntryValue.TextAntialiasingMode) + "</i><br />";
    }
    else {
        output += " N/A";
    };
    output += '</p>';
    return output;
}

function writeServiceDataTypeObjectMetadataEntryToHtml(metadataEntryTitle, metadataEntryValue) {
    /// <summary>Adds a metadata entry with 'Service Data Type' object type to the Service Info Div.</summary>
    /// <param name="metadataEntryTitle" type="String">The title that will appear in the info div.</param>
    /// <param name="metadataEntryValue" type="String">Value of the metadata entry.</param>
    /// <returns type="String">Html value.</returns>

    return '<p><b>' + metadataEntryTitle + ':</b> ' + (metadataEntryValue ? metadataEntryValue : "Not specified") + '</p>';
}

function writeUnitsObjectMetadataEntryToHtml(metadataEntryTitle, metadataEntryValue) {
    /// <summary>Adds a metadata entry with 'Units' object type to the Service Info Div.</summary>
    /// <param name="metadataEntryTitle" type="String">The title that will appear in the info div.</param>
    /// <param name="metadataEntryValue" type="String">Value of the metadata entry.</param>
    /// <returns type="String">Html value.</returns>

    if (metadataEntryValue) {
        return '<p><b>' + metadataEntryTitle + ':</b> ' + metadataEntryValue.substring(4) + '</p>';
    }
    else {
        return '<p><b>' + metadataEntryTitle + ':</b> N/A</p>';
    }
}

function writeRasterTypeInfosObjectMetadataEntryToHtml(metadataEntryTitle, metadataEntryValue) {
    /// <summary>Adds a metadata entry with 'Raster Type Infos' object to the Service Info Div.</summary>
    /// <param name="metadataEntryTitle" type="String">The title that will appear in the info div.</param>
    /// <param name="metadataEntryValue" type="String">Value of the metadata entry.</param>
    /// <returns type="String">Html value.</returns>

    return '<p><b>' + metadataEntryTitle + ':</b> ' + (metadataEntryValue ? metadataEntryValue : "Not specified") + '</p>';
}

function writeRasterFunctionInfosObjectMetadataEntryToHtml(metadataEntryTitle, metadataEntryValue) {
    /// <summary>Adds a metadata entry with 'Raster Function Infos' object to the Service Info Div.</summary>
    /// <param name="metadataEntryTitle" type="String">The title that will appear in the info div.</param>
    /// <param name="metadataEntryValue" type="String">Value of the metadata entry.</param>
    /// <returns type="String">Html value.</returns>

    return '<p><b>' + metadataEntryTitle + ':</b> ' + (metadataEntryValue ? metadataEntryValue : "Not specified") + '</p>';
}

function writeFieldsListMetadataEntryToHtml(metadataEntryTitle, metadataEntryValue) {
    /// <summary>Adds a metadata entry with list of 'Fields' to the Service Info Div.</summary>
    /// <param name="metadataEntryTitle" type="String">The title that will appear in the info div.</param>
    /// <param name="metadataEntryValue" type="String">Value of the metadata entry.</param>

    var listHtml = '<p><b>' + metadataEntryTitle + ':</b><br /> ';
    if (metadataEntryValue) {
        listHtml += '<table class="table table-hover"><thead>'
            + '<tr><th>Name</th>'
            + '<th>Alias</th>'
            + '<th>Type</th>'
            + '<th>Domain</th>'
            + '</tr></thead> '
            + '<tbody>';

        function writeFieldObjectMetadataEntryToHtml(fieldObject) {

            // {"name":"OBJECTID","type":"esriFieldTypeOID","alias":"OBJECTID","domain":null}

            // name:OBJECTID
            var output = "<tr><td><b>" + fieldObject.name + "</b></td>";
            // alias:OBJECTID
            output += "<td>" + fieldObject.alias + "</td>";
            // type:esriFieldTypeOID
            output += "<td>" + fieldObject.type.substring(13) + "</td>";
            // domain:null
            // OR
            // {"name":"Category","type":"esriFieldTypeInteger","alias":"Category","domain":{"type":"codedValue","name":"MosaicCatalogItemCategoryDomain","codedValues":[{"name":"Unknown","code":0},{"name":"Primary","code":1},{"name":"Overview","code":2},{"name":"Unprocessed Overview","code":3},{"name":"Partial Overview","code":4},{"name":"Uploaded","code":253},{"name":"Incomplete","code":254},{"name":"Custom","code":255}]}}
            if (!fieldObject.domain) {
                output += "<td>N/A</td>";
            }
            else {
                output += "<td>" + fieldObject.domain.name + " (" + fieldObject.domain.type + ")</td>";
            }
            output += "</tr>";
            listHtml += output;
        };
        metadataEntryValue.forEach(writeFieldObjectMetadataEntryToHtml);
        listHtml += "</tbody>";
        listHtml += '</table></p>';
    }
    else {
        listHtml += ' N/A </p>';
    };

    return listHtml;
}

function setServerUrl(serverUrl) {
    $("#txtServerUrl").val(serverUrl);
    btnGetServerInfo_Click(serverUrl);
}

String.prototype.endsWith = function (suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};