//WEB SIDE

//GLOBAL PATH
let currentPage = "welcome"
let previousPage = "welcome"
var PanelVer = {
  a: "0.0.6",
  b: "prod-alpha",
  c: "26-09-2023",
  d: false,
  e: false,
  f: {}
}
window.JSCope = this
var Activity = {}
var cachedsonglist = {}
try {
  cachedsonglist = JSON.parse(localStorage.getItem('songlist'))
} catch (err) { }
{

  function setPage(cdn, title) {
    previousPage = currentPage
    currentPage = cdn
    localStorage.setItem("currentPage", currentPage);
    document.querySelector('.panel-title').innerHTML = title
  }
  function backPage(){
    setPage(previousPage, 'JDParty Panel')
  }
  const originalFetch = window.fetch;
  window.fetch = function () {
    const args = arguments;
    if (args[0].indexOf('fetch-api') > -1) {
      return originalFetch.apply(this, args).then(function (response) {
        response.clone().blob().then(function () { });
        return response;
      });
    } else {
      return originalFetch.apply(this, args);
    }
  };
  window.addEventListener('scroll', function () {
    var scrollTop = document.documentElement.scrollTop;
    if (scrollTop > 0) {
      document.querySelector('.mdc-top-app-bar').classList.add('scroll-top-app-bar');
      document.querySelector('meta[name="theme-color"]').setAttribute("content", getComputedStyle(document.querySelector('html')).getPropertyValue('--mdc-theme-surface'));
    } else {
      document.querySelector('.mdc-top-app-bar').classList.remove('scroll-top-app-bar');
      document.querySelector('meta[name="theme-color"]').setAttribute("content", getComputedStyle(document.querySelector('html')).getPropertyValue('--mdc-theme-background'));
    }
  });
}
//ACCOUNT
{
  Activity.account = this;
  const KEY_TO_RESET = "q";
  const RESET_INTERVAL = 3600000;

  // Check if it's time to reset the key on page load
  const lastResetTime = localStorage.getItem("lastResetTime");
  if (!lastResetTime || Date.now() - lastResetTime > RESET_INTERVAL) {
    localStorage.setItem(KEY_TO_RESET, "defaultValue");
    localStorage.setItem("lastResetTime", Date.now());
  }

  // Reset the key every 1 hour
  setInterval(() => {
    localStorage.setItem(KEY_TO_RESET, "defaultValue");
    localStorage.setItem("lastResetTime", Date.now());
  }, RESET_INTERVAL);

  if (!localStorage.getItem('q')) {}

  //FETCH AUTH
  fetch(`api/auth?${localStorage.getItem('q')}`, {
    method: 'POST'
  })
    .then(response => {
      if (response.status != 200) { }
    });
}
var q = localStorage.getItem('q')
document.querySelector('.username-info').innerHTML = q.split("=")[1].split("&")[0];

//Button Function
{
  Activity.button = this;
  const drawer = new mdc.drawer.MDCDrawer(document.querySelector('.mdc-drawer'));

  document.querySelector('.mdc-top-app-bar__navigation-icon').addEventListener('click', () => {
    drawer.open = !drawer.open;
  });

  document.querySelectorAll('.mdc-list-item').forEach((el) => {
    el.addEventListener('click', () => {
      drawer.open = false;
    });
  });


  const sbar = {
    dashboard: document.querySelector('#dashboard'),
    carousel: document.querySelector('#carousel'),
    files: document.querySelector('#files'),
    songlist: document.querySelector('#songlist'),
    performance: document.querySelector('#performance'),
    settings: document.querySelector('#settings'),
    log: document.querySelector('#log'),
    about: document.querySelector('#about')
  };
  function shortcut(path) {
    sbar[path].click()
  }
  try {
    setTimeout(function () { sbar[localStorage.getItem("currentPage")].click(); }, 200)
  } catch (err) { console.log(err) }
  const content = document.querySelector('.mdc-top-app-bar--fixed-adjust');

  function playAudioPreview(urlVideo, urlAudio) {
    var audioPlayer = document.getElementById("PreviewPlayer-audio");
    var videoPlayer = document.getElementById("PreviewPlayer-video");
    audioPlayer.src = urlAudio
    videoPlayer.src = urlVideo
    if (urlVideo == "" || !urlVideo) {
      videoPlayer.src = "https://jdcn-switch.cdn.ubisoft.cn/public/map/GongXiGongXi/GongXiGongXi_MapPreviewNoSoundCrop_LOW.vp9.webm/b4df6b1d61b9af9d5b90dc57e3c033fb.webm"
    }
    videoPlayer.controls = true;
    videoPlayer.controlsList = "noremoteplayback"
    function play() {
      if (!audioPlayer.paused && !videoPlayer.paused) {
        return;
      }
      var promise1 = audioPlayer.play();
      var promise2 = videoPlayer.play();
      if (promise1 !== undefined && promise2 !== undefined) {
        Promise.all([promise1, promise2]).then(function () {
        }).catch(function (error) {
        });
      }
    }
    audioPlayer.addEventListener("canplaythrough", function () {
      if (videoPlayer.readyState >= 3) {
        play();
      }
    });

    videoPlayer.addEventListener("canplaythrough", function () {
      if (audioPlayer.readyState >= 3) {
        play();
      }
    });
    audioPlayer.addEventListener("timeupdate", function () {
      if (videoPlayer.paused) {
        videoPlayer.currentTime = audioPlayer.currentTime;
      }
    });

    videoPlayer.addEventListener("timeupdate", function () {
      if (audioPlayer.paused) {
        audioPlayer.currentTime = videoPlayer.currentTime;
      }
    });
    videoPlayer.addEventListener("ended", function () {
      if (!document.fullscreenElement) {
        videoPlayer.style.display = "none";
      }
    });

    videoPlayer.addEventListener("play", function () {
      videoPlayer.style.display = "block";
    });
  }
  sbar.dashboard.addEventListener('click', () => {
    setPage("dashboard", "Dashboard")
    content.innerHTML = `
    <div class="mdc-card">
      <h2 class="mdc-typography--headline6">Dashboard</h2>
      <p class="mdc-typography--body1">You are on the dashboard page.</p>
    </div>
  `;
  });
  sbar.carousel.addEventListener('click', () => {
    setPage("carousel", "Carousel")
    content.innerHTML = `
    <div class="mdc-card">
      <p class="mdc-typography--body1">You are on the carousel page.</p>
    </div>
  `;
  });
  sbar.files.addEventListener('click', () => {
    setPage("file", "Files Manager")
    content.innerHTML = `
    <div class="mdc-card">
      <p class="mdc-typography--body1">Read Only For Now</p>
    </div>
  `;
  });
  sbar.about.addEventListener('click', () => {
    setPage("about", "About")
    content.innerHTML = `
    <div class="mdc-card">
    <h2 class="mdc-typography--body1">
      Panel Ughtea
      </h2>
      <p class="mdc-typography--body1 banner-about">
      Build Version: ${PanelVer.a}
      Build Type: ${PanelVer.b}
      Build Date: ${PanelVer.c}
      IsSTD: ${PanelVer.d}
      IsDarkmode: ${PanelVer.e}

      </p>
    </div>
  `;
  });
  sbar.songlist.addEventListener('click', () => {
    setPage("songlist", "All Songlist")
    content.innerHTML = `
    <div class="mdc-card">
    <div class="PopUp-c Preview-container">
    <audio id="PreviewPlayer-audio">
  <source src="" type="audio/ogg">
  Your browser does not support the audio element.
</audio>
<video id="PreviewPlayer-video">
<source src="" type="video/webm">
Your browser does not support the video element.
</video>
</div>
<div class="dark"></div>
<div class="PopUp-c Editor-container" codename="">
<div class="ActionBar">
<section class="mdc-top-app-bar__section mdc-top-app-bar__section--align-start">
				<span class="mdc-top-app-bar__title panel-title">*Patched Song Name Can Be So Loooooong</span>
        <button class="mdc-icon-button material-icons mdc-top-app-bar__navigation-icon mdc-ripple-upgraded"
        aria-label="Open navigation menu" onclick="setPopUpHidden('Editor-container', true)">close</button>
			</section>
    </div>
<div class="inise">
<p class="mdc-typography--body1">Welcome to song editor (note it is still under development)</p>
      <button class="update-songlist mdc-button mdc-card__action mdc-card__action--button" onclick="">
      <span class="mdc-button__ripple"></span>
      Update Song Metadata</button>
    </div>
</div>
      <p class="mdc-typography--body1">You are in songdb, you can modify, add, remove song list. use [CTRL] + [F] to find an song</p>
      <button class="update-songlist mdc-button mdc-card__action mdc-card__action--button" onclick="fetchSong(document.querySelector('.mdc-top-app-bar--fixed-adjust'))">
      <span class="mdc-button__ripple"></span>
      Update Song list</button>
      <div class="mdc-layout-grid mdc-layout-grid__inner"></div>
    </div>
  `;
    loadSong(cachedsonglist, content)
  });

  sbar.performance.addEventListener('click', () => {
    setPage("performance", "System Performance")
    content.innerHTML = `
    <div class="mdc-card performance">
      <p class="mdc-typography--body1">You are on the Performance page.</p>
      <div class="mdc-card__content">
      <div class="group2 mdc-list-group">
          <h3 class="mdc-list-group__subheader">System Information</h3>
          <ul class="mdc-list mdc-list--two-line" id="system-info-list"></ul>
      </div>
      <div class="group1 mdc-list-group">
      <h3 class="mdc-list-group__subheader">Server Debugging</h3>
      <div class="urlPath">
      <button id="menu-button" class="mdc-button">GET</button>
      <ul id="menu" class="mdc-menu mdc-menu-surface">
        <li class="mdc-list-item" role="menuitem" tabindex="0">GET</li>
        <li class="mdc-list-item" role="menuitem" tabindex="0">POST</li>
        <li class="mdc-list-item" role="menuitem" tabindex="0">PUT</li>
      </ul>

      <div class="mdc-text-field mdc-text-field--outlined">
      <input type="text" id="firstname" class="mdc-text-field__input">
      <div class="mdc-notched-outline">
        <div class="mdc-notched-outline__leading"></div>
        <div class="mdc-notched-outline__trailing"></div>
      </div>
    </div>
    <button raised label="Request" onclick="request(method, url)" class="mdc-button request"> <span
    class="mdc-button__ripple"></span>Request</button>
</div>
    </div>
      </div>
      </div>
    </div>
  `;
    const button = content.querySelector('#menu-button');
    const menu = new mdc.menu.MDCMenu(content.querySelector('#menu'));

    menu.setAnchorElement(button);

    button.addEventListener('click', () => {
      menu.open = !menu.open;
    });

    const menuItems = content.querySelectorAll('.mdc-list-item');

    menuItems.forEach((menuItem) => {
      menuItem.addEventListener('click', () => {
        button.textContent = menuItem.textContent;
        menu.open = false;
      });
    });
    function runCodeLoop() {
      if (currentPage == "performance") {
        getSysStats(content)
        setTimeout(runCodeLoop, 5000);
      }
    }
    runCodeLoop()
  });

  sbar.log.addEventListener('click', () => {
    setPage("log", "Activity Log")
    content.innerHTML = `
    <div class="mdc-card">
      <p class="mdc-typography--body1">This page is a record of all events and actions taken on the server. Pages will fetching every 10 seconds</p>
      <div id="list-container"></div>
    </div>`;
    function runCodeLoop() {
      if (currentPage == "log") {
        getLog(content, PanelVer.d)
        setTimeout(runCodeLoop, 10000);
      }
    }
    runCodeLoop()
  });

  sbar.settings.addEventListener('click', () => {
    setPage("settings", "Panel Settings")
    content.innerHTML = `
    <div class="mdc-card">
    
    <p class="mdc-typography--body1">Settings</h2>
    <div class="mdc-layout-grid shortcut">
  <div class="mdc-layout-grid__inner shortcut">
    <div class="mdc-layout-grid__cell shortcut">
      <button class="mdc-icon-button mdc-ripple-surface" onclick="shortcut('log')" aria-label="log">
        <i class="material-icons mdc-icon-button__icon">description</i>
        <span class="mdc-icon-button__label">Activity Log</span>
      </button>
    </div>
    <div class="mdc-layout-grid__cell shortcut">
      <button class="mdc-icon-button mdc-ripple-surface" onclick="shortcut('performance')" aria-label="Cart">
        <i class="material-icons mdc-icon-button__icon">speed</i>
        <span class="mdc-icon-button__label">Performance</span>
      </button>
    </div>
    <div class="mdc-layout-grid__cell shortcut">
    <button class="mdc-icon-button mdc-ripple-surface" onclick="shortcut('about')" aria-label="Cart">
      <i class="material-icons mdc-icon-button__icon">info</i>
      <span class="mdc-icon-button__label">About Panel</span>
    </button>
  </div>
  </div>
</div>

<p class="mdc-typography--body1">Restart Server.</p>
<div class="restartui">
<p class="mdc-typography--body1 info">Pressing the restart button will trigger an automatic server restart process. The server will go through a shut down, update, and reboot sequence to apply any pending patches or updates, click 10 times to restart</p>
<button raised label="Restart" onclick="restart(document.querySelector('.restartui'))" class="mdc-button restart"> <span
class="mdc-button__ripple"></span>Restart & Check Updates</button>
</div>

    </div>
  `;
  });
}

//FUNCTION
{
  function setPopUpHidden(PopUp, isHide) {
    if (isHide) {
      document.querySelector(`.PopUp-c.${PopUp}`).classList.add("hidden")
    } else {
      document.querySelector(`.PopUp-c.${PopUp}`).classList.remove("hidden")
    }
  }
  function initEditor(codename) {
    setPopUpHidden('Editor-container', false)
  }
  function getLog(parent, isSTD = false) {
    fetch(`api/getlog?${q}&c=${isSTD}`, {
      method: 'POST'
    })
      .then(response => response.json())
      .then(logs => {
        const logsContainer = parent.querySelector('#list-container');
        logsContainer.innerHTML = '';
        const ul = document.createElement('ul');
        ul.classList.add('mdc-list', 'mdc-list--two-line');
        logs = logs.filter(log => !log.url.startsWith('/party/panel/'))
        logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        for (let log of logs) {
          try {
            const urlObj = JSON.parse(log.url);
            log.url = JSON.stringify(urlObj, null, 2);
          } catch (error) {
          }
          const date = new Date(log.timestamp);
          const formattedDate = date.toLocaleString();
          const li = document.createElement('li');
          li.classList.add('mdc-list-item');
          const logDetails = document.createElement('div');
          logDetails.classList.add('mdc-list-item__text');
          logDetails.innerHTML = `
            <span class="mdc-list-item__primary-text log-method">${log.method}</span>
            <span class="mdc-list-item__secondary-text">${log.url} - <span class="log-timestamp">${formattedDate}</span></span>
          `;
          li.appendChild(logDetails);
          ul.appendChild(li);
        }
        logsContainer.appendChild(ul);
      });
  }
  function fetchSong(parent) {
    fetch('/songdb/v1/songs', {
    headers: {
    	'X-SkuId': "jd2017-pc-ww",
        'Authorization': 'Ubi_v1-PartyPanel'
    }
    })
      .then(response => response.json())
      .then(data => {
        try {
          cachedsonglist = data;
          localStorage.setItem('songlist', JSON.stringify(data))
        }
        catch (err) { }
        PanelVer.f = data
        loadSong(data, parent)
      })
      .catch(error => console.error(error));
  }
  function loadSong(data, parent) {
    let a = 0;
    const songList = [];
    for (let key in data) {
      const song = data[key];
      let o = a;
      var songcover = {
        url: "",
        isPhone: false
      }
      if (song.assets.cover_1024ImageUrl && !song.assets.cover_1024ImageUrl.endsWith(".ckd")) {
        songcover.url = song.assets.cover_1024ImageUrl
        songcover.isPhone = false
      } else {
        songcover.url = song.assets.phoneCoverImageUrl
        songcover.isPhone = true
      }
      try {
        var audiopreview = song.urls[`jmcs://jd-contents/${song.mapName}/${song.mapName}_AudioPreview.ogg`]
        var videopreview = song.urls[`jmcs://jd-contents/${song.mapName}/${song.mapName}_MapPreviewNoSoundCrop_LOW.vp9.webm`]
      } catch (rtt) { }
      songList.push({
        title: song.title,
        artist: song.artist,
        songName: song.mapName,
        cover: songcover.url,
        coverPhone: songcover.isPhone,
        offset: o,
        preview: {
          Audio: audiopreview,
          Video: videopreview
        }
      })
      a++;
    }
    const cells = songList.map(item => {
      const cell = document.createElement('div');
      cell.classList.add('mdc-layout-grid__cell');
      cell.classList.add(`mdc-layout-grid__cell--span-offset${item.offset}`);
      cell.innerHTML = `
      <div class="mdc-card" mapName="${item.songName}" offset="${item.offset}">
      <div class="mdc-card__primary-action">
        <div class="mdc-card__media mdc-card__media--16-9 lazy-bg" isPhone="${item.coverPhone}"  data-bg="${item.cover}">
          <!-- Placeholder gambar yang akan ditampilkan saat gambar sedang dimuat -->
          <div class="lazy-bg-placeholder"></div>
        </div>
        <div class="mdc-card__primary">
          <h2 class="mdc-typography mdc-typography--headline6">${item.title}</h2>
          <h3 class="mdc-typography mdc-typography--subtitle2">${item.artist} - ${item.songName}</h3>
        </div>
        <div class="mdc-card__actions">
          <button class="mdc-button mdc-card__action mdc-card__action--button" onclick="initEditor('${item.songName}')">
          <span class="mdc-button__ripple"></span>
          Modify</button>
          <div class="mdc-card__actions">
          <button class="mdc-button mdc-card__action mdc-card__action--button" onclick="playAudioPreview('${item.preview.Video}', '${item.preview.Audio}')">
          <span class="mdc-button__ripple"></span>
          Play Preview</button>
        </div>
      </div>
    </div>
    
      `;
      return cell;
    });

    const gridInner = parent.querySelector('.mdc-layout-grid__inner');
    cells.forEach(cell => {
      gridInner.appendChild(cell);
    });

    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const bg = entry.target.getAttribute('data-bg');
          entry.target.style.backgroundImage = `url(${bg})`;
          entry.target.classList.remove('lazy-bg');
          observer.unobserve(entry.target);
        }
      });
    });

    // Ambil semua elemen dengan class "lazy-bg", dan observasi setiap elemen
    const lazyBackgrounds = document.querySelectorAll('.lazy-bg');
    lazyBackgrounds.forEach(bg => {
      observer.observe(bg);
    });
  }
  function getSysStats(parent) {
    const listElement = parent.querySelector("#system-info-list");


    fetch(`api/performance?${q}`, {
      method: 'POST'
    })
      .then(response => response.json())
      .then(data => {
        // Populate the list with data
        const items = [
          { primary: "System Load Average", secondary: data.loadavg + "s" },
          { primary: "Free Memory", secondary: (data.freeMem / 1024 / 1024).toFixed(2) + ' MB' },
          { primary: "System Uptime", secondary: convertSecondsToTime(data.uptime) },
          { primary: "Hostname", secondary: data.hostname },
          { primary: "Platform", secondary: data.platform },
          { primary: "Total Counted Request", secondary: data.counted },
        ];
        listElement.innerHTML = '';
        items.forEach(item => {
          const listItemElement = document.createElement("li");
          listItemElement.classList.add("mdc-list-item");

          const listItemTextElement = document.createElement("span");
          listItemTextElement.classList.add("mdc-list-item__text");

          const primaryTextElement = document.createElement("span");
          primaryTextElement.classList.add("mdc-list-item__primary-text");
          primaryTextElement.textContent = item.primary;

          const secondaryTextElement = document.createElement("span");
          secondaryTextElement.classList.add("mdc-list-item__secondary-text");
          secondaryTextElement.textContent = item.secondary;

          listItemTextElement.appendChild(primaryTextElement);
          listItemTextElement.appendChild(secondaryTextElement);
          listItemElement.appendChild(listItemTextElement);
          listElement.appendChild(listItemElement);
        });
      });
  }
  let a = 0;
  function restart(parent) {
    a++;
    if (a == 10) {
      const pe = parent.querySelector('.info');

      fetch(`api/restart?${q}`, {
        method: 'POST'
      })
        .then(response => response.json())
        .then(data => {
          if (data.status == 200) {
            pe.innerHTML = "Restarting, Plz Wait"
            document.body.classList.add('locked')
            setTimeout(() => {
              document.querySelector('#dashboard').click()
            }, 3000)

          }
        });
    }
  }
  function convertSecondsToTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.round(seconds % 60);

    return `${hours}h ${minutes}m ${remainingSeconds}s`;
  }
}