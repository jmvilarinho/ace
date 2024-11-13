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


async function load_campo(cod_campo, timestamp = '', addHistory = true) {
	displayLoading();
	setCookie('paginaRFGF', 'campo', 30)
	setCookie('cod_campo', cod_campo, 30)
	if (addHistory)
		history.pushState(null, "", '#campo/////' + cod_campo);

	if (typeof (timestamp) == "undefined" || timestamp == '') {
		current_date = new Date();
	} else {
		current_date = new Date(timestamp * 1);
	}

	firstEvent = getMonday(current_date);
	lastEvent = getSunday(current_date);

	var url = remote_url + "?type=getcampo&fecha_desde=" + firstEvent + "&fecha_hasta=" + lastEvent + "&codcampo=" + cod_campo;
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
				$('#results').append('<div id="campo_list"></div><div id="campo_tabla"></div>');
				console.log(data);
				show_campo(data.data, cod_campo, current_date, data.campo_data.data);
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


function show_campo(data, cod_campo, current_date, data_campo) {
	date_curent = new Date();

	firstEvent = getMonday(current_date);
	lastEvent = getSunday(current_date);
	var pattern = /(\d{4})\-(\d{2})\-(\d{2})/;
	firstEvent_str = firstEvent.replace(pattern, '$3/$2/$1');
	lastEvent_str = lastEvent.replace(pattern, '$3/$2/$1');

	week_before = current_date - (7 * 1000 * 3600 * 24);
	week_after = current_date.addDays(7);

	campo = '';
	if (data.partidos.length) {
		campo = '<tr><th colspan=3  align="absmiddle">'
			+ '<img src="https://www.futgal.es' + data_campo.imagen_campo + '" align="absmiddle" class="escudo_logo_medio">&nbsp;&nbsp;'
			+ '<a href="https://maps.google.com?q=' + encodeURIComponent(data_campo.codigo_postal	+ ' ' +data_campo.direccion+' '+data.partidos[0].campo) + '" target="_blank">' + data.partidos[0].campo + '</a> '
			+ '<a href=https://maps.google.com?q=' + data_campo.latitud + ',' + data_campo.longitud + ' target=_blank><img src="../img/dot.png" height="15px"></a> '
			+ '</th></tr>';
	}


	back = "<a href=\"javascript:load_campo('" + cod_campo + "','" + week_before + "',false)\"><img class=\"escudo_widget\" src=../img/back.png></a>&nbsp;&nbsp;&nbsp;";
	forward = "&nbsp;&nbsp;&nbsp;<a href=\"javascript:load_campo('" + cod_campo + "','" + week_after + "',false)\"><img class=\"escudo_widget\" src=../img/forward.png></a>";
	$('#campo_tabla').append('<table id="0" class="favoritos">'
		+ campo
		+ '<tr>'
		+ '<td colspan=3 align="absmiddle">' + data_campo.tipo_campo	 + ', ' + data_campo.superficie_juego	 + ' - ' + data_campo.localidad		+ ' (' + data_campo.provincia			+ ')' 			 + '</td>'
		+ '</tr>'
		+ '<tr>'
		+ '<td align="absmiddle">' + back + '</td>'
		+ '<td align="absmiddle">Semán do ' + firstEvent_str + ' ó ' + lastEvent_str + '</td>'
		+ '<td align="absmiddle">' + forward + '</td>'
		+ '</tr>'
		+ '</table><br>');


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


	lineas = 0;
	$('#results').append('<br>');

	cont = 0;
	jQuery.each(data.partidos, function (index, item) {
		var pattern = /(\d{2})\-(\d{2})\-(\d{4})/;
		var dt = new Date(item.fecha.replace(pattern, '$3-$2-$1 12:00'));
		background = getBackgroundColor(cont, (isSameWeek(dt, new Date(Date.now()))));
		cont += 1

		var pattern = /(\d{2})\/(\d{2})\/(\d{4}) (\d{2})\:(\d{2})/;
		hora = item.fecha;
		if (item.hora)
			hora += ' ' + item.hora;
		else
			hora += ' 23:55'
		var date_obj = new Date(hora.replace(pattern, '$3-$2-$1 $4:$5'));

		table = show_partido(item, date_obj.getTime(), local)
		$('#campo_tabla').append(table);
	});

	//Ordenar resultados
	try {
		var toSort = document.getElementById('campo_tabla').children;
		toSort = Array.prototype.slice.call(toSort, 0);
		toSort.sort(function (a, b) {
			var aord = +a.id;
			var bord = +b.id;
			return aord - bord;
		});
		const parentElement = document.getElementById('campo_tabla');
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

function show_partido(item, id, local) {

	if (item.hora) {
		hora = ' - ' + item.hora;
		dia_str = item.fecha.replace(/-/g, "/") + hora + ' (' + dia_semana_sp(item.fecha) + ')';
	}
	else {
		hora = ' ???';
		dia_str = item.fecha.replace(/-/g, "/") + hora;
	}

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
			+ '<th colspan=2>' + item.competicion + ' - ' + item.grupo + '</th>'
			+ '</tr>'
			+ '<tr>'
			+ '<td bgcolor="#e8e5e4" colspan=2><b>Data:</b>&nbsp;' + dia_str + '</td>'
			+ '</tr>'
			+ datos
			+ '<tr>'
			+ '<td class="table_noborder">&nbsp;</td>'
			+ '</tr>'
			+ '</table>';
	else
		return '';
}