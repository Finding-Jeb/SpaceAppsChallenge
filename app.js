//Most code here is heavily influenced by (read: copied) the work in https://github.com/Beak-man/SpaceBirds/tree/spaceapps_2020, I used it for an idea on what could be built.
// Top bit is literally said repo's app.js for the purpose of a working screenshot.
// (c) Copyright 2015 Yann Voumard. All Rights Reserved.

var latitudePlaceholder = document.getElementById('latitude');
var longitudePlaceholder = document.getElementById('longitude');
var altitudePlaceholder = document.getElementById('altitude');
var selectedSatellitePlaceholder = document.getElementById('satelliteSelected');


function deg2text(deg, letters) {
    var letter;
    if(deg < 0) {
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

function updateLLA(position) {
    selectedSatellitePlaceholder.textContent = "Sentinel 1A";
    latitudePlaceholder.textContent = deg2text(position.latitude, 'NS');
    longitudePlaceholder.textContent = deg2text(position.longitude, 'EW');
    altitudePlaceholder.textContent = (Math.round(position.altitude / 10) / 100) + "km";
}

// Base Layers
var bmngOneImageLayer = new WorldWind.BMNGOneImageLayer();
var bmngLayer = new WorldWind.BMNGLayer();
var atmosphereLayer = new WorldWind.AtmosphereLayer();
var starfieldLayer = new WorldWind.StarFieldLayer();

// Ground Stations Layer
var groundStations = [
    {name: 'Matera, Italy', latitude: 40.65, longitude: 16.7},
    {name: 'Svalbard, Norway', latitude: 78.2306, longitude: 15.3894},
    {name: 'Maspalomas, Spain', latitude: 27.7629, longitude: -15.6338},
];

var placemarkAttributes = new WorldWind.PlacemarkAttributes(null);
placemarkAttributes.imageSource = "resources/icons/ground-station.png";
placemarkAttributes.imageScale = 0.5;
placemarkAttributes.imageOffset = new WorldWind.Offset(
    WorldWind.OFFSET_FRACTION, 0.3,
    WorldWind.OFFSET_FRACTION, 0.0);
placemarkAttributes.imageColor = WorldWind.Color.WHITE;
placemarkAttributes.labelAttributes.offset = new WorldWind.Offset(
    WorldWind.OFFSET_FRACTION, 0.5,
    WorldWind.OFFSET_FRACTION, 1.0);
placemarkAttributes.labelAttributes.color = WorldWind.Color.WHITE;

var groundStationsLayer = new WorldWind.RenderableLayer("Ground Stations");

for(var i = 0, len = groundStations.length; i < len; i++) {
    var groundStation = groundStations[i];

    var placemark = new WorldWind.Placemark(new WorldWind.Position(groundStation.latitude,
        groundStation.longitude,
        1e3));

    placemark.altitudeMode = WorldWind.RELATIVE_TO_GROUND;
    placemark.label = groundStation.name;
    placemark.attributes = placemarkAttributes;

    groundStationsLayer.addRenderable(placemark);
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

    var gmst = satellite.gstime (time.getUTCFullYear(),
        time.getUTCMonth() + 1,
        time.getUTCDate(),
        time.getUTCHours(),
        time.getUTCMinutes(),
        time.getUTCSeconds());

    var position_gd = satellite.eciToGeodetic (position_eci, gmst);
    var latitude    = satellite.degreesLat(position_gd["latitude"]);
    var longitude   = satellite.degreesLong(position_gd["longitude"]);
    var altitude    = position_gd["height"] * 1000;

    return new WorldWind.Position(latitude, longitude, altitude);
}

var tle_line_1 = '1 39634U 14016A   15092.10425777 -.00000062  00000-0 -35354-5 0  9992'
var tle_line_2 = '2 39634  98.1809 100.2577 0001271  80.6097 279.5256 14.59197994 52994'
var satrec = satellite.twoline2satrec(tle_line_1, tle_line_2);

var now = new Date();
var pastOrbit = [];
var futureOrbit = [];
var currentPosition = null;
for(var i = -98; i <= 98; i++) {
    var time = new Date(now.getTime() + i*60000);

    var position = getPosition(satrec, time)

    if(i < 0) {
        pastOrbit.push(position);
    } else if(i > 0) {
        futureOrbit.push(position);
    } else {
        currentPosition = new WorldWind.Position(position.latitude,
            position.longitude,
            position.altitude);
        pastOrbit.push(position);
        futureOrbit.push(position);
    }
}

// Orbit Path
var pathAttributes = new WorldWind.ShapeAttributes(null);
pathAttributes.outlineColor = WorldWind.Color.RED;
pathAttributes.interiorColor = new WorldWind.Color(1, 0, 0, 0.5);

var pastOrbitPath = new WorldWind.Path(pastOrbit);
pastOrbitPath.altitudeMode = WorldWind.RELATIVE_TO_GROUND;
pastOrbitPath.attributes = pathAttributes;

var pathAttributes = new WorldWind.ShapeAttributes(pathAttributes);
pathAttributes.outlineColor = WorldWind.Color.GREEN;
pathAttributes.interiorColor = new WorldWind.Color(0, 1, 0, 0.5);

var futureOrbitPath = new WorldWind.Path(futureOrbit);
futureOrbitPath.altitudeMode = WorldWind.RELATIVE_TO_GROUND;
futureOrbitPath.attributes = pathAttributes;

var orbitLayer = new WorldWind.RenderableLayer("Orbit");

orbitLayer.addRenderable(pastOrbitPath);
orbitLayer.addRenderable(futureOrbitPath);

// Satellite
var placemarkAttributes = new WorldWind.PlacemarkAttributes(null);
placemarkAttributes.imageSource = "resources/icons/satellite.png";
placemarkAttributes.imageScale = 1;
placemarkAttributes.imageOffset = new WorldWind.Offset(
    WorldWind.OFFSET_FRACTION, 0.3,
    WorldWind.OFFSET_FRACTION, 0.0);
placemarkAttributes.imageColor = WorldWind.Color.WHITE;
placemarkAttributes.labelAttributes.offset = new WorldWind.Offset(
    WorldWind.OFFSET_FRACTION, 0.5,
    WorldWind.OFFSET_FRACTION, 1.0);
placemarkAttributes.labelAttributes.color = WorldWind.Color.WHITE;

var highlightPlacemarkAttributes = new WorldWind.PlacemarkAttributes(placemarkAttributes);
highlightPlacemarkAttributes.imageScale = 1.2;

var satelliteLayer = new WorldWind.RenderableLayer("Satellite");

var placemark = new WorldWind.Placemark(currentPosition);
updateLLA(currentPosition);

placemark.altitudeMode = WorldWind.RELATIVE_TO_GROUND;
placemark.label = "Sentinel 1A";
placemark.attributes = placemarkAttributes;
placemark.highlightAttributes = highlightPlacemarkAttributes;

satelliteLayer.addRenderable(placemark);

// WWD
var wwd = new WorldWind.WorldWindow("wwd");
wwd.drawContext.clearColor = WorldWind.Color.colorFromBytes(0,0,0,0);
wwd.addLayer(bmngOneImageLayer);
wwd.addLayer(bmngLayer);
wwd.addLayer(atmosphereLayer);
wwd.addLayer(starfieldLayer);
wwd.addLayer(groundStationsLayer);
wwd.addLayer(orbitLayer);
wwd.addLayer(satelliteLayer);

// Globe
var globe = wwd.globe;

// Map
var map = new WorldWind.Globe2D();
map.projection = new WorldWind.ProjectionEquirectangular();

// Navigation
wwd.navigator.lookAtLocation = new WorldWind.Location(currentPosition.latitude,
    currentPosition.longitude);

// Draw
wwd.redraw();

// Update Satellite Position
var follow = false;
window.setInterval(function() {
    var position = getPosition(satrec, new Date());
    currentPosition.latitude = position.latitude;
    currentPosition.longitude = position.longitude;
    currentPosition.altitude = position.altitude;

    updateLLA(currentPosition);

    if(follow) {
        toCurrentPosition();
    }

    wwd.redraw();
}, 5000);

function toCurrentPosition() {
    wwd.navigator.lookAtLocation.latitude = currentPosition.latitude;
    wwd.navigator.lookAtLocation.longitude = currentPosition.longitude;
}

// Follow Satellite
var emptyFunction = function(e) {};
var regularHandlePanOrDrag = wwd.navigator.handlePanOrDrag;
var regularHandleSecondaryDrag = wwd.navigator.handleSecondaryDrag;
var regularHandleTilt = wwd.navigator.handleTilt;
var followPlaceholder = document.getElementById('follow');
function toggleFollow() {
    follow = !follow;
    if(follow) {
        followPlaceholder.textContent = 'On';
        wwd.navigator.handlePanOrDrag = emptyFunction;
        wwd.navigator.handleSecondaryDrag = emptyFunction;
        wwd.navigator.handleTilt = emptyFunction;
    } else {
        followPlaceholder.textContent = 'Off';
        wwd.navigator.handlePanOrDrag = regularHandlePanOrDrag;
        wwd.navigator.handleSecondaryDrag = regularHandleSecondaryDrag;
        wwd.navigator.handleTilt = regularHandleTilt;
    }
    toCurrentPosition();
    wwd.redraw();
}

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

// Help
function openHelp() {
    alert("This tool shows the current location of Sentinel 1A and its ground stations. An orbit in the past (red) and one in the future (green) are also displayed.\n\nRepresentation: 3D or 2D\nFollow: On or Off. When on, the position is locked on the satellite, but zooming in and out is still possible.");
}

/*
// app.js
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
*/