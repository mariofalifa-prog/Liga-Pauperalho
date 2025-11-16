// Games Management System for Liga Pauperalho
class GamesManager {
  constructor() {
    this.currentGames = [];
    this.init();
  }

  // Initialize games management
  init() {
    this.bindEvents();
    this.loadPendingGames();
    this.setupAutoRefresh();
  }

  // Bind event listeners
  bindEvents() {
    // Add result button
    const addResultBtn = document.getElementById('addResultBtn');
    if (addResultBtn) {
      addResultBtn.addEventListener('click', () => this.showAddResultModal());
    }

    // View games button
    const viewGamesBtn = document.getElementById('viewGamesBtn');
    if (viewGamesBtn) {
      viewGamesBtn.addEventListener('click', () => this.loadMyGames());
    }
  }

  // Show add result modal
  showAddResultModal() {
    if (!authManager.requireAuth()) return;

    const currentUser = authManager.getCurrentUser();
    const userRegistration = dataManager.getRegistration(currentUser.id);

    if (!userRegistration) {
      authManager.showNotification(
        'Inscrição Necessária',
        'Você precisa estar inscrito na liga para registrar resultados',
        'warning'
      );
      return;
    }

    const availableOpponents = this.getAvailableOpponents(currentUser.id);

    if (availableOpponents.length === 0) {
      authManager.showNotification(
        'Sem Oponentes',
        'Não há oponentes disponíveis no momento',
        'info'
      );
      return;
    }

    const modalHTML = `
      <div class="game-result-form-container">
        <div class="form-header">
          <i class="fas fa-gamepad"></i>
          <h3>Registrar Resultado da Partida</h3>
          <p>Informe o resultado da sua partida</p>
        </div>
        <form id="gameResultForm" class="auth-form">
          <input type="hidden" id="player1Id" value="${currentUser.id}">

          <div class="form-group">
            <label for="opponentId">Oponente:</label>
            <select id="opponentId" name="opponentId" required>
              <option value="">Selecione seu oponente</option>
              ${availableOpponents.map(opponent =>
                `<option value="${opponent.id}">${Utils.escapeHtml(opponent.name)} (${Utils.escapeHtml(opponent.deckArchetype)})</option>`
              ).join('')}
            </select>
          </div>

          <div class="form-group">
            <label>Seu Resultado:</label>
            <div class="result-options">
              <label class="result-option">
                <input type="radio" name="resultType" value="2-0-win" required>
                <div class="result-card">
                  <i class="fas fa-trophy text-success"></i>
                  <span class="result-score">2-0</span>
                  <span class="result-label">Vitória</span>
                </div>
              </label>

              <label class="result-option">
                <input type="radio" name="resultType" value="2-1-win" required>
                <div class="result-card">
                  <i class="fas fa-trophy text-warning"></i>
                  <span class="result-score">2-1</span>
                  <span class="result-label">Vitória</span>
                </div>
              </label>

              <label class="result-option">
                <input type="radio" name="resultType" value="1-0-win" required>
                <div class="result-card">
                  <i class="fas fa-trophy text-info"></i>
                  <span class="result-score">1-0</span>
                  <span class="result-label">Vitória</span>
                </div>
              </label>

              <label class="result-option">
                <input type="radio" name="resultType" value="0-2-loss" required>
                <div class="result-card">
                  <i class="fas fa-times text-danger"></i>
                  <span class="result-score">0-2</span>
                  <span class="result-label">Derrota</span>
                </div>
              </label>

              <label class="result-option">
                <input type="radio" name="resultType" value="1-2-loss" required>
                <div class="result-card">
                  <i class="fas fa-times text-warning"></i>
                  <span class="result-score">1-2</span>
                  <span class="result-label">Derrota</span>
                </div>
              </label>

              <label class="result-option">
                <input type="radio" name="resultType" value="0-1-loss" required>
                <div class="result-card">
                  <i class="fas fa-times text-secondary"></i>
                  <span class="result-score">0-1</span>
                  <span class="result-label">Derrota</span>
                </div>
              </label>
            </div>
          </div>

          <div class="form-group">
            <label for="gameNotes">Observações (opcional):</label>
            <textarea id="gameNotes" name="notes" rows="3" placeholder="Comentários sobre a partida..."></textarea>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn btn-primary">
              <i class="fas fa-save"></i>
              Registrar Resultado
            </button>
            <button type="button" class="btn btn-outline" onclick="app.closeModal()">
              <i class="fas fa-times"></i>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    `;

    app.showModal('Registrar Resultado', modalHTML);
    this.bindGameResultFormEvents();
  }

  // Get available opponents for current user
  getAvailableOpponents(currentUserId) {
    const registrations = dataManager.getLeagueRegistrations();
    const userGames = dataManager.getUserGames(currentUserId);

    // Get opponents that user hasn't played against yet
    const playedOpponentIds = new Set();
    userGames.forEach(game => {
      if (game.player1Id === currentUserId) {
        playedOpponentIds.add(game.player2Id);
      } else {
        playedOpponentIds.add(game.player1Id);
      }
    });

    return registrations
      .filter(reg => reg.userId !== currentUserId && !playedOpponentIds.has(reg.userId))
      .map(reg => {
        const user = dataManager.getUserById(reg.userId);
        return {
          id: reg.userId,
          name: user.profile.displayName || user.name,
          deckArchetype: reg.deckArchetype
        };
      });
  }

  // Bind game result form events
  bindGameResultFormEvents() {
    const form = document.getElementById('gameResultForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleGameResultSubmission();
      });
    }

    // Handle result selection
    const resultOptions = document.querySelectorAll('input[name="resultType"]');
    resultOptions.forEach(option => {
      option.addEventListener('change', (e) => {
        document.querySelectorAll('.result-card').forEach(card => {
          card.classList.remove('selected');
        });
        if (e.target.checked) {
          e.target.closest('.result-option').querySelector('.result-card').classList.add('selected');
        }
      });
    });
  }

  // Handle game result form submission
  async handleGameResultSubmission() {
    const form = document.getElementById('gameResultForm');
    const formData = new FormData(form);

    const player1Id = formData.get('player1Id');
    const player2Id = formData.get('opponentId');
    const resultType = formData.get('resultType');
    const notes = formData.get('notes');

    try {
      // Validation checks
      if (!player2Id) {
        throw new Error('Selecione um oponente');
      }

      if (!resultType) {
        throw new Error('Selecione o resultado da partida');
      }

      // Check if players have already played each other
      if (dataManager.havePlayersAlreadyPlayed(player1Id, player2Id)) {
        throw new Error('Você já jogou contra este oponente nesta liga');
      }

      // Check if player has reached max games
      if (dataManager.hasPlayerReachedMaxGames(player1Id)) {
        throw new Error('Você já atingiu o número máximo de jogos nesta liga');
      }

      // Get player decks
      const player1Reg = dataManager.getRegistration(player1Id);
      const player2Reg = dataManager.getRegistration(player2Id);

      if (!player1Reg || !player2Reg) {
        throw new Error('Informações de inscrição não encontradas');
      }

      // Create game with result
      const game = dataManager.createGameWithResult({
        player1Id,
        player2Id,
        player1Deck: player1Reg.deckArchetype,
        player2Deck: player2Reg.deckArchetype,
        resultType,
        notes
      });

      // Send Discord notification
      const player1 = dataManager.getUserById(player1Id);
      const player2 = dataManager.getUserById(player2Id);
      const resultDesc = dataManager.getResultDescription(resultType);

      await dataManager.sendDiscordNotification(
        `🎮 Resultado Registrado!\n\n👊 ${player1.profile.displayName || player1.name} vs ${player2.profile.displayName || player2.name}\n📊 Resultado: ${resultDesc}\n🃏 Decks: ${player1Reg.deckArchetype} vs ${player2Reg.deckArchetype}`,
        'game_result'
      );

      // Create notification for opponent
      dataManager.createNotification({
        title: 'Novo Resultado Registrado',
        message: `Uma partida foi registrada contra ${player1.profile.displayName || player1.name}`,
        type: 'info',
        userId: player2Id
      });

      // Show success message
      authManager.showNotification(
        'Resultado Registrado!',
        `Sua partida contra ${player2.profile.displayName || player2.name} foi registrada com sucesso.`,
        'success'
      );

      // Close modal and refresh data
      app.closeModal();
      this.loadPendingGames();

      // Refresh rankings if they're currently displayed
      if (window.location.hash === '#rankings') {
        rankingsManager.refresh();
      }

    } catch (error) {
      authManager.showNotification('Erro ao Registrar', error.message, 'error');
    }
  }

  // Load user's games
  loadMyGames() {
    if (!authManager.requireAuth()) return;

    const currentUser = authManager.getCurrentUser();
    const userGames = dataManager.getUserGames(currentUser.id);

    this.displayUserGames(userGames);
  }

  // Display user's games
  displayUserGames(games) {
    const gamesContainer = document.getElementById('myGamesContainer');
    if (!gamesContainer) return;

    if (games.length === 0) {
      gamesContainer.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-gamepad fa-3x text-muted"></i>
          <h4>Nenhuma Partida Registrada</h4>
          <p>Você ainda não registrou nenhuma partida nesta liga.</p>
        </div>
      `;
      return;
    }

    const gamesHTML = games.map(game => {
      const isPlayer1 = game.player1Id === authManager.getCurrentUser().id;
      const opponentId = isPlayer1 ? game.player2Id : game.player1Id;
      const opponent = dataManager.getUserById(opponentId);
      const opponentReg = dataManager.getRegistration(opponentId);

      const playerWins = isPlayer1 ? game.player1Wins : game.player2Wins;
      const opponentWins = isPlayer1 ? game.player2Wins : game.player1Wins;
      const result = playerWins > opponentWins ? 'Vitória' : 'Derrota';
      const resultClass = playerWins > opponentWins ? 'success' : 'danger';

      return `
        <div class="game-card card">
          <div class="game-header">
            <div class="game-players">
              <div class="player-info">
                <img src="${app.getAvatarUrl(authManager.getCurrentUser())}" alt="Você" class="player-avatar">
                <div>
                  <div class="player-name">Você</div>
                  <div class="player-deck">${isPlayer1 ? game.player1Deck : game.player2Deck}</div>
                </div>
              </div>
              <div class="game-score ${resultClass}">
                <span class="score-display">${playerWins}-${opponentWins}</span>
                <span class="result-label">${result}</span>
              </div>
              <div class="player-info">
                <img src="${app.getAvatarUrl(opponent)}" alt="${opponent.name}" class="player-avatar">
                <div>
                  <div class="player-name">${opponent.profile.displayName || opponent.name}</div>
                  <div class="player-deck">${isPlayer1 ? game.player2Deck : game.player1Deck}</div>
                </div>
              </div>
            </div>
          </div>
          <div class="game-details">
            <div class="game-date">
              <i class="fas fa-calendar"></i>
              ${Utils.formatDateTime(new Date(game.playedAt))}
            </div>
            ${game.notes ? `<div class="game-notes"><i class="fas fa-sticky-note"></i> ${Utils.escapeHtml(game.notes)}</div>` : ''}
            <div class="game-status">
              ${game.validated ?
                '<span class="status-badge validated"><i class="fas fa-check"></i> Validado</span>' :
                '<span class="status-badge pending"><i class="fas fa-clock"></i> Pendente</span>'
              }
            </div>
          </div>
        </div>
      `;
    }).join('');

    gamesContainer.innerHTML = `
      <div class="games-header">
        <h3>Minhas Partidas</h3>
        <div class="games-stats">
          <div class="stat">
            <span class="stat-label">Total:</span>
            <span class="stat-value">${games.length}</span>
          </div>
          <div class="stat">
            <span class="stat-label">Vitórias:</span>
            <span class="stat-value">${games.filter(g => {
              const isPlayer1 = g.player1Id === authManager.getCurrentUser().id;
              const playerWins = isPlayer1 ? g.player1Wins : g.player2Wins;
              const opponentWins = isPlayer1 ? g.player2Wins : g.player1Wins;
              return playerWins > opponentWins;
            }).length}</span>
          </div>
        </div>
      </div>
      <div class="games-list">
        ${gamesHTML}
      </div>
    `;
  }

  // Load pending games for admin validation
  loadPendingGames() {
    const pendingGamesContainer = document.getElementById('pendingGames');
    if (!pendingGamesContainer) return;

    const pendingGames = dataManager.getLeagueGames().filter(game => !game.validated);

    if (pendingGames.length === 0) {
      pendingGamesContainer.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-check-circle fa-3x text-success"></i>
          <h4>Nenhum Jogo Pendente</h4>
          <p>Todos os jogos estão validados.</p>
        </div>
      `;
      return;
    }

    const gamesHTML = pendingGames.map(game => {
      const player1 = dataManager.getUserById(game.player1Id);
      const player2 = dataManager.getUserById(game.player2Id);

      return `
        <div class="pending-game-card card">
          <div class="game-header">
            <div class="game-players">
              <div class="player-info">
                <img src="${app.getAvatarUrl(player1)}" alt="${player1.name}" class="player-avatar">
                <div>
                  <div class="player-name">${player1.profile.displayName || player1.name}</div>
                  <div class="player-deck">${Utils.escapeHtml(game.player1Deck)}</div>
                </div>
              </div>
              <div class="game-score">
                <span class="score-display">${game.player1Wins}-${game.player2Wins}</span>
              </div>
              <div class="player-info">
                <img src="${app.getAvatarUrl(player2)}" alt="${player2.name}" class="player-avatar">
                <div>
                  <div class="player-name">${player2.profile.displayName || player2.name}</div>
                  <div class="player-deck">${Utils.escapeHtml(game.player2Deck)}</div>
                </div>
              </div>
            </div>
          </div>
          <div class="game-details">
            <div class="game-date">
              <i class="fas fa-calendar"></i>
              ${Utils.formatDateTime(new Date(game.playedAt))}
            </div>
            ${game.notes ? `<div class="game-notes"><i class="fas fa-sticky-note"></i> ${Utils.escapeHtml(game.notes)}</div>` : ''}
            <div class="game-actions">
              <button class="btn btn-small btn-success" onclick="gamesManager.validateGame('${game.id}')">
                <i class="fas fa-check"></i> Validar
              </button>
              <button class="btn btn-small btn-danger" onclick="gamesManager.deleteGame('${game.id}')">
                <i class="fas fa-trash"></i> Excluir
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    pendingGamesContainer.innerHTML = `
      <div class="pending-games-header">
        <h3>Jogos Pendentes de Validação</h3>
        <span class="badge badge-warning">${pendingGames.length} pendentes</span>
      </div>
      <div class="pending-games-list">
        ${gamesHTML}
      </div>
    `;
  }

  // Validate game (admin only)
  validateGame(gameId) {
    if (!authManager.requireAdmin()) return;

    try {
      dataManager.validateGame(gameId, authManager.getCurrentUser().id);
      authManager.showNotification('Jogo Validado', 'O jogo foi validado com sucesso', 'success');
      this.loadPendingGames();
    } catch (error) {
      authManager.showNotification('Erro', error.message, 'error');
    }
  }

  // Delete game (admin only)
  deleteGame(gameId) {
    if (!authManager.requireAdmin()) return;

    if (!confirm('Tem certeza que deseja excluir este jogo? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      dataManager.deleteGame(gameId);
      authManager.showNotification('Jogo Excluído', 'O jogo foi excluído com sucesso', 'success');
      this.loadPendingGames();
    } catch (error) {
      authManager.showNotification('Erro', error.message, 'error');
    }
  }

  // Setup auto refresh
  setupAutoRefresh() {
    // Refresh games data every 30 seconds
    setInterval(() => {
      if (document.getElementById('pendingGames')) {
        this.loadPendingGames();
      }
    }, 30000);
  }
}

// Create global instance
const gamesManager = new GamesManager();