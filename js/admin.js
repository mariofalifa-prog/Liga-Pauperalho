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
    this.updateFooterContent();
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

    // Content management
    this.bindContentManagement();

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
      case 'top8':
        this.loadTop8Data();
        break;
      case 'archetypes':
        this.loadArchetypeData();
        break;
      case 'content':
        this.loadContentData();
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

  // Load content management data
  loadContentData() {
    const contentTab = document.getElementById('contentTab');
    if (!contentTab) return;

    const contactInfo = dataManager.getContactInfo();
    const usefulLinks = dataManager.getUsefulLinks();

    const contentHTML = `
      <div class="admin-controls card">
        <h3>Informações de Contato</h3>
        <form id="contactForm" class="admin-form">
          <div class="form-group">
            <label for="contactEmail">Email:</label>
            <input type="email" id="contactEmail" name="email" value="${contactInfo.email || ''}" required>
          </div>
          <div class="form-group">
            <label for="contactDiscord">Discord:</label>
            <input type="text" id="contactDiscord" name="discord" value="${contactInfo.discord || ''}" required>
          </div>
          <button type="button" class="btn btn-primary" data-action="save-contact-info">
            <i class="fas fa-save"></i> Salvar Contatos
          </button>
        </form>
      </div>

      <div class="admin-controls card">
        <h3>Discord Integration</h3>
        <form id="discordForm" class="admin-form">
          <div class="form-group">
            <label for="discordEnabled">Ativar Integração:</label>
            <select id="discordEnabled" name="enabled">
              <option value="true">Sim</option>
              <option value="false">Não</option>
            </select>
          </div>
          <div class="form-group">
            <label for="discordWebhook">Webhook URL:</label>
            <input type="url" id="discordWebhook" name="webhookUrl" placeholder="https://discord.com/api/webhooks/...">
          </div>
          <div class="form-group">
            <label for="discordInvite">Convite do Servidor:</label>
            <input type="url" id="discordInvite" name="inviteUrl" placeholder="https://discord.gg/...">
          </div>
        </form>
      </div>

      <div class="admin-controls card">
        <h3>Links Úteis</h3>
        <div class="links-header">
          <button class="btn btn-primary" data-action="add-link">
            <i class="fas fa-plus"></i> Adicionar Link
          </button>
        </div>
        <div class="links-list" id="usefulLinksList">
          ${this.renderLinksList(usefulLinks)}
        </div>
      </div>
    `;

    contentTab.innerHTML = contentHTML;
    this.setupContentForms();
  }

  // Render links list
  renderLinksList(links) {
    if (links.length === 0) {
      return '<p class="text-muted">Nenhum link útil cadastrado.</p>';
    }

    return links.map(link => `
      <div class="link-item card" data-link-id="${link.id}">
        <div class="link-content">
          <h4><a href="${link.url}" target="_blank">${Utils.escapeHtml(link.title)}</a></h4>
          <p>${Utils.escapeHtml(link.description)}</p>
          <small>Adicionado em: ${Utils.formatDate(link.createdAt)}</small>
        </div>
        <div class="link-actions">
          <button class="btn btn-sm btn-outline" data-action="edit-link" data-link-id="${link.id}">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-sm btn-error" data-action="delete-link" data-link-id="${link.id}">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `).join('');
  }

  // Setup content forms
  setupContentForms() {
    // Load current settings for Discord
    const settings = dataManager.getSettings();
    const discordEnabled = document.getElementById('discordEnabled');
    const discordWebhook = document.getElementById('discordWebhook');
    const discordInvite = document.getElementById('discordInvite');

    if (discordEnabled) discordEnabled.value = settings.discord.enabled ? 'true' : 'false';
    if (discordWebhook) discordWebhook.value = settings.discord.webhookUrl || '';
    if (discordInvite) discordInvite.value = settings.discord.inviteUrl || '';
  }

  // Show add link modal
  showAddLinkModal() {
    const modalContent = `
      <div class="modal-header">
        <h2 class="modal-title">Adicionar Link Útil</h2>
        <p class="modal-subtitle">Adicione um novo link para a seção de links úteis</p>
      </div>
      <div class="modal-body">
        <form id="addLinkForm">
          <div class="form-group">
            <label for="linkTitle">Título:</label>
            <input type="text" id="linkTitle" name="title" required>
          </div>
          <div class="form-group">
            <label for="linkUrl">URL:</label>
            <input type="url" id="linkUrl" name="url" required>
          </div>
          <div class="form-group">
            <label for="linkDescription">Descrição:</label>
            <textarea id="linkDescription" name="description" rows="3"></textarea>
          </div>
          <div class="form-footer">
            <button type="button" class="btn btn-secondary" onclick="this.closest('.modal-overlay').classList.remove('active')">
              Cancelar
            </button>
            <button type="submit" class="btn btn-primary">
              <i class="fas fa-plus"></i> Adicionar Link
            </button>
          </div>
        </form>
      </div>
    `;

    this.showModal(modalContent);
    this.bindLinkForm();
  }

  // Bind link form events
  bindLinkForm() {
    const form = document.getElementById('addLinkForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleAddLink(form);
      });
    }
  }

  // Handle add link
  handleAddLink(form) {
    const formData = new FormData(form);
    const linkData = {
      title: formData.get('title'),
      url: formData.get('url'),
      description: formData.get('description')
    };

    try {
      const newLink = dataManager.addUsefulLink(linkData);
      authManager.showNotification('Link Adicionado', 'Link útil adicionado com sucesso', 'success');
      this.closeModal();
      this.loadContentData();
    } catch (error) {
      authManager.showNotification('Erro', error.message, 'error');
    }
  }

  // Edit link
  editLink(linkId) {
    const link = dataManager.getUsefulLinks().find(l => l.id === linkId);
    if (!link) return;

    const modalContent = `
      <div class="modal-header">
        <h2 class="modal-title">Editar Link Útil</h2>
        <p class="modal-subtitle">Edite as informações do link</p>
      </div>
      <div class="modal-body">
        <form id="editLinkForm">
          <div class="form-group">
            <label for="editLinkTitle">Título:</label>
            <input type="text" id="editLinkTitle" name="title" value="${Utils.escapeHtml(link.title)}" required>
          </div>
          <div class="form-group">
            <label for="editLinkUrl">URL:</label>
            <input type="url" id="editLinkUrl" name="url" value="${Utils.escapeHtml(link.url)}" required>
          </div>
          <div class="form-group">
            <label for="editLinkDescription">Descrição:</label>
            <textarea id="editLinkDescription" name="description" rows="3">${Utils.escapeHtml(link.description)}</textarea>
          </div>
          <div class="form-footer">
            <button type="button" class="btn btn-secondary" onclick="this.closest('.modal-overlay').classList.remove('active')">
              Cancelar
            </button>
            <button type="submit" class="btn btn-primary">
              <i class="fas fa-save"></i> Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    `;

    this.showModal(modalContent);

    const form = document.getElementById('editLinkForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleEditLink(form, linkId);
      });
    }
  }

  // Handle edit link
  handleEditLink(form, linkId) {
    const formData = new FormData(form);
    const updates = {
      title: formData.get('title'),
      url: formData.get('url'),
      description: formData.get('description')
    };

    try {
      dataManager.updateUsefulLink(linkId, updates);
      authManager.showNotification('Link Atualizado', 'Link útil atualizado com sucesso', 'success');
      this.closeModal();
      this.loadContentData();
    } catch (error) {
      authManager.showNotification('Erro', error.message, 'error');
    }
  }

  // Delete link
  deleteLink(linkId) {
    if (!this.confirmAction('Excluir Link', 'Tem certeza que deseja excluir este link útil?')) {
      return;
    }

    try {
      dataManager.removeUsefulLink(linkId);
      authManager.showNotification('Link Excluído', 'Link útil excluído com sucesso', 'success');
      this.loadContentData();
    } catch (error) {
      authManager.showNotification('Erro', error.message, 'error');
    }
  }

  // Load archetype management data
  loadArchetypeData() {
    const archetypeTab = document.getElementById('archetypesTab');
    const archetypes = dataManager.getAllDeckArchetypes();

    if (!archetypeTab) return;

    archetypeTab.innerHTML = `
      <div class="admin-controls card">
        <div class="section-header">
          <h3>Gerenciamento de Arquétipos</h3>
          <div class="section-actions">
            <button class="btn btn-primary" id="addArchetypeBtn">
              <i class="fas fa-plus"></i>
              Novo Arquétipo
            </button>
            <button class="btn btn-outline" id="refreshArchetypesBtn">
              <i class="fas fa-sync"></i>
              Atualizar
            </button>
          </div>
        </div>

        <div class="archetype-filters">
          <div class="filter-group">
            <label for="archetypeSearch">Buscar:</label>
            <input type="text" id="archetypeSearch" placeholder="Nome ou descrição...">
          </div>
          <div class="filter-group">
            <label for="tierFilter">Tier:</label>
            <select id="tierFilter">
              <option value="">Todos</option>
              <option value="Tier 1">Tier 1</option>
              <option value="Tier 2">Tier 2</option>
              <option value="Tier 3">Tier 3</option>
            </select>
          </div>
          <div class="filter-group">
            <label for="colorFilter">Cor:</label>
            <select id="colorFilter">
              <option value="">Todas</option>
              <option value="White">Branco</option>
              <option value="Blue">Azul</option>
              <option value="Black">Preto</option>
              <option value="Red">Vermelho</option>
              <option value="Green">Verde</option>
            </select>
          </div>
        </div>

        <div class="archetype-stats">
          <div class="stat-item">
            <label>Total:</label>
            <span>${archetypes.length}</span>
          </div>
          <div class="stat-item">
            <label>Tier 1:</label>
            <span>${dataManager.getDeckArchetypesByTier('Tier 1').length}</span>
          </div>
          <div class="stat-item">
            <label>Tier 2:</label>
            <span>${dataManager.getDeckArchetypesByTier('Tier 2').length}</span>
          </div>
          <div class="stat-item">
            <label>Tier 3:</label>
            <span>${dataManager.getDeckArchetypesByTier('Tier 3').length}</span>
          </div>
        </div>

        <div class="archetype-table-container">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Cores</th>
                <th>Tier</th>
                <th>Descrição</th>
                <th>Data</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody id="archetypesTableBody">
              ${archetypes.map(archetype => this.renderArchetypeRow(archetype)).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    this.bindArchetypeEvents();
  }

  // Render archetype table row
  renderArchetypeRow(archetype) {
    const colorIcons = {
      'White': '<i class="fas fa-circle" style="color: white;"></i>',
      'Blue': '<i class="fas fa-circle" style="color: #0066cc;"></i>',
      'Black': '<i class="fas fa-circle" style="color: black;"></i>',
      'Red': '<i class="fas fa-circle" style="color: #cc0000;"></i>',
      'Green': '<i class="fas fa-circle" style="color: #006600;"></i>'
    };

    const tierColors = {
      'Tier 1': '#00aa00',
      'Tier 2': '#ffaa00',
      'Tier 3': '#cc0000'
    };

    const colorsHtml = archetype.colors.map(color => colorIcons[color] || color).join(' ');
    const tierColor = tierColors[archetype.metaTier] || '#999';

    return `
      <tr data-archetype-id="${archetype.id}">
        <td>
          <strong>${Utils.escapeHtml(archetype.name)}</strong>
        </td>
        <td>${colorsHtml}</td>
        <td>
          <span class="tier-badge" style="background-color: ${tierColor}; color: white;">
            ${Utils.escapeHtml(archetype.metaTier)}
          </span>
        </td>
        <td>
          <span title="${Utils.escapeHtml(archetype.description)}">
            ${Utils.escapeHtml(archetype.description.length > 50 ?
              archetype.description.substring(0, 50) + '...' :
              archetype.description)}
          </span>
        </td>
        <td>${Utils.formatDateOnly(new Date(archetype.createdAt))}</td>
        <td>
          <div class="table-actions">
            <button class="btn btn-small btn-outline edit-archetype" data-id="${archetype.id}" title="Editar">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-small btn-danger delete-archetype" data-id="${archetype.id}" title="Excluir">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }

  // Bind archetype management events
  bindArchetypeEvents() {
    // Add archetype button
    const addArchetypeBtn = document.getElementById('addArchetypeBtn');
    if (addArchetypeBtn) {
      addArchetypeBtn.addEventListener('click', () => this.showAddArchetypeModal());
    }

    // Refresh archetypes button
    const refreshArchetypesBtn = document.getElementById('refreshArchetypesBtn');
    if (refreshArchetypesBtn) {
      refreshArchetypesBtn.addEventListener('click', () => this.loadArchetypeData());
    }

    // Edit archetype buttons
    const editButtons = document.querySelectorAll('.edit-archetype');
    editButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const archetypeId = e.currentTarget.dataset.id;
        this.editArchetype(archetypeId);
      });
    });

    // Delete archetype buttons
    const deleteButtons = document.querySelectorAll('.delete-archetype');
    deleteButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const archetypeId = e.currentTarget.dataset.id;
        this.deleteArchetype(archetypeId);
      });
    });

    // Filter events
    const archetypeSearch = document.getElementById('archetypeSearch');
    const tierFilter = document.getElementById('tierFilter');
    const colorFilter = document.getElementById('colorFilter');

    const filterArchetypes = () => {
      const searchTerm = archetypeSearch.value.toLowerCase();
      const tierValue = tierFilter.value;
      const colorValue = colorFilter.value;

      const rows = document.querySelectorAll('#archetypesTableBody tr');
      rows.forEach(row => {
        const name = row.querySelector('td:first-child strong').textContent.toLowerCase();
        const tier = row.querySelector('.tier-badge').textContent;
        const colors = Array.from(row.querySelectorAll('.fa-circle')).map(icon => {
          const style = icon.getAttribute('style');
          if (style.includes('white')) return 'White';
          if (style.includes('#0066cc')) return 'Blue';
          if (style.includes('black')) return 'Black';
          if (style.includes('#cc0000')) return 'Red';
          if (style.includes('#006600')) return 'Green';
          return '';
        });

        const matchesSearch = name.includes(searchTerm);
        const matchesTier = !tierValue || tier === tierValue;
        const matchesColor = !colorValue || colors.includes(colorValue);

        row.style.display = matchesSearch && matchesTier && matchesColor ? '' : 'none';
      });
    };

    if (archetypeSearch) archetypeSearch.addEventListener('input', filterArchetypes);
    if (tierFilter) tierFilter.addEventListener('change', filterArchetypes);
    if (colorFilter) colorFilter.addEventListener('change', filterArchetypes);
  }

  // Show add archetype modal
  showAddArchetypeModal() {
    const modalHTML = `
      <div class="archetype-form-container">
        <div class="form-header">
          <i class="fas fa-cards"></i>
          <h3>Novo Arquétipo de Deck</h3>
          <p>Adicione um novo arquétipo para a liga</p>
        </div>
        <form id="archetypeForm" class="auth-form">
          <div class="form-group">
            <label for="archetypeName">Nome do Arquétipo *</label>
            <input type="text" id="archetypeName" name="name" required>
          </div>

          <div class="form-group">
            <label for="archetypeDescription">Descrição</label>
            <textarea id="archetypeDescription" name="description" rows="3" placeholder="Descrição do arquétipo..."></textarea>
          </div>

          <div class="form-group">
            <label>Cores do Deck</label>
            <div class="color-checkboxes">
              <label class="checkbox-label">
                <input type="checkbox" name="colors" value="White">
                <i class="fas fa-circle" style="color: white;"></i> Branco
              </label>
              <label class="checkbox-label">
                <input type="checkbox" name="colors" value="Blue">
                <i class="fas fa-circle" style="color: #0066cc;"></i> Azul
              </label>
              <label class="checkbox-label">
                <input type="checkbox" name="colors" value="Black">
                <i class="fas fa-circle" style="color: black;"></i> Preto
              </label>
              <label class="checkbox-label">
                <input type="checkbox" name="colors" value="Red">
                <i class="fas fa-circle" style="color: #cc0000;"></i> Vermelho
              </label>
              <label class="checkbox-label">
                <input type="checkbox" name="colors" value="Green">
                <i class="fas fa-circle" style="color: #006600;"></i> Verde
              </label>
            </div>
          </div>

          <div class="form-group">
            <label for="archetypeTier">Tier Meta</label>
            <select id="archetypeTier" name="metaTier">
              <option value="Tier 1">Tier 1 (Meta Dominante)</option>
              <option value="Tier 2">Tier 2 (Competitivo)</option>
              <option value="Tier 3">Tier 3 (Regional/Nicho)</option>
            </select>
          </div>

          <div class="form-group">
            <label for="archetypeSampleList">Lista de Exemplo (Opcional)</label>
            <textarea id="archetypeSampleList" name="sampleList" rows="6" placeholder="Exemplo de lista do deck..."></textarea>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn btn-primary">
              <i class="fas fa-save"></i>
              Salvar Arquétipo
            </button>
            <button type="button" class="btn btn-outline" onclick="app.closeModal()">
              <i class="fas fa-times"></i>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    `;

    app.showModal('Novo Arquétipo', modalHTML);
    this.bindArchetypeFormEvents();
  }

  // Bind archetype form events
  bindArchetypeFormEvents() {
    const form = document.getElementById('archetypeForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const archetypeId = document.getElementById('archetypeId');
        if (archetypeId) {
          this.updateArchetype();
        } else {
          this.saveArchetype();
        }
      });
    }
  }

  // Save archetype
  saveArchetype() {
    const form = document.getElementById('archetypeForm');
    const formData = new FormData(form);

    // Get selected colors
    const colors = Array.from(form.querySelectorAll('input[name="colors"]:checked'))
      .map(cb => cb.value);

    const archetypeData = {
      name: formData.get('name'),
      description: formData.get('description'),
      colors: colors,
      metaTier: formData.get('metaTier'),
      sampleList: formData.get('sampleList')
    };

    try {
      dataManager.addDeckArchetype(archetypeData);
      authManager.showNotification('Sucesso', 'Arquétipo adicionado com sucesso!', 'success');
      app.closeModal();
      this.loadArchetypeData();
    } catch (error) {
      authManager.showNotification('Erro', error.message, 'error');
    }
  }

  // Edit archetype
  editArchetype(archetypeId) {
    const archetype = dataManager.getDeckArchetype(archetypeId);
    if (!archetype) {
      authManager.showNotification('Erro', 'Arquétipo não encontrado', 'error');
      return;
    }

    const modalHTML = `
      <div class="archetype-form-container">
        <div class="form-header">
          <i class="fas fa-cards"></i>
          <h3>Editar Arquétipo</h3>
          <p>Edite as informações do arquétipo</p>
        </div>
        <form id="archetypeForm" class="auth-form">
          <input type="hidden" id="archetypeId" value="${archetype.id}">

          <div class="form-group">
            <label for="archetypeName">Nome do Arquétipo *</label>
            <input type="text" id="archetypeName" name="name" value="${Utils.escapeHtml(archetype.name)}" required>
          </div>

          <div class="form-group">
            <label for="archetypeDescription">Descrição</label>
            <textarea id="archetypeDescription" name="description" rows="3">${Utils.escapeHtml(archetype.description)}</textarea>
          </div>

          <div class="form-group">
            <label>Cores do Deck</label>
            <div class="color-checkboxes">
              <label class="checkbox-label">
                <input type="checkbox" name="colors" value="White" ${archetype.colors.includes('White') ? 'checked' : ''}>
                <i class="fas fa-circle" style="color: white;"></i> Branco
              </label>
              <label class="checkbox-label">
                <input type="checkbox" name="colors" value="Blue" ${archetype.colors.includes('Blue') ? 'checked' : ''}>
                <i class="fas fa-circle" style="color: #0066cc;"></i> Azul
              </label>
              <label class="checkbox-label">
                <input type="checkbox" name="colors" value="Black" ${archetype.colors.includes('Black') ? 'checked' : ''}>
                <i class="fas fa-circle" style="color: black;"></i> Preto
              </label>
              <label class="checkbox-label">
                <input type="checkbox" name="colors" value="Red" ${archetype.colors.includes('Red') ? 'checked' : ''}>
                <i class="fas fa-circle" style="color: #cc0000;"></i> Vermelho
              </label>
              <label class="checkbox-label">
                <input type="checkbox" name="colors" value="Green" ${archetype.colors.includes('Green') ? 'checked' : ''}>
                <i class="fas fa-circle" style="color: #006600;"></i> Verde
              </label>
            </div>
          </div>

          <div class="form-group">
            <label for="archetypeTier">Tier Meta</label>
            <select id="archetypeTier" name="metaTier">
              <option value="Tier 1" ${archetype.metaTier === 'Tier 1' ? 'selected' : ''}>Tier 1 (Meta Dominante)</option>
              <option value="Tier 2" ${archetype.metaTier === 'Tier 2' ? 'selected' : ''}>Tier 2 (Competitivo)</option>
              <option value="Tier 3" ${archetype.metaTier === 'Tier 3' ? 'selected' : ''}>Tier 3 (Regional/Nicho)</option>
            </select>
          </div>

          <div class="form-group">
            <label for="archetypeSampleList">Lista de Exemplo (Opcional)</label>
            <textarea id="archetypeSampleList" name="sampleList" rows="6">${Utils.escapeHtml(archetype.sampleList)}</textarea>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn btn-primary">
              <i class="fas fa-save"></i>
              Atualizar Arquétipo
            </button>
            <button type="button" class="btn btn-outline" onclick="app.closeModal()">
              <i class="fas fa-times"></i>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    `;

    app.showModal('Editar Arquétipo', modalHTML);
    this.bindArchetypeFormEvents();
  }

  // Update archetype (for edit form)
  updateArchetype() {
    const form = document.getElementById('archetypeForm');
    const formData = new FormData(form);
    const archetypeId = document.getElementById('archetypeId').value;

    // Get selected colors
    const colors = Array.from(form.querySelectorAll('input[name="colors"]:checked'))
      .map(cb => cb.value);

    const archetypeData = {
      name: formData.get('name'),
      description: formData.get('description'),
      colors: colors,
      metaTier: formData.get('metaTier'),
      sampleList: formData.get('sampleList')
    };

    try {
      dataManager.updateDeckArchetype(archetypeId, archetypeData);
      authManager.showNotification('Sucesso', 'Arquétipo atualizado com sucesso!', 'success');
      app.closeModal();
      this.loadArchetypeData();
    } catch (error) {
      authManager.showNotification('Erro', error.message, 'error');
    }
  }

  // Delete archetype
  deleteArchetype(archetypeId) {
    const archetype = dataManager.getDeckArchetype(archetypeId);
    if (!archetype) return;

    const modalHTML = `
      <div class="delete-confirmation">
        <div class="warning-icon">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <h3>Confirmar Exclusão</h3>
        <p>Tem certeza que deseja excluir o arquétipo <strong>${Utils.escapeHtml(archetype.name)}</strong>?</p>
        <p class="warning-text">Esta ação não pode ser desfeita.</p>
        <div class="form-actions">
          <button class="btn btn-danger" onclick="this.closest('.delete-confirmation').dataset.confirm = 'true'; app.closeModal(); admin.deleteArchetypeConfirm('${archetypeId}');">
            <i class="fas fa-trash"></i>
            Excluir
          </button>
          <button class="btn btn-outline" onclick="app.closeModal();">
            <i class="fas fa-times"></i>
            Cancelar
          </button>
        </div>
      </div>
    `;

    app.showModal('Excluir Arquétipo', modalHTML);
  }

  // Confirm archetype deletion
  deleteArchetypeConfirm(archetypeId) {
    try {
      const deletedArchetype = dataManager.deleteDeckArchetype(archetypeId);
      authManager.showNotification(
        'Sucesso',
        `Arquétipo "${deletedArchetype.name}" excluído com sucesso!`,
        'success'
      );
      this.loadArchetypeData();
    } catch (error) {
      authManager.showNotification('Erro', error.message, 'error');
    }
  }

  // Save contact info
  saveContactInfo() {
    const email = document.getElementById('contactEmail').value;
    const discord = document.getElementById('contactDiscord').value;

    try {
      dataManager.updateContactInfo({ email, discord });
      authManager.showNotification('Contatos Atualizados', 'Informações de contato atualizadas com sucesso', 'success');
      this.updateFooterContent();
    } catch (error) {
      authManager.showNotification('Erro', error.message, 'error');
    }
  }

  // Update footer content dynamically
  updateFooterContent() {
    const contactInfo = dataManager.getContactInfo();
    const usefulLinks = dataManager.getUsefulLinks();

    // Update footer contact section
    const footerContact = document.getElementById('footerContact');
    if (footerContact) {
      footerContact.innerHTML = `
        <p>Discord: ${contactInfo.discord || 'Liga Pauperalho'}</p>
        <p>Email: ${contactInfo.email || 'contato@pauperalho.com'}</p>
      `;
    }

    // Update footer links section
    const footerLinks = document.getElementById('footerUsefulLinks');
    if (footerLinks && usefulLinks.length > 0) {
      footerLinks.innerHTML = usefulLinks.map(link =>
        `<li><a href="${link.url}" target="_blank">${Utils.escapeHtml(link.title)}</a></li>`
      ).join('');
    }
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