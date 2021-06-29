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
					document.getElementById('diaRegistroSelected').value = infoProf[7];
					verificarSePrecisaEnviarReg();
					carregamentoCompleto();
				}
				
			}
			db.close();
		};
		request.onerror = function(event) {
			voltarEscola();
		}		
	}
	
	function verificarSePrecisaEnviarReg() {
		var cont = 0
		for (var id in registros) {
			if (registros[id][13])
				cont++;
		}
		if (cont > 0)
			document.getElementById("enviarRegistro").value = "Enviar";
	}
		
	document.getElementById('diaRegistroSelected').onclick = function() {
		aviso('Clique em HTPC ou HTPI para realizar o registro');
	}
	
	function testeDateReg() {
		var date = document.getElementById('diaRegistroSelected').value;
		var dateReg = date2string(date).replace(/-/g, '/');
		//console.log(dataReg);
		if (registros[dateReg]) {
			infoProf[7] = date;
			return true;
		}
		else {
			aviso('DATA INCORRETA\n\nEscolha outra data');
			infoProf[7] = null;
			return false;
		}
	}
	
	function abrirHTPC() {
		openRegistro("HTPC");
	}
	
	function abrirHTPI() {
		openRegistro("HTPI");
	}
	
	function openRegistro(open) {		
		var request = openBD();		
		request.onerror = function(event) {
		  alert("Você não habilitou o aplicativo para ficar OFFLINE?!");
		};
		if (!testeDateReg()) //data válida
			return;
		request.onsuccess = function(event) {
			var db = event.target.result;
			var tr = db.transaction(["infoProf"], "readwrite");			
			var store = tr.objectStore("infoProf");
			infoProf[12] = open; 
			store.put({campo: infoProf}, 0);		
			console.log('BD logado -'+open);
			db.close();
			carregamentoCompleto();	
			window.location.href = 'setreg.html';			
		};		
	}	
		
	var listaRegAtualizar = null;
	function enviarRegistro() {
		if (!navigator.onLine && GetBrowserInfo()) {
          aviso('SEM INTERNET\n\nSe conecte à internet e tente ENVIAR novamente.');
		  document.getElementById('DiachamadaSelected').value = date2string(infoProf[7]);
          return;
        }
		carregamento('Enviando...');
		//var aux = (infoProf[8] > 2 ? 44 : 0); //achar o id correto
		var idHPTC = infoProf[2].substr(44, 44);
		var regAtualizar = {};
		listaRegAtualizar = [];
		var cont = 0
		for (var id in registros) {
			if (id.localeCompare('coord') == 0) {
				if (registros['coord'][1]) {
					regAtualizar['coord'] = registros['coord'];
					//temAtualizacao = true;
					listaRegAtualizar[cont++] = id;
				}
			}
			else if (registros[id][13]) {
				regAtualizar[id] = registros[id];
				//temAtualizacao = true;
				listaRegAtualizar[cont++] = id;
			}
		}
		var RM = infoProf[5]; //infoProf -> 0 usuario,1 name,2 IDplanResumo,3 idCham,4 dateAtualizacaoLista,5 RM,6 senha,7 dataCham
		var senha = infoProf[6];	
		if (listaRegAtualizar.length > 0) {
			var busca = [idHPTC, regAtualizar]; //console.log(RM, senha, JSON.stringify(busca));
			requisicao(RM, senha, JSON.stringify(busca), 3); 
			console.log('enviando registros');
		}
		else {
			onSucessEnvioReg(['','Não há registro a ser atualizado!']);
		}
	}	
	
	function onSucessEnvioReg(info) {
		console.log('registros enviados');
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
			document.getElementById('enviadoOk').className = 'Ativo';
		}
		document.getElementById('envioOk').className = 'Ativo';
		carregamentoCompleto();
	}
	
function delRegistro() {		
		document.getElementById("confirmDel").className = "Ativo";
	}
	
	function cancelarDel() {
		document.getElementById("confirmDel").className = "Inativo";		
	}
	
	function deletar() {
		if (!testeDateReg()) return;
		var date = document.getElementById('diaRegistroSelected').value;
		var dateReg = date2string(date).replace(/-/g, '/');
		registros[dateReg] = [registros[dateReg][0],"", "", "", "", "", "", "", "", "", "", "", "", true];
		console.log('Excluindo registro');
		carregamento('Excluindo...');
		setTimeout(() => onSucessDel(), 3000);
	}
	
	function onSucessDel() {
		document.getElementById("confirmDel").className = "Inativo";
		enviarRegistro();
		//onSucessEnvioRegistro(info);
	}
	
	function okMSG() {
		document.getElementById('enviadoOk').className = 'Inativo';
		//document.getElementById('enviadoNo').className = 'Inativo';
		finalizacaoReg();
	}
	
	function finalizacaoReg() {
		var request = openBD();	 //no futuro nao deletar cada dia de chamada, mas deixar p acesso offline	
		request.onerror = function(event) {
		  alert("Você não habilitou o aplicativo para ficar OFFLINE?!");
		};
		request.onsuccess = function(event) {
			var db = event.target.result;
			var tr = db.transaction(["registros"], "readwrite");
		//	var tr = db.transaction(["infoProf"], "readwrite");			
			var store = tr.objectStore("registros");
			
			for (var id in listaRegAtualizar) {
				//console.log(id);
				if (listaRegAtualizar[id] === 'coord')
					registros['coord'][1] = false;
				else
					registros[listaRegAtualizar[id]][13] = false;
				
			}
			listaRegAtualizar = null;
			store.put({campo: registros}, 0);
							
				carregamentoCompleto();	
				//setTimeout(function(){
					voltarOpcoes();
				//}, 2000);
			//}
			db.close();
		}
	}
	
	function voltarOpcoes() {
		window.location.href="selectoption.html";
	}
	
	function GetBrowserInfo() {
		var isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
	   
		var isFirefox = typeof InstallTrigger !== 'undefined';   // Firefox 1.0+
		var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
	   
		var isChrome = !!window.chrome && !isOpera;              // Chrome 1+
		return (isOpera || isFirefox || isSafari || isChrome); 
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