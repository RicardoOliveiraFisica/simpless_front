	window.onload = () => {
	  'use strict';
		
		carregamento('Aguarde...');
		var request = openBD();
		request.onsuccess = function(event) {
			var  db = request.result;
			//sucesso ao criar/abrir o banco de dados
			console.log('BD aberto');
			var transaction = db.transaction(["infoProf", "registros"], "readonly");
			// Faz algo após a inserção dos dados.
			transaction.oncomplete = function(event) {
				console.log("DB carregado");
			};
			transaction.onerror = function(event) {
			  // Não esquecer de tratar os erros!
			  voltarEscola();
			};
			var store = transaction.objectStore('infoProf');
			var get = store.get(0);		
			get.onsuccess = function (event) {
				if (event.target.result == undefined)
					voltarEscola();
				infoProf = event.target.result["campo"];
				var store2 = transaction.objectStore('registros');
				var get2 = store2.get(0);		
				get2.onsuccess = function (event) {
					if (event.target.result == undefined)
						voltarEscola();
					registros = event.target.result["campo"];
					console.log('registros carregados');
					carregamentoCompleto();
				}
			}
			db.close();
		};
		request.onerror = function(event) {
			voltarEscola();
		}		
	}
		
	
		
	document.getElementById('DiaregistroSelected').onclick = function() {
		enviarDataCham();
	}
	
	function enviarDataCham() {
		if (!navigator.onLine && GetBrowserInfo()) {
          aviso('SEM INTERNET\n\nSe conecte à internet e tente ENVIAR novamente.');
		  document.getElementById('DiachamadaSelected').value = date2string(infoProf[7]);
          return;
        }
		carregamento('Enviando...');
		var aux = (infoProf[8] > 2 ? 44 : 0); //achar o id correto
		var IDcham = infoProf[3].substr(aux, 44);
		var busca = [IDcham, diarios[0], [],,[]]; //IDcham, diasUteis, [turma, cham, atualCham, cont, atualCont]
		var cont = 0;
		var contREG = 0;
		//var contDEL = 0;
		listaAtualizar = [];
		var cham = diarios[1]; //[turma, cham, atualCham, cont,4 atualCont,5 responsavelAtual,6 listaAtualizada]
		for (var id in cham) {
			var chamTurma = cham[id];
			//var totAluno = chamTurma.length[1];
			var temSave = false;
			
			for (var i = 0; i < totAulaDia; i++) {
				if(chamTurma[2][i] || chamTurma[4][i]) {
					temSave = true;					
				}
			}
			if (temSave) {
				listaAtualizar[cont++] = id;
				var disc = chamTurma[0].split(' - ');
				/*if (disc[1] && disc[1].localeCompare('DEL') == 0 && disc[3]) {
					var local = 4;//turmasDEL guarda na busca[4]
					busca[3] = infoTurmas[id][0];
					var pos = contDEL++;
				} else {*/
					var local = 2;//turmas guarda na busca[2]
					var pos = contREG++;
				//}					
				busca[local][pos] = [chamTurma[0], chamTurma[1], chamTurma[2], chamTurma[3], chamTurma[4], chamTurma[5]];//[turma, cham, atualCham, cont, atualCont]				
			}
		}
		var RM = infoProf[5]; //infoProf -> 0 usuario,1 name,2 IDplanResumo,3 idCham,4 dateAtualizacaoLista,5 RM,6 senha,7 dataCham
		var senha = infoProf[6];	
		if (cont > 0) {
			requisicao(RM, senha, JSON.stringify(busca), 4);//busca -> [IDcham, diasUteis, [turma, cham, atualCham, cont, atualCont]] 
			console.log('enviando chamada');
		}
		else {
			onSucessEnvioCham(['','Não há chamada a ser atualizada!']);
		}
	}
	


	
	function abrirHTPC() {
		openHTPCorHPTI("HTPC");
	}
	
	function abrirHTPI() {
		openHTPCorHPTI("HTPI");
	}
	
	function openHTPCorHPTI(open) {		
		var request = openBD();		
		request.onerror = function(event) {
		  alert("Você não habilitou o aplicativo para ficar OFFLINE?!");
		};
		request.onsuccess = function(event) {
			var db = event.target.result;
			var tr = db.transaction(["infoProf"], "readwrite");			
			var store = tr.objectStore("infoProf");
			infoProf[12] = open; 
			store.put({campo: infoProf}, 0);		
			console.log('BD logado -'+open);
			db.close();
			carregamentoCompleto();	
			window.location.href = 'setregistro.html';			
		};		
	}	
		
	function GetBrowserInfo() {
		var isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
	   
		var isFirefox = typeof InstallTrigger !== 'undefined';   // Firefox 1.0+
		var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
	   
		var isChrome = !!window.chrome && !isOpera;              // Chrome 1+
		return (isOpera || isFirefox || isSafari || isChrome); 
	}
	
	
	function enviarHTPCeHTPI() {
		if (!navigator.onLine && GetBrowserInfo()) {
          aviso('SEM INTERNET\n\nSe conecte à internet e tente ENVIAR novamente.');
		  document.getElementById('DiachamadaSelected').value = date2string(infoProf[7]);
          return;
        }
		carregamento('Enviando...');
		var idHTPC = infoProf[2].substr(44, 44);
		var busca = [idHTPC, registros[0], [],,[]]; //IDcham, diasUteis, [turma, cham, atualCham, cont, atualCont]
		
		
		var RM = infoProf[5]; //infoProf -> 0 usuario,1 name,2 IDplanResumo,3 idCham,4 dateAtualizacaoLista,5 RM,6 senha,7 dataCham
		var senha = infoProf[6];	
		if (cont > 0) {
			requisicao(RM, senha, JSON.stringify(busca), 4);//busca -> [IDcham, diasUteis, [turma, cham, atualCham, cont, atualCont]] 
			console.log('enviando registros');
		}
		else {
			onSucessEnvioRegistro(['','Não há registro a ser atualizad0!']);
		}
	}
	
	function delHTPCeHPTI() {		
		document.getElementById("confirmDel").className = "Ativo";
	}
	
	function cancelarDel() {
		document.getElementById("confirmDel").className = "Inativo";		
	}
	
	function deletar() {
		
		carregamento('Excluindo...');
		
		var RM = infoProf[5]; //infoProf -> 0 usuario,1 name,2 IDplanResumo,3 idCham,4 dateAtualizacaoLista,5 RM,6 senha,7 dataCham
		var senha = infoProf[6];
		requisicao(RM, senha, JSON.stringify(busca), 5);//busca -> 
	}
	
	function onSucessDel (info) {
		document.getElementById("confirmDel").className = "Inativo";
		onSucessEnvioRegistro(info);
	}
		
	function onSucessEnvioRegistro(info) {
		console.log(info);
		msg = info[1].split('*<>*');
		var tot = msg.length;			
		var enviadoMSG = document.getElementById('enviadoMSG');
		for (var i = 0; i < tot; i++) {
			var p = document.createElement('p');			
			enviadoMSG.appendChild(p);
			var textNode = document.createTextNode(msg[i]);
			p.appendChild(textNode);
		}				
		if (info[0] != 0) {
			msgErro = info[0].split('*<>*');
			var tot = msgErro.length;			
			var enviadoErro = document.getElementById('enviadoErro');
			for (var i = 0; i < tot; i++) {
				var p = document.createElement('p');			
				enviadoErro.appendChild(p);
				var textNode = document.createTextNode(msgErro[i]);
				p.appendChild(textNode);
			}			
			document.getElementById('enviadoNo').className = 'Ativo';
		}
		else {			
			okErro();
		}
		document.getElementById('envioOk').className = 'Ativo';
		carregamentoCompleto();
	}
	
	function okErro() {
		document.getElementById('enviadoNo').className = 'Inativo';
		document.getElementById('enviadoOk').className = 'Ativo';
		//okMSG();
	}
	
	function okMSG() {
		document.getElementById('enviadoOk').className = 'Inativo';
		document.getElementById('enviadoNo').className = 'Inativo';
		finalizacaoCham();
	}
	
	function finalizacaoCham() {
		var request = openBD();	 //no futuro nao deletar cada dia de chamada, mas deixar p acesso offline	
		request.onerror = function(event) {
		  alert("Você não habilitou o aplicativo para ficar OFFLINE?!");
		};
		request.onsuccess = function(event) {
			var db = event.target.result;
			var tr = db.transaction(["diarios", "infoProf"], "readwrite");
		//	var tr = db.transaction(["infoProf"], "readwrite");			
			var store = tr.objectStore("diarios");
			for (var i in listaAtualizar) {
				var id = listaAtualizar[i];
				 //diarios -> [diasUteis, [turma, cham, atualCham, cont,4 atualCont,5 responsavelAtual,6 listaAtualizada]]
				for (var j = 0; j < totAulaDia; j++) { //envio c exito - colocar atualizacoes em falso
					diarios[1][id][2][j] = false; //atualizacao de cham
					diarios[1][id][4][j] = false; //atualizacao de conteudo
				}
			}
			listaAtualizar = null;
			store.put({campo: diarios, data: infoProf[7]});
			//var req = store.clear();
			//req.onsuccess = function(evt) {	
			//	console.log('diarios deletado');
				var store2 = tr.objectStore("infoProf");
				infoProf[10] = null;
				infoProf[11] = null;
				infoProf[12] = null;
				infoProf[13] = null;
				store2.put({campo: infoProf}, 0);			
				carregamentoCompleto();	
				//setTimeout(function(){
					voltarDataCham();
				//}, 2000);
			//}
			db.close();
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
                
          else if (keycode == 38) {
                             
          }
          else if (keycode == 37) {
                            
          }
        }
      }