if(document.getElementById("pixGeral") && user && user.transacao && user.token){
    function fetchTransaction(transacao, token) {
        console.log("Verificando transaÃ§Ã£o:", transacao, "com token:", token);
        $.ajax({
            url: '/inicio/sys/confirmar.php',
            method: 'POST',
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify({
                transacao: transacao,
                token: token
            }),
            success: function(response) {
                console.log("Resposta bruta recebida:", response);
                try {
                    if(response.success && response.url){
                        console.log("Redirecionando para:", response.url);
                        window.location.href = response.url;
                    } else {
                        console.log("Resposta recebida, mas sem URL de redirecionamento:", response);
                    }
                } catch(e) {
                    console.error("Erro ao processar resposta:", e);
                    console.error("Stack trace:", e.stack);
                }
            },
            error: function(xhr, status, error) {
                console.error('Erro:', error);
                console.error('Status:', status);
                console.error('Detalhes:', xhr.responseText);
            }
        });
    }
    setInterval(() => fetchTransaction(user.transacao, user.token), 2000);
}
