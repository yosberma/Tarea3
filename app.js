document.addEventListener('DOMContentLoaded', () => {
  // ==========================================
  // ELEMENTOS PRINCIPALES
  // ==========================================
  const mainContent = document.getElementById('main-content-area');
  const btnColores = document.getElementById('btn-colores');
  const btnReloj = document.getElementById('btn-reloj');
  const btnInfo = document.getElementById('btn-info');
  const sectionColores = document.getElementById('section-colores');
  const sectionReloj = document.getElementById('section-reloj');
  const sectionInfo = document.getElementById('section-info');

  // Elementos del Generador de Colores
  const centerHexText = document.getElementById('center-hex-text');
  const btnCopyHex = document.getElementById('btn-copy-hex');
  const btnRandomizeCenter = document.getElementById('btn-randomize-center');
  const valRgb = document.getElementById('val-rgb');
  const valHsl = document.getElementById('val-hsl');
  const paletteSwatches = document.getElementById('palette-swatches');
  const toast = document.getElementById('toast');

  let currentColorHex = '#FF5733';

  // ==========================================
  // NAVEGACIÓN ENTRE PESTAÑAS
  // ==========================================
  function switchTab(activeBtn, targetSection) {
    [btnColores, btnReloj, btnInfo].forEach(btn => btn && btn.classList.remove('active'));
    [sectionColores, sectionReloj, sectionInfo].forEach(sec => sec && sec.classList.remove('active'));

    activeBtn.classList.add('active');
    targetSection.classList.add('active');
  }

  // ==========================================
  // UTILIDADES DE COLOR
  // ==========================================
  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toast.timeoutId);
    toast.timeoutId = setTimeout(() => {
      toast.classList.remove('show');
    }, 2200);
  }

  function getRandomHexColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  function hexToRgb(hex) {
    const cleanHex = hex.replace('#', '');
    const bigint = parseInt(cleanHex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return { r, g, b };
  }

  function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s;
    const l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  }

  function hslToHex(h, s, l) {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = n => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
  }

  function generateMiniPalette(h, s) {
    if (!paletteSwatches) return;
    paletteSwatches.innerHTML = '';
    const lightnessSteps = [85, 70, 50, 35, 20];

    lightnessSteps.forEach(l => {
      const swatchHex = hslToHex(h, s, l);
      const swatch = document.createElement('div');
      swatch.className = 'swatch-mini';
      swatch.style.backgroundColor = swatchHex;
      swatch.title = `Tonalidad ${swatchHex} - Clic para aplicar`;

      swatch.addEventListener('click', (e) => {
        e.stopPropagation();
        applySpecificColor(swatchHex);
        showToast(`Color aplicado: ${swatchHex}`);
      });

      paletteSwatches.appendChild(swatch);
    });
  }

  function applySpecificColor(hex) {
    currentColorHex = hex;
    // Cambia el color de fondo del área de contenido principal
    mainContent.style.backgroundColor = hex;
    // Muestra el código del color en el centro
    centerHexText.textContent = hex;

    const { r, g, b } = hexToRgb(hex);
    const { h, s, l } = rgbToHsl(r, g, b);

    if (valRgb) valRgb.textContent = `rgb(${r}, ${g}, ${b})`;
    if (valHsl) valHsl.textContent = `hsl(${h}, ${s}%, ${l}%)`;
    generateMiniPalette(h, s);
  }

  // Genera y aplica un color hexadecimal aleatorio
  function applyRandomColor() {
    const randomHex = getRandomHexColor();
    applySpecificColor(randomHex);
  }

  function copyCurrentHex() {
    navigator.clipboard.writeText(currentColorHex).then(() => {
      showToast(`¡Código ${currentColorHex} copiado al portapapeles!`);
    });
  }

  // ==========================================
  // EVENTOS DEL GENERADOR DE COLORES
  // ==========================================
  // Al hacer clic en el botón 'Generador de Colores' del menú lateral:
  // 1. Se activa la sección de colores
  // 2. El área de contenido principal cambia su fondo a un color hexadecimal aleatorio
  // 3. Se muestra el código del color en el centro
  btnColores.addEventListener('click', () => {
    switchTab(btnColores, sectionColores);
    applyRandomColor();
  });

  // Botón secundario en el centro para generar otro color
  if (btnRandomizeCenter) {
    btnRandomizeCenter.addEventListener('click', applyRandomColor);
  }

  // Copiar código haciendo clic en el botón o en el texto
  if (btnCopyHex) {
    btnCopyHex.addEventListener('click', copyCurrentHex);
  }
  if (centerHexText) {
    centerHexText.addEventListener('click', copyCurrentHex);
  }

  // Atajo con la tecla Espacio cuando la pestaña de colores esté activa
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && sectionColores.classList.contains('active') && e.target === document.body) {
      e.preventDefault();
      applyRandomColor();
    }
  });

  // ==========================================
  // EVENTOS DE LA PESTAÑA RELOJ
  // ==========================================
  const clockDigits = document.getElementById('clock-time');
  const clockDate = document.getElementById('clock-date');

  function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    // Muestra la hora actual en formato de reloj digital (HH:MM:SS)
    if (clockDigits) {
      clockDigits.textContent = `${hours}:${minutes}:${seconds}`;
    }

    // Fecha en español
    if (clockDate) {
      const optionsDate = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      clockDate.textContent = now.toLocaleDateString('es-ES', optionsDate);
    }
  }

  // Al hacer clic en el botón 'Reloj':
  // 1. Borra el contenido actual del área principal (oculta el generador y restablece el fondo)
  // 2. Muestra la hora actual en formato HH:MM:SS
  // 3. Se actualiza cada segundo
  btnReloj.addEventListener('click', () => {
    switchTab(btnReloj, sectionReloj);
    // Borra el color de fondo personalizado del generador
    mainContent.style.backgroundColor = '';
    // Actualiza la hora de inmediato
    updateClock();
  });

  // Temporizador que se ejecuta cada segundo (1000 ms)
  setInterval(updateClock, 1000);
  updateClock();

  // ==========================================
  // EVENTOS DE LA PESTAÑA INFORMACIÓN / ESTUDIANTE
  // ==========================================
  // Al hacer clic en el botón 'Estudiante':
  // 1. Borra lo que tenga el área principal
  // 2. Muestra el nombre Yosber Berroteran, Sección 284A1 y título INTRODUCCIÓN A JAVASCRIPT
  if (btnInfo) {
    btnInfo.addEventListener('click', () => {
      switchTab(btnInfo, sectionInfo);
      mainContent.style.backgroundColor = '';
    });
  }

  // Inicializar con un color vibrante de ejemplo en el primer arranque
  applySpecificColor('#FF5733');
});
