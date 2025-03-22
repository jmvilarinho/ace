function getPrevisionMunicipio(id, element) {
	const ms = Date.now();
	var url = 'https://opendata.aemet.es/opendata/api/prediccion/especifica/municipio/diaria/' + id + '/?api_key=' + apikey + "&nocache=" + ms
	console.log('Get prevision municipio: ' + url)

	fetch(url)
		.then(response => response.json())
		.then(data => getPrevisionDatosMunicipio(data, element, id))
		.catch(error => {
			console.error('Error:', error);
			noPrevision(element);
			return false;
		});
}

function getPrevisionDatosMunicipio(data, element, id_municipio) {
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
				createPrevisionMunicipio(JSON.parse(text), element, id_municipio);
			});
	}
}

async function createPrevisionMunicipio(data, element, id_municipio) {
	var tabla = '<table class="center">';

	var arrayLength = data[0]["prediccion"]["dia"].length;
	for (var i = 0; i < arrayLength; i++) {
		var datos = data[0]["prediccion"]["dia"][i];
		if (isToday(datos["fecha"])) {
			tabla += "<tr><th colspan=4>"
				+ '<a href="https://www.aemet.es/es/eltiempo/prediccion/municipios/' + aplanaTexto(data[0]["nombre"]) + '-id' + id_municipio + '#detallada" target="_new" rel="noopener" >'
				+ "Prevision para " + data[0]["nombre"]
				+ "</a>"
				+ "</th></tr>";

			tabla += "<tr>"
				+ "<th>Temp. Min.</th><td>" + datos["temperatura"]["minima"] + "&deg;</td>"
				+ "<th>Temp. Max.</th><td>" + datos["temperatura"]["maxima"] + "&deg;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>"
				+ "</tr>";

			tabla += municipioRow(datos, 1);
			tabla += municipioRow(datos, 2);
			//tabla += municipioRow(datos, 4);
			//tabla += municipioRow(datos, 5);
			//tabla += municipioRow(datos, 6);
		}
	}

	tabla += '<tr  id="trmunicipio' + id_municipio + '"><td colspan=4>';
	tabla += '<div><canvas hidden id="municipio' + id_municipio + '"></canvas></div>';
	tabla += '</td ></tr >';
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


	const ms = Date.now();
	url = 'https://opendata.aemet.es/opendata/api/prediccion/especifica/municipio/horaria/' + id_municipio + '/?api_key=' + apikey + "&nocache=" + ms
	console.log('Get precipitacion municipio: ' + url)

	fetch(url)
		.then(response => response.json())
		.then(data => getPrevisionPrecipitacionMunicipio(data, element, id_municipio))
		.catch(error => {
			console.error('Error:', error);
			$('#trmunicipio' + id_municipio).remove();
			return false;
		});
}


function getPrevisionPrecipitacionMunicipio(data, element, id_municipio) {
	if (data['estado'] == 200) {

		console.log('Get precipitacion: ' + data['datos'])
		var myHeaders = new Headers();
		myHeaders.append('Content-Type', 'text/plain; charset=UTF-8');

		fetch(data['datos'], myHeaders)
			.then(function (response) {
				return response.arrayBuffer();
			})
			.then(function (buffer) {
				const decoder = new TextDecoder('iso-8859-1');
				const text = decoder.decode(buffer);
				createPrevisionPrecipitacionMunicipio(JSON.parse(text), element, id_municipio);
			});
	} else {
		$('#trmunicipio' + id_municipio).remove();
	}
}

async function createPrevisionPrecipitacionMunicipio(data, element, id_municipio) {
	//console.log(data[0]["prediccion"]["dia"][0]['precipitacion']);

	var datos_array = data[0]["prediccion"]["dia"][0]['precipitacion'];

	var arrayLength = datos_array.length;
	var labels = [];
	var data = [];
	var max = 0;

	const now = new Date();
	current_hour = now.getHours()

	for (var i = 0; i < arrayLength; i++) {
		hora = Number(datos_array[i]['periodo']);
		precipitacion = Number(datos_array[i]['value']);
		if (hora >= current_hour) {
			labels.push(datos_array[i]['periodo']);
			data.push(precipitacion);
			if (precipitacion > max) {
				max = precipitacion;
			}
		}
	}


	if (max > 0) {
		var image = document.getElementById('municipio' + id_municipio);
		image.style.visibility = "visible";

		// Get the drawing context on the canvas
		var myContext = document.getElementById('municipio' + id_municipio).getContext('2d');
		var myChart = new Chart(myContext, {
			type: 'bar',
			data: {
				labels: labels,
				datasets: [{
					label: 'mm',
					backgroundColor: "blue",
					data: data,
				}
				],
			},
			options: {
				plugins: {
					title: {
						display: true,
						text: 'Precipitación total (hora)'
					},
					legend: {
						display: false
					},
				},
				scales: {
					y: {
						beginAtZero: true,
						suggestedMin: 0,
						suggestedMax: 4,
						title: {
							display: true,
							text: 'mm'
						}
					}
				}

			}
		});
	} else {
		$('#trmunicipio' + id_municipio).remove();
	}
}
