async function load_resultados(cod_grupo, cod_equipo, jornada, addHistory = true) {
	displayLoading();
	setCookie('paginaRFGF', 'resultados', 30)
	setCookie('cod_equipo', cod_equipo, 30)
	setCookie('cod_grupo', cod_grupo, 30)
	if (addHistory)
		history.pushState(null, "", '#resultados/' + cod_equipo + '/' + cod_grupo);

	var url = remote_url + "?type=getresultados&codgrupo=" + cod_grupo + '&jornada=' + jornada;
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
				show_resultados(data.data, cod_grupo, cod_equipo, jornada);
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

function show_resultados(data, codgrupo, cod_equipo) {
	$('#results').append('<br>');
	$('#results').append(data.nombre_competicion + ' (' + data.nombre_grupo + ')<br>');
	crea_botons('resultados', cod_equipo, codgrupo, data.codigo_competicion);

	j = parseInt(data.jornada);
	if ((j - 1) > 0) {
		back = "<a href=\"javascript:load_resultados('" + codgrupo + "','" + cod_equipo + "','" + (j - 1) + "',false)\"><img class=\"escudo_widget\" src=../img/back.png></a>&nbsp;&nbsp;&nbsp;";
	} else {
		back = '';
	}

	if (data.jornada < data.listado_jornadas[0].jornadas.length)
		forward = "&nbsp;&nbsp;&nbsp;<a href=\"javascript:load_resultados('" + codgrupo + "','" + cod_equipo + "','" + (j + 1) + "',false)\"><img class=\"escudo_widget\" src=../img/forward.png></a>";
	else
		forward = '';



	$('#results').append('<table border >');
	$('#results').append(
		'<tr>'
		+ '<th colspan="4" align="center">' + back + 'Xornada ' + data.jornada + ' - ' + data.fecha_jornada.replace(/-/g, "/") + forward + '</th>'
		+ '</tr><tr>'
		+ '<th>Data</th>'
		+ '<th align="right"></th>'
		+ '<th align="center">Resultado</th>'
		+ '<th align="left"></th>'
		+ '</tr>'
	);
	cont = 0;

	jQuery.each(data.partidos, function (index, item) {
		background = getBackgroundColor(cont, (item.CodEquipo_local == cod_equipo || item.CodEquipo_visitante == cod_equipo));
		cont += 1

		$('#results').append('<tr>');

		if (item.Nombre_equipo_local == 'Descansa') {
			casa = item.Nombre_equipo_local;
		} else {
			casa = '<a href="javascript:load_xornadas(\'' + item.CodEquipo_local + '\')">' + item.Nombre_equipo_local + '</a>';
		}

		if (item.Nombre_equipo_local != 'Descansa')
			casa = casa + '&nbsp;<img src="https://www.futgal.es' + item.url_img_local + '" align="absmiddle" class="escudo_widget">';

		if (item.Nombre_equipo_visitante == 'Descansa') {
			fuera = item.Nombre_equipo_visitante;
		} else {
			fuera = '<a href="javascript:load_xornadas(\'' + item.CodEquipo_visitante + '\')">' + item.Nombre_equipo_visitante + '</a>';

		}
		if (item.Nombre_equipo_visitante != 'Descansa')
			fuera = '<img src="https://www.futgal.es' + item.url_img_visitante + '" align="absmiddle" class="escudo_widget">&nbsp;' + fuera;

		if (item.situacion_juego == '2')
			xogo = '<br>(en xogo)';
		else
			xogo = '';
		if (!(item.situacion_juego == '1' || item.situacion_juego == '' || item.situacion_juego == '2'))
			xogo += '<br>situacion_juego: "' + item.situacion_juego + '"';

		if (item.hora)
			hora = ' - ' + item.hora;
		else
			hora = '';

		goles_html = '';
		if (item.Goles_casa != "" && item.Goles_visitante != "") {
			goles_html = item.Goles_casa + ' - ' + item.Goles_visitante + xogo;
			if (item.codacta != '') {
				goles_html = '<a href="javascript:load_acta(\'' + item.codacta + '\')">' + goles_html + '</a>';
			}
		}


		$('#results').append('<tr>'
			+ '<td style="background-color:' + background + ';" >' + item.fecha.replace(/-/g, "/") + hora + '</td>'
			+ '<td style="background-color:' + background + ';" align="right" >' + casa + '</td>'
			+ '<td style="background-color:' + background + ';" align="center" >' + goles_html + '</td>'
			+ '<td style="background-color:' + background + ';" align="left" >' + fuera + '</td>'
			+ '</tr>');
	});
	$('#results').append('</table>');

}
