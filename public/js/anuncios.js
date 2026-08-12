// js/anuncios.js
import { auth } from "../firebase/config.js";
import { verificaPremium, isPremium } from "./verificaPremium.js";

auth.onAuthStateChanged(() => {
  lastMode = null;
  initAds();
});

const ANUNCIOS_CSS_PATH = '/styles/anuncios.css';

function loadAdsCSS() {
  if (document.getElementById('ads-css')) return;

  const link = document.createElement('link');
  link.id = 'ads-css';
  link.rel = 'stylesheet';
  link.href = ANUNCIOS_CSS_PATH;
  document.head.appendChild(link);
}

// CONFIGURAÇÕES
const ADS_CONFIG = {
  desktop: {
    top: {
        key: 'e3f066ae65393189212b6155a7a2de14',
        width: 728,
        height: 90
    },
    footer: {
        key: 'f88bd0dec346e71b4b9352bb4c24d019',
        width: 728,
        height: 90
    }
    },
    mobile: {
    top: {
        key: 'b036f0873ee35ef4f2713f9b9fba386f',
        width: 320,
        height: 50
    },
    footer: {
        key: 'f88bd0dec346e71b4b9352bb4c24d019',
        width: 320,
        height: 50
    }
  },

  side: {
    scriptSrc: 'https://pl28328067.effectivegatecpm.com/8fbea71871c4bde3a6d957dda538fc89/invoke.js',
    containerId: 'container-8fbea71871c4bde3a6d957dda538fc89'
  }
};

const DESKTOP_MIN_WIDTH = 768;

// HELPERS
function isMobile() {
  return window.innerWidth < DESKTOP_MIN_WIDTH;
}

// BANNERS TOPO / FOOTER (Adsterra)
function loadAd(containerId, adConfig) {
  const container = document.getElementById(containerId);
  if (!container || container.dataset.loaded) return;

  container.dataset.loaded = 'true';
  container.innerHTML = '';

  const iframe = document.createElement('iframe');
  iframe.width = adConfig.width;
  iframe.height = adConfig.height;
  iframe.style.border = '0';
  iframe.loading = 'lazy';

  container.appendChild(iframe);

  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write(`
    <script>
      var atOptions = {
        'key': '${adConfig.key}',
        'format': 'iframe',
        'width': ${adConfig.width},
        'height': ${adConfig.height},
        'params': {}
      };
    <\/script>
    <script src="https://www.highperformanceformat.com/${adConfig.key}/invoke.js"><\/script>
  `);
  doc.close();
}



// BANNER LATERAL (EffectiveGate)
function loadSideAd(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = '';

  const innerDiv = document.createElement('div');
  innerDiv.id = ADS_CONFIG.side.containerId;

  const script = document.createElement('script');
  script.async = true;
  script.setAttribute('data-cfasync', 'false');
  script.src = ADS_CONFIG.side.scriptSrc;

  container.appendChild(script);
  container.appendChild(innerDiv);
}

// Remove anúncios
function removeAd(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = '';
  delete container.dataset.loaded;
}


// GERENCIADOR PRINCIPAL
let lastMode = null;

async function initAds() {
  const plano = await verificaPremium();

  // Premium → sem anúncios
  if (isPremium(plano)) {
    document.body.classList.add('no-ads');
    removeAd('adTop');
    removeAd('adFooter');
    removeAd('adSide');
    return;
  }

  document.body.classList.remove('no-ads');
  loadAdsCSS(); 

  const currentMode = isMobile() ? 'mobile' : 'desktop';

  const adConfig = currentMode === 'mobile'
    ? ADS_CONFIG.mobile
    : ADS_CONFIG.desktop;

  loadAd('adTop', adConfig.top);
  loadAd('adFooter', adConfig.footer);

  if (currentMode === 'desktop') {
    loadSideAd('adSide');
  } else {
    removeAd('adSide');
  }
}

let resizeTimer;

window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    const newMode = isMobile() ? 'mobile' : 'desktop';
    if (newMode !== lastMode) {
      lastMode = null;
      initAds();
    }
  }, 300);
});

