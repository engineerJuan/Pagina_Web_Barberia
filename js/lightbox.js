const Lightbox = {
    currentProduct: null,
    currentIndex: 0,
    tallaSeleccionada: null,
    currentImages: [],
    currentViewerIndex: 0,
   
    init: function() {
        console.log('Lightbox inicializado');
        this.configurarEventos();
    },
   
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
   
    abrirVisor: function(imagenes, index) {
        console.log('Abriendo visor en índice:', index);
       
        this.currentImages = [...imagenes];
        this.currentViewerIndex = index;
       
        const viewer = document.getElementById('imageViewer');
        const viewerContainer = document.querySelector('.image-viewer-container');
        const counter = document.getElementById('imageViewerCounter');
       
        if (!viewer || !viewerContainer || !counter) return;
       
        viewerContainer.innerHTML = '';
       
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
            viewer.addEventListener('click', (e) => {
                if (e.target === viewer) {
                    this.cerrarVisor();
                }
            });
        }
    },
   
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
   
    cerrarVisor: function() {
        const viewer = document.getElementById('imageViewer');
        if (viewer) {
            viewer.classList.remove('active');
            const viewerContainer = document.querySelector('.image-viewer-container');
            if (viewerContainer) {
                viewerContainer.innerHTML = '';
                viewerContainer.onscroll = null;
            }
        }
        document.body.style.overflow = 'auto';
    },
   
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

document.addEventListener('DOMContentLoaded', function() {
    Lightbox.init();
});

window.Lightbox = Lightbox;