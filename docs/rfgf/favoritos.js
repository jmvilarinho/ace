async function load_favoritos() {
	displayLoading();

	favoritos = ['13810265', '10293316', '2747']

	var arrayLength = favoritos.length;
	$('#results').html('');
	add_back('favoritos');
	for (var i = 0; i < arrayLength; i++) {
		//Do something
		data = await get_data_equipo(favoritos[i])
		show_portada_equipo_favoritos(data.data, favoritos[i]);
	}
	add_back('favoritos');
	hideLoading();
}

async function get_data_equipo(cod_equipo) {
	var url = "https://pevbxmstzqkdtno6y4ocsumnz40kbdac.lambda-url.eu-west-1.on.aws/?type=getequipo&codequipo=" + cod_equipo;

	console.log("GET " + url);

	let data = await fetch(url)
		.then(response => {
			if (!response.ok) {
				throw new Error('Network response was not ok');  // Handle HTTP errors
			}
			return response.json();
		})
		.then(data => {
			if (data) {
				return data;
			} else {
				throw new Error('No data found in response');
			}
		})
		.catch(error => {
			console.error('Fetch error:', error.message);  // Log the error
		});
	return data
}

function show_portada_equipo_favoritos(data, cod_equipo) {
	lineas = 0;
	$('#results').append('<br>');
	jQuery.each(data.competiciones_equipo, function (index, item) {
		title = data.nombre_equipo + ' - <b>' + item.competicion

		cont = 0;
		jQuery.each(item.partidos, function (index, item) {
			cont += 1
			var pattern = /(\d{2})\-(\d{2})\-(\d{4})/;
			var dt = new Date(item.fecha.replace(pattern, '$3-$2-$1 12:00'));
			if (isSameWeek(dt, new Date(Date.now()))) {
				lineas += 1;
				show_portada_data_favoritos(title, item);
				return false;
			}
			previous = item;
		});
	});

	if (lineas == 0)
		$('#results').append('<table class="portada">'
			+ '<tr>'
			+ '<th colspan=2  align="absmiddle">' + title + '</th>'
			+ '</tr>'
			+ '<tr>'
			+ '<td bgcolor="#e8e5e4" colspan=2>Non hai datos</td>'
			+ '</table>');

}


function show_portada_data_favoritos(title, item) {
	if (item.hora)
		hora = ' - ' + item.hora;
	else
		hora = '';

	campo = '<a href="https://maps.google.com?q=' + item.campo + '" target="_maps">' + item.campo + '</a>';
	campo += ' <a href=https://maps.google.com?q=' + item.campo + '" target="_maps"><img src="../img/dot.png" height="20px"></a>';

	casa = '<a href="javascript:load_portada_equipo(\'' + item.codequipo_casa + '\')">' + item.equipo_casa + '</a>';
	casa = '<img src="https://www.futgal.es' + item.escudo_equipo_casa + '" align="absmiddle" class="escudo_logo_medio">&nbsp;&nbsp;' + casa + '&nbsp;';
	fuera = '<a href="javascript:load_portada_equipo(\'' + item.codequipo_fuera + '\')">' + item.equipo_fuera + '</a>';
	fuera = '<img src="https://www.futgal.es' + item.escudo_equipo_fuera + '" align="absmiddle" class="escudo_logo_medio">&nbsp;&nbsp;' + fuera + '&nbsp;';

	if (item.goles_casa == "" && item.goles_fuera == "") {
		datos = '<tr>'
			+ '<td bgcolor="white" colspan=2>' + casa + '</td>'
			+ '</tr>'
			+ '<tr>'
			+ '<td bgcolor="white" colspan=2>' + fuera + '</td>'
			+ '</tr>';

	} else {
		datos = '<tr>'
			+ '<td bgcolor="white">' + casa + '</td>'
			+ '<td bgcolor="white" align="center">&nbsp;' + item.goles_casa + '&nbsp;</td>'
			+ '</tr>'
			+ '<tr>'
			+ '<td bgcolor="white">' + fuera + '</td>'
			+ '<td bgcolor="white" align="center">&nbsp;' + item.goles_fuera + '&nbsp;</td>'
			+ '</tr>';
	}

	$('#results').append('<table class="portada">'
		+ '<tr>'
		+ '<th colspan=2  align="absmiddle">' + title + '</th>'
		+ '</tr>'
		+ '<tr>'
		+ '<td bgcolor="#e8e5e4" colspan=2><b>Data:</b>&nbsp;' + item.fecha + hora + ' (' + dia_str(item.fecha) + ')</td>'
		+ '</tr>'
		+ '<tr>'
		+ '<td bgcolor="#e8e5e4" colspan=2><b>Campo:</b>&nbsp;' + campo + '</td>'
		+ '</tr>'
		+ datos
		+ '</table>');
}
