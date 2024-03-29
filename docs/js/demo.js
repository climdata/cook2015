// initialize the map
var map = L.map('map').setView([48.25, 14.25], 5);

// load a tile layer
var OpenStreetMap_DE = L.tileLayer('https://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png', {
 maxZoom: 12,
 minZoom: 4,
 attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            + ' | <a href="https://doi.org/10.1126/sciadv.1500561">OWDA (Cook et al 2015)</a> '
			+ '| <a href="https://www.tambora.org">tambora.org</a>'
}).addTo(map);

function onEachFeature(feature, layer) {
    if (feature.properties && feature.properties.scPDSI) {
        layer.bindPopup('<b>scPDSI</b><br/><b>'+feature.properties.scPDSI.toString()+'</b>');
    }
}

var geojsonLayerWells = new L.GeoJSON([], {onEachFeature: onEachFeature});
map.addLayer(geojsonLayerWells);

function loadGeoJson(data) {
	geojsonLayerWells.clearLayers();
    geojsonLayerWells.addData(data);
	geojsonLayerWells.setStyle(LayerStyle);
  }; 

var geojsonLayerTmbs = new L.GeoJSON();
map.addLayer(geojsonLayerTmbs);

function TmbLayerStyle(feature) {
    return {
    weight: 5,
    opacity: 0.5,
    color: 'blue',
	};
}

var geojsonMarkerOptions = {
    radius: 8,
    fillColor: "#ff7800",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
};

var myIcon = L.icon({
  iconUrl: 'images/pin24.png',
  iconRetinaUrl: 'images/pin48.png',
  iconSize: [29, 24],
  iconAnchor: [9, 21],
  popupAnchor: [0, -14]
});

var iconCodes = {
"longterm precipitation:extremely dry": {icon: 'tint', markerColor: 'red', iconColor: '#FFFFFF', shape: 'circle', prefix: 'icon'},
"longterm precipitation:very dry": {icon: 'tint', markerColor: 'orange', iconColor: '#FFFFFF', shape: 'circle', prefix: 'icon'},	
"wildfire:null": {icon: 'fire', markerColor: 'yellow', iconColor: '#FF0000', shape: 'circle', prefix: 'icon'},
"damaged by fire:null": {icon: 'fire', markerColor: 'yellow', iconColor: '#AA0000', shape: 'circle', prefix: 'icon'},
"temperature level:very hot": {icon: 'sun', markerColor: 'yellow', iconColor: '#AA0000', shape: 'circle', prefix: 'icon'},
"water temperature level:very hot": {icon: 'sun', markerColor: 'yellow', iconColor: '#CC0000', shape: 'circle', prefix: 'icon'},
"price trend:increasing price": {icon: 'euro sign', markerColor: 'violet', iconColor: '#000000', shape: 'penta', prefix: 'icon'},
"price level:high price": {icon: 'euro sign', markerColor: 'violet', iconColor: '#000000', shape: 'penta', prefix: 'icon'},
"water level trend:falling water level": {icon: 'ship', markerColor: 'white', iconColor: '#000000', shape: 'circle', prefix: 'icon'},
"low water level:low water level (no water)": {icon: 'ship', markerColor: 'blue', iconColor: '#000000', shape: 'circle', prefix: 'icon'},
"hunger (humans):null": {icon: 'coffee', markerColor: 'purple', iconColor: '#FFFFFF', shape: 'penta', prefix: 'icon'},
"harvest quality:very good crop quality": {icon: 'leaf', markerColor: 'green-light', iconColor: '#BBFFBB', shape: 'penta', prefix: 'icon'},
"harvest quantity:very low harvest volume": {icon: 'leaf', markerColor: 'green-light', iconColor: '#BBFFBB', shape: 'penta', prefix: 'icon'},
"shortterm precipitation:no precipitation": {icon: 'tint', markerColor: 'cyan', iconColor: '#000000', shape: 'circle', prefix: 'icon'},
"low water level:low water level (severly limited use)": {icon: 'ship', markerColor: 'blue', iconColor: '#000000', shape: 'circle', prefix: 'icon'},
"thirst (animals):null": {icon: 'beer', markerColor: 'cyan', iconColor: '#000000', shape: 'circle', prefix: 'icon'},
"hunger (animals):null": {icon: 'star', markerColor: 'purple', iconColor: '#FFFFFF', shape: 'penta', prefix: 'icon'},
"low water level:low water level (limited use)": {icon: 'ship', markerColor: 'blue', iconColor: '#000000', shape: 'circle', prefix: 'icon'},
"thirst (humans):null": {icon: 'beer', markerColor: 'cyan', iconColor: '#000000', shape: 'penta', prefix: 'icon'},
"precipitation frequency:never precipitation": {icon: 'umbrella', markerColor: 'cyan', iconColor: '#000000', shape: 'circle', prefix: 'icon'},
"other:other": {icon: 'circle', markerColor: 'white', iconColor: '#000000', shape: 'circle', prefix: 'icon'}
}	

//certificate
function getMarker(event) {
	var key = event.node_label + ':' + event.value_label;
	var data = iconCodes[key];

	if(!data) {
	   data = {icon: 'circle', markerColor: 'white', iconColor: '#000000', shape: 'circle', prefix: 'icon'}
       key = "other:other"
	   return null; // here: prefer to not show unknown icons...
	}
	if (!data.marker) {
		iconCodes[key].marker = L.ExtraMarkers.icon(data);
	}
	return iconCodes[key].marker;
}

var redMarker = L.ExtraMarkers.icon({
    icon: 'circle',
    markerColor: 'white',
	iconColor: '#000000',
    shape: 'square',
    prefix: 'icon'
});

var markerClusters = L.markerClusterGroup();

function loadTmbJson(data) {
  var useCluster = true;
  if (data.features.length < 12) {
	useCluster = false;
  }

map.removeLayer(markerClusters);


  if(useCluster) {				  
    markerClusters = L.markerClusterGroup();
  } else {
    markerClusters = L.layerGroup();
  }



for ( var i = 0; i < data.features.length; ++i )
{
  var quote = data.features[i].properties.quote_text;
  if(quote.length > 512) {
     quote = quote.substr(0,500) + '   [ ... '+(quote.length-500).toString()+' more characters]';
  }	  
  var popup = '<b>Node:</b> ' + data.features[i].properties.node_label  
              + '<br/><b>Value:</b> ' + data.features[i].properties.value_label 
              + '<hr style="margin:1px;"/><b>Quote:</b> ' + quote;
    if(data.features[i].properties.public) {			  
      popup += '<hr style="margin:1px;"/><b>Source:</b> ' 
                + data.features[i].properties.source_author /* + '('+'yyyy'+'): ' */		  
			    + ': ' + data.features[i].properties.source_title
				+ '<hr style="margin:1px;"/>'
	}
	
	if(data.features[i].properties.doi) {
      popup += '<b>DOI:</b> <a target="_blank" href="https://dx.doi.org/' + data.features[i].properties.doi + '">'
			+ data.features[i].properties.doi + '</a><br/>';
	}
	if(data.features[i].properties.public) {
	  popup += '<b>More details on:</b> <a target="_blank" href="https://www.tambora.org/index.php/grouping/event/list?g[qid]=' 
			    + data.features[i].properties.quote_id.toString() + '" >tambora.org</a>';
	}			
  var marker = getMarker(data.features[i].properties);
  if(marker) {
    var m = L.marker( [data.features[i].properties.latitude, data.features[i].properties.longitude], {icon: marker} )
                  .bindPopup( popup ); 
    markerClusters.addLayer( m );
  }
}
		  
map.addLayer( markerClusters );

}; 

 
var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend');
	/*
	for (var key in iconCodes){
      var iconData = iconCodes[key];
	  div.innerHTML += '<i style="background:' + iconData['markerColor'] + '; color:'+iconData['iconColor']+'"> <i class="icon '+iconData['icon']+'"></i></i> '+key+'<br/>';
   }
	*/
    div.innerHTML += '<b>scPDSI</b><br/>';

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 6; i >= -6; i-=2) {
		var amount = (i + 6.0) / 12.0;
		var color = interpolateColor('#8d2200', '#93ff93', amount);
        div.innerHTML += '<i style="background:' + color + '"></i> ' + i.toString() + '<br>';
}

return div;
};

legend.addTo(map);
 
 
  
function interpolateColor(a, b, amount) { 
    var ah = parseInt(a.replace('#', '0x'), 16),
        ar = ah >> 16, ag = ah >> 8 & 0xff, ab = ah & 0xff,
        bh = parseInt(b.replace('#', '0x'), 16),
        br = bh >> 16, bg = bh >> 8 & 0xff, bb = bh & 0xff,
        rr = ar + amount * (br - ar),
        rg = ag + amount * (bg - ag),
        rb = ab + amount * (bb - ab);
    return '#' + ((1 << 24) + (rr << 16) + (rg << 8) + rb | 0).toString(16).slice(1);
}  
  
function getStyleColor(d) {
	var amount = (parseFloat(d) + 6.0) / 12.0;
	amount = Math.max(0.0, Math.min(1.0, amount)); 
    var color = interpolateColor('#8d2200', '#93ff93', amount);
	return color;
}

function getStyleOpacity(d) {
	var amount = (parseFloat(d) +6.0) / 12.0;
	amount = Math.max(0.0, Math.min(1.0, amount));
	return 0.8-0.6*amount;
}

	
function LayerStyle(feature) {
    return {
    fillColor: getStyleColor(feature.properties.scPDSI),
    weight: 0.5,
    opacity: 0.1,
    color: 'black',
    dashArray: '0',
	fillOpacity: getStyleOpacity(feature.properties.scPDSI)
	};
}	


var vueSlider = new Vue({
  el: '#yearslider',
  data: {
	min: 1000,  
	max: 2012,
    year: 'init',
	year2: 1540
  },
  methods: { 
    slide(e) {
	   this.year = e.target.value; 
	   console.log('slide: '+ this.year);
	},
	plus() {
	   this.year2 += 1;
	   this.load(this.year2.toString());
	},
	minus() {
	   this.year2 -= 1;
	   this.load(this.year2.toString());
	},
    redraw(e) {
	  this.year = e.target.value;
	  this.load(this.year);
	},
	update(year) {
	   this.year = year;
	   location.hash = '#' + this.year2.toString();
	},
	load(year) {
		this.year2 = parseInt(year);
		this.year = '...loading...';
		var century = Math.floor(parseInt(year)/100);
		var geoJsonUrl = 'https://raw.githubusercontent.com/climdata/cook2015/master/geoJson/century_'+century.toString()+'/drought_'+year+'.json';
		axios
            .get(geoJsonUrl)
            .then(response => { 
		       loadGeoJson(response.data);	
			   this.update(year);   
	    	});	
		  var tmbBaseUrl = 'https://www.tambora.org/index.php/grouping/event/geojson?limit=5000';
          var yearFilter = '&t[yb]='+year+'&t[ye]='+year 		  
		  var nodeFilter = '&g[nd]=90,590,591,87,819,571'
		  var valueFilter = '&g[va]=86,82,6,104,101,41,48,142,57,134,124,125,123'
		  var bbox = map.getBounds();
		  // don't use boxFilter without doing reload on zoom....
		  var boxFilter = 's[lt1]='+ bbox._southWest.lat + 's[lt2]='+ bbox._northEast.lat +
		                  's[lg1]='+ bbox._southWest.lng + 's[lg2]='+ bbox._northEast.lng
		  var tmbJsonUrl = tmbBaseUrl + yearFilter + nodeFilter + valueFilter // + boxFilter
		
		axios
            .get(tmbJsonUrl)
            .then(response => { 
		       loadTmbJson(response.data);	
			   this.update(year);   
	    	});			
			
	},
  },
  computed: {
	current: function() {
      return parseInt(this.year);
	},		
  },
  mounted () {
	var year = '1540'; 
    if(location.hash) {
       var y = parseInt(location.hash.replace('#',''));
	   if(y>999 && y<2050) {
		  this.year2 = y;  
	   }
	}		
	this.load(this.year2);
    //vueEventBus.$on('updatedParameters', e => { this.clickOnMap();})
  }
}) 
