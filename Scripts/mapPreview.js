function getURLParameter(name) {
    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [, ""])[1].replace(/\+/g, '%20')) || null
}

var map;
var extentPolygon;

require(["esri/map",
    "esri/layers/ArcGISDynamicMapServiceLayer",
    "esri/layers/FeatureLayer",
    "esri/tasks/GeometryService",
    "esri/geometry/Extent",
    "esri/request",

    "dojo/domReady!"],
function (Map,
    ArcGISDynamicMapServiceLayer,
    FeatureLayer,
    GeometryService,
    Extent,
    esriRequest) {

    esriConfig.defaults.geometryService = new GeometryService("http://sampleserver6.arcgisonline.com/arcgis/rest/services/Utilities/Geometry/GeometryServer");

    var extent = new Extent(JSON.parse(getURLParameter('extent')));
    console.log(extent);

    map = new Map("map", {
        basemap: "topo",
        extent: extent.expand(1.5)
    });

    var serviceType = getURLParameter('serviceType');
    var serviceUrl = getURLParameter('serviceUrl');

    var layer;

    switch (serviceType) {
        case "MapServer":
            layer = new ArcGISDynamicMapServiceLayer(serviceUrl);
            map.addLayer(layer);
            break;
        case "FeatureServer":
            var layer = new FeatureLayer(serviceUrl + "/0", {
                mode: FeatureLayer.MODE_AUTO
            });
            map.addLayer(layer);
            break;
    }
});
