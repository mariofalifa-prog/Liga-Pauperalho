// Monthly League Enhancement for Liga Pauperalho
// Adds monthly separation, decklist visibility control, and enhanced export functionality

class MonthlyLeagueManager {
  constructor(dataManager) {
    this.dataManager = dataManager;
    this.initializeMonthlyFeatures();
  }

  // Initialize monthly features
  initializeMonthlyFeatures() {
    this.addMonthlyFieldsToExistingData();
    this.addDecklistVisibilityControl();
    console.log('🗓️ Monthly league features initialized');
  }

  // Add monthly fields to existing registrations and games
  addMonthlyFieldsToExistingData() {
    const data = this.dataManager.data;
    let needsSave = false;

    // Update existing registrations with monthly league info
    data.registrations.forEach(registration => {
      if (!registration.monthlyLeagueId) {
        registration.monthlyLeagueId = this.getMonthlyLeagueId(registration.registeredAt);
        registration.leagueMonth = this.getMonthYear(registration.registeredAt);
        needsSave = true;
      }
    });

    // Update existing games with monthly league info
    data.games.forEach(game => {
      if (!game.monthlyLeagueId) {
        game.monthlyLeagueId = this.getMonthlyLeagueId(game.playedAt);
        game.leagueMonth = this.getMonthYear(game.playedAt);
        needsSave = true;
      }
    });

    if (needsSave) {
      this.dataManager.saveData();
      console.log('✅ Updated existing data with monthly fields');
    }
  }

  // Add decklist visibility control
  addDecklistVisibilityControl() {
    const data = this.dataManager.data;

    // Update privacy settings for decklist control
    if (!data.settings.privacy.decklistVisibility) {
      data.settings.privacy.decklistVisibility = 'registration_closed'; // Options: 'always', 'registration_open', 'registration_closed'
    }

    // Initialize monthly leagues structure if doesn't exist
    if (!data.monthlyLeagues) {
      data.monthlyLeagues = this.initializeMonthlyLeaguesStructure();
    }

    this.dataManager.saveData();
    console.log('🔒 Decklist visibility control initialized');
  }

  // Initialize monthly leagues structure
  initializeMonthlyLeaguesStructure() {
    const monthlyLeagues = {};
    const currentLeague = this.dataManager.getCurrentLeague();
    const currentMonthYear = this.getMonthYear(new Date());

    // Create current monthly league
    monthlyLeagues[currentMonthYear] = {
      id: `monthly-${currentMonthYear}`,
      name: `Liga Mensal ${currentMonthYear}`,
      parentLeagueId: 'current-league',
      status: currentLeague.status,
      registrationPeriod: currentLeague.registrationPeriod,
      settings: currentLeague.settings,
      registrations: [],
      games: [],
      rankings: [],
      decklistsVisible: false,
      createdAt: currentLeague.createdAt,
      updatedAt: new Date().toISOString()
    };

    return monthlyLeagues;
  }

  // Get month-year string (e.g., "Novembro 2024")
  getMonthYear(date) {
    const d = new Date(date);
    return `${Utils.getMonthName(d.getMonth())} ${d.getFullYear()}`;
  }

  // Get monthly league ID
  getMonthlyLeagueId(date) {
    return `monthly-${this.getMonthYear(date)}`;
  }

  // Get all monthly leagues
  getAllMonthlyLeagues() {
    return this.dataManager.data.monthlyLeagues || {};
  }

  // Get specific monthly league
  getMonthlyLeague(monthYear) {
    const monthlyLeagues = this.dataManager.data.monthlyLeagues || {};
    return monthlyLeagues[monthYear];
  }

  // Get current monthly league
  getCurrentMonthlyLeague() {
    const currentMonthYear = this.getMonthYear(new Date());
    return this.getMonthlyLeague(currentMonthYear);
  }

  // Update monthly league
  updateMonthlyLeague(monthYear, updates) {
    const monthlyLeagues = this.dataManager.data.monthlyLeagues || {};
    if (monthlyLeagues[monthYear]) {
      monthlyLeagues[monthYear] = { ...monthlyLeagues[monthYear], ...updates, updatedAt: new Date().toISOString() };
      this.dataManager.data.monthlyLeagues = monthlyLeagues;
      this.dataManager.saveData();
      return monthlyLeagues[monthYear];
    }
    return null;
  }

  // Check if decklists should be visible
  shouldShowDecklists(monthYear = null) {
    const league = monthYear ? this.getMonthlyLeague(monthYear) : this.getCurrentMonthlyLeague();

    if (!league) {
      return false;
    }

    const privacy = this.dataManager.data.settings.privacy.decklistVisibility;
    const registrationStatus = league.status;

    switch (privacy) {
      case 'always':
        return true;
      case 'registration_open':
        return registrationStatus === 'registration';
      case 'registration_closed':
        return registrationStatus !== 'registration';
      default:
        return false;
    }
  }

  // Update decklist visibility
  updateDecklistVisibility(monthYear, visible) {
    return this.updateMonthlyLeague(monthYear, { decklistsVisible: visible });
  }

  // Update registration period (monthly)
  updateRegistrationPeriod(monthYear, registrationPeriod) {
    return this.updateMonthlyLeague(monthYear, { registrationPeriod });
  }

  // Add registration to monthly league
  addMonthlyRegistration(registrationData) {
    const monthlyLeagueId = this.getMonthlyLeagueId(registrationData.registeredAt || new Date());
    const monthYear = this.getMonthYear(registrationData.registeredAt || new Date());

    // Check if user is already registered for this month
    const existingRegistration = this.getMonthlyRegistrations(monthYear)
      .find(reg => reg.userId === registrationData.userId);

    if (existingRegistration) {
      throw new Error('Usuário já está inscrito nesta liga mensal');
    }

    const monthlyRegistration = {
      id: Utils.generateUUID(),
      userId: registrationData.userId,
      monthlyLeagueId,
      deckArchetype: Utils.sanitizeInput(registrationData.deckArchetype),
      deckList: Utils.sanitizeInput(registrationData.deckList || ''),
      registeredAt: new Date().toISOString(),
      status: 'active',
      games: [],
      totalPoints: 0,
      wins: 0,
      losses: 0,
      winRate: 0.0,
      opponentWinPercentage: 0.0,
      headToHeadRecord: {},
      strengthOfSchedule: 0.0,
      rank: 0
    };

    // Update monthly league
    const monthlyLeague = this.getMonthlyLeague(monthYear);
    if (monthlyLeague) {
      monthlyLeague.registrations.push(monthlyRegistration);
      this.updateMonthlyLeague(monthYear, monthlyLeague);
    }

    return monthlyRegistration;
  }

  // Get monthly registrations
  getMonthlyRegistrations(monthYear) {
    const monthlyLeague = this.getMonthlyLeague(monthYear);
    return monthlyLeague ? monthlyLeague.registrations : [];
  }

  // Add game to monthly league
  addMonthlyGame(gameData) {
    const monthlyLeagueId = this.getMonthlyLeagueId(gameData.playedAt || new Date());
    const monthYear = this.getMonthYear(gameData.playedAt || new Date());

    const game = {
      id: Utils.generateUUID(),
      player1Id: gameData.player1Id,
      player2Id: gameData.player2Id,
      player1Wins: parseInt(gameData.player1Wins) || 0,
      player2Wins: parseInt(gameData.player2Wins) || 0,
      player1Deck: gameData.player1Deck,
      player2Deck: gameData.player2Deck,
      monthlyLeagueId,
      leagueMonth: monthYear,
      playedAt: gameData.playedAt || new Date().toISOString(),
      validated: false,
      validatedBy: null,
      validatedAt: null,
      notes: Utils.sanitizeInput(gameData.notes || ''),
      winner: this.determineWinner(gameData.player1Wins, gameData.player2Wins)
    };

    // Update monthly league
    const monthlyLeague = this.getMonthlyLeague(monthYear);
    if (monthlyLeague) {
      monthlyLeague.games.push(game);
      this.updateMonthlyLeague(monthYear, monthlyLeague);
    }

    return game;
  }

  // Determine winner
  determineWinner(player1Wins, player2Wins) {
    if (player1Wins > player2Wins) return 'player1';
    if (player2Wins > player1Wins) return 'player2';
    return 'tie';
  }

  // Get monthly games
  getMonthlyGames(monthYear) {
    const monthlyLeague = this.getMonthlyLeague(monthYear);
    return monthlyLeague ? monthlyLeague.games : [];
  }

  // Calculate monthly rankings
  calculateMonthlyRankings(monthYear) {
    const monthlyLeague = this.getMonthlyLeague(monthYear);
    if (!monthlyLeague) {
      return [];
    }

    const registrations = monthlyLeague.registrations;
    const games = monthlyLeague.games;

    // Calculate statistics for each registration
    const rankings = registrations.map(registration => {
      const userGames = games.filter(
        game => game.player1Id === registration.userId || game.player2Id === registration.userId
      );

      let wins = 0;
      let losses = 0;
      let totalPoints = 0;
      const opponentIds = new Set();
      const headToHeadRecord = {};

      userGames.forEach(game => {
        const isPlayer1 = game.player1Id === registration.userId;
        const playerWins = isPlayer1 ? game.player1Wins : game.player2Wins;
        const opponentWins = isPlayer1 ? game.player2Wins : game.player1Wins;
        const opponentId = isPlayer1 ? game.player2Id : game.player1Id;

        opponentIds.add(opponentId);

        // Track head to head
        headToHeadRecord[opponentId] = {
          wins: (headToHeadRecord[opponentId]?.wins || 0) + playerWins,
          losses: (headToHeadRecord[opponentId]?.losses || 0) + opponentWins
        };

        wins += playerWins;
        losses += opponentWins;
        totalPoints += playerWins * (monthlyLeague.settings.pointsPerWin || 3);
      });

      const totalGames = wins + losses;
      const winRate = totalGames > 0 ? (wins / totalGames) : 0;

      // Calculate opponent win percentage
      const opponentWinPercentage = this.calculateOpponentWinPercentage(
        Array.from(opponentIds),
        monthYear
      );

      return {
        ...registration,
        games: totalGames,
        wins,
        losses,
        totalPoints,
        winRate,
        opponentWinPercentage,
        headToHeadRecord,
        strengthOfSchedule: opponentWinPercentage
      };
    });

    // Sort rankings
    rankings.sort((a, b) => {
      // 1. Total points
      if (b.totalPoints !== a.totalPoints) {
        return b.totalPoints - a.totalPoints;
      }
      // 2. Win rate
      if (b.winRate !== a.winRate) {
        return b.winRate - a.winRate;
      }
      // 3. Most wins
      if (b.wins !== a.wins) {
        return b.wins - a.wins;
      }
      // 4. Fewest losses
      if (a.losses !== b.losses) {
        return a.losses - b.losses;
      }
      return 0;
    });

    // Assign ranks
    let currentRank = 1;
    rankings.forEach((ranking, index) => {
      if (index === 0) {
        ranking.rank = currentRank;
      } else {
        const prevRanking = rankings[index - 1];
        if (ranking.totalPoints === prevRanking.totalPoints &&
            ranking.winRate === prevRanking.winRate &&
            ranking.wins === prevRanking.wins &&
            ranking.losses === prevRanking.losses) {
          ranking.rank = prevRanking.rank;
        } else {
          currentRank = index + 1;
          ranking.rank = currentRank;
        }
      }
    });

    // Update monthly league with rankings
    this.updateMonthlyLeague(monthYear, { rankings });

    return rankings;
  }

  // Calculate opponent win percentage (monthly)
  calculateOpponentWinPercentage(opponentIds, monthYear) {
    if (opponentIds.length === 0) return 0;

    let totalOpponentWins = 0;
    let totalOpponentGames = 0;

    opponentIds.forEach(opponentId => {
      const opponentRegistration = this.getMonthlyRegistrations(monthYear)
        .find(reg => reg.userId === opponentId);
      if (opponentRegistration) {
        totalOpponentWins += opponentRegistration.wins || 0;
        totalOpponentGames += (opponentRegistration.wins || 0) + (opponentRegistration.losses || 0);
      }
    });

    return totalOpponentGames > 0 ? totalOpponentWins / totalOpponentGames : 0;
  }

  // Export monthly data
  exportMonthlyData(monthYear = null) {
    const monthlyLeagues = this.dataManager.data.monthlyLeagues || {};

    if (monthYear) {
      // Export specific month
      return {
        type: 'monthly_league',
        monthYear,
        data: monthlyLeagues[monthYear] || {},
        exportedAt: new Date().toISOString()
      };
    }

    // Export all monthly data
    return {
      type: 'all_monthly_leagues',
      monthlyLeagues: monthlyLeagues,
      currentLeague: this.dataManager.getCurrentLeague(),
      settings: this.dataManager.getSettings(),
      exportedAt: new Date().toISOString()
    };
  }

  // Get decklists for a specific month
  getMonthlyDecklists(monthYear) {
    const registrations = this.getMonthlyRegistrations(monthYear);

    if (!this.shouldShowDecklists(monthYear)) {
      return registrations.map(reg => ({
        id: reg.id,
        userId: reg.userId,
        deckArchetype: reg.deckArchetype,
        deckList: 'Decklists ocultas - inscrições abertas',
        isHidden: true,
        registeredAt: reg.registeredAt
      }));
    }

    return registrations.map(reg => ({
      id: reg.id,
      userId: reg.userId,
      userName: this.getUserName(reg.userId),
      deckArchetype: reg.deckArchetype,
      deckList: reg.deckList,
      isHidden: false,
      registeredAt: reg.registeredAt
    }));
  }

  // Get user name helper
  getUserName(userId) {
    const user = this.dataManager.getUserById(userId);
    return user ? user.name : 'Usuário Desconhecido';
  }

  // Close registration for current month
  closeMonthlyRegistration(monthYear = null) {
    const currentMonthYear = monthYear || this.getMonthYear(new Date());
    const monthlyLeague = this.getMonthlyLeague(currentMonthYear);

    if (monthlyLeague && monthlyLeague.status === 'registration') {
      this.updateMonthlyLeague(currentMonthYear, {
        status: 'active',
        decklistsVisible: true
      });

      // Update privacy settings
      this.dataManager.updateSettings({
        privacy: {
          ...this.dataManager.data.settings.privacy,
          decklistVisibility: 'registration_closed'
        }
      });

      return true;
    }

    return false;
  }

  // Open registration for current month
  openMonthlyRegistration(monthYear = null) {
    const currentMonthYear = monthYear || this.getMonthYear(new Date());
    const monthlyLeague = this.getMonthlyLeague(currentMonthYear);

    if (monthlyLeague) {
      this.updateMonthlyLeague(currentMonthYear, {
        status: 'registration',
        decklistsVisible: false
      });

      // Update privacy settings
      this.dataManager.updateSettings({
        privacy: {
          ...this.dataManager.data.settings.privacy,
          decklistVisibility: 'registration_open'
        }
      });
    }

    return true;
  }

  // Get monthly Top 8
  getMonthlyTop8(monthYear) {
    const rankings = this.calculateMonthlyRankings(monthYear);
    return rankings.slice(0, 8);
  }

  // Enhanced export functionality
  exportLeagueResults(monthYear = null) {
    if (monthYear) {
      // Export specific month
      const rankings = this.calculateMonthlyRankings(monthYear);
      const games = this.getMonthlyGames(monthYear);
      const monthlyLeague = this.getMonthlyLeague(monthYear);

      return {
        type: 'monthly_results',
        monthYear,
        league: monthlyLeague,
        rankings,
        games,
        totalPlayers: rankings.length,
        totalGames: games.length,
        exportedAt: new Date().toISOString()
      };
    }

    // Export all months
    const monthlyLeagues = this.getAllMonthlyLeagues();
    const allResults = {};

    Object.keys(monthlyLeagues).forEach(monthYear => {
      const league = monthlyLeagues[monthYear];
      const rankings = this.calculateMonthlyRankings(monthYear);
      const games = league.games || [];

      allResults[monthYear] = {
        league,
        rankings,
        games,
        totalPlayers: rankings.length,
        totalGames: games.length
      };
    });

    return {
      type: 'all_monthly_results',
      months: allResults,
      totalMonths: Object.keys(allResults).length,
      settings: this.dataManager.getSettings(),
      exportedAt: new Date().toISOString()
    };
  }

  // Enhanced export with decklists
  exportMonthlyDecklists(monthYear = null) {
    if (monthYear) {
      // Export specific month
      const decklists = this.getMonthlyDecklists(monthYear);
      const monthlyLeague = this.getMonthlyLeague(monthYear);

      return {
        type: 'monthly_decklists',
        monthYear,
        league: monthlyLeague,
        decklists,
        totalDecklists: decklists.length,
        visibility: this.shouldShowDecklists(monthYear) ? 'visible' : 'hidden',
        exportedAt: new Date().toISOString()
      };
    }

    // Export all decklists
    const monthlyLeagues = this.getAllMonthlyLeagues();
    const allDecklists = {};

    Object.keys(monthlyLeagues).forEach(monthYear => {
      const decklists = this.getMonthlyDecklists(monthYear);
      allDecklists[monthYear] = {
        decklists,
        totalDecklists: decklists.length,
        visibility: this.shouldShowDecklists(monthYear) ? 'visible' : 'hidden'
      };
    });

    return {
      type: 'all_monthly_decklists',
      months: allDecklists,
      totalMonths: Object.keys(allDecklists).length,
      settings: this.dataManager.getSettings(),
      exportedAt: new Date().toISOString()
    };
  }

  // Archive current monthly league
  archiveCurrentMonthlyLeague() {
    const currentMonthYear = this.getMonthYear(new Date());
    const currentMonthlyLeague = this.getMonthlyLeague(currentMonthYear);

    if (currentMonthlyLeague) {
      // Add to archived monthly leagues
      if (!this.dataManager.data.archivedMonthlyLeagues) {
        this.dataManager.data.archivedMonthlyLeagues = [];
      }

      const archivedLeague = {
        ...currentMonthlyLeague,
        archivedAt: new Date().toISOString(),
        archivedBy: 'monthly_archive'
      };

      this.dataManager.data.archivedMonthlyLeagues.push(archivedLeague);

      // Create new monthly league for next month
      this.initializeNextMonthlyLeague();

      this.dataManager.saveData();
      return archivedLeague;
    }

    return null;
  }

  // Initialize next monthly league
  initializeNextMonthlyLeague() {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const nextMonthYear = this.getMonthYear(nextMonth);

    const newMonthlyLeague = {
      id: `monthly-${nextMonthYear}`,
      name: `Liga Mensal ${nextMonthYear}`,
      parentLeagueId: 'current-league',
      status: 'upcoming',
      registrationPeriod: {
        start: new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 22).toISOString(),
        end: new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 0).toISOString(),
        autoOpen: true,
        autoClose: true
      },
      settings: this.dataManager.data.settings,
      registrations: [],
      games: [],
      rankings: [],
      decklistsVisible: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const monthlyLeagues = this.dataManager.data.monthlyLeagues || {};
    monthlyLeagues[nextMonthYear] = newMonthlyLeague;
    this.dataManager.data.monthlyLeagues = monthlyLeagues;
  }
}

// Auto-initialize when dataManager is available
if (typeof dataManager !== 'undefined') {
  const monthlyManager = new MonthlyLeagueManager(dataManager);

  // Export for use in other modules
  if (typeof window !== 'undefined') {
    window.monthlyManager = monthlyManager;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MonthlyLeagueManager, monthlyManager };
  }
}