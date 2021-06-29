	window.onload = () => {
	  'use strict';
		
		carregamento('Aguarde...');
		var request = openBD();
		request.onsuccess = function(event) {
			var  db = request.result;
			//sucesso ao criar/abrir o banco de dados
			console.log('BD aberto');
			var transaction = db.transaction(["infoProf", "diarios"], "readonly");
			transaction.oncomplete = function(event) {
				console.log("DB carregado");
			};
			transaction.onerror = function(event) {
			  voltarEscola();
			};
			var store = transaction.objectStore('infoProf');
			var get = store.get(0);
			get.onsuccess = function (event) {
				if (event.target.result == undefined)
					return voltarEscola();
				infoProf = event.target.result["campo"];
				var store2 = transaction.objectStore("diarios");
				var get2 = store2.get(infoProf[5]);//busca pela data
				get2.onsuccess = function (event) {
					if (event.target.result) {
						diarios = event.target.result["campo"];
					}
					carregarSelectTurmaCham(infoProf);
				}
			}
			db.close();
		};
		request.onerror = function(event) {
			voltarEscola();
		}		
	}
	
	function carregarSelectTurmaCham(infoProf){
		document.getElementById('DiachamadaSelected').value = date2string(infoProf[5]);
		inserirTurmas(infoProf[3]);
		if (infoProf[6]) { //encontrar turma pelo hash
			document.getElementById("turmaSelect").value = infoProf[6];
			document.getElementById("turmaSelect").onchange();
		}
		if (infoProf[9])
			aviso(infoProf[9]);
		verificarSePrecisaEnviarDiario();
		
		carregamentoCompleto();
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
		}		
	}	
	
	function verificarSePrecisaEnviarDiario() {
		var cont = 0;
		for (var hash in diarios) {
			var diarioTurma = diarios[hash];
			var temSave = false;
			
			for (var aula in diarioTurma) {
				if(diarioTurma[aula]["atualizar"])
					temSave = true;
			}
			if (temSave) {
				cont++;
			}
		}
		if (cont > 0)
			document.getElementById("enviarDataCham").value = "Enviar";
	}
	
	document.getElementById('DiachamadaSelected').onclick = function() {
		enviarDataCham();
	}

	document.getElementById("turmaSelect").onchange = function() {
		var turmaSelect = document.getElementById("turmaSelect");
		var turma = turmaSelect.value;
		var numTurma = turmaSelect.selectedIndex;
		if (numTurma == 0) {
			document.getElementById("comandos").className = "Inativo";
			aviso('Selecione uma turma');
			return;
		}
		infoProf[6] = turma;
		document.getElementById("comandos").className = "Ativo";
		if (turmaSelect.length < 30)
			turmaSelect.className = 'turmaSelectCenter';
		else
			turmaSelect.className = 'turmaSelectLeft';
		document.getElementById("aula").selectedIndex = 0;
	}

	document.getElementById("aula").onchange = function() { 
		var numAula = parseInt(document.getElementById("aula").value,10);
		if (numAula == 0) {
			aviso('Selecione a aula');
			return;
		}
		infoProf[7] = numAula;
	}
	
	function abrirCham() {
		openChamOrConteudo("cham");
	}
	
	function abrirCont() {
		openChamOrConteudo("cont");
	}
	
	function openChamOrConteudo(open) {
		var numTurma = document.getElementById("turmaSelect").selectedIndex;
		if (numTurma == 0) {
			document.getElementById("comandos").className = "Inativo";
			aviso('Selecione uma turma');
			return;
		}
		var aula = parseInt(document.getElementById("aula").value,10);
		if (aula == 0) {
			aviso('Selecione a aula');
			return;
		}
		infoProf[8] = open; 
		var date = infoProf[5];
		var hash = document.getElementById("turmaSelect").value;
		var numAula = aula%10;
		if (diarios == undefined || diarios[hash] == undefined || diarios[hash][aula] == undefined) {
			console.log('buscando chamada');
			var formData = new FormData();
			formData.append('hash', hash);
			formData.append('data', date);
			formData.append('aula', numAula);
			requisicao('frequencia', formData, function(status, response) {
				if (status == 200) {
					var data = JSON.parse(response); console.log(data);
					carregarChamada(data);
				}
			});
			carregamento('Aguarde. Consultando...');
		}
		else {
			console.log('ja tem a chamada');
			atualizarBDcham();
		}
	}
		
	function carregarChamada(data) {
		var request = openBD();
		request.onerror = function(event) {
		  alert("Você não habilitou o aplicativo para ficar OFFLINE?!");
		};
		request.onsuccess = function(event) {
			var date = infoProf[5];
			var aula = infoProf[7];
			var hash = infoProf[6];
			var open = infoProf[8];
			var db = event.target.result;
			var tr = db.transaction(["infoProf", "diarios"], "readwrite");
			var store = tr.objectStore("infoProf");
			var req = store.clear();
			req.onsuccess = function(evt) {
				store.put({campo: infoProf}, 0);
				console.log('BD logado -'+open);
				var diarios = tr.objectStore("diarios");
				var getDiario = diarios.get(date);
				getDiario.onsuccess = function (event) {
					var diarioDia = null;
					if (event.target.result == undefined) {
						console.log('nao achou '+date);
						diarioDia = {};
					}
					else
						diarioDia = event.target.result["campo"];
					if (diarioDia[hash] == undefined)
						diarioDia[hash] = {}
					diarioDia[hash][aula] = data;
					diarioDia[hash][aula]["atualizar"] = false;
					console.log('gravando aula '+aula+' - '+date);
					diarios.put({campo: diarioDia, id: date}); 
					window.location.href = 'setcham.html';
					
			db.close();
				}
			}
			carregamentoCompleto();	
			
		};
	}
	
	function atualizarBDcham() {
		var request = openBD();
		request.onerror = function(event) {
		  alert("Você não habilitou o aplicativo para ficar OFFLINE?!");
		};
		request.onsuccess = function(event) {
			var db = event.target.result;
			var tr = db.transaction(["infoProf"], "readwrite");
			var store = tr.objectStore("infoProf");
			var req = store.clear();
			req.onsuccess = function(evt) {
				store.put({campo: infoProf}, 0);
				console.log('BD logado -'+open);
				window.location.href = 'setcham.html';
			}
			carregamentoCompleto();	
			db.close();
		};
	}

	function GetBrowserInfo() {
		var isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
	   
		var isFirefox = typeof InstallTrigger !== 'undefined';   // Firefox 1.0+
		var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
	   
		var isChrome = !!window.chrome && !isOpera;              // Chrome 1+
		return (isOpera || isFirefox || isSafari || isChrome); 
	}
	
	function enviarDataCham() {
		if (!navigator.onLine && GetBrowserInfo()) {
          aviso('SEM INTERNET\n\nSe conecte à internet e tente ENVIAR novamente.');
		  document.getElementById('DiachamadaSelected').value = date2string(infoProf[7]);
          return;
        }
		contEnvio = 0;
		var date = infoProf[5];
		msgEnvio = [[],[]]; //msg[[erros],[sucessos]]
		for (var hash in diarios) {
			var diarioTurma = diarios[hash];
			for (var aula in diarioTurma) {
				if(diarioTurma[aula]["atualizar"]) {
					enviandoCham(hash, date, aula, diarioTurma[aula]["chamada"], diarioTurma[aula]["conteudo"]);
					contEnvio++;
				}
			}
		}
		carregamento('Enviando...');
		if (contEnvio == 0) { //nao tem chamada a salvar
			finalizacaoCham();
		}
	}

	var msgEnvio = null;
	var contEnvio = null;
	function enviandoCham(hash, date, aula, chamada, conteudo) {
		var formData = new FormData();
		formData.append('hash', hash);
		formData.append('data', date);
		formData.append('aula', aula);
		formData.append('chamada', JSON.stringify(chamada));
		formData.append('conteudo', JSON.stringify(conteudo));
		requisicao('frequencia', formData, function(status, response) {
			if (status == 200) {
				var data = JSON.parse(response); console.log('enviou'); console.log(response);
				onSucessEnvioCham(hash, date, aula);
			} else {
				aviso('Não foi possível enviar os registros. Tente novamente');
				carregamentoCompleto();
			}
		});
		msgEnvio[1][msgEnvio[1].length] = 'ENVIADO - ' + aula +'ª aula - '+ infoProf[3][hash] + ' - '+ date2string(date);
		console.log('enviando reg -> '+aula +'ª aula - ' + infoProf[3][hash] + ' - '+ date);
	}

	function onSucessEnvioCham(hash, date, aula) {
		contEnvio--;
		diarios[hash][aula]["atualizar"] = false;
		console.log('enviado reg -> '+aula +'ª aula - ' + infoProf[3][hash] + ' - '+ date);
		if (contEnvio == 0) {
			onSucessEnvioTotCham(msgEnvio); 
		}
	}

	function delCham() {
		var numTurma = document.getElementById("turmaSelect").selectedIndex;
		if (numTurma == 0) {
			document.getElementById("comandos").className = "Inativo";
			aviso('Selecione uma turma');
			return;
		}
		var numAula = parseInt(document.getElementById("aula").value,10);
		if (numAula == 0) {
			aviso('Selecione a aula');
			return;
		}
		var aula = parseInt(document.getElementById("aula").value,10);
		var date = infoProf[5];
		var hash = document.getElementById("turmaSelect").value;
		aula = aula%10;
		if (diarios && diarios[hash] && diarios[hash][aula]) {
			var node = document.getElementById('turmaDel');
			while (node.firstChild) {
			  node.removeChild(node.firstChild);
			}			
			var turmaDel = numAula%10+'ª aula - ' + infoProf[3][hash] + ' - '+ date2string(date);
			var p = document.createElement('p');
			node.appendChild(p);
			var textNode = document.createTextNode(turmaDel);
			p.appendChild(textNode);
			document.getElementById("confirmDel").className = "Ativo";
		}
		else 
			aviso('Não há registro a DELETAR desta aula');
	}
	
	function cancelarDel() {
		document.getElementById("confirmDel").className = "Inativo";
		
	}
	
	function deletar() {
		var aula = parseInt(document.getElementById("aula").value,10);
		var date = infoProf[5];
		var hash = document.getElementById("turmaSelect").value;
		aula = aula%10;		
		console.log('deletando chamada');
		var formData = new FormData();
		formData.append('hash', hash);
		formData.append('data', date);
		formData.append('aula', aula);
		formData.append('chamada', JSON.stringify(diarios[hash][aula]["chamada"]));
		formData.append('conteudo', JSON.stringify(diarios[hash][aula]["conteudo"]));
		exclusao('frequencia', formData, function(status, response) {
			if (status == 200) {
				var data = JSON.parse(response); console.log('deletando'); console.log(response);
				onSucessDel(hash, date, aula);
			} else {
				aviso('Não foi possível deletar os registros. Tente novamente');
				carregamentoCompleto();
			}
		});		
		carregamento('Aguarde. Consultando...');
	}
	
	function onSucessDel(hash, date, aula) {
		document.getElementById("confirmDel").className = "Inativo";
		msgEnvio = [[], ['DELETADO - ' + aula +'ª aula - '+ infoProf[3][hash] + ' - '+ date2string(date)]];
		delete diarios[hash][aula];
		onSucessEnvioTotCham(msgEnvio);
	}
		
	function onSucessEnvioTotCham(info) {
		console.log(info);
		msg = info[1];
		var tot = msg.length;
		var enviadoMSG = document.getElementById('enviadoMSG');
		for (var i = 0; i < tot; i++) {
			var p = document.createElement('p');
			enviadoMSG.appendChild(p);
			var textNode = document.createTextNode(msg[i]);
			p.appendChild(textNode);
		}
		if (info[0] != 0) {
			msgErro = info[0];
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
	}
	
	function okMSG() {
		document.getElementById('enviadoOk').className = 'Inativo';
		document.getElementById('enviadoNo').className = 'Inativo';
		finalizacaoCham();
	}
	
	function finalizacaoCham() {
		console.log('finalizado com sucesso')
		var request = openBD();
		request.onerror = function(event) {
		  alert("Você não habilitou o aplicativo para ficar OFFLINE?!");
		};
		request.onsuccess = function(event) {
			var date = infoProf[5];
			var hash = infoProf[6];
			infoProf[7] = null;
			infoProf[8] = null;
			var db = event.target.result;
			var tr = db.transaction(["infoProf", "diarios"], "readwrite");
			var store = tr.objectStore("infoProf");
			var req = store.clear();
			req.onsuccess = function(evt) {
				store.put({campo: infoProf}, 0);
				var store2 = tr.objectStore("diarios");
				store2.put({campo: diarios, id: date}); 
				voltarDataCham();
			}			
			carregamentoCompleto();	
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
        }
      }