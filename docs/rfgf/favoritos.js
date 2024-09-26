var favorite_load = [];

async function load_favoritos() {
	displayLoading();
	setCookie('paginaRFGF', 'favoritos', 30)

	favoritos = getCookieArray('favoritosItems');
	if (favoritos.length <= 0) {
		favoritos = ["13810265", "10293316"];
	}
	setCookie('favoritosItems', JSON.stringify(favoritos), 365);
	var arrayLength = favoritos.length;

	$('#results').html('');
	var arr = [];
	add_back('favoritos');
	$('#results').append('<div id="favoritos_tabla"></div><div id="favoritos_list"></div>');
	favorite_load = [];
	for (var i = 0; i < arrayLength; i++) {
		//Do something
		favorite_load.push(favoritos[i]);
		get_data_equipo_async(favoritos[i])
	}

	var arrayLength = equipos.length;
	var html_fav = '<hr><table class="table_noborder"><tr><th colspan=2 class="table_noborder">Lista Favoritos</th></tr>';
	for (var i = 0; i < arrayLength; i++) {
		var start = '';
		var end = '';
		if (!i % 2)
			start = '<tr>';
		if (i % 2)
			end = '</tr>'

		var checked = '';
		if (favoritos.indexOf('' + equipos[i].id) >= 0) {
			checked = 'checked';
		}
		html_fav += start + '<td class="table_noborder"><label>'
			+ '<input type="checkbox" ' + checked + ' value="' + equipos[i].id + '" onclick="setArrayCookie(this)">' + equipos[i].name
			+ '&nbsp;</label></td>' + end;

	}
	if (arrayLength%2)
		html_fav += '</tr>'
	$('#results').append(html_fav+'</table><hr>');


	add_back('favoritos');
	end_page();

	var x = 0;
	while (x < 60000) {
		if (favorite_load.length <= 0)
			break
		// sleep 300 ms
		await new Promise(r => setTimeout(r, 300));
		x += 500;
	}

	//Ordenar resultados
	try {
		var toSort = document.getElementById('favoritos_tabla').children;
		toSort = Array.prototype.slice.call(toSort, 0);
		toSort.sort(function (a, b) {
			var aord = +a.id;
			var bord = +b.id;
			return aord - bord;
		});
		const parentElement = document.getElementById('favoritos_tabla');
		toSort.forEach(element => parentElement.appendChild(element));
	} catch (e) {
		console.log(e);
	}
	hideLoading();
}

async function get_data_equipo_async(cod_equipo) {
	var url = remote_url + "?type=getequipo&codequipo=" + cod_equipo;

	console.log("GET " + url);

	fetch(url)
		.then(response => {
			if (!response.ok) {
				favorite_load.pop();
				throw new Error('Network response was not ok');  // Handle HTTP errors
			}
			return response.json();
		})
		.then(data => {
			if (data) {
				show_portada_equipo_favoritos(data.data, cod_equipo).forEach((element) => {
					$('#favoritos_tabla').append(element['html']);
				});
				favorite_load.pop();
			} else {
				favorite_load.pop();
				throw new Error('No data found in response');
			}
		})
		.catch(error => {
			favorite_load.pop();
			console.error('Fetch error:', error.message);  // Log the error
		});
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
						html: show_portada_data_favoritos(title, item, date_obj.getTime())
					});
					return false;
				}
				previous = item;
			});
		});
	else
		title = data.nombre_equipo;

	if (lineas == 0) {
		head = title;
		var arrayLength = equipos.length;
		for (var i = 0; i < arrayLength; i++) {
			if (equipos[i].id == cod_equipo)
				head = equipos[i].name;
		}
		arr.push({
			data: 33284008833000,
			html: '<table id="33284008833000" class="portada">'
				+ '<tr>'
				+ '<th colspan=2  align="absmiddle">' + head + '</th>'
				+ '</tr>'
				+ '<tr>'
				+ '<td bgcolor="#e8e5e4" colspan=2>Non hai datos</td>'
				+ '</table>'
		});
	}

	return arr;
}

function show_portada_data_favoritos(title, item, id) {
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

	return '<table id="' + id + '" class="portada">'
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

