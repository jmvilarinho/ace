// --------------------------------------------------------------------------------------------------
async function validURL(url) {
	try {
		const response = await fetch(url);
		console.log('Camara: ' + url, ' -> ', response.status); // 👉️ 200
		if (response.ok) {
			return true;
		}
	} catch (err) {
		console.log(err);
	}
	return false;
}


function encode_utf8(s) {
	return unescape(encodeURIComponent(s));
}

async function showVideo(url, videoid) {
	var video = document.getElementById(videoid);
	var image = document.getElementById(videoid + "-unavailable");
	exists = await validURL(url);

	if (!exists) {
		video.remove();
		image.style.visibility = "visible";
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

function getMareas(id, element) {
	url = "https://ideihm.covam.es/api-ihm/getmarea?request=gettide&id=" + id + "&format=json"
	console.log('Mareas: ' + url)
	fetch(url)
		.then(response => response.json())
		.then(data => createList(data, element));
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

function createList(data, element) {
	const mainDiv = document.getElementById(element);

	var ubicacion = data["mareas"]["puerto"];
	var fecha=getFechaES( data["mareas"]["fecha"]);
	var datos = data['mareas']['datos']['marea'];
	var mareas = ''
		+ datos[0]['tipo'] + ": " + getLocalTime(datos[0]['hora'])
		+ ", "
		+ datos[1]['tipo'] + ": " + getLocalTime(datos[1]['hora'])
		+ "<br>"
		+ datos[2]['tipo'] + ": " + getLocalTime(datos[2]['hora'])
		+ ", "
		+ datos[3]['tipo'] + ": " + getLocalTime(datos[3]['hora'])

	const keyDiv = document.createElement('div');
	keyDiv.innerHTML = `Mareas en ${ubicacion} (${fecha})<br> ${mareas}`;
	mainDiv.appendChild(keyDiv);
}

// --------------------------------------------------------------------------------------------------

var apikey = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJqbXZpbGFyaW5ob0BnbWFpbC5jb20iLCJqdGkiOiJhZTdiYTgwOS1iOTQ3LTQxM2YtYmRmYy03ODEzZjMxOGM5ZDkiLCJpc3MiOiJBRU1FVCIsImlhdCI6MTcyMTQ4NDg2MiwidXNlcklkIjoiYWU3YmE4MDktYjk0Ny00MTNmLWJkZmMtNzgxM2YzMThjOWQ5Iiwicm9sZSI6IiJ9.7kqIc3ErJmp9MtGELp9C8SDUkZ-a9bAX2LeRw_aysRg';

function getPrevision(id, element) {
	const ms = Date.now();
	fetch('https://opendata.aemet.es/opendata/api/prediccion/especifica/playa/' + id + '/?api_key=' + apikey+"&dummy="+ms)
		.then(response => response.json())
		.then(data => getPrevisionDatos(data, element));
}

function getPrevisionDatos(data, element) {
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
				createPrevision(JSON.parse(text), element);
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

function createPrevision(data, element) {
	var tabla = '<table class="center">';
	var datos = data[0]["prediccion"]["dia"][0];

	tabla += "<tr><th colspan=3>"
		+ "Prevision en " + data[0]["nombre"] + " ( " + getFechaES(datos["fecha"]) + " )"
		+ "</th></tr>";

	tabla += "<tr>"
		+ "<th colspan=2>Temp. Max.</th><td>" + datos["tMaxima"]["valor1"] + "&deg;</td>"
		+ "</tr><tr>"
		+ "<th colspan=2>Sensacion</th><td>" + datos["sTermica"]["descripcion1"] + "</td>"
		+ "</tr><tr>"
		+ "<th colspan=2>Temp. Auga</th><td>" + datos["tAgua"]["valor1"] + "&deg;</td>"
		+ "</tr><tr>"
		+ "<th rowspan=4>Mañá</th>"
		+ "<tr>"
		+ "<th>Ceo</th><td style='text-align: left;'>" + datos["estadoCielo"]["descripcion1"] + "</td>"
		+ "<tr>"
		+ "<th>Vento</th><td style='text-align: left;'>" + datos["viento"]["descripcion1"] + "</td>"
		+ "<tr>"
		+ "<th>Oleaxe</th><td style='text-align: left;'>" + datos["oleaje"]["descripcion1"] + "</td>"
		+ "</tr><tr>"
		+ "<th rowspan=4>Tarde</th>"
		+ "<tr>"
		+ "<th>Ceo</th><td style='text-align: left;'>" + datos["estadoCielo"]["descripcion2"] + "</td>"
		+ "<tr>"
		+ "<th>Vento</th><td style='text-align: left;'>" + datos["viento"]["descripcion2"] + "</td>"
		+ "<tr>"
		+ "<th>Oleaxe</th><td style='text-align: left;'>" + datos["oleaje"]["descripcion2"] + "</td>"
		+ "</tr><tr>";
	tabla += "</table>";

	var dt = new Date(data[0]["elaborado"]);
	var options = { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: false };
	document.getElementById("data_prevision").innerHTML = "<p style='font-size:12px;'>["
	+"<a href='http://www.aemet.es' target='copyright'>"
	+"Previsión meteorolóxica por AEMET: "
		+ dt.toLocaleDateString("es-ES", options)
		+ "</a>]</p>";

	const keyDiv = document.createElement('div');
	keyDiv.innerHTML = tabla
	keyDiv.style.textAlign = "center";
	const mainDiv = document.getElementById(element);
	mainDiv.appendChild(keyDiv);
}
