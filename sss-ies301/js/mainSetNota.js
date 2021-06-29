	window.onload = () => {
	  'use strict';

		carregamento('Aguarde...');
		var request = openBD();
		request.onsuccess = function(event) {
			var  db = request.result;
			//sucesso ao criar/abrir o banco de dados
			console.log('BD aberto');
			var transaction = db.transaction(["infoTurmas", "infoProf", "notas"], "readonly");
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
					var hash = infoProf[6];
					var store3 = transaction.objectStore('notas');
					var get3 = store3.get(hash);
					get3.onsuccess = function (event) {
						if (event.target.result == undefined)
							voltarNot();
						var notas = event.target.result["campo"];
						console.log("carregado notas - "+infoTurmas["nome"]);//turma
						avaliacao = notas[infoProf[7]];
						avaliacao["alunos"] = infoTurmas["alunos"];
						document.getElementById("num").value = 0;
						proxAluno();
						document.getElementById("alunoNota").className = "Ativo";						
						document.getElementById("turmaCarregada").innerHTML = infoProf[3][infoProf[6]];
						document.getElementById("avalTurmaBim").innerHTML = infoProf[8] +' - '+ infoProf[4] + 'º bimestre';
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

	document.getElementById("nota").onchange = function () {
		var numAluno = parseInt(document.getElementById("num").value, 10)-1;
		var notaAl = parseFloat(document.getElementById("nota").value.replace(',', '.')).toFixed(1);
		var infoAluno = avaliacao["alunos"];
		avaliacao["notas"][infoAluno[numAluno][0]] = notaAl;
		document.getElementById("nota").value = notaAl;
		avaliacao["atualizar"] = true;
	}
	
	function saveNotaAl() {
		var numAluno = parseInt(document.getElementById("num").value, 10)-1;		
		var infoAluno = avaliacao["alunos"];
		var notaAl = parseFloat(document.getElementById("nota").value.replace(',', '.')).toFixed(1);
		if (isNaN(notaAl)) notaAl = '';
		avaliacao["notas"][infoAluno[numAluno][0]] = notaAl;
		document.getElementById("nota").value = notaAl;
		avaliacao["atualizar"] = true;
		proxAluno();
	}

	  function proxAluno() {
        var numAluno = parseInt(document.getElementById("num").value, 10)-1;
		var infoAluno = avaliacao["alunos"];
		var totAluno = infoAluno.length;
              
        for (numAluno++; numAluno < totAluno && (infoAluno[numAluno][1].localeCompare("") == 0 || infoAluno[numAluno][2].localeCompare("AT") != 0); numAluno++) {} //pula sem nome e alunos nao ativos
        if (numAluno >= totAluno) {
		  aviso('Chegou ao final da lista');
          for (numAluno = 0; numAluno < totAluno && (infoAluno[numAluno][1].localeCompare("") == 0 || infoAluno[numAluno][2].localeCompare("AT") != 0); numAluno++) {} //qdo chegou no ultimo aluno testa entao qual eh o primeiro aluno valido
		}
        document.getElementById("num").value = numAluno+1;
        document.getElementById("nome").value = infoAluno[numAluno][1].substring(0,30);
        
        document.getElementById("nota").value = avaliacao["notas"][infoAluno[numAluno][0]].replace('.', ',');
       
      }
      
      function antAluno() {
        var numAluno = parseInt(document.getElementById("num").value, 10)-1;
		var infoAluno = avaliacao["alunos"];

        for (numAluno = numAluno; numAluno > 0 && (infoAluno[numAluno][1].localeCompare("") == 0 || infoAluno[numAluno][2].localeCompare("AT") != 0); numAluno--) {}
        numAluno--;
        if (numAluno < 0)
          numAluno = 0;
        document.getElementById("num").value = numAluno;
		proxAluno();
      }

	function cancel() {
		document.getElementById('cancelNota').className = 'Ativo';
	}
	
	function cancelNot() {
		document.getElementById('cancelNota').className = 'Inativo';
	}

	function cancelYes() {
		document.getElementById('cancelNota').className = 'Inativo';
		carregamento('Cancelando...');
		var request = openBD();		
		request.onerror = function(event) {
		  alert("Você não habilitou o aplicativo para ficar OFFLINE?!");
		};
		request.onsuccess = function(event) {
			var db = event.target.result;
			var tr = db.transaction(["infoProf"], "readwrite");			
			var store = tr.objectStore("infoProf");
			//var date = infoProf[5];
			infoProf[9] = "Cancelado - "+ infoProf[8] +' - '+ infoProf[4] + 'º bimestre' + " - " + infoProf[3][infoProf[6]];
			store.put({campo: infoProf}, 0);
			console.log(infoProf[8]+" cancelado - "+ infoProf[8] +' - '+ infoProf[4] + 'º bimestre' +" - " + infoProf[3][infoProf[6]]);
			voltarTurmaNot();
			db.close();
			carregamentoCompleto();
		};	
	}	
	
	function save() { 
		var hash = infoProf[6];
		var id = infoProf[7];
		
		carregamento('Salvando...');
		var request = openBD();		
		request.onerror = function(event) {
		  alert("Você não habilitou o aplicativo para ficar OFFLINE?!");
		};
		request.onsuccess = function(event) {
			var db = event.target.result;
			var tr = db.transaction(["notas", "infoProf"], "readwrite");
			var store = tr.objectStore("notas");

			var get = store.get(hash);
			get.onsuccess = function (event) {
				if (event.target.result) {
					var notas = event.target.result["campo"];
					notas[infoProf[7]] = avaliacao;
					console.log(infoProf[8]+" carregado - "+infoTurmas["nome"]);//aula + dia + turma
					var requestUpdate = store.put({campo: notas, hash: hash});

					var store2 = tr.objectStore("infoProf");
					infoProf[9] = "Salvo - "+ infoProf[8] +' - '+ infoProf[4] + 'º bimestre' + " - " + infoProf[3][infoProf[6]];
					store2.put({campo: infoProf}, 0);
					requestUpdate.onerror = function () {
						console.log("Erro ao alterar");
					};
					requestUpdate.onsuccess = function () {
						console.log(" salvo - "+ infoProf[8] +' - '+ infoProf[4] + 'º bimestre' +" - " + infoProf[3][infoProf[6]]);
						voltarTurmaNot();
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
				case 'nota': saveNotaAl(); elementFocus.select();
				break;
               default:
                 break;
            }
          }
        }
      }