var myMap = L.map("map", {
    center: [37.7749, -100.4194],
    zoom: 5,
});

let OpenstreetMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(myMap)

var Esri_NatGeoWorldMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; National Geographic, Esri, DeLorme, NAVTEQ, UNEP-WCMC, USGS, NASA, ESA, METI, NRCAN, GEBCO, NOAA, iPC',
    maxZoom: 16
});

var CartoDB_DarkMatter = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
	subdomains: 'abcd',
	maxZoom: 20
}).addTo(myMap);


var tectonicplates = new L.LayerGroup();
var earthquakes = new L.LayerGroup();

var baseMaps = {
    "OpenstreetMap": OpenstreetMap,
    "dark Map": CartoDB_DarkMatter,
    "Natgeo Map": Esri_NatGeoWorldMap

};

var overlays = {
    "Tectonic Plates": tectonicplates,
    "Earthquakes": earthquakes
};

L.control.layers(baseMaps, overlays, { collapsed: false }).addTo(myMap);

d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json").
    then(function (platedata) {
        L.geoJson(platedata, {
            color: "orange",
            weight: 3
        }).addTo(tectonicplates);

        tectonicplates.addTo(myMap);
    });

var url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

d3.json(url).then(function (response) {
    response.features.forEach(element => {
        let latitude = element.geometry.coordinates[1];
        let longitude = element.geometry.coordinates[0];
        let magnitude = element.properties.mag * 25000;
        let depth = element.geometry.coordinates[2];
        function markerColor(argument) {
            if (argument < 10) return "#ffffb2";
            else if (argument < 30) return "#fed976";
            else if (argument < 50) return "#feb24c";
            else if (argument < 70) return "#fd8d3c";
            else if (argument < 90) return "#f03b20";
            else return "#bd0026"
        };

        L.circle([latitude, longitude],
            {
                color: "black",
                fillColor: markerColor(depth),
                fillOpacity: 0.9,
                radius: magnitude,
                weight: 0.5
            }).bindPopup(`<h3>${element.properties.title}</h3>`).addTo(earthquakes)
    });
});

var legend = L.control({
    position: "bottomright"
});

legend.onAdd = function () {
    var div = L.DomUtil.create("div", "info legend");
    div.innerHTML += "<h4>Earthquake Depth (km)</h4>";

    var grades = [-10, 10, 30, 50, 70, 90];
    var colors = [
        "#ffffb2",
        "#fed976",
        "#feb24c",
        "#fd8d3c",
        "#f03b20",
        "#bd0026"
    ];


    for (var i = 0; i < grades.length; i++) {
        div.innerHTML += "<i style='background: " + colors[i] + "'></i> "
            + grades[i] + (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+");
    }
    return div;
};

legend.addTo(myMap);



