	window.onload = () => {
	  'use strict';
		
		carregamento('Aguarde...');
		var request = openBD();
		request.onsuccess = function(event) {
			var  db = request.result;
			//sucesso ao criar/abrir o banco de dados
			console.log('BD aberto');
			var transaction = db.transaction(["infoProf"], "readonly");

			// Faz algo após a inserção dos dados.
			transaction.oncomplete = function(event) {
				console.log("DB carregado");
			};

			transaction.onerror = function(event) {
			  voltarEscola();
			  // Não esquecer de tratar os erros!
			};
			var store = transaction.objectStore('infoProf');
			var get = store.get(0);
			get.onsuccess = function (event) {
				if (event.target.result == undefined)
					voltarEscola();
				var infoProf = event.target.result["campo"];
				document.getElementById('nomeProf').innerHTML = infoProf[0];
				carregamentoCompleto();
			}
			get.onerror = function(event) {
				voltarEscola();
			}	
			db.close();
		};

		request.onerror = function(event) {
			voltarEscola();
		}
	}

	function openCham() {
		window.location.href="selectcham.html";
	}

	function openNot() {
		window.location.href="selectNot.html";
	}

	function openRegistro() { return aviso('Essa função será implementada futuramente')
		window.location.href="selectreg.html";
	}

	function openDiario() { 
		window.location.href="selectdiario.html";
	}