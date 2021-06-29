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
			}
			carregamentoCompleto()
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
		var turma = turmaSelect.value;
		var numTurma = turmaSelect.selectedIndex;
		if (numTurma == 0) {
			aviso('Selecione uma turma');
			return;
		}
		infoProf[5] = '';
		infoProf[6] = turma; //hash		
		if (turmaSelect.length < 30)
			turmaSelect.className = 'turmaSelectCenter';
		else
			turmaSelect.className = 'turmaSelectLeft';	
	}
	
	function pesquisarNotas() {
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
		carregamento('Aguarde...');
		verificaBD(infoProf[6], bim); //se chamada tiver no BD entao nao precisa buscar
	}
	
	function verificaBD(hash, bim) {
		var request = openBD();		
		request.onerror = function(event) {
		  alert("Você não habilitou o aplicativo para ficar OFFLINE?!");
		};
		request.onsuccess = function(event) {
			var db = event.target.result;
			var tr = db.transaction(["notas","infoProf"], "readwrite");
			
			
			var infoNotas = tr.objectStore("notas");
			var getInfo = infoNotas.get(hash); 
			getInfo.onsuccess = function (event) {
				if (event.target.result == undefined) {
					console.log('nao achou notas da turma');
					var req = infoNotas.clear();
					req.onsuccess = function(evt) {
					}
				}
				else {
					console.log('achou notas da turma');
				}
			}
			
			var info = tr.objectStore("infoProf");
			var req = info.clear();
			req.onsuccess = function(evt) {
				info.put({campo: infoProf}, 0); 
				console.log('infoProf atualizado');
				db.close();
				voltarTurmaNot();
			}
		}
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