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
				if (infoProf[4]){ //[0 name,1 RM,2 senha, 3 [hash: turma], 4 bim, 5 date]
					document.getElementById("bimestre")[infoProf[4]].selected = true;
					document.getElementById("bimestre").onchange();
				}
				if (infoProf[5])
					document.getElementById('Diachamada').value = infoProf[5];
				else
					document.getElementById('Diachamada').value = carregarDataAtual();
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
		  document.getElementById('dataCham').className = 'Inativo';
		  document.getElementById("bimestre").className = "Ativo NaoSelecionado";
          return;
        }     
        document.getElementById("bimestre").className = "Ativo Selecionado";
		document.getElementById('dataCham').className = 'Ativo';        
	}
	

		
	function pesquisarCham() {
		var bim = document.getElementById("bimestre").selectedIndex;
        if (bim == 0) {
			aviso ("Selecione o BIMESTRE");
			return;
		}
		var date = document.getElementById('Diachamada').value;
		var verificarDate =  new Date(date);
        if (bim < 3) {
          if (verificarDate > new Date(fimDate1Sem)) {
            aviso ('Escolha uma data correspondente ao PRIMEIRO SEMESTRE');
            return;
          }
        }
        else {
          if (verificarDate < new Date(startDate2Sem)) {
            aviso ('Escolha uma data correspondente ao SEGUNDO SEMESTRE');
            return;
          }
        }
		var objDate = new Date(date);//alert(objDate)		
		objDate.setHours(objDate.getHours() + 3);
		var diaSem = objDate.getDay();
		if (diaSem == 0 || diaSem == 6) {
			aviso ('Não há chamadas para essa data. Por favor, escolha outra data.');
			return;
		}		
		carregamento('Aguarde...');
		verificaBD(date, bim); //se chamada tiver no BD entao nao precisa buscar
	}
	
	function verificaBD(date, bim) {
		var request = openBD();		
		request.onerror = function(event) {
		  alert("Você não habilitou o aplicativo para ficar OFFLINE?!");
		};
		request.onsuccess = function(event) {
			var db = event.target.result;
			var tr = db.transaction(["diarios","infoProf"], "readwrite");
			
			
			var diariosDia = tr.objectStore("diarios");
			var getInfo = diariosDia.get(date);
			getInfo.onsuccess = function (event) {
				if (event.target.result == undefined) {
					console.log('nao achou '+date);
					var req = diariosDia.clear();
					req.onsuccess = function(evt) {
					}
				}
				else {
					console.log('achou '+date);
				}
			}
			var info = tr.objectStore("infoProf");
			var req = info.clear();
			req.onsuccess = function(evt) {
				infoProf[4] = bim;
				infoProf[5] = date;
				info.put({campo: infoProf}, 0); 
				console.log('infoProf atualizado');
				db.close();
				voltarTurmaCham();
			}
		}
	}