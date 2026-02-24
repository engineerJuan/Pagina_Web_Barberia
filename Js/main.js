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

function initWhatsAppButton() {
    const isShop = document.body.classList.contains('bg-light');
    const waFloat = document.querySelector('.whatsapp-float');
    if (isShop && waFloat) {
        waFloat.style.display = 'none';
    } else if (waFloat) {
        waFloat.style.display = 'flex';
    }
}

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