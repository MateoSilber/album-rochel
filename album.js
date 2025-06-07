document.addEventListener("DOMContentLoaded", () => {
  const janijimNombres = [
    "Alex", "Khanis", "Milo", "Yoni", "Aby", "Alma", "Cata", "Dan", "DaniK", "Ivo",
    "Jaz", "Juli", "Lolo", "Mateo", "Nacho", "Paula", "Ramiro", "Schniper", "Yair",
    "Siano", "Sophie", "Tiago", "Wais", "Toto", "Uri", "Widder", "Wolko", "Benja",
    "DaniM", "Emma", "Espe", "Maayan", "Sharon", "SofiaK", "Tali", "Ari"
  ];

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

  crearFiguritas(janijimNombres, "janij");
  crearFiguritas(madrijimNombres, "madrij");
  crearFiguritas(mejanNombres, "mejan");
  crearFiguritas(leyendasNombres, "leyenda");
  crearFiguritas(grupoFotosNombres, "foto");

  let imagenesDisponibles = [];

  function precargarImagenes() {
    const nombres = totalFiguritas.map(f => f.nombre.replace(/\s|\./g, ''));
    const extensiones = ['png', 'jpg', 'jpeg'];
    nombres.forEach(nombre => {
      extensiones.forEach(ext => {
        const ruta = `fotos/${nombre}.${ext}`;
        const img = new Image();
        img.src = ruta;
        img.onload = () => {
          if (!imagenesDisponibles.includes(ruta)) imagenesDisponibles.push(ruta);
        };
      });
    });
    imagenesDisponibles.push('fotos/fallback.png');
  }

  function encontrarImagen(nombreBase) {
    const extensiones = ['png', 'jpg', 'jpeg'];
    for (let ext of extensiones) {
      const ruta = `fotos/${nombreBase}.${ext}`;
      if (imagenesDisponibles.includes(ruta)) return ruta;
    }
    return 'fotos/fallback.png';
  }

  precargarImagenes();

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

  function renderAlbum() {
    albumDiv.innerHTML = "";
    const categorias = ["janij", "madrij", "mejan", "leyenda", "foto"];

    categorias.forEach(cat => {
      const subtitulo = document.createElement("h3");
      subtitulo.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
      albumDiv.appendChild(subtitulo);

      const contenedor = document.createElement("div");
      contenedor.className = "categoria-grid";

      totalFiguritas.filter(f => f.tipo === cat).forEach(fig => {
        const pegada = coleccion.includes(fig.id);
        const div = document.createElement("div");
        div.className = `figurita ${pegada ? "" : "faltante"}`;

        if (pegada) {
          const nombreBase = fig.nombre.replace(/\s|\./g, '');
          const imgSrc = encontrarImagen(nombreBase);

          div.innerHTML = `
            <img src="${imgSrc}" alt="${fig.nombre}">
            <p>${fig.nombre}</p>
            <small class="tipo ${fig.tipo}">${fig.tipo}</small>
            <small class="numero">${fig.numero}</small>
          `;

          div.addEventListener("click", () => {
            zoomImg.src = imgSrc;
            zoomNombre.textContent = fig.nombre;
            zoomView.classList.remove("hidden");
          });
        } else {
          div.innerHTML = `
            <div class="placeholder"></div>
            <p>?</p>
            <small class="numero">${fig.numero}</small>
          `;
        }

        contenedor.appendChild(div);
      });

      albumDiv.appendChild(contenedor);
    });
  }

  function abrirSobre() {
    if (cooldown) return;
    cooldown = true;
    abrirBtn.disabled = true;

    sobreImg.src = "fotos/sobre-abierto.png";

    setTimeout(() => {
      sobreImg.src = "fotos/sobre-cerrado.png";

      const nuevas = [];
      for (let i = 0; i < 5; i++) {
        const rand = totalFiguritas[Math.floor(Math.random() * totalFiguritas.length)];
        nuevas.push(rand);
      }

      sobreDiv.innerHTML = "";
      nuevas.forEach(fig => {
        const mini = document.createElement("div");
        mini.className = "figurita";
        mini.style.transform = "scale(0.5) rotate(-10deg)";
        const nombreBase = fig.nombre.replace(/\s|\./g, '');
        const imgSrc = encontrarImagen(nombreBase);

        mini.innerHTML = `
          <img src="${imgSrc}" alt="${fig.nombre}">
          <p>${fig.nombre}</p>
          <small class="tipo ${fig.tipo}">${fig.tipo}</small>
          <small class="numero">${fig.numero}</small>
        `;
        sobreDiv.appendChild(mini);

        setTimeout(() => {
          mini.style.transition = "transform 0.5s ease";
          mini.style.transform = "scale(1) rotate(0deg)";
        }, 100);

        if (!coleccion.includes(fig.id)) {
          coleccion.push(fig.id);
        }
      });

      localStorage.setItem("coleccionRochel", JSON.stringify(coleccion));
      renderAlbum();
      iniciarCooldown();
    }, 2000);
  }

  function iniciarCooldown() {
    let tiempo = 60;
    timerDiv.textContent = `Siguiente sobre en ${tiempo}s`;

    const intervalo = setInterval(() => {
      tiempo--;
      timerDiv.textContent = `Siguiente sobre en ${tiempo}s`;
      if (tiempo <= 0) {
        clearInterval(intervalo);
        abrirBtn.disabled = false;
        cooldown = false;
        timerDiv.textContent = "";
      }
    }, 1000);
  }

  cerrarZoom.addEventListener("click", () => {
    zoomView.classList.add("hidden");
  });

  abrirBtn.addEventListener("click", abrirSobre);
  renderAlbum();
});
