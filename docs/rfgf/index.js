
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

function CambiaVista(pagina) {
	if (pagina) {
		var codigo_equipo = getCookie('codigo_equipo');
		load_data(pagina, codigo_equipo)
	}
}

function get_date() {
	var timestamp = new Date().getTime();
	$.ajax({
		type: 'GET',
		url: "data/fecha.json",
		contentType: "application/json; charset=utf-8",
		data: { nocache: timestamp },
		dataType: 'json',

		success: function (data) {
			$('#fecha').html('Actualizado: ' + data.fecha);
		}
	});
}

function load_data(json_page, cod_equipo = -1) {
	var timestamp = new Date().getTime();
	$.ajax({
		type: 'GET',
		url: 'data/' + json_page + '.json',
		contentType: "application/json; charset=utf-8",
		data: { nocache: timestamp },
		dataType: 'json',

		success: function (data) {
			get_date()
			setCookie('equipo', json_page, 30);
			setCookie('codigo_equipo', cod_equipo, 30);

			$('#results').html('<br>');

			if (json_page.includes('clasificacion'))
				show_clasificacion(data, cod_equipo);
			else
				show_partidos(json_page, data);
		}
	});
}

function show_clasificacion(data, cod_equipo = -1) {
	$('#results').append('<div class="name"><b>Competición:</b> ' + data.competicion + ' (jornada '+data.jornada+')</>');
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

		$('#results').append(
			'<td style="background-color:' + background + ';" align="center" >&nbsp;' + item.posicion + '&nbsp;</td>'
			+ '<td style="background-color:' + background + ';" align="left" ><img src="https://www.futgal.es' + item.url_img + '" align="absmiddle" class="escudo_widget">&nbsp;' + item.nombre + '</td>'
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

function show_partidos(json_page, data) {
	lineas = 0;
	jQuery.each(data.competiciones_equipo, function (index, item) {
		lineas += 1;
		if (lineas > 1)
			$('#results').append('<br><hr>');

		var boton_clasificacion = $('<input/>').attr({
			type: "button",
			id: "field",
			value: item.competicion,
			onclick: "load_data('" + json_page + "_clasificacion_" + item.cod_grupo + "','" + data.codigo_equipo + "')"
		});

		$('#results').append('<b>Equipo:</b> ' + data.nombre_equipo + ' ');
		$('#results').append(boton_clasificacion);



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

			$('#results').append('<tr>'
				+ '<td style="background-color:' + background + ';" >' + item.fecha + hora + '</td>'
				+ '<td style="background-color:' + background + ';" align="right" >' + item.equipo_casa + '&nbsp;<img src="https://www.futgal.es' + item.escudo_equipo_casa + '" align="absmiddle" class="escudo_widget"></td>'
				//+ '<td style="background-color:' + background + ';" align="right" >' + item.equipo_casa + '</td>'
				+ '<td style="background-color:' + background + ';" align="center" >' + item.goles_casa + ' - ' + item.goles_fuera + '</td>'
				+ '<td style="background-color:' + background + ';" align="left" ><img src="https://www.futgal.es' + item.escudo_equipo_fuera + '" align="absmiddle" class="escudo_widget">&nbsp;' + item.equipo_fuera + '</td>'
				//+ '<td style="background-color:' + background + ';" align="left" >' + item.equipo_fuera + '</td>'
				+ '<td style="background-color:' + background + ';" >' + item.fecha + hora + '</td>'
				+ '<td style="background-color:' + background + ';" ><a href="https://maps.google.com?q=' + item.campo + '" target=maps>' + item.campo + '</a></td>'
				+ '</tr>');
		});
		$('#results').append('</table>');

	});
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

