// ===== NÚMERO DE WHATSAPP =====
const WHATSAPP_NUMBER = "525660797723";

// ===== INICIALIZACIÓN PRINCIPAL =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('Main.js cargado - inicializando...');
    
    // Inicializar funciones generales para TODAS las páginas
    initMobileMenu();
    initSmoothScroll();
    initWhatsAppButton();
    initServiciosContacto();
    
    // Verificar si estamos en la tienda
    if (document.getElementById('productGrid')) {
        console.log('Página de tienda detectada - cargando productos');
        
        // Inicializar funciones específicas de la tienda
        initFilters();
        initSearch();
        initModalClose();
        
        // Renderizar productos si la función existe
        if (typeof window.renderProductos === 'function') {
            window.renderProductos('todo');
        } else {
            console.error('Error: renderProductos no está definida');
        }
    } else {
        console.log('Página principal - solo funciones generales');
    }
});

// ===== MENÚ MÓVIL =====
function initMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
        
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
            });
        });
    }
}

// ===== FILTROS DE PRODUCTOS =====
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

// ===== BÚSQUEDA EN TIEMPO REAL =====
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

// ===== CIERRE DE MODAL =====
function initModalClose() {
    const modal = document.getElementById('productModal');
    const closeBtn = document.getElementById('closeModalBtn');
    
    if (modal) {
        if (closeBtn) {
            closeBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                if (typeof Lightbox !== 'undefined' && Lightbox) {
                    Lightbox.cerrarModal();
                }
            });
        }
        
        modal.addEventListener('click', function(e) {
            if (e.target === this || e.target.classList.contains('modal-overlay')) {
                if (typeof Lightbox !== 'undefined' && Lightbox) {
                    Lightbox.cerrarModal();
                }
            }
        });
    }
    
    // Cerrar visor de imagen
    const viewer = document.getElementById('imageViewer');
    const viewerClose = document.getElementById('imageViewerClose');
    
    if (viewer && viewerClose) {
        viewerClose.addEventListener('click', function() {
            if (typeof Lightbox !== 'undefined' && Lightbox) {
                Lightbox.cerrarVisor();
            }
        });
        
        viewer.addEventListener('click', function(e) {
            if (e.target === this) {
                if (typeof Lightbox !== 'undefined' && Lightbox) {
                    Lightbox.cerrarVisor();
                }
            }
        });
    }
}

// ===== SCROLL SUAVE =====
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

// ===== ENLACES DE SERVICIOS =====
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

// ===== BOTÓN WHATSAPP =====
function initWhatsAppButton() {
    const isShop = document.body.classList.contains('bg-light');
    const waFloat = document.querySelector('.whatsapp-float');
    if (isShop && waFloat) {
        waFloat.style.display = 'none';
    }
}

// ===== FUNCIÓN DE RESPALDO PARA CERRAR MODAL =====
window.closeModal = function() {
    const modal = document.getElementById('productModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
};