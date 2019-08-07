/*jslint browser: true*/
/*global $,L*/

//-----------------------------------------------------------------------

var dataBahnhoefe = null,
	map = null,
	markers = null,
	popup = null,
	countries = null,
	nickname = "";

function showMap() {
	"use strict";

	$("#karte").show();
	$("#details").hide();
}

function showPopup(feature, layer) {
	"use strict";

	var detailLink = "station.php?countryCode=" + feature.properties.country + "&stationId=" + feature.properties.idStr;
	var str = "";
	if (null !== feature.properties.photographer) {
		var photoURL = scaleImage(feature.properties.photoUrl, 301);
		str += "<a href=\"" + detailLink + "\" data-ajax=\"false\" style=\"display: block; max-height: 200px; overflow: hidden;\"><img src=\"" + photoURL + "\" style=\"width:301px;\" height=\"400\"></a><br>";
		str += "<div style=\"text-align:right;\">Fotograf: <a href=\"" + feature.properties.photographerUrl + "\">" + feature.properties.photographer + "</a>, "
		str += "Lizenz: <a href=\"" + feature.properties.licenseUrl + "\">" + feature.properties.license + "</a></div>"
		str += "<h2 style=\"text-align:center;\"><a href=\"" + detailLink + "\" data-ajax=\"false\">" + feature.properties.title + "</a></h2>";
	} else {
		str += "<a href=\"" + detailLink + "\" data-ajax=\"false\"><h2 style=\"text-align:center;\">" + feature.properties.title + "</h2></a>";
		str += "<div>Hier fehlt noch ein Foto.</div>";
		str += "<div><a href=\"upload.html?countryCode=" + feature.properties.country + "&stationId=" + feature.properties.idStr + "&title=" + feature.properties.title + "\" title=\"Eigenes Foto hochladen\" data-ajax=\"false\"><i class=\"fas fa-upload\"> Lade Dein Foto hoch.</a></div>";
	}

	if (null === popup) {
		popup = L.popup();
	}

	popup.setLatLng([feature.properties.lat, feature.properties.lon])
		.setContent(str)
		.openOn(map);
}

function showMarkerImagesClustered() {
	"use strict";

	$("body").addClass("showCluster");
	if (markers) {
		map.removeLayer(markers);
	}
	markers = L.markerClusterGroup({
		iconCreateFunction: function (cluster) {
			var markers = cluster.getAllChildMarkers(),
				red = 0,
				green = 0,
				max = markers.length,
				i;
			for (i = 0; i < max; ++i) {
				red += markers[i].options.icon.options.iconUrl.indexOf("red") > 0 ? 1 : 0;
				green += (markers[i].options.icon.options.iconUrl.indexOf("green") > 0 || markers[i].options.icon.options.iconUrl.indexOf("violet") > 0) ? 1 : 0;
			}
			return new L.DivIcon({ html:
				"<svg width=\"40\" height=\"40\" class=\"circle\"><circle r=\"16\" cx=\"20\" cy=\"20\" class=\"pie\" style=\"stroke-dasharray:" + parseInt(green / max * 100, 10) + ", 1000;\"/></svg>" +
				"<div>" +
				"<span>" + max + "</span>" +
				"<span>" + parseInt(green / max * 100, 10) + "%</span>" +
				"</div>", className: "marker-cluster marker-cluster-large", iconSize: new L.Point(40, 40) });
		}
	});

	var bahnhoefe = L.featureGroup()
		.on("click", function (event) {
			showPopup(event.layer.options, this);
		}),
		i,
		customIcon,
		marker;

	for (i = 0; i < dataBahnhoefe.length; ++i) {
		customIcon = L.icon({
			iconUrl: "./images/pointer-" + (dataBahnhoefe[i].photographer === null ? "red" : (dataBahnhoefe[i].photographer === nickname ? "violet" : "green")) + ".png",
			iconSize: [50, 50],
			iconAnchor: [25, 50],
			popupAnchor: [0, -28]
		});
		marker = L.marker([dataBahnhoefe[i].lat, dataBahnhoefe[i].lon], {icon: customIcon, properties: dataBahnhoefe[i]}).addTo(bahnhoefe);
	}

	markers.addLayer(bahnhoefe); // add it to the cluster group
	map.addLayer(markers);		// add it to the map
	map.fitBounds(markers.getBounds()); //set view on the cluster extend
}

function showCircleAllClustered() {
	"use strict";

	if (markers) {
		map.removeLayer(markers);
	}
	markers = L.layerGroup();

	var bahnhoefe = L.featureGroup()
		.on("click", function (event) {
			showPopup(event.layer.options, this);
		}),
		i,
		marker,
		color;

	for (i = 0; i < dataBahnhoefe.length; ++i) {
		color = (dataBahnhoefe[i].photographer === null ? "#B70E3D" : (dataBahnhoefe[i].photographer === nickname ? "#8000FF" : "#3db70e"));
		marker = L.circleMarker([dataBahnhoefe[i].lat, dataBahnhoefe[i].lon], {fillColor: color, fillOpacity: 1, stroke: false, properties: dataBahnhoefe[i]}).addTo(bahnhoefe);
	}

	markers.addLayer(bahnhoefe); // add it to the cluster group
	map.addLayer(markers);		// add it to the map
//	map.fitBounds(markers.getBounds()); //set view on the cluster extend
}

function updateMarker(showPoints) {
	"use strict";

	if (showPoints) {
		showCircleAllClustered();
	} else {
		showMarkerImagesClustered();
	}
}

function getStationsURL() {
	"use strict";

  return getAPIURI() + getCountryCode() + "/stations";
}

function switchCountryLink(countryCode) {
	"use strict";

	setCountryCode(countryCode);

	$("#details").hide();
	$("#karte").show();
	$('.header .mobile-menu:visible .ui-link').click();

	initCountry();

	$.getJSON(getStationsURL(), function (featureCollection) {
		dataBahnhoefe = featureCollection;

		updateMarker(getBoolFromLocalStorage("showPoints", false));
	});
}

function switchCountry() {
	"use strict";

	switchCountryLink($("#country").val());
}

function getPhotoCount() {
	"use strict";

	var photoCount = 0;

	for (var i = 0; i < dataBahnhoefe.length; ++i) {
		if (dataBahnhoefe[i].photographer !== null) {
			photoCount++;
		}
	}

	return photoCount;
}

function showHighScore() {
	"use strict";

	var countStations = dataBahnhoefe.length;
	var countPhotographers = 0;
	var countPhotos = getPhotoCount();
	var percentPhotos = countPhotos / countStations;

	$.ajax({
			url: getAPIURI() + getCountryCode() + "/photographers",
			type: "GET",
			dataType: "json",
			error: function () {
				showHighScorePopup(countStations, countPhotos, countPhotographers, "");
			},
			success: function (obj) {
					var jsonOutput = "";
					var rang = 0;
					var lastPhotoCount = -1;

					$.each(obj, function (propertyName, valueOfProperty) {
									countPhotographers++;
								  if (lastPhotoCount !== valueOfProperty) {
										rang = rang + 1;
									}
									lastPhotoCount = valueOfProperty;

									var crown = "";
									if (rang === 1) {
										crown = "<img src=\"images/crown_gold.png\"/>";
									} else if (rang === 2) {
										crown = "<img src=\"images/crown_silver.png\"/>";
									} else if (rang === 3) {
										crown = "<img src=\"images/crown_bronze.png\"/>";
									} else {
										crown = rang + ".";
									}

									jsonOutput = jsonOutput + "<tr><td>" + crown + "</td><td>" + valueOfProperty + "</td><td><a data-ajax=\"false\" href=\"photographer.html?photographer=" + propertyName + "\">" + propertyName + "</a></td></tr>";
							});

							showHighScorePopup(countStations, countPhotos, countPhotographers, jsonOutput);
					}
			});
}

function showHighScorePopup(countStations, countPhotos, countPhotographers, highscoreTable) {
	"use strict";

	var percentPhotos = (countPhotos / countStations) * 100;

	var highscoreDiv = $("#highscoreBody");
	highscoreDiv.html("<div class=\"progress\">" +
  			"<div class=\"progress-bar bg-success\" role=\"progressbar\" style=\"width: " + percentPhotos + "%;\" aria-valuenow=\"" + percentPhotos + "\" aria-valuemin=\"0\" aria-valuemax=\"100\">" + countPhotos + " von " + countStations + " Fotos</div>" +
				"</div>" +
				"<p style=\"padding-top: 10px;font-weight: bold;\">" + countPhotographers + " Fotografen</p>" +
				"<table class=\"table table-striped\">" + highscoreTable + "</table>");

	var countryCode = getCountryCode();
	for (var i = 0; i < countries.length; ++i) {
		if (countries[i].code == countryCode) {
			$('#highscoreLabel').html("Rangliste: " + countries[i].name);
		}
	}

	$('#highscore').modal('show')
}

function initCountry() {
	$.getJSON(getAPIURI() + "countries", function (countryData) {
		countries = countryData;
		var menu = $("#countries");
		var menuItems = "";
		var currentCountry = getCountryCode();

		countries.sort(function(a,b) {
			return a.name.localeCompare(b.name);
		});

		for (var i = 0; i < countries.length; ++i) {
			menuItems += "<a class=\"dropdown-item\" href=\"javascript:switchCountryLink('" + countries[i].code + "');\" title=\"" + countries[i].name + "\">" + countries[i].name + "</a>";
			if (countries[i].code == currentCountry) {
				$("#country").html(countries[i].name);
				document.title = 'RailwayStations - ' + countries[i].name
			}
		}

		menu.html(menuItems);
	});
}

$(document).ready(function () {
	"use strict";

	var vars = getQueryParameter();
	if (vars && vars.countryCode && vars.countryCode.length > 0) {
		setCountryCode(vars.countryCode)
	}

	var basemap = L.tileLayer(
		"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
		{
			maxZoom: 18,
			attribution: "&copy; <a href=\"https://osm.org/copyright\">OpenStreetMap</a> contributors"
		}
	),
	countryCode = getCountryCode();
	map = L.map("map").setView([50.9730622, 10.9603269], 6);

	basemap.addTo(map);
	map.spin(true);

	nickname = getUserProfile().nickname;
	initCountry();

	$.getJSON(getStationsURL(), function (featureCollection) {
		dataBahnhoefe = featureCollection;

		var showPoints = getBoolFromLocalStorage("showPoints", false);

		updateMarker(showPoints);
	}).done(function () {
		// alert( "second success" );
		map.spin(false);
	}).fail(function (xhr) {
		alert("error");
		map.spin(false);
	}).always(function () {
		// alert( "finished" );
	});

	$(window).on("resize", function () { $("#map").height($(window).height() - 60); map.invalidateSize(); }).trigger("resize");

	$( "#suche" ).autocomplete({
	  lookup: function (query, done) {
	          var matcher = new RegExp( query, "i" );
						var filtered = dataBahnhoefe.filter(function (bahnhof) {
    										return matcher.test(bahnhof.title) || matcher.test(bahnhof.idStr);
						});
						var result = {
	            suggestions: [ ]
        		};
						result.suggestions = $.map(filtered, function (value, key) {
																				return {
																					value: value.title,
																					data: value.idStr
																				};
																	});
	          done( result );
	  },
		onSelect: function( suggestion ) {
			$( "#suche" ).val( suggestion.value );
			var bahnhof = dataBahnhoefe.filter(function (bahnhof) {
							return bahnhof.idStr == suggestion.data;
			});
			map.panTo(L.latLng(bahnhof[0].lat, bahnhof[0].lon));
			map.setZoom(14);

			var bahnhofMarkers = markers.getLayers();
			if (!bahnhofMarkers[0].options) {
				bahnhofMarkers = bahnhofMarkers[0].getLayers();
			}
			for (var i in bahnhofMarkers) {
				var markerID = bahnhofMarkers[i].options.properties.idStr;
				if (markerID == suggestion.data) {
					showPopup(bahnhofMarkers[i].options, this);
				}
			}
			return false;
		}
	});

});
