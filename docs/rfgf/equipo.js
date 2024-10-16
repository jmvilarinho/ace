
async function load_equipo_home(cod_equipo) {
	displayLoading();
	setCookie('paginaRFGF', 'favoritos', 30)

	var url = remote_url + "?type=getequipo&codequipo=" + cod_equipo;

	console.log("GET " + url);
	await fetch(url)
		.then(response => {
			if (!response.ok) {
				throw new Error('Network response was not ok');  // Handle HTTP errors
			}
			return response.json();
		})
		.then(data => {
			if (data) {
				show_error(data);
				setCookie('cod_equipo', cod_equipo, 30)
				$('#results').html('');
				add_back();
				show_partidos_home(data.data, cod_equipo);
				add_back();
			} else {
				throw new Error('No data found in response');
			}
		})
		.catch(error => {
			console.error('Fetch error:', error.message);  // Log the error
		});
	hideLoading();
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
				campo = '<a href="https://maps.google.com?q=' + item.campo + '" target="_blank">' + item.campo + ' <img src="../img/dot.png" height="20px"></a>';
			}
			casa = casa + '&nbsp;<img src="https://www.futgal.es' + item.escudo_equipo_casa + '" align="absmiddle" class="escudo_widget">';

			if (item.codequipo_fuera == cod_equipo)
				fuera = item.equipo_fuera;
			else
				fuera = '<a href="?cod_equipo=' + item.codequipo_fuera + '">' + item.equipo_fuera + '</a>';
			fuera = '<img src="https://www.futgal.es' + item.escudo_equipo_fuera + '" align="absmiddle" class="escudo_widget">&nbsp;' + fuera;

			$('#results').append('<tr>'
				+ '<td style="background-color:' + background + ';" >' + item.fecha.replace(/-/g, "/") + hora + '</td>'
				+ '<td style="background-color:' + background + ';" align="right" >' + casa + '</td>'
				//+ '<td style="background-color:' + background + ';" align="right" >' + item.equipo_casa + '</td>'
				+ '<td style="background-color:' + background + ';" align="center" >' + item.goles_casa + ' - ' + item.goles_fuera + '</td>'
				+ '<td style="background-color:' + background + ';" align="left" >' + fuera + '</td>'
				//+ '<td style="background-color:' + background + ';" align="left" >' + item.equipo_fuera + '</td>'
				+ '<td style="background-color:' + background + ';" >' + item.fecha.replace(/-/g, "/") + hora + '</td>'
				+ '<td style="background-color:' + background + ';" >' + campo + '</td>'
				+ '</tr>');
		});
		$('#results').append('</table>');

	});

	if (lineas == 0)
		var arrayLength = equipos.length;
		nombre=''
		for (var i = 0; i < arrayLength; i++) {
			if (equipos[i].id == cod_equipo)
				nombre = ' para '+equipos[i].name;
		}
		$('#results').append('<b>Equipo:</b> ' + data.nombre_equipo + '<br><br><br><b>Non hai datos'+nombre+'</b><br><br><br>');

}

