// Este objeto maneja toda la lógica de la ventana emergente (modal) y el visor de imágenes a pantalla completa. Almacena temporalmente los datos del producto actual, las imágenes, la talla seleccionada y los índices numéricos para saber qué foto específica se está visualizando en cada momento.
const Lightbox = {
    currentProduct: null,
    currentIndex: 0,
    tallaSeleccionada: null,
    currentImages: [],
    currentViewerIndex: 0,
   
    // Punto de entrada principal del Lightbox. Se ejecuta automáticamente cuando la página termina de cargar para arrancar sus funciones básicas y dejar listos los eventos que escuchan las acciones del usuario.
    init: function() {
        console.log('Lightbox inicializado');
        this.configurarEventos();
    },
   
    // Configura los "escuchadores" globales del teclado y el ratón. Permite cerrar las ventanas usando la tecla "Escape", navegar entre las fotos con las flechas de dirección (Izquierda/Derecha) y precargar las imágenes en segundo plano cuando pasas el cursor sobre un producto para que abran al instante.
    configurarEventos: function() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.cerrarModal();
                this.cerrarVisor();
            }
           
            if (e.key === 'ArrowLeft') {
                const modal = document.getElementById('productModal');
                const viewer = document.getElementById('imageViewer');
               
                if (modal?.classList.contains('active')) {
                    this.navegarImagen('prev');
                }
                if (viewer?.classList.contains('active')) {
                    this.navegarVisor('prev');
                }
            }
           
            if (e.key === 'ArrowRight') {
                const modal = document.getElementById('productModal');
                const viewer = document.getElementById('imageViewer');
               
                if (modal?.classList.contains('active')) {
                    this.navegarImagen('next');
                }
                if (viewer?.classList.contains('active')) {
                    this.navegarVisor('next');
                }
            }
        });
       
        document.addEventListener('mouseenter', (e) => {
            if (e.target.closest('.product-card')) {
                const img = e.target.closest('.product-card').querySelector('img');
                if (img && img.src && !img.src.includes('placeholder')) {
                    const preloadImg = new Image();
                    preloadImg.src = img.src;
                }
            }
        }, true);
    },
   
    // Función auxiliar que determina qué ruta de imagen usar. Revisa si la imagen solicitada es una subida reciente guardada en el almacenamiento local (localStorage); si no la encuentra ahí, devuelve la ruta original o una imagen de relleno para evitar que aparezcan cuadros rotos.
    obtenerImagen: function(ruta) {
        if (!ruta) return 'img/placeholder.jpg';
       
        const imagenesGuardadas = JSON.parse(localStorage.getItem('imagenesSubidas') || '{}');
       
        if (ruta.startsWith('uploads/') && imagenesGuardadas[ruta]) {
            return imagenesGuardadas[ruta];
        }
       
        if (ruta.startsWith('img/')) {
            return ruta;
        }
       
        return ruta;
    },
   
    // Se encarga de construir, rellenar y mostrar la ventana emergente principal del producto. Limpia el contenido visual anterior, inyecta las fotos, actualiza precio, título y características, e inicializa dinámicamente el selector de tallas y el medidor de inventario antes de hacer visible el modal.
    abrirModal: function(producto, index = 0) {
        console.log('Abriendo modal para:', producto.nombre);
       
        this.currentProduct = producto;
        this.currentIndex = index;
        this.tallaSeleccionada = null;
       
        this.currentImages = (producto.imagenes && producto.imagenes.length > 0)
            ? [...producto.imagenes]
            : [producto.img || 'img/placeholder.jpg'];
       
        const modal = document.getElementById('productModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalPrice = document.getElementById('modalPrice');
        const featuresList = document.getElementById('modalFeatures');
        const modalArea = document.getElementById('modalImageArea');
       
        if (!modal || !modalTitle || !modalPrice || !modalArea) {
            console.error('Elementos del modal no encontrados');
            return;
        }
       
        modalArea.innerHTML = '';
       
        modalTitle.textContent = producto.nombre || 'Producto';
        modalPrice.textContent = producto.precioFormato || producto.precio || '$0';
       
        this.currentImages.forEach((imgSrc, i) => {
            const img = document.createElement('img');
            img.className = 'modal-img';
            img.alt = producto.nombre || 'Producto';
            img.loading = 'lazy';
            img.setAttribute('data-index', i);
           
            const srcReal = this.obtenerImagen(imgSrc);
           
            img.onerror = () => {
                console.error('Error cargando imagen:', imgSrc);
                img.src = 'img/placeholder.jpg';
            };
           
            img.src = srcReal;
           
            img.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                const imgIndex = parseInt(e.target.getAttribute('data-index')) || 0;
                this.abrirVisor(this.currentImages, imgIndex);
            });
           
            modalArea.appendChild(img);
        });
       
        const counter = document.createElement('div');
        counter.className = 'modal-image-counter';
        counter.id = 'imageCounter';
        counter.textContent = `${index + 1} / ${this.currentImages.length}`;
        modalArea.appendChild(counter);
       
        modalArea.onscroll = () => {
            if (modalArea.children.length > 1) {
                const containerWidth = modalArea.clientWidth;
                const scrollLeft = modalArea.scrollLeft;
                const newIndex = Math.round(scrollLeft / containerWidth);
               
                if (newIndex >= 0 && newIndex < this.currentImages.length && newIndex !== this.currentIndex) {
                    this.currentIndex = newIndex;
                    const counter = document.getElementById('imageCounter');
                    if (counter) {
                        counter.textContent = `${this.currentIndex + 1} / ${this.currentImages.length}`;
                    }
                }
            }
        };
       
        setTimeout(() => {
            if (modalArea.children.length > 1) {
                modalArea.scrollLeft = index * modalArea.clientWidth;
            }
        }, 100);
       
        if (producto.caracteristicas && featuresList) {
            featuresList.innerHTML = producto.caracteristicas.map(f =>
                `<li><i class="fas fa-check-circle"></i> ${f}</li>`
            ).join('');
        } else {
            featuresList.innerHTML = '<li><i class="fas fa-check-circle"></i> Sin características</li>';
        }
       
        this.setupSizeSelector(producto);
        this.actualizarStockIndicator(producto.stock || 0);
        this.configurarNavegacionModal();
        this.configurarWhatsAppBtn();
       
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    },
   
    // Abre un visor interactivo de pantalla completa (estilo galería) al hacer clic en una foto específica dentro del modal. Carga las imágenes temporalmente, sincroniza el contador con la foto clickeada y bloquea el desplazamiento táctil para evitar saltos raros.
    abrirVisor: function(imagenes, index) {
        console.log('Abriendo visor en índice:', index);
       
        this.currentImages = [...imagenes];
        this.currentViewerIndex = index;
       
        const viewer = document.getElementById('imageViewer');
        const viewerContainer = document.querySelector('.image-viewer-container');
        const counter = document.getElementById('imageViewerCounter');
       
        if (!viewer || !viewerContainer || !counter) return;
       
        const prevImages = viewerContainer.querySelectorAll('.viewer-img');
        prevImages.forEach(img => img.remove());
       
        this.currentImages.forEach((imgSrc, i) => {
            const img = document.createElement('img');
            img.className = 'viewer-img';
            img.alt = 'Producto';
            img.loading = 'lazy';
            img.setAttribute('data-index', i);
           
            const srcReal = this.obtenerImagen(imgSrc);
           
            img.onerror = () => {
                console.error('Error en visor:', imgSrc);
                img.src = 'img/placeholder.jpg';
            };
           
            img.src = srcReal;
           
            img.addEventListener('click', (e) => {
                e.stopPropagation();
                this.cerrarVisor();
            });
           
            viewerContainer.appendChild(img);
        });
       
        counter.textContent = `${index + 1} / ${this.currentImages.length}`;
       
        viewerContainer.onscroll = () => {
            if (viewerContainer.children.length > 0) {
                const containerWidth = viewerContainer.clientWidth;
                const scrollLeft = viewerContainer.scrollLeft;
                const newIndex = Math.round(scrollLeft / containerWidth);
               
                if (newIndex >= 0 && newIndex < this.currentImages.length && newIndex !== this.currentViewerIndex) {
                    this.currentViewerIndex = newIndex;
                    counter.textContent = `${this.currentViewerIndex + 1} / ${this.currentImages.length}`;
                }
            }
        };
       
        setTimeout(() => {
            viewerContainer.scrollLeft = index * viewerContainer.clientWidth;
        }, 50);
       
        viewer.classList.add('active');
        document.body.style.overflow = 'hidden';
       
        this.configurarNavegacionVisor();
    },
   
    // Controla la lógica matemática para cambiar entre la imagen anterior y la siguiente dentro de la ventana modal. Funciona en bucle (si llegas al final, te devuelve a la primera foto) y desliza el contenedor automáticamente hasta la nueva posición.
    navegarImagen: function(direccion) {
        if (!this.currentProduct) return;
       
        const imagenes = this.currentProduct.imagenes || [this.currentProduct.img];
       
        if (direccion === 'prev') {
            this.currentIndex = (this.currentIndex - 1 + imagenes.length) % imagenes.length;
        } else {
            this.currentIndex = (this.currentIndex + 1) % imagenes.length;
        }
       
        const modalArea = document.getElementById('modalImageArea');
        if (modalArea) {
            modalArea.scrollLeft = this.currentIndex * modalArea.clientWidth;
        }
       
        const counter = document.getElementById('imageCounter');
        if (counter) {
            counter.textContent = `${this.currentIndex + 1} / ${imagenes.length}`;
        }
    },
   
    // Funciona igual que la navegación del modal principal, pero está separada para controlar de forma completamente independiente las flechas de movimiento y el contador numérico del visor a pantalla completa.
    navegarVisor: function(direccion) {
        if (!this.currentImages || this.currentImages.length === 0) return;
       
        if (direccion === 'prev') {
            this.currentViewerIndex = (this.currentViewerIndex - 1 + this.currentImages.length) % this.currentImages.length;
        } else {
            this.currentViewerIndex = (this.currentViewerIndex + 1) % this.currentImages.length;
        }
       
        const viewerContainer = document.querySelector('.image-viewer-container');
        const counter = document.getElementById('imageViewerCounter');
       
        if (viewerContainer) {
            viewerContainer.scrollLeft = this.currentViewerIndex * viewerContainer.clientWidth;
        }
       
        if (counter) {
            counter.textContent = `${this.currentViewerIndex + 1} / ${this.currentImages.length}`;
        }
    },
   
    // Vincula las acciones de clic a los botones físicos de "anterior" y "siguiente" en la ventana modal del producto. Evalúa de forma inteligente si el producto solo tiene una imagen y, en ese caso, oculta las flechas para mantener el diseño pulcro.
    configurarNavegacionModal: function() {
        const prevBtn = document.getElementById('prevImageBtn');
        const nextBtn = document.getElementById('nextImageBtn');
       
        if (!this.currentProduct) return;
       
        const imagenes = this.currentProduct.imagenes || [this.currentProduct.img];

        if (imagenes.length > 1) {
            if (prevBtn) {
                prevBtn.style.display = 'flex';
                prevBtn.onclick = (e) => {
                    e.stopPropagation();
                    this.navegarImagen('prev');
                };
            }
            if (nextBtn) {
                nextBtn.style.display = 'flex';
                nextBtn.onclick = (e) => {
                    e.stopPropagation();
                    this.navegarImagen('next');
                };
            }
        } else {
            if (prevBtn) prevBtn.style.display = 'none';
            if (nextBtn) nextBtn.style.display = 'none';
        }
    },
   
    // Establece las acciones de los botones del visor de pantalla completa (flechas y botón de cerrar). Además, configura un clic inteligente sobre el fondo oscuro que cierra todo el visor si el usuario hace clic fuera de la foto.
    configurarNavegacionVisor: function() {
        const prevBtn = document.getElementById('viewerPrevBtn');
        const nextBtn = document.getElementById('viewerNextBtn');
        const closeBtn = document.getElementById('imageViewerClose');
        const viewer = document.getElementById('imageViewer');
       
        if (prevBtn) {
            prevBtn.onclick = (e) => {
                e.stopPropagation();
                this.navegarVisor('prev');
            };
        }
       
        if (nextBtn) {
            nextBtn.onclick = (e) => {
                e.stopPropagation();
                this.navegarVisor('next');
            };
        }
       
        if (closeBtn) {
            closeBtn.onclick = (e) => {
                e.stopPropagation();
                this.cerrarVisor();
            };
        }
       
        if (viewer) {
            viewer.onclick = (e) => {
                if (e.target === viewer) {
                    this.cerrarVisor();
                }
            };
        }
    },
   
    // Apaga y oculta por completo la ventana modal principal del producto. Se encarga de limpiar el contenedor interno de imágenes para evitar consumos de memoria extraños y le devuelve a la página base su capacidad de desplazamiento normal (scroll).
    cerrarModal: function() {
        const modal = document.getElementById('productModal');
        if (modal) {
            modal.classList.remove('active');
            const modalArea = document.getElementById('modalImageArea');
            if (modalArea) {
                modalArea.innerHTML = '';
                modalArea.onscroll = null;
            }
        }
        document.body.style.overflow = 'auto';
        this.currentProduct = null;
        this.currentImages = [];
    },
   
    // Oculta el visor de pantalla completa. A diferencia del modal, este bloque destruye específicamente los elementos de imagen para que no choquen al volver a entrar, pero mantiene el fondo de la página bloqueado si la ventana modal principal de abajo sigue abierta.
    cerrarVisor: function() {
        const viewer = document.getElementById('imageViewer');
        if (viewer) {
            viewer.classList.remove('active');
            const viewerContainer = document.querySelector('.image-viewer-container');
            if (viewerContainer) {
                const images = viewerContainer.querySelectorAll('.viewer-img');
                images.forEach(img => img.remove());
                viewerContainer.onscroll = null;
            }
        }
        
        const modal = document.getElementById('productModal');
        if (modal && modal.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
    },
   
    // Evalúa si el producto mostrado es de la categoría "ropa" para generar dinámicamente un menú interactivo con las tallas disponibles (S, M, L, XL). Aplica clases especiales a los botones, tachando o deshabilitando las tallas que tengan un stock menor o igual a cero.
    setupSizeSelector: function(producto) {
        const tallaSection = document.getElementById('talla-section');
        const tallaContainer = document.getElementById('talla-botones');
        const errorMsg = document.getElementById('talla-error');
        const tallasInfo = document.getElementById('tallas-disponibles-info');
       
        if (!tallaSection || !tallaContainer) return;
       
        tallaContainer.innerHTML = '';
       
        const esRopa = producto.categoria && producto.categoria.toLowerCase() === 'ropa';
        const tieneTallas = producto.stockPorTalla && Object.keys(producto.stockPorTalla).length > 0;
       
        if (esRopa && tieneTallas) {
            tallaSection.style.display = 'block';
           
            const tallasDisponibles = producto.stockPorTalla;
            let totalStock = 0;
           
            Object.values(tallasDisponibles).forEach(stock => {
                totalStock += stock;
            });
           
            if (tallasInfo) {
                tallasInfo.textContent = `${totalStock} DISPONIBLES`;
            }
           
            const tallasOrdenadas = ['S', 'M', 'L', 'XL'];
           
            tallasOrdenadas.forEach(talla => {
                if (tallasDisponibles.hasOwnProperty(talla)) {
                    const stock = tallasDisponibles[talla];
                   
                    const btn = document.createElement('button');
                    btn.className = `talla-btn ${stock <= 0 ? 'disabled' : ''}`;
                    btn.innerText = talla;
                   
                    if (stock > 0) {
                        btn.title = `${stock} disponibles`;
                        btn.onclick = (e) => {
                            e.stopPropagation();
                            document.querySelectorAll('.talla-btn').forEach(b => b.classList.remove('selected'));
                            btn.classList.add('selected');
                            this.tallaSeleccionada = talla;
                            if (errorMsg) errorMsg.style.display = 'none';
                        };
                    } else {
                        btn.title = "Talla agotada";
                        btn.disabled = true;
                    }
                   
                    tallaContainer.appendChild(btn);
                }
            });
        } else {
            tallaSection.style.display = 'none';
        }
    },
   
    // Lee la cantidad total del producto en el inventario y adapta la etiqueta visual superior del modal cambiando sus clases CSS para indicarle al cliente si hay buen stock (verde), si quedan pocas piezas (amarillo) o si el producto ya está agotado (rojo).
    actualizarStockIndicator: function(stock) {
        const indicator = document.getElementById('stockIndicator');
        const badge = document.getElementById('stockBadge');
        const text = document.getElementById('stockText');
       
        if (!indicator || !badge || !text) return;
       
        if (stock > 5) {
            badge.className = 'stock-badge in-stock';
            text.textContent = `${stock} unidades disponibles`;
        } else if (stock > 0) {
            badge.className = 'stock-badge low-stock';
            text.textContent = `¡Últimas ${stock} unidades!`;
        } else {
            badge.className = 'stock-badge out-of-stock';
            text.textContent = 'Producto agotado';
        }
    },
   
    // Controla la lógica del botón grande para comprar. Obliga al cliente a seleccionar una talla antes de continuar (mostrando un mensaje de error si se lo salta) y posteriormente genera el enlace oficial de WhatsApp concatenando el nombre, el precio y la talla seleccionada.
    configurarWhatsAppBtn: function() {
        const waBtn = document.getElementById('btnWhatsappModal');
        const errorMsg = document.getElementById('talla-error');
        const tallaSection = document.getElementById('talla-section');
       
        if (!waBtn) return;
       
        waBtn.onclick = (e) => {
            e.preventDefault();
           
            if (tallaSection && tallaSection.style.display !== 'none' && !this.tallaSeleccionada) {
                if (errorMsg) errorMsg.style.display = 'block';
                return;
            }
           
            const producto = this.currentProduct;
            if (!producto) return;
           
            let mensaje = `Hola, me interesa el producto: ${producto.nombre} - ${producto.precio}`;
           
            if (this.tallaSeleccionada) {
                mensaje += ` en talla ${this.tallaSeleccionada}`;
            }
           
            mensaje += `. ¿Podrían confirmar disponibilidad? Gracias.`;
            window.open(`https://wa.me/527299635417?text=${encodeURIComponent(mensaje)}`, '_blank');
        };
    }
};

// Bloque de código final que espera obligatoriamente a que toda la estructura HTML esté procesada por el navegador. Una vez lista, da el banderazo de salida disparando la función de inicialización del objeto Lightbox.
document.addEventListener('DOMContentLoaded', function() {
    Lightbox.init();
});

// Convierte el objeto privado Lightbox en una herramienta global del navegador (window). Esto garantiza que cualquier botón HTML externo o script diferente pueda utilizar sus funciones sin importar desde dónde se invoque.
window.Lightbox = Lightbox;