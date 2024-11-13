function getMonday(d) {
	d = new Date(d);
	suma = 1 - d.getDay();
	d.setDate(d.getDate() + suma);
	return d.toISOString().slice(0, 10);
}

function getSunday(d) {
	d = new Date(d);
	suma = 7 - d.getDay();
	d.setDate(d.getDate() + suma);
	return d.toISOString().slice(0, 10);
}


async function load_club(cod_club, timestamp = '', addHistory = true) {
	displayLoading();
	setCookie('paginaRFGF', 'club', 30)
	setCookie('cod_club', cod_club, 30)
	if (addHistory)
		history.pushState(null, "", '#club////' + cod_club);

	if (typeof (timestamp) == "undefined" || timestamp == '') {
		current_date = new Date();
	} else {
		current_date = new Date(timestamp * 1);
	}

	firstEvent = getMonday(current_date);
	lastEvent = getSunday(current_date);

	var url = remote_url + "?type=getclub&fecha_desde=" + firstEvent + "&fecha_hasta=" + lastEvent + "&codclub=" + cod_club;
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
				$('#results').append('<div id="club_list"></div><div id="club_tabla"></div>');
				show_club(data.data, cod_club, current_date);
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

Date.prototype.addDays = function (days) {
	var date = new Date(this.valueOf());
	date.setDate(date.getDate() + days);
	return date.getTime();
}


function show_club(data, cod_club, current_date) {
	date_curent = new Date();

	firstEvent = getMonday(current_date);
	lastEvent = getSunday(current_date);
	var pattern = /(\d{4})\-(\d{2})\-(\d{2})/;
	firstEvent_str = firstEvent.replace(pattern, '$3/$2/$1');
	lastEvent_str = lastEvent.replace(pattern, '$3/$2/$1');

	week_before = current_date - (7 * 1000 * 3600 * 24);
	week_after = current_date.addDays(7);

	club_name = getClubName(cod_club, '');
	back = "<a href=\"javascript:load_club('" + cod_club + "','" + week_before + "',false)\"><img class=\"escudo_widget\" src=../img/back.png></a>&nbsp;&nbsp;&nbsp;";
	forward = "&nbsp;&nbsp;&nbsp;<a href=\"javascript:load_club('" + cod_club + "','" + week_after + "',false)\"><img class=\"escudo_widget\" src=../img/forward.png></a>";
	$('#club_tabla').append('<table id="0" class="favoritos">'
		+ '<tr>'
		+ '<th colspan=3 align="absmiddle">' + club_name + '</th>'
		+ '</tr>'
		+ '<tr>'
		+ '<td align="absmiddle">' + back + '</td>'
		+ '<td   align="absmiddle">Semán do ' + firstEvent_str + ' ó ' + lastEvent_str + '</td>'
		+ '<td align="absmiddle">' + forward + '</td>'
		+ '</tr>'
		+ '</table><br>');



	lineas = 0;
	$('#results').append('<br>');

	var dictionary = {};
	jQuery.each(data.partidos, function (index, item) {
		if (item.escudo_equipo_local.trim() != '') {
			if (dictionary[item.escudo_equipo_local] > 0)
				dictionary[item.escudo_equipo_local] += 1;
			else
				dictionary[item.escudo_equipo_local] = 1;
		}
		if (item.escudo_equipo_visitante.trim() != '') {
			if (dictionary[item.escudo_equipo_visitante] > 0)
				dictionary[item.escudo_equipo_visitante] += 1;
			else
				dictionary[item.escudo_equipo_visitante] = 1;
		}
	});
	local = 'none';
	max = 0;
	for (var i in dictionary) {
		value = dictionary[i];
		if (value > max) {
			max = value;
			local = i;
		}
	}


	cont = 0;
	jQuery.each(data.partidos, function (index, item) {
		var pattern = /(\d{2})\-(\d{2})\-(\d{4})/;
		var dt = new Date(item.fecha.replace(pattern, '$3-$2-$1 12:00'));
		cont += 1

		title = item.competicion + ' - ' + item.grupo;

		var pattern = /(\d{2})\/(\d{2})\/(\d{4}) (\d{2})\:(\d{2})/;
		hora = item.fecha;
		if (item.hora)
			hora += ' ' + item.hora;
		else
			hora += ' 23:55'
		var date_obj = new Date(hora.replace(pattern, '$3-$2-$1 $4:$5'));

		table = show_partidos_club(title, item, date_obj.getTime(), local)
		$('#club_tabla').append(table);
	});

	//Ordenar resultados
	try {
		var toSort = document.getElementById('club_tabla').children;
		toSort = Array.prototype.slice.call(toSort, 0);
		toSort.sort(function (a, b) {
			var aord = +a.id;
			var bord = +b.id;
			return aord - bord;
		});
		const parentElement = document.getElementById('club_tabla');
		toSort.forEach(element => parentElement.appendChild(element));
		maxWitdh = 100;
		toSort.forEach(function (item) {
			if ($(item).width() > maxWitdh)
				maxWitdh = $(item).width();
		});
		toSort.forEach(function (item) {
			$(item).css("width", maxWitdh + "px");
		});


	} catch (e) {
		console.log(e);
	}

}

function show_partidos_club(title, item, id, local) {

	if (item.hora) {
		hora = ' - ' + item.hora;
		dia_str = item.fecha.replace(/-/g, "/") + hora + ' (' + dia_semana_sp(item.fecha) + ')';
	}
	else {
		hora = ' ???';
		dia_str = item.fecha.replace(/-/g, "/") + hora;
	}

	campo = '<a href="javascript:load_campo(\'' + item.codigo_campo + '\')">' + item.campo + '</a>';

	if (item.equipo_local.trim() != '') {
		casa = '<a href="javascript:load_portada_equipo(\'' + item.codigo_equipo_local + '\')">' + item.equipo_local + '</a>';
		casa = '<img src="https://www.futgal.es' + item.escudo_equipo_local + '" align="absmiddle" class="escudo_logo_medio">&nbsp;&nbsp;' + casa + '&nbsp;';
	} else {
		casa = 'Descansa';
		campo = '';
	}

	if (item.equipo_visitante.trim() != '') {
		fuera = '<a href="javascript:load_portada_equipo(\'' + item.codigo_equipo_visitante + '\')">' + item.equipo_visitante + '</a>';
		fuera = '<img src="https://www.futgal.es' + item.escudo_equipo_visitante + '" align="absmiddle" class="escudo_logo_medio">&nbsp;&nbsp;' + fuera + '&nbsp;';
	} else {
		fuera = 'Descansa';
		campo = '';
	}

	color_resultado = 'white';
	if (item.goles_casa == "" && item.goles_visitante == "") {
		datos = '<tr>'
			+ '<td bgcolor="white" colspan=2>' + casa + '</td>'
			+ '</tr>'
			+ '<tr>'
			+ '<td bgcolor="white" colspan=2>' + fuera + '</td>'
			+ '</tr>';

	} else {

		if (item.escudo_equipo_local == local) {
			if (Number(item.goles_casa) > Number(item.goles_visitante))
				color_resultado = "#04B431";
			else if (Number(item.goles_casa) < Number(item.goles_visitante))
				color_resultado = "#F78181";
			else
				color_resultado = "#D7DF01";
		} else if (item.escudo_equipo_visitante == local) {
			if (Number(item.goles_visitante) > Number(item.goles_casa))
				color_resultado = "#04B431";
			else if (Number(item.goles_visitante) < Number(item.goles_casa))
				color_resultado = "#F78181";
			else
				color_resultado = "#D7DF01";
		}

		if (item.partido_en_juego == '1')
			xogo = '<br>(en xogo)';
		else
			xogo = '';

		datos = '<tr>'
			+ '<td bgcolor="white">' + casa + '</td>'
			+ '<td style="background-color:' + color_resultado + ';" align="center">&nbsp;' + item.goles_casa + '&nbsp;' + xogo + '</td>'
			+ '</tr>'
			+ '<tr>'
			+ '<td bgcolor="white">' + fuera + '</td>'
			+ '<td style="background-color:' + color_resultado + ';" align="center">&nbsp;' + item.goles_visitante + '&nbsp;' + xogo + '</td>'
			+ '</tr>';
	}

	if (casa != 'Descansa')
		return '<table id="' + id + '" class="favoritos">'
			+ '<tr>'
			+ '<th colspan=2  align="absmiddle">' + title + '</th>'
			+ '</tr>'
			+ '<tr>'
			+ '<td bgcolor="#e8e5e4" colspan=2><b>Data:</b>&nbsp;' + dia_str + '</td>'
			+ '</tr>'
			+ '<tr>'
			+ '<td bgcolor="#e8e5e4" colspan=2><b>Campo:</b>&nbsp;' + campo + '</td>'
			+ '</tr>'
			+ datos
			+ '<tr>'
			+ '<td class="table_noborder">&nbsp;</td>'
			+ '</tr>'
			+ '</table>';
	else
		return '';
}