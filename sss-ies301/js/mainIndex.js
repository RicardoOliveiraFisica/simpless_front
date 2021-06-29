	window.onload = () => {
	  'use strict';

	  if ('serviceWorker' in navigator) {
		navigator.serviceWorker
				 .register('./sw.js');
		console.log('SW registrado')
	  }
	  document.getElementById("RM").focus();
	  if (!window.indexedDB) {
		window.alert("Seu navegador não suporta uma versão OFFLINE. Entre em contato com a secretaria.");
	  }
	  if (!GetBrowserInfo())
		  aviso ('Use o navegador Chrome para um funcionamento correto');
	}
    
	function GetBrowserInfo() {
		var isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
	   
		var isFirefox = typeof InstallTrigger !== 'undefined';   // Firefox 1.0+
		var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
	   
		var isChrome = !!window.chrome && !isOpera;              // Chrome 1+
		return (isOpera || isFirefox || isSafari || isChrome);
	}
		
	document.getElementById('olho').addEventListener('click', function() {
		var senha = document.getElementById('senha');
		if (senha.type.localeCompare('text') == 0)
			senha.type = 'password';
		else
			senha.type = 'text';
	  
    });

	function enviarSenha() { 
		console.log('login'); 
		var RM = document.getElementById('RM').value;
		var senha = document.getElementById('senha').value;
		if (RM.localeCompare('') == 0 || senha.localeCompare('') == 0)
			aviso('Por favor, preencha o RM e a senha');
		else {
			var formData = new FormData();
			formData.append('rm', RM);
			formData.append('senha', senha);
			requisicao('acesso', formData, function(status, response) {
				if (status == 200) {
					var data = JSON.parse(response); 
					console.log('acesso liberado');
					criarBD(data);
				}
				else {
					aviso('Verifique a digitação do RM e da senha e tente novamente');
					carregamentoCompleto();
				}
			});
			carregamento('Aguarde. Consultando...');
		}
	}

	function criarBD(data) {//["nome": "", "turmas": {hash: {"nome": "", "alunos": [],"avaliacoes": {}}} 
		registros = '';
		var request = openBD();		
		request.onerror = function(event) {
		  alert("Você não habilitou o aplicativo para ficar OFFLINE?!");
		};
		request.onsuccess = function(event) {
			var db = event.target.result;
			var tr = db.transaction(["infoProf", "infoTurmas", "diarios"], "readwrite");
			var diarios = tr.objectStore("diarios");
			var req = diarios.clear();
			var infoTurmas = tr.objectStore("infoTurmas"); 
			var req = infoTurmas.clear();
			req.onsuccess = function(evt) {
				var info = data["turmas"];
				var turmas = {};
				for (var id in info) {
					infoTurmas.add({campo: info[id], hash: id});
					turmas[id] = info[id]["nome"]; //cria lista com par hash: nomeTurma
				}
				console.log('turmas atualizadas');
				var RM = document.getElementById('RM').value;
				var senha = document.getElementById('senha').value;
				infoProf = [data["nome"], RM, senha, turmas]; //[0 name,1 RM,2 senha, 3 [hash: turma]]
				infoP = tr.objectStore("infoProf");
				var req = infoP.clear();
				req.onsuccess = function(evt) {
					infoP.put({campo: infoProf}, 0); 
					console.log('infoProf atualizado');
					voltarEscolha();
				}
			}
			console.log('BD logado');
			db.close();
		};
	}

	document.onkeydown = function(e){
        var elementFocus = document.activeElement;
        if(elementFocus != null) { 
          var keycode = e.keyCode;
          if (keycode == 13 || keycode == 40){
            switch (elementFocus.id) {
               case 'RM': document.getElementById("senha").focus();
                                          break;
               case 'senha': document.getElementById("saveSenha").focus();
                                          break;
               case 'saveSenha': enviarSenha();
                                          break;
               default: 
                 break;
            }
          }
        }
      }