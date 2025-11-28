// Script com Firebase Firestore v12 pra dados compartilhados em tempo real
import { collection, addDoc, deleteDoc, doc, onSnapshot } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', async function() {
    const painel = document.getElementById('painel-info');
    const conteudoPainel = document.getElementById('conteudo-painel');
    const modal = document.getElementById('modal-adicionar');
    const menuHamburguer = document.getElementById('menu-hamburguer');
    const menuDropdown = document.getElementById('menu-dropdown');
    const opcaoAdicionar = document.getElementById('opcao-adicionar');
    const opcaoSobre = document.getElementById('opcao-sobre');
    const sobreNos = document.getElementById('sobre-nos');
    const fecharSobre = document.getElementById('fechar-sobre');
    const fecharModal = document.getElementById('fechar-modal');
    const form = document.getElementById('form-adicionar');
    const quadrosContainer = document.querySelector('.quadros');
    
    let logado = false; // Flag pra senha
    const db = window.db; // Firebase db (inicializado no index.html)
    const insetosRef = collection(db, 'insetos'); // Coleção no Firestore
    
    // Função pra carregar insetos em tempo real
    function carregarInsetos() {
        onSnapshot(insetosRef, (snapshot) => {
            quadrosContainer.innerHTML = ''; // Limpa e recria tudo
            
            // Adicionar quadros fixos (exemplos)
            const exemplos = [
            
            ];
            
            exemplos.forEach(ex => criarQuadro(ex.info, ex.imgSrc, ex.altText, null));
            
            // Adicionar insetos do Firestore
            snapshot.forEach(docSnap => {
                const data = docSnap.data();
                criarQuadro(data.info, data.imgSrc, data.altText, docSnap.id);
            });
        });
    }
    
    // Função pra criar quadro
    function criarQuadro(info, imgSrc, altText, docId) {
        const quadro = document.createElement('div');
        quadro.className = 'quadro';
        quadro.setAttribute('data-info', info);
        
        quadro.innerHTML = `
            <img src="${imgSrc}" alt="${altText}" class="imagem-inseto">
            <button class="btn-excluir" style="display: ${logado ? 'block' : 'none'};">&times;</button>
        `;
        
        quadrosContainer.appendChild(quadro);
        
        // Aplicar eventos
        aplicarEventosQuadro(quadro, docId);
    }
    
    // Função pra aplicar eventos
    function aplicarEventosQuadro(quadro, docId) {
        const img = quadro.querySelector('.imagem-inseto');
        const info = quadro.getAttribute('data-info');
        const btnExcluir = quadro.querySelector('.btn-excluir');
        
        // Tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = info.replace(' | ', '\n\n');
        quadro.appendChild(tooltip);
        
        img.addEventListener('mouseenter', () => {
            if (window.innerWidth > 768) tooltip.style.opacity = '1';
        });
        
        img.addEventListener('mouseleave', () => {
            tooltip.style.opacity = '0';
        });
        
        // Gaveta
        img.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                painel.classList.toggle('ativo');
                if (painel.classList.contains('ativo')) {
                    conteudoPainel.textContent = info.replace(' | ', '\n\n');
                }
            } else {
                alert(info.replace(' | ', '\n\n'));
            }
        });
        
        // Excluir (agora funciona pra todos se logado)
        btnExcluir.addEventListener('click', async () => {
            if (logado) {
                if (docId) {
                    // Se é do Firestore, remove do banco
                    await deleteDoc(doc(db, 'insetos', docId));
                }
                // Sempre remove da tela
                quadro.remove();
                alert('Inseto removido!');
            } else {
                alert('Acesso negado!');
            }
        });
    }
    
    // Carregar insetos ao iniciar
    carregarInsetos();
    
    // Função pra verificar senha
    function verificarSenha() {
        const senha = prompt('Digite a chave de acesso:');
        if (senha === 'jho123') {
            logado = true;
            mostrarBotoesExcluir();
            return true;
        } else {
            alert('Chave incorreta!');
            return false;
        }
    }
    
    // Mostrar botões excluir
    function mostrarBotoesExcluir() {
        document.querySelectorAll('.btn-excluir').forEach(btn => {
            btn.style.display = 'block';
        });
    }
    
    // Função mês romano
    function mesParaRomano(mes) {
        const romanos = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
        const num = parseInt(mes);
        return num >= 1 && num <= 12 ? romanos[num - 1] : mes.toUpperCase();
    }
    
    // Menu hambúrguer
    menuHamburguer.addEventListener('click', () => {
        menuDropdown.style.display = menuDropdown.style.display === 'block' ? 'none' : 'block';
    });
    
    // Opção Adicionar
    opcaoAdicionar.addEventListener('click', () => {
        menuDropdown.style.display = 'none';
        if (verificarSenha()) modal.style.display = 'block';
    });
    
    // Opção Sobre Nós
    opcaoSobre.addEventListener('click', () => {
        menuDropdown.style.display = 'none';
        sobreNos.style.display = 'block';
    });
    
    // Fechar Sobre Nós
    fecharSobre.addEventListener('click', () => sobreNos.style.display = 'none');
    
    // Fechar modal
    fecharModal.addEventListener('click', () => modal.style.display = 'none');
    
    // Fechar modal fora
    window.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
    });
    
    // Preview imagem
    document.getElementById('imagem-file').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                document.getElementById('imagem-file').dataset.preview = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });
    
    // Submeter formulário
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (!logado) {
            alert('Acesso negado!');
            return;
        }
        
        const cidade = document.getElementById('cidade').value.trim();
        const estado = document.getElementById('estado').value.trim();
        const pais = document.getElementById('pais').value.trim();
        let data = document.getElementById('data').value.trim();
        const coletor = document.getElementById('coletor').value.trim();
        const ordem = document.getElementById('ordem').value.trim();
        const familia = document.getElementById('familia').value.trim();
        const genero = document.getElementById('genero').value.trim();
        const especie = document.getElementById('especie').value.trim();
        const imagemUrl = document.getElementById('imagem-url').value.trim();
        const imagemFile = document.getElementById('imagem-file').dataset.preview;
        
        if (!cidade || !estado || !pais || !data || !coletor || (!ordem && !familia && !genero && !especie) || (!imagemUrl && !imagemFile)) {
            alert('Preencha todos os campos!');
            return;
        }
        
        data = data.replace(/\/(\d+)\//, (match, mes) => '/' + mesParaRomano(mes) + '/');
        
        const etiquetaProcedencia = `${cidade}, ${estado}, ${pais}; ${data}; ${coletor} col.`;
        const etiquetaIdentificacao = `Ordem: ${ordem}; Família: ${familia}; Gênero: ${genero}; Espécie: ${especie}.`.replace(/; ;/g, ';').replace(/^; |; $/g, '');
        const info = `Etiqueta de Procedência: ${etiquetaProcedencia} | Etiqueta de Identificação: ${etiquetaIdentificacao}`;
        
        const imgSrc = imagemFile || imagemUrl;
        const altText = especie || genero || familia || ordem || 'Inseto';
        
        // Salvar no Firestore
        try {
            await addDoc(insetosRef, { info, imgSrc, altText });
            alert('Inseto adicionado em tempo real!');
        } catch (error) {
            alert('Erro ao salvar: ' + error.message);
        }
        
        form.reset();
        delete document.getElementById('imagem-file').dataset.preview;
        modal.style.display = 'none';
    });
});
