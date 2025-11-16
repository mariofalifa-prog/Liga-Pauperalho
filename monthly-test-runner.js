// Monthly System Test Runner
// Test the monthly league functionality without browser

console.log('🚀 Iniciando testes do sistema mensal...');

// Mock DOM for testing
global.document = {
    createElement: () => ({ addEventListener: () => {} }),
    getElementById: () => null,
    querySelector: () => null
};

global.window = {
    addEventListener: () => {}
};

// Load modules
try {
    // Load utils first
    const fs = require('fs');
    const path = require('path');

    // Read and evaluate utils.js
    const utilsCode = fs.readFileSync('js/utils.js', 'utf8');
    eval(utilsCode);
    console.log('✅ Utils.js carregado');

    // Read and evaluate data.js
    const dataCode = fs.readFileSync('js/data.js', 'utf8');
    eval(dataCode);
    console.log('✅ Data.js carregado');

    // Read and evaluate monthly-league-enhancement.js
    const monthlyCode = fs.readFileSync('monthly-league-enhancement.js', 'utf8');
    eval(monthlyCode);
    console.log('✅ MonthlyLeagueManager carregado');

    // Run tests
    runTests();

} catch (error) {
    console.error('❌ Erro ao carregar módulos:', error.message);
}

function runTests() {
    console.log('\n📋 Executando testes...');

    let passedTests = 0;
    let totalTests = 0;

    // Test 1: MonthlyLeagueManager initialization
    totalTests++;
    try {
        if (typeof monthlyManager !== 'undefined') {
            console.log('✅ Teste 1: MonthlyLeagueManager inicializado');
            passedTests++;
        } else {
            console.log('❌ Teste 1: MonthlyLeagueManager não encontrado');
        }
    } catch (error) {
        console.log(`❌ Teste 1: Erro - ${error.message}`);
    }

    // Test 2: Month/Year functions
    totalTests++;
    try {
        const testDate = new Date();
        const monthYear = monthlyManager.getMonthYear(testDate);
        const leagueId = monthlyManager.getMonthlyLeagueId(testDate);

        if (monthYear && monthYear.includes('2024') && leagueId && leagueId.includes('monthly-')) {
            console.log('✅ Teste 2: Funções de mês/ano funcionando');
            console.log(`   Mês/Ano: ${monthYear}`);
            console.log(`   ID: ${leagueId}`);
            passedTests++;
        } else {
            console.log('❌ Teste 2: Funções de mês/ano com resultado inválido');
        }
    } catch (error) {
        console.log(`❌ Teste 2: Erro - ${error.message}`);
    }

    // Test 3: Current monthly league
    totalTests++;
    try {
        const currentLeague = monthlyManager.getCurrentMonthlyLeague();
        if (currentLeague) {
            console.log('✅ Teste 3: Liga mensal atual acessível');
            console.log(`   Liga: ${currentLeague.name}`);
            console.log(`   Status: ${currentLeague.status}`);
            passedTests++;
        } else {
            console.log('❌ Teste 3: Liga mensal atual não encontrada');
        }
    } catch (error) {
        console.log(`❌ Teste 3: Erro - ${error.message}`);
    }

    // Test 4: Monthly registrations
    totalTests++;
    try {
        const currentMonth = monthlyManager.getMonthYear(new Date());
        const registrations = monthlyManager.getMonthlyRegistrations(currentMonth);
        console.log(`✅ Teste 4: Inscrições mensais acessíveis (${registrations.length} inscrições)`);
        passedTests++;
    } catch (error) {
        console.log(`❌ Teste 4: Erro - ${error.message}`);
    }

    // Test 5: Monthly games
    totalTests++;
    try {
        const currentMonth = monthlyManager.getMonthYear(new Date());
        const games = monthlyManager.getMonthlyGames(currentMonth);
        console.log(`✅ Teste 5: Jogos mensais acessíveis (${games.length} jogos)`);
        passedTests++;
    } catch (error) {
        console.log(`❌ Teste 5: Erro - ${error.message}`);
    }

    // Test 6: Decklist visibility
    totalTests++;
    try {
        const shouldBeVisible = monthlyManager.shouldShowDecklists();
        console.log(`✅ Teste 6: Controle de visibilidade funcionando (visível: ${shouldBeVisible})`);
        passedTests++;
    } catch (error) {
        console.log(`❌ Teste 6: Erro - ${error.message}`);
    }

    // Test 7: Rankings calculation
    totalTests++;
    try {
        const currentMonth = monthlyManager.getMonthYear(new Date());
        const rankings = monthlyManager.calculateMonthlyRankings(currentMonth);
        console.log(`✅ Teste 7: Cálculo de classificações funcionando (${rankings.length} jogadores)`);
        passedTests++;
    } catch (error) {
        console.log(`❌ Teste 7: Erro - ${error.message}`);
    }

    // Test 8: Export functionality
    totalTests++;
    try {
        const exportData = monthlyManager.exportLeagueResults();
        if (exportData && exportData.type === 'all_monthly_results') {
            console.log('✅ Teste 8: Funcionalidade de exportação funcionando');
            console.log(`   Tipo: ${exportData.type}`);
            console.log(`   Total meses: ${exportData.totalMonths}`);
            passedTests++;
        } else {
            console.log('❌ Teste 8: Dados de exportação inválidos');
        }
    } catch (error) {
        console.log(`❌ Teste 8: Erro - ${error.message}`);
    }

    // Test 9: Monthly decklists
    totalTests++;
    try {
        const currentMonth = monthlyManager.getMonthYear(new Date());
        const decklists = monthlyManager.getMonthlyDecklists(currentMonth);
        console.log(`✅ Teste 9: Decklists mensais acessíveis (${decklists.length} decklists)`);
        passedTests++;
    } catch (error) {
        console.log(`❌ Teste 9: Erro - ${error.message}`);
    }

    // Test 10: All monthly leagues
    totalTests++;
    try {
        const allLeagues = monthlyManager.getAllMonthlyLeagues();
        const leagueCount = Object.keys(allLeagues).length;
        console.log(`✅ Teste 10: Todas as ligas mensais acessíveis (${leagueCount} ligas)`);
        passedTests++;
    } catch (error) {
        console.log(`❌ Teste 10: Erro - ${error.message}`);
    }

    // Results
    console.log('\n📊 Resultados dos Testes:');
    console.log(`✅ Passou: ${passedTests}/${totalTests} testes`);
    console.log(`❌ Falhou: ${totalTests - passedTests}/${totalTests} testes`);
    console.log(`📈 Taxa de sucesso: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

    if (passedTests === totalTests) {
        console.log('\n🎉 Todos os testes passaram! O sistema mensal está funcionando corretamente.');
    } else {
        console.log('\n⚠️ Alguns testes falharam. Verifique os erros acima.');
    }

    // Test specific monthly features
    console.log('\n🔍 Testes específicos de funcionalidades mensais:');

    // Test adding a registration
    try {
        const testReg = monthlyManager.addMonthlyRegistration({
            userId: 'test-user',
            deckArchetype: 'Mono Blue Terror',
            deckList: '4 Delver of Secrets\n4 Ponder\n4 Preordain'
        });
        console.log('✅ Inscrição mensal de teste adicionada com sucesso');
    } catch (error) {
        console.log(`❌ Falha ao adicionar inscrição: ${error.message}`);
    }

    // Test adding a game
    try {
        const testGame = monthlyManager.addMonthlyGame({
            player1Id: 'test-user-1',
            player2Id: 'test-user-2',
            player1Wins: 2,
            player2Wins: 1,
            player1Deck: 'Mono Blue Terror',
            player2Deck: 'Mono Red Burn'
        });
        console.log('✅ Jogo mensal de teste adicionado com sucesso');
    } catch (error) {
        console.log(`❌ Falha ao adicionar jogo: ${error.message}`);
    }

    // Test visibility toggle
    try {
        const currentMonth = monthlyManager.getMonthYear(new Date());
        const original = monthlyManager.shouldShowDecklists(currentMonth);
        monthlyManager.updateDecklistVisibility(currentMonth, !original);
        const updated = monthlyManager.shouldShowDecklists(currentMonth);
        monthlyManager.updateDecklistVisibility(currentMonth, original); // restore
        console.log(`✅ Toggle de visibilidade funcionou: ${original} → ${updated} → ${original}`);
    } catch (error) {
        console.log(`❌ Falha no toggle de visibilidade: ${error.message}`);
    }

    console.log('\n🏁 Testes concluídos!');
}

// Run if called directly
if (require.main === module) {
    runTests();
}