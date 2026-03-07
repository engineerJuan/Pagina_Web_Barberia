// Define el número de WhatsApp principal y establece el evento que arranca toda la lógica de la página una vez que el HTML se ha cargado por completo. Dependiendo de si detecta la cuadrícula de productos (lo que indica que es la página de la tienda), inicializa las funciones específicas de búsqueda y filtros, o solo las utilidades generales de la página principal.
const WHATSAPP_NUMBER = "527299635417";

document.addEventListener('DOMContentLoaded', function() {
    console.log('Main.js cargado - inicializando...');
   
    initMobileMenu();
    initSmoothScroll();
    initWhatsAppButton();
    initServiciosContacto();
    initScrollAnimation();
   
    if (document.getElementById('productGrid')) {
        console.log('Página de tienda detectada - cargando productos');
       
        initFilters();
        initSearch();
        initModalClose();
       
        if (typeof window.renderProductos === 'function') {
            window.renderProductos('todo');
        } else {
            console.error('Error: renderProductos no está definida');
        }
    } else {
        console.log('Página principal - solo funciones generales');
    }
});

// Configura un observador de intersección (IntersectionObserver) para animar las secciones de la página conforme el usuario hace scroll hacia abajo. Cada vez que una sección entra en el área visible de la pantalla, le aplica una transición para que aparezca suavemente moviéndose hacia arriba.
function initScrollAnimation() {
    const sections = document.querySelectorAll('section');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });
    
    sections.forEach(section => {
        observer.observe(section);
    });
}

// Controla el comportamiento del menú de navegación tipo hamburguesa en dispositivos móviles. Permite abrir y cerrar el menú lateral, bloquea el scroll de la página de fondo cuando está abierto, y se asegura de cerrarlo automáticamente si el usuario hace clic en un enlace o fuera de su área.
function initMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
   
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : 'auto';
        });
       
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                document.body.style.overflow = 'auto';
            });
        });
       
        document.addEventListener('click', function(event) {
            if (!navMenu.contains(event.target) && !menuToggle.contains(event.target) && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        });
    }
}

// Inicializa y maneja el sistema de filtros por categorías de la tienda. Al hacer clic en un botón de filtro (píldora), actualiza visualmente cuál botón está activo y llama a la función global para renderizar únicamente los productos que correspondan a la categoría seleccionada.
function initFilters() {
    const filterPills = document.querySelectorAll('.pill');
   
    if (filterPills.length > 0) {
        filterPills.forEach(pill => {
            pill.addEventListener('click', handleFilterClick);
        });
    }
}

function handleFilterClick(event) {
    const pill = event.currentTarget;
   
    document.querySelectorAll('.pill').forEach(p => {
        p.classList.remove('active');
    });
   
    pill.classList.add('active');
   
    const filter = pill.dataset.filter;
    if (typeof window.renderProductos === 'function') {
        window.renderProductos(filter);
    }
}

// Activa la funcionalidad de la barra de búsqueda en tiempo real aplicando un retraso (debounce) de 300 milisegundos. Esto optimiza el rendimiento evitando que la búsqueda se ejecute por cada letra escrita, esperando a que el usuario termine de teclear.
function initSearch() {
    const searchInput = document.getElementById('searchInput');
   
    if (searchInput) {
        searchInput.addEventListener('input', handleSearchInput);
    }
}

function handleSearchInput(event) {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
        if (typeof window.buscarProductos === 'function') {
            window.buscarProductos();
        }
    }, 300);
}

// Configura todos los eventos necesarios para cerrar correctamente las ventanas emergentes (el modal del producto y el visor de imágenes). Permite cerrarlos haciendo clic en el botón de la "X", en el fondo oscuro, o mediante la lógica propia del Lightbox si este está activo en la página.
function initModalClose() {
    const modal = document.getElementById('productModal');
    const closeBtn = document.getElementById('closeModalBtn');
   
    if (modal) {
        if (closeBtn) {
            closeBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                if (typeof Lightbox !== 'undefined' && Lightbox) {
                    Lightbox.cerrarModal();
                } else {
                    window.closeModal();
                }
            });
        }
       
        modal.addEventListener('click', function(e) {
            if (e.target === this || e.target.classList.contains('modal-overlay')) {
                if (typeof Lightbox !== 'undefined' && Lightbox) {
                    Lightbox.cerrarModal();
                } else {
                    window.closeModal();
                }
            }
        });
    }
   
    const viewer = document.getElementById('imageViewer');
    const viewerClose = document.getElementById('imageViewerClose');
   
    if (viewer && viewerClose) {
        viewerClose.addEventListener('click', function() {
            if (typeof Lightbox !== 'undefined' && Lightbox) {
                Lightbox.cerrarVisor();
            } else {
                if (viewer) viewer.classList.remove('active');
            }
        });
       
        viewer.addEventListener('click', function(e) {
            if (e.target === this) {
                if (typeof Lightbox !== 'undefined' && Lightbox) {
                    Lightbox.cerrarVisor();
                } else {
                    viewer.classList.remove('active');
                }
            }
        });
    }
}

// Implementa un desplazamiento suave (smooth scroll) para todos los enlaces internos de la página que apuntan a un ancla (#). Esto evita el salto brusco predeterminado del navegador y desliza la vista de forma fluida hasta la sección deseada.
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });
}

// Maneja los clics en los enlaces que dirigen directamente a la sección de servicios. Desplaza la pantalla suavemente hacia esa área y le aplica un breve efecto de destello en el color de fondo para indicarle visualmente al usuario dónde se encuentra.
function initServiciosContacto() {
    const servicioLinks = document.querySelectorAll('.servicio-link');
   
    servicioLinks.forEach(link => {
        link.addEventListener('click', handleServicioClick);
    });
}

function handleServicioClick(e) {
    e.preventDefault();
   
    const serviciosSection = document.getElementById('servicios');
   
    if (serviciosSection) {
        serviciosSection.scrollIntoView({ behavior: 'smooth' });
       
        serviciosSection.style.transition = 'background-color 0.5s ease';
        serviciosSection.style.backgroundColor = '#F5F5F5';
       
        setTimeout(() => {
            serviciosSection.style.backgroundColor = 'transparent';
        }, 500);
    }
}

// Controla la visibilidad del botón flotante de WhatsApp dependiendo del contexto. Lo oculta automáticamente si detecta que el usuario está en la página de la tienda (para no interferir con el diseño) y lo mantiene visible en las demás páginas.
function initWhatsAppButton() {
    const isShop = document.body.classList.contains('bg-light');
    const waFloat = document.querySelector('.whatsapp-float');
    if (isShop && waFloat) {
        waFloat.style.display = 'none';
    } else if (waFloat) {
        waFloat.style.display = 'flex';
    }
}

// Expone varias funciones y métodos de inicialización al objeto global (window) para que puedan ser utilizadas desde cualquier parte del código o llamadas directamente desde los atributos "onclick" en el HTML (como cerrar modales de emergencia y navegar entre páginas).
window.closeModal = function() {
    const modal = document.getElementById('productModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
   
    const viewer = document.getElementById('imageViewer');
    if (viewer) {
        viewer.classList.remove('active');
    }
};

window.irAInicio = function() {
    window.location.href = 'index.html';
};

window.irATienda = function() {
    window.location.href = 'tienda.html';
};

window.irAAdmin = function() {
    window.location.href = 'admin-panel.html';
};

window.initMobileMenu = initMobileMenu;
window.initSmoothScroll = initSmoothScroll;
window.initWhatsAppButton = initWhatsAppButton;
window.initServiciosContacto = initServiciosContacto;
window.initFilters = initFilters;
window.initSearch = initSearch;
window.initModalClose = initModalClose;
window.initScrollAnimation = initScrollAnimation;