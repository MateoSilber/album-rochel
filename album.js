document.addEventListener("DOMContentLoaded", () => {
  const janijimNombres = ["Alex", "Khanis", "Milo", "Yoni", "Aby", "Alma", "Cata", "Dan", "DaniK", "Ivo", "Jaz", "Juli", "Lolo", "Mateo", "Nacho", "Paula", "Ramiro", "Schniper", "Yair", "Siano", "Sophie", "Tiago", "Wais", "Toto", "Uri", "Widder", "Wolko", "Benja", "DaniM", "Emma", "Espe", "Maayan", "Sharon", "SofiaK", "Tali", "Ari"];
  const madrijimNombres = ["IaraF", "Diego", "Rossman", "Vicky"];
  const mejanNombres = ["Igal", "IaraN"];
  const leyendasNombres = ["Puachi", "Mile", "Chiara", "Adri", "Cande", "Maia", "Guido", "ThiagoR"];
  const grupoFotosNombres = ["FotoGrupo1", "FotoGrupo2", "FotoGrupo3", "FotoGrupo4", "FotoGrupo5"];

  const totalFiguritas = [];
  let idCounter = 1;

  function crearFiguritas(nombres, tipo) {
    nombres.forEach(nombre => {
      totalFiguritas.push({ id: idCounter, numero: idCounter, nombre, tipo });
      idCounter++;
    });
  }

  crearFiguritas(janijimNombres, "janijim");
  crearFiguritas(madrijimNombres, "madrijim");
  crearFiguritas(mejanNombres, "mejanjim");
  crearFiguritas(leyendasNombres, "leyendas");
  crearFiguritas(grupoFotosNombres, "fotos grupales");

  const albumDiv = document.getElementById("album");
  const sobreDiv = document.getElementById("sobre-abierto");
  const abrirBtn = document.getElementById("abrir-sobre");
  const timerDiv = document.getElementById("timer");
  const sobreImg = document.getElementById("sobre-img");
  const zoomView = document.getElementById("zoom-view");
  const zoomImg = document.getElementById("zoom-img");
  const zoomNombre = document.getElementById("zoom-nombre");
  const cerrarZoom = document.getElementById("cerrar-zoom");

  let coleccion = JSON.parse(localStorage.getItem("coleccionRochel")) || [];
  let cooldown = false;
  const COOLDOWN_SEGUNDOS = 60;

  function cargarImagen(nombre, callback) {
    const extensiones = ["png", "jpg", "jpeg"];
    let index = 0;

    function intentarCargar() {
      if (index >= extensiones.length) {
        callback("fotos/fallback.png");
        return;
      }

      const intento = `fotos/${nombre}.${extensiones[index]}`;
      const img = new Image();
      img.onload = () => callback(intento);
      img.onerror = () => {
        index++;
        intentarCargar();
      };
      img.src = intento;
    }

    intentarCargar();
  }

  function renderAlbum() {
    albumDiv.innerHTML = "";
    const categorias = ["janijim", "madrijim", "mejanjim", "leyendas", "fotos grupales"];
    categorias.forEach(cat => {
      const subtitulo = document.createElement("h3");
      subtitulo.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
      const seccion = document.createElement("div");
      seccion.className = "categoria";
      seccion.appendChild(subtitulo);

      const contenedor = document.createElement("div");
      contenedor.className = "categoria-grid";

      totalFiguritas.filter(f => f.tipo === cat).forEach(fig => {
        const div = document.createElement("div");
        div.className = `figurita ${fig.tipo}`;

        if (coleccion.includes(fig.id)) {
          const nombreBase = fig.nombre.replace(/\s|\./g, '');
          cargarImagen(nombreBase, (imgSrc) => {
            div.innerHTML = `
              <img src="${imgSrc}" alt="${fig.nombre}">
              <p>${fig.nombre}</p>
              <small class="tipo">${fig.tipo}</small>
              <small class="numero">${fig.numero}</small>
            `;
            div.addEventListener("click", () => {
              zoomImg.src = imgSrc;
              zoomNombre.textContent = fig.nombre;
              zoomView.classList.remove("hidden");
            });
          });
        } else {
          div.classList.add("faltante");
          div.innerHTML = `
            <div class="placeholder"></div>
            <p>?</p>
            <small class="numero">${fig.numero}</small>
          `;
        }

        contenedor.appendChild(div);
      });

      seccion.appendChild(contenedor);
      albumDiv.appendChild(seccion);
    });
  }

  function abrirSobre() {
    if (cooldown) return;
    cooldown = true;
    abrirBtn.disabled = true;

    localStorage.setItem("ultimoSobre", Date.now());
    sobreImg.src = "fotos/sobre-abierto.png";

    setTimeout(() => {
      sobreImg.src = "fotos/sobre-cerrado.png";

      const nuevas = Array.from({ length: 5 }, () => totalFiguritas[Math.floor(Math.random() * totalFiguritas.length)]);
      sobreDiv.innerHTML = "";

      nuevas.forEach(fig => {
        const div = document.createElement("div");
        div.className = `figurita ${fig.tipo}`;
        div.style.transform = "scale(0.5) rotate(-10deg)";

        const nombreBase = fig.nombre.replace(/\s|\./g, '');
        cargarImagen(nombreBase, (imgSrc) => {
          div.innerHTML = `
            <img src="${imgSrc}" alt="${fig.nombre}">
            <p>${fig.nombre}</p>
            <small class="tipo">${fig.tipo}</small>
            <small class="numero">${fig.numero}</small>
          `;
        });

        sobreDiv.appendChild(div);
        setTimeout(() => {
          div.style.transition = "transform 0.5s ease";
          div.style.transform = "scale(1) rotate(0deg)";
        }, 100);

        if (!coleccion.includes(fig.id)) coleccion.push(fig.id);
      });

      localStorage.setItem("coleccionRochel", JSON.stringify(coleccion));
      renderAlbum();
      iniciarCooldown();
    }, 2000);
  }

  function iniciarCooldown() {
    const ahora = Date.now();
    const ultimo = parseInt(localStorage.getItem("ultimoSobre"));
    if (!ultimo || isNaN(ultimo)) {
      abrirBtn.disabled = false;
      cooldown = false;
      timerDiv.textContent = "";
      return;
    }

    let restante = COOLDOWN_SEGUNDOS - Math.floor((ahora - ultimo) / 1000);
    if (restante <= 0) {
      abrirBtn.disabled = false;
      cooldown = false;
      timerDiv.textContent = "";
      return;
    }

    abrirBtn.disabled = true;
    cooldown = true;
    timerDiv.textContent = `Siguiente sobre en ${restante}s`;

    const interval = setInterval(() => {
      restante--;
      timerDiv.textContent = `Siguiente sobre en ${restante}s`;
      if (restante <= 0) {
        clearInterval(interval);
        abrirBtn.disabled = false;
        cooldown = false;
        timerDiv.textContent = "";
      }
    }, 1000);
  }

  cerrarZoom.addEventListener("click", () => zoomView.classList.add("hidden"));
  abrirBtn.addEventListener("click", abrirSobre);

  renderAlbum();
  iniciarCooldown();
});
