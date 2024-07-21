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

function padTo2Digits(num) {
	return num.toString().padStart(2, '0');
}
function getLocalTime(time) {
	const now = new Date();
	const utcDate = now.getFullYear() + '-' + padTo2Digits(now.getMonth() + 1) + '-' + padTo2Digits(now.getDate()) + 'T' + time + ':00Z';
	const date = new Date(utcDate);

	return padTo2Digits(date.getHours()) + ':' + padTo2Digits(date.getMinutes());
}

async function getMareas(id, element = '') {
	url = "https://ideihm.covam.es/api-ihm/getmarea?request=gettide&id=" + id + "&format=json"
	console.log('Mareas: ' + url)
	let data = await fetch(url)
		.then(response => response.json())
		.then(data => {
			return createList(data, element);
		});
	return data;
}

function createList(data, element) {
	const mainDiv = document.getElementById(element);

	var ubicacion = data["mareas"]["puerto"];
	var fecha = getFechaES(data["mareas"]["fecha"]);
	var datos = data['mareas']['datos']['marea'];
	var mareas = ''
		+ datos[0]['tipo'] + ": " + getLocalTime(datos[0]['hora'])
		+ ", "
		+ datos[1]['tipo'] + ": " + getLocalTime(datos[1]['hora'])
		+ "<br>"
		+ datos[2]['tipo'] + ": " + getLocalTime(datos[2]['hora'])
		+ ", "
		+ datos[3]['tipo'] + ": " + getLocalTime(datos[3]['hora'])

	if (element != '') {
		const keyDiv = document.createElement('div');
		keyDiv.innerHTML = `Mareas en ${ubicacion} (${fecha})<br> ${mareas}`;
		mainDiv.appendChild(keyDiv);
	}

	document.getElementById("data_mareas").innerHTML = "<p style='font-size:12px;'>"
		+ '<a href="https://ideihm.covam.es/portal/api-mareas/" target="copyright">Información mareas proporcionada por IHM, ' + fecha + '</a></p>'
		+ "</a></p>";

	return mareas;
}

// --------------------------------------------------------------------------------------------------

var apikey = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJqbXZpbGFyaW5ob0BnbWFpbC5jb20iLCJqdGkiOiJhZTdiYTgwOS1iOTQ3LTQxM2YtYmRmYy03ODEzZjMxOGM5ZDkiLCJpc3MiOiJBRU1FVCIsImlhdCI6MTcyMTQ4NDg2MiwidXNlcklkIjoiYWU3YmE4MDktYjk0Ny00MTNmLWJkZmMtNzgxM2YzMThjOWQ5Iiwicm9sZSI6IiJ9.7kqIc3ErJmp9MtGELp9C8SDUkZ-a9bAX2LeRw_aysRg';

function getPrevision(id, element, idmareas = 0) {
	const ms = Date.now();
	const url = 'https://opendata.aemet.es/opendata/api/prediccion/especifica/playa/' + id + '/?api_key=' + apikey + "&dummy=" + ms
	console.log('Get prevision  playa: ' + url)
	fetch(url)
		.then(response => response.json())
		.then(data => getPrevisionDatos(data, element, idmareas));
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
		+ "<th>Temp. Auga</th><td>" + datos["tAgua"]["valor1"] + "&deg;</td></tr><tr>"
		+ "<th colspan=2>Sensacion</th><td colspan=2>" + datos["sTermica"]["descripcion1"] + "</td>"
		+ "</tr><tr>"
		+ '<th rowspan=4>Mañá<br><img src="img/' + datos["estadoCielo"]["f1"] + '.png" height="50px"></th>'
		+ "<tr>"
		+ "<th>Ceo</th><td style='text-align: left;' colspan=2>" + datos["estadoCielo"]["descripcion1"] + "</td>"
		+ "<tr>"
		+ "<th>Vento</th><td style='text-align: left;' colspan=2>" + datos["viento"]["descripcion1"] + "</td>"
		+ "<tr>"
		+ "<th>Oleaxe</th><td style='text-align: left;' colspan=2>" + datos["oleaje"]["descripcion1"] + "</td>"
		+ "</tr><tr>"
		+ '<th rowspan=4>Tarde<br><img src="img/' + datos["estadoCielo"]["f2"] + '.png" height="50px"></th>' + "<tr>"
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
		+ "Previsión meteorolóxica por AEMET: "
		+ dt.toLocaleDateString("es-ES", options)
		+ "</a></p>";

	const keyDiv = document.createElement('div');
	keyDiv.innerHTML = tabla
	keyDiv.style.textAlign = "center";
	const mainDiv = document.getElementById(element);
	mainDiv.appendChild(keyDiv);
}
