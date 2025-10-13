async function load_portada(cod_equipo, addHistory = true, rfef = false, codgrupo = '', codcompeticion = '') {
	displayLoading();
	setCookie('paginaRFGF', 'portada', 30)
	setCookie('cod_equipo', cod_equipo, 30)
	if (addHistory)
		history.pushState(null, "", '#portada/' + cod_equipo);

	var url = remote_url + "?type=getequipo&codequipo=" + cod_equipo;
	codgrupo = getEquipoGrupo(cod_equipo,codgrupo)
	if (codgrupo) {
		url += "&codgrupo=" + codgrupo;
	}
	codcompeticion = getEquipoCompeticion(cod_equipo,codcompeticion)
	if (codcompeticion) {
		url += "&codcompeticion=" + codcompeticion;
	}
	if (isRFEF(cod_equipo) || rfef) {
		url += "&rfef=1";
		rfef = true;
	}

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
				//console.log(data);
				show_error(data);
				$('#results').html('');
				if ('src_url' in data['data']) {
					$('#ref_msg').html('<p style="font-size:12px;"><a href="' + data['data']['src_url'] + '" target="copyright" rel="noopener">Información obtida de fontes oficiais</a></p>');
				}
				add_back();
				show_portada_equipo(data.data, cod_equipo, rfef);
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

async function load_tv_player(url) {
	var url_search = 'https://streamer-cdn.ott.tiivii.com/v2/sgca/ott_tiivii/search?sort=-created_on&page=1&limit=100&searchin=title,tags&filter[status]=published&filter[value][contains]=Jogafan';

	await fetch(url_search)
		.then(response => {
			if (!response.ok) {
				throw new Error('Network response was not ok');  // Handle HTTP errors
			}
			return response.json();
		})
		.then(data => {
			if (data) {
				//console.log(data);
				if (data.data.length > 0) {
					found = false;
					i = 0
					while (i < data.data.length && !found) {
						element = data.data[i];
						tvUrl = '<a href="' + url + element.id + '" target="_blank"><img class="escudo_widget" src=../img/television-icon-22175.png></a>';
						try {
							if (element.configuration != null && element.configuration.videoresources.nimble_urls.ssl_hls != undefined) {
								found = true;
								//console.log(element.configuration.streaming);
								tvUrl += ' - <a href=\'javascript:showVideo("' + element.configuration.videoresources.nimble_urls.ssl_hls + '");\'>' + element.title + '</a>';
							}


						} catch (e) {
							console.log(e);
						}
						i += 1;
					}
					$('#tvplayer').html(tvUrl);
				}
			} else {
				throw new Error('No data found in response');
			}
		})
		.catch(error => {
			console.error('Fetch error:', error.message);  // Log the error
		});
}

async function showVideo(url) {
	var video = document.getElementById('video');

	document.getElementById('video_div').style.visibility = "visible";
	document.getElementById('video_div').style.height = "auto";

	video.width = $(document).width();

	if (Hls.isSupported()) {
		console.log(url);
		var hls = new Hls({
			debug: false,
		});
		hls.loadSource(url);
		hls.attachMedia(video);
		hls.on(Hls.Events.MEDIA_ATTACHED, function () {
			video.muted = false;
			video.play();
		});
	}
	// hls.js is not supported on platforms that do not have Media Source Extensions (MSE) enabled.
	// When the browser has built-in HLS support (check using `canPlayType`), we can provide an HLS manifest (i.e. .m3u8 URL) directly to the video element through the `src` property.
	// This is using the built-in support of the plain video element, without using hls.js.
	else if (video.canPlayType('application/vnd.apple.mpegurl')) {
		video.src = url;
		video.addEventListener('canplay', function () {
			video.play();
		});
	}

}

function show_portada_equipo(data, cod_equipo, rfef = false) {
	lineas = 0;
	$('#results').append('<br>');
	mostrado = false;

	jQuery.each(data.competiciones_equipo, function (index, item) {
		lineas += 1;
		if (lineas > 1)
			$('#results').append('<br><hr>');

		setCookie('nombre_equipo', data.nombre_equipo, 30)
		tvUrl = getEquipoTV(cod_equipo, '');
		if (tvUrl != '') {
			tvdiv = '<div id=tvplayer><a href="' + tvUrl + '" target="_blank"><img class="escudo_widget" src=../img/television-icon-22175.png></a></div>';
			load_tv_player(tvUrl);
			video_layer = '<div id="video_div" style="height: 0px;visibility: hidden"><video controls id="video" width="640"><source /><p>Your browser does not support H.264/MP4.</p></video></div>';
			tvdiv += video_layer;

		} else {
			tvdiv = '';
		}
		$('#results').append(data.nombre_equipo + ' - <b>' + item.competicion + '</b> ' + tvdiv + '<br>');
		if (!version_reducida) {
			var boton_plantilla = $('<input/>').attr({
				type: "button",
				class: "back_button",
				id: "field",
				value: 'Plantilla',
				onclick: "load_plantilla('" + cod_equipo + "')"
			});
			$('#results').append(boton_plantilla);
		}
		crea_botons('portada', cod_equipo, item.cod_grupo, item.cod_competicion,rfef);

		ultima = item.ultima_jornada_jugada;
		cont = 0;
		previous = undefined;
		jQuery.each(item.partidos, function (index, item2) {
			cont += 1
			var pattern = /(\d{2})\-(\d{2})\-(\d{4})/;
			var dt = new Date(item2.fecha.replace(pattern, '$3-$2-$1 12:00'));
			var now = new Date(Date.now());
			//now = new Date('18-03-2024'.replace(pattern, '$3-$2-$1 12:00'));
			if (isSameWeek(dt, now)) {
				if (mostrado) {
					$('#results').append('<hr>');
				}
				mostrado = true;
				show_portada_data('Xornada actual (#' + item2.nombre_jornada + ')', 'main_table_1', item2, item.cod_competicion, item.cod_grupo, data.nombre_equipo, cod_equipo, rfef);

				if (previous) {
					$('#results').append('<br>');
					show_portada_data('Xornada anterior (#' + previous.nombre_jornada + ')', 'main_table_2', previous, undefined, undefined, undefined, cod_equipo, rfef);
				}
				//return false;
			}
			previous = item2;
		});
	});

	updatewitdh("main_table_1", "main_table_2");

	if (lineas == 0) {
		var arrayLength = equipos.length;
		nombre = ''
		for (var i = 0; i < arrayLength; i++) {
			if (equipos[i].id == cod_equipo)
				nombre = 'para ' + equipos[i].name;
		}
		$('#results').append('<br><br><b>Equipo:</b> ' + data.nombre_equipo + '<br><br><b>Non hai datos ' + nombre + '</b><br><br><br>');
	} else if (!mostrado) {
		var arrayLength = equipos.length;
		nombre = ''
		for (var i = 0; i < arrayLength; i++) {
			if (equipos[i].id == cod_equipo)
				nombre = 'para ' + equipos[i].name;
		}
		$('#results').append('<br><br><b>Equipo:</b> ' + data.nombre_equipo + '<br><br><b>Non hai competición esta semán ' + nombre + '</b><br><br><br>');
	}
}

function dia_semana(fecha) {
	var pattern = /(\d{2})\-(\d{2})\-(\d{4})/;
	var dt = new Date(fecha.replace(pattern, '$3-$2-$1 12:00'));
	days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
	return days[dt.getDay()]; // "Friday"
}

function dia_semana_sp(fecha) {
	var pattern = /(\d{2})\/(\d{2})\/(\d{4})/;
	var dt = new Date(fecha.replace(pattern, '$3-$2-$1 12:00'));
	days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
	return days[dt.getDay()]; // "Friday"
}


function show_portada_data(title, id_tabla, item, codcompeticion, codgrupo, nombre_equipo, cod_equipo, rfef = false) {
	if (codcompeticion) {
		br = '<br><br>';
		align = 'center';
	} else {
		br = '&nbsp;&nbsp;';
		align = 'left';
	}

	campo = '';
	if (item.equipo_casa == 'Descansa' || item.equipo_fuera == 'Descansa') {
		dia_str = item.fecha.replace(/-/g, "/");
	} else {
		if (item.hora)
			hora = ' - ' + item.hora;
		else
			hora = ' ???';
		dia_str = item.fecha.replace(/-/g, "/") + hora + ' (' + dia_semana(item.fecha) + ')';

		if (item.campo != '') {
			//campo = '<a href="https://waze.com/ul?q=' + encodeURIComponent(item.campo) + '&navigate=yes" target="_blank">' + item.campo + '</a> <img src="../img/waze.png" height="15px">';
			//campo = '<a href="https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(item.campo) + '" target="_blank">' + item.campo + '</a> <img src="../img/dot.png" height="15px">';
			campo = '<a href="https://maps.google.com?q=' + encodeURIComponent(item.codigo_postal_campo + ' ' + item.direccion_campo + ' ' + item.campo) + '" target="_blank">' + item.campo + '</a> <img src="../img/dot.png" height="15px">';
		}
	}

	casa = ''
	fuera = ''
	if (item.equipo_casa != 'Descansa') {
		if (item.escudo_equipo_casa != '')
			casa = '<a href="javascript:load_plantilla(\'' + item.codequipo_casa + '\')" title="Plantilla">'
				+ '<img src="https://www.futgal.es' + item.escudo_equipo_casa + '" align="absmiddle" class="escudo_logo">' + '</a>' + br;

		if (item.codequipo_casa != '')
			casa += '&nbsp;<a href="javascript:load_xornadas(\'' + item.codequipo_casa + '\',false,' + rfef + ',\'' + codgrupo + '\',\'' + codcompeticion + '\')">' + item.equipo_casa + '</a>';
		else
			casa += '&nbsp;' + item.equipo_casa + '&nbsp;';

	} else {
		casa = '&nbsp;' + item.equipo_casa + '&nbsp;';
	}

	if (item.equipo_fuera != 'Descansa') {
		if (item.escudo_equipo_fuera != '')
			fuera = '<a href="javascript:load_plantilla(\'' + item.codequipo_fuera + '\')" title="Plantilla">'
				+ '<img src="https://www.futgal.es' + item.escudo_equipo_fuera + '" align="absmiddle" class="escudo_logo">' + '</a>' + br;

		if (item.codequipo_fuera != '')
			fuera += '&nbsp;<a href="javascript:load_xornadas(\'' + item.codequipo_fuera + '\',false,' + rfef + ',\'' + codgrupo + '\',\'' + codcompeticion + '\')">' + item.equipo_fuera + '</a>';
		else
			fuera += '&nbsp;' + item.equipo_fuera + '&nbsp;';

	} else {
		fuera = '&nbsp;' + item.equipo_fuera + '&nbsp;';
	}

	if (codcompeticion && !(item.equipo_casa == 'Descansa' || item.equipo_fuera == 'Descansa')) {
		span = 1;
		data1 = '<td bgcolor="white"><div id="data_casa"></div></td>';
		data2 = '<td bgcolor="white"><div id="data_fuera"></div></td>';
		data3 = '<tr><th colspan=3>Histórico</th></tr><tr><td class="table_noborder" colspan=3 align="center"><div id="historico">(non hai datos)</div></td></tr>';
	} else {
		span = 2;
		data1 = '';
		data2 = '';
		data3 = '';
	}

	if (item.goles_casa == "" && item.goles_fuera == "") {
		datos = '<tr>'
			+ '<td style="text-align:' + align + ';" bgcolor="white" colspan=' + span + '>' + casa + '</td>'
			+ data1
			+ '</tr>'
			+ '<tr>'
			+ '<td style="text-align:' + align + ';" bgcolor="white" colspan=' + span + '>' + fuera + '</td>'
			+ data2
			+ '</tr>';

	} else {
		color_resultado = color_goles('white', cod_equipo, item.codequipo_casa, item.codequipo_fuera, item.goles_casa, item.goles_fuera);


		if (item.partido_en_juego == '1')
			xogo = '<br>(en xogo)';
		else
			xogo = '';

		if (item.codacta != '')
			click = '  title="Acta" onclick="javascript:load_acta(\'' + item.codacta + '\');" ';
		else
			click = '';


		datos = '<tr>'
			+ '<td style="text-align:' + align + ';" bgcolor="white" colspan=' + span + '>' + casa + '</td>'
			+ data1
			+ '<td ' + click + ' bgcolor="white" style="background-color:' + color_resultado + ';" align="center">&nbsp;' + item.goles_casa + xogo + '&nbsp;</td>'
			+ '</tr>'
			+ '<tr>'
			+ '<td style="text-align:' + align + ';" bgcolor="white" colspan=' + span + '>' + fuera + '</td>'
			+ data2
			+ '<td ' + click + ' bgcolor="white" style="background-color:' + color_resultado + ';" align="center">&nbsp;' + item.goles_fuera + xogo + '&nbsp;</td>'
			+ '</tr>';
	}

	$('#results').append('<table id="' + id_tabla + '" class="table_noborder">'
		+ '<tr>'
		+ '<th colspan=3  align="absmiddle">' + title + '</th>'
		+ '</tr>'
		+ '<tr>'
		+ '<td bgcolor="#e8e5e4" colspan=3><b>Data:</b>&nbsp;' + dia_str + '</td>'
		+ '</tr>'
		+ '<tr>'
		+ '<td bgcolor="#e8e5e4" colspan=3><b>Campo:</b>&nbsp;' + campo + '</td>'
		+ '</tr>'
		+ datos
		+ data3
		+ '</table>');

	if (codcompeticion && !(item.equipo_casa == 'Descansa' || item.equipo_fuera == 'Descansa') && !version_reducida)
		load_comparativa(codcompeticion, codgrupo, item.codequipo_casa, item.codequipo_fuera, nombre_equipo)
}



async function load_comparativa(codcompeticion, codgrupo, equipo1, equipo2, nombre_equipo) {
	var url = remote_url + "?type=getcomparativa&codcompeticion=" + codcompeticion + "&codgrupo=" + codgrupo + "&equipo1=" + equipo1 + "&equipo2=" + equipo2;

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
				show_comparativa(data.data, nombre_equipo);
				updatewitdh("main_table_1", "main_table_2");
			} else {
				throw new Error('No data found in response');
			}
		})
		.catch(error => {
			console.error('Fetch error:', error.message);  // Log the error
		});
}

function show_comparativa(data, nombre_equipo) {

	racha1 = '';
	jQuery.each(data.racha_partidos_equipo1, function (indexr, itemr) {
		racha1 += '<span style="background-color:' + itemr.color + ';" class="racha">' + itemr.tipo + '</span>';
	});
	racha2 = '';
	jQuery.each(data.racha_partidos_equipo2, function (indexr, itemr) {
		racha2 += '<span style="background-color:' + itemr.color + ';" class="racha">' + itemr.tipo + '</span>';
	});

	if (data.historico_enfrentamientos.length > 0) {
		historico = '<table class="table_noborder_simple" style="width:100%;">';
		cont = 0;
		jQuery.each(data.historico_enfrentamientos, function (index, item) {
			if (cont % 2)
				background = '#ffffff';
			else
				background = '#e8e5e4';
			cont += 1

			if (item.equipo_casa == nombre_equipo)
				casa = '<b>' + item.equipo_casa + '</b>';
			else
				casa = item.equipo_casa
			if (item.equipo_fuera == nombre_equipo)
				fuera = '<b>' + item.equipo_fuera + '</b>';
			else
				fuera = item.equipo_fuera

			color_resultado = background;
			if (item.goles_casa != "" && item.goles_fuera != "") {
				if (item.equipo_casa == nombre_equipo) {
					if (Number(item.goles_casa) > Number(item.goles_fuera))
						color_resultado = "#04B431";
					else if (Number(item.goles_casa) < Number(item.goles_fuera))
						color_resultado = "#F78181";
					else
						color_resultado = "#D7DF01";
				} else if (item.equipo_fuera == nombre_equipo) {
					if (Number(item.goles_fuera) > Number(item.goles_casa))
						color_resultado = "#04B431";
					else if (Number(item.goles_fuera) < Number(item.goles_casa))
						color_resultado = "#F78181";
					else
						color_resultado = "#D7DF01";
				}
			}

			historico += '<tr>'
				+ '<td align="center" bgcolor="' + background + '" class="table_noborder_simple">' + item.temporada + ',&nbsp;</td>'
				+ '<td bgcolor="' + background + '" class="table_noborder_simple" align="right">' + casa + '</td>'
				+ '<td bgcolor="' + color_resultado + '" class="table_noborder_simple" align="center" >&nbsp;&nbsp;' + item.goles_casa + '&nbsp;&nbsp;-&nbsp;&nbsp;' + item.goles_fuera + '&nbsp;&nbsp;</td>'
				+ '<td bgcolor="' + background + '" class="table_noborder_simple">' + fuera + '</td>'
				+ '</tr>';
		});
		historico += '</table>';
		$('#historico').html(historico);
	}

	stats1 = '<table><thead>'
		+ '<tr>'
		+ '<td class="table_noborder"></th>'
		+ '<td class="table_noborder">Total</th>'
		+ '<td class="table_noborder">&nbsp;&nbsp;&nbsp;</th>'
		+ '<td class="table_noborder">Local&nbsp;&nbsp;</th>'
		+ '<td class="table_noborder">Visitante</th>'
		+ '</tr></thead>'
		+ '<tbody>'
		+ '  <tr>'
		+ '<th class="table_noborder" align="center">Goles</td>'
		+ '<td class="table_noborder" align="center">' + data.total_goles_equipo1 + '</td>'
		+ '<td class="table_noborder" align="center"></td>'
		+ '<td class="table_noborder" align="center">' + data.total_goles_equipo1_local + '</td>'
		+ '<td class="table_noborder" align="center">' + data.total_goles_equipo1_visitante + '</td>'
		+ '</tr>'
		+ '<tr>'
		+ '    <th class="table_noborder" align="center">Media</td>'
		+ '<td class="table_noborder" align="center">' + data.total_goles_media_equipo1 + '</td>'
		+ '<td class="table_noborder" align="center"></td>'
		+ '<td class="table_noborder" align="center">' + data.total_goles_media_equipo1_local + '</td>'
		+ '<td class="table_noborder" align="center">' + data.total_goles_media_equipo1_visitante + '</td>'
		+ '</tr>'
		+ '</tbody>'
		+ '</table>';

	$('#data_casa').append('<table class="table_noborder" >'
		+ '<tr>'
		+ '<th class="table_noborder" align="center">' + data.posicion_equipo1 + "º (" + data.puntos_equipo1 + ' pts)<br><br></th>'
		+ '</tr>'
		+ '<tr><td class="table_noborder">' + racha1 + '</td></tr>'
		+ '<tr>'
		+ '<td class="table_noborder">' + stats1 + '</td>'
		+ '</tr>'
		+ '</table>'
	);

	stats2 = '<table><thead>'
		+ '<tr>'
		+ '<td class="table_noborder"></th>'
		+ '<td class="table_noborder">Total</th>'
		+ '<td class="table_noborder">&nbsp;&nbsp;&nbsp;</th>'
		+ '<td class="table_noborder">Local&nbsp;&nbsp;</th>'
		+ '<td class="table_noborder">Visitante</th>'
		+ '</tr></thead>'
		+ '<tbody>'
		+ '  <tr>'
		+ '<th class="table_noborder" align="center">Goles</td>'
		+ '<td class="table_noborder" align="center">' + data.total_goles_equipo2 + '</td>'
		+ '<td class="table_noborder" align="center"></td>'
		+ '<td class="table_noborder" align="center">' + data.total_goles_equipo2_local + '</td>'
		+ '<td class="table_noborder" align="center">' + data.total_goles_equipo2_visitante + '</td>'
		+ '</tr>'
		+ '<tr>'
		+ '    <th class="table_noborder" align="center">Media</td>'
		+ '<td class="table_noborder" align="center">' + data.total_goles_media_equipo2 + '</td>'
		+ '<td class="table_noborder" align="center"></td>'
		+ '<td class="table_noborder" align="center">' + data.total_goles_media_equipo2_local + '</td>'
		+ '<td class="table_noborder" align="center">' + data.total_goles_media_equipo2_visitante + '</td>'
		+ '</tr>'
		+ '</tbody>'
		+ '</table>';

	$('#data_fuera').append('<table class="table_noborder" >'
		+ '<tr>'
		+ '<th class="table_noborder" align="center">' + data.posicion_equipo2 + "º (" + data.puntos_equipo2 + ' pts)<br><br></th>'
		+ '</tr>'
		+ '<tr><td class="table_noborder">' + racha2 + '</td></tr>'
		+ '<tr>'
		+ '<td class="table_noborder">' + stats2 + '</td>'
		+ '</tr>'
		+ '</table>'
	);

}
