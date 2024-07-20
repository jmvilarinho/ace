async function validURL(url){
  try {
    const response = await fetch(url);
    console.log(url,' -> ', response.status); // 👉️ 200
    if (response.ok) {
      return true;
    }
  } catch (err) {
    console.log(err);
  }
  return false;
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
	  console.log(key)
	  if (mareas !=''){
	  	mareas += ', ';
	  }
	  mareas += data['mareas']['datos']['marea'][key]['tipo']+": "+data['mareas']['datos']['marea'][key]['hora']
	}
  const keyDiv = document.createElement('div');
	keyDiv.innerHTML = `Mareas en ${ubicacion}: ${mareas}`;
  mainDiv.appendChild(keyDiv);
}
