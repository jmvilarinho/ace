function CambiaVista(e) {
	if (pagina == 'praias') {
		pagina = 'poboacions'
	} else {
		pagina = 'praias'
	}
	CambiaVistaUpdate(pagina);
	e.preventDefault();
	return false;
};

function openInNewTab(url) {
	window.open(url, '_blank').focus();
}
function openUrl(url) {
	window.open(url, '_self').focus();
}

function CambiaVistaUpdate(pagina) {
	if (!pagina || !(pagina == 'praias' || pagina == 'poboacions')) {
		pagina = 'praias'
	}

	contenido = pagina + '.html'
	console.log('Cargando página: ' + contenido)
	setCookie('pagina', pagina, 30);


	$(function () {
		$("#DivContent").load(contenido);
	});
	$("#OtherPage").html('');

	var boton_favoritos = $('<input/>').attr({
		type: "button",
		class: (pagina == 'praias') ? 'none' : "back_button",
		id: "field",
		value: 'Praias',
		onclick: "CambiaVistaUpdate('praias')"
	});
	$('#OtherPage').append(boton_favoritos);

	var boton_favoritos = $('<input/>').attr({
		type: "button",
		class: (pagina == 'poboacions') ? 'none' : "back_button",
		id: "field",
		value: 'Poboacions',
		onclick: "CambiaVistaUpdate('poboacions')"
	});
	$('#OtherPage').append(boton_favoritos);
};

function includeHTML(file) {
	var i, elmnt, file, xhttp;
	/*loop through a collection of all HTML elements:*/
	elmnt = document.getElementById("bodyPage");

	/*search for elements with a certain atrribute:*/
	if (file) {
		/*make an HTTP request using the attribute value as the file name:*/
		xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function () {
			if (this.readyState == 4) {
				if (this.status == 200) { elmnt.innerHTML = this.responseText; }
				if (this.status == 404) { elmnt.innerHTML = "Page not found."; }
			}
		}
		xhttp.open("GET", file, true);
		xhttp.send();
		/*exit the function:*/
		return;
	}

};

function setCookie(name, value, days) {
	var expires = "";
	if (days) {
		var date = new Date();
		date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
		expires = "; expires=" + date.toUTCString();
	}
	document.cookie = name + "=" + (value || "") + expires + "; path=/";
}
function getCookie(name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for (var i = 0; i < ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) == ' ') c = c.substring(1, c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
	}
	return null;
}
function eraseCookie(name) {
	document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

// --------------------------------------------------------------------------------------------------
async function validURL(url) {
	result = await fetch(url, {
	})
		.then(response => {
			if (response.ok) {
				return true;
			}
			return false;
		})
		.catch(error => {
			console.error('Error:', error);
			return false;
		});

	return result;
}

function showAlternative(videoid, alternative, alternativeurl) {
	var alternativeObj = document.getElementById(videoid + "-alternative");
	alternativeObj.innerHTML = '<p>' + alternative + '</p>';

	var ms = new Date().getTime();
	const keyDiv = document.createElement('div');
	keyDiv.innerHTML = '<img  id="' + videoid + '-alternative" width="680px" style="width: 100%; height: auto; max-width: 1300px;" src="' + alternativeurl + '?nocache=' + ms + '">';

	var imageObj = document.getElementById(videoid + "-unavailable");
	imageObj.innerHTML = '';
	imageObj.appendChild(keyDiv);
}

function showOnlyAlternative(videoid, alternative, alternativeurl) {
	var video = document.getElementById(videoid);
	var image = document.getElementById(videoid + "-unavailable");

	image.style.visibility = "visible";
	video.remove();

	showAlternative(videoid, alternative, alternativeurl);
}

async function showVideo(url, videoid, alternative = '', alternativeurl = '') {
	var video = document.getElementById(videoid);
	var image = document.getElementById(videoid + "-unavailable");
	exists = await validURL(url);
	if (!exists) {
		image.style.visibility = "visible";
		video.remove();
		if (alternative != '') {
			showAlternative(videoid, alternative, alternativeurl);
		}
	} else {
		video.style.visibility = "visible";
		image.remove();
		if (Hls.isSupported()) {
			var hls = new Hls({
				debug: false,
			});
			hls.loadSource(url);
			hls.attachMedia(video);
			hls.on(Hls.Events.MEDIA_ATTACHED, function () {
				video.muted = true;
				video.play();
			});
		}
		// hls.js is not supported on platforms that do not have Media Source Extensions (MSE) enabled.
		// When the browser has built-in HLS support (check using `canPlayType`), we can provide an HLS manifest (i.e. .m3u8 URL) directly to the video element through the `src` property.
		// This is using the built-in support of the plain video element, without using hls.js.
		else if (video.canPlayType('application/vnd.apple.mpegurl')) {
			video.src = url;
			video.addEventListener('canplay', function () {
				video.play();
			});
		}
	}
}

// --------------------------------------------------------------------------------------------------

async function getMareas(id, element = '') {
	url = "https://ideihm.covam.es/api-ihm/getmarea?request=gettide&id=" + id + "&format=json"
	console.log('Mareas: ' + url)

	let data = await fetch(url)
		.then(response => response.json())
		.then(data => {
			return createList(data, element);
		})
		.catch(error => {
			console.error('Error:', error);
			return noMareas();
		});
	return data;
}

function noMareas() {
	return '(Sin información sobre mareas)'
}

function createList(data, element) {
	const mainDiv = document.getElementById(element);

	var ubicacion = data["mareas"]["puerto"];
	var fecha = getFechaES(data["mareas"]["fecha"]);
	var datos = data['mareas']['datos']['marea'];
	var mareas = '';

	var arrayLength = datos.length;
	for (var i = 0; i < arrayLength; i++) {
		if (i % 2) {
			mareas += ', ';
		} else if (i == 2) {
			mareas += '<br>';
		}
		mareas += datos[i]['tipo'] + ": " + getLocalTime(datos[i]['hora'])
	}

	if (element != '') {
		const keyDiv = document.createElement('div');
		keyDiv.innerHTML = `Mareas en ${ubicacion} (${fecha})<br> ${mareas}`;
		mainDiv.appendChild(keyDiv);
	}

	document.getElementById("data_mareas").innerHTML = "<p style='font-size:12px;'>"
		+ '<a href="https://ideihm.covam.es/portal/presentacion-geoportal/" target="copyright">Información mareas proporcionada por IHM, ' + fecha + '</a></p>'
		+ "</a></p>";

	return mareas;
}

function padTo2Digits(num) {
	return num.toString().padStart(2, '0');
}

function getLocalTime(time) {
	const now = new Date();
	const utcDate = now.getFullYear() + '-' + padTo2Digits(now.getMonth() + 1) + '-' + padTo2Digits(now.getDate()) + 'T' + time + ':00Z';
	const date = new Date(utcDate);

	return padTo2Digits(date.getHours()) + ':' + padTo2Digits(date.getMinutes());
}

// --------------------------------------------------------------------------------------------------

var apikey = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJqbXZpbGFyaW5ob0BnbWFpbC5jb20iLCJqdGkiOiJhZTdiYTgwOS1iOTQ3LTQxM2YtYmRmYy03ODEzZjMxOGM5ZDkiLCJpc3MiOiJBRU1FVCIsImlhdCI6MTcyMTQ4NDg2MiwidXNlcklkIjoiYWU3YmE4MDktYjk0Ny00MTNmLWJkZmMtNzgxM2YzMThjOWQ5Iiwicm9sZSI6IiJ9.7kqIc3ErJmp9MtGELp9C8SDUkZ-a9bAX2LeRw_aysRg';

function getTemperatura(id, latitude, longitude, texto = "Temperatura actual", waze = true) {
	const ms = Date.now();
	const url = "https://api.open-meteo.com/v1/forecast?latitude=" + latitude + "&longitude=" + longitude + "&current=temperature_2m,wind_speed_10m"
	console.log('Get temperatura: ' + url)
	fetch(url)
		.then(response => response.json())
		.then(data => getTemperaturanDatos(data, id, latitude, longitude, texto, waze));
}

function getTemperaturanDatos(data, element, latitude, longitude, texto, waze = true) {
	const date = new Date(data["current"]["time"] + ':00Z');
	temp = padTo2Digits(date.getHours()) + ':' + padTo2Digits(date.getMinutes());

	const keyDiv = document.createElement('div');
	html = texto + " " + data["current"]["temperature_2m"] + "&deg;";
	if (waze) {
		html += " <a href=https://waze.com/ul?ll=" + latitude + "," + longitude + "&z=100 target=_new><img src='img/waze.png' height='15px'></a>";
	} else {
		html += " <a href=https://maps.google.com?q=" + latitude + "," + longitude + " target=_new><img src='img/dot.png' height='15px'></a>";
	}

	keyDiv.innerHTML = html
	keyDiv.style.textAlign = "center";
	const mainDiv = document.getElementById(element);
	mainDiv.appendChild(keyDiv);

	document.getElementById("data_temperatura").innerHTML = "<p style='font-size:12px;'>"
		+ "<a href='https://open-meteo.com/' target='copyright'>"
		+ "Temperatura actual por Open-Meteo: "
		+ temp
		+ "</a></p>";
}


// --------------------------------------------------------------------------------------------------
function geoFindMe(divName) {

	function success(position) {
		const latitude = position.coords.latitude;
		const longitude = position.coords.longitude;

		getTemperatura(divName, latitude, longitude, "Temperatura na túa ubicación", false)
	}

	function error() {
		status.textContent = "Unable to retrieve your location";
	}

	if (!navigator.geolocation) {
		status.textContent = "Geolocation is not supported by your browser";
	} else {
		status.textContent = "Locating…";
		navigator.geolocation.getCurrentPosition(success, error);
	}
}

// --------------------------------------------------------------------------------------------------

var apikey = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJqbXZpbGFyaW5ob0BnbWFpbC5jb20iLCJqdGkiOiJhZTdiYTgwOS1iOTQ3LTQxM2YtYmRmYy03ODEzZjMxOGM5ZDkiLCJpc3MiOiJBRU1FVCIsImlhdCI6MTcyMTQ4NDg2MiwidXNlcklkIjoiYWU3YmE4MDktYjk0Ny00MTNmLWJkZmMtNzgxM2YzMThjOWQ5Iiwicm9sZSI6IiJ9.7kqIc3ErJmp9MtGELp9C8SDUkZ-a9bAX2LeRw_aysRg';

function getPrevision(id, element, idmareas = 0) {
	// Playas : https://opendata.aemet.es/opendata/api/prediccion/especifica/playa/1501902/?api_key=eyJhbGciO
	// Municipios : https://opendata.aemet.es/opendata/api/prediccion/especifica/municipio/diaria/27045/?api_key=eyJhb...

	const ms = Date.now();
	const url = 'https://opendata.aemet.es/opendata/api/prediccion/especifica/playa/' + id + '/?api_key=' + apikey + "&nocache=" + ms
	console.log('Get prevision playa: ' + url)

	fetch(url)
		.then(response => response.json())
		.then(data => getPrevisionDatos(data, element, idmareas))
		.catch(error => {
			console.error('Error:', error);
			noPrevision(element, idmareas);
			return false;
		});
}

async function noPrevision(element, idmareas = 0) {
	var tabla = '<table class="center">';
	tabla += '<tr><td>(Sin datos de previsión meteorolóxica)</td></tr>';
	if (idmareas > 0) {
		mareas = await getMareas(idmareas);
		tabla += '<tr><td>' + mareas + '</td></tr>';
	}
	tabla += "</table>";

	const keyDiv = document.createElement('div');
	keyDiv.innerHTML = tabla
	keyDiv.style.textAlign = "center";
	const mainDiv = document.getElementById(element);
	mainDiv.appendChild(keyDiv);

}

function getPrevisionDatos(data, element, idmareas) {
	if (data['estado'] == 200) {

		console.log('Get prevision: ' + data['datos'])
		var myHeaders = new Headers();
		myHeaders.append('Content-Type', 'text/plain; charset=UTF-8');

		fetch(data['datos'], myHeaders)
			.then(function (response) {
				return response.arrayBuffer();
			})
			.then(function (buffer) {
				const decoder = new TextDecoder('iso-8859-1');
				const text = decoder.decode(buffer);
				createPrevision(JSON.parse(text), element, idmareas);
			});
	}
}

function getFechaES(fecha) {
	var options = { year: 'numeric', month: 'numeric', day: 'numeric' };
	var pattern = /(\d{4})[\-]*(\d{2})[\-]*(\d{2})/;

	var st = String(fecha);
	var dt = new Date(st.replace(pattern, '$2-$3-$1'));

	return dt.toLocaleDateString("es-ES", options)
}

async function createPrevision(data, element, idmareas) {
	var tabla = '<table class="center">';
	var datos = data[0]["prediccion"]["dia"][0];

	tabla += "<tr><th colspan=4>"
		+ "Prevision para " + data[0]["nombre"]
		+ "</th></tr>";

	tabla += "<tr>"
		+ "<th>Temp. Max.</th><td>" + datos["tMaxima"]["valor1"] + "&deg;</td>"
		+ "<th>Temp. Auga</th><td>" + datos["tAgua"]["valor1"] + "&deg;</td>"
		+ "</tr><tr>"
		+ "<th colspan=2>Sensacion térmica</th><td colspan=2>" + datos["sTermica"]["descripcion1"] + "</td>"
		+ "</tr><tr>"
		+ '<th rowspan=4>Mañá<br><img src="img/' + datos["estadoCielo"]["f1"] + '.png" height="50px"></th>'
		+ "<tr>"
		+ "<th>Ceo</th><td style='text-align: left;' colspan=2>" + datos["estadoCielo"]["descripcion1"] + "</td>"
		+ "<tr>"
		+ "<th>Vento</th><td style='text-align: left;' colspan=2>" + datos["viento"]["descripcion1"] + "</td>"
		+ "<tr>"
		+ "<th>Oleaxe</th><td style='text-align: left;' colspan=2>" + datos["oleaje"]["descripcion1"] + "</td>"
		+ "</tr><tr>"
		+ '<th rowspan=4>Tarde<br><img src="img/' + datos["estadoCielo"]["f2"] + '.png" height="50px"></th>'
		+ "<tr>"
		+ "<th>Ceo</th><td style='text-align: left;' colspan=2>" + datos["estadoCielo"]["descripcion2"] + "</td>"
		+ "<tr>"
		+ "<th>Vento</th><td style='text-align: left;' colspan=2>" + datos["viento"]["descripcion2"] + "</td>"
		+ "<tr>"
		+ "<th>Oleaxe</th><td style='text-align: left;' colspan=2>" + datos["oleaje"]["descripcion2"] + "</td>"
		+ "</tr>";

	if (idmareas > 0) {
		mareas = await getMareas(idmareas);
		tabla += '<tr><td colspan=4>' + mareas + '</td></tr>';
	}

	tabla += "</table>";

	var dt = new Date(data[0]["elaborado"]);
	var options = { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: false };
	document.getElementById("data_prevision").innerHTML = "<p style='font-size:12px;'>"
		+ "<a href='http://www.aemet.es' target='copyright'>"
		+ "Previsión praias por AEMET: "
		+ dt.toLocaleDateString("es-ES", options)
		+ "</a></p>";

	const keyDiv = document.createElement('div');
	keyDiv.innerHTML = tabla
	keyDiv.style.textAlign = "center";
	const mainDiv = document.getElementById(element);
	mainDiv.appendChild(keyDiv);
}


function getPrevisionMunicipio(id, element) {
	const ms = Date.now();
	const url = 'https://opendata.aemet.es/opendata/api/prediccion/especifica/municipio/diaria/' + id + '/?api_key=' + apikey + "&nocache=" + ms
	console.log('Get prevision municipio: ' + url)

	fetch(url)
		.then(response => response.json())
		.then(data => getPrevisionDatosMunicipio(data, element))
		.catch(error => {
			console.error('Error:', error);
			noPrevision(element);
			return false;
		});
}

function getPrevisionDatosMunicipio(data, element) {
	if (data['estado'] == 200) {

		console.log('Get prevision: ' + data['datos'])
		var myHeaders = new Headers();
		myHeaders.append('Content-Type', 'text/plain; charset=UTF-8');

		fetch(data['datos'], myHeaders)
			.then(function (response) {
				return response.arrayBuffer();
			})
			.then(function (buffer) {
				const decoder = new TextDecoder('iso-8859-1');
				const text = decoder.decode(buffer);
				createPrevisionMunicipio(JSON.parse(text), element);
			});
	}
}

function isToday(d1) {
	// 2024-07-25T00:00:00
	var now = new Date();
	var todayStr = now.getFullYear() + '-' + padTo2Digits(now.getMonth() + 1) + '-' + padTo2Digits(now.getDate()) + 'T00:00:00';


	return (todayStr == d1);
}

function municipioRow(datos, index) {
	if (datos["estadoCielo"][index]["value"] == "") {
		row = "";
	} else {
		rowspan = 4;
		snowLine = '';
		if (datos["cotaNieveProv"][index]["value"] != "") {
			rowspan += 1;
			snowLine += "<tr>"
				+ "<th>Neve</th><td style='text-align: left;' colspan=2>" + datos["cotaNieveProv"][index]["value"] + "m.</td>"
		}

		row = "<tr>"
			+ `<th rowspan=${rowspan}>` + datos["estadoCielo"][index]["periodo"] + ' h<br><img src="img/' + datos["estadoCielo"][index]["value"] + '_g.png" height="50px"></th>'
			+ "<tr>"
			+ "<th>Ceo</th><td style='text-align: left;' colspan=2>" + datos["estadoCielo"][index]["descripcion"] + "</td>"
			+ "<tr>"
			+ "<th>Vento</th><td style='text-align: left;vertical-align:middle;border:0px;' colspan=2><div>" + datos["viento"][index]["velocidad"] + 'km/h <img style="vertical-align:middle"  height=20px src="img/wind-' + datos["viento"][index]["direccion"] + '.png"></div></td>'
			+ "<tr>"
			+ "<th>Precip.</th><td style='text-align: left;' colspan=2>" + datos["probPrecipitacion"][index]["value"] + "%</td>"
			+ snowLine
			+ "</tr>";



	}
	return row;

}

async function createPrevisionMunicipio(data, element) {
	var tabla = '<table class="center">';

	var arrayLength = data[0]["prediccion"]["dia"].length;
	for (var i = 0; i < arrayLength; i++) {
		var datos = data[0]["prediccion"]["dia"][i];
		if (isToday(datos["fecha"])) {
			tabla += "<tr><th colspan=4>"
				+ "Prevision para " + data[0]["nombre"]
				+ "</th></tr>";

			tabla += "<tr>"
				+ "<th>Temp. Max.</th><td>" + datos["temperatura"]["maxima"] + "&deg;</td>"
				+ "<th>Temp. Min.</th><td>" + datos["temperatura"]["minima"] + "&deg;</td>"
				+ "</tr>";

			tabla += municipioRow(datos, 4);
			tabla += municipioRow(datos, 5);
			tabla += municipioRow(datos, 6);
		}
	}
	tabla += "</table>";

	const keyDiv = document.createElement('div');
	keyDiv.innerHTML = tabla
	keyDiv.style.textAlign = "center";
	const mainDiv = document.getElementById(element);
	mainDiv.appendChild(keyDiv);

	var dt = new Date(data[0]["elaborado"]);
	var options = { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: false };
	document.getElementById("data_prevision_municipio").innerHTML = "<p style='font-size:12px;'>"
		+ "<a href='http://www.aemet.es' target='copyright'>"
		+ "Previsión poboacions xerada: "
		+ dt.toLocaleDateString("es-ES", options)
		+ "</a></p>";
}
