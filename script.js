// CONFIGURACIÓN DE APIS DE AIRTABLE
const AIRTABLE_TOKEN = 'TU_PERSONAL_ACCESS_TOKEN_AQUI'; // Pon tu Token aquí
const BASE_ID = 'app471dbUsqrk2x5X';

let datosAnunciosGlobales = [];
let codigosValidosGlobales = [];
let publicidadGlobales = [];
let seccionActiva = ''; 
let categoriaActiva = 'Todos';
let intervaloCarrusel;

const iconosCategorias = {
    'Salud y bienestar': '❤️', 'Alimentos y bebidas': '🍎', 'Mecánica y autos': '🚗',
    'Tecnología e informática': '💻', 'Educación y capacitación': '📚', 'Belleza y cuidado personal': '✨',
    'Construcción y ferretería': '🧱', 'Transporte y encomiendas': '📦', 'Tiendas y comercio': '🏪',
    'Otros servicios': '⚙️'
};

function cambiarSeccion(tipo) {
    seccionActiva = tipo;
    const espacioRotativo = document.getElementById('espacio-publicitario-rotativo');
    if (espacioRotativo) espacioRotativo.classList.add('compacto');
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.seccion-catalogo').forEach(sec => sec.classList.remove('active'));
    if (event && event.target) event.target.classList.add('active');
    const seccionTarget = document.getElementById(`seccion-${tipo}`);
    if (seccionTarget) seccionTarget.classList.add('active');
    renderizarTarjetas();
}

function filtrarCategoria(cat) {
    categoriaActiva = cat;
    document.querySelectorAll('.cat-btn').forEach(btn => btn.classList.remove('active'));
    if (event && event.target) event.target.classList.add('active');
    renderizarTarjetas();
}

function filtrarCatalogo() { renderizarTarjetas(); }

function barajar(arreglo) {
    for (let i = arreglo.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arreglo[i], arreglo[j]] = [arreglo[j], arreglo[i]];
    }
    return arreglo;
}
async function cargarCatalogo() {
    try {
        const [resAnuncios, resCodigos, resPub] = await Promise.all([
            fetch(`https://airtable.com{BASE_ID}/CatalogoComercial?filterByFormula=%7BAprobado%7D%3D1`, {
                headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` }
            }),
            fetch(`https://airtable.com{BASE_ID}/CodigosPrepagados`, {
                headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` }
            }),
            fetch(`https://airtable.com{BASE_ID}/PublicidadPatrocinada?filterByFormula=%7BActivo%7D%3D1`, {
                headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` }
            })
        ]);

        const datosAnuncios = await resAnuncios.json();
        const datosCodigos = await resCodigos.json();
        const datosPub = await resPub.json();

        datosAnunciosGlobales = barajar(datosAnuncios.records || []);
        codigosValidosGlobales = datosCodigos.records ? datosCodigos.records.map(r => r.fields['Código']) : [];
        
        const hoy = new Date();
        publicidadGlobales = datosPub.records ? datosPub.records.filter(r => {
            const fCaducidad = r.fields['Fecha Caducidad'] ? new Date(r.fields['Fecha Caducidad']) : null;
            return !fCaducidad || fCaducidad >= hoy;
        }) : [];

        iniciarCarruselPatrocinadores();
        renderizarTarjetas();
    } catch (error) {
        console.error("Error al sincronizar datos comerciales Okinawa:", error);
    }
}

function iniciarCarruselPatrocinadores() {
    const espacioRotativo = document.getElementById('espacio-publicitario-rotativo');
    if (!espacioRotativo) return;
    espacioRotativo.innerHTML = '<span class="badge-patrocinio">Patrocinados</span>';

    if (publicidadGlobales.length === 0) {
        espacioRotativo.innerHTML += `<div style="color:#555; font-size:0.8rem; padding:1.5rem 0;">Espacio Publicitario Disponible</div>`;
        return;
    }

    publicidadGlobales.forEach((pub, index) => {
        const campos = pub.fields;
        if (campos['Imagen Publicitaria'] && campos['Imagen Publicitaria'].length > 0) {
            const img = document.createElement('img');
            img.src = campos['Imagen Publicitaria'][0].url; // Arreglado apuntando al index [0]
            img.alt = campos['Nombre Patrocinador'] || 'Publicidad';
            if (index === 0) img.classList.add('active');
            espacioRotativo.appendChild(img);
        }
    });

    const imagenes = espacioRotativo.querySelectorAll('img');
    if (imagenes.length <= 1) return;

    let idxActual = 0;
    if (intervaloCarrusel) clearInterval(intervaloCarrusel);
    intervaloCarrusel = setInterval(() => {
        imagenes[idxActual].classList.remove('active');
        idxActual = (idxActual + 1) % imagenes.length;
        imagenes[idxActual].classList.add('active');
    }, 4000);
}
function renderizarTarjetas() {
    const contenedorProductos = document.getElementById('contenedor-productos');
    const contenedorServicios = document.getElementById('contenedor-servicios');
    const buscadorInput = document.getElementById('buscador');
    const busqueda = buscadorInput ? buscadorInput.value.toLowerCase() : '';
    
    if (contenedorProductos) contenedorProductos.innerHTML = '';
    if (contenedorServicios) contenedorServicios.innerHTML = '';
    if (!seccionActiva) return;

    const ahora = new Date();

    datosAnunciosGlobales.forEach(registro => {
        const campos = registro.fields;
        const tipo = campos['Tipo de Publicación'];
        const categoria = campos['Categoría'] || 'Otros servicios';
        const codigoIngresado = campos['Código de Pago Plus'];
        const esPlusReal = campos['Plan / Nivel'] === 'Plus' && codigosValidosGlobales.includes(codigoIngresado);

        if ((seccionActiva === 'productos' && tipo !== 'Producto') || (seccionActiva === 'servicios' && tipo !== 'Servicio')) return;

        if (tipo === 'Producto') {
            const fechaReferencia = new Date(campos['Fecha de Aprobación'] || registro.createdTime);
            const diferenciaHoras = (ahora - fechaReferencia) / (1000 * 60 * 60);
            if (diferenciaHoras > 24) return; 
        }

        if (categoriaActiva !== 'Todos' && categoria !== categoriaActiva) return;

        const nombreComercial = (campos['Nombre Comercial'] || '').toLowerCase();
        const tituloAnuncio = (campos['Título del Anuncio'] || '').toLowerCase();
        if (busqueda && !nombreComercial.includes(busqueda) && !tituloAnuncio.includes(busqueda)) return;

        const icono = iconosCategorias[categoria] || '⚙️';

        const tarjetaHtml = `
            <div class="card ${esPlusReal ? 'card-premium' : ''}" onclick="abrirModal('${registro.id}')">
                <div>
                    <h3 class="card-nombre-comercial">${campos['Nombre Comercial'] || 'Negocio'}</h3>
                    <p class="card-titulo-anuncio">${campos['Título del Anuncio'] || 'Sin título'}</p>
                </div>
                <div class="card-meta">
                    <p class="card-precio">${campos['Precio / Tarifa'] || 'A consultar'}</p>
                    <span class="card-badge-cat">${icono}</span>
                </div>
            </div>
        `;

        if (tipo === 'Producto' && contenedorProductos) contenedorProductos.innerHTML += tarjetaHtml;
        if (tipo === 'Servicio' && contenedorServicios) contenedorServicios.innerHTML += tarjetaHtml;
    });

    if(seccionActiva === 'productos' && contenedorProductos && contenedorProductos.innerHTML === '') {
        contenedorProductos.innerHTML = '<p>No hay ofertas de productos vigentes hoy.</p>';
    }
    if(seccionActiva === 'servicios' && contenedorServicios && contenedorServicios.innerHTML === '') {
        contenedorServicios.innerHTML = '<p>No hay servicios comerciales en esta categoría.</p>';
    }
}

function abrirModal(idRegistro) {
    const registro = datosAnunciosGlobales.find(r => r.id === idRegistro);
    if(!registro) return;

    const campos = registro.fields;
    const codigoIngresado = campos['Código de Pago Plus'];
    const esPlusReal = campos['Plan / Nivel'] === 'Plus' && codigosValidosGlobales.includes(codigoIngresado);

    const imgContenedor = document.getElementById('modal-imagen-contenedor');
    if (imgContenedor) {
        if (campos.Fotos && campos.Fotos.length > 0) {
            imgContenedor.innerHTML = `<img src="${campos.Fotos[0].url}" alt="Imagen comercial">`; // Arreglado apuntando al index [0]
            imgContenedor.style.display = "block";
        } else {
            imgContenedor.innerHTML = `<img src="https://placeholder.com" alt="Sin imagen">`;
        }
    }

    const badgeContenedor = document.getElementById('modal-badge-contenedor');
    if (badgeContenedor) {
        badgeContenedor.innerHTML = esPlusReal ? '<span class="modal-badge">Anuncio Destacado ✨</span>' : '';
    }
    
    document.getElementById('modal-nombre-comercial').innerText = campos['Nombre Comercial'] || 'Establecimiento';
    document.getElementById('modal-titulo-anuncio').innerText = campos['Título del Anuncio'] || 'Sin título';
    document.getElementById('modal-descripcion').innerText = campos['Descripción o Actividad'] || 'Sin descripción disponible.';
    document.getElementById('modal-precio').innerHTML = `<strong>Precio:</strong> ${campos['Precio / Tarifa'] || 'A consultar'}`;

    const contactoContenedor = document.getElementById('modal-contacto-visible');
    if (contactoContenedor) {
        if(esPlusReal && campos['Teléfono de WhatsApp']) {
            contactoContenedor.innerHTML = `<div class="modal-info-contacto">📱 Teléfono Directo: ${campos['Teléfono de WhatsApp']}</div>`;
            contactoContenedor.style.display = "block";
        } else {
            contactoContenedor.style.display = "none";
        }
    }

    const numeroWhatsApp = campos['Teléfono de WhatsApp'] || '';
    const textoMensaje = encodeURIComponent('Hola, solicito información sobre tu anuncio que vi en el Catálogo Comercial.');
    const enlaceWspCompleto = `https://wa.me{numeroWhatsApp}?text=${textoMensaje}`;
    
    const btnWsp = document.getElementById('modal-btn-action-wsp');
    if (btnWsp) {
        const nuevoBtnWsp = btnWsp.cloneNode(true);
        btnWsp.parentNode.replaceChild(nuevoBtnWsp, btnWsp);
        nuevoBtnWsp.addEventListener('click', () => {
            if (esPlusReal) { window.open(enlaceWspCompleto, '_blank'); } 
            else { activarMuroWhatsApp(enlaceWspCompleto); }
        });
    }

    const btnMapa = document.getElementById('modal-btn-mapa');
    if (btnMapa) {
        if(esPlusReal && campos['Enlace de Google Maps']) {
            btnMapa.href = campos['Enlace de Google Maps'];
            btnMapa.style.display = "flex";
        } else { btnMapa.style.display = "none"; }
    }

    const modalDetalle = document.getElementById('modal-detalle');
    if (modalDetalle) modalDetalle.style.display = "flex";
}

function activarMuroWhatsApp(enlaceFinalWsp) {
    const mediaWhatsApp = document.getElementById('media-whatsapp');
    if (mediaWhatsApp && publicidadGlobales.length > 0) {
        const publicidadesMezcladas = barajar([...publicidadGlobales]);
        const bannerSalida = publicidadesMezcladas[0].fields; // Arreglado apuntando al index [0]
        if(bannerSalida['Imagen Publicitaria'] && bannerSalida['Imagen Publicitaria'].length > 0) {
            mediaWhatsApp.innerHTML = `<img src="${bannerSalida['Imagen Publicitaria'][0].url}" alt="Publicidad Salida">`; // Arreglado index de imagen [0]
        }
    } else if (mediaWhatsApp) {
        mediaWhatsApp.innerHTML = `<div style="padding:10rem 1rem; color:#666;">📢 Conectando de manera segura...</div>`;
    }

    let tiempoRestante = 5;
    const txtSegundos = document.getElementById('timer-whatsapp');
    if (txtSegundos) txtSegundos.innerText = tiempoRestante;
    const muroWsp = document.getElementById('muro-whatsapp');
    if (muroWsp) muroWsp.style.display = "flex";

    const intervaloSalida = setInterval(() => {
        tiempoRestante--;
        if (txtSegundos) txtSegundos.innerText = tiempoRestante;
        if (tiempoRestante <= 0) {
            clearInterval(intervaloSalida);
            if (muroWsp) muroWsp.style.display = "none";
            window.location.href = enlaceFinalWsp; 
        }
    }, 1000);
}

function cerrarModal() { 
    const modalDetalle = document.getElementById('modal-detalle');
    if (modalDetalle) modalDetalle.style.display = "none"; 
}

function cerrarModalExterno(e) { if(e.target.id === 'modal-detalle') cerrarModal(); }

document.addEventListener('DOMContentLoaded', cargarCatalogo);
