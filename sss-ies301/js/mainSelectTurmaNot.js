	window.onload = () => {
	  'use strict';
		
		carregamento('Aguarde...');
		var request = openBD();
		request.onsuccess = function(event) {
			var  db = request.result;
			
			//sucesso ao criar/abrir o banco de dados
			console.log('BD aberto');
			var transaction = db.transaction(["infoProf", "infoTurmas", "notas"], "readonly");
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
				var store = transaction.objectStore('infoTurmas');
				var get = store.get(infoProf[6]); //info da turma
				get.onsuccess = function (event) {
					if (event.target.result == undefined)
						voltarEscola();
					infoTurmas = event.target.result["campo"];
					var aval = infoTurmas["avaliacoes"];
				    var bim = infoProf[4];
					document.getElementById("secaoAvalBim").innerHTML = 'Avaliações do  '+ infoProf[4] + 'º bimestre';
					document.getElementById("turmaSelect").value = infoProf[3][infoProf[6]];
					inserirAvaliacoes(aval, bim);
					var store2 = transaction.objectStore('notas');
					var get2 = store2.get(infoProf[6]); //info da turma
					get2.onsuccess = function (event) {
						if (event.target.result) {
							notas = event.target.result["campo"]; //console.log(notas);
							verificarSePrecisaEnviarNotas();
						}
					}
				}
				carregamentoCompleto()
				db.close();
			};
			request.onerror = function(event) {
				voltarEscola();
			}
		}
	} 

	function inserirAvaliacoes(aval, bim) {
		console.log('carregando avaliacoes');			
		var avaliacao = document.getElementById('avaliacao');
		for (var id in aval) {
			if (aval[id][0] != bim ) continue;
			var option = document.createElement('option');
			option.setAttribute('id', 'turma'+id);
			option.setAttribute('value', id);
			avaliacao.appendChild(option);
			var textNode = document.createTextNode(aval[id][1]);
			option.appendChild(textNode);
		}console.log('carregado aval');
	}
	
	function verificarSePrecisaEnviarNotas() {
		var temSave = false;
		for (var id in notas) {
		var aval = notas[id];
			if(aval["atualizar"])
				temSave = true;
		}
		if (temSave)
			document.getElementById("enviarTurmaAval").value = "Enviar";
	}

	document.getElementById('turmaSelect').onclick = function() {
		enviarTurmaAval();
	}
	
	document.getElementById("avaliacao").onchange = function() { 
		var avaliacao = document.getElementById("avaliacao");
		var idAval = avaliacao.value;
		var numAval = avaliacao.selectedIndex;
		if (numAval == 0) {
			aviso('Selecione a avaliação');
			return;
		}
		infoProf[7] = idAval;
		infoProf[8] = avaliacao[avaliacao.selectedIndex].innerHTML;
	}
	
	function abrirAval() {
		var avaliacao = document.getElementById("avaliacao");
		var idAval = avaliacao.value;
		var numAval = avaliacao.selectedIndex;
		if (numAval == 0) {
			aviso('Selecione a avaliação');
			return;
		}
		
		if (notas == undefined || notas[idAval] == undefined) {
			console.log('buscando notas');
			var formData = new FormData();
			formData.append('avaliacao', idAval);
			requisicao('avaliacao', formData, function(status, response) {
				if (status == 200) {
					var data = JSON.parse(response); console.log(data);
					carregarNotas(data);
				}
			});
			carregamento('Aguarde. Consultando...');
		}
		else {
			console.log('ja tem as notas');
			atualizarBDnotas();
		}
	}
	
	function carregarNotas(data) {
		var request = openBD();
		request.onerror = function(event) {
		  alert("Você não habilitou o aplicativo para ficar OFFLINE?!");
		};
		request.onsuccess = function(event) {
			var hash = infoProf[6];
			var id = infoProf[7];
			var db = event.target.result;
			var tr = db.transaction(["infoProf", "notas"], "readwrite");
			var store = tr.objectStore("infoProf");
			var req = store.clear();
			req.onsuccess = function(evt) {
				store.put({campo: infoProf}, 0);
				console.log('BD logado -'+open);
				var store2 = tr.objectStore("notas");
				var getNotas = store2.get(hash);
				getNotas.onsuccess = function (event) {
					var notasTurma = null;
					if (event.target.result == undefined) {
						console.log('nao achou notas');
						notasTurma = {};
					}
					else
						notasTurma = event.target.result["campo"];
					notasTurma[id] = {"notas": data};
					notasTurma[id]["atualizar"] = false;
					console.log('gravando notas');
					store2.put({campo: notasTurma, hash: hash}); 
					window.location.href = 'setnota.html';
					
			db.close();
				}
			}
			carregamentoCompleto();	
			
		};
	}
	
	function atualizarBDnotas() {
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
				window.location.href = 'setnota.html';
			}
			carregamentoCompleto();	
			db.close();
		};
	}
	
	
	
	function enviarTurmaAval() {
		if (!navigator.onLine && GetBrowserInfo()) {
          aviso('SEM INTERNET\n\nSe conecte à internet e tente ENVIAR novamente.');
		  return;
        }
		contEnvio = 0;
		var hash = infoProf[6];
		msgEnvio = [[],[]]; //msg[[erros],[sucessos]]
		for (var id in notas) {
			var avalTurma = notas[id];	console.log(avalTurma["notas"])
				if(avalTurma["atualizar"]) {
					enviandoNotas(id, avalTurma["notas"]);
					contEnvio++;
				}
			
		}
		carregamento('Enviando...');
		if (contEnvio == 0) { //nao tem chamada a salvar
			finalizacaoNotas();
		}
	}
	
	var msgEnvio = null;
	var contEnvio = null;
	function enviandoNotas(idAval, avaliacao) {
		var hash = infoProf[6];
		var formData = new FormData();
		formData.append('avaliacao', idAval);
		formData.append('notas', JSON.stringify(avaliacao));
		requisicao('avaliacao', formData, function(status, response) {
			if (status == 200) {
				var data = JSON.parse(response); console.log(data);
				onSucessEnvioNotas(idAval);
			} else {
				aviso('Não foi possível enviar os registros. Tente novamente');
				carregamentoCompleto();
			}
		});
		msgEnvio[1][msgEnvio[1].length] = 'ENVIADO - ' + infoProf[3][hash];
	}
	
	function onSucessEnvioNotas(idAval) {
		contEnvio--;
		notas[idAval]["atualizar"] = false;
		if (contEnvio == 0) {
			onSucessEnvioTotNotas(msgEnvio); 
		}
	}
	
	function onSucessEnvioTotNotas(info) {
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
		finalizacaoNotas();
	}
	
	function finalizacaoNotas() {
		console.log('finalizado com sucesso')
		var request = openBD();
		request.onerror = function(event) {
		  alert("Você não habilitou o aplicativo para ficar OFFLINE?!");
		};
		request.onsuccess = function(event) {
			var hash = infoProf[6];
			infoProf[7] = null;
			infoProf[8] = null;
			infoProf[9] = null;
			var db = event.target.result;
			var tr = db.transaction(["infoProf", "notas"], "readwrite");
			var store = tr.objectStore("infoProf");
			var req = store.clear();
			req.onsuccess = function(evt) {
				store.put({campo: infoProf}, 0);
				var store2 = tr.objectStore("notas");
				store2.put({campo: notas, hash: hash}); 
				voltarNot();
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