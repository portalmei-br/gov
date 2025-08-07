// Variáveis globais
let fontSize = 16;
let isHighContrast = false;

// Inicialização quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    initializeForm();
    initializeAccessibility();
});

// Inicialização do formulário
function initializeForm() {
    const form = document.getElementById('consultaForm');
    const cnpjInput = document.getElementById('cnpj');
    const errorDiv = document.getElementById('cnpj-error');
    
    // Formatação automática do CNPJ
    cnpjInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        
        // Limita a 14 dígitos
        if (value.length > 14) {
            value = value.substring(0, 14);
        }
        
        // Aplica a formatação
        if (value.length > 0) {
            value = value.replace(/^(\d{2})(\d)/, '$1.$2');
            value = value.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
            value = value.replace(/\.(\d{3})(\d)/, '.$1/$2');
            value = value.replace(/(\d{4})(\d)/, '$1-$2');
        }
        
        e.target.value = value;
        
        // Remove erro se o campo estiver sendo editado
        if (errorDiv.textContent) {
            clearError();
        }
    });
    
    // Validação em tempo real
    cnpjInput.addEventListener('blur', function(e) {
        const cnpj = e.target.value.replace(/\D/g, '');
        if (cnpj && !isValidCNPJ(cnpj)) {
            showError('CNPJ inválido. Verifique os números digitados.');
        }
    });
    
    // Submissão do formulário
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        handleFormSubmit();
    });
}

// Validação de CNPJ
function isValidCNPJ(cnpj) {
    // Remove caracteres não numéricos
    cnpj = cnpj.replace(/\D/g, '');
    
    // Verifica se tem 14 dígitos
    if (cnpj.length !== 14) return false;
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1+$/.test(cnpj)) return false;
    
    // Validação do primeiro dígito verificador
    let soma = 0;
    let peso = 5;
    
    for (let i = 0; i < 12; i++) {
        soma += parseInt(cnpj.charAt(i)) * peso;
        peso = peso === 2 ? 9 : peso - 1;
    }
    
    let digito1 = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    
    if (parseInt(cnpj.charAt(12)) !== digito1) return false;
    
    // Validação do segundo dígito verificador
    soma = 0;
    peso = 6;
    
    for (let i = 0; i < 13; i++) {
        soma += parseInt(cnpj.charAt(i)) * peso;
        peso = peso === 2 ? 9 : peso - 1;
    }
    
    let digito2 = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    
    return parseInt(cnpj.charAt(13)) === digito2;
}

// Exibir erro
function showError(message) {
    const cnpjInput = document.getElementById('cnpj');
    const errorDiv = document.getElementById('cnpj-error');
    
    cnpjInput.classList.add('error');
    errorDiv.textContent = message;
    errorDiv.style.display = 'flex';
    
    // Foco no campo com erro
    cnpjInput.focus();
}

// Limpar erro
function clearError() {
    const cnpjInput = document.getElementById('cnpj');
    const errorDiv = document.getElementById('cnpj-error');
    
    cnpjInput.classList.remove('error');
    errorDiv.textContent = '';
    errorDiv.style.display = 'none';
}

// Manipular submissão do formulário
async function handleFormSubmit() {
    const cnpjInput = document.getElementById('cnpj');
    const cnpj = cnpjInput.value.replace(/\D/g, '');
    
    // Validação
    if (!cnpj) {
        showError('Por favor, digite o CNPJ.');
        return;
    }
    
    if (!isValidCNPJ(cnpj)) {
        showError('CNPJ inválido. Verifique os números digitados.');
        return;
    }
    
    // Limpar erro
    clearError();
    
    // Mostrar loading
    showLoading(true);
    
    try {
        // Simular consulta (em produção, seria uma chamada real à API)
        await simulateAPICall();
        
        // Gerar dados fictícios para demonstração
        const dadosEmpresa = generateMockData(cnpj);
        
        // Exibir resultados
        displayResults(dadosEmpresa);
        
        // Scroll suave para os resultados
        document.getElementById('results').scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
        
    } catch (error) {
        showError('Erro ao consultar os dados. Tente novamente em alguns instantes.');
        console.error('Erro na consulta:', error);
    } finally {
        showLoading(false);
    }
}

// Mostrar/ocultar loading
function showLoading(show) {
    const btn = document.getElementById('consultarBtn');
    const btnText = document.getElementById('btnText');
    const spinner = btn.querySelector('.spinner');
    const btnIcon = btn.querySelector('.btn-icon');
    
    if (show) {
        btn.disabled = true;
        btnText.textContent = 'Consultando...';
        btnIcon.style.display = 'none';
        spinner.style.display = 'block';
    } else {
        btn.disabled = false;
        btnText.textContent = 'Consultar Pendências';
        btnIcon.style.display = 'flex';
        spinner.style.display = 'none';
    }
}

// Simular chamada à API
function simulateAPICall() {
    return new Promise(resolve => {
        setTimeout(resolve, 2000 + Math.random() * 1000);
    });
}

// Gerar dados fictícios para demonstração
function generateMockData(cnpj) {
    const empresas = [
        {
            razaoSocial: 'JOÃO SILVA SANTOS',
            nomeFantasia: 'JOÃO SILVA - MEI',
            situacao: 'ATIVA',
            naturezaJuridica: '213-5 - Empresário (Individual)',
            atividadePrincipal: '47.89-0-99 - Comércio varejista de outros produtos não especificados anteriormente',
            endereco: 'RUA DAS FLORES, 123, CENTRO, SÃO PAULO/SP, CEP: 01234-567',
            dataAbertura: '15/03/2020'
        },
        {
            razaoSocial: 'MARIA OLIVEIRA COSTA',
            nomeFantasia: 'MARIA COSTURA - MEI',
            situacao: 'ATIVA',
            naturezaJuridica: '213-5 - Empresário (Individual)',
            atividadePrincipal: '14.12-6-01 - Confecção de roupas íntimas',
            endereco: 'AV. BRASIL, 456, JARDIM AMÉRICA, RIO DE JANEIRO/RJ, CEP: 22070-011',
            dataAbertura: '22/08/2019'
        }
    ];
    
    const empresa = empresas[Math.floor(Math.random() * empresas.length)];
    
    // Gerar pendências aleatórias
    const pendencias = [];
    const numPendencias = Math.floor(Math.random() * 4); // 0 a 3 pendências
    
    const tiposPendencias = [
        {
            tipo: 'DAS em Atraso',
            descricao: 'Documento de Arrecadação do Simples Nacional em atraso.',
            valor: 'R$ 67,60',
            vencimento: '20/10/2024',
            competencia: 'Setembro/2024'
        },
        {
            tipo: 'Declaração Anual Pendente',
            descricao: 'Declaração Anual do Simples Nacional (DASN-SIMEI) não entregue.',
            valor: 'R$ 50,00',
            vencimento: '31/05/2024',
            competencia: 'Ano-base 2023'
        },
        {
            tipo: 'Taxa de Fiscalização',
            descricao: 'Taxa de fiscalização de vigilância sanitária em atraso.',
            valor: 'R$ 120,00',
            vencimento: '15/11/2024',
            competencia: 'Outubro/2024'
        }
    ];
    
    for (let i = 0; i < numPendencias; i++) {
        pendencias.push(tiposPendencias[i]);
    }
    
    return {
        cnpj: formatCNPJ(cnpj),
        ...empresa,
        pendencias
    };
}

// Formatar CNPJ
function formatCNPJ(cnpj) {
    return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
}

// Exibir resultados
function displayResults(dados) {
    // Preencher dados da empresa
    document.getElementById('dadosCnpj').textContent = dados.cnpj;
    document.getElementById('dadosRazaoSocial').textContent = dados.razaoSocial;
    document.getElementById('dadosNomeFantasia').textContent = dados.nomeFantasia || 'Não informado';
    
    // Situação com badge
    const situacaoElement = document.getElementById('dadosSituacao');
    situacaoElement.innerHTML = `<span class="badge ${dados.situacao === 'ATIVA' ? 'badge-official' : 'badge-security'}">${dados.situacao}</span>`;
    
    document.getElementById('dataAberturaTexto').textContent = dados.dataAbertura;
    document.getElementById('dadosNaturezaJuridica').textContent = dados.naturezaJuridica;
    document.getElementById('dadosAtividadePrincipal').textContent = dados.atividadePrincipal;
    document.getElementById('enderecoTexto').textContent = dados.endereco;
    
    // Exibir pendências
    displayPendencias(dados.pendencias);
    
    // Mostrar seção de resultados
    const resultsSection = document.getElementById('results');
    resultsSection.style.display = 'block';
}

// Exibir pendências
function displayPendencias(pendencias) {
    const countElement = document.getElementById('pendenciasCount');
    const listElement = document.getElementById('pendenciasList');
    const noPendenciasElement = document.getElementById('noPendencias');
    
    countElement.textContent = pendencias.length;
    
    if (pendencias.length === 0) {
        listElement.style.display = 'none';
        noPendenciasElement.style.display = 'block';
    } else {
        listElement.style.display = 'block';
        noPendenciasElement.style.display = 'none';
        
        listElement.innerHTML = pendencias.map(pendencia => `
            <div class="pendencia-item">
                <div class="pendencia-header">
                    <div>
                        <div class="pendencia-title">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            ${pendencia.tipo}
                        </div>
                        <div class="pendencia-description">${pendencia.descricao}</div>
                    </div>
                    <div class="pendencia-valor">${pendencia.valor}</div>
                </div>
                <div class="pendencia-details">
                    <div class="pendencia-detail">
                        <div class="pendencia-detail-label">Vencimento</div>
                        <div class="pendencia-detail-value">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
                                <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" stroke-width="2"/>
                                <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" stroke-width="2"/>
                                <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" stroke-width="2"/>
                            </svg>
                            ${pendencia.vencimento}
                        </div>
                    </div>
                    <div class="pendencia-detail">
                        <div class="pendencia-detail-label">Competência</div>
                        <div class="pendencia-detail-value">${pendencia.competencia}</div>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

// Funcionalidades de acessibilidade
function initializeAccessibility() {
    // Recuperar preferências salvas
    const savedFontSize = localStorage.getItem('fontSize');
    const savedHighContrast = localStorage.getItem('highContrast');
    
    if (savedFontSize) {
        fontSize = parseInt(savedFontSize);
        updateFontSize();
    }
    
    if (savedHighContrast === 'true') {
        isHighContrast = true;
        updateHighContrast();
    }
}

// Aumentar tamanho da fonte
function increaseFontSize() {
    if (fontSize < 24) {
        fontSize += 2;
        updateFontSize();
        localStorage.setItem('fontSize', fontSize.toString());
    }
}

// Diminuir tamanho da fonte
function decreaseFontSize() {
    if (fontSize > 12) {
        fontSize -= 2;
        updateFontSize();
        localStorage.setItem('fontSize', fontSize.toString());
    }
}

// Atualizar tamanho da fonte
function updateFontSize() {
    document.documentElement.style.fontSize = fontSize + 'px';
}

// Alternar alto contraste
function toggleHighContrast() {
    isHighContrast = !isHighContrast;
    updateHighContrast();
    localStorage.setItem('highContrast', isHighContrast.toString());
}

// Atualizar alto contraste
function updateHighContrast() {
    if (isHighContrast) {
        document.body.classList.add('high-contrast');
    } else {
        document.body.classList.remove('high-contrast');
    }
}

// Utilitários para melhor experiência do usuário
document.addEventListener('keydown', function(e) {
    // Atalho para consulta (Ctrl/Cmd + Enter)
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        const form = document.getElementById('consultaForm');
        if (form) {
            e.preventDefault();
            handleFormSubmit();
        }
    }
    
    // Atalho para limpar formulário (Ctrl/Cmd + R)
    if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        const cnpjInput = document.getElementById('cnpj');
        const resultsSection = document.getElementById('results');
        
        if (cnpjInput && resultsSection.style.display === 'block') {
            e.preventDefault();
            cnpjInput.value = '';
            clearError();
            resultsSection.style.display = 'none';
            cnpjInput.focus();
        }
    }
});

// Melhorar acessibilidade com foco
document.addEventListener('focusin', function(e) {
    if (e.target.matches('input, button, a, select, textarea')) {
        e.target.setAttribute('data-focused', 'true');
    }
});

document.addEventListener('focusout', function(e) {
    if (e.target.matches('input, button, a, select, textarea')) {
        e.target.removeAttribute('data-focused');
    }
});

// Detectar se o usuário prefere movimento reduzido
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.style.setProperty('--transition-fast', '0ms');
    document.documentElement.style.setProperty('--transition-normal', '0ms');
    document.documentElement.style.setProperty('--transition-slow', '0ms');
}

// Lazy loading para melhor performance
if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    });
    
    // Observar elementos que devem aparecer com animação
    document.querySelectorAll('.info-card, .result-card').forEach(el => {
        observer.observe(el);
    });
}

// Service Worker para cache (opcional, para melhor performance)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registrado com sucesso:', registration);
            })
            .catch(registrationError => {
                console.log('Falha no registro do SW:', registrationError);
            });
    });
}

