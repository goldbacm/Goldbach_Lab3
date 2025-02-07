//declare map variable globally so all functions have access
var map;
var minValue;

//////////////////////////////////////////
////////// MAP 1 - Proporitonal //////////
/////////////////////////////////////////

//creating map for the proportional symbols    
var map = L.map('coolmap').setView([39.8283, -98.5795], 4.5);

//adding openstreet map tiles

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

//function to get radius
function getradius(attValue) {
    //establih an if else statement to sort the population into differnt size radius
    //chose these amount playing around in QGIS with equal intervals
    //lets fo an if else statement(s)
    if (attValue <=169067){
        return 2;
    }
    else if (attValue <=699521){
        return 8;
    }
    else if (attValue <=2781116){
        return 12;
    }
    else {
        return 16;
    }
 
}

//function to get colors
function getcolor(attValue) {
    // if else statement to sort the sizes into differnt color circles 
    //there was a cool website that did a gradient of sorts, fun to play around with
    if (attValue <=169067){
        return "#73ED15";
    }
    else if (attValue <=699521){
        return "#EDED16";
    }
    else if (attValue <=2781116){
        return "#F6760B";
    }
    else {
        return "#FF0000";
    }
        
}
 
// create proportional symbol
//Add circle markers for point features to the map
function createPropSymbols(data){
    //create marker options
    var geojsonMarkerOptions = {
        radius: 8,
        fillColor: "#ff7800",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.7 //played around with this to impact transparency
    };

//Determine the attribute for scaling the proportional symbols
var attribute = "POPULATION" //we want population 
L.geoJson(data, {
    pointToLayer: function (feature, latlng) {
        //Step 5: For each feature, determine its value for the selected attribute
        var attValue = Number(feature.properties[attribute]); //what number do we have

        //examine the attribute value to check that it is correct
        console.log(feature.properties, attValue);
        //call the function and assign to the radius of geoJson markeroptions
        geojsonMarkerOptions.radius = getradius(attValue);
         //call the function and assign to the radius of geoJson markeroptions
         geojsonMarkerOptions.fillColor = getcolor(attValue);
         //get the big cities to appear in front
         geojsonMarkerOptions.zIndex = attValue;
       //create circle markers
        return L.circleMarker(latlng, geojsonMarkerOptions);
    },
    //add popups and list out the name and population amount
    onEachFeature: (feature, layer) => {
        // Add popups with city information of state, city, and pop info
        var state = feature.properties.ST;
        var city = feature.properties.NAME;
        var population = feature.properties.POPULATION.toLocaleString();
        layer.bindPopup(`<b>State: ${state}</b><br> City: ${city}</b><br>Population: ${population}`);
    }
}).addTo(map);
};


// Create the legend control, define new variable put it in bottom of window
var legend = L.control({ position: "bottomright" });

// Add details to the legend
legend.onAdd = function () {
    //new div to place the legend in
    var div = L.DomUtil.create("div", "info legend");

    // Apply custom background and padding styles for the legend box
    div.style.backgroundColor = "rgba(255, 255, 255, 0.8)";
    div.style.padding = "10px";
    div.style.borderRadius = "5px";
    div.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.3)";

    var grades = [169067, 699521, 2781116, Infinity];
    var labels = ["<strong>Population</strong>", "<br>"];

    // Loop through the population ranges to create colored labels
    for (var i = 0; i < grades.length; i++) {
        var color = getcolor(grades[i]);
        var radius = getradius(grades[i]);

        // Add legend item for each population range
        labels.push(
            '<i style="background:' + color + '; width: ' + radius * 2 + 'px; height: ' + radius * 2 + 'px; border-radius: 50%; display: inline-block;"></i> ' +
            (grades[i] === Infinity ? ">" + grades[i-1] : "≤ " + grades[i]) +
            "<br>"
        );
    }

    div.innerHTML = labels.join("");
    return div;
};

// Add the legend to the map
legend.addTo(map);


//get the data
fetch('/data/USA_MajorCities_2.geojson')
    .then(response => response.json())
    .then(data => {
   
        //call function to create proportional symbols
        createPropSymbols(data);
    })
    .catch(error => console.error('Error: ', error));

//Citing Sources: chatgpt helped with the legend. The Roth chapters and Leaflet tutorials were also used for other parts.
//Also worked togther with other classmates to get the maps to come to life!


//////////////////////////////////////////
////////// MAP 2 - Choropleth ///////////
/////////////////////////////////////////

var map2 = L.map('warmmap').setView([37.8, -96], 4);

// L.tileLayer('https://map1.vis.earthdata.nasa.gov/wmts-webmerc/VIIRS_CityLights_2012/default/{time}/{tilematrixset}{maxZoom}/{z}/{y}/{x}.{format}', {
// 	attribution: 'Imagery provided by services from the Global Imagery Browse Services (GIBS), operated by the NASA/GSFC/Earth Science Data and Information System (<a href="https://earthdata.nasa.gov">ESDIS</a>) with funding provided by NASA/HQ.',
// 	bounds: [[-85.0511287776, -179.999999975], [85.0511287776, 179.999999975]],
// 	minZoom: 1,
// 	maxZoom: 8,
// 	format: 'jpg',
// 	time: '',
// 	tilematrixset: 'GoogleMapsCompatible_Level' 
// }).addTo(map2);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map2);

//assign some color to the density 
function getColor(d) {
    return d > 1000 ? '#800026' :
           d > 500  ? '#BD0026' :
           d > 200  ? '#E31A1C' :
           d > 100  ? '#FC4E2A' :
           d > 50   ? '#FD8D3C' :
           d > 20   ? '#FEB24C' :
           d > 10   ? '#FED976' :
                      '#FFEDA0';
}

//fill in the map based on the density 
function style(feature) {
    return {
        fillColor: getColor(feature.properties.density),
        weight: 2,
        opacity: 1,
        color: 'black',
        dashArray: '3',
        fillOpacity: 0.7
    };
}

/// Hover effect and popup functionality
function onEachFeature(feature, layer) {
    // Create content for the popup
    var popupContent = '<strong>State:</strong> ' + feature.properties.name + '<br>' +
                       '<strong>Population Density:</strong> ' + feature.properties.density.toFixed(2);

    // Add hover effect (popup appears on mouseover, and is removed on mouseout)
    layer.on({
        mouseover: function (e) {
            var layer = e.target;

            // Open the popup on hover
            layer.bindPopup(popupContent).openPopup();
        },
        mouseout: function (e) {
            // Reset style when mouse leaves
            geojson.resetStyle(e.target);  // Ensure 'geojson' is automatically referenced
            e.target.closePopup();         // Close the popup
        }
    });
}

// //get the data
fetch('data/usstatespopdense.geojson')
    .then(response => response.json())
    .then(statesdata => {
   // Add GeoJSON to the map with styling
   L.geoJSON(statesdata, {
        style: style,
        onEachFeature: onEachFeature  // Attach hover functionality here
    }).addTo(map2);
    })
    .catch(error => console.error('Error: ', error));

// Add the legend
var legend = L.control({ position: 'bottomright' });

legend.onAdd = function () {
    var div = L.DomUtil.create('div', 'info legend');
    
    // Set the background to transparent white
    div.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
    div.style.padding = '10px';
    div.style.borderRadius = '5px';
    div.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.2)';
    // Adding the title "Population Density" to the legend, and we want it bold
    div.innerHTML += '<strong>Population Density</strong><br><br>';

    var grades = [10, 20, 50, 100, 200, 500, 1000];
    var labels = [];

    // Loop through density ranges and generate a label with a colored square
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i] + 1) + '; width: 20px; height: 20px; display: inline-block; margin-right: 10px;"></i> ' +  // Colored square
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }

    return div;
};

legend.addTo(map2);

//Citations: Leaflet and the Roth chapters were used here. I also used Chatgpt
//to help with the popups and the legend (the leaflet site was down when I tried to use it again)
//also worked with other classmates (teamwork makes the dream work or maps appear!)