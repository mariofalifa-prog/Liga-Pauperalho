// Rankings and Statistics System for Liga Pauperalho
class RankingsManager {
  constructor() {
    this.rankings = [];
    this.charts = {};
    this.currentView = 'monthly';
    this.init();
  }

  // Initialize rankings system
  init() {
    this.bindEvents();
    this.loadRankings();
    this.setupViewToggle();
  }

  // Bind event listeners
  bindEvents() {
    // View toggle buttons
    const viewButtons = document.querySelectorAll('[data-view]');
    viewButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        this.switchView(e.target.dataset.view);
      });
    });

    // Export rankings button
    const exportButton = document.getElementById('exportRankings');
    if (exportButton) {
      exportButton.addEventListener('click', () => this.exportRankings());
    }
  }

  // Setup view toggle functionality
  setupViewToggle() {
    const viewButtons = document.querySelectorAll('[data-view]');
    viewButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        viewButtons.forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
      });
    });
  }

  // Switch between monthly and annual view
  switchView(view) {
    this.currentView = view;
    this.loadRankings();

    // Update button states
    const viewButtons = document.querySelectorAll('[data-view]');
    viewButtons.forEach(button => {
      button.classList.remove('active');
      if (button.dataset.view === view) {
        button.classList.add('active');
      }
    });
  }

  // Load rankings data
  loadRankings() {
    if (this.currentView === 'monthly') {
      this.rankings = dataManager.calculateRankings('current-league');
    } else {
      this.rankings = this.calculateAnnualRankings();
    }

    this.renderRankings();
    this.updateStatistics();
  }

  // Calculate annual rankings (aggregated from all leagues)
  calculateAnnualRankings() {
    const currentYear = new Date().getFullYear();
    const archivedLeagues = dataManager.data.leagues.archived.filter(
      league => new Date(league.createdAt).getFullYear() === currentYear
    );

    // Include current league if it's active or completed
    const allLeagues = [...archivedLeagues];
    if (dataManager.data.leagues.current.status !== 'registration') {
      allLeagues.push(dataManager.data.leagues.current);
    }

    // Aggregate user performance across all leagues
    const userStats = {};

    allLeagues.forEach(league => {
      const leagueRankings = dataManager.calculateRankings(league.id);
      leagueRankings.forEach(ranking => {
        if (!userStats[ranking.userId]) {
          userStats[ranking.userId] = {
            userId: ranking.userId,
            playerName: ranking.playerName,
            totalPoints: 0,
            totalWins: 0,
            totalLosses: 0,
            totalGames: 0,
            leagues: 0,
            bestPlacement: Infinity,
            archetypes: new Set()
          };
        }

        const stats = userStats[ranking.userId];
        stats.totalPoints += ranking.totalPoints;
        stats.totalWins += ranking.wins;
        stats.totalLosses += ranking.losses;
        stats.totalGames += ranking.games;
        stats.leagues += 1;
        stats.bestPlacement = Math.min(stats.bestPlacement, ranking.rank);
        stats.archetypes.add(ranking.deckArchetype);
      });
    });

    // Convert to array and calculate final stats
    const annualRankings = Object.values(userStats)
      .filter(stats => stats.totalGames > 0)
      .map(stats => ({
        ...stats,
        winRate: stats.totalWins / stats.totalGames,
        avgPoints: stats.totalPoints / stats.leagues,
        primaryArchetype: Array.from(stats.archetypes)[0] || 'Unknown'
      }))
      .sort((a, b) => {
        if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
        if (b.winRate !== a.winRate) return b.winRate - a.winRate;
        return b.avgPoints - a.avgPoints;
      })
      .map((stats, index) => ({
        ...stats,
        rank: index + 1,
        deckArchetype: stats.primaryArchetype
      }));

    return annualRankings;
  }

  // Render rankings table
  renderRankings() {
    const rankingsBody = document.getElementById('rankingsBody');
    if (!rankingsBody) return;

    if (this.rankings.length === 0) {
      rankingsBody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center">
            <div class="empty-state">
              <i class="fas fa-trophy" style="font-size: 3rem; color: var(--color-bronze-accent); margin-bottom: var(--spacing-md);"></i>
              <p>Nenhuma inscrição encontrada</p>
              <p class="text-muted">Os rankings aparecerão assim que os jogadores se inscreverem na liga.</p>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    rankingsBody.innerHTML = this.rankings.map((ranking, index) => {
      const rankClass = this.getRankClass(ranking.rank);
      const winRate = Utils.calculatePercentage(ranking.wins, ranking.games);
      const deckColor = Utils.getDeckColor(ranking.deckArchetype);

      return `
        <tr class="ranking-row ${rankClass}">
          <td class="rank-col">
            <div class="rank-display">
              ${this.getRankIcon(ranking.rank)}
              <span class="rank-number">${ranking.rank}</span>
            </div>
          </td>
          <td class="player-col">
            <div class="player-info">
              <span class="player-name">${Utils.escapeHtml(ranking.playerName)}</span>
              ${this.isCurrentUser(ranking.userId) ? '<span class="current-user-badge">Você</span>' : ''}
            </div>
          </td>
          <td class="deck-col">
            <div class="deck-info">
              <div class="deck-color-indicator" style="background-color: ${deckColor};"></div>
              <span class="deck-name">${Utils.escapeHtml(ranking.deckArchetype)}</span>
            </div>
          </td>
          <td class="games-col">
            <span class="games-count">${ranking.games || 0}</span>
          </td>
          <td class="wins-col">
            <span class="wins-record">${ranking.wins || 0} - ${ranking.losses || 0}</span>
          </td>
          <td class="points-col">
            <span class="points-display">${ranking.totalPoints || 0}</span>
          </td>
          <td class="winrate-col">
            <div class="winrate-display">
              <div class="winrate-bar">
                <div class="winrate-fill" style="width: ${winRate}%; background-color: ${deckColor};"></div>
              </div>
              <span class="winrate-text">${winRate}%</span>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Add styles for ranking display
    this.addRankingStyles();
  }

  // Get rank class for styling
  getRankClass(rank) {
    if (rank === 1) return 'rank-first';
    if (rank === 2) return 'rank-second';
    if (rank === 3) return 'rank-third';
    if (rank <= 8) return 'rank-top8';
    return '';
  }

  // Get rank icon
  getRankIcon(rank) {
    switch (rank) {
      case 1: return '<i class="fas fa-medal" style="color: gold;"></i>';
      case 2: return '<i class="fas fa-medal" style="color: silver;"></i>';
      case 3: return '<i class="fas fa-medal" style="color: #cd7f32;"></i>';
      default: return `<span class="rank-number">${rank}</span>`;
    }
  }

  // Check if ranking belongs to current user
  isCurrentUser(userId) {
    const currentUser = authManager.getCurrentUser();
    return currentUser && currentUser.id === userId;
  }

  // Add ranking styles
  addRankingStyles() {
    if (document.getElementById('rankingStyles')) return;

    const style = document.createElement('style');
    style.id = 'rankingStyles';
    style.textContent = `
      .ranking-row {
        transition: background-color 0.2s ease;
      }

      .ranking-row:hover {
        background-color: var(--color-overlay-light);
      }

      .rank-first {
        background: linear-gradient(90deg, rgba(255, 215, 0, 0.1) 0%, transparent 100%);
      }

      .rank-second {
        background: linear-gradient(90deg, rgba(192, 192, 192, 0.1) 0%, transparent 100%);
      }

      .rank-third {
        background: linear-gradient(90deg, rgba(205, 127, 50, 0.1) 0%, transparent 100%);
      }

      .rank-display {
        display: flex;
        align-items: center;
        gap: var(--spacing-xs);
        font-weight: var(--font-weight-bold);
      }

      .player-info {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
      }

      .current-user-badge {
        background-color: var(--color-gold-accent);
        color: var(--color-text-inverse);
        padding: 2px 6px;
        border-radius: var(--border-radius-sm);
        font-size: var(--font-size-xs);
        font-weight: var(--font-weight-medium);
      }

      .deck-info {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
      }

      .deck-color-indicator {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        border: 1px solid var(--color-border-secondary);
      }

      .wins-record {
        font-family: var(--font-family-secondary);
        font-weight: var(--font-weight-semibold);
      }

      .points-display {
        font-weight: var(--font-weight-bold);
        color: var(--color-gold-accent);
      }

      .winrate-display {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
      }

      .winrate-bar {
        width: 40px;
        height: 6px;
        background-color: var(--color-tertiary-dark);
        border-radius: var(--border-radius-sm);
        overflow: hidden;
      }

      .winrate-fill {
        height: 100%;
        transition: width 0.3s ease;
      }

      .winrate-text {
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-medium);
      }

      .empty-state {
        padding: var(--spacing-3xl);
        text-align: center;
      }

      .empty-state p {
        margin-bottom: var(--spacing-sm);
      }
    `;
    document.head.appendChild(style);
  }

  // Update statistics
  updateStatistics() {
    this.updateDeckDistributionChart();
    this.updateWinRateChart();
    this.updateMonthlyGamesChart();
    this.updateMatchupChart();
  }

  // Update deck distribution pie chart
  updateDeckDistributionChart() {
    const ctx = document.getElementById('deckDistributionChart');
    if (!ctx) return;

    // Count deck archetypes
    const deckCounts = {};
    this.rankings.forEach(ranking => {
      deckCounts[ranking.deckArchetype] = (deckCounts[ranking.deckArchetype] || 0) + 1;
    });

    const labels = Object.keys(deckCounts);
    const data = Object.values(deckCounts);
    const colors = labels.map(deck => Utils.getDeckColor(deck));

    // Destroy existing chart
    if (this.charts.deckDistribution) {
      this.charts.deckDistribution.destroy();
    }

    this.charts.deckDistribution = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: colors,
          borderColor: '#1a1a1a',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              color: '#ffffff',
              font: {
                size: 12
              }
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.parsed || 0;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  }

  // Update win rate bar chart
  updateWinRateChart() {
    const ctx = document.getElementById('winRateChart');
    if (!ctx) return;

    // Filter players with games
    const playersWithGames = this.rankings.filter(r => r.games > 0);

    const labels = playersWithGames.map(r => r.playerName.length > 15 ?
      r.playerName.substring(0, 15) + '...' : r.playerName);
    const data = playersWithGames.map(r => Utils.calculatePercentage(r.wins, r.games));

    // Destroy existing chart
    if (this.charts.winRate) {
      this.charts.winRate.destroy();
    }

    this.charts.winRate = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Win Rate %',
          data: data,
          backgroundColor: 'rgba(212, 175, 55, 0.6)',
          borderColor: 'rgba(212, 175, 55, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: {
              color: '#ffffff',
              callback: function(value) {
                return value + '%';
              }
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            }
          },
          x: {
            ticks: {
              color: '#ffffff'
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            }
          }
        },
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });
  }

  // Update monthly games line chart
  updateMonthlyGamesChart() {
    const ctx = document.getElementById('monthlyGamesChart');
    if (!ctx) return;

    // Get games data for the last 6 months
    const months = [];
    const gamesData = [];
    const playersData = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthName = Utils.getMonthName(date.getMonth()).substring(0, 3);
      months.push(monthName);

      // For demo purposes, generate sample data
      // In a real application, you would calculate actual games per month
      gamesData.push(Math.floor(Math.random() * 50) + 20);
      playersData.push(Math.floor(Math.random() * 20) + 5);
    }

    // Destroy existing chart
    if (this.charts.monthlyGames) {
      this.charts.monthlyGames.destroy();
    }

    this.charts.monthlyGames = new Chart(ctx, {
      type: 'line',
      data: {
        labels: months,
        datasets: [{
          label: 'Jogos',
          data: gamesData,
          borderColor: 'rgba(212, 175, 55, 1)',
          backgroundColor: 'rgba(212, 175, 55, 0.1)',
          tension: 0.4
        }, {
          label: 'Jogadores',
          data: playersData,
          borderColor: 'rgba(205, 127, 50, 1)',
          backgroundColor: 'rgba(205, 127, 50, 0.1)',
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              color: '#ffffff'
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            }
          },
          x: {
            ticks: {
              color: '#ffffff'
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            }
          }
        },
        plugins: {
          legend: {
            labels: {
              color: '#ffffff'
            }
          }
        }
      }
    });
  }

  // Update matchup heatmap
  updateMatchupChart() {
    const ctx = document.getElementById('matchupChart');
    if (!ctx) return;

    // Get top 8 most common archetypes
    const deckCounts = {};
    this.rankings.forEach(ranking => {
      deckCounts[ranking.deckArchetype] = (deckCounts[ranking.deckArchetype] || 0) + 1;
    });

    const topArchetypes = Object.entries(deckCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([archetype]) => archetype);

    // Generate matchup data (simplified for demo)
    const matchupData = topArchetypes.map(() =>
      topArchetypes.map(() => Math.floor(Math.random() * 40) + 30)
    );

    // Destroy existing chart
    if (this.charts.matchup) {
      this.charts.matchup.destroy();
    }

    this.charts.matchup = new Chart(ctx, {
      type: 'heatmap',
      data: {
        labels: topArchetypes,
        datasets: [{
          label: 'Win Rate %',
          data: matchupData,
          backgroundColor: (context) => {
            const value = context.dataset.data[context.dataIndex][context.datasetIndex];
            const alpha = value / 100;
            return `rgba(212, 175, 55, ${alpha})`;
          },
          borderColor: '#1a1a1a',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            type: 'category',
            labels: topArchetypes,
            ticks: {
              color: '#ffffff',
              maxRotation: 45,
              minRotation: 45
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            }
          },
          y: {
            type: 'category',
            labels: topArchetypes,
            ticks: {
              color: '#ffffff'
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const value = context.dataset.data[context.dataIndex][context.datasetIndex];
                const archetype1 = context.chart.data.labels[context.dataIndex];
                const archetype2 = context.chart.data.labels[context.datasetIndex];
                return `${archetype1} vs ${archetype2}: ${value}%`;
              }
            }
          }
        }
      }
    });
  }

  // Export rankings
  exportRankings() {
    const exportData = {
      type: this.currentView === 'monthly' ? 'monthly_rankings' : 'annual_rankings',
      exportedAt: new Date().toISOString(),
      rankings: this.rankings.map(ranking => ({
        rank: ranking.rank,
        playerName: ranking.playerName,
        deckArchetype: ranking.deckArchetype,
        games: ranking.games,
        wins: ranking.wins,
        losses: ranking.losses,
        totalPoints: ranking.totalPoints,
        winRate: Utils.calculatePercentage(ranking.wins, ranking.games)
      }))
    };

    const csv = Utils.convertToCSV(exportData.rankings);
    const filename = `rankings_${this.currentView}_${new Date().toISOString().split('T')[0]}.csv`;

    Utils.downloadFile(csv, filename, 'text/csv');
    authManager.showNotification('Rankings Exportados', `Os rankings foram exportados como ${filename}`, 'success');
  }

  // Load decklists
  loadDecklists() {
    const decklistsContent = document.getElementById('decklistsContent');
    if (!decklistsContent) return;

    const registrations = dataManager.getLeagueRegistrations();

    if (registrations.length === 0) {
      decklistsContent.innerHTML = `
        <div class="empty-state card">
          <i class="fas fa-cards" style="font-size: 3rem; color: var(--color-bronze-accent); margin-bottom: var(--spacing-lg);"></i>
          <h3>Nenhum Decklist Encontrado</h3>
          <p>Os decklists aparecerão assim que os jogadores se inscreverem na liga.</p>
        </div>
      `;
      return;
    }

    decklistsContent.innerHTML = registrations.map(registration => {
      const user = dataManager.getUserById(registration.userId);
      const deckColor = Utils.getDeckColor(registration.deckArchetype);

      return `
        <div class="decklist-card card">
          <div class="decklist-header">
            <div class="decklist-info">
              <h3 class="decklist-title">${Utils.escapeHtml(registration.deckArchetype)}</h3>
              <p class="decklist-player">por ${Utils.escapeHtml(user ? user.name : 'Unknown Player')}</p>
            </div>
            <div class="decklist-stats">
              <div class="stat">
                <span class="stat-value">${registration.totalPoints || 0}</span>
                <span class="stat-label">Pontos</span>
              </div>
              <div class="stat">
                <span class="stat-value">${Utils.calculatePercentage(registration.wins, registration.games)}%</span>
                <span class="stat-label">Win Rate</span>
              </div>
            </div>
          </div>
          <div class="decklist-content">
            <div class="decklist-color" style="background-color: ${deckColor};"></div>
            <div class="decklist-list">
              ${registration.deckList ?
                `<pre class="decklist-text">${Utils.escapeHtml(registration.deckList)}</pre>` :
                `<p class="decklist-empty">Decklist não fornecido</p>`
              }
            </div>
          </div>
          <div class="decklist-footer">
            <span class="registration-date">Inscrito em: ${Utils.formatDate(registration.registeredAt)}</span>
          </div>
        </div>
      `;
    }).join('');

    this.addDecklistStyles();
  }

  // Add decklist styles
  addDecklistStyles() {
    if (document.getElementById('decklistStyles')) return;

    const style = document.createElement('style');
    style.id = 'decklistStyles';
    style.textContent = `
      .decklists-content {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
        gap: var(--spacing-lg);
      }

      .decklist-card {
        display: flex;
        flex-direction: column;
        height: 100%;
      }

      .decklist-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: var(--spacing-lg);
      }

      .decklist-title {
        color: var(--color-gold-accent);
        margin-bottom: var(--spacing-xs);
      }

      .decklist-player {
        color: var(--color-text-secondary);
        margin: 0;
      }

      .decklist-stats {
        display: flex;
        gap: var(--spacing-lg);
      }

      .decklist-stats .stat {
        text-align: center;
      }

      .decklist-stats .stat-value {
        display: block;
        font-size: var(--font-size-lg);
        font-weight: var(--font-weight-bold);
        color: var(--color-gold-accent);
      }

      .decklist-stats .stat-label {
        font-size: var(--font-size-xs);
        color: var(--color-text-muted);
      }

      .decklist-content {
        display: flex;
        gap: var(--spacing-md);
        flex: 1;
        margin-bottom: var(--spacing-lg);
      }

      .decklist-color {
        width: 4px;
        border-radius: var(--border-radius-sm);
        flex-shrink: 0;
      }

      .decklist-list {
        flex: 1;
        overflow: hidden;
      }

      .decklist-text {
        background-color: var(--color-tertiary-dark);
        border: 1px solid var(--color-border-primary);
        border-radius: var(--border-radius-md);
        padding: var(--spacing-md);
        font-size: var(--font-size-sm);
        font-family: var(--font-family-secondary);
        color: var(--color-text-secondary);
        white-space: pre-wrap;
        overflow-y: auto;
        max-height: 300px;
        margin: 0;
      }

      .decklist-empty {
        color: var(--color-text-muted);
        font-style: italic;
        text-align: center;
        padding: var(--spacing-lg);
        margin: 0;
      }

      .decklist-footer {
        border-top: 1px solid var(--color-border-primary);
        padding-top: var(--spacing-md);
      }

      .registration-date {
        font-size: var(--font-size-sm);
        color: var(--color-text-muted);
      }

      @media (max-width: 768px) {
        .decklists-content {
          grid-template-columns: 1fr;
        }

        .decklist-header {
          flex-direction: column;
          gap: var(--spacing-md);
        }

        .decklist-stats {
          align-self: stretch;
          justify-content: space-around;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // Refresh all rankings and statistics
  refresh() {
    this.loadRankings();
    this.loadDecklists();
  }

  // Get current rankings
  getRankings() {
    return this.rankings;
  }

  // Get user ranking
  getUserRanking(userId) {
    return this.rankings.find(ranking => ranking.userId === userId);
  }
}

// Create global instance
const rankingsManager = new RankingsManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { RankingsManager, rankingsManager };
}