function getURLParameter(name) {
    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [, ""])[1].replace(/\+/g, '%20')) || null
}

var map;
var extentPolygon;

require(["esri/map",
    "esri/layers/GraphicsLayer",
    "esri/symbols/SimpleFillSymbol",
    "esri/graphic",
    "esri/geometry/Polygon",
    "esri/geometry/Extent",

    "dojo/domReady!"],
function (Map,
    GraphicsLayer,
    SimpleFillSymbol,
    Graphic,
    Polygon,
    Extent) {
    
    var extent = new Extent(JSON.parse(getURLParameter('extent')));
    console.log(extent);

    map = new Map("map", {
        basemap: "topo",
        extent: extent,
        center: [-122.45, 37.75], // longitude, latitude
        zoom: 13
    });

    map.on("load", function () {

        extentPolygon = new Polygon([
                        [
                            [extent.xmin, extent.ymin],
                            [extent.xmax, extent.ymin],
                            [extent.xmax, extent.ymax],
                            [extent.xmin, extent.ymax],
                            [extent.xmin, extent.ymin]
                        ]
        ]
            );
        extentPolygon.spatialReference = extent.spatialReference;

        var symbol = new SimpleFillSymbol().setColor("blue").outline.setColor("blue");
        var gl = new GraphicsLayer({ id: "extents" });        
        map.addLayer(gl);

        var attr = { "field1": "Initial Extent" };
        var graphic = new Graphic(extentPolygon, symbol, attr);
        gl.add(graphic);

        map.setExtent(extentPolygon.getExtent().expand(1.5));
    });

    map.on("resize", function () {
        //map.setExtent(extentPolygon.getExtent().expand(1.5));
    });
});
