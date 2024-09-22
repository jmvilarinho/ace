function crea_botons(pagina,codigo_equipo, cod_grupo, cod_competicion) {

	var boton_partidos = $('<input/>').attr({
		type: "button",
		class: (pagina == 'portada') ? 'none' : "back_button",
		id: "field",
		value: 'Portada',
		onclick: "load_portada_equipo('" + codigo_equipo + "')"
	});
	$('#results').append(boton_partidos);

	var boton_partidos = $('<input/>').attr({
		type: "button",
		class: (pagina == 'partidos') ? 'none' : "back_button",
		id: "field",
		value: 'Partidos',
		onclick: "load_equipo('" + codigo_equipo + "')"
	});
	$('#results').append(boton_partidos);

	var boton_clasificacion = $('<input/>').attr({
		type: "button",
		class: (pagina == 'clasificacion') ? 'none' : "back_button",
		id: "field",
		value: 'Clasificación',
		onclick: "load_clasificacion('" + cod_grupo + "','" + codigo_equipo + "')"
	});
	$('#results').append(boton_clasificacion);

	var boton_goleadores = $('<input/>').attr({
		type: "button",
		class: (pagina == 'goleadores') ? 'none' : "back_button",
		id: "field",
		value: 'Goleadores',
		onclick: "load_goleadores('" + cod_competicion + "','" + cod_grupo + "','" + codigo_equipo + "')"
	});
	$('#results').append(boton_goleadores);
}


function load_portada_equipo(cod_equipo) {
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
				setCookie('pagina', 'portada', 30)
				console.log('JSESSIONID: ', data.JSESSIONID);
				$('#results').html('');
				add_back();
				show_portada_equipo(data.data, cod_equipo);
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

function show_portada_equipo(data, cod_equipo) {
	lineas = 0;
	$('#results').append('<br>');
	jQuery.each(data.competiciones_equipo, function (index, item) {
		lineas += 1;
		if (lineas > 1)
			$('#results').append('<br><hr>');

		$('#results').append(data.nombre_equipo + ' - <b>' + item.competicion + '</b><br>');
		crea_botons( 'portada',data.codigo_equipo, item.cod_grupo, item.cod_competicion);

		ultima = item.ultima_jornada_jugada;
		cont = 0;
		previous = undefined;
		jQuery.each(item.partidos, function (index, item) {
			cont += 1
			var pattern = /(\d{2})\-(\d{2})\-(\d{4})/;
			var dt = new Date(item.fecha.replace(pattern, '$3-$2-$1 12:00'));
			if (isSameWeek(dt, new Date(Date.now()))) {
				show_portada_data('Xornada actual (#' + ultima + ')', item);

				if (previous)
					$('#results').append('<br><br>');
				show_portada_data('Xornada anterior', previous);
				$('#results').append('<br>');
				return false;
			}
			previous = item;
		});
	});

	if (lineas == 0)
		$('#results').append('<b>Equipo:</b> ' + data.nombre_equipo + '<br><br><br><b>Non hai datos</b><br><br><br>');

}
function dia_str(fecha) {
	var pattern = /(\d{2})\-(\d{2})\-(\d{4})/;
	var dt = new Date(fecha.replace(pattern, '$3-$2-$1 12:00'));


	days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

	return days[dt.getDay()]; // "Friday"
}


function show_portada_data(title, item) {
	if (item.hora)
		hora = ' - ' + item.hora;
	else
		hora = '';

	campo = '<a href="https://maps.google.com?q=' + item.campo + '" target="_new">' + item.campo + '</a>';
	campo += ' <a href=https://maps.google.com?q=' + item.campo + '" target="_new"><img src="../img/dot.png" height="20px"></a>';

	casa = '<a href="javascript:load_portada_equipo(\'' + item.codequipo_casa + '\')">' + item.equipo_casa + '</a>';
	casa = '<img src="https://www.futgal.es' + item.escudo_equipo_casa + '" align="absmiddle" class="escudo_logo">&nbsp;&nbsp;' + casa;
	fuera = '<a href="javascript:load_portada_equipo(\'' + item.codequipo_fuera + '\')">' + item.equipo_fuera + '</a>';
	fuera = '<img src="https://www.futgal.es' + item.escudo_equipo_fuera + '" align="absmiddle" class="escudo_logo">&nbsp;&nbsp;' + fuera;

	$('#results').append('<table class="portada">'
		+ '<tr>'
		+ '<td colspan=2  align="absmiddle"><b>' + title + '</b></td>'
		+ '</tr>'
		+ '<tr>'
		+ '<td colspan=2><b>Data:</b>&nbsp;' + item.fecha + hora + ' ('+dia_str( item.fecha ) +')</td>'
		+ '</tr>'
		+ '<tr>'
		+ '<td colspan=2><b>Campo:</b>&nbsp;' + campo + '</td>'
		+ '</tr>'
		+ '<tr>'
		+ '<td bgcolor="white">' + casa + '</td>'
		+ '<td bgcolor="white" align="center">&nbsp;' + item.goles_casa + '&nbsp;</td>'
		+ '</tr>'
		+ '<tr>'
		+ '<td bgcolor="white">' + fuera + '</td>'
		+ '<td bgcolor="white" align="center">&nbsp;' + item.goles_fuera + '&nbsp;</td>'
		+ '</tr></table>');
}