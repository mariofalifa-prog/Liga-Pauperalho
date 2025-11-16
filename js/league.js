// League Management System for Liga Pauperalho
class LeagueManager {
  constructor() {
    this.currentLeague = null;
    this.init();
  }

  // Initialize league management
  init() {
    this.currentLeague = dataManager.getCurrentLeague();
    this.bindEvents();
    this.updateLeagueStatus();
    this.updateRegistrationStatus();
    this.setupAutoStatusCheck();
  }

  // Bind event listeners
  bindEvents() {
    // League registration form (old one, might still exist)
    const leagueRegistrationForm = document.getElementById('leagueRegistrationForm');
    if (leagueRegistrationForm) {
      leagueRegistrationForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleLeagueRegistration();
      });
    }

    // Hero registration form
    const heroRegistrationForm = document.getElementById('heroRegistrationForm');
    if (heroRegistrationForm) {
      heroRegistrationForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleHeroRegistration();
      });
    }

    // Hero registration buttons
    const heroRegisterBtn = document.getElementById('heroRegisterBtn');
    const closeHeroRegistration = document.getElementById('closeHeroRegistration');
    const cancelHeroRegistration = document.getElementById('cancelHeroRegistration');
    const discordBtn = document.getElementById('discordBtn');
    const secondaryCTA = document.getElementById('secondaryCTA');

    if (heroRegisterBtn) {
      heroRegisterBtn.addEventListener('click', () => this.showHeroRegistrationForm());
    }

    if (closeHeroRegistration) {
      closeHeroRegistration.addEventListener('click', () => this.hideHeroRegistrationForm());
    }

    if (cancelHeroRegistration) {
      cancelHeroRegistration.addEventListener('click', () => this.hideHeroRegistrationForm());
    }

    if (discordBtn) {
      discordBtn.addEventListener('click', () => this.handleDiscordButtonClick());
    }

    if (secondaryCTA) {
      secondaryCTA.addEventListener('click', () => this.handleSecondaryCTA());
    }

    // Deck archetype change
    const deckArchetype = document.getElementById('deckArchetype');
    const heroDeckArchetype = document.getElementById('heroDeckArchetype');

    if (deckArchetype) {
      deckArchetype.addEventListener('change', () => this.updateDeckPreview());
    }

    if (heroDeckArchetype) {
      heroDeckArchetype.addEventListener('change', () => this.updateHeroDeckPreview());
    }

    // Close overlay when clicking outside
    const heroRegistrationOverlay = document.getElementById('heroRegistrationOverlay');
    if (heroRegistrationOverlay) {
      heroRegistrationOverlay.addEventListener('click', (e) => {
        if (e.target === heroRegistrationOverlay) {
          this.hideHeroRegistrationForm();
        }
      });
    }
  }

  // Update league status display
  updateLeagueStatus() {
    const statusTitle = document.getElementById('statusTitle');
    const statusDescription = document.getElementById('statusDescription');
    const statusIndicator = document.getElementById('statusIndicator');
    const registrationStatus = document.getElementById('registrationStatus');

    if (!this.currentLeague) return;

    const status = this.currentLeague.status;
    const registrationStart = new Date(this.currentLeague.registrationPeriod.start);
    const registrationEnd = new Date(this.currentLeague.registrationPeriod.end);
    const now = new Date();

    let title, description, statusClass;

    switch (status) {
      case 'upcoming':
        title = 'Inscrições em Breve';
        description = `As inscrições abrem em ${Utils.formatDateOnly(registrationStart)}`;
        statusClass = 'warning';
        break;

      case 'registration':
        const daysLeft = Math.ceil((registrationEnd - now) / (1000 * 60 * 60 * 24));
        title = 'Inscrições Abertas';
        description = daysLeft > 1 ?
          `${daysLeft} dias restantes para se inscrever` :
          daysLeft === 1 ? 'Último dia para inscrições' :
          'Inscrições encerram hoje';
        statusClass = 'success';
        break;

      case 'active':
        title = 'Liga em Andamento';
        description = 'As inscrições estão fechadas. Boa sorte na competição!';
        statusClass = 'info';
        break;

      case 'completed':
        title = 'Liga Finalizada';
        description = 'Esta liga foi concluída. Verifique os resultados finais.';
        statusClass = 'bronze';
        break;

      default:
        title = 'Status Desconhecido';
        description = 'Verificando status da liga...';
        statusClass = 'info';
    }

    if (statusTitle) statusTitle.textContent = title;
    if (statusDescription) statusDescription.textContent = description;
    if (registrationStatus) {
      registrationStatus.textContent = title;
      registrationStatus.className = `status-badge ${statusClass}`;
    }

    if (statusIndicator) {
      const indicator = statusIndicator.querySelector('i');
      if (indicator) {
        indicator.className = `fas fa-circle`;
        indicator.style.color = this.getStatusColor(statusClass);
      }
    }

    // Update registration form visibility
    this.updateRegistrationFormVisibility();

    // Update primary CTA
    this.updatePrimaryCTA(status);
  }

  // Get status color
  getStatusColor(statusClass) {
    const colors = {
      'success': 'var(--color-success)',
      'warning': 'var(--color-warning)',
      'error': 'var(--color-error)',
      'info': 'var(--color-info)',
      'gold': 'var(--color-gold-accent)',
      'bronze': 'var(--color-bronze-accent)'
    };
    return colors[statusClass] || 'var(--color-info)';
  }

  // Update registration form visibility
  updateRegistrationFormVisibility() {
    const registrationSection = document.getElementById('registration');
    const registrationFormCard = document.getElementById('registrationFormCard');

    if (registrationSection && registrationFormCard) {
      const canRegister = this.canUserRegister();

      if (!canRegister) {
        registrationFormCard.style.display = 'none';
        this.showRegistrationClosedMessage(registrationSection);
      } else {
        registrationFormCard.style.display = 'block';
        this.hideRegistrationClosedMessage(registrationSection);
      }
    }
  }

  // Show registration closed message
  showRegistrationClosedMessage(container) {
    // Remove existing message if present
    const existingMessage = container.querySelector('.registration-closed-message');
    if (existingMessage) {
      existingMessage.remove();
    }

    const message = document.createElement('div');
    message.className = 'registration-closed-message card';
    message.innerHTML = `
      <div class="text-center">
        <i class="fas fa-lock" style="font-size: 3rem; color: var(--color-warning); margin-bottom: var(--spacing-lg);"></i>
        <h3>Inscrições Fechadas</h3>
        <p>No momento, as inscrições para esta liga estão fechadas. Verifique o status da liga para saber quando as próximas inscrições abrirão.</p>
        <button class="btn btn-outline" onclick="window.location.hash = '#rankings'">
          <i class="fas fa-trophy"></i>
          Ver Classificação
        </button>
      </div>
    `;

    container.querySelector('.registration-content').appendChild(message);
  }

  // Hide registration closed message
  hideRegistrationClosedMessage(container) {
    const message = container.querySelector('.registration-closed-message');
    if (message) {
      message.remove();
    }
  }

  // Check if user can register
  canUserRegister() {
    if (!authManager.isAuthenticated()) return false;
    if (this.currentLeague.status !== 'registration') return false;

    const currentUser = authManager.getCurrentUser();
    if (!currentUser) return false;

    // Check if already registered
    const existingRegistration = dataManager.getRegistration(currentUser.id);
    if (existingRegistration) return false;

    return true;
  }

  // Update primary CTA based on status
  updatePrimaryCTA(status) {
    const primaryCTA = document.getElementById('primaryCTA');
    if (!primaryCTA) return;

    const currentUser = authManager.getCurrentUser();
    const isRegistered = currentUser ? dataManager.getRegistration(currentUser.id) : null;

    switch (status) {
      case 'registration':
        if (!currentUser) {
          primaryCTA.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login para Inscrever-se';
          primaryCTA.onclick = () => authManager.showLoginModal();
        } else if (isRegistered) {
          primaryCTA.innerHTML = '<i class="fas fa-trophy"></i> Ver Classificação';
          primaryCTA.onclick = () => window.location.hash = '#rankings';
        } else {
          primaryCTA.innerHTML = '<i class="fas fa-user-plus"></i> Inscrever-se';
          primaryCTA.onclick = () => window.location.hash = '#registration';
        }
        break;

      case 'active':
      case 'completed':
        primaryCTA.innerHTML = '<i class="fas fa-trophy"></i> Ver Classificação';
        primaryCTA.onclick = () => window.location.hash = '#rankings';
        break;

      case 'upcoming':
        primaryCTA.innerHTML = '<i class="fas fa-calendar"></i> Ver Calendário';
        primaryCTA.onclick = () => window.location.hash = '#rules';
        break;

      default:
        primaryCTA.innerHTML = '<i class="fas fa-info"></i> Saiba Mais';
        primaryCTA.onclick = () => window.location.hash = '#rules';
    }
  }

  // Handle primary CTA click
  handlePrimaryCTA() {
    this.updatePrimaryCTA(this.currentLeague.status);
  }

  // Handle secondary CTA click
  handleSecondaryCTA() {
    window.location.hash = '#rules';
  }

  // Handle league registration
  handleLeagueRegistration() {
    if (!authManager.requireAuth()) return;

    const form = document.getElementById('leagueRegistrationForm');
    const formData = new FormData(form);

    const registrationData = {
      deckArchetype: formData.get('deckArchetype'),
      deckList: formData.get('deckList'),
      agreeRules: formData.get('agreeRules') === 'on'
    };

    // Validation
    let isValid = true;

    if (!registrationData.deckArchetype) {
      this.showFormError('deckArchetype', 'Selecione um arquétipo de deck');
      isValid = false;
    }

    if (!registrationData.agreeRules) {
      this.showFormError('agreeRules', 'Você deve concordar com as regras da liga');
      isValid = false;
    }

    if (!isValid) return;

    try {
      const currentUser = authManager.getCurrentUser();

      // Create registration
      const registration = dataManager.createRegistration({
        userId: currentUser.id,
        leagueId: this.currentLeague.id,
        ...registrationData
      });

      // Show success message
      authManager.showNotification(
        'Inscrição Realizada!',
        `Você se inscreveu na liga com o deck ${registrationData.deckArchetype}`,
        'success'
      );

      // Create notification
      dataManager.createNotification({
        title: 'Inscrição Confirmada',
        message: `Sua inscrição na Liga Pauperalho foi confirmada. Boa sorte!`,
        type: 'success',
        userId: currentUser.id
      });

      // Reset form
      form.reset();

      // Update UI
      this.updateLeagueStatus();
      this.updateRegistrationStatus();

      // Redirect to rankings
      setTimeout(() => {
        window.location.hash = '#rankings';
      }, 2000);

    } catch (error) {
      authManager.showNotification('Erro na Inscrição', error.message, 'error');
    }
  }

  // Update registration status display
  updateRegistrationStatus() {
    const registrationPeriod = document.getElementById('registrationPeriod');
    if (registrationPeriod && this.currentLeague) {
      const start = Utils.formatDateOnly(this.currentLeague.registrationPeriod.start);
      const end = Utils.formatDateOnly(this.currentLeague.registrationPeriod.end);
      registrationPeriod.textContent = `${start} - ${end}`;
    }

    // Update registration info if user is logged in
    this.updateRegistrationInfo();
  }

  // Update registration info for current user
  updateRegistrationInfo() {
    const currentUser = authManager.getCurrentUser();
    if (!currentUser) return;

    const registration = dataManager.getRegistration(currentUser.id);
    const playerName = document.getElementById('playerName');

    if (playerName) {
      playerName.value = currentUser.profile.displayName || currentUser.name;
      playerName.readOnly = true;
    }

    // Show registration status if already registered
    if (registration) {
      this.showUserRegistrationStatus(registration);
    }
  }

  // Show user registration status
  showUserRegistrationStatus(registration) {
    const registrationFormCard = document.getElementById('registrationFormCard');
    if (!registrationFormCard) return;

    const statusContent = document.createElement('div');
    statusContent.className = 'user-registration-status card';
    statusContent.innerHTML = `
      <div class="text-center">
        <i class="fas fa-check-circle" style="font-size: 3rem; color: var(--color-success); margin-bottom: var(--spacing-lg);"></i>
        <h3>Inscrição Confirmada</h3>
        <p><strong>Deck:</strong> ${registration.deckArchetype}</p>
        <p><strong>Inscrito em:</strong> ${Utils.formatDate(registration.registeredAt)}</p>
        <div class="registration-stats">
          <div class="stat-item">
            <span class="stat-value">${registration.totalPoints || 0}</span>
            <span class="stat-label">Pontos</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">${registration.wins || 0} - ${registration.losses || 0}</span>
            <span class="stat-label">V/D</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">${Utils.calculatePercentage(registration.wins || 0, (registration.wins || 0) + (registration.losses || 0))}%</span>
            <span class="stat-label">Win Rate</span>
          </div>
        </div>
        <div class="status-actions">
          <button class="btn btn-primary" onclick="window.location.hash = '#rankings'">
            <i class="fas fa-trophy"></i>
            Ver Classificação
          </button>
          <button class="btn btn-outline" onclick="window.location.hash = '#decklists'">
            <i class="fas fa-cards"></i>
            Ver Decklists
          </button>
        </div>
      </div>
    `;

    // Add styles for registration stats
    const style = document.createElement('style');
    style.textContent = `
      .registration-stats {
        display: flex;
        justify-content: space-around;
        margin: var(--spacing-xl) 0;
      }
      .stat-item {
        text-align: center;
      }
      .stat-value {
        display: block;
        font-size: var(--font-size-2xl);
        font-weight: var(--font-weight-bold);
        color: var(--color-gold-accent);
      }
      .stat-label {
        font-size: var(--font-size-sm);
        color: var(--color-text-muted);
      }
      .status-actions {
        display: flex;
        gap: var(--spacing-md);
        justify-content: center;
        margin-top: var(--spacing-lg);
      }
    `;
    document.head.appendChild(style);

    registrationFormCard.innerHTML = '';
    registrationFormCard.appendChild(statusContent);
  }

  // Update deck preview
  updateDeckPreview() {
    const deckArchetype = document.getElementById('deckArchetype');
    const deckList = document.getElementById('deckList');

    if (!deckArchetype || !deckList) return;

    const archetype = deckArchetype.value;

    if (archetype && archetype !== 'Selecione seu arquétipo') {
      // Add placeholder text for deck list
      if (!deckList.value) {
        const deckInfo = this.getDeckArchetypeInfo(archetype);
        deckList.placeholder = `Lista típica de ${archetype}:\n\n${deckInfo.sampleList || 'Adicione sua lista de deck aqui...'}`;
      }
    } else {
      deckList.placeholder = 'Cole aqui a lista do seu deck...';
    }
  }

  // Get deck archetype information
  getDeckArchetypeInfo(archetype) {
    const deckInfo = {
      'Mono Blue Terror': {
        sampleList: '4x Spellstutter Sprite\n4x Ninja of the Deep Hours\n4x Faerie Miscreant\n4x Faerie Seer\n4x Ponder\n4x Preordain\n4x Counterspell\n4x Daze\n4x Vapor Snag\n4x Snap\n4x Faerie Duelist\n4x Spire Golem\n4x Gilded Goose'
      },
      'Mono Red Burn': {
        sampleList: '4x Lightning Bolt\n4x Chain Lightning\n4x Flame Rift\n4x Firebolt\n4x Lava Dart\n4x Rift Bolt\n4x Skewer the Critics\n4x Gut Shot\n4x Price of Progress\n4x Cinder\n16x Mountain'
      },
      'Mono Black Control': {
        sampleList: '4x Chittering Rats\n4x Gurmag Angler\n4x Hymn to Tourach\n4x Inquisition of Kozilek\n4x Fatal Push\n4x Snuff Out\n4x Diabolic Edict\n4x Cast Down\n4x Geth\'s Verdict\n18x Swamp'
      }
    };

    return deckInfo[archetype] || { sampleList: null };
  }

  // Show form error
  showFormError(fieldId, message) {
    const field = document.getElementById(fieldId);
    if (field) {
      field.parentElement.classList.add('error');
      const errorElement = field.parentElement.querySelector('.error-message');
      if (errorElement) {
        errorElement.textContent = message;
      }
    }
  }

  // Setup automatic status check
  setupAutoStatusCheck() {
    // Check league status every minute
    setInterval(() => {
      this.checkLeagueStatusChange();
    }, 60000);

    // Also check every hour for registration period changes
    setInterval(() => {
      this.checkRegistrationPeriodChange();
    }, 3600000);
  }

  // Check for league status changes
  checkLeagueStatusChange() {
    const oldStatus = this.currentLeague.status;
    this.currentLeague = dataManager.getCurrentLeague();
    const newStatus = this.currentLeague.status;

    if (oldStatus !== newStatus) {
      this.updateLeagueStatus();
      this.updateRegistrationStatus();
      this.notifyStatusChange(oldStatus, newStatus);
    }
  }

  // Check for registration period changes
  checkRegistrationPeriodChange() {
    this.updateLeagueStatus();
    this.updateRegistrationStatus();
  }

  // Notify users of status changes
  notifyStatusChange(oldStatus, newStatus) {
    let notificationMessage = '';

    switch (newStatus) {
      case 'registration':
        notificationMessage = 'As inscrições para a nova liga estão abertas! Não perca a chance de participar.';
        break;
      case 'active':
        notificationMessage = 'As inscrições foram encerradas e a liga começou! Boa sorte a todos os participantes.';
        break;
      case 'completed':
        notificationMessage = 'A liga foi finalizada! Confira os resultados finais e parabéns ao campeão.';
        break;
    }

    if (notificationMessage) {
      // Create global notification
      dataManager.createNotification({
        title: 'Mudança de Status da Liga',
        message: notificationMessage,
        type: 'info'
      });
    }
  }

  // Admin functions
  openRegistration() {
    if (!authManager.requireAdmin()) return;

    const league = dataManager.getCurrentLeague();
    league.status = 'registration';
    dataManager.updateLeague(league);

    this.updateLeagueStatus();
    authManager.showNotification('Inscrições Abertas', 'O período de inscrições foi aberto manualmente', 'success');
  }

  closeRegistration() {
    if (!authManager.requireAdmin()) return;

    const league = dataManager.getCurrentLeague();
    league.status = 'active';
    dataManager.updateLeague(league);

    this.updateLeagueStatus();
    authManager.showNotification('Inscrições Fechadas', 'O período de inscrições foi fechado manualmente', 'warning');
  }

  // Get current league
  getCurrentLeague() {
    return this.currentLeague;
  }

  // Check if registration is open
  isRegistrationOpen() {
    return this.currentLeague.status === 'registration';
  }

  // Check if league is active
  isLeagueActive() {
    return this.currentLeague.status === 'active';
  }

  // Get registration end date
  getRegistrationEndDate() {
    return new Date(this.currentLeague.registrationPeriod.end);
  }

  // Get days until registration ends
  getDaysUntilRegistrationEnds() {
    const now = new Date();
    const endDate = this.getRegistrationEndDate();
    const diffTime = endDate - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}

// Create global instance
const leagueManager = new LeagueManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { LeagueManager, leagueManager };
}