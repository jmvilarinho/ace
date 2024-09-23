
function load_equipo_home(cod_equipo) {
	displayLoading();

	var url = "https://pevbxmstzqkdtno6y4ocsumnz40kbdac.lambda-url.eu-west-1.on.aws/?type=getequipo&codequipo=" + cod_equipo;

	console.log("GET " + url);
	fetch(url)
		.then(response => {
			if (!response.ok) {
				hideLoading();
				throw new Error('Network response was not ok');  // Handle HTTP errors
			}
			return response.json();
		})
		.then(data => {
			if (data) {
				setCookie('cod_equipo', cod_equipo, 30)
				$('#results').html('');
				add_back();
				show_partidos_home(data.data, cod_equipo);
				add_back();
			} else {
				throw new Error('No data found in response');
			}
			hideLoading();
		})
		.catch(error => {
			hideLoading();
			console.error('Fetch error:', error.message);  // Log the error
		});
}

function show_partidos_home(data, cod_equipo) {
	lineas = 0;
	$('#results').append('<br>');
	jQuery.each(data.competiciones_equipo, function (index, item) {
		lineas += 1;
		if (lineas > 1)
			$('#results').append('<br><hr>');

		$('#results').append(data.nombre_equipo + ' - <b>' + item.competicion + '</b>');

		var boton_clasificacion = $('<input/>').attr({
			type: "button",
			class: "back_button",
			id: "field",
			value: 'Clasificación',
			onclick: "load_clasificacion('" + item.cod_grupo + "','" + data.codigo_equipo + "')"
		});
		$('#results').append(boton_clasificacion);

		var boton_goleadores = $('<input/>').attr({
			type: "button",
			class: "back_button",
			id: "field",
			value: 'Goleadores',
			onclick: "load_goleadores('" + item.cod_competicion + "','" + item.cod_grupo + "','" + data.codigo_equipo + "')"
		});
		$('#results').append(boton_goleadores);


		$('#results').append('<table border >');
		$('#results').append('<tr>'
			+ '<th>Día</th>'
			+ '<th align="right"></th>'
			+ '<th align="center">Resultado</th>'
			+ '<th align="left"></th>'
			+ '<th>Día</th>'
			+ '<th>Campo</th>'
			+ '</tr>');

		cont = 0;
		jQuery.each(item.partidos, function (index, item) {
			// do something with `item` (or `this` is also `item` if you like)
			if (cont % 2)
				background = '#ffffff';
			else
				background = '#e8e5e4';
			cont += 1
			var pattern = /(\d{2})\-(\d{2})\-(\d{4})/;
			var dt = new Date(item.fecha.replace(pattern, '$3-$2-$1 12:00'));
			if (isSameWeek(dt, new Date(Date.now())))
				background = '#a78183';

			if (item.hora)
				hora = ' - ' + item.hora;
			else
				hora = '';

			if (item.codequipo_casa == cod_equipo) {
				casa = item.equipo_casa;
				campo = item.campo;
			}
			else {
				casa = '<a href="?cod_equipo=' + item.codequipo_casa + '">' + item.equipo_casa + '</a>';
				campo = '<a href="https://maps.google.com?q=' + item.campo + '" target="_new">' + item.campo + '</a>';
			}
			casa = casa + '&nbsp;<img src="https://www.futgal.es' + item.escudo_equipo_casa + '" align="absmiddle" class="escudo_widget">';

			if (item.codequipo_fuera == cod_equipo)
				fuera = item.equipo_fuera;
			else
				fuera = '<a href="?cod_equipo=' + item.codequipo_fuera + '">' + item.equipo_fuera + '</a>';
			fuera = '<img src="https://www.futgal.es' + item.escudo_equipo_fuera + '" align="absmiddle" class="escudo_widget">&nbsp;' + fuera;

			$('#results').append('<tr>'
				+ '<td style="background-color:' + background + ';" >' + item.fecha + hora + '</td>'
				+ '<td style="background-color:' + background + ';" align="right" >' + casa + '</td>'
				//+ '<td style="background-color:' + background + ';" align="right" >' + item.equipo_casa + '</td>'
				+ '<td style="background-color:' + background + ';" align="center" >' + item.goles_casa + ' - ' + item.goles_fuera + '</td>'
				+ '<td style="background-color:' + background + ';" align="left" >' + fuera + '</td>'
				//+ '<td style="background-color:' + background + ';" align="left" >' + item.equipo_fuera + '</td>'
				+ '<td style="background-color:' + background + ';" >' + item.fecha + hora + '</td>'
				+ '<td style="background-color:' + background + ';" >' + campo + '</td>'
				+ '</tr>');
		});
		$('#results').append('</table>');

	});

	if (lineas == 0)
		$('#results').append('<b>Equipo:</b> ' + data.nombre_equipo + '<br><br><br><b>Non hai datos</b><br><br><br>');

}

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

