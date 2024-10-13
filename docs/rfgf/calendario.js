var favorite_load = [];

var ec;

const colorNames = [
	"AliceBlue",
	"Black", "Blue", "BlueViolet",
	"Brown", "Chocolate", "Coral", "CornflowerBlue",
	"Crimson", "DarkBlue", "DarkCyan", "DarkGoldenRod", "DarkGray", "DarkGreen", "DarkKhaki",
	"DarkMagenta", "DarkOliveGreen", "DarkOrange", "DarkOrchid", "DarkRed", "DarkSalmon", "DarkSeaGreen",
	"DarkSlateBlue", "DarkSlateGray", "DarkTurquoise", "DarkViolet", "DeepPink", "DeepSkyBlue", "DimGray",
	"DodgerBlue", "FireBrick", "FloralWhite", "ForestGreen", "Fuchsia", "Gainsboro", "GhostWhite", "Gold",
	"GoldenRod", "Gray", "Green", "GreenYellow", "HoneyDew", "HotPink", "IndianRed", "Indigo", "Ivory",
	"Khaki", "Lavender", "LavenderBlush", "LawnGreen", "LemonChiffon", "LightBlue", "LightCoral", "LightCyan",
	"LightGoldenRodYellow", "LightGray", "LightGreen", "LightPink", "LightSalmon", "LightSeaGreen", "LightSkyBlue",
	"LightSlateGray", "LightSteelBlue", "LightYellow", "Lime", "LimeGreen", "Linen", "Magenta", "Maroon",
	"MediumAquaMarine", "MediumBlue", "MediumOrchid", "MediumPurple", "MediumSeaGreen", "MediumSlateBlue",
	"MediumSpringGreen", "MediumTurquoise", "MediumVioletRed", "MidnightBlue", "MintCream", "MistyRose",
	"Moccasin", "NavajoWhite", "Navy", "OldLace", "Olive", "OliveDrab", "Orange", "OrangeRed", "Orchid",
	"PaleGoldenRod", "PaleGreen", "PaleTurquoise", "PaleVioletRed", "PapayaWhip", "PeachPuff", "Peru", "Pink",
	"Plum", "PowderBlue", "Purple", "RebeccaPurple", "Red", "RosyBrown", "RoyalBlue", "SaddleBrown", "Salmon",
	"SandyBrown", "SeaGreen", "SeaShell", "Sienna", "Silver", "SkyBlue", "SlateBlue", "SlateGray", "Snow",
	"SpringGreen", "SteelBlue", "Tan", "Teal", "Thistle", "Tomato", "Turquoise", "Violet", "Wheat", "White",
	"WhiteSmoke", "Yellow", "YellowGreen"
];

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
	var arr = [];
	add_back('calendario');
	$('#results').append('<main class="row" style="white-space: wrap;" ><div id="ec" class="col"></div></main>');
	creaCalendario();


	$('#results').append('<div id="calendario_tabla"></div><div id="calendario_list"></div>');
	favorite_load = [];
	for (var i = 0; i < arrayLength; i++) {
		//Do something
		favorite_load.push(calendario[i]);
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
			checked = 'checked';
			bgcolor = 'bgcolor="' + equipos[i].color + '"';
		}
		html_fav += start + '<td class="table_noborder" ' + bgcolor + '><label>'
			+ '<input type="checkbox" ' + checked + ' value="' + equipos[i].id + '" onclick="setArrayCookie(\'calendarioItems\',this)">' + equipos[i].name
			+ '&nbsp;</label></td>' + end;

	}
	if (arrayLength % 2)
		html_fav += '</tr>'
	$('#results').append(html_fav + '</table><hr>');


	add_back('calendario');
	end_page();

	var x = 0;
	while (x < 60000) {
		if (favorite_load.length <= 0)
			break
		// sleep 300 ms
		await new Promise(r => setTimeout(r, 300));
		x += 500;
	}


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
		hiddenDays: [1, 2, 3, 4],
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
				show_portada_equipo_calendario(data.data, cod_equipo).forEach((element) => {
					$('#calendario_tabla').append(element['html']);
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

function show_portada_equipo_calendario(data, cod_equipo) {
	map = {}
	var arr = [];

	if (data.competiciones_equipo.length > 0)
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

						end = new Date(date_obj.getTime() + 105 * 60000);

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


						ec.addEvent(eventCalendar)

						return false;
					}
				}
			});
		});
	else
		title = data.nombre_equipo;


	return arr;
}

