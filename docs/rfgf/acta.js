async function load_acta(cod_acta, addHistory = true) {
	displayLoading();
	setCookie('paginaRFGF', 'acta', 30)
	setCookie('cod_acta', cod_acta, 30)
	if (addHistory)
		history.pushState(null, "", '#acta//////' + cod_acta);

	var url = remote_url + "?type=getacta&codacta=" + cod_acta;
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
				show_acta_equipo(data.data);
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

function show_acta_equipo(data) {
	lineas = 0;
	$('#results').append('<br><br>');
	crea_botons('back');
	$('#results').append('<br><br>');

	arbitros_partido = 'Árbitro/s:<br>';
	jQuery.each(data.arbitros_partido, function (index, item) {
		arbitros_partido += item.nombre_arbitro + '<br>';
	});

	jugadores_equipo_visitante = get_jugador(data.jugadores_equipo_visitante);
	jugadores_equipo_local = get_jugador(data.jugadores_equipo_local);

	$('#results').append('<table id="main_table_1" class="table_noborder">'
		+ '<tr>'
		+ '<th colspan=3  align="left">Acta número: ' + data.codacta + (data.acta_cerrada=='1'?'(cerrada)':'(abierta)' )+ '</td>'
		+ '</tr>'
		+ '<tr>'
		+ '<td colspan=3  align="left">' + arbitros_partido + '</td>'
		+ '</tr>'
		+ '<tr>'
		+ '<th>' + data.equipo_local + '</th>'
		+ '<th></th>'
		+ '<th>' + data.equipo_visitante + '</th>'
		+ '</tr>'
		+ '<tr>'
		+ '<td style="vertical-align:top" >' + jugadores_equipo_local + '</th>'
		+ '<td></th>'
		+ '<td style="vertical-align:top">' + jugadores_equipo_visitante + '</th>'
		+ '</tr>'
		+ '</table>');



	updatewitdh();



}

function get_jugador(arr) {
	jugador = '';
	jQuery.each(arr, function (index, item) {
		if (item.titular == '1') {
			if (item.capitan == '1')
				jugador += '<img class="escudo_widget" src=capitan.png> ';

			jugador += item.nombre_jugador;
			if (item.posicion != '')
				jugador += ' (' + item.posicion + ')';
			jugador += '<br>';
		}
	});
	jQuery.each(arr, function (index, item) {
		if (item.titular != '1') {
			if (item.capitan == '1')
				jugador += '<img class="escudo_widget" src=capitan.png> ';

				jugador += '<img class="escudo_widget" src=silla.png> ';
			jugador += item.nombre_jugador;
			if (item.posicion != '')
				jugador += ' (' + item.posicion + ')';
			jugador += '<br>';
		}
	});
	return jugador;
}


function updatewitdh() {
	if ($("#main_table_2").length) {
		if ($("#main_table_1").width() > $("#main_table_2").width())
			maxWitdh = $("#main_table_1").width();
		else
			maxWitdh = $("#main_table_2").width();

		$("#main_table_1").css("width", maxWitdh + "px");
		$("#main_table_2").css("width", maxWitdh + "px");
	}
}


