
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
		load_data(pagina)
	}
}

function get_date() {
	$.ajax({
		type: 'GET',
		url: "fecha.json",
		contentType: "application/json; charset=utf-8",
		data: { nocache: '1' },
		dataType: 'json',

		success: function (data) {
			$('#fecha').html('Actualizado: ' + data.fecha);
		}
	});
}

function load_data(json_data) {

	$.ajax({
		type: 'GET',
		url: json_data,
		contentType: "application/json; charset=utf-8",
		data: { nocache: '1' },
		dataType: 'json',

		success: function (data) {
			get_date()
			setCookie('equipo', json_data, 30);

			$('#results').html('');
			$('#results').append('<hr>');
			$('#results').append('<div class="name"><b>Equipo:</b> ' + data.nombre_equipo + '</>');
			jQuery.each(data.competiciones_equipo, function (index, item) {
				$('#results').append('<br><div class="name"><b>Competición:</b> ' + item.competicion + '</>');

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
						background = '#c05b39';


					if (item.hora)
						hora = ' - ' + item.hora;
					else
						hora = '';

					$('#results').append('<tr>'
						+ '<td style="background-color:' + background + ';" >' + item.fecha + hora + '</td>'
						+ '<td style="background-color:' + background + ';" align="right" >' + item.equipo_casa + '</td>'
						+ '<td style="background-color:' + background + ';" align="center" >' + item.goles_casa + ' - ' + item.goles_fuera + '</td>'
						+ '<td style="background-color:' + background + ';" align="left" >' + item.equipo_fuera + '</td>'
						+ '<td style="background-color:' + background + ';" >' + item.fecha + hora + '</td>'
						+ '<td style="background-color:' + background + ';" >' + item.campo + '</td>'
						+ '</tr>');
				});
				$('#results').append('</table>');

			});
		}
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

