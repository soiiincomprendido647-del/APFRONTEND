// ============================================================
// DIRECCIÓN LOCAL DEL BACKEND
// ============================================================

const URL_API =
    "http://127.0.0.1:8000/predecir";


// ============================================================
// ELEMENTOS DEL HTML
// ============================================================

const formulario =
    document.getElementById("formulario-auto");

const campoAnio =
    document.getElementById("anio");

const botonCalcular =
    document.getElementById("boton-calcular");

const botonLimpiar =
    document.getElementById("boton-limpiar");

const textoBoton =
    document.getElementById("texto-boton");

const cargador =
    document.getElementById("cargador");

const mensajeError =
    document.getElementById("mensaje-error");

const panelResultado =
    document.getElementById("panel-resultado");

const precioResultado =
    document.getElementById("precio-resultado");

const monedaResultado =
    document.getElementById("moneda-resultado");

const resumenMarca =
    document.getElementById("resumen-marca");

const resumenAnio =
    document.getElementById("resumen-anio");

const resumenKilometraje =
    document.getElementById("resumen-kilometraje");


// Año máximo permitido
const anioActual =
    new Date().getFullYear();

campoAnio.max = anioActual;


// ============================================================
// ENVÍO DEL FORMULARIO
// ============================================================

formulario.addEventListener(
    "submit",
    async function (evento) {

        evento.preventDefault();

        limpiarMensajes();

        const datosVehiculo =
            obtenerDatosFormulario();

        if (!validarDatos(datosVehiculo)) {
            return;
        }

        activarCarga(true);

        try {

            const respuesta = await fetch(
                URL_API,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    },

                    body: JSON.stringify(
                        datosVehiculo
                    )
                }
            );

            const contenidoRespuesta =
                await respuesta.text();

            let resultado;

            try {
                resultado =
                    JSON.parse(contenidoRespuesta);

            } catch {
                throw new Error(
                    "El servidor devolvió una respuesta que no es JSON."
                );
            }

            if (!respuesta.ok) {

                let detalle =
                    "La API no pudo calcular la predicción.";

                if (
                    typeof resultado.detail === "string"
                ) {
                    detalle = resultado.detail;
                }

                if (
                    Array.isArray(resultado.detail)
                ) {
                    detalle = resultado.detail
                        .map(function (elemento) {
                            return elemento.msg;
                        })
                        .join(". ");
                }

                throw new Error(detalle);
            }

            mostrarResultado(
                resultado,
                datosVehiculo
            );

        } catch (error) {

            console.error(
                "Error de conexión:",
                error
            );

            mostrarError(
                error.message ||
                "No fue posible conectarse con el backend."
            );

        } finally {

            activarCarga(false);
        }
    }
);


// ============================================================
// LIMPIAR FORMULARIO
// ============================================================

botonLimpiar.addEventListener(
    "click",
    function () {

        limpiarMensajes();

        setTimeout(function () {
            document
                .getElementById("marca")
                .focus();
        }, 0);
    }
);


// ============================================================
// OBTENER LOS DATOS
// ============================================================

function obtenerDatosFormulario() {

    return {
        brand:
            document
                .getElementById("marca")
                .value,

        year:
            Number(
                document
                    .getElementById("anio")
                    .value
            ),

        km_driven:
            Number(
                document
                    .getElementById("kilometraje")
                    .value
            ),

        fuel:
            document
                .getElementById("combustible")
                .value,

        seller_type:
            document
                .getElementById("vendedor")
                .value,

        transmission:
            document
                .getElementById("transmision")
                .value,

        owner:
            document
                .getElementById("propietario")
                .value
    };
}


// ============================================================
// VALIDACIONES
// ============================================================

function validarDatos(datos) {

    if (!datos.brand) {
        mostrarError(
            "Selecciona la marca del vehículo."
        );

        return false;
    }

    if (
        !Number.isInteger(datos.year) ||
        datos.year < 1990 ||
        datos.year > anioActual
    ) {
        mostrarError(
            `El año debe estar entre 1990 y ${anioActual}.`
        );

        return false;
    }

    if (
        !Number.isFinite(datos.km_driven) ||
        datos.km_driven < 0
    ) {
        mostrarError(
            "El kilometraje debe ser un número mayor o igual que cero."
        );

        return false;
    }

    if (!datos.fuel) {
        mostrarError(
            "Selecciona el tipo de combustible."
        );

        return false;
    }

    if (!datos.seller_type) {
        mostrarError(
            "Selecciona el tipo de vendedor."
        );

        return false;
    }

    if (!datos.transmission) {
        mostrarError(
            "Selecciona el tipo de transmisión."
        );

        return false;
    }

    if (!datos.owner) {
        mostrarError(
            "Selecciona la condición del propietario."
        );

        return false;
    }

    return true;
}


// ============================================================
// MOSTRAR PREDICCIÓN
// ============================================================

function mostrarResultado(
    resultado,
    datosVehiculo
) {

    const precio =
        Number(resultado.precio_estimado);

    if (!Number.isFinite(precio)) {
        throw new Error(
            "El servidor devolvió un precio inválido."
        );
    }

    precioResultado.textContent =
        precio.toLocaleString(
            "es-PE",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        );

    monedaResultado.textContent =
        resultado.moneda || "INR";

    resumenMarca.textContent =
        datosVehiculo.brand;

    resumenAnio.textContent =
        datosVehiculo.year;

    resumenKilometraje.textContent =
        `${datosVehiculo.km_driven.toLocaleString(
            "es-PE"
        )} km`;

    panelResultado.classList.remove(
        "oculto"
    );

    panelResultado.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
    });
}


// ============================================================
// MOSTRAR MENSAJES DE ERROR
// ============================================================

function mostrarError(mensaje) {

    mensajeError.textContent =
        mensaje;

    panelResultado.classList.add(
        "oculto"
    );

    mensajeError.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
    });
}


// ============================================================
// ACTIVAR Y DESACTIVAR CARGA
// ============================================================

function activarCarga(estaCargando) {

    botonCalcular.disabled =
        estaCargando;

    botonLimpiar.disabled =
        estaCargando;

    textoBoton.textContent =
        estaCargando
            ? "Calculando estimación..."
            : "Calcular valor estimado";

    cargador.classList.toggle(
        "oculto",
        !estaCargando
    );
}


// ============================================================
// LIMPIAR MENSAJES Y RESULTADOS
// ============================================================

function limpiarMensajes() {

    mensajeError.textContent = "";

    panelResultado.classList.add(
        "oculto"
    );
}