	var msgChamCont = {'cham' : 'Chamada', 'cont': 'Conteúdo'};
	
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
					registroDia = registros[date2string(infoProf[7]).replace(/-/g, '/')];
					//console.log(registroDia);
					setHTPIorHTPC(infoProf[12]);
					carregamentoCompleto();
				}
			}
			db.close();
		};
		request.onerror = function(event) {
			voltarEscola();
		}		
	}
	   
	  var posInfo = null;
	  function setHTPIorHTPC(tipo) {
        if (tipo == 'HTPI') {
			document.getElementById('tema').className = 'tema Inativo';
			document.getElementById('coord').className = 'coord Inativo';
			posInfo = 1;
		}
		else {
			document.getElementById('tema').value = registroDia[11];
			if (registroDia[12] === '')
				registroDia[12] = registros['coord'][0];
			document.getElementById('coord').value = registroDia[12];
			posInfo = 6;
		}
		var horario = registroDia[posInfo].split(' às ');
		if (horario.length != 2)
			horario = ['00:00','00:00'];
		document.getElementById("horarioIn").value = horario[0];
		document.getElementById("horarioOut").value = horario[1];
		 
        document.getElementById("textCont1").value = registroDia[posInfo + 1];
        document.getElementById("textCont2").value = registroDia[posInfo + 2];
        document.getElementById("textCont3").value = registroDia[posInfo + 3];
        document.getElementById("textCont4").value = registroDia[posInfo + 4];
		document.getElementById("diaReg").innerText = tipo +' do dia '+ date2string(infoProf[7]).replace(/-/g, '/');
        //document.getElementById("textCont1").focus();
      }
	  
	  document.getElementById("horarioIn").onchange = () => setRegistro(0, "horarioIn");
	  document.getElementById("horarioOut").onchange = () => setRegistro(0, "horarioOut");
	  document.getElementById("textCont1").onchange = () => setRegistro(1, "textCont1");
	  document.getElementById("textCont2").onchange = () => setRegistro(2, "textCont2");
	  document.getElementById("textCont3").onchange = () => setRegistro(3, "textCont3");
	  document.getElementById("textCont4").onchange = () => setRegistro(4, "textCont4");
	  document.getElementById('tema').onchange = () => setRegistro(5, "tema");
	  document.getElementById('coord').onchange = () => setRegistro(6, "coord");
	  

	  var registroDia = null;
      function setRegistro(num, id) {
		registroDia[13] = true; //flag de atualizacao
		//console.log('tem atualizacao')
		if (num == 0) {
			if (id === "horarioIn") 
				registroDia[posInfo] = document.getElementById(id).value + ' às ' + registroDia[posInfo].split(' às ')[1];
			else
				registroDia[posInfo] = registroDia[posInfo].split(' às ')[0] + ' às ' + document.getElementById(id).value;
		} else if (num == 6) { //set coordenador
			registroDia[12] = document.getElementById(id).value;
			registros['coord'][0] = registroDia[12];
			registros['coord'][1] = true;
		} else {
			registroDia[posInfo + num] = document.getElementById(id).value.replace(/\n/g, "");
			document.getElementById(id).value = registroDia[posInfo + num];
		}
      }	 
	  
	function cancel() {
		document.getElementById('cancelCham').className = 'Ativo';
	}
	
	function cancelNot() {//chamada [turma, cham, atualCham, cont,4 atualCont,5 responsavelAtual,6 listaAtualizada]
		document.getElementById('cancelCham').className = 'Inativo';
	}

	function cancelYes() {//chamada [turma, cham, atualCham, cont,4 atualCont,5 responsavelAtual,6 listaAtualizada]
		document.getElementById('cancelCham').className = 'Inativo';
		carregamento('Cancelando...');
		var request = openBD();		
		request.onerror = function(event) {
		  alert("Você não habilitou o aplicativo para ficar OFFLINE?!");
		};
		request.onsuccess = function(event) {
			var db = event.target.result;
			var tr = db.transaction(["infoProf"], "readwrite");			
			var store = tr.objectStore("infoProf");
			var date = infoProf[7];
			infoProf[13] = "Cancelado - "+ date2string(date)+" - "+msgChamCont[infoProf[12]];
			store.put({campo: infoProf}, 0);
			console.log(infoProf[12]+" cancelado - "+ date+" - ");
			db.close();
			carregamentoCompleto();
			openRegistro();
		};	
	}	
	
	function openRegistro() {
		window.location.href="selectreg.html";
	}
	
	function save() {		
		carregamento('Salvando...');
		registroDia[posInfo] = document.getElementById("horarioIn").value + ' às ' + document.getElementById("horarioOut").value;
		if (posInfo == 6) {//htpc tem q salvar tema e prof coord resp
		   // registroDia[11] = document.getElementById("tema").value;
			//registroDia[12] = document.getElementById("coord").value; //atualizar aqui porque ele eh preenchido automatico
			var coord = document.getElementById("coord").value;
			if (coord.localeCompare(registros['coord'][0]) != 0)
				registros['coord'] = [coord, true];
		}
		registros[date2string(infoProf[7]).replace(/-/g, '/')] = registroDia;
		var request = openBD();		
		request.onerror = function(event) {
		  alert("Você não habilitou o aplicativo para ficar OFFLINE?!");
		};
		request.onsuccess = function(event) {
			var db = event.target.result;
			var tr = db.transaction(["registros", "infoProf"], "readwrite");			
			var store = tr.objectStore("registros");			
			var requestUpdate = store.put({campo: registros}, 0);
			var store2 = tr.objectStore("infoProf");
			infoProf[13] = "Salvo - "+ date2string(infoProf[7])+" - "+msgChamCont[infoProf[12]];
			store2.put({campo: infoProf}, 0);
			requestUpdate.onerror = function () {                     
			 console.log("Erro alterar");
			};
			requestUpdate.onsuccess = function () {
				console.log(infoProf[12]+" salvo - "+ infoProf[7]);
				db.close();
				carregamentoCompleto();
				openRegistro();
			};
										
		};			
	}
	
		
	document.onkeydown = function(e){
        var elementFocus = document.activeElement;
        if(elementFocus != null) { 
          var keycode = e.keyCode;
          if (keycode == 13 || keycode == 40){
            switch (elementFocus.id) {
				case 'horarioIn': document.getElementById("horarioOut").focus();
				break;
				case 'horarioOut': document.getElementById("textCont1").focus();
				break;
				case 'textCont1': document.getElementById("textCont2").focus();
				break;
				case 'textCont2': document.getElementById("textCont3").focus();
				break;
				case 'textCont3': document.getElementById("textCont4").focus();
				break;
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