// Espera a que todo el contenido del HTML esté cargado antes de ejecutar el script.
document.addEventListener('DOMContentLoaded', () => {

    // Selecciona todos los elementos que representan ramos en la malla.
    const todosLosRamos = document.querySelectorAll('.ramo');
    // Crea un mapa para acceder rápidamente a los datos de cada ramo por su ID.
    const mapaDeRamos = new Map();
    todosLosRamos.forEach(ramo => {
        mapaDeRamos.set(ramo.dataset.id, ramo);
    });

    // --- MANEJO DEL ESTADO (LOCALSTORAGE) ---

    // Carga los IDs de los ramos aprobados desde localStorage.
    // Si no hay nada guardado, inicia con un array vacío.
    let ramosAprobados = JSON.parse(localStorage.getItem('ramosAprobados')) || [];

    // Función para guardar el array de ramos aprobados en localStorage.
    function guardarEstado() {
        localStorage.setItem('ramosAprobados', JSON.stringify(ramosAprobados));
    }

    // --- LÓGICA DE LA APLICACIÓN ---

    // Función principal para actualizar el estado visual de todos los ramos.
    function actualizarVisualizacion() {
        todosLosRamos.forEach(ramo => {
            const idRamo = ramo.dataset.id;
            const requisitos = ramo.dataset.requisitos.split(',').filter(Boolean); // Convierte string de requisitos a array

            // 1. Marca los ramos que ya están aprobados.
            if (ramosAprobados.includes(idRamo)) {
                ramo.classList.add('aprobado');
                ramo.classList.remove('bloqueado');
            } else {
                ramo.classList.remove('aprobado');
                
                // 2. Verifica si los requisitos para este ramo se han cumplido.
                const requisitosCumplidos = requisitos.every(reqId => ramosAprobados.includes(reqId));

                if (requisitosCumplidos) {
                    ramo.classList.remove('bloqueado'); // Desbloquea el ramo
                } else {
                    ramo.classList.add('bloqueado'); // Bloquea el ramo
                }
            }
        });
    }

    // Función que se ejecuta al hacer clic en un ramo.
    function manejarClickEnRamo(evento) {
        const ramoClickeado = evento.target;
        const idRamo = ramoClickeado.dataset.id;
        const nombreRamo = ramoClickeado.dataset.nombre;
        const requisitos = ramoClickeado.dataset.requisitos.split(',').filter(Boolean);

        // Si el ramo ya está aprobado, permite desmarcarlo (opcional).
        // Para desmarcarlo, también se verificará si algún ramo posterior depende de él.
        if (ramosAprobados.includes(idRamo)) {
            // Lógica para des-aprobar (opcionalmente puedes comentar esto si no quieres permitirlo)
            ramosAprobados = ramosAprobados.filter(id => id !== idRamo);
        } else {
            // Si el ramo está bloqueado, no hagas nada y muestra una alerta.
            if (ramoClickeado.classList.contains('bloqueado')) {
                const nombresRequisitosFaltantes = requisitos
                    .filter(reqId => !ramosAprobados.includes(reqId))
                    .map(reqId => mapaDeRamos.get(reqId).dataset.nombre);
                
                alert(`🚫 Ramo bloqueado. \n\nPara cursar "${nombreRamo}", primero debes aprobar:\n\n• ${nombresRequisitosFaltantes.join('\n• ')}`);
                return; // Detiene la ejecución de la función.
            }

            // Si el ramo no está bloqueado, márcalo como aprobado.
            ramosAprobados.push(idRamo);
        }

        // Guarda el nuevo estado en localStorage.
        guardarEstado();
        // Actualiza la visualización de toda la malla.
        actualizarVisualizacion();
    }

    // --- INICIALIZACIÓN ---

    // Añade el detector de eventos de clic a cada ramo.
    todosLosRamos.forEach(ramo => {
        ramo.addEventListener('click', manejarClickEnRamo);
    });

    // Llama a la función de actualización por primera vez para establecer el estado inicial.
    actualizarVisualizacion();
});
