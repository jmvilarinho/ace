function update_vista() {
	let searchParams = new URLSearchParams(window.location.search)
	if (searchParams.has('cod_equipo')) {
		load_equipo(searchParams.get('cod_equipo'))
	}
	else if (searchParams.has('cod_grupo')) {
		load_clasificacion(searchParams.get('cod_grupo'))
	} else {
		var pagina = getCookie('paginaRFGF');
		if (pagina) {
			switch (pagina) {
				case 'favoritos':
					load_favoritos();
					break;
				case 'calendario':
					load_calendario();
					break;
				case 'portada':
					var cod_equipo = getCookie('cod_equipo');
					load_portada_equipo(cod_equipo);
					break;
				case 'partidos':
					var cod_equipo = getCookie('cod_equipo');
					load_equipo(cod_equipo);
					break;
				case 'clasificacion':
					var cod_equipo = getCookie('cod_equipo');
					var cod_grupo = getCookie('cod_grupo');
					load_clasificacion(cod_grupo, cod_equipo);
					break;

				case 'resultados': var cod_equipo = getCookie('cod_equipo'); var cod_grupo = getCookie('cod_grupo'); load_resultados(cod_grupo, cod_equipo, ''); break;

				case 'goleadores':
					var cod_equipo = getCookie('cod_equipo');
					var cod_grupo = getCookie('cod_grupo');
					var cod_competicion = getCookie('cod_competicion');
					load_goleadores(cod_competicion, cod_grupo, cod_equipo);
					break;
				default:
					load_favoritos();
			}
		} else {
			load_favoritos();
		}
	}
}

async function load_equipo(cod_equipo) {
	displayLoading();
	setCookie('paginaRFGF', 'partidos', 30)
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
				show_error(data);
				$('#results').html('');
				add_back();
				show_partidos(data.data, cod_equipo);
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

async function load_clasificacion(cod_grupo, cod_equipo) {
	displayLoading();
	setCookie('paginaRFGF', 'clasificacion', 30)
	setCookie('cod_equipo', cod_equipo, 30)
	setCookie('cod_grupo', cod_grupo, 30)

	var url = remote_url + "?type=getclasificacion&codgrupo=" + cod_grupo;

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
				show_clasificacion(data.data, cod_grupo, cod_equipo);
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

async function load_goleadores(codcompeticion, codgrupo, cod_equipo) {
	displayLoading();
	setCookie('paginaRFGF', 'goleadores', 30)
	setCookie('cod_equipo', cod_equipo, 30)
	setCookie('cod_grupo', codgrupo, 30)
	setCookie('cod_competicion', codcompeticion, 30)

	var url = remote_url + "?type=getgoleadores&codcompeticion=" + codcompeticion + "&codgrupo=" + codgrupo;

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
				show_goleadores(data.data, codgrupo, cod_equipo);
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


function show_goleadores(data, cod_grupo, cod_equipo) {
	$('#results').append('<br>');
	$('#results').append(data.competicion + ' (' + data.grupo + ')<br>');
	crea_botons('goleadores', cod_equipo, cod_grupo, data.codigo_competicion);

	$('#results').append('<table border >');
	$('#results').append(
		'<tr>'
		+ '<th>Jugador</th>'
		+ '<th>Goles</th>'
		+ '<th>Gol/Partido</th>'
		+ '<th>PG</th>'
		+ '<th>Penalti</th>'
		+ '<th>Equipo</th>'
		+ '</tr>'
	);
	cont = 0;

	jQuery.each(data.goles, function (index, item) {
		background = getBackgroundColor(cont, (item.codigo_equipo == cod_equipo));
		cont += 1

		$('#results').append('<tr>');

		equipo = '<a href="javascript:load_portada_equipo(\'' + item.codigo_equipo + '\')">' + item.nombre_equipo + '</a>';
		equipo = '<img src="https://www.futgal.es' + item.escudo_equipo + '" align="absmiddle" class="escudo_widget">&nbsp;' + equipo

		$('#results').append(
			'<td style="background-color:' + background + ';" align="left" >' + item.jugador + '</td>'
			+ '<td style="background-color:' + background + ';" align="center" >' + item.goles + '</td>'
			+ '<td style="background-color:' + background + ';" align="center" >' + item.goles_por_partidos + '</td>'
			+ '<td style="background-color:' + background + ';" align="center" >' + item.partidos_jugados + '</td>'
			+ '<td style="background-color:' + background + ';" align="center" >' + item.goles_penalti + '</td>'
			+ '<td style="background-color:' + background + ';" align="left" >' + equipo + '</td>');

		$('#results').append('</tr>');
	});
	$('#results').append('</table>');
}

function show_clasificacion(data, cod_grupo, cod_equipo) {
	$('#results').append('<br>');
	$('#results').append(data.competicion + ' ( ' + data.grupo + ')<br>');
	crea_botons('clasificacion', cod_equipo, cod_grupo, data.codigo_competicion);

	$('#results').append('<table border >');
	$('#results').append(
		'<tr>'
		+ '<th colspan="13">Jornada ' + data.jornada + ' - ' + data.fecha_jornada.replace(/-/g, "/") + '</th>'
		+ '</tr><tr>'
		+ '<th colspan="2" rowspan="2"></th>'
		+ '<th rowspan="2">Equipo</th>'
		+ '<th rowspan="2">Puntos</th>'
		+ '<th colspan="3">Goles</th>'
		+ '<th colspan="4">Partidos</th>'
		+ '<th rowspan="2">Racha</th>'
		+ '<th rowspan="2">Coeficiente</th>'
		+ '</tr>'
		+ '<tr>'
		+ '<th>Diff</th>'
		+ '<th>Favor</th>'
		+ '<th>Contra</th>'
		+ '<th>T</th>'
		+ '<th>G</th>'
		+ '<th>E</th>'
		+ '<th>P</th>'
		+ '</tr>'
	);

	cont = 0;
	jQuery.each(data.clasificacion, function (index, item) {
		background0 = getBackgroundColor(cont, (1 == 0));
		background = getBackgroundColor(cont, (item.codequipo == cod_equipo));

		cont += 1

		$('#results').append('<tr>');

		if (item.color != '') {
			$('#results').append(
				'<td width="12px" align="left" bgcolor="' + item.color + '">&nbsp;</td>'
			);
		} else {
			$('#results').append(
				'<td width="12px" align="left" bgcolor="' + background0 + '">&nbsp;</td>'
			);
		}

		if (item.puntos_sancion != "0")
			puntos = item.puntos + ' (-' + item.puntos_sancion + ')';
		else
			puntos = item.puntos;

		equipo = '<a href="javascript:load_portada_equipo(\'' + item.codequipo + '\')">' + item.nombre + '</a>';
		equipo = '<img src="https://www.futgal.es' + item.url_img + '" align="absmiddle" class="escudo_widget">&nbsp;' + equipo

		diff = item.goles_a_favor - item.goles_en_contra;

		$('#results').append(
			'<td style="background-color:' + background + ';" align="center" >&nbsp;' + item.posicion + '&nbsp;</td>'
			+ '<td style="background-color:' + background + ';" align="left" >' + equipo + '</td>'
			+ '<td style="background-color:' + background + ';" align="center" >' + puntos + '</td>'
			+ '<td style="background-color:' + background + ';" align="center" >' + diff + '</td>'
			+ '<td style="background-color:' + background + ';" align="center" >' + item.goles_a_favor + '</td>'
			+ '<td style="background-color:' + background + ';" align="center" >' + item.goles_en_contra + '</td>'
			+ '<td style="background-color:' + background + ';" align="center" >' + item.jugados + '</td>'
			+ '<td style="background-color:' + background + ';" align="center" >' + item.ganados + '</td>'
			+ '<td style="background-color:' + background + ';" align="center" >' + item.empatados + '</td>'
			+ '<td style="background-color:' + background + ';" align="center" >' + item.perdidos + '</td>');

		var str = '';
		jQuery.each(item.racha_partidos, function (indexr, itemr) {
			str += '<span style="background-color:' + itemr.color + ';" class="racha">' + itemr.tipo + '</span>';
		});

		$('#results').append('<td style="background-color:' + background + ';" align="center">' + str + '</td>');
		$('#results').append(
			'<td style="background-color:' + background + ';" align="center" >' + item.coeficiente + '</td>');

		$('#results').append('</tr>');
	});
	$('#results').append('</table>');

	$('#results').append('<table border="0" cellspacing="0" cellpadding="2"><tbody><tr height="6px">');
	jQuery.each(data.promociones, function (index, item) {
		$('#results').append(
			'<td width="12px" align="left" style="font-size: x-small;"  bgcolor="' + item.color_promocion + '">&nbsp;</td>'
			+ '<td style="background-color:#e8e5e4;font-size: x-small;" align="right" style="color:#999">' + item.nombre_promocion + '</td>'
		);
	});
	$('#results').append('</tr> </tbody></table>');
}

function show_partidos(data, cod_equipo) {
	lineas = 0;
	$('#results').append('<br>');
	jQuery.each(data.competiciones_equipo, function (index, item) {
		lineas += 1;
		if (lineas > 1)
			$('#results').append('<br><hr>');

		$('#results').append(data.nombre_equipo + ' - <b>' + item.competicion + '</b><br>');
		crea_botons('partidos', data.codigo_equipo, item.cod_grupo, item.cod_competicion);

		$('#results').append('<table class="partidos" >');
		$('#results').append('<tr>'
			+ '<th>Data</th>'
			+ '<th align="right"></th>'
			+ '<th align="center">Resultado</th>'
			+ '<th align="left"></th>'
			+ '<th>Data</th>'
			+ '<th>Campo</th>'
			+ '</tr>');

		cont = 0;
		jQuery.each(item.partidos, function (index, item) {
			var pattern = /(\d{2})\-(\d{2})\-(\d{4})/;
			var dt = new Date(item.fecha.replace(pattern, '$3-$2-$1 12:00'));
			background = getBackgroundColor(cont, (isSameWeek(dt, new Date(Date.now()))));
			cont += 1

			if (item.hora)
				hora = ' - ' + item.hora;
			else
				hora = '';

			if (item.codequipo_casa == cod_equipo || item.equipo_casa == 'Descansa') {
				casa = item.equipo_casa;
				campo = item.campo;
			} else {
				casa = '<a href="javascript:load_equipo(\'' + item.codequipo_casa + '\')">' + item.equipo_casa + '</a>';
				if (item.codequipo_casa != cod_equipo)
					casa += '&nbsp;(' + item.posicion_equipo_casa + 'º)';
				//campo = '<a href="https://maps.google.com?q=' + encodeURIComponent(item.campo) + '" target="_blank">' + item.campo + '</a> <img src="../img/dot.png" height="15px">';
				campo = '<a href="https://waze.com/ul?q=' + encodeURIComponent(item.campo) + '&navigate=yes" target="_blank">' + item.campo + '</a> <img src="../img/waze.png" height="15px">';
			}

			if (item.equipo_casa != 'Descansa') {
				casa += '&nbsp;<img src="https://www.futgal.es' + item.escudo_equipo_casa + '" align="absmiddle" class="escudo_widget">';
			}


			if (item.codequipo_fuera == cod_equipo || item.equipo_fuera == 'Descansa') {
				fuera = item.equipo_fuera;
			} else {
				fuera = '';
				if (item.equipo_fuera != cod_equipo)
					fuera += '(' + item.posicion_equipo_fuera + 'º)&nbsp;';
				fuera += '<a href="javascript:load_equipo(\'' + item.codequipo_fuera + '\')">' + item.equipo_fuera + '</a>';
			}
			if (item.equipo_fuera != 'Descansa') {
				fuera = '<img src="https://www.futgal.es' + item.escudo_equipo_fuera + '" align="absmiddle" class="escudo_widget">&nbsp;' + fuera;
			}

			if (item.equipo_casa == 'Descansa' || item.equipo_fuera == 'Descansa')
				campo = '';

			color_resultado = background;
			if (item.goles_casa != "" && item.goles_fuera != "") {
				if (item.codequipo_casa == cod_equipo) {
					if (Number(item.goles_casa) > Number(item.goles_fuera))
						color_resultado = "#04B431";
					else if (Number(item.goles_casa) < Number(item.goles_fuera))
						color_resultado = "#F78181";
					else
						color_resultado = "#D7DF01";
				} else if (item.codequipo_fuera == cod_equipo) {
					if (Number(item.goles_fuera) > Number(item.goles_casa))
						color_resultado = "#04B431";
					else if (Number(item.goles_fuera) < Number(item.goles_casa))
						color_resultado = "#F78181";
					else
						color_resultado = "#D7DF01";
				}
			}

			if (item.partido_en_juego == '1')
				xogo = '<br>(en xogo)';
			else
				xogo = '';

			$('#results').append('<tr>'
				+ '<td style="background-color:' + background + ';" >' + item.fecha.replace(/-/g, "/") + hora + '</td>'
				+ '<td style="background-color:' + background + ';" align="right" >' + casa + '</td>'
				+ '<td style="background-color:' + color_resultado + ';" align="center" >' + item.goles_casa + ' - ' + item.goles_fuera + xogo + '</td>'
				+ '<td style="background-color:' + background + ';" align="left" >' + fuera + '</td>'
				+ '<td style="background-color:' + background + ';" >' + item.fecha.replace(/-/g, "/") + hora + '</td>'
				+ '<td style="background-color:' + background + ';" >' + campo + '</td>'
				+ '</tr>');
		});
		$('#results').append('</table>');

	});

	if (lineas == 0)
		$('#results').append('<b>Equipo:</b> ' + data.nombre_equipo + '<br><br><br><b>Non hai datos</b><br><br><br>');

}



