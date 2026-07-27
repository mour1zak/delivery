// Carregamento dinâmico de header e footer
class LayoutLoader {
    static async loadHeader() {
        try {
            const response = await fetch('/components/header.html');
            const html = await response.text();
            
            // Criar elemento header
            const headerPlaceholder = document.getElementById('header-placeholder');
            if (headerPlaceholder) {
                headerPlaceholder.innerHTML = html;
                
                // Marcar link ativo
                this.setActiveLink();
                
                // Configurar menu mobile
                this.setupMobileMenu();
            }
        } catch (error) {
            console.error('Erro ao carregar header:', error);
        }
    }

    static async loadFooter() {
        try {
            const response = await fetch('/components/footer.html');
            const html = await response.text();
            
            const footerPlaceholder = document.getElementById('footer-placeholder');
            if (footerPlaceholder) {
                footerPlaceholder.innerHTML = html;
            }
        } catch (error) {
            console.error('Erro ao carregar footer:', error);
        }
    }

    static setActiveLink() {
        const currentPath = window.location.pathname;
        const links = document.querySelectorAll('.nav-link');
        
        links.forEach(link => {
            const href = link.getAttribute('href');
            if (currentPath.includes(href.replace('/dashboard/', '').replace('/clientes/', '').replace('/produtos/', '').replace('/pedidos/', ''))) {
                link.classList.add('active');
            }
        });
    }

    static setupMobileMenu() {
        const menuButton = document.querySelector('.btn-mobile-menu');
        const nav = document.querySelector('.main-nav');
        
        if (menuButton && nav) {
            menuButton.addEventListener('click', () => {
                nav.classList.toggle('active');
            });
        }
    }

    // Inicializar layout
    static async init() {
        await this.loadHeader();
        await this.loadFooter();
    }
}

// Auto-inicializar quando o DOM estiver pronto
// Carregar Header e Footer
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Carregar Header
        const headerResponse = await fetch('/components/header.html');
        const headerHtml = await headerResponse.text();
        document.getElementById('header-placeholder').innerHTML = headerHtml;
        
        // Carregar Footer
        const footerResponse = await fetch('/components/footer.html');
        const footerHtml = await footerResponse.text();
        document.getElementById('footer-placeholder').innerHTML = footerHtml;
        
        // Atualizar link ativo
        const currentPath = window.location.pathname;
        document.querySelectorAll('.nav-link').forEach(link => {
            if (currentPath.includes(link.getAttribute('href'))) {
                link.classList.add('active');
            }
        });
        
        // Menu mobile
        const mobileBtn = document.querySelector('.btn-mobile-menu');
        const nav = document.querySelector('.main-nav');
        if (mobileBtn && nav) {
            mobileBtn.addEventListener('click', () => {
                nav.classList.toggle('active');
            });
        }
    } catch (error) {
        console.error('Erro ao carregar header/footer:', error);
    }
});