
function load_favoritos() {
	displayLoading();
	setCookie('pagina', 'favoritos', 30)

	favoritos = getCookieArray('favoritosItems');
	if ( favoritos.length <= 0){
		favoritos = ["13810265","10293316"];
		setCookie('favoritosItems', JSON.stringify(favoritos), 30);
	}

	var arrayLength = favoritos.length;

	$('#results').html('');
	var arr = [];
	add_back('favoritos');
	$('#results').append('<div id="favoritos_tabla"></div><div id="favoritos_list"></div>');
	for (var i = 0; i < arrayLength; i++) {
		//Do something
		get_data_equipo_async(favoritos[i])
	}

	var arrayLength = equipos.length;
	$('#favoritos_list').append('<hr><b>Lista Favoritos</b><br>');
	for (var i = 0; i < arrayLength; i++) {
		checked='';
		if ( favoritos.indexOf(''+equipos[i].id) >= 0 ){
			checked = 'checked';
		}
		$('#favoritos_list').append('<label>'
			+ '<input type="checkbox" '+checked+' value="' + equipos[i].id + '" onclick="setArrayCookie(this)">' + equipos[i].name
			+ '&nbsp;</label><br>'
		);
	}
	$('#results').append('<hr>');


	add_back('favoritos');
	end_page();
	hideLoading();
}

async function load_favoritos_sorted() {
	displayLoading();
	setCookie('pagina', 'favoritos', 30)

	favoritos = getCookieArray('favoritosItems');
	if ( favoritos.length <= 0){
		favoritos = ["13810265","10293316"];
		setCookie('favoritosItems', JSON.stringify(favoritos), 30);
	}

	var arrayLength = favoritos.length;

	$('#results').html('');
	var arr = [];
	add_back('favoritos');
	for (var i = 0; i < arrayLength; i++) {
		//Do something
		try {
			data = await get_data_equipo(favoritos[i])
			arr = arr.concat(show_portada_equipo_favoritos(data.data, favoritos[i]));
		} catch (e) {
			// statements to handle any exceptions
			logMyErrors(e); // pass exception object to error handler
			arr = arr.concat({
				data: 33284008833000,
				html: '<table class="portada">'
					+ '<tr>'
					+ '<th colspan=2  align="absmiddle">Error: ' + favoritos[i] + '</th>'
					+ '</tr>'
					+ '<tr>'
					+ '<td bgcolor="#e8e5e4" colspan=2>Non hai datos</td>'
					+ '</table>'
			});
		}
	}

	arr.sort((a, b) => {
		if (a.data < b.data) {
			return -1;
		}
		if (a.data > b.data) {
			return 1;
		}
		// dates must be equal
		return 0;
	});
	var arrayLength = arr.length;
	for (var i = 0; i < arrayLength; i++) {
		if (1 > 0)
			$('#results').append('<br>');
		$('#results').append(arr[i].html);
	}

	var arrayLength = equipos.length;
	$('#results').append('<hr><b>Lista Favoritos</b><br>');
	for (var i = 0; i < arrayLength; i++) {
		checked='';
		if ( favoritos.indexOf(''+equipos[i].id) >= 0 ){
			checked = 'checked';
		}
		$('#results').append('<label>'
			+ '<input type="checkbox" '+checked+' value="' + equipos[i].id + '" onclick="setArrayCookie(this)">' + equipos[i].name
			+ '&nbsp;</label><br>'
		);
	}
	$('#results').append('<hr>');


	add_back('favoritos');
	end_page();
	hideLoading();
}

// Function to update the cookie when checkboxes are clicked
function setArrayCookie(checkbox) {
	// Get the current cookie values as an array
	var selectedItems = getCookieArray('favoritosItems');

	if (checkbox.checked) {
		// Add the checkbox value to the array if checked
		selectedItems.push(checkbox.value);
	} else {
		// Remove the checkbox value from the array if unchecked
		var index = selectedItems.indexOf(checkbox.value);
		if (index > -1) {
			selectedItems.splice(index, 1);
		}
	}

	// Set the updated array as a cookie
	console.log(JSON.stringify(selectedItems));
	setCookie('favoritosItems', JSON.stringify(selectedItems), 30);
}

async function get_data_equipo_async(cod_equipo) {
	var url = remote_url + "?type=getequipo&codequipo=" + cod_equipo;

	console.log("GET " + url);

	fetch(url)
		.then(response => {
			if (!response.ok) {
				throw new Error('Network response was not ok');  // Handle HTTP errors
			}
			return response.json();
		})
		.then(data => {
			if (data) {
				show_portada_equipo_favoritos(data.data, cod_equipo).forEach((element) => {
					$('#favoritos_tabla').append(element['html']);
			});

			} else {
				throw new Error('No data found in response');
			}
		})
		.catch(error => {
			console.error('Fetch error:', error.message);  // Log the error
		});
}

async function get_data_equipo(cod_equipo) {
	var url = remote_url + "?type=getequipo&codequipo=" + cod_equipo;

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
	map = {}
	var arr = [];

	if (data.competiciones_equipo.length > 0)
		jQuery.each(data.competiciones_equipo, function (index, item) {
			title = data.nombre_equipo + ' - ' + item.categoria;
			cont = 0;
			jQuery.each(item.partidos, function (index, item) {
				cont += 1
				var pattern = /(\d{2})\-(\d{2})\-(\d{4}) (\d{2})\:(\d{2})/;
				hora = item.fecha;
				if (item.hora)
					hora += ' ' + item.hora;
				else
					hora += ' 12:00'
				var date_obj = new Date(hora.replace(pattern, '$3-$2-$1 $4:$5'));
				var date_now_obj = new Date(Date.now())
				if (isSameWeek(date_obj, date_now_obj)) {
					lineas += 1;
					arr.push({
						data: date_obj.getTime(),
						html: show_portada_data_favoritos(title, item)
					});
					return false;
				}
				previous = item;
			});
		});
	else
		title = data.nombre_equipo;

	if (lineas == 0)
		head = title;
		var arrayLength = equipos.length;
    for (var i = 0; i < arrayLength; i++) {
    	if ( equipos[i].id == cod_equipo )
    	head = equipos[i].name;
    }
		arr.push({
			data: 33284008833000,
			html: '<table class="portada">'
				+ '<tr>'
				+ '<th colspan=2  align="absmiddle">' + head + '</th>'
				+ '</tr>'
				+ '<tr>'
				+ '<td bgcolor="#e8e5e4" colspan=2>Non hai datos</td>'
				+ '</table>'
		});

	return arr;

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

	return '<table class="portada">'
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
		+ '</table>';
}
