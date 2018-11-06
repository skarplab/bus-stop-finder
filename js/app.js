let parksUrl = 'https://services.arcgis.com/v400IkDOw1ad7Yad/arcgis/rest/services/Parks/FeatureServer/0/query?where=DEVELOPED+%3D+%27Developed%27&outFields=PARKID%2CNAME%2CADDRESS%2CZIP_CODE%2CALTERNATE_ADDRESS&returnGeometry=true&geometryPrecision=6&outSR=4326&orderByFields=NAME&f=geojson';
let parksJSON;

let stopsUrl = 'https://services.arcgis.com/v400IkDOw1ad7Yad/arcgis/rest/services/GoRaleigh_Stops/FeatureServer/0/query?where=1%3D1&outFields=*&returnGeometry=true&outSR=4326&orderByFields=StopId&f=geojson';
let stopsJSON;

let nsaUrl = 'https://services.arcgis.com/v400IkDOw1ad7Yad/arcgis/rest/services/Raleigh_Parks_Half_Mile_Network_Service_Areas/FeatureServer/0/query?where=1%3D1&outFields=PARKID%2C+NAME&returnGeometry=true&geometryPrecision=6&outSR=4326&orderByFields=PARKID&f=geojson';
let nsaJSON;

let map = L.map('map').setView([35.779591, -78.638176], 15);

let basemap = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
	attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
	subdomains: 'abcd',
	maxZoom: 19
}).addTo(map);

let stopPropertiesCategories = {
    stop: ['StopId', 'StopAbbr', 'StopName', 'StopName', 'NodeAbbr', 'OnStreet', 'AtStreet',
    'Unit', 'City', 'State', 'ZipCode', 'Lon', 'Lat', 'Bench', 'Shelter', 'Lighting',
    'Garbage', 'Bicycle', 'CATStop', 'NodeId', 'NodeName'],
    line: ['FID', 'Sequence', 'LineAbbr', 'LineName', 'LineType'],
    toss: ['GpsLon', 'GpsLat', 'DATAStop', 'TTAStop', 'NodeAbbr_1', 'tpField00']
}


Promise.all([
    d3.json(parksUrl),
    d3.json(stopsUrl),
    d3.json(nsaUrl)
]).then(([parksData, stopsData, nsaData]) => {
    
    parksLayer = L.geoJson(parksData, {
        fillColor: '#1B5E20',
        fillOpacity: 0.4,
        weight: 0,       
    }).addTo(map);

    stopsLayer = L.geoJson(stopsData, {
        pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng, {
                color: 'black',
                weight: 1,
                opacity: 1,
                fillOpacity: 0,
                radius: 3
            })
        },
        onEachFeature: markerPopup
    }).addTo(map);

    nsaLayer = L.geoJson(nsaData, {
        fillOpacity: 0,
        weight: 0.5,
        color: 'black',
        opacity: 1
    });
    
    let parkNameArray = parksData.features.map(x => x.properties.NAME);
    let parkIDArray = parksData.features.map(x => x.properties.PARKID);

    let parkList = document.getElementById('park-table-body')
    parkNameArray.forEach(function(item, idx) {
        let tr = document.createElement('tr');
        let td = document.createElement('td');
        td.value = parkIDArray[idx];
        td.appendChild(document.createTextNode(item));
        tr.appendChild(td);
        parkList.appendChild(tr);
    })

});

function markerPopup(feature, layer) {
    let featureProperties = feature.properties;
    let popupHtml = '';
    for(let property in featureProperties) {
       popupHtml+=`<b>${property}:</b> ${featureProperties[property]}<br>`
    }
    layer.bindPopup(popupHtml)
  }

function removeProperties(array, ...removeProperties){
let filteredArray = []
array.forEach(function(item){
    for (let property in item) {
    if(removeProperties.flat().includes(property)) {
        delete item[property]
    }
    }
    filteredArray.push(item)
})

return filteredArray
}