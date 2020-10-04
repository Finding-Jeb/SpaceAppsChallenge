var latitudePlaceholder = document.getElementById("latitude");
var longitudePlaceholder = document.getElementById("longitude");
var altitudePlaceholder = document.getElementById("altitude");
var satelliteSelectedPlaceholder = document.getElementById("satelliteSelected");

function deg2text(deg, letters) {
    var letter;
    if (deg < 0) {
        letter = letters[1]
    } else {
        letter = letters[0]
    }

    var position = Math.abs(deg);

    var degrees = Math.floor(position);

    position -= degrees;
    position *= 60;

    var minutes = Math.floor(position);

    position -= minutes;
    position *= 60;

    var seconds = Math.floor(position * 100) / 100;

    return degrees + "° " + minutes + "' " + seconds + "\" " + letter;
}

var bmngOneImageLayer = new BMNGOneImageLayer();
var bmngLayer = new BMNGLayer();
var atmosphereLayer = new AtmosphereLayer();
var starfieldLayer = new StarFieldLayer();

var satelliteLayer = new RenderableLayer("Satellites");
let {server, filtered_bodies, body_ids} = import('server');
var satelliteSelected = body_ids[0];
for (var i = 0; i < 100; i++) {
    var body_data = filtered_bodies[i];
    var tle1 = body_data.TLE_LINE_1;
    var tle2 = body_data.TLE_LINE_2;
    var position = getPosition(getSatrecFromTLE(tle1, tle2), new Date());
    var placemarkAttributes = new PlacemarkAttributes(null);
    placemarkAttributes.imageSource = "resources/icons/satellite.png";
    placemarkAttributes.imageScale = 1;
    placemarkAttributes.imageOffset = new Offset(
        OFFSET_FRACTION, 0.3,
        OFFSET_FRACTION, 0.0);
    placemarkAttributes.imageColor = Color.WHITE;
    placemarkAttributes.labelAttributes.offset = new Offset(
        OFFSET_FRACTION, 0.5,
        OFFSET_FRACTION, 1.0);
    placemarkAttributes.labelAttributes.color = Color.WHITE;

    var highlightPlacemarkAttributes = new PlacemarkAttributes(placemarkAttributes);
    highlightPlacemarkAttributes.imageScale = 1.2;
    var placemark = new Placemark(position);
    placemark.altitudeMode = WorldWind.RELATIVE_TO_GROUND;
    placemark.label = body_data.OBJECT_NAME;
    placemark.attributes = placemarkAttributes;
    placemark.highlightAttributes = highlightPlacemarkAttributes;
    placemark.pickDelegate = body_data.OBJECT_ID;
    satelliteLayer.addRenderable(placemark);
}

var wwd = new WorldWindow("wwd");
wwd.canvas.clearColor = Color.TRANSPARENT;
wwd.addLayer(bmngOneImageLayer);
wwd.addLayer(bmngLayer);
wwd.addLayer(atmosphereLayer);
wwd.addLayer(starfieldLayer);
wwd.addLayer(satelliteLayer);

var globe = wwd.globe;
var map = new Globe2D();
map.projection = new ProjectionEquirectangular();

wwd.navigator.lookAtLocation = new Location(getSatelliteCurrentPosition(satelliteSelected).latitude, getSatelliteCurrentPosition(satelliteSelected).longitude)


wwd.redraw();

window.setInterval(function() {
    for (var i=0; i<100; i++){
        var satellite = filtered_bodies[i];
        if (satellite.OBJECT_ID == satelliteSelected){
            updateSatelLLA(satellite.OBJECT_ID, getSatelliteCurrentPosition(satelliteSelected));
        }
        wwd.redraw();
    }
}, 10000);

// Update Globe Representation
var representationPlaceholder = document.getElementById('representation');
function toggleRepresentation() {
    if(wwd.globe instanceof WorldWind.Globe2D) {
        wwd.globe = globe;
        representationPlaceholder.textContent = '3D';
    } else {
        wwd.globe = map;
        representationPlaceholder.textContent = '2D';
    }

    wwd.redraw();
}

// Orbit Propagation (MIT License, see https://github.com/shashwatak/satellite-js)

function getPosition(satrec, time) {
    var position_and_velocity = satellite.propagate(satrec,
        time.getUTCFullYear(),
        time.getUTCMonth() + 1,
        time.getUTCDate(),
        time.getUTCHours(),
        time.getUTCMinutes(),
        time.getUTCSeconds());
    var position_eci = position_and_velocity["position"];

    var gmst = satellite.gstime(time.getUTCFullYear(),
        time.getUTCMonth() + 1,
        time.getUTCDate(),
        time.getUTCHours(),
        time.getUTCMinutes(),
        time.getUTCSeconds());

    var position_gd = satellite.eciToGeodetic(position_eci, gmst);
    var latitude = satellite.degreesLat(position_gd["latitude"]);
    var longitude = satellite.degreesLong(position_gd["longitude"]);
    var altitude = position_gd["height"] * 1000;

    return new Position(latitude, longitude, altitude);
}

function getSatrecFromTLE(tle_line_1, tle_line_2) {
    return satellite.twoline2satrec(tle_line_1, tle_line_2);
}

function getTLEFromBodyID(bodyID) {
    var a = filtered_bodies.find(x => x.OBJECT_ID == bodyID);
    return {tle1: a.TLE_LINE_1, tle2: a.TLE_LINE_2};
}

function getSatelliteCurrentPosition(bodyID){
    var {tle1, tle2} = getTLEFromBodyID(bodyID);
    return getPosition(getSatrecFromTLE(tle1, tle2), new Date());
}

function getSatelliteSelectedName(bodyID){
    var a = filtered_bodies.find(x => x.OBJECT_ID == bodyID);
    return a.OBJECT_NAME;
}

function getUserLocation(){
    if (navigator.geolocation){
        return navigator.geolocation.getCurrentPosition();
    } else {
        return {latitude: 0, longitude: 0};
    }
}

function updateSatelLLA(satellite, position){
    latitudePlaceholder.textContent = deg2text(position.latitude, 'NS');
    longitudePlaceholder.textContent = deg2text(position.longitude, 'EW');
    altitudePlaceholder.textContent = (Math.round(position.altitude / 10) / 100) + "km";
    satelliteSelectedPlaceholder.textContent = getSatelliteSelectedName(satelliteSelected);
}

// Help
function openHelp() {
    alert("This tool shows the current location of multiple satellites. Click on them to change where the tracker will point to.");
}

module.exports = {satelliteSelected, getSatelliteCurrentPosition, getUserLocation};