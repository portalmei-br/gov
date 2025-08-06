const google= JSON.parse(localStorage.getItem('google')) || {};
const params = Object.entries(google)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');

$(document).ready(function() {
    console.log("Documento pronto");
    
    // Captura o parÃ¢metro service da URL
    const urlParams = new URLSearchParams(window.location.search);
    const service = urlParams.get('service');
    console.log("Service capturado:", service);
    
    // Define o serviÃ§o e valor baseado no cÃ³digo
    let serviceName = '';
    let serviceValue = 0;
    
    if (service) {
        switch(service) {
            case '2025s01':
                serviceName = 'RG - Primeira Via';
                serviceValue = 5131; // 51.31 * 100
                break;
            case '2025s02':
                serviceName = 'RG - Segunda Via';
                serviceValue = 5632; // 56.32 * 100
                break;
            case '2025s03':
                serviceName = 'CNH - Primeira Via';
                serviceValue = 6827; // 68.27 * 100
                break;
            case '2025s04':
                serviceName = 'CNH - RenovaÃ§Ã£o';
                serviceValue = 13317; // 133.17 * 100
                break;
            case '2025s05':
                serviceName = 'CNH - Definitiva';
                serviceValue = 14456; // 144.56 * 100
                break;
            default:
                serviceName = 'ServiÃ§o nÃ£o identificado';
                serviceValue = 0;
        }
        
        // Atualiza o resumo com o serviÃ§o e valor
        $('.item-resumo:first span:last').text(serviceName);
        $('.item-resumo:last span:last').text('R$ ' + (serviceValue / 100).toFixed(2));
        
        // Atualiza os campos hidden
        $('#valor').val(serviceValue);
        $('#produto').val(serviceName);
        
        console.log("Valor atualizado no campo hidden:", $('#valor').val());
        console.log("Produto atualizado no campo hidden:", $('#produto').val());
    }
});

$('select').each(function () {
    var name = $(this).attr('id');
    var $this = $(this),
    numberOfOptions = $(this).children('option').length;
    $this.wrap('<div class="select"></div>');
    $this.after('<div class="styledSelect '+name+'"><span></span></div>');
    var $styledSelect = $this.next('div.styledSelect');
    $styledSelect.text($this.children('option').eq(0).text());
    var $list = $('<ul />', {
        'class': 'options'
    }).insertAfter($styledSelect);

  for (var i = 0; i < numberOfOptions; i++) {
      $('<li />', {
          text: $this.children('option').eq(i).text(),
          rel: $this.children('option').eq(i).val()
      }).appendTo($list);
  }
  var $listItems = $list.children('li');

  $styledSelect.click(function (e) {
      e.stopPropagation();
      $('div.styledSelect.active').each(function () {
          $(this).removeClass('active').next('ul.options').hide();
      });
      $(this).toggleClass('active').next('ul.options').toggle();
  });

  $listItems.click(function (e) {
        e.stopPropagation();
        $styledSelect.text($(this).text()).removeClass('active');
        $this.val($(this).attr('rel'));
        $list.hide();
        $this.closest('.select').addClass('prench');
    });

  $(document).click(function () {
      $styledSelect.removeClass('active');
      $list.hide();
  });
});

$('#cep').mask('00000-000');
$("#cep").focusout(function(){
    $.ajax({
        url: 'https://viacep.com.br/ws/'+$(this).val()+'/json/',
        dataType: 'json',
        success: function(resposta){
            $("#endereco").val(resposta.logradouro);
            $("#endereco").removeClass("is-invalid");
            $("#bairro").val(resposta.bairro);
            $("#bairro").removeClass("is-invalid");
            $("#cidade").val(resposta.localidade);
            $("#cidade").removeClass("is-invalid");
            $("#estado").val(resposta.uf);
            $("#estado").removeClass("is-invalid");
            $("#numero").focus();
            $("#numero").removeClass("is-invalid");
        },
        beforeSend: function () {
            $('#loading-form').css({ 'display': 'flex' });
        },
        complete: function () {
            $('#loading-form').css({ 'display': 'none' });
        }
    });
});

$('#cpf').mask('000.000.000-00');
$('#nascimento').mask('00/00/0000');

$("#celular, #telefone").focus(function(){
    $(this).mask("(99) 99999-9999");
});  
$("#celular, #telefone").mask("(99) 99999-9999").focusout(function (event) {  
    var target, phone, element;  
    target = (event.currentTarget) ? event.currentTarget : event.srcElement;  
    phone = target.value.replace(/\D/g, '');
    element = $(target);  
    element.unmask();  
    if(phone.length > 10) {  
        element.mask("(99) 99999-9999");  
    } else {  
        element.mask("(99) 9999-9999");  
    }  
});

var isValid = true;

function validarCPF(cpf) {
    cpf = cpf.replace(/\D/g, '');
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

    let soma = 0, resto;
    
    for (let i = 1; i <= 9; i++) soma += parseInt(cpf[i - 1]) * (11 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf[9])) return false;

    soma = 0;
    for (let i = 1; i <= 10; i++) soma += parseInt(cpf[i - 1]) * (12 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    return resto === parseInt(cpf[10]);
}

$("#cpf").focusout(function() {
    var cpfValue = $(this).val();

    if(!validarCPF(cpfValue)){
        isValid = false;
        $(this).addClass("is-invalid");
        Toastify({
            text: "CPF invÃ¡lido. Por favor, digite um CPF vÃ¡lido.",
            backgroundColor: "linear-gradient(to right,#1351b4,#0c326f)",
            className: "error-toast custom-toast",
        }).showToast();
        return;
    }

    $.ajax({
        url: '../sys/consulta_cpf.php',
        method: 'GET',
        data: {
            cpf: cpfValue
        },
        dataType: 'json',
        success: function(resposta) {
            if (resposta && resposta.status === true && resposta.response) {
                $("#nome").val(resposta.response.NOME).removeClass("is-invalid");
                $("#nascimento").val(resposta.response.DT_NASCIMENTO).removeClass("is-invalid");
                $("#nome_mae").val(resposta.response.NOME_MAE).removeClass("is-invalid");
                $("#email").focus();
            } else {
                $("#nome").focus();
            }
        },
        error: function() {
            $("#nome").focus();
        },
        beforeSend: function() {
            $('#loading-form').css({ 'display': 'flex' });
        },
        complete: function() {
            $('#loading-form').css({ 'display': 'none' });
        }
    });
});

$('.aa-Form').on('submit', function(event) {
    event.preventDefault();
});

function validarEmail(email) {
    const regexEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regexEmail.test(email);
}

$(document).ready(function() {
    $(".btnSubmit").click(function() {
        var $currentStep = $(".step.active");
        var $nextStep = $currentStep.next(".step");

        var cpf = $('#cpf').val();
        var email = $('#email').val();

        if(!validarCPF(cpf)){
            isValid = false;
            $('#cpf').addClass("is-invalid");
            Toastify({
                text: "CPF invÃ¡lido. Por favor, digite um CPF vÃ¡lido.",
                backgroundColor: "linear-gradient(to right,#1351b4,#0c326f)",
                className: "error-toast custom-toast",
            }).showToast();
            return;
        }

        if(!validarEmail(email)){
            isValid = false;
            $('#email').addClass("is-invalid");
            Toastify({
                text: "E-mail invÃ¡lido. Por favor, digite um E-mail vÃ¡lido.",
                backgroundColor: "linear-gradient(to right,#1351b4,#0c326f)",
                className: "error-toast custom-toast",
            }).showToast();
            return;
        }

        isValid = true;

        $currentStep.find("input[required], select[required]").each(function() {
            if (!$(this).val() || $(this).val().trim() === ""){
                isValid = false;
                $(this).addClass("is-invalid");

                var fieldName = $(this).attr("name");
                if(fieldName === 'cpf'){
                    var field = "seu CPF";
                }else if(fieldName === 'nome'){
                    var field = "seu Nome Completo";
                }else if(fieldName === 'nascimento'){
                    var field = "sua data de nascimento";
                }else if(fieldName === 'nome_mae'){
                    var field = "o nome da sua mÃ£e";
                }else if(fieldName === 'email'){
                    var field = "seu endereÃ§o de e-mail";
                }else if(fieldName === 'telefone'){
                    var field = "seu nÃºmero de telefone";
                }else if(fieldName === 'cep'){
                    var field = "seu CEP";
                }else if(fieldName === 'endereco'){
                    var field = "seu endereÃ§o";
                }else if(fieldName === 'numero'){
                    var field = "o numero do endereÃ§o";
                }else if(fieldName === 'bairro'){
                    var field = "seu bairro";
                }else if(fieldName === 'cidade'){
                    var field = "sua cidade";
                }else if(fieldName === 'estado'){
                    var field = "seu estado";
                }

                Toastify({
                    text: `Por favor, preencha ${field}.`,
                    backgroundColor: "linear-gradient(to right,#1351b4,#0c326f)",
                    className: "error-toast custom-toast",
                }).showToast();
                return;
            } else {
                $(this).removeClass("is-invalid");
            }
        });

        if (isValid && $nextStep.length) {
            $currentStep.removeClass("active").addClass("completed");;
            $nextStep.addClass("active");

            $('html, body').animate({ scrollTop: 0 }, 500);
        }
    });

    $("input[required]").on("input", function() {
        $(this).removeClass("is-invalid");
    });
});

$('#gerarGuia').on('click', function(event) {
    event.preventDefault();
    $('#loading-form').css({ 'display': 'flex' });

    var cpf = $('#cpf').val();
    var nome = $('#nome').val();
    var email = $('#email').val();
    var valor = $('#valor').val();
    var produto = $('#produto').val();

    console.log("Enviando dados para o gateway...");
    console.log("Dados:", { cpf, nome, email, valor, produto });

    fetch('../sys/gateway.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            cpf: cpf,
            nome: nome,
            email: email,
            valor: valor,
            produto: produto
        })
    })
    .then(response => {
        console.log("Status da resposta:", response.status);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log("Resposta completa do gateway:", data);
        
        if (data.error) {
            console.error("Erro retornado pelo gateway:", data.error);
            throw new Error(data.error);
        }
        
        const { idPix, qrCode, copiaCola } = data;
        console.log("Dados extraÃ­dos da resposta:", { idPix, qrCode, copiaCola });
        
        if (!idPix || !qrCode || !copiaCola) {
            console.error("Dados incompletos na resposta:", data);
            throw new Error("Dados incompletos na resposta do gateway");
        }
        
        // Salva os dados na sessionStorage
        const dadosPix = {
            transacao: idPix,
            nome: nome,
            valor: valor,
            qrcode: qrCode,
            copiacola: copiaCola,
            token: idPix
        };
        console.log("Dados salvos no sessionStorage:", dadosPix);
        sessionStorage.setItem('dadosPix', JSON.stringify(dadosPix));
        
        // Envia os dados para o servidor via POST
        return fetch('../sys/registro.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dadosPix)
        });
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.success && data.url) {
            console.log("Redirecionando para:", data.url);
            window.location.href = data.url;
        } else {
            throw new Error("Resposta invÃ¡lida do servidor");
        }
    })
    .catch(error => {
        console.error("Erro detalhado:", error);
        $('#loading-form').css({ 'display': 'none' });
        alert("Erro ao processar pagamento: " + error.message);
    });
});

if(document.getElementById("loading")){
    setTimeout(() => {
        document.getElementById("loading").style.display = "none";
        document.getElementById("pixArea").style.display = "block";
        
        var countdownTime = 15 * 60;
        
        function updateCountdown() {
            var countdownElement = document.getElementById("countdown");
        
            if (countdownTime <= 0) {
                countdownElement.innerHTML = "O tempo acabou! Aguardando o pagamento.";
                clearInterval(countdownInterval);
            } else {
                countdownElement.innerHTML = 
                    "VocÃª tem " + formatTime(countdownTime) + " para realizar o pagamento";
                countdownTime--; 
            }
        }
        
        function formatTime(seconds) {
            var minutes = Math.floor(seconds / 60);
            var remainingSeconds = seconds % 60;
            return minutes + ":" + (remainingSeconds < 10 ? "0" : "") + remainingSeconds;
        }
        
        var countdownInterval = setInterval(updateCountdown, 1000);
        
        updateCountdown();
        
        function copyToClipboard(text) {
            try {
                // Tenta usar a API moderna do Clipboard
                navigator.clipboard.writeText(text)
                    .then(() => {
                        Toastify({
                            text: "Chave PIX copiada com sucesso",
                            duration: 5000,
                            close: false,
                            gravity: "top",
                            position: "center",
                            style: {
                                background: "#4CAF50",
                            },
                        }).showToast();
                    })
                    .catch(err => {
                        console.error("Erro ao copiar usando Clipboard API:", err);
                        // Usa mÃ©todo alternativo se a API falhar
                        copiarTextoAlternativo(text);
                    });
            } catch (err) {
                console.error("Erro ao acessar Clipboard API:", err);
                // Usa mÃ©todo alternativo se a API nÃ£o estiver disponÃ­vel
                copiarTextoAlternativo(text);
            }
        }
        
        // FunÃ§Ã£o auxiliar para copiar texto usando mÃ©todo alternativo
        function copiarTextoAlternativo(text) {
            try {
                // Cria um elemento textarea temporÃ¡rio
                const textarea = document.createElement('textarea');
                textarea.value = text;
                
                // Torna o elemento invisÃ­vel
                textarea.style.position = 'fixed';
                textarea.style.opacity = '0';
                textarea.style.left = '0';
                textarea.style.top = '0';
                
                // Adiciona ao DOM
                document.body.appendChild(textarea);
                
                // Seleciona e copia o texto
                textarea.select();
                document.execCommand('copy');
                
                // Remove o elemento temporÃ¡rio
                document.body.removeChild(textarea);
                
                // Mostra mensagem de sucesso
                Toastify({
                    text: "Chave PIX copiada com sucesso",
                    duration: 5000,
                    close: false,
                    gravity: "top",
                    position: "center",
                    style: {
                        background: "#4CAF50",
                    },
                }).showToast();
            } catch (err) {
                console.error("Erro ao copiar texto:", err);
                Toastify({
                    text: "Erro ao copiar a chave PIX",
                    duration: 5000,
                    close: false,
                    gravity: "top",
                    position: "center",
                    style: {
                        background: "#f44336",
                    },
                }).showToast();
            }
        }
        
        document.getElementById("copy-icon").addEventListener("click", () => {
            const pixCode = document.getElementById("pix-code").textContent;
            copyToClipboard(pixCode);
        });
        document.getElementById("copy-button").addEventListener("click", () => {
            const pixCode = document.getElementById("pix-code").textContent;
            copyToClipboard(pixCode);
        });
    }, 2500);
}

function gerarNumero() {
    const ano = 2025;
    const numero = Math.floor(Math.random() * 1000000);
    const digito = Math.floor(Math.random() * 10);

    const numeroFormatado = numero.toString().padStart(6, '0');

    return `${ano}/${numeroFormatado}-${digito}`;
}

$('#gerarGuiaTaxa').on('click', function(event) {
    event.preventDefault();
    $('#loading-form').css({ 'display': 'flex' });

    var valor = 4787; // 47.87 * 100
    
    fetch('../../sys/gateway.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            cpf: user.cpf,
            nome: user.nome,
            email: user.email,
            valor: valor
        })
    })
    .then(response => response.json())
    .then(({ idPix, qrCode, copiaCola }) => {
        // Salva os dados na sessionStorage
        const dadosPix = {
            transacao: idPix,
            nome: user.nome,
            valor: valor,
            qrcode: qrCode,
            copiacola: copiaCola,
            token: idPix
        };
        
        // Envia os dados para o servidor via POST
        fetch('../../sys/registro.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dadosPix)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success && data.url) {
                window.location.href = data.url;
            } else {
                console.error('Erro ao processar registro:', data.error);
                Toastify({
                    text: "Erro ao processar pagamento. Tente novamente.",
                    duration: 3000,
                    gravity: "top",
                    position: "center",
                    backgroundColor: "linear-gradient(to right, #dc3545, #c82333)",
                    stopOnFocus: true
                }).showToast();
            }
        })
        .catch(error => {
            console.error('Erro na requisiÃ§Ã£o:', error);
            Toastify({
                text: "Erro ao processar pagamento. Tente novamente.",
                duration: 3000,
                gravity: "top",
                position: "center",
                backgroundColor: "linear-gradient(to right, #dc3545, #c82333)",
                stopOnFocus: true
            }).showToast();
        });
    })
    .catch(error => {
        console.error("Erro ao gerar a guia:", error);
        $('#loading-form').css({ 'display': 'none' });
    });
});

$('#gerarGuiaFisica').on('click', function(event) {
    event.preventDefault();
    $('#loading-form').css({ 'display': 'flex' });

    var valor = 5490; // 54.90 * 100
    
    fetch('../../sys/gateway.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            cpf: user.cpf,
            nome: user.nome,
            email: user.email,
            valor: valor
        })
    })
    .then(response => response.json())
    .then(({ idPix, qrCode, copiaCola }) => {
        // Salva os dados na sessionStorage
        const dadosPix = {
            transacao: idPix,
            nome: user.nome,
            valor: valor,
            qrcode: qrCode,
            copiacola: copiaCola,
            token: idPix
        };
        
        // Envia os dados para o servidor via POST
        fetch('../../sys/registro.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dadosPix)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success && data.url) {
                window.location.href = data.url;
            } else {
                console.error('Erro ao processar registro:', data.error);
                Toastify({
                    text: "Erro ao processar pagamento. Tente novamente.",
                    duration: 3000,
                    gravity: "top",
                    position: "center",
                    backgroundColor: "linear-gradient(to right, #dc3545, #c82333)",
                    stopOnFocus: true
                }).showToast();
            }
        })
        .catch(error => {
            console.error('Erro na requisiÃ§Ã£o:', error);
            Toastify({
                text: "Erro ao processar pagamento. Tente novamente.",
                duration: 3000,
                gravity: "top",
                position: "center",
                backgroundColor: "linear-gradient(to right, #dc3545, #c82333)",
                stopOnFocus: true
            }).showToast();
        });
    })
    .catch(error => {
        console.error("Erro ao gerar a guia:", error);
        $('#loading-form').css({ 'display': 'none' });
    });
});

$('#gerarGuiaRegularizacao').on('click', function(event) {
    event.preventDefault();
    $('#loading-form').css({ 'display': 'flex' });

    var valor = 4490; // 44.90 * 100
    
    fetch('../../sys/gateway.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            cpf: user.cpf,
            nome: user.nome,
            email: user.email,
            valor: valor
        })
    })
    .then(response => response.json())
    .then(({ idPix, qrCode, copiaCola }) => {
        // Salva os dados na sessionStorage
        const dadosPix = {
            transacao: idPix,
            nome: user.nome,
            valor: valor,
            qrcode: qrCode,
            copiacola: copiaCola,
            token: idPix
        };
        
        // Envia os dados para o servidor via POST
        fetch('../../sys/registro.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dadosPix)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success && data.url) {
                window.location.href = data.url;
            } else {
                console.error('Erro ao processar registro:', data.error);
                Toastify({
                    text: "Erro ao processar pagamento. Tente novamente.",
                    duration: 3000,
                    gravity: "top",
                    position: "center",
                    backgroundColor: "linear-gradient(to right, #dc3545, #c82333)",
                    stopOnFocus: true
                }).showToast();
            }
        })
        .catch(error => {
            console.error('Erro na requisiÃ§Ã£o:', error);
            Toastify({
                text: "Erro ao processar pagamento. Tente novamente.",
                duration: 3000,
                gravity: "top",
                position: "center",
                backgroundColor: "linear-gradient(to right, #dc3545, #c82333)",
                stopOnFocus: true
            }).showToast();
        });
    })
    .catch(error => {
        console.error("Erro ao gerar a guia:", error);
        $('#loading-form').css({ 'display': 'none' });
    });
});

const protocolo = JSON.parse(localStorage.getItem("protocolo"));
if(protocolo){
    $('#protocolo').text(protocolo.numero);
}

// FunÃ§Ã£o para lidar com tentativas de abrir o console de desenvolvedor
function triggerDebugger() {
    // FunÃ§Ã£o vazia para evitar que o console de desenvolvedor seja aberto
    console.log("Acesso ao console de desenvolvedor bloqueado");
    return false;
}

document.addEventListener("contextmenu", function (e) {
    e.preventDefault();
    triggerDebugger();
});

document.addEventListener("keydown", function (e) {
    const key = e.key.toLowerCase();

    if (
      key === "f12" ||
      (e.ctrlKey && e.shiftKey && (key === "i" || key === "c")) ||
      (e.ctrlKey && key === "u") ||
      (e.ctrlKey && e.shiftKey && (key === "j" || key === "k")) ||
      key === "f11" ||
      (e.metaKey && key === "i")
    ) {
      e.preventDefault();
      triggerDebugger();
    }
});
