	var msgChamCont = {'cham' : 'Chamada', 'cont': 'Conteúdo'};

	window.onload = () => {
	  'use strict';

		carregamento('Aguarde...');
		var request = openBD();
		request.onsuccess = function(event) {
			var  db = request.result;
			//sucesso ao criar/abrir o banco de dados
			console.log('BD aberto');
			var transaction = db.transaction(["infoTurmas", "infoProf", "diarios"], "readonly");
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
				var store2 = transaction.objectStore('infoTurmas');
				var get2 = store2.get(infoProf[6]); //info da turma
				get2.onsuccess = function (event) {
					if (event.target.result == undefined)
						voltarEscola();
					infoTurmas = event.target.result["campo"];
					var date = infoProf[5];
					var store3 = transaction.objectStore('diarios');
					var get3 = store3.get(date);
					get3.onsuccess = function (event) {
						if (event.target.result == undefined)
							voltarDataCham();
						var diarios = event.target.result["campo"];
						console.log(infoProf[8]+" carregado - "+ date +" - "+infoTurmas["nome"]);//aula + dia + turma
						chamada = diarios[infoProf[6]][infoProf[7]%10];
						chamada["alunos"] = infoTurmas["alunos"];
						document.getElementById("num").value = 0;

						if (infoProf[8] == 'cham') {
							atualizaCham('');
							document.getElementById("alunoCham").className = "Ativo";
						}
						else {
							setCont();
							document.getElementById("conteudo").className = "Ativo";
						}
						document.getElementById("turmaCarregada").innerHTML = infoProf[3][infoProf[6]];
						var aula = {1: '1ª aula', 2: '2ª aula', 3: '3ª aula',4: '4ª aula',5: '5ª aula',6: '6ª aula',7: '7ª aula',
						            11: '1ª e 2ª aula', 12: '2ª e 3ª aula', 13: '3ª e 4ª aula', 14: '4ª e 5ª aula', 15: '5ª e 6ª aula', 16: '6ª e 7ª aula'};
						document.getElementById("diaAula").innerHTML = date2string(date) +' - '+ aula[infoProf[7]];					 
						carregamentoCompleto();	
					}
				}			
			}
			db.close();
		};
		request.onerror = function(event) {
			voltarEscola();
		}
	}

	document.getElementById("C").onclick = function () {
		document.getElementById("C").className = "C Cativo";
		document.getElementById("F").className = "F";
		document.getElementById("N").className = "N";
		chamada["atualizar"] = true; //flag de atualizacao
		window.setTimeout(function() { atualizaCham('C')}, 200);
	}
      
	document.getElementById("F").onclick = function () {
        document.getElementById("F").className = "F Fativo";
        document.getElementById("C").className = "C";
		document.getElementById("N").className = "N";
		chamada["atualizar"] = true; //flag de atualizacao
        window.setTimeout(function() { atualizaCham('F')}, 200);
    }
    
	document.getElementById("N").onclick = function () {
		document.getElementById("C").className = "C";
		document.getElementById("F").className = "F"; 
		document.getElementById("N").className = "N Nativo";
		chamada["atualizar"] = true; //flag de atualizacao
		window.setTimeout(function() { atualizaCham('N')}, 200);
	}
	
    document.getElementById("textCont1").onchange = function() {
		chamada["atualizar"] = true; //flag de atualizacao
		chamada["conteudo"][0] = document.getElementById("textCont1").value.replace(/\n/g, "");
		document.getElementById("textCont1").value = chamada["conteudo"][0];
      }
      
      document.getElementById("textCont2").onchange = function() { 
       chamada["atualizar"] = true; //flag de atualizacao
		chamada["conteudo"][1] = document.getElementById("textCont2").value.replace(/\n/g, "");
        document.getElementById("textCont2").value = chamada["conteudo"][1];
      }
      
      document.getElementById("textCont3").onchange = function() { 
      chamada["atualizar"] = true; //flag de atualizacao
		chamada["conteudo"][2] = document.getElementById("textCont3").value.replace(/\n/g, "");
        document.getElementById("textCont3").value = chamada["conteudo"][2];
      }
      
      document.getElementById("textCont4").onchange = function() { 
       chamada["atualizar"] = true; //flag de atualizacao
		chamada["conteudo"][3] = document.getElementById("textCont4").value.replace(/\n/g, "");
        document.getElementById("textCont4").value = chamada["conteudo"][3];
      }
	  	  
      document.getElementById("textCont5").onchange = function() { 
      chamada["atualizar"] = true; //flag de atualizacao
		chamada["conteudo"][4] = document.getElementById("textCont5").value;
      }
	  
	  document.getElementById("textCont5").onclick = function() { 
		var gen = document.getElementById("textCont5");
		if (gen.value != '')
			return;
		var nomeMes = [,'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
		var diaAula = document.getElementById('diaAula').innerText.split(' - ')[0].split('-');
		var data = 'No dia '+ (diaAula[0] == '01' ? '1º' : diaAula[0]) +' de '+ nomeMes[parseInt(diaAula[1],10)] +' de ' + diaAula[2] + ' ';
		gen.value =  data;
	  }
	  
	  function atualizaCham(sitCham) {
        var numAluno = parseInt(document.getElementById("num").value, 10)-1;
		var infoAluno = chamada["alunos"];
		var totAluno = infoAluno.length;
        if (sitCham.localeCompare('') != 0) {
			var numCham = infoAluno[numAluno][0];
			chamada["chamada"][numCham] = (sitCham != 'N' ? sitCham : '');
        }       
        for (numAluno++; numAluno < totAluno && (infoAluno[numAluno][1].localeCompare("") == 0 || infoAluno[numAluno][2].localeCompare("AT") != 0); numAluno++) {} //pula sem nome e alunos nao ativos
        if (numAluno >= totAluno) {
		  aviso('Chegou ao final da lista');
          for (numAluno = 0; numAluno < totAluno && (infoAluno[numAluno][1].localeCompare("") == 0 || infoAluno[numAluno][2].localeCompare("AT") != 0); numAluno++) {} //qdo chegou no ultimo aluno testa entao qual eh o primeiro aluno valido
		}
        document.getElementById("num").value = numAluno+1;
        document.getElementById("nome").value = infoAluno[numAluno][1].substring(0,30);
        var sitCham = chamada["chamada"][infoAluno[numAluno][0]];
        
        document.getElementById("C").className = "C";
        document.getElementById("F").className = "F";
		document.getElementById("N").className = "N";
        if (sitCham.localeCompare('') != 0)          
          document.getElementById(sitCham).className = sitCham+" "+ sitCham +"ativo"; //desativa os dois e ativa o correto
      }
      
      function antAluno() {
        var numAluno = parseInt(document.getElementById("num").value, 10)-1;
		var infoAluno = chamada["alunos"];

        for (numAluno = numAluno; numAluno > 0 && (infoAluno[numAluno][1].localeCompare("") == 0 || infoAluno[numAluno][2].localeCompare("AT") != 0); numAluno--) {}
        numAluno--;
        if (numAluno < 0)
          numAluno = 0;
        document.getElementById("num").value = numAluno;
        atualizaCham('');
      }
      
      function proxAluno() {
        atualizaCham('');
      }
	  
	  function setCont() {
        document.getElementById("conteudo").className = "Ativo";
		document.getElementById("alunoCham").className = "Inativo";
        var numAula = infoProf[7];
		var cont = chamada["conteudo"];
        document.getElementById("textCont1").value = cont[0];
        document.getElementById("textCont2").value = cont[1];
        document.getElementById("textCont3").value = cont[2];
        document.getElementById("textCont4").value = cont[3];
        document.getElementById("textCont5").value = cont[4];
        document.getElementById("textCont1").focus();
      }
	  
	function cancel() {
		document.getElementById('cancelCham').className = 'Ativo';
	}
	
	function cancelNot() {
		document.getElementById('cancelCham').className = 'Inativo';
	}

	function cancelYes() {
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
			var date = infoProf[5];
			infoProf[9] = "Cancelado - "+ document.getElementById("diaAula").innerHTML + " - " + infoProf[3][infoProf[6]] + " - "+msgChamCont[infoProf[8]];
			store.put({campo: infoProf}, 0);
			console.log(infoProf[8]+" cancelado - "+ document.getElementById("diaAula").innerHTML +" - " + infoProf[3][infoProf[6]]);
			voltarTurmaCham();
			db.close();
			carregamentoCompleto();
		};	
	}	
	
	function save() { 
		var date = infoProf[5];
		var numAula = infoProf[7];
		
		carregamento('Salvando...');
		var request = openBD();		
		request.onerror = function(event) {
		  alert("Você não habilitou o aplicativo para ficar OFFLINE?!");
		};
		request.onsuccess = function(event) {
			var db = event.target.result;
			var tr = db.transaction(["diarios", "infoProf"], "readwrite");
			var store = tr.objectStore("diarios");

			var get = store.get(date);
			get.onsuccess = function (event) {
				if (event.target.result) {
					diarios = event.target.result["campo"];
					diarios[infoProf[6]][infoProf[7]%10] = chamada;
					console.log(infoProf[8]+" carregado - "+ date +" - "+infoTurmas["nome"]);//aula + dia + turma
					var requestUpdate = store.put({campo: diarios, id: date});

					var store2 = tr.objectStore("infoProf");
					infoProf[9] = "Salvo - "+ document.getElementById("diaAula").innerHTML + " - " + infoProf[3][infoProf[6]] + " - "+msgChamCont[infoProf[8]];
					store2.put({campo: infoProf}, 0);
					requestUpdate.onerror = function () {
						console.log("Erro ao alterar");
					};
					requestUpdate.onsuccess = function () {
						console.log(infoProf[8]+" salvo - "+ document.getElementById("diaAula").innerHTML +" - " + infoProf[3][infoProf[6]]);
						voltarTurmaCham();
					};
				}
				db.close();
				carregamentoCompleto();
			};	
		}
	}
	
	document.onkeydown = function(e){
        var elementFocus = document.activeElement;
        if(elementFocus != null) { 
          var keycode = e.keyCode;
          if (keycode == 13 || keycode == 40){
            switch (elementFocus.id) {
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
        }
      }