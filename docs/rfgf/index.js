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

	var url = remote_url + "/?type=getclasificacion&codgrupo=" + cod_grupo;

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
		+ '<th>PG</th>'
		+ '<th>Goles</th>'
		+ '<th>Penalti</th>'
		+ '<th>Gol/Partido</th>'
		+ '<th>Equipo</th>'
		+ '</tr>'
	);
	cont = 0;

	jQuery.each(data.goles, function (index, item) {
		if (cont % 2)
			background = '#ffffff';
		else
			background = '#e8e5e4';
		cont += 1

		$('#results').append('<tr>');

		if (item.codigo_equipo == cod_equipo)
			background = '#a78183';


		equipo = '<a href="javascript:load_portada_equipo(\'' + item.codigo_equipo + '\')">' + item.nombre_equipo + '</a>';
		equipo = '<img src="https://www.futgal.es' + item.escudo_equipo + '" align="absmiddle" class="escudo_widget">&nbsp;' + equipo

		$('#results').append(
			'<td style="background-color:' + background + ';" align="left" >' + item.jugador + '</td>'
			+ '<td style="background-color:' + background + ';" align="center" >' + item.partidos_jugados + '</td>'
			+ '<td style="background-color:' + background + ';" align="center" >' + item.goles + '</td>'
			+ '<td style="background-color:' + background + ';" align="center" >' + item.goles_penalti + '</td>'
			+ '<td style="background-color:' + background + ';" align="center" >' + item.goles_por_partidos + '</td>'
			+ '<td style="background-color:' + background + ';" align="left" >' + equipo + '</td>');

		$('#results').append('</tr>');
	});
	$('#results').append('</table>');
}

function show_clasificacion(data, cod_grupo, cod_equipo) {
	$('#results').append('<br>');
	$('#results').append(data.competicion + ' (jornada ' + data.jornada + ')<br>');
	crea_botons('clasificacion', cod_equipo, cod_grupo, data.codigo_competicion);

	$('#results').append('<table border >');
	$('#results').append(
		'<tr>'
		+ '<th colspan="2" rowspan="2"></th>'
		+ '<th rowspan="2">Equipo</th>'
		+ '<th rowspan="2">Puntos</th>'
		+ '<th colspan="2">Goles</th>'
		+ '<th colspan="3">Partidos</th>'
		+ '<th rowspan="2">Racha</th>'
		+ '<th rowspan="2">Coeficiente</th>'
		+ '</tr>'
		+ '<tr>'
		+ '<th>Favor</th>'
		+ '<th>Contra</th>'
		+ '<th>G</th>'
		+ '<th>E</th>'
		+ '<th>P</th>'
		+ '</tr>'
	);
	cont = 0;

	jQuery.each(data.clasificacion, function (index, item) {
		if (cont % 2)
			background = '#ffffff';
		else
			background = '#e8e5e4';
		cont += 1

		$('#results').append('<tr>');
		try {

			if (parseInt(data.promociones[0].orden) == 0 && data.promociones[0].nombre_promocion == 'ASCENSO') {
				if (parseInt(item.posicion) <= 1)
					$('#results').append(
						'<td width="12px" align="left" bgcolor="' + data.promociones[0].color_promocion + '">&nbsp;</td>'
					);
				else if (parseInt(item.posicion) <= 5)
					$('#results').append(
						'<td width="12px" align="left" bgcolor="' + data.promociones[1].color_promocion + '">&nbsp;</td>'
					);
				else if (parseInt(item.posicion) >= (data.clasificacion.length - 3))
					$('#results').append(
						'<td width="12px" align="left" bgcolor="' + data.promociones[2].color_promocion + '">&nbsp;</td>'
					);
				else
					$('#results').append(
						'<td width="12px" align="left" bgcolor="' + background + '">&nbsp;</td>'
					);
			} else if (parseInt(data.promociones[0].orden) == 1 && data.promociones[0].nombre_promocion != 'CAMPEON' && data.promociones[0].nombre_promocion != 'ASCENSO') {
				if (parseInt(item.posicion) <= 4)
					$('#results').append(
						'<td width="12px" align="left" bgcolor="' + data.promociones[0].color_promocion + '">&nbsp;</td>'
					);
				else if (parseInt(item.posicion) >= parseInt(data.promociones[1].orden))
					$('#results').append(
						'<td width="12px" align="left" bgcolor="' + data.promociones[1].color_promocion + '">&nbsp;</td>'
					);
				else
					$('#results').append(
						'<td width="12px" align="left" bgcolor="' + background + '">&nbsp;</td>'
					);

			} else {
				if (parseInt(item.posicion) <= parseInt(data.promociones[0].orden) || (parseInt(data.promociones[0].orden) == 0 && parseInt(item.posicion) <= 1))
					$('#results').append(
						'<td width="12px" align="left" bgcolor="' + data.promociones[0].color_promocion + '">&nbsp;</td>'
					);
				else if (data.promociones.length == 2)
					if (parseInt(item.posicion) >= parseInt(data.promociones[1].orden))
						$('#results').append(
							'<td width="12px" align="left" bgcolor="' + data.promociones[1].color_promocion + '">&nbsp;</td>'
						);
					else
						$('#results').append(
							'<td width="12px" align="left" bgcolor="' + background + '">&nbsp;</td>'
						);

				else if (parseInt(item.posicion) <= parseInt(data.promociones[1].orden || (parseInt(data.promociones[0].orden) == 0 && parseInt(item.posicion) <= 5)))
					$('#results').append(
						'<td width="12px" align="left" bgcolor="' + data.promociones[1].color_promocion + '">&nbsp;</td>'
					);
				else if (parseInt(item.posicion) >= parseInt(data.promociones[2].orden || (parseInt(data.promociones[0].orden) == 0 && parseInt(item.posicion) >= (len(data.clasificacion) - 4))))
					$('#results').append(
						'<td width="12px" align="left" bgcolor="' + data.promociones[2].color_promocion + '">&nbsp;</td>'
					);
				else
					$('#results').append(
						'<td width="12px" align="left" bgcolor="' + background + '">&nbsp;</td>'
					);
			}
		}
		catch (error) {
			console.error(error);
			$('#results').append(
				'<td width="12px" align="left" bgcolor="' + background + '">&nbsp;</td>'
			);
		}
		if (item.codequipo == cod_equipo)
			background = '#a78183';

		if (item.puntos_sancion != "0")
			puntos = item.puntos + ' (' + item.puntos_sancion + ')';
		else
			puntos = item.puntos;

		equipo = '<a href="javascript:load_portada_equipo(\'' + item.codequipo + '\')">' + item.nombre + '</a>';
		equipo = '<img src="https://www.futgal.es' + item.url_img + '" align="absmiddle" class="escudo_widget">&nbsp;' + equipo

		$('#results').append(
			'<td style="background-color:' + background + ';" align="center" >&nbsp;' + item.posicion + '&nbsp;</td>'
			+ '<td style="background-color:' + background + ';" align="left" >' + equipo + '</td>'
			+ '<td style="background-color:' + background + ';" align="center" >' + puntos + '</td>'
			+ '<td style="background-color:' + background + ';" align="center" >' + item.goles_a_favor + '</td>'
			+ '<td style="background-color:' + background + ';" align="center" >' + item.goles_en_contra + '</td>'
			+ '<td style="background-color:' + background + ';" align="center" >' + item.ganados + '</td>'
			+ '<td style="background-color:' + background + ';" align="center" >' + item.empatados + '</td>'
			+ '<td style="background-color:' + background + ';" align="center" >' + item.perdidos + '</td>');

		var str = '';
		jQuery.each(item.racha_partidos, function (indexr, itemr) {
			str += '<span style="background-color:' + itemr.color + ';" padding:0 2px 0 2px; color:white; font-size:10px; font-weight:bolder;">' + itemr.tipo + '</span>';
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
				casa = '<a href="javascript:load_equipo(\'' + item.codequipo_casa + '\')">' + item.equipo_casa + '</a>';
				campo = '<a href="https://maps.google.com?q=' + item.campo + '" target="_new">' + item.campo + '</a>';
			}
			casa = casa + '&nbsp;<img src="https://www.futgal.es' + item.escudo_equipo_casa + '" align="absmiddle" class="escudo_widget">';

			if (item.codequipo_fuera == cod_equipo)
				fuera = item.equipo_fuera;
			else
				fuera = '<a href="javascript:load_equipo(\'' + item.codequipo_fuera + '\')">' + item.equipo_fuera + '</a>';
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



