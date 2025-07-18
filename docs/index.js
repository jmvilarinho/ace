function isValidColor(strColor) {
	const s = new Option().style;
	s.color = strColor;
	return s.color !== '';
}


function setAncho(video) {
	const params = new URLSearchParams(window.location.search);
	const width = params.get('w');
	if (width) {
		video.style.width = `${width}px`;
	}
}
function getAncho() {
	const params = new URLSearchParams(window.location.search);
	const width = params.get('w');
	if (width) {
		return `${width}px`;
	} else {
		return '100%';
	}
}

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

function aplanaTexto(texto) {
	if (texto === null)
		return ''
	else
		return texto.toLowerCase().replace(/ /g, "-").replace(/ñ/g, "n").replace(/á/g, "a").replace(/é/g, "e").replace(/í/g, "i").replace(/ó/g, "o").replace(/ú/g, "u").replace(/,/g, "")
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
	alternativeObj.innerHTML = '<a href="#' + videoid + '"><p>' + alternative + '</p></a>';

	var ms = new Date().getTime();
	const keyDiv = document.createElement('div');
	var width = getAncho();
	keyDiv.innerHTML = '<img  id="' + videoid + '-alternative" width="680px" style="width: ' + width + '; height: auto; max-width: 1300px;" src="' + alternativeurl + '?nocache=' + ms + '">';

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
		setAncho(video);
	}
}

function showError(text, element, text2 = '') {
	console.log('Error: ' + text)
	const keyDiv = document.createElement('div');
	html = '<table class="center">';
	html += '<tr><td><b>Erro obtendo previsión</b><br>' + text + '</td></tr>';
	if (text2 != '') {
		html += '<tr><td>' + text2 + '</td></tr>';
	}
	html += '</table>';
	keyDiv.innerHTML = html
	keyDiv.style.textAlign = "center";
	const mainDiv = document.getElementById(element);
	mainDiv.appendChild(keyDiv);
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
		const mainDiv = document.getElementById(element);
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
		html += " <a href=https://waze.com/ul?ll=" + latitude + "," + longitude + "&z=100 target=_new  rel=noopener ><img src='img/waze.png' height='15px'></a>";
	} else {
		html += " <a href=https://maps.google.com?q=" + latitude + "," + longitude + " target=_new  rel=noopener ><img src='img/dot.png' height='15px'></a>";
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

const proxyHost = "https://jl6dcfhxupw4gk4hvy4pxmhjoa0lmhwd.lambda-url.eu-west-1.on.aws/?type=aemet&url=";

function getPrevision(id, element, idmareas = 0) {
	const ms = Date.now();
	// Playas     : https://opendata.aemet.es/opendata/api/prediccion/especifica/playa/1501902/?api_key=eyJhbGciO
	// Municipios : https://opendata.aemet.es/opendata/api/prediccion/especifica/municipio/diaria/27045/?api_key=eyJhb...
	//const url = 'https://opendata.aemet.es/opendata/api/prediccion/especifica/playa/' + id + '/?api_key=' + apiKey + "&nocache=" + ms
	//const url = 'https://opendata.aemet.es/opendata/api/prediccion/especifica/playa/' + id + '/?api_key=' + apiKey;
	const url = 'https://opendata.aemet.es/opendata/api/prediccion/especifica/playa/' + id;
	console.log('Get prevision playa: ' + proxyHost + url);

	fetch(proxyHost + url)
		.then(async  response => {
			const body =  await response.text();
			//console.log('Response status: ' + body);
			if ( body == "Internal Server Error"){
				noPrevision(element, idmareas, 'Timeout obtendo previsión, inténtao máis tarde');
				return false;
			}
			return JSON.parse(body);
		})
		.then(data => getPrevisionDatos(data, element, idmareas, id))
		.catch(error => {
			console.error('Error:', error);
			noPrevision(element, idmareas, error.message);
			return false;
		});
}

async function noPrevision(element, idmareas = 0, error = '') {
	var tabla = '<table class="center">';
	tabla += '<tr><td>(Sin datos de previsión meteorolóxica)<br>' + error + '</td></tr>';
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
	total_elementos = total_elementos - 1;
}

async function getPrevisionDatos(data, element, idmareas, id_playa) {
	if (data['estado'] == 200) {
		if ('error' in data && data['error'] != "") {
			mareas = '';
			if (idmareas > 0) {
				mareas = await getMareas(idmareas);
			}
			showError(data['error'], element, mareas);
			return;
		}

		if ("source" in data) {
			console.log("Datos de '" + id_playa + "' from '" + data['source'] + "'");
		}
		if ("datos_json" in data) {
			console.log("Datos completos para " + id_playa);
			createPrevision(data['datos_json'], element, idmareas, id_playa);
		} else {

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
					createPrevision(JSON.parse(text), element, idmareas, id_playa);
				});
		}
	}
}

function getFechaES(fecha) {
	var options = { year: 'numeric', month: 'numeric', day: 'numeric' };
	var pattern = /(\d{4})[\-]*(\d{2})[\-]*(\d{2})/;

	var st = String(fecha);
	var dt = new Date(st.replace(pattern, '$2-$3-$1'));

	return dt.toLocaleDateString("es-ES", options)
}

async function createPrevision(data, element, idmareas, id_playa) {
	var tabla = '<table class="center">';
	var datos;
	var datos2;

	for (var i = 0; i < data[0]["prediccion"]["dia"].length; i++) {
		if (isTodayStr(data[0]["prediccion"]["dia"][i]["fecha"])) {
			var datos = data[0]["prediccion"]["dia"][i];
			var datos2 = data[0]["prediccion"]["dia"][i + 1];
		}
	}

	var date = new Date;
	var hour = date.getHours();

	tabla += "<tr><th colspan=4>"
		+ '<a href="https://www.aemet.es/es/eltiempo/prediccion/playas/' + aplanaTexto(data[0]["nombre"]) + '-' + id_playa + '" target="_new" rel="noopener" >'
		+ "Prevision para " + data[0]["nombre"]
		+ '</a>'
		+ "</th></tr>";

	tabla += "<tr>"
		+ "<th>Temp. Auga</th><td>" + datos["tAgua"]["valor1"] + "&deg;</td>"
		+ "<th>Temp. Max.</th><td>" + datos["tMaxima"]["valor1"] + "&deg;</td>"
		+ "</tr><tr>"
		+ "<th colspan=2>Sensacion térmica</th><td colspan=2>" + datos["sTermica"]["descripcion1"] + "</td>"
		+ "</tr>";

	if (hour <= 12) {
		tabla += "<tr>"
			+ '<th rowspan=4>Mañá<br><img src="img/' + datos["estadoCielo"]["f1"] + '.png" height="50px"></th>'
			+ "<tr>"
			+ "<th>Ceo</th><td style='text-align: left;' colspan=2>" + datos["estadoCielo"]["descripcion1"] + "</td>"
			+ "<tr>"
			+ "<th>Vento</th><td style='text-align: left;' colspan=2>" + datos["viento"]["descripcion1"] + "</td>"
			+ "<tr>"
			+ "<th>Oleaxe</th><td style='text-align: left;' colspan=2>" + datos["oleaje"]["descripcion1"] + "</td>"
			+ "</tr>";
	}
	if (hour <= 19) {
		tabla += "<tr>"
			+ '<th rowspan=4>Tarde<br><img src="img/' + datos["estadoCielo"]["f2"] + '.png" height="50px"></th>'
			+ "<tr>"
			+ "<th>Ceo</th><td style='text-align: left;' colspan=2>" + datos["estadoCielo"]["descripcion2"] + "</td>"
			+ "<tr>"
			+ "<th>Vento</th><td style='text-align: left;' colspan=2>" + datos["viento"]["descripcion2"] + "</td>"
			+ "<tr>"
			+ "<th>Oleaxe</th><td style='text-align: left;' colspan=2>" + datos["oleaje"]["descripcion2"] + "</td>"
			+ "</tr>";
	}
	if (idmareas > 0) {
		mareas = await getMareas(idmareas);
		tabla += '<tr><td colspan=4>' + mareas + '</td></tr>';
	}

	if (hour > 12) {
		tabla += "<tr><th colspan=4>" + getPrintDate(datos2["fecha"]) + "</th></tr>";
		tabla += "<tr>"
			+ "<th>Temp. Auga</th><td>" + datos2["tAgua"]["valor1"] + "&deg;</td>"
			+ "<th>Temp. Max.</th><td>" + datos2["tMaxima"]["valor1"] + "&deg;</td>"
			+ "</tr>";
		tabla += "<tr>"
			+ '<th rowspan=4>Mañá<br><img src="img/' + datos2["estadoCielo"]["f1"] + '.png" height="50px"></th>'
			+ "<tr>"
			+ "<th>Ceo</th><td style='text-align: left;' colspan=2>" + datos2["estadoCielo"]["descripcion1"] + "</td>"
			+ "<tr>"
			+ "<th>Vento</th><td style='text-align: left;' colspan=2>" + datos2["viento"]["descripcion1"] + "</td>"
			+ "<tr>"
			+ "<th>Oleaxe</th><td style='text-align: left;' colspan=2>" + datos2["oleaje"]["descripcion1"] + "</td>"
			+ "</tr>";
	}
	if (hour > 19) {
		tabla += "<tr>"
			+ '<th rowspan=4>Tarde<br><img src="img/' + datos2["estadoCielo"]["f2"] + '.png" height="50px"></th>'
			+ "<tr>"
			+ "<th>Ceo</th><td style='text-align: left;' colspan=2>" + datos2["estadoCielo"]["descripcion2"] + "</td>"
			+ "<tr>"
			+ "<th>Vento</th><td style='text-align: left;' colspan=2>" + datos2["viento"]["descripcion2"] + "</td>"
			+ "<tr>"
			+ "<th>Oleaxe</th><td style='text-align: left;' colspan=2>" + datos2["oleaje"]["descripcion2"] + "</td>"
			+ "</tr>";
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
	total_elementos = total_elementos - 1;
}

function isToday(d1) {
	// 2024-07-25T00:00:00
	var now = new Date();
	var todayStr = now.getFullYear() + '-' + padTo2Digits(now.getMonth() + 1) + '-' + padTo2Digits(now.getDate()) + 'T00:00:00';
	return (todayStr == d1);
}

function isTodayStr(d1) {
	// 20240725
	var now = new Date();
	var todayStr = now.getFullYear() + padTo2Digits(now.getMonth() + 1) + padTo2Digits(now.getDate());
	return (todayStr == d1);
}

function isTomorrow(d1) {
	const today = new Date();
	const tomorrow = new Date();
	// change tomorrow to next day
	tomorrow.setDate(today.getDate() + 1);
	var todayStr = tomorrow.getFullYear() + '-' + padTo2Digits(tomorrow.getMonth() + 1) + '-' + padTo2Digits(tomorrow.getDate()) + 'T00:00:00';
	return (todayStr == d1);
}

function getPrintDate(dateInput) {
	const dateStr = String(dateInput);
	const match = dateStr.match(/^(\d{4})(\d{2})(\d{2})$/);

	if (match) {
		const [, year, month, day] = match;
		const dt = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
		var daySTR = padTo2Digits(dt.getDate()) + "/" + + padTo2Digits(dt.getMonth() + 1) + '/' + dt.getFullYear();
		return daySTR
	} else {
		console.error("Invalid date format, " + dateStr);
	}

	return "null"
}

