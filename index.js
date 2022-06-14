const divResultado = document.getElementById('resultado')
const headTb = document.getElementById('headTb')
const corpoTb = document.getElementById('corpoTb')
const aviso = document.getElementById('aviso')
const graficoH = document.getElementById('graficoH')
const graficoB = document.getElementById('graficoB')
const form = document.getElementById('formulario')
const botao2 = document.getElementById('botao2')
let matriz = [] //matriz para armazenar os dados da planilha

getDados() //carrega os dados na matriz

async function getDados() {
  const arquivoCSV = await fetch('./TA_PRECO_MEDICAMENTO.csv')
  const data = await arquivoCSV.text()
  const linhas = data.split('\n')
  let totalColunas = 0
  let medicamentoColunas = 0
  let linha = ''
  let novaLinha = ''
  let medicamento = ''
  let cont = 0

  linhas.forEach(arr => {
    linha = arr.split(';')
    totalColunas = linha.length
    medicamento = linha[0]
    medicamentoColunas = 0
    if (linha[0][0] == '"') {
      //identifica que o nome é composto
      for (let lin = 1; lin < totalColunas; lin++) {
        medicamento += ' ' + linha[lin] //reagrupa trocando ponto-e-virgula por espaço
        medicamentoColunas++ //conta quantos nomes estao agrupados no composto
        if (linha[lin].slice(-1) == '"') {
          break
        }
      }
    }

    novaLinha = medicamento
    for (let lin = medicamentoColunas + 1; lin < totalColunas; lin++) {
      novaLinha += ';' + linha[lin] //insere aspa dupla em cada coluna para preparar a linha para ser convertida em array
    }
    novaLinha = novaLinha.replace(/,/g, '.') //troca as casas decimais dos valores numericos de virgula por ponto
    novaLinha = novaLinha.replace(/;/g, ',') //troca os ponto-e-virgulas por virgula para preparar para ser convertido em array
    matriz[cont] = novaLinha.split(',') //converte cada linha num array para entrar na matriz
    cont++ //incrementa contador de linhas da matriz
  })
}
async function getCodigoBarras(codigoBarras) {
  //função que pega o código de barras
  const totalMatriz = matriz.length
  let pmc_0p = 0
  let pmc_20p = 0
  let pmc_dif = 0
  let achou = 0

  corpoTb.innerHTML = ''
  headTb.innerHTML = ''
  for (let lin = 0; lin < totalMatriz; lin++) {
    //percorre array
    if (matriz[lin][5] == codigoBarras) {
      achou = 1
      pmc_0p = matriz[lin][23] //pega o pmc 0%
      pmc_20p = matriz[lin][31] //pega o pmc 20%
      pmc_dif = (pmc_20p - pmc_0p).toFixed(2) // faz a média do pmc 0% com o pmc 20%

      headTb.innerHTML = ` 
      <tr>
      <th>Substância</th>
      <th>Produto</th>                
      <th>Apresentação</th>
      <th>PF Sem Impostos</th>
      <th>PMC mais baixo</th>
      <th>PMC mais alto</th>
      <th>Diferença</th>
    </tr>
  `
      corpoTb.innerHTML = `
        <tr>
        <td>${matriz[lin][0]}</td>
        <td>${matriz[lin][8]}</td>
        <td>${matriz[lin][9]}</td>
        <td>${matriz[lin][13]}</td>
        <td>${matriz[lin][13]}</td>
        <td>${pmc_0p}</td>
        <td>${pmc_dif}</td>
        </tr>
      `
    }
    // mostra dados da tabela na tela
  }
  if (achou == 0)
    aviso.innerHTML = `
      <p>Nenhum medicamento encontrado</p>
     `
}
// aviso caso não ache medicamento

function getGrafico() {
  //função para pegar positivo, negativo e neutro e transformar em %
  let totalNeutros = 0
  let totalNegativos = 0
  let totalPositivos = 0
  let totalGeral = 0
  let perPositivo = 0
  let perNeutro = 0
  let perNegativo = 0
  let perTotal = 0

  for (let lin = 0; lin < matriz.length; lin++) {
    if (matriz[lin][38] == 'Sim') {
      if (matriz[lin][37] == 'Negativa') {
        //array pegando dados e armazenando
        totalNegativos++
      } else if (matriz[lin][37] == 'Positiva') {
        totalPositivos++
      } else if (matriz[lin][37] == 'Neutra') {
        totalNeutros++
      }
    }
  }
  totalGeral = totalPositivos + totalNegativos + totalNeutros
  perPositivo = (totalPositivos * 100) / totalGeral
  perNeutro = (totalNeutros * 100) / totalGeral // transformando em porcentagem
  perNegativo = (totalNegativos * 100) / totalGeral
  perTotal = perPositivo + perNegativo + perNeutro // média

  graficoH.innerHTML = `
    <tr>
      <th>CLASSIFICACAO</th>
      <th>PERCENTUAL</th>
      <th align='left'>GRAFICO</th>
    </tr>
  `

  graficoB.innerHTML = `
      <tr>
        <td>Negativa</td>
        <td>${perNegativo.toFixed(2)}%</td>
        <td align='left'>${''.padStart(perNegativo, '*')}</td>
      </tr>
      <tr>
        <td>Neutra</td>
        <td>${perNeutro.toFixed(2)}%</td>
        <td align='left'>${''.padStart(perNeutro, '*')}</td>
      </tr>
      <tr>
        <td>Positiva</td>
        <td>${perPositivo.toFixed(2)}%</td>
        <td align='left'>${''.padStart(perPositivo, '*')}</td>
      </tr>
      <tr>
      <td>TOTAL</td>
      <td>${perTotal.toFixed(2)}%</td>
      <td></td>
      </tr>
  `
}
// dados que aparecem na tabela já formatados

async function getMedicamento(nomePesquisado) {
  // função para pegar o nome do medicamento
  const totalMatriz = matriz.length
  var achou = 0
  corpoTb.innerHTML = ''
  for (let lin = 0; lin < totalMatriz; lin++) {
    if (
      matriz[lin][0].indexOf(nomePesquisado) >= 0 && // pega todos os medicamentos que foram comercializados em 2020
      matriz[lin][38] == 'Sim'
    ) {
      achou = 1
      headTb.innerHTML = `
      <tr>
      <th>Substância</th>
      <th>Produto</th>
      <th>Apresentação</th>
      <th>PF Sem Impostos</th>
    </tr>
  `

      corpoTb.innerHTML += `
      <tr>
        <td>${matriz[lin][0]}</td>
        <td>${matriz[lin][8]}</td>
        <td>${matriz[lin][9]}</td>
        <td>${matriz[lin][13]}</td>
      </tr> 
      `
    }
  }
  if (achou == 0)
    aviso.innerHTML = `
      <p>Nenhum medicamento encontrado</p>
     `
}
// mostra os dados na tela numa tabela
form.addEventListener('submit', e => {
  // evento de no momento em que acontecer o submit conferir os dados em caso de erro aparecer mensagem de erro e também limpeza de tela caso outro campo fosse chamado
  e.preventDefault()
  aviso.innerHTML = ''
  aviso.innerHTML = ''
  graficoH.innerHTML = ''
  graficoB.innerHTML = ''
  headTb.innerHTML = ''

  var inputMedicamento = document
    .getElementById('nomeMedicamento')
    .value.toUpperCase()
  var inputCodigoBarras = document.getElementById('codigoBarras').value
  if (inputMedicamento != '' && inputCodigoBarras == '') {
    getMedicamento(inputMedicamento)
  } else if (inputMedicamento == '' && inputCodigoBarras != '') {
    if (!isNaN(inputCodigoBarras)) getCodigoBarras(inputCodigoBarras)
    else
      aviso.innerHTML = `
      <p>Código de barras precisa ser um número.</p>
     `
  } else if (inputMedicamento == '' && inputCodigoBarras == '') {
    aviso.innerHTML = `
      <p>Preencha algum dos campos</p>
     `
  } else if (inputMedicamento != '' && inputCodigoBarras != '') {
    aviso.innerHTML = `
        <p>Preencha somente um dos campos </p>
      `
  }
  //mostra dados na tela numa tabela
})

botao2.addEventListener('click', e => {
  // botão específico para o gráfico
  corpoTb.innerHTML = ''
  headTb.innerHTML = ''
  getGrafico()
})
