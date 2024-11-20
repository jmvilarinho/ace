async function load_portada(cod_equipo, addHistory = true) {
	displayLoading();
	setCookie('paginaRFGF', 'portada', 30)
	setCookie('cod_equipo', cod_equipo, 30)
	if (addHistory)
		history.pushState(null, "", '#portada/' + cod_equipo);

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
				$('#results').html('');
				add_back();
				show_portada_equipo(data.data, cod_equipo);
				$('#results').append('<br>');
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
	mostrado = false;

	jQuery.each(data.competiciones_equipo, function (index, item) {
		lineas += 1;
		if (lineas > 1)
			$('#results').append('<br><hr>');

		setCookie('nombre_equipo', data.nombre_equipo, 30)
		$('#results').append(data.nombre_equipo + ' - <b>' + item.competicion + '</b><br>');
		var boton_plantilla = $('<input/>').attr({
			type: "button",
			class:  "back_button",
			id: "field",
			value: 'Plantilla',
			onclick: "load_plantilla('" + cod_equipo + "')"
		});
		$('#results').append(boton_plantilla);
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
				mostrado = true;
				show_portada_data('Xornada actual (#' + item2.nombre_jornada + ')', 'main_table_1', item2, item.cod_competicion, item.cod_grupo, data.nombre_equipo, cod_equipo);

				if (previous) {
					$('#results').append('<br>');
					show_portada_data('Xornada anterior (#' + previous.nombre_jornada + ')', 'main_table_2', previous, undefined, undefined, undefined, cod_equipo);
				}
				return false;
			}
			previous = item2;
		});
	});

	updatewitdh("main_table_1", "main_table_2");

	if (lineas == 0) {
		var arrayLength = equipos.length;
		nombre = ''
		for (var i = 0; i < arrayLength; i++) {
			if (equipos[i].id == cod_equipo)
				nombre = 'para ' + equipos[i].name;
		}
		$('#results').append('<br><br><b>Equipo:</b> ' + data.nombre_equipo + '<br><br><b>Non hai datos ' + nombre + '</b><br><br><br>');
	} else if (!mostrado) {
		var arrayLength = equipos.length;
		nombre = ''
		for (var i = 0; i < arrayLength; i++) {
			if (equipos[i].id == cod_equipo)
				nombre = 'para ' + equipos[i].name;
		}
		$('#results').append('<br><br><b>Equipo:</b> ' + data.nombre_equipo + '<br><br><b>Non hai competición esta semán ' + nombre + '</b><br><br><br>');
	}
}

function dia_semana(fecha) {
	var pattern = /(\d{2})\-(\d{2})\-(\d{4})/;
	var dt = new Date(fecha.replace(pattern, '$3-$2-$1 12:00'));
	days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
	return days[dt.getDay()]; // "Friday"
}

function dia_semana_sp(fecha) {
	var pattern = /(\d{2})\/(\d{2})\/(\d{4})/;
	var dt = new Date(fecha.replace(pattern, '$3-$2-$1 12:00'));
	days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
	return days[dt.getDay()]; // "Friday"
}


function show_portada_data(title, id_tabla, item, codcompeticion, codgrupo, nombre_equipo, cod_equipo) {
	if (codcompeticion) {
		br = '<br><br>';
		align = 'center';
	} else {
		br = '&nbsp;&nbsp;';
		align = 'left';
	}

	if (item.equipo_casa == 'Descansa' || item.equipo_fuera == 'Descansa') {
		campo = '';
		dia_str = item.fecha.replace(/-/g, "/");
	} else {
		if (item.hora)
			hora = ' - ' + item.hora;
		else
			hora = ' ???';
		dia_str = item.fecha.replace(/-/g, "/") + hora + ' (' + dia_semana(item.fecha) + ')';

		//campo = '<a href="https://waze.com/ul?q=' + encodeURIComponent(item.campo) + '&navigate=yes" target="_blank">' + item.campo + '</a> <img src="../img/waze.png" height="15px">';
		//campo = '<a href="https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(item.campo) + '" target="_blank">' + item.campo + '</a> <img src="../img/dot.png" height="15px">';
		campo = '<a href="https://maps.google.com?q=' + encodeURIComponent(item.codigo_postal_campo + ' ' + item.direccion_campo + ' ' + item.campo) + '" target="_blank">' + item.campo + '</a> <img src="../img/dot.png" height="15px">';
	}

	if (item.equipo_casa != 'Descansa') {
		casa = '<a href="javascript:load_plantilla(\'' + item.codequipo_casa + '\')" title="Plantilla">'
			+ '<img src="https://www.futgal.es' + item.escudo_equipo_casa + '" align="absmiddle" class="escudo_logo"></a>' + br
			+ '&nbsp;<a href="javascript:load_xornadas(\'' + item.codequipo_casa + '\')">' + item.equipo_casa + '</a>&nbsp;';
	} else {
		casa = '&nbsp;' + item.equipo_casa + '&nbsp;';
	}

	if (item.equipo_fuera != 'Descansa') {
		fuera = '<a href="javascript:load_plantilla(\'' + item.codequipo_fuera + '\')" title="Plantilla">'
		+'<img src="https://www.futgal.es' + item.escudo_equipo_fuera + '" align="absmiddle" class="escudo_logo"></a>' + br
		+ '&nbsp;<a href="javascript:load_xornadas(\'' + item.codequipo_fuera + '\')">' + item.equipo_fuera + '</a>&nbsp;';
	} else {
		fuera = '&nbsp;' + item.equipo_fuera + '&nbsp;';
	}

	if (codcompeticion && !(item.equipo_casa == 'Descansa' || item.equipo_fuera == 'Descansa')) {
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
		color_resultado = color_goles('white', cod_equipo, item.codequipo_casa, item.codequipo_fuera, item.goles_casa, item.goles_fuera);


		if (item.partido_en_juego == '1')
			xogo = '<br>(en xogo)';
		else
			xogo = '';

		if (item.codacta != '')
			click = '  title="Acta" onclick="javascript:load_acta(\'' + item.codacta + '\');" ';
		else
			click = '';


		datos = '<tr>'
			+ '<td style="text-align:' + align + ';" bgcolor="white" colspan=' + span + '>' + casa + '</td>'
			+ data1
			+ '<td ' + click + ' bgcolor="white" style="background-color:' + color_resultado + ';" align="center">&nbsp;' + item.goles_casa + xogo + '&nbsp;</td>'
			+ '</tr>'
			+ '<tr>'
			+ '<td style="text-align:' + align + ';" bgcolor="white" colspan=' + span + '>' + fuera + '</td>'
			+ data2
			+ '<td ' + click + ' bgcolor="white" style="background-color:' + color_resultado + ';" align="center">&nbsp;' + item.goles_fuera + xogo + '&nbsp;</td>'
			+ '</tr>';
	}

	$('#results').append('<table id="' + id_tabla + '" class="table_noborder">'
		+ '<tr>'
		+ '<th colspan=3  align="absmiddle">' + title + '</th>'
		+ '</tr>'
		+ '<tr>'
		+ '<td bgcolor="#e8e5e4" colspan=3><b>Data:</b>&nbsp;' + dia_str + '</td>'
		+ '</tr>'
		+ '<tr>'
		+ '<td bgcolor="#e8e5e4" colspan=3><b>Campo:</b>&nbsp;' + campo + '</td>'
		+ '</tr>'
		+ datos
		+ data3
		+ '</table>');

	if (codcompeticion && !(item.equipo_casa == 'Descansa' || item.equipo_fuera == 'Descansa'))
		load_comparativa(codcompeticion, codgrupo, item.codequipo_casa, item.codequipo_fuera, nombre_equipo)
}



async function load_comparativa(codcompeticion, codgrupo, equipo1, equipo2, nombre_equipo) {
	var url = remote_url + "?type=getcomparativa&codcompeticion=" + codcompeticion + "&codgrupo=" + codgrupo + "&equipo1=" + equipo1 + "&equipo2=" + equipo2;

	//console.log("GET " + url);
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
				show_comparativa(data.data, nombre_equipo);
				updatewitdh("main_table_1", "main_table_2");
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
		jQuery.each(data.historico_enfrentamientos, function (index, item) {
			if (cont % 2)
				background = '#ffffff';
			else
				background = '#e8e5e4';
			cont += 1

			if (item.equipo_casa == nombre_equipo)
				casa = '<b>' + item.equipo_casa + '</b>';
			else
				casa = item.equipo_casa
			if (item.equipo_fuera == nombre_equipo)
				fuera = '<b>' + item.equipo_fuera + '</b>';
			else
				fuera = item.equipo_fuera

			color_resultado = background;
			if (item.goles_casa != "" && item.goles_fuera != "") {
				if (item.equipo_casa == nombre_equipo) {
					if (Number(item.goles_casa) > Number(item.goles_fuera))
						color_resultado = "#04B431";
					else if (Number(item.goles_casa) < Number(item.goles_fuera))
						color_resultado = "#F78181";
					else
						color_resultado = "#D7DF01";
				} else if (item.equipo_fuera == nombre_equipo) {
					if (Number(item.goles_fuera) > Number(item.goles_casa))
						color_resultado = "#04B431";
					else if (Number(item.goles_fuera) < Number(item.goles_casa))
						color_resultado = "#F78181";
					else
						color_resultado = "#D7DF01";
				}
			}

			historico += '<tr>'
				+ '<td align="center" bgcolor="' + background + '" class="table_noborder_simple">' + item.temporada + ',&nbsp;</td>'
				+ '<td bgcolor="' + background + '" class="table_noborder_simple" align="right">' + casa + '</td>'
				+ '<td bgcolor="' + color_resultado + '" class="table_noborder_simple" align="center" >&nbsp;&nbsp;' + item.goles_casa + '&nbsp;&nbsp;-&nbsp;&nbsp;' + item.goles_fuera + '&nbsp;&nbsp;</td>'
				+ '<td bgcolor="' + background + '" class="table_noborder_simple">' + fuera + '</td>'
				+ '</tr>';
		});
		historico += '</table>';
		$('#historico').html(historico);
	}

	stats1 = '<table><thead>'
		+ '<tr>'
		+ '<td class="table_noborder"></th>'
		+ '<td class="table_noborder">Total</th>'
		+ '<td class="table_noborder">&nbsp;&nbsp;&nbsp;</th>'
		+ '<td class="table_noborder">Local&nbsp;&nbsp;</th>'
		+ '<td class="table_noborder">Visitante</th>'
		+ '</tr></thead>'
		+ '<tbody>'
		+ '  <tr>'
		+ '<th class="table_noborder" align="center">Goles</td>'
		+ '<td class="table_noborder" align="center">' + data.total_goles_equipo1 + '</td>'
		+ '<td class="table_noborder" align="center"></td>'
		+ '<td class="table_noborder" align="center">' + data.total_goles_equipo1_local + '</td>'
		+ '<td class="table_noborder" align="center">' + data.total_goles_equipo1_visitante + '</td>'
		+ '</tr>'
		+ '<tr>'
		+ '    <th class="table_noborder" align="center">Media</td>'
		+ '<td class="table_noborder" align="center">' + data.total_goles_media_equipo1 + '</td>'
		+ '<td class="table_noborder" align="center"></td>'
		+ '<td class="table_noborder" align="center">' + data.total_goles_media_equipo1_local + '</td>'
		+ '<td class="table_noborder" align="center">' + data.total_goles_media_equipo1_visitante + '</td>'
		+ '</tr>'
		+ '</tbody>'
		+ '</table>';

	$('#data_casa').append('<table class="table_noborder" >'
		+ '<tr>'
		+ '<th class="table_noborder" align="center">' + data.posicion_equipo1 + "º (" + data.puntos_equipo1 + ' pts)<br><br></th>'
		+ '</tr>'
		+ '<tr><td class="table_noborder">' + racha1 + '</td></tr>'
		+ '<tr>'
		+ '<td class="table_noborder">' + stats1 + '</td>'
		+ '</tr>'
		+ '</table>'
	);

	stats2 = '<table><thead>'
		+ '<tr>'
		+ '<td class="table_noborder"></th>'
		+ '<td class="table_noborder">Total</th>'
		+ '<td class="table_noborder">&nbsp;&nbsp;&nbsp;</th>'
		+ '<td class="table_noborder">Local&nbsp;&nbsp;</th>'
		+ '<td class="table_noborder">Visitante</th>'
		+ '</tr></thead>'
		+ '<tbody>'
		+ '  <tr>'
		+ '<th class="table_noborder" align="center">Goles</td>'
		+ '<td class="table_noborder" align="center">' + data.total_goles_equipo2 + '</td>'
		+ '<td class="table_noborder" align="center"></td>'
		+ '<td class="table_noborder" align="center">' + data.total_goles_equipo2_local + '</td>'
		+ '<td class="table_noborder" align="center">' + data.total_goles_equipo2_visitante + '</td>'
		+ '</tr>'
		+ '<tr>'
		+ '    <th class="table_noborder" align="center">Media</td>'
		+ '<td class="table_noborder" align="center">' + data.total_goles_media_equipo2 + '</td>'
		+ '<td class="table_noborder" align="center"></td>'
		+ '<td class="table_noborder" align="center">' + data.total_goles_media_equipo2_local + '</td>'
		+ '<td class="table_noborder" align="center">' + data.total_goles_media_equipo2_visitante + '</td>'
		+ '</tr>'
		+ '</tbody>'
		+ '</table>';

	$('#data_fuera').append('<table class="table_noborder" >'
		+ '<tr>'
		+ '<th class="table_noborder" align="center">' + data.posicion_equipo2 + "º (" + data.puntos_equipo2 + ' pts)<br><br></th>'
		+ '</tr>'
		+ '<tr><td class="table_noborder">' + racha2 + '</td></tr>'
		+ '<tr>'
		+ '<td class="table_noborder">' + stats2 + '</td>'
		+ '</tr>'
		+ '</table>'
	);

}
