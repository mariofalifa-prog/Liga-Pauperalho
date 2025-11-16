// Decklists Management with Monthly Categorization
// This script handles the decklist section with monthly categorization and visibility control

class DecklistsMonthlyManager {
  constructor(monthlyManager) {
    this.monthlyManager = monthlyManager;
    this.currentMonth = null;
  }
  }

  // Initialize decklists
  init() {
    this.bindEvents();
    this.loadDecklists();
    this.updateMonthlySelector();
  }

  // Bind events
  bindEvents() {
      const monthSelect = document.getElementById('decklistMonthSelect');
      const exportBtn = document.getElementById('exportDecklists');
      const exportAllBtn = document.getElementById('exportAllDecklists');

      if (monthSelect) {
        monthSelect.addEventListener('change', (e) => this.handleMonthChange(e));
      }

      if (exportBtn) {
        exportBtn.addEventListener('click', (e) => this.handleExportCurrentMonth());
      }

      if (exportAllBtn) {
        exportAllBtn.addEventListener('click', (e) => this.handleExportAllMonths());
      }
    }

      // Tab switching in rankings
      const monthlyTabBtn = document.querySelector('[data-view="monthly"]');
      const annualTabBtn = document.querySelector('[data-view="annual"]');

      if (monthlyTabBtn) {
        monthlyTabBtn.addEventListener('click', () => this.switchToMonthlyView());
      }

      if (annualTabBtn) {
        annualTabBtn.addEventListener('click', () => this.switchToAnnualView());
      }
    }

      // Modal close buttons
      const modalCloseButtons = document.querySelectorAll('.modal-close');
      modalCloseButtons.forEach(button => {
        button.addEventListener('click', () => this.closeModal());
      });
    }
    }

    // Loading overlay clicks
      const loadingOverlay = document.getElementById('loadingOverlay');
      if (loadingOverlay) {
        loadingOverlay.addEventListener('click', () => this.hideLoadingOverlay());
      }
    }

      // Keyboard ESC to close modals
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          const modalOverlay = document.getElementById('modalOverlay');
          if (modalOverlay && modalOverlay.classList.contains('active')) {
            this.closeModal();
          }
        }
      });
    }

    // Modal overlay clicks
      const modalOverlay = document.getElementById('modalOverlay');
      if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
          if (e.target === modalOverlay) {
            this.closeModal();
          }
        });
      }
    }

      // Storage events
      this.addEventListener('storageChanged', () => this.loadDecklists());
    }

    // Page visibility changes
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          const decklistsSection = document.getElementById('decklists');
          if (decklistsSection && decklistsSection.style.display !== 'none') {
            this.loadDecklists();
          }
        });
      });
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: ['style', 'class']
      });
    }

    // Close storage dropdown when clicking outside
      document.addEventListener('click', (e) => {
        const monthSelect = document.getElementById('decklistMonthSelect');
        const dropdowns = document.querySelectorAll('.decklist-dropdown');
        dropdowns.forEach(dropdown => {
          dropdown.addEventListener('click', (e) => {
            setTimeout(() => {
              dropdown.classList.remove('open');
            }, 200);
          });
        });
    });
  }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Implement month navigation
      const monthSelect = document.getElementById('decklistMonthSelect');
      const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

      months.forEach((month, index) => {
        if (e.key === monthSelect.value) {
          monthSelect.value = month;
          this.switchToMonth(month);
        }
      });
    });
    }

    // Prevent drag over decklist cards
    document.addEventListener('dragover', (e) => {
      e.preventDefault();
    });

    document.addEventListener('drop', (e) => {
      e.preventDefault();
    });
    });
  }

    // Handle search
    this.addEventListener('input', (e) => {
      this.handleSearch();
    });

    // Load more button
    this.addEventListener('click', (e) => {
      this.loadMoreDecklists();
    });

    // Clear filters on month change
    this.addEventListener('change', (e) => {
      this.currentFilters.deckArchetype = '';
      this.currentFilters.deckName = '';
      this.currentFilters.playerName = '';
      this.updateDecklists();
    });
    });
  }

    // Deck card interactions
    this.addEventListener('click', (e) => {
      if (e.target.classList.contains('deck-card-header')) {
        this.handleDeckCardClick(e);
      }
    });

    // User info buttons
    this.addEventListener('click', (e) => {
      this.handleUserInfoClick(e);
    });
    });
  }

    // Archive deck button
    this.addEventListener('click', (e) => {
      this.handleArchiveDeckClick(e);
    });

    // Report deck button
    this.addEventListener('click', (e) => {
      this.handleReportDeckClick(e);
    });

    // Visibility control buttons
    this.addEventListener('click', (e) => {
      this.handleVisibilityToggle(e);
    });
    });
  }

    // Utility methods
    generateId() {
      return Utils.generateUUID();
    }

    formatDecklistCount(count) {
      return count === 1 ? '1 decklist' : `${count} decklists`;
    }

    calculateMonthYear(date) {
      const d = new Date(date);
      return `${Utils.getMonthName(d.getMonth())} ${d.getFullYear()}`;
    }

    debounce(func, delay) {
      let timeout;
      return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, arguments), delay);
      };
    }

    throttle(func, limit) {
      let lastCall = 0;
      return function(...args) {
        const now = Date.now();
        if (now - lastCall < limit) {
          lastCall = now;
          return func.apply(this, arguments);
        }
        };
    }
  }

    // Main interaction methods
    switchToMonth(month) {
      this.currentMonth = month;
      this.loadDecklists();
    }

    switchToAnnualView() {
      this.currentMonth = 'annual';
      this.loadDecklists();
    }

    handleMonthChange(e) {
      const month = e.target.value;
      this.switchToMonth(month);
    }

    loadDecklists() {
      this.showLoading();
      const decklistsContent = document.getElementById('decklistsContent');

      try {
        const decklists = this.getMonthlyDecklists(this.currentMonth);
        const decklistsHtml = this.renderDecklistsHtml(decklists);
        decklistsContent.innerHTML = decklistsHtml;

        this.setupDecklistInteractions();
      } catch (error) {
        console.error('Error loading decklists:', error);
        this.showError('Erro ao carregar decklists', error);
      } finally {
        this.hideLoading();
      }
      }
    }

    getMonthlyDecklists(monthYear = null) {
      const monthlyLeagues = this.monthlyManager.getAllMonthlyLeagues();
      const monthKey = monthYear || this.monthlyManager.getMonthYear(new Date());

      if (monthlyLeagues[monthKey]) {
        return monthlyLeagues[monthKey].decklists || [];
      }

      return [];
    }

    renderDecklistsHtml(decklists) {
      if (!decklists || decklists.length === 0) {
        return '<p class="no-data-message">Nenhuma decklist encontrada para este mês.</p>';
      }

      let html = '<div class="decklists-grid">';

      decklists.forEach(decklist => {
        const isHidden = !this.shouldShowDecklist(decklist.leagueMonth);
        const opacityClass = isHidden ? 'decklist-card hidden' : 'decklist-card';

        html += `
          <div class="decklist-card ${opacityClass}">
            <div class="decklist-header">
              <div class="decklist-month">${decklist.leagueMonth || 'Todos'}</div>
              <div class="decklist-controls">
                <button class="visibility-toggle ${decklist.decklistsVisible ? 'active' : ''}"
                        onclick="window.decklistsMonthlyManager.toggleDecklistVisibility('${decklist.leagueMonth}')"
                        title="${decklist.decklistsVisible ? 'Ocultar Decklists' : 'Mostrar Decklists'}">
                        <i class="fas fa-${decklist.decklistsVisible ? 'eye-slash' : 'eye'}"></i>
                    </button>
                <div class="decklist-stats">
                  <span>${decklist.count} decks neste mês</span>
                </div>
              </div>
            </div>
            <div class="decklist-player">
              <div class="player-info">
                <img src="${this.getAvatarUrl(decklist.user)}" alt="${decklist.userName}" class="avatar">
                <div class="player-details">
                  <strong>${decklist.userName}</strong>
                  <div class="player-meta">
                    <span class="player-archetype">${decklist.deckArchetype}</span>
                    <span class="player-date">Inscrito em ${Utils.formatDateOnly(decklist.registeredAt)}</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="decklist-deck">
              <h4>${decklist.deckList}</h4>
              ${this.renderDecklist(decklist.deckList)}</div>
            </div>
            <div class="decklist-actions">
              ${this.renderDecklistActions(decklist)}
            </div>
          </div>
          </div>
          `;
      });

      return html;
    }

    renderDecklistActions(decklist) {
      let actions = '';

      if (this.shouldShowDecklist(decklist.leagueMonth)) {
        actions += `
          <div class="decklist-status-visible">
            <i class="fas fa-unlock"></i>
            <span>Decklists Visíveis</span>
          </div>
        `;
      } else {
        actions += `
          <div class="decklist-status-hidden">
            <i class="fas fa-lock"></i>
            <span>Decklists Ocultas</span>
            <div class="decklist-stats">
              <span>${decklist.count} decks</span>
            </div>
            <div class="decklist-stats">
              <span>O registro fechou - Decklists ocultas</span>
            </div>
            <div class="decklist-notice">
              <i class="fas fa-info-circle"></i>
              <span>As decklists só são visíveis após o fechamento das inscrições.</span>
            </div>
            </div>
          </div>
        `;
      }

      actions += `
        <div class="decklist-actions">
          <button class="btn btn-small" onclick="window.decklistsMonthlyManager.viewDecklistDetails('${decklist.id}')">
            <i class="fas fa-eye"></i>
            Ver Detalhes
          </button>
          <button class="btn btn-small btn-outline" onclick="window.decklistsMonthlyManager.editDecklist('${decklist.id}')">
            <i class="fas fa-edit"></i>
            Editar
          </button>
          <button class="btn btn-small btn-outline" onclick="window.decklistsMonthlyManager.deleteDecklist('${decklist.id}')">
            <i class="fas fa-trash"></i>
            Apagar
          </button>
        </div>
      `;

      return actions;
    }

    renderDecklist(decklist) {
      return `
        <div class="decklist-content">
          <div class="main-content">
            <h4>${decklist.userName}</h4>
            <div class="archetype-badge decklist-${this.getArchetypeColor(decklist.deckArchetype)}">
              <i class="fas fa-${this.getArchetypeIcon(decklist.deckArchetype)}"></i>
              <span>${decklist.deckArchetype}</span>
            </div>
            <div class="deck-info">
              <p><strong>Arquétipo:</strong> ${decklist.deckArchetype}</p></p>
            </div>
            <div class="deck-info">
              <p><strong>Status:</strong> ${decklist.status}</p></p>
              </div>
            <div class="deck-info">
              <p><strong>Inscrição:</strong> ${Utils.formatDateOnly(decklist.registeredAt)}</p></p>
              </div>
          </div>
            <div class="deck-info">
              <p><strong>Atualização:</strong> ${Utils.formatDateOnly(decklist.updatedAt || decklist.registeredAt)}</p></p>
              </div>
          </div>
          <div class="deck-stats">
              <div class="stats-row">
                <span><strong>Partidas:</strong> ${decklist.wins || 0}</span>
                <span><strong>Vitórias:</strong> ${decklist.losses || 0}</span>
                <span><strong>Pontos:</strong> ${decklist.totalPoints || 0}</span>
              </div>
              <div class="stats-row">
                <span><strong>Win Rate:</strong> ${decklist.winRate ? (decklist.wins / (decklist.wins + decklist.losses)) : 0} %</span>
              </div>
              </div>
            </div>
            <div class="deck-stats">
              <div class="stats-row">
                <span><strong>Arquétipo:</strong> ${this.getArchetypeName(decklist.deckArchetype)}</span>
              </div>
            </div>
          </div>
          </div>
        </div>
      `;
    }

    getArchetypeIcon(archetype) {
      const iconMap = {
        'Mono Blue Terror': 'fa-snowflake',
        'Mono Red Burn': 'fa-fire',
        'Mono Black Control': 'fa-bolt',
        'Mono Green Stompy': 'fa-leaf',
        'Mono White Weenie': 'fa-shield-alt',
        'Boros Monarch': 'fa-crown',
        'Izzet Faeries': 'fa-magic',
        'Dimir Control': 'fa-moon',
        'Golgari Midrange': 'fa-tree',
        'Azorius Affinity': 'fa-gem',
        'Rakdos Goblins': 'fa-gavel',
        'Simic Merfolk': 'fa-users',
        'Orzhov Midrange': 'fa-gem',
        'Jeskai Spells': 'fa-wand-magic',
        'Sultai Reanimator': 'fa-hat',
        '4-Color Control': 'fa-layer-group',
        '5-Color Good Stuff': 'fa-palette'
      };

      const archetype = this.dataManager.getDeckArchetype(archetype);
      return iconMap[archetype] || 'fa-question-circle';
    }

    getArchetypeName(archetype) {
      const archetype = this.dataManager.getDeckArchetype(archetype);
      return archetype ? archetype.name : 'Desconhecido';
    }

    getArchetypeColor(archetype) {
      const colors = {
        'Mono Blue Terror': '#4A90E0', // Azul
        'Mono Red Burn': '#DC1432C4', // Laranja
        'Mono Black Control': '#584AF23', // Verde
        'Mono Green Stompy': '#228B44', // Verde
        'Mono White Weenie': '#E4B85', // Branco
        'Boros Monarch': '#FFC94', // Laranja
        'Izzet Faeries': '#DAA520', // Roxo
        'Dimir Control': '#F46778', // Azul
        'Golgari Midrange': '#3B651', // Amarelo
        'Azorius Affinity': '#00B7A4', // Azul
        'Rakdos Goblins': '#E25B91', // Vermelho
        'Simic Merfolk': '#8D945', // Rosa
        'Orzhov Midrange': '#8F3E71', // Verde
        'Jeskai Spells': '#D55A84', // Azul
        'Sultai Reanimator': '#1D4A95', // Azul
        '4-Color Control': '#6A527', // Multicolor
        '5-Color Good Stuff': '#8B3A91' // Multicolor
      };

      return colors[archetype] || '#666666';
    }

    shouldShowDecklist(decklist) {
      if (!decklist.leagueMonth) {
        return false;
      }

      const visibility = this.monthlyManager.shouldShowDecklists(decklist.leagueMonth);

      // Check privacy settings
      const privacy = this.dataManager.getSettings().privacy;
      const visibilityRule = privacy.decklistVisibility || 'registration_closed';

      switch (visibilityRule) {
        case 'always':
          return true;
        case 'registration_open':
          return this.monthlyManager.getCurrentMonthlyLeague().status === 'registration';
        case 'registration_closed':
          return this.monthlyManager.getCurrentMonthlyLeague().status === 'completed';
        default:
          return this.monthlyManager.getCurrentMonthlyLeague().status === 'completed';
      }

      console.log(`Decklist visibility: ${decklist.decklistsVisible ? 'Visível' : 'Ocultada'} para mês: ${decklist.leagueMonth} (${visibilityRule})`);
      return visibility;
    }

    viewDecklistDetails(decklistId) {
      // Find the specific decklist
      const allMonthlyLeagues = this.monthlyManager.getAllMonthlyLeagues();
      const monthlyLeague = allMonthlyLeagues[decklist.leagueMonth] || this.monthlyManager.getCurrentMonthlyLeague();

      if (monthlyLeague) {
        const targetDecklist = monthlyLeague.decklists.find(dl => dl.id === decklistId);
        if (targetDecklist) {
          this.showDecklistModal(targetDecklist);
        }
      } else {
          console.error('Decklist não encontrada:', decklistId);
        this.showNotification('Decklist não encontrado', 'error');
      }
    }

    editDecklist(decklistId) {
      // Find the decklist
      const allMonthlyLeagues = this.monthlyManager.getAllMonthlyLeagues();
      const monthlyLeague = allMonthlyLeagues[decklist.leagueMonth] || this.monthlyManager.getCurrentMonthlyLeague()];

      if (monthlyLeague) {
        const targetDecklist = monthlyLeague.decklists.find(dl => dl.id === decklistId);
        if (targetDecklist) {
          this.showDecklistEditModal(targetDecklist);
        }
      } else {
        console.error('Decklist não encontrado:', decklistId);
        this.showNotification('Decklist não encontrado', 'error');
      }
    }

    deleteDecklist(decklistId) {
      // Find the decklist
      const allMonthlyLeagues = this.monthlyManager.getAllMonthlyLeagues();
      const monthlyLeague = allMonthlyLeagues[decklist.leagueMonth] || this.monthlyManager.getCurrentMonthlyLeague()];

      if (monthlyLeague) {
        const targetDecklist = monthlyLeague.decklists.find(dl => dl.id === decklistId);
        if (targetDecklist) {
          if (confirm('Tem certeza que deseja apagar este decklist? Esta ação não pode ser desfeita.')) {
            const index = monthlyLeague.decklists.indexOf(targetDecklist);
            if (index !== -1) {
              monthlyLeague.decklists.splice(index, 1);
              this.dataManager.saveData();
            }

            monthlyLeague.decklists.unshift(targetDecklist);
            this.dataManager.saveData();
            this.showNotification('Decklist apagado com sucesso!');

            // Update UI
            this.loadDecklists();
          } else {
            this.showNotification('Decklist não encontrado para apagar');
          }
        }
      } else {
        this.showNotification('Decklist não encontrado para apagar');
      }
    }

      // Close modal and refresh
      this.closeDecklistModal();
      this.loadDecklists();
    }

    showDecklistModal(decklist) {
      const modalOverlay = document.getElementById('modalOverlay');
      const modalContainer = document.getElementById('modalContainer');

      // Create modal content
      const user = this.dataManager.getUserById(decklist.userId);
      const archetype = this.dataManager.getDeckArchetype(decklist.deckArchetype);

      const modalContent = `
        <div class="modal-header">
          <h3 class="modal-title">Decklist - ${decklist.leagueMonth}</h3>
          <button class="modal-close" onclick="window.decklistsMonthlyManager.closeDecklistModal()">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form id="decklistEditForm">
            <div class="form-group">
              <label>Nome do Jogador:</label>
              <input type="text" id="decklistPlayerName" value="${decklist.userName || ''}" required>
              </div>
            </div>
            <div class="form-group">
              <label>Arquétipo do Deck:</label>
              <input type="text" id="decklistArchetypeSelect" value="${decklist.deckArchetype || ''}" required>
              </div>
            </div>
            <div class="form-group">
              <label>Lista do Deck (opcional):</label>
              <textarea id="decklistDeckList" rows="4">${decklist.deckList || ''}</textarea>
              </div>
            </div>
          </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary">
                <i class="fas fa-save"></i>
                Salvar
              </button>
              <button type="button" class="btn btn-outline" onclick="window.decklistsMonthlyManager.closeDecklistModal()">
                <i class="fas fa-times"></i>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
      `;

      modalContainer.innerHTML = modalContent;
      modalOverlay.classList.add('active');
    }

    closeDecklistModal() {
      const modalOverlay = document.getElementById('modalOverlay');
      if (modalOverlay) {
        modalOverlay.classList.remove('active');
      }
    }

    showNotification(message, type = 'success') {
      // Use the main app's notification system
      if (window.ligaApp) {
        window.ligaApp.showNotification(message, type);
      } else {
        alert(`${message}`);
      }
    }

    showError(message) {
      if (window.ligaApp) {
        window.ligaApp.showNotification(message, 'error');
      } else {
        alert(`ERRO: ${message}`);
      }
    }

    toggleDecklistVisibility(monthYear) {
      const currentMonthYear = monthYear || this.monthlyManager.getMonthYear(new Date());

      this.monthlyManager.updateDecklistVisibility(monthYear, !this.shouldShowDecklists(monthYear));

      const visibility = this.monthlyManager.shouldShowDecklists(monthYear);
      const message = visibility ?
        'Decklists agora visíveis' :
        'Decklists ocultas';

      if (window.ligaApp) {
        window.ligaApp.showNotification(message, 'info');
      }

      this.updateDecklists();
      this.updateMonthSelector();
    }

    updateMonthSelector() {
      const monthSelect = document.getElementById('decklistMonthSelect');
      const currentMonthYear = this.currentMonthYear;

      // Clear current options
      while (monthSelect.firstChild) {
        monthSelect.removeChild(monthSelect.firstChild);
      }

      // Add month options
      const monthlyLeagues = this.monthlyManager.getAllMonthlyLeagues();
      const monthYears = Object.keys(monthlyLeagues).sort().reverse();

      monthYears.unshift('Todos os Meses');

      monthYears.forEach(monthYear => {
        const option = document.createElement('option');
        option.value = monthYear;
        option.textContent = monthYear;
        option.selected = monthYear === currentMonthYear;
        monthSelect.appendChild(option);
      });

      this.currentMonthYear = currentMonthYear;
    }

    loadMoreDecklists() {
      const decklistsContent = document.getElementById('decklistsContent');

      this.showLoading();

      try {
        const currentMonthYear = this.currentMonthYear;
        const monthlyDecklists = this.getMonthlyDecklists(currentMonthYear);
        const existingCount = decklists.length;

        if (existingCount < this.decklist.decksToLoad) {
          this.decklist.decksToLoad = existingCount;
          return;
        }

        // Load more decklists
        const startIndex = existingCount;
        const endIndex = Math.min(startIndex + 10, monthlyDecklists.length - 1);
        const moreDecklists = monthlyDecklists.slice(startIndex, endIndex + 10);

        try {
          const newDecklists = await this.monthlyManager.loadMonthlyDecklists(currentMonthYear, startIndex, endIndex);
          decklists.push(...newDecklists);
          monthlyLeagues[currentMonthYear] = [...monthlyLeagues[currentMonthYear], ...decklists];

          this.sortDecklists(decklists);
          this.renderDecklistsHtml(decklists);
        } catch (error) {
          console.error('Error ao carregar mais decklists:', error);
          this.hideLoading();
          this.showError('Erro ao carregar mais decklists: ' + error.message);
        } finally {
          this.hideLoading();
        }
      }
    }

    sortDecklists(decklists) {
      if (!decklists || decklists.length === 0) {
        return;
      }

      decklists.sort((a, b) => {
        // Sort by month year (newest first)
        const yearA = parseInt(a.leagueMonth.split(' ')[1]);
        const yearB = parseInt(b.leagueMonth.split(' ')[1]);
        return yearB - yearA;
      });

      decklists.forEach((decklist, index) => {
        decklist.position = index + 1;
      });
    }
    }

    editDecklist(decklistId) {
      // This would open the edit modal
      console.log('Editing decklist:', decklistId);
    }

    deleteDecklist(decklistId) {
      const monthlyLeague = this.monthlyManager.getMonthlyLeague(decklist.leagueMonth);
      if (!monthlyLeague) {
        throw new Error('Liga mensal não encontrada para o mês: ' + decklist.leagueMonth);
      }

      const decklistIndex = monthlyLeague.decklists.findIndex(dl => dl.id === decklistId);
      if (decklistIndex === -1) {
        throw new Error('Decklist não encontrado');
      }

      // Remove from array
      monthlyLeague.decklists.splice(decklistIndex, 1);
      this.dataManager.saveData();

      // Update UI
      this.loadDecklists();

      this.showNotification('Decklist removida com sucesso!', 'success');
    }

    archiveDecklist(decklistId) {
      const monthlyLeague = this.monthlyManager.getMonthlyLeague(decklist.leagueMonth);
      if (!monthlyLeague) {
        throw new Error('Liga mensal não encontrada para o mês: ' + decklist.leagueMonth);
      }

      const decklistIndex = monthlyLeague.decklists.findIndex(dl => dl.id === decklistId);
      if (decklistIndex === -1) {
        throw new Error('Decklist não encontrado');
      }

      // Move to archived monthly leagues
      if (!this.dataManager.data.archivedMonthlyLeagues) {
        this.dataManager.data.archivedMonthlyLeagues = [];
      }

      const archivedMonthlyLeague = {
        ...monthlyLeague,
        archivedAt: new Date().toISOString(),
        archivedBy: 'monthly_archive'
      };

      this.dataManager.data.archivedMonthlyLeagues.push(archivedMonthlyLeague);
      this.dataManager.saveData();

      // Remove from current
      monthlyLeague.decklists.splice(decklistIndex, 1);

      // Close modal
      this.closeDecklistModal();

      this.showNotification('Decklist arquivada com sucesso!', 'success');
      this.loadDecklists();

      // Update month selector if needed
      if (this.currentMonthYear === decklist.leagueMonth) {
        this.updateMonthSelector();
      }
    }

    showLoading() {
      const decklistsContent = document.getElementById('decklistsContent');
      if (decklistsContent) {
        decklistsContent.innerHTML = `
          <div class="loading-message">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Carregando decklists...</p>
          </div>
        `;
      }
    }

    hideLoading() {
      const decklistsContent = document.getElementById('decklistsContent');
      if (decklistsContent) {
        decklistsContent.innerHTML = '';
      }
    }

    showDecklistModal(decklist) {
      this.showDecklistEditModal(decklist);
    }

    showNotification(message, type) {
      if (window.ligaApp) {
        window.ligaApp.showNotification(message, type);
      } else {
        alert(message);
      }
    }

    showError(message) {
      if (window.ligaApp) {
        window.ligaApp.showNotification(message, 'error');
      } else {
        alert(`ERRO: ${message}`);
      }
    }
    }
  }

    getAvatarUrl(user) {
      if (!user) return 'https://via.placeholder.com/40x40/3333f3f3333f3f3f3f3f3';
      }

      if (user && user.name) {
        const seed = user.name || user.email || user.id || 'default';
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(seed)}&background=2d3748&color=fff&size=40&bold=true`;
      }

      if (user && user.profile && user.profile.avatar) {
        return user.profile.avatar;
      }

      return this.ligaApp.getAvatarUrl(user);
    }
    }
  }

    getUserName(userId) {
      const user = this.dataManager.getUserById(userId);
      return user ? user.name : 'Usuário Desconhecido';
    }

    showDecklistModal(decklist) {
      const modalOverlay = document.getElementById('modalOverlay');
      const modalContainer = document.getElementById('modalContainer');

      const decklist = decklist;

      const modalContent = this.renderDecklistEditModal(decklist);

      modalContainer.innerHTML = modalContent;
      modalOverlay.classList.add('active');
    }

    closeDecklistModal() {
      const modalOverlay = document.getElementById('modalOverlay');
      if (modalOverlay) {
        modalOverlay.classList.remove('active');
      }
    }

    reportDecklist(decklist, action, details = '') {
      const monthlyLeague = this.monthlyManager.getMonthlyLeague(decklist.leagueMonth);

      const message = this.getDecklistActionMessage(action, details);

      if (window.ligaApp) {
        window.ligaApp.showNotification(message, 'info');
      } else {
        alert(message);
      }
    }

    getDecklistActionMessage(action, details) {
      const actions = {
        'view': 'Decklist visualizado',
        'edit': 'Edição de Decklist',
        'archive': 'Decklist arquivada',
        'report': 'Reportar Decklist',
        'unarchive': 'Desarquivar Decklist',
        'delete': 'Apagar Decklist'
      };

      return actions[action] || action;
    }
    }

    setupDecklistInteractions() {
      const decklistContent = document.getElementById('decklistsContent');
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList') {
            mutation.addedNodes.forEach(node => {
              const node = node.target;
              if (node.classList && node.classList.contains('decklist-card')) {
                const card = node.closest('.decklist-actions');
                const actions = card.querySelector('.decklist-actions');
                if (actions) {
                  const editBtn = actions.querySelector('.btn-edit');
                  const archiveBtn = actions.querySelector('.btn-archive');
                  const reportBtn = actions.querySelector('.btn-report');
                  const userInfoBtn = actions.querySelector('.btn-user-info');

                  if (editBtn) editBtn && userInfoBtn) {
                    editBtn.onclick = () => this.showDecklistEditModal(decklist);
                  }
                  if (archiveBtn) {
                    archiveBtn.onclick = () => this.archiveDecklist(decklist);
                  }
                  if (reportBtn) {
                    reportBtn.onclick = () => this.reportDecklist(decklist);
                  }
                  if (userInfoBtn) {
                    userInfoBtn.onclick = () => this.showUserInfoModal(decklist.user.id);
                  }
                  }
                }
                }
              }
            }
          }
        });
        });

        observer.observe(decklistContent, {
          childList: true,
          subtree: true,
          attributes: ['style', 'class']
        });
      });
    }
  }
  }

    toggleDecklistVisibility(monthYear) {
      this.monthlyManager.updateDecklistVisibility(monthYear, !this.shouldShowDecklists(monthYear));

      // Update month selector
      this.updateMonthSelector();

      // Update visibility controls
      const visibilityControls = document.querySelector('.decklist-controls');
      if (visibilityControls) {
        const toggleBtn = visibilityControls.querySelector('.visibility-toggle');
        toggleBtn.textContent = this.monthlyManager.shouldShowDecklists(monthYear) ? 'Ocultar Decklists' : 'Mostrar Decklists';
        toggleBtn.onclick = () => {
          this.monthlyManager.updateDecklistVisibility(monthYear, !this.shouldShowDecklists(monthYear));
        };

        // Update status badge
        const statusText = this.monthlyManager.shouldShowDecklists(monthYear) ?
          'Decklists visíveis' : 'Decklists ocultas';

        if (statusText) {
          toggleBtn.innerHTML = `<i class="fas fa-${toggleBtn.textContent === 'Mostrar Decklists' ? 'eye' : 'eye-slash'}"></i> ${statusText}`;
        }
      }
    }

    updateMonthSelector() {
      const monthSelect = document.getElementById('decklistMonthSelect');
      const monthlyLeagues = this.monthlyManager.getAllMonthlyLeagues();
      const currentMonthYear = this.currentMonthYear;

      // Clear current options
      while (monthSelect.firstChild) {
        monthSelect.removeChild(monthSelect.firstChild);
      }

      // Add month options
      const monthYears = Object.keys(monthlyLeagues).sort().reverse();
      monthYears.unshift('Todos os Meses');

      monthYears.forEach(monthYear => {
        const option = document.createElement('option');
        option.value = monthYear;
        option.textContent = monthYear;
        option.selected = monthYear === currentMonthYear;
        monthSelect.appendChild(option);
      });

      this.currentMonthYear = currentMonthYear;
    }

    renderDecklistsHtml(decklists) {
      if (!decklists || decklists.length === 0) {
        return '<p class="no-data-message">Nenhuma decklist encontrada.</p>';
      }

      let html = '<div class="decklists-grid">';

      decklists.forEach(decklist => {
        const isHidden = !this.shouldShowDecklist(decklist.leagueMonth);
        const opacityClass = isHidden ? 'decklist-card hidden' : 'decklist-card';

        html += `
          <div class="decklist-card ${opacityClass}">
            <div class="decklist-header">
              <div class="decklist-month">${decklist.leagueMonth}</div>
              <div class="decklist-controls">
                <button class="visibility-toggle ${decklist.decklistsVisible ? 'active' : ''}"
                        onclick="window.decklistsMonthlyManager.toggleDecklistVisibility('${decklist.leagueMonth}')"
                        title="${decklist.decklistsVisible ? 'Ocultar Decklists' : 'Mostrar Decklists'}">
                        <i class="fas fa-${decklist.decklistsVisible ? 'eye-slash' : 'eye'}"></i>
                    </button>
                <div class="decklist-stats">
                  <span>${decklist.count} decks</span>
                </div>
              </div>
            </div>
            </div>
            <div class="decklist-player">
              <div class="player-info">
                <img src="${this.getAvatarUrl(decklist.user)}" alt="${decklist.userName}" class="avatar">
                <div class="player-details">
                  <strong>${decklist.userName}</strong>
                  <div class="player-meta">
                    <span class="player-archetype">${decklist.deckArchetype}</span>
                    <span class="player-date">Inscrito em ${Utils.formatDateOnly(decklist.registeredAt)}</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="decklist-deck">
              <h4>${decklist.deckList}</h4>
              ${this.renderDecklist(decklist.deckList)}</div>
            </div>
          </div>
          </div>
          <div class="decklist-actions">
            <div class="decklist-status ${isHidden ? 'hidden' : ''}">
              <i class="fas fa-${isHidden ? 'lock' : 'unlock'}"></i>
              <span class="${this.getDecklistStatusText(decklist.leagueMonth)}">${isHidden ? 'Ocultas' : 'Visíveis'}</span>
            </div>
                <div class="decklist-stats">
                  <span>${decklist.count} decks neste mês</span>
                </div>
              </div>
            </div>
          </div>
            <div class="decklist-actions">
              <button class="btn btn-small" onclick="window.decklistsMonthlyManager.viewDecklistDetails('${decklist.id}')">
                <i class="fas fa-eye"></i>
                Ver Detalhes
              </button>
              <button class="btn btn-small btn-outline" onclick="window.decklistsMonthlyManager.editDecklist('${decklist.id}')">
                <i class="fas fa-edit"></i>
                Editar
              </button>
              <button class="btn btn-small btn-outline" onclick="window.decklistsMonthlyManager.deleteDecklist('${decklist.id}')">
                <i class="fas fa-trash"></i>
                Apagar
              </button>
              <button class="btn btn-small btn-outline" onclick="window.decklistsMonthlyManager.reportDecklist('${decklist.id}')">
                <i class="fas fa-flag"></i>
                Reportar
              </button>
              <button class="btn btn-small btn-outline" onclick="window.decklistsMonthlyManager.unarchiveDecklist('${decklist.id}')">
                <i class="fas fa-archive"></i>
                Arquivar
              </button>
            </div>
          </div>
        </div>
          </div>
        `;
      });

      return html;
    }

    getDecklistStatusText(monthYear) {
      const monthlyLeague = this.monthlyManager.getMonthlyLeague(monthYear);

      if (!monthlyLeague) {
        return 'Liga não encontrada';
      }

      const visibility = this.monthlyManager.shouldShowDecklists(monthYear);

      switch (monthlyLeague.status) {
        case 'upcoming':
          return 'Aguardando abertura das inscrições';
        case 'registration':
          return 'Inscrições abertas';
        case 'active':
          return 'Liga em andamento';
        case 'completed':
          return 'Liga finalizada';
        default:
          return 'Status desconhecido';
      }
      }

      return `${visibility ? 'Visíveis' : 'Ocultas'} para ${monthlyLeague.name}`;
    }

    getArchetypeColor(archetype) {
      return this.monthlyManager.getArchetypeColor(archetype) || '#666666');
    }

    getArchetypeIcon(archetype) {
      return this.monthlyManager.getArchetypeIcon(archetype) || 'fas fa-cards');
    }

    renderDecklistEditModal(decklist) {
      // Show loading state
      const modalOverlay = document.getElementById('modalOverlay');
      const modalContainer = document.getElementById('modalContainer');

      modalOverlay.classList.add('active');
      modalContainer.innerHTML = `
        <div class="loading-spinner">
          <i class="fas fa-spinner fa-spin"></i>
          <p>Carregando formulário...</p>
        </div>
      `;

      // Simulate loading completion
      setTimeout(() => {
        this.renderDecklistEditModalContent(decklist);
        modalOverlay.classList.remove('active');
      }, 500);
    }

    showUserInfoModal(userId) {
      const modalOverlay = document.getElementById('modalOverlay');
      const modalContainer = document.getElementById('modalContainer');

      const user = this.dataManager.getUserById(userId);
      if (!user) {
        this.showNotification('Usuário não encontrado', 'error');
        return;
      }

      const modalContent = `
        <div class="modal-header">
          <h3 class="modal-title">Informações do Usuário</h3>
          <button class="modal-close" onclick="window.decklistsMonthlyManager.closeModal()">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="user-info">
            <div class="user-stats">
              <strong>Nome:</strong> ${user.name}
              <br>
              <strong>Email:</strong> ${user.email}
              <br>
              <strong>Role:</strong> ${user.role}
            </div>
            </div>
            <div class="user-actions">
              <div class="action-buttons">
                <button class="btn btn-primary" onclick="window.decklistsMonthlyManager.promoteToAdmin('${userId}')">
                  <i class="fas fa-user-plus'></i>
                  Promover a Admin
                </button>
                <button class="btn btn-outline" onclick="window.decklistsMonthlyManager.demoteUser('${userId}')">
                  <i class="fas fa-exclamation-triangle"></i>
                  Admostrar
                </button>
              </div>
            </div>
          </div>
        </div>
      `;

      modalContainer.innerHTML = modalContent;
      modalOverlay.classList.add('active');
    }

    closeUserInfoModal() {
      const modalOverlay = document.getElementById('modalOverlay');
      if (modalOverlay) {
        modalOverlay.classList.remove('active');
      }
    }

    showNotification(message, type = 'info') {
      if (window.ligaApp) {
        window.ligaApp.showNotification(message, type);
      } else {
        alert(message);
      }
    }

    showError(message) {
      if (window.ligaApp) {
        window.ligaApp.showNotification(message, 'error');
      } else {
        alert(`ERRO: ${message}`);
      }
    }
    }

    reportDecklist(decklist, action, details = '') {
      try {
        // Implement reporting functionality
        console.log('Report action:', action, 'details:', details);

        // Show success notification
        this.showNotification('Operação realizada com sucesso!', 'success');
      } catch (error) {
        console.error('Erro ao executar ação:', action, 'Error:', error);
        this.showNotification('Erro na operação: ' + error.message, 'error');
      }
    }
    }
  }

    toggleDecklistVisibility(monthYear) {
      this.monthlyManager.updateDecklistVisibility(monthYear, !this.shouldShowDecklists(monthYear));

      // Update UI
      this.updateDecklists();
      this.updateMonthSelector();

      // Show status notification
      const visibility = this.monthlyManager.shouldShowDecklists(monthYear);
      const message = visibility ?
        'Decklists agora visíveis' :
        'Decklists ocultas';

      if (window.ligaApp) {
        window.ligaApp.showNotification(message, 'info');
      }
    }

      // Update all UI elements that depend on visibility
      const visibilityControls = document.querySelector('.decklists-controls');
      const toggleBtn = visibilityControls.querySelector('.visibility-toggle');
      const statusText = visibilityControls.querySelector('.decklist-status');

      if (toggleBtn && statusText) {
        toggleBtn.textContent = visibility ? 'Ocultar Decklists' : 'Mostrar Decklists';
      }

      if (toggleBtn) {
        toggleBtn.onclick = () => {
          this.monthlyManager.updateDecklistVisibility(monthYear, !this.shouldShowDecklists(monthYear));
        };
      }

      if (statusText) {
        statusText.innerHTML = visibility ?
          'Decklists visíveis' : 'Decklists ocultas';
      }
      }
    }

    renderDecklistEditContent(decklist) {
      const user = this.dataManager.getUserById(decklist.userId);
      const archetype = this.dataManager.getDeckArchetype(decklist.deckArchetype);

      const modalContent = `
        <div class="modal-header">
          <h3 class="modal-title">Editar Decklist - ${decklist.userName}</h3>
          <button class="modal-close" onclick="window.decklistsMonthlyManager.closeDecklistModal()">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form id="decklistEditForm">
            <div class="form-group">
              <label for="decklistPlayerName">Nome do Jogador:</label>
              <input type="text" id="decklistPlayerName" value="${decklist.userName || ''}" required>
              </div>
            </div>
            <div class="form-group">
              <label for="decklistArchetype">Arquétipo do Deck:</label>
              <select id="decklistArchetypeSelect" class="form-select">
                <option value="">Selecione um arquétipo</option>
                <option value="Mono Blue Terror">Mono Blue Terror</option>
                <option value="Mono Red Burn">Mono Red Burn</option>
                <option value="Mono Black Control">Mono Black Control</option>
                <option value="Mono Green Stompy">Mono Green Stompy</option>
                <option value="Mono White Weenie">Mono White Weenie</option>
                <option value="Boros Monarch">Boros Monarch</option>
                <option value="Izzet Faeries">Izzet Faeries</option>
                <option value="Dimir Control">Dimir Control</option>
                <option value="Golgari Midrange">Golgari Midrange</option>
                <option value="Azorius Affinity">Azorius Affinity</option>
                <option value="Rakdos Goblins">Rakdos Goblins</option>
                <option value="Simic Merfolk">Simic Merfolk</option>
                <option value="Orzhov Midrange">Orzhov Midrange</option>
                <option value="Jeskai Spells">Jeskai Spells</option>
                <option value="Sultai Reanimator">Sultai Reanimator</option>
                <option value="4-Color Control">4-Color Control</option>
                <option value="5-Color Good Stuff">5-Color Good Stuff</option>
              </select>
              </div>
            </div>
            <div class="form-group">
              <label for="decklistDeckList">Lista do Deck (opcional):</label>
              <textarea id="decklistDeckList" rows="6" placeholder="Cole aqui a lista do seu deck...">${decklist.deckList || ''}</textarea>
              </div>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary">
                <i class="fas fa-save"></i>
                Salvar Alterações
              </button>
              <button type="button" class="btn btn-outline" onclick="window.decklistsMonthlyManager.closeDecklistModal()">
                <i class="fas fa-times"></i>
                Cancelar
              </button>
            </div>
            </div>
          </form>
        </div>
        </div>
      `;

      modalContainer.innerHTML = modalContent;
      modalOverlay.classList.add('active');
    }

    setupDecklistInteractions() {
      const decklistContent = document.getElementById('decklistsContent');
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList') {
            mutation.addedNodes.forEach(node => {
              const actions = node.querySelector('.decklist-actions');
              if (actions && node.classList && actions.classList.contains('decklist-actions')) {
                const editBtn = actions.querySelector('.btn-edit');
                const archiveBtn = actions.querySelector('.btn-archive');
                const reportBtn = actions.querySelector('.btn-report');
                const userInfoBtn = actions.querySelector('.btn-user-info');

                if (editBtn && userInfoBtn) {
                  editBtn.onclick = () => this.showDecklistEditModal(decklist);
                  editBtn.disabled = true;
                  userInfoBtn.disabled = true;
                  archiveBtn.disabled = true;
                }
                }
              }
            }
          }
        });

        observer.observe(decklistContent, {
          childList: true,
          subtree: true,
          attributes: ['style', 'class']
        });
      });
    }
  }

    // Utility functions
    generateId() {
      return this.generateId();
    }

    updateAllVisibility() {
      // Update all decklist cards visibility
      const decklistCards = document.querySelectorAll('.decklist-card');

      decklistCards.forEach(card => {
        const shouldShow = this.shouldShowDecklist(card.leagueMonth);
        const opacity = shouldShow ? '' : 'decklist-card hidden';
        card.style.opacity = opacity === 0 ? 0 : 1;
      });
    }

    updateMonthSelector() {
      const monthSelect = document.getElementById('decklistMonthSelect');
      const currentMonthYear = this.currentMonthYear;

      this.updateMonthSelector();

      // Update placeholder text in month selector
      const decklistsPlaceholder = document.querySelector('.decklist-placeholder');
      if (decklistsPlaceholder) {
        decklistsPlaceholder.textContent = decklistsPlaceholder.dataset.placeholder || 'Selecione um mês para ver as decklists';
      }
    }
  }

    filterDecklists() {
      const decklistContent = document.getElementById('decklistsContent');
      const decklistCards = Array.from(decklistContent.children);

      const filter = {
        deckArchetype: document.getElementById('decklistArchetypeFilter').value || '',
        deckName: document.getElementById('decklistSearch').value || '',
        userName: document.getElementById('decklistSearch').value || ''
      };

      let filteredDecklists = decklistCards.filter(decklist => {
        const matchesArchetype = !filter.deckArchetype || decklist.deckArchetype.includes(filter.deckArchetype));
        const matchesName = !filter.userName || decklist.deckName.includes(filter.userName);

        return matchesArchetype && matchesName;
      });

      // Update placeholder text
      const decklistsPlaceholder = document.querySelector('.decklist-placeholder');
      if (decklistPlaceholder && filteredDecklists.length === 0) {
        decklistsPlaceholder.textContent = decklistsPlaceholder.dataset.placeholder || 'Nenhuma decklist encontrada para os filtros atuais.';
      }

      // Render filtered decklists
      decklistsContent.innerHTML = filteredDecklists.map(decklist => this.renderDecklistHtml(decklist)).join('');
    }

      // Update stats
      const statsRow = document.querySelector('.decklist-stats');
      if (statsRow) {
        const monthlyLeague = this.monthlyManager.getCurrentMonthlyLeague();
        const decklists = filteredDecklists;
        const totalDecks = decklists.length;
        const totalPlayers = decklists.reduce((sum, decklist) => sum + decklist.games, 0);
        const totalGames = totalPlayers * 4;

        if (totalDecks === 0) {
          statsRow.innerHTML = '<span>Nenhum decklist encontrada</span>';
        } else {
          statsRow.innerHTML = `
            <div class="stats-row">
              <span>${totalDecks} decks</span>
              <span class="separator">|</span>
              <span>${totalGames} jogos</span>
            </div>
              <div class="stats-row">
                <span>0% vitória</span>
                <span class="separator">|</span>
                <span>${totalPlayers} jogadores</span>
              </div>
            </div>
          </div>
        `;
        }
      }
    }
  }

    createDecklistModal(decklist) {
      // This would open a modal for decklist editing
      console.log('Opening decklist modal for:', decklist.id);

      const modalOverlay = document.getElementById('modalOverlay');
      const modalContainer = document.getElementById('modalContainer');
      const modalContent = this.renderDecklistEditModal(decklist);

      modalContainer.innerHTML = modalContent;
      modalOverlay.classList.add('active');
    }
  }
}

    renderDecklistActions(decklist) {
      const actions = `
        <button class="btn btn-small visibility-toggle" onclick="window.decklistsMonthlyManager.toggleDecklistVisibility('${decklist.leagueMonth}')">
          <i class="fas fa-${decklist.decklistsVisible ? 'eye-slash' : 'eye'}"></i>
          <span>${decklist.decklistsVisible ? 'Ocultar Decklists' : 'Mostrar Decklists'}</span>
        </button>
        <div class="decklist-stats">
          <span>${this.getDecklistStatusText(decklist.leagueMonth)}${this.getMonthlyDecklistStatus(decklist.leagueMonth)}</span>
          </div>
          </div>
        </div>
      `;

      return actions;
    }

    }
  }
}

// Make the function globally available
if (typeof window !== 'undefined') {
  window.decklistsMonthlyManager = new DecklistsMonthlyManager(monthlyManager);
  window.DecklistsManager = window.decklistsMonthlyManager;
}
}
    </script>