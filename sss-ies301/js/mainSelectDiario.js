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
			};
			var info = transaction.objectStore("infoProf");	
			var getInfo = info.get(0);
			getInfo.onsuccess = function (event) {
				if (event.target.result == undefined)
					voltarEscola();
				infoProf = event.target.result["campo"];
				inserirTurmas(infoProf[3])
				if (infoProf[4]){ //[0 name,1 RM,2 senha, 3 [hash: turma], 4 bim, 5 date]
					document.getElementById("bimestre")[infoProf[4]].selected = true;
					document.getElementById("bimestre").onchange();
					
				}
				carregamentoCompleto();
			}
			
			db.close();
		};
		request.onerror = function(event) {
			voltarEscola();
		}
	}
	document.getElementById("bimestre").onchange = function() {
        var bim = document.getElementById("bimestre").selectedIndex;
        if (bim == 0) {
		  aviso ("Selecione o BIMESTRE");
		  document.getElementById('turmaSelect').className = 'Inativo';
		  document.getElementById("bimestre").className = "Ativo NaoSelecionado";
          return;
        }
		infoProf[4] = bim;
        document.getElementById("bimestre").className = "Ativo Selecionado";
		document.getElementById('turmaSelect').className = 'Ativo';
	}
	
	function inserirTurmas(turmas) {
		console.log('carregando turmas');
		var turmaSelect = document.getElementById('turmaSelect');
		for (var id in turmas) {
			var option = document.createElement('option');
			option.setAttribute('id', 'turma'+id);
			option.setAttribute('value', id);
			turmaSelect.appendChild(option);
			var textNode = document.createTextNode(turmas[id]);
			option.appendChild(textNode);
		}console.log('carregado turmas');
	}

	document.getElementById("turmaSelect").onchange = function() {
		var turmaSelect = document.getElementById("turmaSelect");
		
		var numTurma = turmaSelect.selectedIndex;
		if (numTurma == 0) {
			aviso('Selecione uma turma');
			document.getElementById('comandos').className = 'Inativo'; 
			return;
		}
		infoProf[5] = '';
		infoProf[6] = turmaSelect.value; //hash		
		if (turmaSelect.length < 30)
			turmaSelect.className = 'turmaSelectCenter';
		else
			turmaSelect.className = 'turmaSelectLeft';
		document.getElementById('comandos').className = 'Ativo';
		carregarInfoTurma(infoProf[6]);
	}
	
	function carregarInfoTurma(hash) {
		var request = openBD();
		request.onsuccess = function(event) {
			var  db = request.result;
			console.log('BD aberto');
			var transaction = db.transaction(["infoTurmas"], "readonly");
			transaction.oncomplete = function(event) {
				console.log("DB carregado");
			};
			transaction.onerror = function(event) {
			  voltarEscola();
			};
			var store = transaction.objectStore('infoTurmas');
			var get = store.get(hash); //info da turma
			get.onsuccess = function (event) {
				if (event.target.result == undefined)
					voltarEscola();
				infoTurmas = event.target.result["campo"];
			}
			
			db.close();
		};
		request.onerror = function(event) {
			voltarEscola();
		}	
	}
	
	function imprimirChamada() {
		var bim = document.getElementById("bimestre").selectedIndex;
        if (bim == 0) {
			aviso ("Selecione o BIMESTRE");
			return;
		}
		var numTurma = document.getElementById("turmaSelect").selectedIndex;
		if (numTurma == 0) {
			aviso('Selecione uma turma');
			return;
		}		
		var hash = infoProf[6];
		var formData = new FormData();
			formData.append('hash', hash);
			formData.append('bimestre', bim);
			requisicao('relatorio/frequencia', formData, function(status, response) {
				if (status == 200) {
					var data = JSON.parse(response);
					onSucessGetChamada(data, infoTurmas);
					aviso("Relatório de faltas - "+infoProf[3][infoProf[6]]+" - gerado com sucesso!");
					carregamentoCompleto();
				}
			});
			carregamento('Aguarde. Consultando...');
	  }
	 
	
	 function imprimirNotas() {
		var bim = document.getElementById("bimestre").selectedIndex;
        if (bim == 0) {
			aviso ("Selecione o BIMESTRE");
			return;
		}
		var numTurma = document.getElementById("turmaSelect").selectedIndex;
		if (numTurma == 0) {
			aviso('Selecione uma turma');
			return;
		}
		var hash = infoProf[6];
		var formData = new FormData();
			formData.append('hash', hash);
			formData.append('bimestre', bim);
			requisicao('relatorio/avaliacao', formData, function(status, response) {
				if (status == 200) {
					var data = JSON.parse(response);
					onSucessPrintNotas(data, infoTurmas);
					aviso("Relatório de notas - "+infoProf[3][infoProf[6]]+" - gerado com sucesso!");
					carregamentoCompleto();
				}
			});
			carregamento('Aguarde. Consultando...');
	}
	
	function imprimirDiario() {
		var bim = document.getElementById("bimestre").selectedIndex;
        if (bim == 0) {
			aviso ("Selecione o BIMESTRE");
			return;
		}
		var numTurma = document.getElementById("turmaSelect").selectedIndex;
		if (numTurma == 0) {			
			aviso('Selecione uma turma');
			return;
		}		
		var hash = infoProf[6];
		var formData = new FormData();
			formData.append('hash', hash);
			formData.append('bimestre', bim);
			requisicao('relatorio/conteudo', formData, function(status, response) {
				if (status == 200) {
					var data = JSON.parse(response); 
					onSucessGetConteudo(data, infoTurmas);
					aviso("Relatório de conteúdos - "+infoProf[3][infoProf[6]]+" - gerado com sucesso!");
					carregamentoCompleto();
				}
			});
		carregamento('Aguarde. Consultando...');
	}

	document.onkeydown = function(e){
        var elementFocus = document.activeElement;
        if(elementFocus != null) { 
          var keycode = e.keyCode;
          if (keycode == 13 || keycode == 40){
            switch (elementFocus.id) {
               default:
                 break;
            }
          }
        }
      }