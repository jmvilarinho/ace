async function load_plantilla(cod_equipo, addHistory = true) {
	displayLoading();
	setCookie('paginaRFGF', 'plantilla', 30)
	setCookie('cod_equipo', cod_equipo, 30)
	if (addHistory)
		history.pushState(null, "", '#plantilla/' + cod_equipo);

	var url = remote_url + "?type=getplantilla&codequipo=" + cod_equipo;
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

function show_plantilla(data, codgrupo, cod_equipo) {
	$('#results').append('<br><br>');
	$('#results').append('<b>Plantilla</b>');
	$('#results').append('<br><br>');
	crea_botons('plantilla', cod_equipo, codgrupo, data.codigo_competicion);

	$('#results').append('<table border >');
	$('#results').append(
		'<tr>'
		+ '</tr><tr>'
		+ '<th>Dorsal</th>'
		+ '<th>Nombre</th>'
		+ '<th>Sancions</th>'
		+ '</tr>'
	);
	cont = 0;

	console.log(data);
	var arr = [];

	jQuery.each(data.jugadores_equipo, function (index, item) {
		background = getBackgroundColor(cont, false);
		cont += 1

		$('#results').append('<tr>');

		$('#results').append('<tr>'
			+ '<td style="background-color:' + background + ';" >' + item.dorsal + '</td>'
			+ '<td style="background-color:' + background + ';" >' + item.nombre + '</td>'
			+ '<td style="background-color:' + background + ';" ><div id="sanciones_'+item.codjugador+'"></div></td>'
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
					show_jugador(data.data,arr[i]);
				} else {
					throw new Error('No data found in response');
				}
			})
			.catch(error => {
				console.error('Fetch error:', error.message);  // Log the error
			});
	}
}
function show_jugador(data,cod_jugador){
	sanciones='';
	jQuery.each(data.tarjetas, function (index, item) {
		if ( item.codigo_tipo_tarjeta	 == '100'){
			for (var x = 0; x < Number(item.valor); x++) {
				sanciones +='<img class="escudo_widget" src=../img/amarilla.png>';
			}
		}
		if ( item.codigo_tipo_tarjeta	 == '102'){
			for (var x = 0; x < Number(item.valor); x++) {
				sanciones +='<img class="escudo_widget" src=../img/dobleamarilla.png>';
			}
		}
		if ( item.codigo_tipo_tarjeta	 == '101'){
			for (var x = 0; x < Number(item.valor); x++) {
				sanciones +='<img class="escudo_widget" src=../img/roja.png>';
			}
		}
	});
	console.log (sanciones,'#sanciones_'+cod_jugador)

	$('#sanciones_'+cod_jugador).append(sanciones);

}