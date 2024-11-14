async function load_acta(cod_acta, addHistory = true) {
	displayLoading();
	setCookie('paginaRFGF', 'acta', 30)
	setCookie('cod_acta', cod_acta, 30)
	if (addHistory)
		history.pushState(null, "", '#acta//////' + cod_acta);

	var url = remote_url + "?type=getacta&codacta=" + cod_acta;
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
				show_acta_equipo(data.data);
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

function show_acta_equipo(data) {
	lineas = 0;
	$('#results').append('<br><br>');
	$('#results').append(data.fecha.replace(/-/g, "/") + ' ' + data.hora + ', ' + data.campo);
	$('#results').append('<br><br>');
	crea_botons('back');
	$('#results').append('<br><br>');

	arbitros_partido = 'Árbitro/s:<br>';
	jQuery.each(data.arbitros_partido, function (index, item) {
		arbitros_partido += item.nombre_arbitro + '<br>';
	});

	jugadores_equipo_visitante = get_jugador(data.jugadores_equipo_visitante);
	jugadores_equipo_local = get_jugador(data.jugadores_equipo_local);

	sucesos = [];
	entrenadores = [data.cod_entrenador_local, data.cod_entrenador_local2, data.cod_entrenador_visitante, data.cod_entrenador_visitante2, data.delegadolocal, data.delegadocampo, data.delegado_visitante]
	get_goles(data.goles_equipo_local, true);
	get_tarjetas(data.tarjetas_equipo_local, true, entrenadores);
	get_goles(data.goles_equipo_visitante, false);
	get_tarjetas(data.tarjetas_equipo_visitante, false, entrenadores);
	console.log(sucesos);

	console.log(sucesos.sort(sort_by('minuto', false, parseInt)));
	console.log(sucesos);

	sucesos_str = '';
	gol_local = 0;
	gol_visitante = 0;
	jQuery.each(sucesos, function (index, item) {
		nombre_local = '';
		nombre_visitante = '';
		str_local = gol_local;
		str_visitante = gol_visitante;
		if (item.is_local) {
			nombre_local = item.nombre;
			if (item.tipo == 'GOL') {
				if (item.tipo_gol == '100') {
					gol_local += 1;
					str_local = '<b>' + gol_local + '</b>';
				} else {
					gol_visitante += 1;
					str_local = gol_local;
					str_visitante = '<b>' + gol_visitante + '</b>';
				}

			} else {
				str_local = item.html;
				str_visitante = '';
			}
		}
		if (!item.is_local) {
			nombre_visitante = item.nombre;
			if (item.tipo == 'GOL') {
				if (item.tipo_gol == '100') {
					gol_visitante += 1;
					str_visitante = '<b>' + gol_visitante + '</b>';
				} else {
					gol_local += 1;
					str_local = '<b>' + str_local + '</b>';
					str_visitante = gol_visitante;
				}
			} else {
				str_local = '';
				str_visitante = item.html;
			}

		}

		sucesos_str += '<tr>';

		sucesos_str += '<td  class="table_noborder" align="right">' + nombre_local + '</td>';
		sucesos_str += '<td align="center" class="table_noborder" >&nbsp;' + str_local + '</td>'
			+ '<td align="center" class="table_noborder" >&nbsp;<small>' + item.minuto + '\'</small>&nbsp;</td>'
			+ '<td align="center" class="table_noborder" >' + str_visitante + '&nbsp;</td>'
		sucesos_str += '<td  class="table_noborder" align="left">' + nombre_visitante + '</td>';

		sucesos_str += '</tr>';

	});


	tecnicos_local = '<img class="escudo_widget" src=../img/entrenador.png>' + data.entrenador_local + '<br>';
	if (data.entrenador2_local != '')
		tecnicos_local += '<img class="escudo_widget" src=../img/entrenador.png>' + data.entrenador2_local + '<br>';
	if (data.delegadolocal != '')
		tecnicos_local += data.delegadolocal + '<br>';

	tecnicos_visitante = '<img class="escudo_widget" src=../img/entrenador.png>' + data.entrenador_visitante + '<br>';
	if (data.entrenador2_visitante != '')
		tecnicos_visitante += '<img class="escudo_widget" src=../img/entrenador.png>' + data.entrenador2_visitante + '<br>';
	if (data.delegado_visitante != '')
		tecnicos_visitante += data.delegado_visitante + '<br>';



	$('#results').append('<table id="main_table_1" class="table_noborder">'
		+ '<tr>'
		+ '<th colspan=5 align="left">Jornada ' + data.jornada + ', acta número: ' + data.codacta + (data.acta_cerrada == '1' ? ' (cerrada)' : ' (abierta)') + (data.suspendido == '0' ? '' : ' (suspendido)') + '</td>'
		+ '</tr>'
		+ '<tr>'
		+ '<td colspan=5 align="left">' + arbitros_partido + '</td>'
		+ '</tr>'
		+ '<tr>'                                                   + '<th colspan=5 align="left">Alineación</th>'                                                                        + '</tr>'
		+ '<tr>'
		+ '<th >' + data.equipo_local + '</th>'
		+ '<th class="table_noborder" >' + data.goles_local + '</th>'
		+ '<th class="table_noborder" >&nbsp;-&nbsp;</td>'
		+ '<th class="table_noborder" >' + data.goles_visitante + '</th>'
		+ '<th>' + data.equipo_visitante + '</th>'
		+ '</tr>'
		+ '<tr>'
		+ '<td class="table_noborder">&nbsp;</td>'
		+ '<td class="table_noborder"></td>'
		+ '</tr>'
		+ sucesos_str
		+ '<tr>'
		+ '<th colspan=5 class="table_noborder"><br></th>'
		+ '</tr>'
		+ '<tr>'
		+ '<th colspan=5 align="left">Alineación</th>'
		+ '</tr>'
		+ '<tr>'
		+ '<td style="vertical-align:top" >' + jugadores_equipo_local + '</td>'
		+ '<th colspan=3 class="table_noborder"></td>'
		+ '<td style="vertical-align:top">' + jugadores_equipo_visitante + '</td>'
		+ '</tr>'
		+ '<tr>'
		+ '<tr>'                                                   + '<th colspan=5 align="left">Alineación</th>'                                                                        + '</tr>'
		+ '<th colspan=5 align="left">Equipo técnico</th>'
		+ '</tr>'
		+ '<tr>'
		+ '<td style="vertical-align:top" >' + tecnicos_local + '</td>'
		+ '<th colspan=3 class="table_noborder"></td>'
		+ '<td style="vertical-align:top">' + tecnicos_visitante + '</td>'
		+ '</tr>'
		+ '</table>');

	$('#results').append('<br>');
	crea_botons('back');
	$('#results').append('<br>');


	updatewitdh();
}

const sort_by = (field, reverse, primer) => {

	const key = primer ?
		function (x) {
			return primer(x[field])
		} :
		function (x) {
			return x[field]
		};

	reverse = !reverse ? 1 : -1;

	return function (a, b) {
		return a = key(a), b = key(b), reverse * ((a > b) - (b > a));
	}
}

function get_goles(arr, local) {
	jQuery.each(arr, function (index, item) {
		sucesos.push(
			{
				minuto: item.minuto,
				tipo: 'GOL',
				is_local: local,
				tipo_gol: item.tipo_gol,
				nombre: item.nombre_jugador,
			});

	});
}

function get_tarjetas(arr, local, entrenadores) {
	jQuery.each(arr, function (index, item) {
		if (entrenadores.includes(item.codjugador) || entrenadores.includes(item.nombre_jugador))
			icon = '<img class="escudo_widget" src=../img/entrenador.png>';
		else
			icon = '';

		if (item.codigo_tipo_amonestacion == '101') {
			html = icon + '<img class="escudo_widget" src=../img/roja.png>';
		} else if (item.codigo_tipo_amonestacion == '100') {
			html = icon + '<img class="escudo_widget" src=../img/amarilla.png>';
			if (item.segunda_amarilla == '1')
				html += '<img class="escudo_widget" src=../img/amarilla.png>';
		} else {
			html = '(tarjeta)';
		}
		sucesos.push(
			{
				minuto: item.minuto,
				tipo: 'TARJETA',
				is_local: local,
				nombre: item.nombre_jugador,
				html: html
			});

	});
}

function get_jugador(arr) {
	jugador = '';
	jQuery.each(arr, function (index, item) {
		if (item.titular == '1') {
			if (item.capitan == '1')
				jugador += '<img class="escudo_widget" src=../img/capitan.png> ';

			jugador += item.nombre_jugador;
			if (item.posicion != '')
				jugador += ' (' + item.posicion + ')';
			jugador += '<br>';
		}
	});
	jQuery.each(arr, function (index, item) {
		if (item.titular != '1') {
			if (item.capitan == '1')
				jugador += '<img class="escudo_widget" src=../img/capitan.png> ';

			jugador += '<img class="escudo_widget" src=../img/silla.png> ';
			jugador += item.nombre_jugador;
			if (item.posicion != '')
				jugador += ' (' + item.posicion + ')';
			jugador += '<br>';
		}
	});
	return jugador;
}


function updatewitdh() {
	if ($("#main_table_2").length) {
		if ($("#main_table_1").width() > $("#main_table_2").width())
			maxWitdh = $("#main_table_1").width();
		else
			maxWitdh = $("#main_table_2").width();

		$("#main_table_1").css("width", maxWitdh + "px");
		$("#main_table_2").css("width", maxWitdh + "px");
	}
}


