
// showing loading
function displayLoading() {
	loader = document.querySelector("#loading");
	loader.classList.add("display");
	// to stop loading after some time
	setTimeout(() => {
		loader.classList.remove("display");
	}, 5000);
}

// hiding loading
function hideLoading() {
	loader = document.querySelector("#loading");
	loader.classList.remove("display");
}

/* Set the width of the side navigation to 250px */
function openNav() {
	document.getElementById("mySidenav").style.width = "250px";
}

/* Set the width of the side navigation to 0 */
function closeNav(id = '0') {
	if (id != '0')
		load_equipo(id);
	document.getElementById("mySidenav").style.width = "0";
}

function getWeekNumber(date) {
	const tempDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
	// Set the day to Thursday (the middle of the week) to avoid edge cases near year boundaries
	tempDate.setDate(tempDate.getDate() + 4 - (tempDate.getDay() || 7));

	// Calculate the first day of the year
	const yearStart = new Date(tempDate.getFullYear(), 0, 1);

	// Calculate the week number
	const weekNo = Math.ceil(((tempDate - yearStart) / 86400000 + 1) / 7);
	return weekNo;
}

function isSameWeek(date1, date2) {
	const year1 = date1.getFullYear();
	const year2 = date2.getFullYear();

	const week1 = getWeekNumber(date1);
	const week2 = getWeekNumber(date2);

	return year1 === year2 && week1 === week2;
}



function update_vista() {
	let searchParams = new URLSearchParams(window.location.search)
	if (searchParams.has('cod_equipo')) {
		load_equipo(searchParams.get('cod_equipo'))
	}
	else if (searchParams.has('cod_grupo')) {
		load_clasificacion(searchParams.get('cod_grupo'))
	} else {
		var cod_equipo = getCookie('cod_equipo');
		if (cod_equipo) {
			load_equipo(searchParams.get('cod_equipo'))
		} else {
			var cod_grupo = getCookie('cod_grupo');
			if (cod_equipo) {
				load_clasificacion(searchParams.get('cod_grupo'))
			}
		}
	}


}

function add_back() {
	var boton_clasificacion = $('<input/>').attr({
		type: "button",
		class: "back_button",
		id: "field",
		value: 'Menú',
		onclick: "openNav()"
	});

	$('#results').append(boton_clasificacion);
	$('#results').append('&nbsp;&nbsp;&nbsp;&nbsp;');
}

function load_equipo(cod_equipo) {
	displayLoading();

	var JSESSIONID = getCookie('JSESSIONID');
	session = ''
	if (JSESSIONID) {
		session = '&JSESSIONID=' + JSESSIONID
	}
	var url = "https://pevbxmstzqkdtno6y4ocsumnz40kbdac.lambda-url.eu-west-1.on.aws/?type=getequipo&codequipo=" + cod_equipo + session;

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
				setCookie('JSESSIONID', data.JSESSIONID, 30)
				setCookie('cod_equipo', cod_equipo, 30)
				console.log('JSESSIONID: ', data.JSESSIONID);
				$('#results').html('');
				add_back();
				show_partidos(data.data, cod_equipo);
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

function load_clasificacion(cod_grupo, cod_equipo) {
	displayLoading();

	var JSESSIONID = getCookie('JSESSIONID');
	session = ''
	if (JSESSIONID) {
		session = '&JSESSIONID=' + JSESSIONID
	}
	var url = "https://pevbxmstzqkdtno6y4ocsumnz40kbdac.lambda-url.eu-west-1.on.aws/?type=getclasificacion&cod_grupo=" + cod_grupo + session;

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
				setCookie('JSESSIONID', data.JSESSIONID, 30)
				setCookie('cod_grupo', cod_grupo, 30)
				console.log('JSESSIONID: ', data.JSESSIONID);
				$('#results').html('');
				add_back();
				show_clasificacion(data.data, cod_grupo, cod_equipo);
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


function load_goleadores(codcompeticion, codgrupo, cod_equipo) {
	displayLoading();

	var JSESSIONID = getCookie('JSESSIONID');
	session = ''
	if (JSESSIONID) {
		session = '&JSESSIONID=' + JSESSIONID
	}
	var url = "https://pevbxmstzqkdtno6y4ocsumnz40kbdac.lambda-url.eu-west-1.on.aws/?type=getgoleadores&codcompeticion=" + codcompeticion + "&codgrupo=" + codgrupo + session;

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
				setCookie('JSESSIONID', data.JSESSIONID, 30)
				console.log('JSESSIONID: ', data.JSESSIONID);
				$('#results').html('');
				add_back();
				show_goleadores(data.data, cod_equipo);
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


function show_goleadores(data, cod_equipo) {
	$('#results').append('<b>Competición:</b> ' + data.competicion + ' (' + data.grupo + ')');

	var boton_clasificacion = $('<input/>').attr({
		type: "button",
		class: "back_button",
		id: "field",
		value: 'Partidos',
		onclick: "load_equipo('" + cod_equipo + "')"
	});
	$('#results').append(boton_clasificacion);

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


		equipo = '<a href="?cod_equipo=' + item.codigo_equipo + '">' + item.nombre_equipo + '</a>';
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
	$('#results').append('<b>Competición:</b> ' + data.competicion + ' (jornada ' + data.jornada + ')');

	var boton_clasificacion = $('<input/>').attr({
		type: "button",
		class: "back_button",
		id: "field",
		value: 'Partidos',
		onclick: "load_equipo('" + cod_equipo + "')"
	});
	$('#results').append(boton_clasificacion);

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
			if (parseInt(item.posicion) <= parseInt(data.promociones[0].orden))
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

			else if (parseInt(item.posicion) <= parseInt(data.promociones[1].orden))
				$('#results').append(
					'<td width="12px" align="left" bgcolor="' + data.promociones[1].color_promocion + '">&nbsp;</td>'
				);
			else if (parseInt(item.posicion) >= parseInt(data.promociones[2].orden))
				$('#results').append(
					'<td width="12px" align="left" bgcolor="' + data.promociones[2].color_promocion + '">&nbsp;</td>'
				);
			else
				$('#results').append(
					'<td width="12px" align="left" bgcolor="' + background + '">&nbsp;</td>'
				);
		}
		catch (error) {
			//console.error(error);
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

		equipo = '<a href="?cod_equipo=' + item.codequipo + '">' + item.nombre + '</a>';
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
	jQuery.each(data.competiciones_equipo, function (index, item) {
		lineas += 1;
		if (lineas > 1)
			$('#results').append('<br><hr>');

		$('#results').append('<b>Equipo:</b> ' + data.nombre_equipo + ' - <b>' + item.competicion + '</b>');

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

			if (item.codequipo_casa == cod_equipo)
				casa = item.equipo_casa;
			else
				casa = '<a href="?cod_equipo=' + item.codequipo_casa + '">' + item.equipo_casa + '</a>';
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
				+ '<td style="background-color:' + background + ';" ><a href="https://maps.google.com?q=' + item.campo + '" target="_new">' + item.campo + '</a></td>'
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

