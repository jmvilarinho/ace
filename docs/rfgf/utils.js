/* Set the width of the side navigation to 250px */
function openNav() {
	document.getElementById("mySidenav").style.width = "250px";
}

/* Set the width of the side navigation to 0 */
function closeNav(id = '0') {
	if (id != '0')
		load_portada_equipo(id);
	document.getElementById("mySidenav").style.width = "0";
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
	// to stop loading after some time
	setTimeout(() => {
		loader.classList.remove("display");
	}, 300000);
}

// hiding loading
async function hideLoading() {
	//const element = await waitForElementToExist('#endPage');
	loader = document.querySelector("#loading");
	loader.classList.remove("display");
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


function add_back(pagina) {
	if (!pagina)
		pagina = '';

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