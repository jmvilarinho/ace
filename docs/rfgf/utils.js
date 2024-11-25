function update_vista(url = '') {
	if (url == '')
		url = window.location.href;

	const myArray = url.split("#");
	if (myArray.length >= 2) {
		const myArrayValues = myArray[1].split("/");
		pagina = myArrayValues[0];
		cod_equipo = myArrayValues[1];
		cod_grupo = myArrayValues[2];
		cod_competicion = myArrayValues[3];
		cod_club = myArrayValues[4];
		cod_campo = myArrayValues[5];
		cod_acta = myArrayValues[6];
	}

	if (typeof (pagina) == "undefined")
		pagina = getCookie('pagina');
	if (typeof (cod_equipo) == "undefined")
		cod_equipo = getCookie('cod_equipo');
	if (typeof (cod_grupo) == "undefined")
		cod_grupo = getCookie('cod_grupo');
	if (typeof (cod_competicion) == "undefined")
		cod_competicion = getCookie('cod_competicion');
	if (typeof (cod_club) == "undefined")
		cod_club = getCookie('cod_club');
	if (typeof (cod_campo) == "undefined")
		cod_campo = getCookie('cod_campo');
	if (typeof (cod_acta) == "undefined")
		cod_acta = getCookie('cod_acta');

	if (pagina) {
		switch (pagina) {
			case 'favoritos':
				load_favoritos(false);
				break;
			case 'calendario':
				load_calendario(false);
				break;
			case 'portada':
				load_portada(cod_equipo, false);
				break;
			case 'xornadas':
				load_xornadas(cod_equipo, false);
				break;
			case 'clasificacion':
				load_clasificacion(cod_grupo, cod_equipo, false);
				break;
			case 'resultados':
				load_resultados(cod_grupo, cod_equipo, '', false);
				break;
			case 'goleadores':
				load_goleadores(cod_competicion, cod_grupo, cod_equipo, false);
				break;
			case 'club':
				load_club(cod_club, false);
				break;
			case 'campo':
				load_campo(cod_campo, false);
				break;
			case 'acta':
				load_acta(cod_acta, false);
				break;
			case 'plantilla':
				load_plantilla(cod_equipo, false);
				break;
			default:
				load_favoritos(false);
		}
	} else {
		load_favoritos(false);
	}

}

function crea_botons(pagina, codigo_equipo, cod_grupo, cod_competicion) {
	if (pagina == 'back') {
		var boton_back = $('<input/>').attr({
			type: "button",
			class: 'back_button',
			id: "field",
			value: 'Volver',
			onclick: "history.back();"
		});
		$('#results').append(boton_back);
		return;
	}

	var boton_portada = $('<input/>').attr({
		type: "button",
		class: (pagina == 'portada') ? 'none' : "back_button",
		id: "field",
		value: 'Portada',
		onclick: "load_portada('" + codigo_equipo + "')"
	});
	$('#results').append(boton_portada);

	var boton_xornadas = $('<input/>').attr({
		type: "button",
		class: (pagina == 'xornadas') ? 'none' : "back_button",
		id: "field",
		value: 'Xornadas',
		onclick: "load_xornadas('" + codigo_equipo + "')"
	});
	$('#results').append(boton_xornadas);

	if (!version_reducida) {
		var boton_resultados = $('<input/>').attr({
			type: "button",
			class: (pagina == 'resultados') ? 'none' : "back_button",
			id: "field",
			value: 'Resultados',
			onclick: "load_resultados('" + cod_grupo + "','" + codigo_equipo + "','')"
		});
		$('#results').append(boton_resultados);

		var boton_clasificacion = $('<input/>').attr({
			type: "button",
			class: (pagina == 'clasificacion') ? 'none' : "back_button",
			id: "field",
			value: 'Clasificación',
			onclick: "load_clasificacion('" + cod_grupo + "','" + codigo_equipo + "')"
		});
		$('#results').append(boton_clasificacion);

		var boton_goleadores = $('<input/>').attr({
			type: "button",
			class: (pagina == 'goleadores') ? 'none' : "back_button",
			id: "field",
			value: 'Goleadores',
			onclick: "load_goleadores('" + cod_competicion + "','" + cod_grupo + "','" + codigo_equipo + "')"
		});
		$('#results').append(boton_goleadores);
	}
}


function add_back(pagina) {
	if (!pagina)
		pagina = '';
	if (!version_reducida) {
		var boton_club = $('<input/>').attr({
			type: "button",
			class: (pagina == 'clubs') ? 'none' : "back_button",
			id: "field",
			value: 'Clubs',
			onclick: "openNav2()"
		});
		$('#results').append(boton_club);
	}

	var boton_menu = $('<input/>').attr({
		type: "button",
		class: "back_button",
		id: "field",
		value: 'Equipos',
		onclick: "openNav()"
	});
	$('#results').append(boton_menu);

	var boton_favoritos = $('<input/>').attr({
		type: "button",
		class: (pagina == 'favoritos') ? 'none' : "back_button",
		id: "field",
		value: 'Favoritos',
		onclick: "load_favoritos()"
	});
	$('#results').append(boton_favoritos);

	var boton_calendario = $('<input/>').attr({
		type: "button",
		class: (pagina == 'calendario') ? 'none' : "back_button",
		id: "field",
		value: 'Calendario',
		onclick: "load_calendario()"
	});
	$('#results').append(boton_calendario);

	var boton_meteo = $('<input/>').attr({
		type: "button",
		class: "back_button",
		id: "field",
		value: 'Meteo',
		onclick: "openUrl('../')"
	});
	$('#results').append(boton_meteo);
}

function color_goles(background, cod_equipo, codequipo_casa, codequipo_fuera, goles_casa, goles_fuera) {
	color_resultado = background;
	if (goles_casa != "" && goles_fuera != "") {
		if (codequipo_casa == cod_equipo) {
			if (Number(goles_casa) > Number(goles_fuera))
				color_resultado = "#04B431";
			else if (Number(goles_casa) < Number(goles_fuera))
				color_resultado = "#F78181";
			else
				color_resultado = "#D7DF01";
		} else if (codequipo_fuera == cod_equipo) {
			if (Number(goles_fuera) > Number(goles_casa))
				color_resultado = "#04B431";
			else if (Number(goles_fuera) < Number(goles_casa))
				color_resultado = "#F78181";
			else
				color_resultado = "#D7DF01";
		}
	}
	return color_resultado;
}

function updatewitdh(id_table_1, id_table_2) {
	if ($("#" + id_table_2).length) {
		if ($("#" + id_table_1).width() > $("#" + id_table_2).width())
			maxWitdh = $("#" + id_table_1).width();
		else
			maxWitdh = $("#" + id_table_2).width();

		$("#" + id_table_1).css("width", maxWitdh + "px");
		$("#" + id_table_2).css("width", maxWitdh + "px");
	}
}

function getBackgroundColor(cont, isMy) {
	if (cont % 2)
		background = '#ffffff';
	else
		background = '#e8e5e4';
	if (isMy)
		background = '#B28E90';
	return background;
}

function getEquipoName(cod_equipo, defaultName) {
	var arrayLength = equipos.length;
	for (var i = 0; i < arrayLength; i++) {
		if (equipos[i].id == cod_equipo)
			return equipos[i].name;
	}
	if (typeof (defaultName) !== "undefined" && defaultName !== null && defaultName != "")
		return defaultName;
	else
		return 'undef';
}
function getEquipoColor(cod_equipo) {
	var arrayLength = equipos.length;
	for (var i = 0; i < arrayLength; i++) {
		if (equipos[i].id == cod_equipo)
			return equipos[i].color;
	}
	return 'Black';
}
function getEquipoDuracion(cod_equipo) {
	var arrayLength = equipos.length;
	for (var i = 0; i < arrayLength; i++) {
		if (equipos[i].id == cod_equipo)
			return equipos[i].duracion_min;
	}
	return 90;
}

function getClubName(cod_club, defaultName) {
	var arrayLength = clubs.length;
	for (var i = 0; i < arrayLength; i++) {
		if (clubs[i].id == cod_club)
			return clubs[i].name;
	}
	if (typeof (defaultName) !== "undefined" && defaultName !== null && defaultName != "")
		return defaultName;
	else
		return 'undef';
}


/* Set the width of the side navigation to 250px */
function openNav() {
	document.getElementById("mySidenav").style.width = "270px";
}

function openNav2() {
	document.getElementById("mySidenav2").style.width = "270px";
}

/* Set the width of the side navigation to 0 */
function closeNav(id = '0') {
	if (id != '0')
		load_portada(id);
	document.getElementById("mySidenav").style.width = "0";
}
/* Set the width of the side navigation to 0 */
function closeNav2(id = '0') {
	if (id != '0')
		load_club(id);
	document.getElementById("mySidenav2").style.width = "0";
}

function getWeekNumber(date) {
	const tempDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
	// Set the day to Thursday (the middle of the week) to avoid edge cases near year boundaries
	tempDate.setDate(tempDate.getDate() + 4 - (tempDate.getDay() || 7));

	// Calculate the first day of the year
	const yearStart = new Date(tempDate.getFullYear(), 0, 1);

	// Calculate the week number
	const weekNo = Math.ceil(((tempDate - yearStart) / 86400000 + 1) / 7);
	return weekNo;
}

function isSameWeek(date1, date2) {
	const year1 = date1.getFullYear();
	const year2 = date2.getFullYear();

	const week1 = getWeekNumber(date1);
	const week2 = getWeekNumber(date2);

	return year1 === year2 && week1 === week2;
}

// showing loading
function displayLoading() {
	loader = document.querySelector("#loading");
	loader.classList.add("display");

	window.scrollTo(0, 0);
	//$("#results").scrollTo(0,0);



	$("#spinner-div").show()
	// to stop loading after some time
	setTimeout(() => {
		hideLoading();
	}, 300000);
}

// hiding loading
async function hideLoading() {
	//const element = await waitForElementToExist('#endPage');
	loader = document.querySelector("#loading");
	loader.classList.remove("display");
	$("#spinner-div").hide();
}


function waitForElementToExist(selector) {
	return new Promise(resolve => {
		if (document.querySelector(selector)) {
			console.log('The element alrready exists');
		}

		const observer = new MutationObserver(() => {
			if (document.querySelector(selector)) {
				resolve(document.querySelector(selector));
				observer.disconnect();
				console.log('The element exists');
			}
		});

		observer.observe(document.body, {
			subtree: true,
			childList: true,
		});
	});
}
function show_error(data) {
	$('#error_msg').html('');
	try {
		if (data['is_ok'] != 'true') {
			console.error("Error : " + data['error']);
			timestr = getTimestamp(data['timestamp']);
			$('#error_msg').html(' <font color="red">(Erro obtendo información, datos do ' + timestr + ')</font>');
		}
	} catch (ex) {
		console.error("outer", ex.message);
	}
}

function getTimestamp(timestamp) {
	const pad = (n, s = 2) => (`${new Array(s).fill(0)}${n}`).slice(-s);
	const d = new Date(timestamp * 1000);

	return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${pad(d.getFullYear(), 4)} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function openInNewTab(url) {
	window.open(url, '_blank').focus();
}

function openUrl(url) {
	window.open(url, '_self').focus();
}

function end_page() {
	$('#results').append('<div id="endPage" style="display: none;"></div>');
}

function setCookie(name, value, days) {
	var expires = "";
	if (days) {
		var date = new Date();
		date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
		expires = "; expires=" + date.toUTCString();
	}
	document.cookie = name + "=" + (value || "") + expires + "; path=/;SameSite=Lax";
}
function getCookie(name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for (var i = 0; i < ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) == ' ') c = c.substring(1, c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
	}
	return null;
}

function getCookieArray(cname) {
	var cookieValue = getCookie(cname);
	return cookieValue ? JSON.parse(cookieValue) : [];
}

function eraseCookie(name) {
	document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

// Function to update the cookie when checkboxes are clicked
function setArrayCookie(name, checkbox) {
	// Get the current cookie values as an array
	var selectedItems = getCookieArray(name);

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
	setCookie(name, JSON.stringify(selectedItems), 365);
}
