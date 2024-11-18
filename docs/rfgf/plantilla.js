var favorite_load = [];
var cont_cargados = 0;
var cont_total = 0;

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

async function show_plantilla(data, cod_equipo) {
	$('#results').append('<br>');
	nome = getCookie('nombre_equipo');
	if (nome != '')
		$('#results').append('<div id="equipo_name">' + nome + '</div><b><div id="equipo_load"></div>');
	else
		$('#results').append('<div id="equipo_name">Plantilla</div><div id="equipo_load"></div>');
	$('#results').append('');
	crea_botons('back');
	$('#results').append('<br>');

	table = '<table id="main_table_1" class="table_noborder">';
	table += '<tr>'
		+ '<th class="table_noborder" bgcolor="#e8e5e4" align="center">Dorsal</th>'
		+ '<th class="table_noborder" bgcolor="#e8e5e4" >Nombre</th>'
		+ '<th class="table_noborder" bgcolor="#e8e5e4" >Edad</th>'
		+ '<th class="table_noborder" bgcolor="#e8e5e4" >Sancions</th>'
		+ '<th class="table_noborder" bgcolor="#e8e5e4" id="hpartidos" >Partidos</th>'
		+ '<th class="table_noborder" bgcolor="#e8e5e4" id="hgoles">goles</th>'
		+ '</tr>';

	cont = 1;
	var arr = [];
	jQuery.each(data.jugadores_equipo, function (index, item) {
		background = getBackgroundColor(cont, false);
		cont += 1

		$('#equipo_load').html(' (Cargando datos ...)');
		table += '<tr>'
			+ '<td class="table_noborder" style="background-color:' + background + ';" align="right">' + item.dorsal + '&nbsp;&nbsp;</td>'
			+ '<td class="table_noborder" style="background-color:' + background + ';" id="nombre_' + item.codjugador + '" >' + item.nombre + '</td>'
			+ '<td class="table_noborder" style="background-color:' + background + ';" align="right" id="edad_' + item.codjugador + '" ></td>'
			+ '<td class="table_noborder" style="background-color:' + background + ';" id="sanciones_' + item.codjugador + '" ></td>'
			+ '<td class="table_noborder" style="background-color:' + background + ';" align="center" id="partidos_' + item.codjugador + '" ></td>'
			+ '<td class="table_noborder" style="background-color:' + background + ';" align="center" id="goles_' + item.codjugador + '" ></td>'
			+ '</tr>';

		arr.push(item.codjugador);
	});
	table += '</table>';
	$('#results').append(table);

	table = '<br><table id="main_table_2" class="table_noborder">'
		+'<tr>'
		+ '<th class="table_noborder" bgcolor="#e8e5e4"  align="center">Equipo técnico</th>'
		+ '</tr>'
	;
	cont = 1;
	jQuery.each(data.tecnicos_equipo, function (index, item) {
		background = getBackgroundColor(cont, false);
		cont += 1
		table +='<tr>'
			+ '<td class="table_noborder" style="background-color:' + background + ';" ><img class="escudo_widget" src=../img/entrenador.png> ' + item.nombre + '</td>'
			+ '</tr>';
	});
	jQuery.each(data.delegados_equipo, function (index, item) {
		background = getBackgroundColor(cont, false);
		cont += 1
		table += '<tr>'
			+ '<td class="table_noborder" style="background-color:' + background + ';" >' + item.nombre + '</td>'
			+ '</tr>';
	});
	table += '</table>';
	$('#results').append(table);
	crea_botons('back');
	$('#results').append('<br><br>');

	$('#sanciones').html('Sancions');
	favorite_load = [];
	cont_total=arr.length;
	cont_cargados=0;
	for (var i = 0; i < arr.length; i++) {
		favorite_load.push(arr[i]);
		// limita concurrencia a 3
		while (favorite_load.length > 3)
			await new Promise(r => setTimeout(r, 300));
		get_extra_data(arr[i]);
	}
	updatewitdh_plantilla();
}

async function get_extra_data(cod_jugador) {
	var url = remote_url + "?type=getjugador&codjugador=" + cod_jugador;
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
				show_jugador(data.data, cod_jugador);
			} else {
				throw new Error('No data found in response');
			}
		})
		.catch(error => {
			console.error('Fetch error:', error.message);  // Log the error
		});

}
function show_jugador(data, cod_jugador) {
	sanciones = '';

	cont = 0;
	jQuery.each(data.tarjetas, function (index, item) {
		if (item.codigo_tipo_tarjeta == '100') {
			for (var x = 0; x < Number(item.valor); x++) {
				cont += 1;
				sanciones += '<img class="escudo_widget" src=../img/amarilla.png>';
			}
		}
		if (item.codigo_tipo_tarjeta == '102') {
			for (var x = 0; x < Number(item.valor); x++) {
				cont += 1;
				sanciones += '<img class="escudo_widget" src=../img/dobleamarilla.png>';
			}
		}
		if (item.codigo_tipo_tarjeta == '101') {
			for (var x = 0; x < Number(item.valor); x++) {
				cont += 1;
				sanciones += '<img class="escudo_widget" src=../img/roja.png>';
			}
		}
	});

	if (data.es_portero == '1') {
		nombre = $('#nombre_' + cod_jugador).html();
		$('#nombre_' + cod_jugador).html('<img class="escudo_widget" src=../img/portero.png> ' + nombre);
	}

	if (data.competiciones_participa.categoria_equipo != '') {
		$('#equipo_name').html(data.competiciones_participa.categoria_equipo);
	}
	console.log(data.competiciones_participa);

	$('#edad_' + cod_jugador).html(data.edad + '&nbsp;&nbsp;');
	$('#sanciones_' + cod_jugador).html(sanciones);
	$('#hpartidos').html(data.partidos[4].nombre);
	$('#partidos_' + cod_jugador).html(data.partidos[4].valor);
	$('#hgoles').html(data.partidos[8].nombre);
	if (data.partidos[8].valor != '0')
		$('#goles_' + cod_jugador).html(data.partidos[8].valor);

	favorite_load.pop();
	cont_cargados += 1;
	if (favorite_load.length > 0)
		$('#equipo_load').html(' (Cargando datos, pendientes ' + (cont_total - cont_cargados) + ')');
	else {
		$('#equipo_load').html('');
		updatewitdh_plantilla();
	}
}

function updatewitdh_plantilla() {
	if ($("#main_table_2").length) {
		if ($("#main_table_1").width() > $("#main_table_2").width())
			maxWitdh = $("#main_table_1").width();
		else
			maxWitdh = $("#main_table_2").width();

		$("#main_table_1").css("width", maxWitdh + "px");
		$("#main_table_2").css("width", maxWitdh + "px");
	}
}
