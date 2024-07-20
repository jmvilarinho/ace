// --------------------------------------------------------------------------------------------------
async function validURL(url){
  try {
    const response = await fetch(url);
    console.log('Camara: '+url,' -> ', response.status); // 👉️ 200
    if (response.ok) {
      return true;
    }
  } catch (err) {
    console.log(err);
  }
  return false;
}

 
function encode_utf8(s) {
  return unescape(encodeURIComponent(s));
}

async function showVideo(url, videoid) {
  var video = document.getElementById(videoid);
	var image = document.getElementById(videoid+"-unavailable");
  exists = await validURL(url);

	if (!exists) {
		video.remove();
		image.style.visibility = "visible";
	} else {
		video.style.visibility = "visible";
		image.remove();
    if (Hls.isSupported()) {
      var hls = new Hls({
        debug: false,
      });
      hls.loadSource( url );
      hls.attachMedia(video);
      hls.on(Hls.Events.MEDIA_ATTACHED, function () {
        video.muted = true;
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
}

// --------------------------------------------------------------------------------------------------

function getMareas(id,element) {
  fetch("https://ideihm.covam.es/api-ihm/getmarea?request=gettide&id="+id+"&format=json")
    .then(response => response.json())
    .then(data => createList(data,element));
}

function createList(data,element) {
	const mainDiv = document.getElementById(element);

  var ubicacion = data["mareas"]["puerto"]
  var mareas='';
	for (var key in data['mareas']['datos']['marea']) {
	  // 👉 formatting JSON data
	  if (mareas !=''){
	  	mareas += ', ';
	  }
	  mareas += data['mareas']['datos']['marea'][key]['tipo']+": "+data['mareas']['datos']['marea'][key]['hora']
	}
  const keyDiv = document.createElement('div');
	keyDiv.innerHTML = `Mareas en ${ubicacion}: ${mareas}`;
  mainDiv.appendChild(keyDiv);
}

// --------------------------------------------------------------------------------------------------

var apikey='eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJqbXZpbGFyaW5ob0BnbWFpbC5jb20iLCJqdGkiOiJhZTdiYTgwOS1iOTQ3LTQxM2YtYmRmYy03ODEzZjMxOGM5ZDkiLCJpc3MiOiJBRU1FVCIsImlhdCI6MTcyMTQ4NDg2MiwidXNlcklkIjoiYWU3YmE4MDktYjk0Ny00MTNmLWJkZmMtNzgxM2YzMThjOWQ5Iiwicm9sZSI6IiJ9.7kqIc3ErJmp9MtGELp9C8SDUkZ-a9bAX2LeRw_aysRg';


function toutf8(str) {
	r=''
	for (var i = 0; i < str.length; i++) {
		console.log(str.charAt(i) +" -> "+str.charCodeAt(i))
		if (str.charCodeAt(i).toString(16) == 'fffd')
			r+='&aacute;'
		else
			r+=str.charAt(i) 
	}
  return r;
}

function getPrevision(id,element) {
  fetch('https://opendata.aemet.es/opendata/api/prediccion/especifica/playa/'+id+'/?api_key='+apikey)
    .then(response => response.json())
    .then(data => getPrevisionDatos(data,element));
}

function getPrevisionDatos(data,element) {
	if ( data['estado'] == 200){

		console.log('Get prevision: '+data['datos'])
		var myHeaders = new Headers();
		myHeaders.append('Content-Type','text/plain; charset=UTF-8');

		fetch(data['datos'], myHeaders)
        .then(function (response) {
            return response.arrayBuffer();
        })
        .then(function (buffer) {
            const decoder = new TextDecoder('iso-8859-1');
            const text = decoder.decode(buffer);
            createPrevision(JSON.parse(text),element);
        });
	}     
}

function createPrevision(data,element) {
	const mainDiv = document.getElementById(element);
	var options = { year: 'numeric', month: 'short', day: 'numeric' };
	var pattern = /(\d{4})(\d{2})(\d{2})/;


  var tabla = '<table class="center">';
  tabla += "<tr><th colspan=10>Prevision en "+ data[0]["nombre"] +" (elaborada o: "+data[0]["elaborado"]+")</th></tr>";
  tabla += "<tr><th><th colspan=3></th></th><th colspan=3>Mañá</th><th colspan=3>Tarde</th></tr>";
  tabla += "<tr><th>Data</th><th>T. Max</th><th>Sensacion</th><th>T. Auga</th><th>Ceo</th><th>Vento</th><th>Oleaxe</th><th>Ceo</th><th>Vento</th><th>Oleaxe</th></tr>";

  var datos=data[0]["prediccion"]["dia"][0];
	var st = String(datos["fecha"]);
	var dt = new Date(st.replace(pattern,'$2-$3-$1'));
  tabla += "<tr>"
  			+"<td>"+dt.toLocaleDateString("es-ES", options)+"</td>"
  			+"<td>"+datos["tMaxima"]["valor1"]+"&deg;</td>"
  			+"<td>"+datos["sTermica"]["descripcion1"]+"</td>"
  			+"<td>"+datos["tAgua"]["valor1"]+"&deg;</td>"
  			+"<td>"+datos["estadoCielo"]["descripcion1"]+"</td>"
  			+"<td>"+datos["viento"]["descripcion1"]+"</td>"
  			+"<td>"+datos["oleaje"]["descripcion1"]+"</td>"
  			+"<td>"+datos["estadoCielo"]["descripcion2"]+"</td>"
  			+"<td>"+datos["viento"]["descripcion2"]+"</td>"
  			+"<td>"+datos["oleaje"]["descripcion2"]+"</td>"
  			+"</tr>";

  var datos=data[0]["prediccion"]["dia"][1];
	var st = String(datos["fecha"]);
	var dt = new Date(st.replace(pattern,'$2-$3-$1'));
  tabla += "<tr>"
  			+"<td>"+dt.toLocaleDateString("es-ES", options)+"</td>"
  			+"<td>"+datos["tMaxima"]["valor1"]+"&deg;</td>"
  			+"<td>"+datos["sTermica"]["descripcion1"]+"</td>"
  			+"<td>"+datos["tAgua"]["valor1"]+"&deg;</td>"
  			+"<td>"+datos["estadoCielo"]["descripcion1"]+"</td>"
  			+"<td>"+datos["viento"]["descripcion1"]+"</td>"
  			+"<td>"+datos["oleaje"]["descripcion1"]+"</td>"
  			+"<td>"+datos["estadoCielo"]["descripcion2"]+"</td>"
  			+"<td>"+datos["viento"]["descripcion2"]+"</td>"
  			+"<td>"+datos["oleaje"]["descripcion2"]+"</td>"
  			+"</tr>";

  var datos=data[0]["prediccion"]["dia"][2];
	var st = String(datos["fecha"]);
	var dt = new Date(st.replace(pattern,'$2-$3-$1'));
  tabla += "<tr>"
  			+"<td>"+dt.toLocaleDateString("es-ES", options)+"</td>"
  			+"<td>"+datos["tMaxima"]["valor1"]+"&deg;</td>"
  			+"<td>"+datos["sTermica"]["descripcion1"]+"</td>"
  			+"<td>"+datos["tAgua"]["valor1"]+"&deg;</td>"
  			+"<td>"+datos["estadoCielo"]["descripcion1"]+"</td>"
  			+"<td>"+datos["viento"]["descripcion1"]+"</td>"
  			+"<td>"+datos["oleaje"]["descripcion1"]+"</td>"
  			+"<td>"+datos["estadoCielo"]["descripcion2"]+"</td>"
  			+"<td>"+datos["viento"]["descripcion2"]+"</td>"
  			+"<td>"+datos["oleaje"]["descripcion2"]+"</td>"
  			+"</tr>";


  tabla += "</table>";

  const keyDiv = document.createElement('div');
	keyDiv.innerHTML = tabla
	keyDiv.style.textAlign = "center";
  mainDiv.appendChild(keyDiv);
}
