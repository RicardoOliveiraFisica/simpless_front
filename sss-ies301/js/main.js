var carregador = null;
var avisador = null;
var tam = 0;
var infoAno = '2021';
var startDate1Sem = new Date("8/04/2021");
var fimDate1Sem = new Date("7/25/2021");
var startDate2Sem = new Date("7/26/2021");

var infoProf = null; //0 name,1 RM,2 senha,3 [hash: turma],4 bim,5 date,6 turmaSelected,7 numAula[or idAval],8 chamORcont,9 msg
var infoTurmas = null;//[id, turma, [nomeAluno, sit, dataSit]]
var diarios = null; 
var chamada = null; 
var registros = null 
var notas = null;
var avaliacao = null;

const DB_NAME = "diarioEscola";
const DB_VERSION = 1;
	
function openBD() {
	var request = indexedDB.open(DB_NAME, DB_VERSION);
	request.onupgradeneeded = function(event) {
		var db = event.target.result;
		var infoProf = db.createObjectStore("infoProf");
		var infoTurmas = db.createObjectStore("infoTurmas", {keyPath: "hash"});
		var registros = db.createObjectStore("registros");
		var diarios = db.createObjectStore("diarios", {keyPath: "id"});
		var notas = db.createObjectStore("notas", {keyPath: "hash"});
		console.log('BD criado');
	}
	return request;
}

function carregamento(resposta) {
	document.getElementById('resposta').innerText = resposta || '';
	document.getElementById("carregamento").className = "Ativo";
	carregador = setInterval(function(){
		if (tam < 7) {
			s4.style.fontSize = 6-(tam<4 ? tam : (tam/3+2))+"rem";
			s6.style.fontSize = 2+(tam<4 ? tam/3 : (tam-2))+"rem";
		}
		else  {
			s4.style.fontSize = 2+(tam<10 ? (tam-6)/3 : (tam-6)-2)+"rem";
			s6.style.fontSize = 6-(tam<10 ? (tam-6) : (tam-6)/3+2)+"rem";
		}
		if(tam < 12) tam++;
		else tam = 1;
	}, 750);
}

function aviso(aviso) {
	document.getElementById("aviso").className = "Ativo";
	clearTimeout(avisador);
	document.getElementById("aviso").innerHTML = aviso || '';
	avisador = setTimeout(function(){
		clearTimeout(avisador);
		document.getElementById("aviso").innerHTML = '';
		document.getElementById("aviso").className = "Inativo";
	}, 5000);
}

function carregamentoCompleto() {
	document.getElementById("carregamento").className = "Inativo";
	clearInterval(carregador);
	
}
	

	var HttpClient = function() {
		this.post = function(aUrl, data, aCallback) {
			var anHttpRequest = new XMLHttpRequest();
			anHttpRequest.onreadystatechange = function() {
				if (anHttpRequest.readyState == 4)
					aCallback(anHttpRequest.status, anHttpRequest.responseText);
			};
			anHttpRequest.open( 'POST', aUrl, true );
			anHttpRequest.send(data);
		};
		this.del = function(aUrl, data, aCallback) {
			var anHttpRequest = new XMLHttpRequest();
			anHttpRequest.onreadystatechange = function() {
				if (anHttpRequest.readyState == 4)
					aCallback(anHttpRequest.status, anHttpRequest.responseText);
			};
			anHttpRequest.open( 'DELETE', aUrl, true );
			anHttpRequest.send(data);
		};
    };
	
	function requisicao(endpoint, formData, callback) {
		var client = new HttpClient();
		client.post('https://simpless.herokuapp.com/'+endpoint+'/', formData, callback);
    };
	
	function exclusao(endpoint, formData, callback) {
		var client = new HttpClient();
		client.del('https://simpless.herokuapp.com/'+endpoint+'/', formData, callback);
    };
	
	
	function requisicaoTESTE(endpoint, formData, callback) {
		if (endpoint == "acesso")
			callback(200, JSON.stringify(acesso));
		else if (endpoint == "frequencia")
			callback(200, JSON.stringify(frequencia));
	}
	
	function voltarEscola() {
		window.location.href="index.html";
	}			
	
	function voltarEscolha() {
		window.location.href="selectoption.html";
	}
	
	function voltarDataCham() {
		window.location.href="selectcham.html";
	}
	
	function voltarTurmaCham() {
		window.location.href="selectturmacham.html";
	}
	
	function voltarNot() {
		window.location.href="selectnot.html";
	}
	function voltarTurmaNot() {
		window.location.href="selectturmanot.html";
	}
	
	
	function carregarDataAtual() {
		return date2string();
	}
	
	function date2string(date) {
		if(date) {
			var today = new Date(date);
			today.setHours(today.getHours() + 3);
		}
		else
			var today = new Date();
		
		var dy = ('0'+today.getDate()).slice(-2);
		var mt = ('0'+(today.getMonth()+1)).slice(-2);
		var yr = today.getFullYear();
		if(date)
			return (dy+"-"+mt+"-"+yr);
		return (yr+"-"+mt+"-"+dy);		
	}