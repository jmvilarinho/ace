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
