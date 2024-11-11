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
				show_campo(data.data, cod_campo, current_date);
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

Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return  date.getTime();
}


function show_campo(data, cod_campo, current_date) {
	date_curent = new Date();

	firstEvent = getMonday(current_date);
	lastEvent = getSunday(current_date);
	var pattern = /(\d{4})\-(\d{2})\-(\d{2})/;
	firstEvent_str = firstEvent.replace(pattern, '$3/$2/$1');
	lastEvent_str = lastEvent.replace(pattern,  '$3/$2/$1');

	week_before =  current_date - (7 * 1000 * 3600 * 24);
	week_after = current_date.addDays(7);


	back = "<a href=\"javascript:load_campo('" + cod_campo + "','" + week_before + "',false)\"><img class=\"escudo_widget\" src=../img/back.png></a>&nbsp;&nbsp;&nbsp;";
	forward = "&nbsp;&nbsp;&nbsp;<a href=\"javascript:load_campo('" + cod_campo + "','" + week_after + "',false)\"><img class=\"escudo_widget\" src=../img/forward.png></a>";
	$('#campo_tabla').append('<table id="0" class="favoritos">'
		+ '<tr>'
		+ '<th align="absmiddle">' + back + '</th>'
		+ '<th align="absmiddle">Semán do ' + firstEvent_str + ' ó ' + lastEvent_str + '</th>'
		+ '<th align="absmiddle">' + forward + '</th>'
		+ '</tr>'
		+ '</table><br>');



	lineas = 0;
	$('#results').append('<br>');

	cont = 0;
	jQuery.each(data.partidos, function (index, item) {
		var pattern = /(\d{2})\-(\d{2})\-(\d{4})/;
		var dt = new Date(item.fecha.replace(pattern, '$3-$2-$1 12:00'));
		background = getBackgroundColor(cont, (isSameWeek(dt, new Date(Date.now()))));
		cont += 1

		title = item.campo;

		var pattern = /(\d{2})\/(\d{2})\/(\d{4}) (\d{2})\:(\d{2})/;
		hora = item.fecha;
		if (item.hora)
			hora += ' ' + item.hora;
		else
			hora += ' 23:55'
		var date_obj = new Date(hora.replace(pattern, '$3-$2-$1 $4:$5'));

		table = show_partido(title, item, date_obj.getTime())
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

function show_partido(title, item, id) {

	if (item.hora) {
		hora = ' - ' + item.hora;
		dia_str = item.fecha.replace(/-/g, "/") + hora + ' (' + dia_semana_sp(item.fecha) + ')';
	}
	else {
		hora = ' ???';
		dia_str = item.fecha.replace(/-/g, "/") + hora;
	}

	title = '<a href="https://maps.google.com?q=' + encodeURIComponent(title) + '" target="_blank">' + title + '</a> <img src="../img/dot.png" height="15px">';


	casa = '<a href="javascript:load_portada_equipo(\'' + item.codigo_equipo_local	 + '\')">' + item.equipo_local + '</a>';
	casa = '<img src="https://www.futgal.es' + item.escudo_equipo_local + '" align="absmiddle" class="escudo_logo_medio">&nbsp;&nbsp;' + casa + '&nbsp;';

	fuera = '<a href="javascript:load_portada_equipo(\'' + item.codigo_equipo_visitante	 + '\')">' + item.equipo_visitante + '</a>';
	fuera = '<img src="https://www.futgal.es' + item.escudo_equipo_visitante + '" align="absmiddle" class="escudo_logo_medio">&nbsp;&nbsp;' + fuera + '&nbsp;';

	if (item.goles_casa == "" && item.goles_visitante == "") {
		datos = '<tr>'
			+ '<td bgcolor="white" colspan=2>' + casa + '</td>'
			+ '</tr>'
			+ '<tr>'
			+ '<td bgcolor="white" colspan=2>' + fuera + '</td>'
			+ '</tr>';

	} else {

		if (item.partido_en_juego == '1')
			xogo = '<br>(en xogo)';
		else
			xogo = '';

		datos = '<tr>'
			+ '<td bgcolor="white">' + casa + '</td>'
			+ '<td bgcolor="white" align="center">&nbsp;' + item.goles_casa + '&nbsp;' + xogo + '</td>'
			+ '</tr>'
			+ '<tr>'
			+ '<td bgcolor="white">' + fuera + '</td>'
			+ '<td bgcolor="white" align="center">&nbsp;' + item.goles_visitante + '&nbsp;' + xogo + '</td>'
			+ '</tr>';
	}

	return '<table id="' + id + '" class="favoritos">'
		+ '<tr>'
		+ '<th colspan=2  align="absmiddle">' + title + '</th>'
		+ '</tr>'
		+ '<tr>'
		+ '<td bgcolor="#e8e5e4" colspan=2><b>Data:</b>&nbsp;' + dia_str + '</td>'
		+ '</tr>'
		+ '<tr>'
		+ '<td bgcolor="#e8e5e4" colspan=2><b>Competición:</b>&nbsp;' + item.competicion + ' - ' + item.grupo + '</td>'
		+ '</tr>'
		+ datos
		+ '<tr>'
		+ '<td class="table_noborder">&nbsp;</td>'
		+ '</tr>'
		+ '</table>';
}