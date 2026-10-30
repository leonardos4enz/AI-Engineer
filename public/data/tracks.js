/* Registro de rutas. Para agregar una: crea data/<id>.js con window.TRACK_<ID> = {…}
   (misma forma que lcae.js, ids de tareas con su propio prefijo), cárgalo en index.html
   antes de este archivo y súmalo aquí. La primera es la ruta por defecto. */
window.TRACKS = [window.TRACK_LCAE].filter(Boolean);
