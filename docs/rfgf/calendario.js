var ec;
var favorite_load = [];
var arr_datos = [];
var hay_datos = false;

function getSaturday(d) {
	d = new Date(d);
	var day = d.getDay(),
		diff = d.getDate() - day + (day == 1 ? -1 : 1); // adjust when day is sunday
	return new Date(d.setDate(diff));
}
firstEvent = getSaturday(new Date());


async function load_calendario() {
	displayLoading();
	setCookie('paginaRFGF', 'calendario', 30)

	calendario = getCookieArray('calendarioItems');
	if (calendario.length <= 0) {
		calendario = ["13810265", "10293316"];
	}
	setCookie('calendarioItems', JSON.stringify(calendario), 365);
	var arrayLength = calendario.length;

	$('#results').html('');
	add_back('calendario');
	$('#results').append('<main class="row" style="white-space: wrap;" ><div id="ec" class="col"></div></main>');

	creaCalendario();
	hay_datos = false;
	firstEvent = getSaturday(new Date());
	arr_datos = [];
	favorite_load = [];
	for (var i = 0; i < arrayLength; i++) {
		favorite_load.push(calendario[i]);
		// limita concurrencia a 6
		while (favorite_load.length > 6)
			await new Promise(r => setTimeout(r, 300));
		get_data_equipo_async_calendario(calendario[i])
	}

	var arrayLength = equipos.length;
	var html_fav = '<table class="table_noborder"><tr><th colspan=2 class="table_noborder">Equipos</th></tr>';
	for (var i = 0; i < arrayLength; i++) {
		var start = '';
		var end = '';
		if (!i % 2)
			start = '<tr>';
		if (i % 2)
			end = '</tr>'

		var checked = '';
		var bgcolor = '';
		if (calendario.indexOf('' + equipos[i].id) >= 0) {
			checked = 'checked="true"';
			bgcolor = 'bgcolor="' + equipos[i].color + '"';
		}
		html_fav += start + '<td class="table_noborder" ' + bgcolor + '>'
			+ '<div  id="label_' + equipos[i].id + '_color">'
			+ '<input type="checkbox" ' + checked + ' value="' + equipos[i].id + '" onclick="setArrayCookie(\'calendarioItems\',this)">' + equipos[i].name + '&nbsp;'
			+ '</div></td>' + end;
	}
	if (arrayLength % 2)
		html_fav += '</tr>'
	$('#results').append(html_fav + '<tr><td class="table_noborder" colspan=2 align="center">(Nome en cor branco si hai datos)</td></tr></table><hr>');

	var x = 0;
	while (x < 60000) {
		if (favorite_load.length <= 0)
			break
		// sleep 300 ms
		await new Promise(r => setTimeout(r, 300));
		x += 500;
	}

	var arrayLength = arr_datos.length;
	for (var i = 0; i < arrayLength; i++) {
		var html = $(arr_datos[i]).html();
		$(arr_datos[i]).css('color', 'white');
		$(arr_datos[i]).html(html);
		console.log('Set white: #label_color: "' + i + '" ' + html);
		//Do something
	}


	// Ocultar en el calendario los días hasta sabado si no hay eventos
	if (hay_datos) {
		hiddenDays = [];
		for (var x = 1; x < firstEvent.getDay(); x++) {
			hiddenDays.push(x);
		}
		ec.setOption('hiddenDays', hiddenDays);
	}

	add_back('calendario');
	end_page();
	hideLoading();
}

function creaCalendario() {
	// https://github.com/vkurko/calendar
	ec = new EventCalendar(document.getElementById('ec'), {
		view: 'timeGridWeek',
		headerToolbar: {
			start: '',
			center: 'title',
			end: ''
		},
		//resources: [
		//	{ id: 1, title: 'Resource A' }
		//],
		//scrollTime: '09:00:00',
		slotMinTime: '09:00:00',
		//hiddenDays: [1, 2, 3, 4],
		views: {
			timeGridWeek: { pointer: true },
			resourceTimeGridWeek: { pointer: true },
			resourceTimelineWeek: {
				pointer: true,
				slotMinTime: '09:00',
				slotMaxTime: '21:00',
				slotWidth: 80,

			}
		},
		eventClick: function (info) {
			load_portada_equipo(info.event.id);
		},
		flexibleSlotTimeLimits: true,
		dayMaxEvents: true,
		nowIndicator: true,
		selectable: false,
		firstDay: 1,
		allDaySlot: false,
		displayEventEnd: false,
		editable: false,
		slotEventOverlap: false
	});
}


async function get_data_equipo_async_calendario(cod_equipo) {
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
				show_portada_equipo_calendario(data.data, cod_equipo);
				favorite_load.pop();
			} else {
				favorite_load.pop();
				throw new Error('No data found in response');
			}
		})
		.catch(error => {
			favorite_load.pop();
			console.error('Get equipo "' + cod_equipo + '" error:', error.message);  // Log the error
		});
}

function show_portada_equipo_calendario(data, cod_equipo) {
	if (data.competiciones_equipo.length > 0) {

		arr_datos.push('#label_' + cod_equipo + '_color');

		jQuery.each(data.competiciones_equipo, function (index, item) {
			nombre_equipo = getEquipoName(cod_equipo, data.nombre_equipo);

			cont = 0;
			jQuery.each(item.partidos, function (index, item) {
				cont += 1
				var pattern = /(\d{2})\-(\d{2})\-(\d{4}) (\d{2})\:(\d{2})/;
				hora = item.fecha;
				if (item.hora) {
					hora += ' ' + item.hora;
					var date_obj = new Date(hora.replace(pattern, '$3-$2-$1 $4:$5'));
					var date_now_obj = new Date(Date.now())
					if (isSameWeek(date_obj, date_now_obj)) {
						if (date_obj < firstEvent)
							firstEvent = date_obj;
						end = new Date(date_obj.getTime() + getEquipoDuracion(cod_equipo) * 60000);
						eventCalendar = {
							start: date_obj,
							end: end,
							id: cod_equipo,
							editable: false,
							startEditable: false,
							durationEditable: false,
							title: {
								html: nombre_equipo
							},
							styles: ['font-size: 8px;'],
							color: getEquipoColor(cod_equipo),
						};
						ec.addEvent(eventCalendar);
						hay_datos = true;
					}
				}
			});
		});
	}
	return true;

}

