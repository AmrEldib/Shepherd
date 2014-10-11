function getURLParameter(name) {
    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [, ""])[1].replace(/\+/g, '%20')) || null
}

var map;
var extentPolygon;

require(["esri/map",
    "esri/layers/ArcGISDynamicMapServiceLayer",
    "esri/layers/FeatureLayer",

    "dojo/domReady!"],
function (Map,
    ArcGISDynamicMapServiceLayer,
    FeatureLayer) {

    map = new Map("map", {
        basemap: "topo",
        center: [-122.45, 37.75], // longitude, latitude
        zoom: 13
    });

    var serviceType = getURLParameter('serviceType');
    var serviceUrl = getURLParameter('serviceUrl');

    var layer;

    switch (serviceType) {
        case "MapServer":
            layer = new ArcGISDynamicMapServiceLayer(serviceUrl);
            console.log(layer);
            map.addLayer(layer);
            //map.setExtent(layer.initialExtent);
            break;
        case "FeatureServer":
            var layer = new FeatureLayer(serviceUrl + "/0", {
                mode: FeatureLayer.MODE_AUTO
            });
            console.log(layer);
            map.addLayer(layer);
            //map.setExtent(layer.initialExtent);
            break;
    }

    map.on("resize", function () {
        //map.setExtent(extentPolygon.getExtent().expand(1.5));
    });
});
