// Administrative Panel for Liga Pauperalho
class AdminManager {
  constructor() {
    this.currentTab = 'league';
    this.init();
  }

  // Initialize admin panel
  init() {
    this.bindEvents();
    this.setupTabSwitching();
    this.loadAdminData();
  }

  // Bind event listeners
  bindEvents() {
    // Tab switching
    const tabButtons = document.querySelectorAll('[data-tab]');
    tabButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        this.switchTab(e.target.dataset.tab);
      });
    });

    // League controls
    this.bindLeagueControls();

    // User management
    this.bindUserManagement();

    // Game validation
    this.bindGameValidation();

    // Export functions
    this.bindExportFunctions();
  }

  // Setup tab switching
  setupTabSwitching() {
    const tabButtons = document.querySelectorAll('[data-tab]');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
      });
    });
  }

  // Switch to specific tab
  switchTab(tabName) {
    const tabButtons = document.querySelectorAll('[data-tab]');
    const tabContents = document.querySelectorAll('.tab-content');

    // Update button states
    tabButtons.forEach(button => {
      button.classList.toggle('active', button.dataset.tab === tabName);
    });

    // Update content visibility
    tabContents.forEach(content => {
      content.classList.toggle('active', content.id === `${tabName}Tab`);
    });

    this.currentTab = tabName;

    // Load tab-specific data
    this.loadTabData(tabName);
  }

  // Load data for specific tab
  loadTabData(tabName) {
    switch (tabName) {
      case 'league':
        this.loadLeagueData();
        break;
      case 'users':
        this.loadUsersData();
        break;
      case 'games':
        this.loadGamesData();
        break;
      case 'export':
        this.loadExportData();
        break;
    }
  }

  // Load all admin data
  loadAdminData() {
    this.loadLeagueData();
    this.loadUsersData();
    this.loadGamesData();
  }

  // Bind league control events
  bindLeagueControls() {
    const openRegistrationBtn = document.getElementById('openRegistration');
    const closeRegistrationBtn = document.getElementById('closeRegistration');
    const resetLeagueBtn = document.getElementById('resetLeague');
    const generateBracketBtn = document.getElementById('generateBracket');

    if (openRegistrationBtn) {
      openRegistrationBtn.addEventListener('click', () => this.openRegistration());
    }

    if (closeRegistrationBtn) {
      closeRegistrationBtn.addEventListener('click', () => this.closeRegistration());
    }

    if (resetLeagueBtn) {
      resetLeagueBtn.addEventListener('click', () => this.resetLeague());
    }

    if (generateBracketBtn) {
      generateBracketBtn.addEventListener('click', () => this.generateBracket());
    }
  }

  // Open registration
  openRegistration() {
    if (!this.confirmAction('Abrir Inscrições', 'Tem certeza que deseja abrir o período de inscrições?')) {
      return;
    }

    try {
      leagueManager.openRegistration();
      this.loadLeagueData();
    } catch (error) {
      authManager.showNotification('Erro', error.message, 'error');
    }
  }

  // Close registration
  closeRegistration() {
    if (!this.confirmAction('Fechar Inscrições', 'Tem certeza que deseja fechar o período de inscrições?')) {
      return;
    }

    try {
      leagueManager.closeRegistration();
      this.loadLeagueData();
    } catch (error) {
      authManager.showNotification('Erro', error.message, 'error');
    }
  }

  // Reset league
  resetLeague() {
    if (!this.confirmAction('Reiniciar Liga', 'Tem certeza que deseja reiniciar a liga? Isso irá arquivar a liga atual e criar uma nova. Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      const newLeague = dataManager.archiveCurrentLeague();
      leagueManager.currentLeague = newLeague;

      authManager.showNotification('Liga Reiniciada', 'A liga foi arquivada e uma nova liga foi criada', 'success');
      this.loadLeagueData();
    } catch (error) {
      authManager.showNotification('Erro', error.message, 'error');
    }
  }

  // Generate tournament bracket
  generateBracket() {
    try {
      const rankings = dataManager.calculateRankings();
      const top8 = rankings.slice(0, 8);

      if (top8.length < 8) {
        authManager.showNotification('Erro', 'É necessário ter pelo menos 8 jogadores inscritos para gerar o bracket', 'error');
        return;
      }

      this.showBracketModal(top8);
    } catch (error) {
      authManager.showNotification('Erro', error.message, 'error');
    }
  }

  // Show bracket modal
  showBracketModal(players) {
    const bracketHTML = this.generateBracketHTML(players);

    const modalHTML = `
      <div class="modal-header">
        <h2 class="modal-title">Bracket do Torneio - Top 8</h2>
        <p class="modal-subtitle">Bracket gerado com base na classificação atual</p>
      </div>
      <div class="modal-body">
        ${bracketHTML}
      </div>
      <div class="modal-footer">
        <button class="btn btn-primary" onclick="this.closest('.modal-overlay').classList.remove('active')">
          Fechar
        </button>
      </div>
    `;

    const modalOverlay = document.getElementById('modalOverlay');
    const modalContentElement = document.getElementById('modalContent');

    if (modalContentElement) {
      modalContentElement.innerHTML = modalHTML;
    }

    if (modalOverlay) {
      modalOverlay.classList.add('active');
    }
  }

  // Generate bracket HTML
  generateBracketHTML(players) {
    // Pair players for bracket
    const quarterfinals = [
      { player1: players[0], player2: players[7] },
      { player1: players[3], player2: players[4] },
      { player1: players[2], player2: players[5] },
      { player1: players[1], player2: players[6] }
    ];

    return `
      <div class="bracket-container">
        <div class="bracket-round">
          <h4>Quartas de Final</h4>
          ${quarterfinals.map(match => this.generateMatchHTML(match, 'qf')).join('')}
        </div>
        <div class="bracket-round">
          <h4>Semifinais</h4>
          ${quarterfinals.slice(0, 2).map((match, index) =>
            this.generateMatchHTML({ player1: null, player2: null }, `sf${index + 1}`)
          ).join('')}
        </div>
        <div class="bracket-round">
          <h4>Final</h4>
          ${this.generateMatchHTML({ player1: null, player2: null }, 'final')}
        </div>
      </div>
      <style>
        .bracket-container {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--spacing-lg);
          margin-top: var(--spacing-lg);
        }
        .bracket-round h4 {
          text-align: center;
          color: var(--color-gold-accent);
          margin-bottom: var(--spacing-lg);
        }
        .bracket-match {
          border: 1px solid var(--color-border-primary);
          border-radius: var(--border-radius-md);
          padding: var(--spacing-md);
          margin-bottom: var(--spacing-md);
          background-color: var(--color-tertiary-dark);
        }
        .match-player {
          padding: var(--spacing-sm);
          border-radius: var(--border-radius-sm);
          margin-bottom: var(--spacing-xs);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .match-player.seed {
          background-color: rgba(212, 175, 55, 0.1);
          border: 1px solid var(--color-gold-accent);
        }
        .match-player-name {
          flex: 1;
        }
        .match-player-rank {
          background-color: var(--color-gold-accent);
          color: var(--color-text-inverse);
          padding: 2px 6px;
          border-radius: var(--border-radius-sm);
          font-size: var(--font-size-xs);
          font-weight: var(--font-weight-bold);
        }
        .match-player-empty {
          background-color: var(--color-secondary-dark);
          color: var(--color-text-muted);
          font-style: italic;
        }
      </style>
    `;
  }

  // Generate match HTML
  generateMatchHTML(match, matchId) {
    return `
      <div class="bracket-match" id="match-${matchId}">
        ${match.player1 ? `
          <div class="match-player seed">
            <span class="match-player-name">${Utils.escapeHtml(match.player1.playerName)}</span>
            <span class="match-player-rank">#${match.player1.rank}</span>
          </div>
        ` : '<div class="match-player match-player-empty">Aguardando vencedor</div>'}
        ${match.player2 ? `
          <div class="match-player seed">
            <span class="match-player-name">${Utils.escapeHtml(match.player2.playerName)}</span>
            <span class="match-player-rank">#${match.player2.rank}</span>
          </div>
        ` : '<div class="match-player match-player-empty">Aguardando vencedor</div>'}
      </div>
    `;
  }

  // Load league data
  loadLeagueData() {
    const league = dataManager.getCurrentLeague();
    const registrations = dataManager.getLeagueRegistrations();
    const games = dataManager.getLeagueGames();

    // Update league status display
    this.updateLeagueStatusDisplay(league, registrations, games);
  }

  // Update league status display
  updateLeagueStatusDisplay(league, registrations, games) {
    const statusCard = document.querySelector('#leagueTab .admin-controls');
    if (!statusCard) return;

    const statsHTML = `
      <div class="league-stats">
        <h3>Estatísticas da Liga</h3>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-value">${registrations.length}</span>
            <span class="stat-label">Inscritos</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">${games.length}</span>
            <span class="stat-label">Jogos</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">${league.status}</span>
            <span class="stat-label">Status</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">${Utils.formatDateOnly(league.registrationPeriod.start)}</span>
            <span class="stat-label">Início Inscrições</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">${Utils.formatDateOnly(league.registrationPeriod.end)}</span>
            <span class="stat-label">Fim Inscrições</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">${Utils.formatDateOnly(league.createdAt)}</span>
            <span class="stat-label">Data Criação</span>
          </div>
        </div>
      </div>
    `;

    // Add or update stats
    let statsContainer = statusCard.querySelector('.league-stats');
    if (statsContainer) {
      statsContainer.outerHTML = statsHTML;
    } else {
      statusCard.insertAdjacentHTML('beforeend', statsHTML);
    }
  }

  // Bind user management events
  bindUserManagement() {
    // Event delegation for user actions
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-action="toggle-user"]')) {
        this.toggleUserStatus(e.target.dataset.userId);
      }

      if (e.target.matches('[data-action="change-role"]')) {
        this.changeUserRole(e.target.dataset.userId);
      }

      if (e.target.matches('[data-action="reset-password"]')) {
        this.resetUserPassword(e.target.dataset.userId);
      }
    });
  }

  // Bind content management events
  bindContentManagement() {
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-action="add-link"]')) {
        this.showAddLinkModal();
      }

      if (e.target.matches('[data-action="edit-link"]')) {
        this.editLink(e.target.dataset.linkId);
      }

      if (e.target.matches('[data-action="delete-link"]')) {
        this.deleteLink(e.target.dataset.linkId);
      }

      if (e.target.matches('[data-action="save-contact-info"]')) {
        this.saveContactInfo();
      }
    });
  }

  // Load users data
  loadUsersData() {
    const usersTable = document.getElementById('adminUsersTable');
    if (!usersTable) return;

    const users = dataManager.getAllUsers();

    usersTable.innerHTML = users.map(user => `
      <tr>
        <td>${Utils.escapeHtml(user.name)}</td>
        <td>${Utils.escapeHtml(user.email)}</td>
        <td>
          <span class="status-badge ${user.role === 'admin' ? 'gold' : 'info'}">
            ${user.role === 'admin' ? 'Administrador' : 'Jogador'}
          </span>
        </td>
        <td>
          <span class="status-badge ${user.isActive ? 'success' : 'error'}">
            ${user.isActive ? 'Ativo' : 'Inativo'}
          </span>
        </td>
        <td>
          <div class="action-buttons">
            <button class="btn btn-sm btn-outline" data-action="toggle-user" data-user-id="${user.id}">
              <i class="fas fa-${user.isActive ? 'ban' : 'check'}"></i>
            </button>
            <button class="btn btn-sm btn-outline" data-action="change-role" data-user-id="${user.id}">
              <i class="fas fa-user-shield"></i>
            </button>
            <button class="btn btn-sm btn-outline" data-action="reset-password" data-user-id="${user.id}">
              <i class="fas fa-key"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  // Toggle user status
  toggleUserStatus(userId) {
    const user = dataManager.getUserById(userId);
    if (!user) return;

    if (!this.confirmAction('Alterar Status', `Tem certeza que deseja ${user.isActive ? 'desativar' : 'ativar'} este usuário?`)) {
      return;
    }

    try {
      dataManager.updateUser(userId, { isActive: !user.isActive });
      this.loadUsersData();
      authManager.showNotification('Status Alterado', `O usuário foi ${user.isActive ? 'desativado' : 'ativado'} com sucesso`, 'success');
    } catch (error) {
      authManager.showNotification('Erro', error.message, 'error');
    }
  }

  // Change user role
  changeUserRole(userId) {
    const user = dataManager.getUserById(userId);
    if (!user) return;

    const newRole = user.role === 'admin' ? 'user' : 'admin';

    if (!this.confirmAction('Alterar Função', `Tem certeza que deseja alterar a função de ${user.name} para ${newRole === 'admin' ? 'Administrador' : 'Jogador'}?`)) {
      return;
    }

    try {
      dataManager.updateUser(userId, { role: newRole });
      this.loadUsersData();
      authManager.showNotification('Função Alterada', `A função do usuário foi alterada com sucesso`, 'success');
    } catch (error) {
      authManager.showNotification('Erro', error.message, 'error');
    }
  }

  // Reset user password
  resetUserPassword(userId) {
    const user = dataManager.getUserById(userId);
    if (!user) return;

    if (!this.confirmAction('Redefinir Senha', `Tem certeza que deseja redefinir a senha de ${user.name}? A nova senha será "temp123".`)) {
      return;
    }

    try {
      const newPassword = 'temp123';
      dataManager.updateUser(userId, { password: Utils.hashPassword(newPassword) });

      authManager.showNotification('Senha Redefinida', `A senha de ${user.name} foi redefinida para "${newPassword}"`, 'info');
    } catch (error) {
      authManager.showNotification('Erro', error.message, 'error');
    }
  }

  // Bind game validation events
  bindGameValidation() {
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-action="validate-game"]')) {
        this.validateGame(e.target.dataset.gameId);
      }

      if (e.target.matches('[data-action="delete-game"]')) {
        this.deleteGame(e.target.dataset.gameId);
      }
    });
  }

  // Load games data
  loadGamesData() {
    const pendingGamesContainer = document.getElementById('pendingGames');
    if (!pendingGamesContainer) return;

    const games = dataManager.getLeagueGames();
    const unvalidatedGames = games.filter(game => !game.validated);

    if (unvalidatedGames.length === 0) {
      pendingGamesContainer.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-check-circle" style="font-size: 3rem; color: var(--color-success); margin-bottom: var(--spacing-lg);"></i>
          <h3>Nenhum Jogo Pendente</h3>
          <p>Todos os jogos já foram validados.</p>
        </div>
      `;
      return;
    }

    pendingGamesContainer.innerHTML = unvalidatedGames.map(game => {
      const player1 = dataManager.getUserById(game.player1Id);
      const player2 = dataManager.getUserById(game.player2Id);

      return `
        <div class="pending-game card">
          <div class="game-header">
            <h4>${Utils.escapeHtml(player1 ? player1.name : 'Unknown')} vs ${Utils.escapeHtml(player2 ? player2.name : 'Unknown')}</h4>
            <span class="game-date">${Utils.formatDate(game.playedAt)}</span>
          </div>
          <div class="game-details">
            <div class="score">
              <span class="player-score">${game.player1Wins}</span>
              <span class="score-separator">-</span>
              <span class="player-score">${game.player2Wins}</span>
            </div>
            <div class="decks">
              <span class="deck-info">${Utils.escapeHtml(game.player1Deck)}</span>
              <span class="deck-info">${Utils.escapeHtml(game.player2Deck)}</span>
            </div>
          </div>
          <div class="game-actions">
            <button class="btn btn-success btn-sm" data-action="validate-game" data-game-id="${game.id}">
              <i class="fas fa-check"></i> Validar
            </button>
            <button class="btn btn-error btn-sm" data-action="delete-game" data-game-id="${game.id}">
              <i class="fas fa-trash"></i> Excluir
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  // Validate game
  validateGame(gameId) {
    const currentUser = authManager.getCurrentUser();
    if (!currentUser) return;

    try {
      dataManager.validateGame(gameId, currentUser.id);
      this.loadGamesData();
      rankingsManager.refresh();
      authManager.showNotification('Jogo Validado', 'O jogo foi validado com sucesso', 'success');
    } catch (error) {
      authManager.showNotification('Erro', error.message, 'error');
    }
  }

  // Delete game
  deleteGame(gameId) {
    if (!this.confirmAction('Excluir Jogo', 'Tem certeza que deseja excluir este jogo? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      dataManager.deleteGame(gameId);
      this.loadGamesData();
      rankingsManager.refresh();
      authManager.showNotification('Jogo Excluído', 'O jogo foi excluído com sucesso', 'success');
    } catch (error) {
      authManager.showNotification('Erro', error.message, 'error');
    }
  }

  // Bind export functions
  bindExportFunctions() {
    const exportUsersBtn = document.getElementById('exportUsers');
    const exportGamesBtn = document.getElementById('exportGames');
    const exportRankingsBtn = document.getElementById('exportRankings');
    const exportAllBtn = document.getElementById('exportAll');

    if (exportUsersBtn) {
      exportUsersBtn.addEventListener('click', () => this.exportUsers());
    }

    if (exportGamesBtn) {
      exportGamesBtn.addEventListener('click', () => this.exportGames());
    }

    if (exportRankingsBtn) {
      exportRankingsBtn.addEventListener('click', () => this.exportRankings());
    }

    if (exportAllBtn) {
      exportAllBtn.addEventListener('click', () => this.exportAll());
    }
  }

  // Load export data
  loadExportData() {
    const exportControls = document.querySelector('#exportTab .export-controls');
    if (!exportControls) return;

    const storageInfo = dataManager.getStorageInfo();

    const infoHTML = `
      <div class="export-info card">
        <h4>Informações de Armazenamento</h4>
        <div class="info-grid">
          <div class="info-item">
            <label>Usuários:</label>
            <span>${storageInfo.userCount}</span>
          </div>
          <div class="info-item">
            <label>Inscrições:</label>
            <span>${storageInfo.registrationCount}</span>
          </div>
          <div class="info-item">
            <label>Jogos:</label>
            <span>${storageInfo.gameCount}</span>
          </div>
          <div class="info-item">
            <label>Espaço Usado:</label>
            <span>${storageInfo.usedFormatted}</span>
          </div>
          <div class="info-item">
            <label>Versão:</label>
            <span>${storageInfo.version}</span>
          </div>
        </div>
      </div>
    `;

    // Add or update export info
    let infoContainer = exportControls.querySelector('.export-info');
    if (infoContainer) {
      infoContainer.outerHTML = infoHTML;
    } else {
      exportControls.insertAdjacentHTML('afterbegin', infoHTML);
    }
  }

  // Export users
  exportUsers() {
    try {
      const users = dataManager.exportUsers();
      const csv = Utils.convertToCSV(users);
      Utils.downloadFile(csv, `users_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
      authManager.showNotification('Usuários Exportados', 'A lista de usuários foi exportada com sucesso', 'success');
    } catch (error) {
      authManager.showNotification('Erro', error.message, 'error');
    }
  }

  // Export games
  exportGames() {
    try {
      const games = dataManager.exportGames();
      const csv = Utils.convertToCSV(games);
      Utils.downloadFile(csv, `games_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
      authManager.showNotification('Jogos Exportados', 'A lista de jogos foi exportada com sucesso', 'success');
    } catch (error) {
      authManager.showNotification('Erro', error.message, 'error');
    }
  }

  // Export rankings
  exportRankings() {
    try {
      const rankings = dataManager.exportRankings();
      const csv = Utils.convertToCSV(rankings);
      Utils.downloadFile(csv, `rankings_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
      authManager.showNotification('Rankings Exportados', 'A lista de rankings foi exportada com sucesso', 'success');
    } catch (error) {
      authManager.showNotification('Erro', error.message, 'error');
    }
  }

  // Export all data
  exportAll() {
    try {
      const allData = dataManager.exportAllData();
      const json = JSON.stringify(allData, null, 2);
      Utils.downloadFile(json, `liga_pauperalho_backup_${new Date().toISOString().split('T')[0]}.json`, 'application/json');
      authManager.showNotification('Backup Completo', 'Todos os dados foram exportados com sucesso', 'success');
    } catch (error) {
      authManager.showNotification('Erro', error.message, 'error');
    }
  }

  // Confirm action dialog
  confirmAction(title, message) {
    return confirm(`${title}\n\n${message}`);
  }

  // Check if user has admin privileges
  requireAdmin() {
    if (!authManager.requireAdmin()) {
      return false;
    }
    return true;
  }
}

// Create global instance
const adminManager = new AdminManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AdminManager, adminManager };
}