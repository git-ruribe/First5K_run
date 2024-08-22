let map;
let pathCoordinates = [];
let watchId;
let startTime;
let distance = 0;
let polyline;
let marker;
let elapsedTimeInterval;

function initMap() {
    // Initialize the map without centering it yet
    map = L.map('map');

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
    }).addTo(map);

    polyline = L.polyline(pathCoordinates, { color: 'red' }).addTo(map);

    // Get the user's current location and center the map on it
    navigator.geolocation.getCurrentPosition(
        position => {
            const { latitude, longitude } = position.coords;
            const currentPosition = [latitude, longitude];
            map.setView(currentPosition, 15); // Set view with zoom level 15

            // Add a marker for the user's current location
            marker = L.marker(currentPosition).addTo(map);
        },
        error => console.error(error),
        { enableHighAccuracy: true }
    );
}

document.getElementById('startButton').addEventListener('click', startTracking);
document.getElementById('endButton').addEventListener('click', stopTracking);

function startTracking() {
    pathCoordinates = [];
    distance = 0;
    startTime = Date.now();

    document.getElementById('startButton').disabled = true;
    document.getElementById('endButton').disabled = false;

    // Start updating elapsed time every second
    elapsedTimeInterval = setInterval(updateStats, 1000);

    watchId = navigator.geolocation.watchPosition(
        position => {
            const { latitude, longitude } = position.coords;
            const newPosition = [latitude, longitude];
            pathCoordinates.push(newPosition);

            // Update marker position
            if (marker) {
                marker.setLatLng(newPosition);
            } else {
                marker = L.marker(newPosition).addTo(map);
            }

            if (pathCoordinates.length > 1) {
                const lastPosition = pathCoordinates[pathCoordinates.length - 2];
                const newDistance = map.distance(lastPosition, newPosition);
                distance += newDistance;
            }

            updateMap();
            updateStats();
        },
        error => console.error(error),
        { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
    );
}

function stopTracking() {
    navigator.geolocation.clearWatch(watchId);
    clearInterval(elapsedTimeInterval);

    document.getElementById('startButton').disabled = false;
    document.getElementById('endButton').disabled = true;

    updateStats();
}

function updateMap() {
    polyline.setLatLngs(pathCoordinates);
    map.setView(pathCoordinates[pathCoordinates.length - 1], map.getZoom());
}

function updateStats() {
    const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
    document.getElementById('distance').innerText = Math.round(distance);
    document.getElementById('duration').innerText = elapsedTime;
}

// Initialize the map when the script is loaded
initMap();
