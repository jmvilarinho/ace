var favorite_load = [];


async function load_plantilla(cod_equipo, addHistory = true) {
	displayLoading();
	setCookie('paginaRFGF', 'plantilla', 30)
	setCookie('cod_equipo', cod_equipo, 30)
	if (addHistory)
		history.pushState(null, "", '#plantilla/' + cod_equipo);

	var url = remote_url + "?type=getplantilla&codequipo=" + cod_equipo;
	console.log("GET " + url);
	favorite_load = [];

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
				show_plantilla(data.data, cod_equipo);
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

function show_plantilla(data, cod_equipo) {
	$('#results').append('<br><br>');
	nome = getCookie('nombre_equipo');
	if (nome != '')
		$('#results').append('<b>Plantilla de ' + nome + '</b> <div id="equipo_load"></div>');
	else
		$('#results').append('<b>Plantilla </b><div id="equipo_load"></div>');
	$('#results').append('<br>');
	crea_botons('plantilla', cod_equipo);


	$('#results').append('<table border >');
	$('#results').append(
		'<tr>'
		+ '</tr><tr>'
		+ '<th align="center">Dorsal</th>'
		+ '<th>Nombre</th>'
		+ '<th>Edat</th>'
		+ '<th>Sancions</th>'
		+ '<th>Minutos</th>'
		+ '</tr>'
	);
	cont = 0;

	console.log(data);
	var arr = [];

	jQuery.each(data.jugadores_equipo, function (index, item) {
		favorite_load.push(item.codjugador);
		$('#equipo_load').html(' (Cargando datos ' + favorite_load.length + ')');

		background = getBackgroundColor(cont, false);
		cont += 1

		$('#results').append('<tr>');

		$('#results').append('<tr>'
			+ '<td style="background-color:' + background + ';" align="center">' + item.dorsal + '</td>'
			+ '<td style="background-color:' + background + ';" >' + item.nombre + '</td>'
			+ '<td style="background-color:' + background + ';" >' + item.edad + '</td>'
			+ '<td style="background-color:' + background + ';" ><div id="sanciones_' + item.codjugador + '"></div></td>'
			+ '<td style="background-color:' + background + ';" >' + item.minutos_totales_jugados + '</td>'
			+ '</tr>');

		arr.push(item.codjugador);

	});
	$('#results').append('</table>');

	get_extra_data(arr);

	$('#results').append('<br>');
	crea_botons('plantilla', cod_equipo);
	$('#results').append('<br><br>');

}

async function get_extra_data(arr) {
	var arrayLength = arr.length;
	$('#sanciones').html('Sancions');

	for (var i = 0; i < arrayLength; i++) {

		var url = remote_url + "?type=getjugador&codjugador=" + arr[i];
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
					show_jugador(data.data, arr[i]);
				} else {
					throw new Error('No data found in response');
				}
			})
			.catch(error => {
				console.error('Fetch error:', error.message);  // Log the error
			});
	}
}
function show_jugador(data, cod_jugador) {
	sanciones = '';

	jQuery.each(data.tarjetas, function (index, item) {
		if (item.codigo_tipo_tarjeta == '100') {
			for (var x = 0; x < Number(item.valor); x++) {
				sanciones += '<img class="escudo_widget" src=../img/amarilla.png>';
			}
		}
		if (item.codigo_tipo_tarjeta == '102') {
			for (var x = 0; x < Number(item.valor); x++) {
				sanciones += '<img class="escudo_widget" src=../img/dobleamarilla.png>';
			}
		}
		if (item.codigo_tipo_tarjeta == '101') {
			for (var x = 0; x < Number(item.valor); x++) {
				sanciones += '<img class="escudo_widget" src=../img/roja.png>';
			}
		}
	});

	$('#sanciones_' + cod_jugador).append(sanciones);

	favorite_load.pop();
	if (favorite_load.length > 0)
		$('#equipo_load').html(' (Cargando datos ' + favorite_load.length + ')');
	else
		$('#equipo_load').html('');


}