//////////////////////
// PARKS DATA INFO //
////////////////////
let parksQueryParameters = {
    "where":"DEVELOPED=Developed",
    "outFields":["PARKID","NAME","ADDRESS","ZIP_CODE","ALTERNATE_ADDRESS"],
    "returnGeometry":true,
    "geometryPrecision":6,
    "outSR":4326,
    "orderByFields":"NAME",
    "f":"geojson"
}
let parksUrl = `https://services.arcgis.com/v400IkDOw1ad7Yad/arcgis/rest/services/Parks/FeatureServer/0/query?${queryString(parksQueryParameters)}`;
let parksJSON;

/////////////////////
// STOP DATA INFO //
///////////////////
let stopFieldsArray = ['StopId', 'StopAbbr', 'StopName', 'StopName', 'NodeAbbr', 'OnStreet', 'AtStreet',
'Unit', 'City', 'State', 'ZipCode', 'Lon', 'Lat', 'Bench', 'Shelter', 'Lighting',
'Garbage', 'Bicycle', 'CATStop', 'NodeId', 'NodeName'];
let lineFieldsArray = ['FID', 'Sequence', 'LineAbbr', 'LineName', 'LineType'];
let stopsQueryParameters = {
    "where":"1=1",
    "outFields": stopFieldsArray.concat(lineFieldsArray),
    "returnGeometry":true,
    "outSR":4326,
    "orderByFields":"StopId",
    "f":"geojson"
}
let stopsUrl = `https://services.arcgis.com/v400IkDOw1ad7Yad/arcgis/rest/services/GoRaleigh_Stops/FeatureServer/0/query?${queryString(stopsQueryParameters)}`;
let stopsJSON;

////////////////////
// NSA DATA INFO //
//////////////////
let nsaQueryParameters = {
    "where":"1=1",
    "outFields":["PARKID","NAME"],
    "returnGeometry":true,
    "geometryPrecision":6,
    "outSR":4326,
    "orderByFields":"PARKID",
    "f":"geojson"
}
let nsaUrl = `https://services.arcgis.com/v400IkDOw1ad7Yad/arcgis/rest/services/Raleigh_Parks_Half_Mile_Network_Service_Areas/FeatureServer/0/query?${queryString(nsaQueryParameters)}`;
let nsaJSON;

/////////////////////
// INITIALIZE MAP //
///////////////////
let map = L.map('map').setView([35.779591, -78.638176], 15);

let basemap = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
	attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
	subdomains: 'abcd',
	maxZoom: 19
}).addTo(map);

////////////////
// LOAD DATA //
//////////////
Promise.all([
    d3.json(parksUrl),
    d3.json(stopsUrl),
    d3.json(nsaUrl)
]).then(([parksData, stopsData, nsaData]) => {
    ////////////////
    // SETUP MAP // 
    //////////////
    parksLayer = L.geoJson(parksData, {
        fillColor: '#1B5E20',
        fillOpacity: 0.4,
        weight: 0,       
    }).addTo(map);

    // Generate and unique stops data//
    uniqueStopsArray = getUniqueLocations(stopsData.features, 'properties', 'StopId', lineFieldsArray)
    uniqueStopsGeojson = turf.featureCollection(uniqueStopsArray);
    uniqueStopsLayer = L.geoJson(uniqueStopsGeojson, {
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
////////////////
// FUNCTIONS //
//////////////
function queryString(queryProperties) {
    let queryString = '';
    for(let property in queryProperties) {
        queryString += `${property}=${queryProperties[property].toString()}&`
    }
    return queryString.slice(0,-1)
}

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

function getUniqueLocations(fullArray, attributeKey, idKey, ...removeProperties){
    // Generate an array of unique locations from fullArray   
    let uniqueLocationsArray = []
    let uniqueIdsArray = []
    fullArray.forEach(function(item) {
        if(!uniqueIdsArray.includes(item[attributeKey][idKey])) {
            uniqueLocationsArray.push(item)
            uniqueIdsArray.push(item[attributeKey][idKey])
        }
    })
    
    // Remove any properties that we don't want
    uniqueLocationsArray.forEach(function(item){
        let properties = item.properties
        for (let property in properties) {
            if(removeProperties.flat().includes(property)){
                delete properties[property]
            }
        }
    })
    
    return uniqueLocationsArray
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