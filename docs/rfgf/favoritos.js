var favorite_load = [];

async function load_favoritos(addHistory = true) {
	displayLoading();
	setCookie('paginaRFGF', 'favoritos', 30)
	if (addHistory)
		history.pushState(null, "", '#favoritos');

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
		favorite_load.push(favoritos[i]);
		// limita concurrencia a 6
		while (favorite_load.length > 6)
			await new Promise(r => setTimeout(r, 300));
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
			+ '<input type="checkbox" ' + checked + ' value="' + equipos[i].id + '" onclick="setArrayCookie(\'favoritosItems\',this)">' + equipos[i].name
			+ '&nbsp;</label></td>' + end;

	}
	if (arrayLength % 2)
		html_fav += '</tr>'
	$('#results').append(html_fav + '</table><hr>');


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
				show_error(data);
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
					hora += ' 23:55'
				var date_obj = new Date(hora.replace(pattern, '$3-$2-$1 $4:$5'));
				var date_now_obj = new Date(Date.now())
				if (isSameWeek(date_obj, date_now_obj)) {
					lineas += 1;
					arr.push({
						data: date_obj.getTime(),
						html: show_portada_data_favoritos(title, cod_equipo, item, date_obj.getTime())
					});
					return false;
				}
				previous = item;
			});
		});
	else
		title = data.nombre_equipo;

	if (lineas == 0) {
		head = getEquipoName(cod_equipo, title);
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

function show_portada_data_favoritos(title, cod_equipo, item, id) {

	campo = '';
	if (item.equipo_casa == 'Descansa' || item.equipo_fuera == 'Descansa') {
		dia_str = item.fecha.replace(/-/g, "/");
		id = "33284008833000";
	} else {
		if (item.hora) {
			dia_str = item.fecha.replace(/-/g, "/") + ' - ' + item.hora + ' (' + dia_semana(item.fecha) + ')';
		} else {
			dia_str = item.fecha.replace(/-/g, "/") + ' ???';
		}

		if (item.campo != '') {
			//campo = '<a href="https://waze.com/ul?q=' + encodeURIComponent(item.campo) + '&navigate=yes" target="_blank">' + item.campo + '</a> <img src="../img/waze.png" height="15px">';
			//campo = '<a href="https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(item.campo) + '" target="_blank">' + item.campo + '</a> <img src="../img/dot.png" height="15px">';
			campo = '<a href="https://maps.google.com?q=' + encodeURIComponent(item.campo) + '" target="_blank">' + item.campo + '</a> <img src="../img/dot.png" height="15px">';
		}
	}

	if (item.equipo_casa != 'Descansa' && item.escudo_equipo_casa != '') {
		casa = '<a href="javascript:load_portada(\'' + item.codequipo_casa + '\')">' + item.equipo_casa + '</a>';
		casa = '<a href="javascript:load_plantilla(\'' + item.codequipo_casa + '\')" title="Plantilla">'
			+ '<img src="https://www.futgal.es' + item.escudo_equipo_casa + '" align="absmiddle" class="escudo_logo_medio"></a>&nbsp;&nbsp;' + casa + '&nbsp;';
	} else {
		casa = '&nbsp;' + item.equipo_casa + '&nbsp;';
	}

	if (item.equipo_fuera != 'Descansa' && item.escudo_equipo_fuera != '') {
		fuera = '<a href="javascript:load_portada(\'' + item.codequipo_fuera + '\')">' + item.equipo_fuera + '</a>';
		fuera = '<a href="javascript:load_plantilla(\'' + item.codequipo_fuera + '\')" title="Plantilla">'
			+ '<img src="https://www.futgal.es' + item.escudo_equipo_fuera + '" align="absmiddle" class="escudo_logo_medio"></a>&nbsp;&nbsp;' + fuera + '&nbsp;';
	} else {
		fuera = '&nbsp;' + item.equipo_fuera + '&nbsp;';
	}

	if (item.goles_casa == "" && item.goles_fuera == "") {
		datos = '<tr>'
			+ '<td bgcolor="white" colspan=2>' + casa + '</td>'
			+ '</tr>'
			+ '<tr>'
			+ '<td bgcolor="white" colspan=2>' + fuera + '</td>'
			+ '</tr>';

	} else {
		color_resultado = color_goles('white', cod_equipo, item.codequipo_casa, item.codequipo_fuera, item.goles_casa, item.goles_fuera);

		if (item.partido_en_juego == '1')
			xogo = '<br>(en xogo)';
		else
			xogo = '';

		if (item.codacta != '')
			click = ' title="Acta" onclick="javascript:load_acta(\'' + item.codacta + '\');" ';
		else
			click = '';


		datos = '<tr>'
			+ '<td bgcolor="white">' + casa + '</td>'
			+ '<td ' + click + ' bgcolor="white" style="background-color:' + color_resultado + ';" align="center">&nbsp;' + item.goles_casa + '&nbsp;' + xogo + '</td>'
			+ '</tr>'
			+ '<tr>'
			+ '<td bgcolor="white">' + fuera + '</td>'
			+ '<td ' + click + ' bgcolor="white" style="background-color:' + color_resultado + ';" align="center">&nbsp;' + item.goles_fuera + '&nbsp;' + xogo + '</td>'
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
		+ '<td bgcolor="#e8e5e4" colspan=2><b>Campo:</b>&nbsp;' + campo + '</td>'
		+ '</tr>'
		+ datos
		+ '<tr>'
		+ '<td class="table_noborder">&nbsp;</td>'
		+ '</tr>'
		+ '</table>';
}

