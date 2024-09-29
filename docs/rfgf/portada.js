function crea_botons(pagina, codigo_equipo, cod_grupo, cod_competicion) {

	var boton_partidos = $('<input/>').attr({
		type: "button",
		class: (pagina == 'portada') ? 'none' : "back_button",
		id: "field",
		value: 'Portada',
		onclick: "load_portada_equipo('" + codigo_equipo + "')"
	});
	$('#results').append(boton_partidos);

	var boton_partidos = $('<input/>').attr({
		type: "button",
		class: (pagina == 'partidos') ? 'none' : "back_button",
		id: "field",
		value: 'Partidos',
		onclick: "load_equipo('" + codigo_equipo + "')"
	});
	$('#results').append(boton_partidos);

	var boton_clasificacion = $('<input/>').attr({
		type: "button",
		class: (pagina == 'clasificacion') ? 'none' : "back_button",
		id: "field",
		value: 'Clasificación',
		onclick: "load_clasificacion('" + cod_grupo + "','" + codigo_equipo + "')"
	});
	$('#results').append(boton_clasificacion);

	var boton_goleadores = $('<input/>').attr({
		type: "button",
		class: (pagina == 'goleadores') ? 'none' : "back_button",
		id: "field",
		value: 'Goleadores',
		onclick: "load_goleadores('" + cod_competicion + "','" + cod_grupo + "','" + codigo_equipo + "')"
	});
	$('#results').append(boton_goleadores);
}


async function load_portada_equipo(cod_equipo) {
	displayLoading();
	setCookie('paginaRFGF', 'portada', 30)
	setCookie('cod_equipo', cod_equipo, 30)

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
				$('#results').html('');
				add_back();
				show_portada_equipo(data.data, cod_equipo);
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

function show_portada_equipo(data, cod_equipo) {
	lineas = 0;
	$('#results').append('<br>');
	mostrado=false;
	jQuery.each(data.competiciones_equipo, function (index, item) {
		lineas += 1;
		if (lineas > 1)
			$('#results').append('<br><hr>');

		$('#results').append(data.nombre_equipo + ' - <b>' + item.competicion + '</b><br>');
		crea_botons('portada', data.codigo_equipo, item.cod_grupo, item.cod_competicion);

		ultima = item.ultima_jornada_jugada;
		cont = 0;
		previous = undefined;
		jQuery.each(item.partidos, function (index, item2) {
			cont += 1
			var pattern = /(\d{2})\-(\d{2})\-(\d{4})/;
			var dt = new Date(item2.fecha.replace(pattern, '$3-$2-$1 12:00'));
			var now = new Date(Date.now());
			//now = new Date('18-03-2024'.replace(pattern, '$3-$2-$1 12:00'));
			if (isSameWeek(dt, now)) {
				mostrado=true;
				show_portada_data('Xornada actual', item2, item.cod_competicion, item.cod_grupo, data.nombre_equipo);

				if (previous) {
					$('#results').append('<br>');
					show_portada_data('Xornada anterior', previous, undefined, undefined, undefined);
				}
				return false;
			}
			previous = item2;
		});
	});

	if (lineas == 0) {
		var arrayLength = equipos.length;
		nombre = ''
		for (var i = 0; i < arrayLength; i++) {
			if (equipos[i].id == cod_equipo)
				nombre = 'para ' + equipos[i].name;
		}
		$('#results').append('<b>Equipo:</b> ' + data.nombre_equipo + '<br><br><br><b>Non hai datos ' + nombre + '</b><br><br><br>');
	} else	if (! mostrado) {
		var arrayLength = equipos.length;
		nombre = ''
		for (var i = 0; i < arrayLength; i++) {
			if (equipos[i].id == cod_equipo)
				nombre = 'para ' + equipos[i].name;
		}
		$('#results').append('<b>Equipo:</b> ' + data.nombre_equipo + '<br><br><br><b>Non hai competición esta semán ' + nombre + '</b><br><br><br>');
	}


}
function dia_str(fecha) {
	var pattern = /(\d{2})\-(\d{2})\-(\d{4})/;
	var dt = new Date(fecha.replace(pattern, '$3-$2-$1 12:00'));
	days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

	return days[dt.getDay()]; // "Friday"
}


function show_portada_data(title, item, codcompeticion, codgrupo, nombre_equipo) {
	if (item.hora)
		hora = ' - ' + item.hora;
	else
		hora = '';
	if (codcompeticion) {
		br = '<br><br>';
		align = 'center';
	} else {
		br = '&nbsp;&nbsp;';
		align = 'left';
	}

	if (item.equipo_casa == 'Descansa' || item.equipo_fuera == 'Descansa')
		campo = '';
	else{
		html += " <a href=waze://waze.com/ul?q=" + encodeURI(item.campo)  + "&navigate=yes><img src='../img/waze.png' height='15px'></a>";
		campo = '<a href="https://maps.google.com?q=' + item.campo + '" target="_blank">' + item.campo + '</a> '+html;
	}


	casa = '&nbsp;<a href="javascript:load_portada_equipo(\'' + item.codequipo_casa + '\')">' + item.equipo_casa + '</a>&nbsp;';
	if (item.equipo_casa != 'Descansa')
		casa = '<img src="https://www.futgal.es' + item.escudo_equipo_casa + '" align="absmiddle" class="escudo_logo">' + br + casa;

	fuera = '&nbsp;<a href="javascript:load_portada_equipo(\'' + item.codequipo_fuera + '\')">' + item.equipo_fuera + '</a>&nbsp;';
	if (item.equipo_fuera != 'Descansa')
		fuera = '<img src="https://www.futgal.es' + item.escudo_equipo_fuera + '" align="absmiddle" class="escudo_logo">' + br + fuera;

	if (codcompeticion) {
		span = 1;
		data1 = '<td bgcolor="white"><div id="data_casa"></div></td>';
		data2 = '<td bgcolor="white"><div id="data_fuera"></div></td>';
		data3 = '<tr><th colspan=3>Histórico</th></tr><tr><td class="table_noborder" colspan=3 align="center"><div id="historico">(non hai datos)</div></td></tr>';
	} else {
		span = 2;
		data1 = '';
		data2 = '';
		data3 = '';
	}

	if (item.goles_casa == "" && item.goles_fuera == "") {
		datos = '<tr>'
			+ '<td style="text-align:' + align + ';" bgcolor="white" colspan=' + span + '>' + casa + '</td>'
			+ data1
			+ '</tr>'
			+ '<tr>'
			+ '<td style="text-align:' + align + ';" bgcolor="white" colspan=' + span + '>' + fuera + '</td>'
			+ data2
			+ '</tr>';

	} else {
		datos = '<tr>'
			+ '<td style="text-align:' + align + ';" bgcolor="white" colspan=' + span + '>' + casa + '</td>'
			+ data1
			+ '<td bgcolor="white" align="center">&nbsp;' + item.goles_casa + '&nbsp;</td>'
			+ '</tr>'
			+ '<tr>'
			+ '<td style="text-align:' + align + ';" bgcolor="white" colspan=' + span + '>' + fuera + '</td>'
			+ data2
			+ '<td bgcolor="white" align="center">&nbsp;' + item.goles_fuera + '&nbsp;</td>'
			+ '</tr>';
	}

	$('#results').append('<table class="portada">'
		+ '<tr>'
		+ '<th colspan=3  align="absmiddle">' + title + '</th>'
		+ '</tr>'
		+ '<tr>'
		+ '<td bgcolor="#e8e5e4" colspan=3><b>Data:</b>&nbsp;' + item.fecha.replace(/-/g, "/") + hora + ' (' + dia_str(item.fecha) + ')</td>'
		+ '</tr>'
		+ '<tr>'
		+ '<td bgcolor="#e8e5e4" colspan=3><b>Campo:</b>&nbsp;' + campo + '</td>'
		+ '</tr>'
		+ datos
		+ data3
		+ '</table>');

	if (codcompeticion)
		load_comparativa(codcompeticion, codgrupo, item.codequipo_casa, item.codequipo_fuera, nombre_equipo)
}



async function load_comparativa(codcompeticion, codgrupo, equipo1, equipo2, nombre_equipo) {
	var url = remote_url + "?type=getcomparativa&codcompeticion=" + codcompeticion + "&codgrupo=" + codgrupo + "&equipo1=" + equipo1 + "&equipo2=" + equipo2;

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
				show_comparativa(data.data, nombre_equipo);
			} else {
				throw new Error('No data found in response');
			}
		})
		.catch(error => {
			console.error('Fetch error:', error.message);  // Log the error
		});
}

function show_comparativa(data, nombre_equipo) {

	racha1 = '';
	jQuery.each(data.racha_partidos_equipo1, function (indexr, itemr) {
		racha1 += '<span style="background-color:' + itemr.color + ';" class="racha">' + itemr.tipo + '</span>';
	});
	racha2 = '';
	jQuery.each(data.racha_partidos_equipo2, function (indexr, itemr) {
		racha2 += '<span style="background-color:' + itemr.color + ';" class="racha">' + itemr.tipo + '</span>';
	});

	if (data.historico_enfrentamientos.length > 0) {
		historico = '<table class="table_noborder_simple" style="width:100%;">';
		cont = 0;
		jQuery.each(data.historico_enfrentamientos, function (indexr, itemr) {
			if (cont % 2)
				background = '#ffffff';
			else
				background = '#e8e5e4';
			cont += 1

			if (itemr.equipo_casa == nombre_equipo)
				casa = '<b>' + itemr.equipo_casa + '</b>';
			else
				casa = itemr.equipo_casa
			if (itemr.equipo_fuera == nombre_equipo)
				fuera = '<b>' + itemr.equipo_fuera + '</b>';
			else
				fuera = itemr.equipo_fuera

			historico += '<tr>';
			historico += '<td bgcolor="' + background + '" class="table_noborder_simple" align="right">' + casa + '</td><td bgcolor="' + background + '" class="table_noborder_simple" align="center" >&nbsp;&nbsp;' + itemr.goles_casa + '&nbsp;&nbsp;</td>';
			historico += '<td align="center" bgcolor="' + background + '" class="table_noborder_simple">-</td>';
			historico += '<td bgcolor="' + background + '" class="table_noborder_simple" align="center">&nbsp;&nbsp;' + itemr.goles_fuera + '&nbsp;&nbsp;</td><td bgcolor="' + background + '" class="table_noborder_simple">' + fuera + '</td>';
			historico += '</tr>';
		});
		historico += '</table>';
		$('#historico').html(historico);
	}


	$('#data_casa').append('<table class="table_noborder" >'
		+ '<tr><th class="table_noborder" align="center" colspan=2 >' + data.posicion_equipo1 + "º (" + data.puntos_equipo1 + ' pts) </th></tr>'
		+ '<tr><td class="table_noborder">Derrotas</td><td class="table_noborder">' + data.total_derrotas_porcentaje_equipo1 + '</td><td class="table_noborder">Local</td><td class="table_noborder">' + data.total_derrotas_porcentaje_equipo1_local + '</td><td class="table_noborder">Visit.</td><td class="table_noborder">' + data.total_derrotas_porcentaje_equipo1_visitante + '</td></tr>'
		+ '<tr><td class="table_noborder">Empates</td><td class="table_noborder">' + data.total_empates_porcentaje_equipo1 + '</td><td class="table_noborder">Local</td><td class="table_noborder">' + data.total_empates_porcentaje_equipo1_local + '</td><td class="table_noborder">Visit.</td><td class="table_noborder">' + data.total_empates_porcentaje_equipo1_visitante + '</td></tr>'
		+ '<tr><td class="table_noborder">Victorias</td><td class="table_noborder">' + data.total_victorias_porcentaje_equipo1 + '</td><td class="table_noborder">Local</td><td class="table_noborder">' + data.total_victorias_porcentaje_equipo1_local + '</td><td class="table_noborder">Visit.</td><td class="table_noborder">' + data.total_victorias_porcentaje_equipo1_visitante + '</td></tr>'
		+ '<tr><td class="table_noborder" colspan=6>' + racha1 + '</td></tr>'
		+ '<tr><td class="table_noborder" align="center" >Goles/partido</td><td class="table_noborder">' + data.total_goles_media_equipo1 + '</td><td class="table_noborder">Local</td><td class="table_noborder">' + data.total_goles_media_equipo1_local + '</td><td class="table_noborder">Visit.</td><td class="table_noborder">' + data.total_goles_media_equipo1_visitante + '</td></tr>'
		+ '</table>'
	);



	$('#data_fuera').append('<table class="table_noborder" >'
		+ '<tr><th class="table_noborder" align="center" colspan=2 >' + data.posicion_equipo2 + "º (" + data.puntos_equipo2 + ' pts) </th></tr>'
		+ '<tr><td  class="table_noborder">Derrotas</td><td class="table_noborder">' + data.total_derrotas_porcentaje_equipo2 + '</td><td class="table_noborder">Local</td><td class="table_noborder">' + data.total_derrotas_porcentaje_equipo2_local + '</td><td class="table_noborder">Visit.</td><td class="table_noborder">' + data.total_derrotas_porcentaje_equipo2_visitante + '</td></tr>'
		+ '<tr><td class="table_noborder">Empates</td><td class="table_noborder">' + data.total_empates_porcentaje_equipo2 + '</td><td class="table_noborder">Local</td><td class="table_noborder">' + data.total_empates_porcentaje_equipo2_local + '</td><td class="table_noborder">Visit.</td><td class="table_noborder">' + data.total_empates_porcentaje_equipo2_visitante + '</td></tr>'
		+ '<tr><td  class="table_noborder">Victorias</td><td class="table_noborder">' + data.total_victorias_porcentaje_equipo2 + '</td><td class="table_noborder">Local</td><td class="table_noborder">' + data.total_victorias_porcentaje_equipo2_local + '</td><td class="table_noborder">Visit.</td><td class="table_noborder">' + data.total_victorias_porcentaje_equipo2_visitante + '</td></tr>'
		+ '<tr><td class="table_noborder" colspan=6>' + racha2 + '</td></tr>'
		+ '<tr><td class="table_noborder" align="center" >Goles/partido</td><td class="table_noborder">' + data.total_goles_media_equipo2 + '</td><td class="table_noborder">Local</td><td class="table_noborder">' + data.total_goles_media_equipo2_local + '</td><td class="table_noborder">Visit.</td><td class="table_noborder">' + data.total_goles_media_equipo2_visitante + '</td></tr>'
		+ '</table>'
	);


}
