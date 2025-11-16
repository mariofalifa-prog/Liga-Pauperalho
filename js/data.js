// Data Management System for Liga Pauperalho
class DataManager {
  constructor() {
    this.dataKey = 'ligaPauperalho';
    this.version = '1.0.0';
    this.data = this.loadData();
    this.initializeData();
  }

  // Load data from localStorage
  loadData() {
    const storedData = Utils.getLocalStorage(this.dataKey);
    if (storedData && storedData.version === this.version) {
      return storedData;
    }
    return this.getDefaultData();
  }

  // Get default data structure
  getDefaultData() {
    return {
      version: this.version,
      users: [],
      sessions: {},
      leagues: {
        current: this.getDefaultLeague(),
        archived: []
      },
      registrations: [],
      games: [],
      settings: this.getDefaultSettings(),
      notifications: []
    };
  }

  // Get default league structure
  getDefaultLeague() {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Calculate registration period (22 of previous month to end of current month)
    const registrationStart = new Date(currentYear, currentMonth - 1, 22);
    const registrationEnd = new Date(currentYear, currentMonth + 1, 0); // Last day of current month

    return {
      id: 'current-league',
      name: `Liga Pauperalho ${Utils.getMonthName(currentMonth)} ${currentYear}`,
      status: this.getLeagueStatus(registrationStart, registrationEnd),
      registrationPeriod: {
        start: registrationStart.toISOString(),
        end: registrationEnd.toISOString(),
        autoOpen: true,
        autoClose: true
      },
      settings: {
        maxGames: 4,
        pointsPerWin: 3,
        pointsPerLoss: 0,
        tiebreakRules: ['percentage', 'head_to_head', 'opponent_win_rate']
      },
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    };
  }

  // Get default settings
  getDefaultSettings() {
    return {
      theme: 'dark',
      language: 'pt-BR',
      notifications: {
        browser: true,
        registration: true,
        results: true,
        announcements: true
      },
      privacy: {
        publicRankings: true,
        publicDecklists: false
      },
      discord: {
        enabled: true,
        webhookUrl: '',
        inviteUrl: 'https://discord.gg/pauperalho',
        serverId: '',
        botToken: '',
        notifications: {
          newRegistration: true,
          gameResults: true,
          leagueUpdates: true,
          announcements: true
        }
      },
      contactInfo: {
        email: 'contato@pauperalho.com',
        discord: 'Liga Pauperalho',
        otherContacts: []
      },
      usefulLinks: [
        {
          title: 'Magic: The Gathering Official',
          url: 'https://magic.wizards.com/',
          description: 'Site oficial de Magic: The Gathering'
        },
        {
          title: 'Pauper Rules',
          url: 'https://magic.wizards.com/en/formats/pauper',
          description: 'Regras oficiais do formato Pauper'
        },
        {
          title: 'MTG Online',
          url: 'https://www.magicthegathering.com/mtgo',
          description: 'Jogue Magic online'
        }
      ]
    };
  }

  // Initialize data if needed
  initializeData() {
    let needsSave = false;

    // Initialize with admin user if no users exist
    if (this.data.users.length === 0) {
      this.data.users.push(this.createAdminUser());
      needsSave = true;
    }

    // Clean expired sessions
    this.cleanExpiredSessions();

    if (needsSave) {
      this.saveData();
    }
  }

  // Create default admin user
  createAdminUser() {
    return {
      id: Utils.generateUUID(),
      email: 'admin@pauperalho.com',
      password: Utils.hashPassword('admin123'),
      name: 'Administrador',
      role: 'admin',
      createdAt: new Date().toISOString(),
      lastLogin: null,
      profile: {
        displayName: 'Administrador',
        avatar: null,
        bio: 'Administrador da Liga Pauperalho'
      },
      isActive: true
    };
  }

  // Get league status based on current date
  getLeagueStatus(startDate, endDate) {
    const now = new Date();
    if (now < startDate) return 'upcoming';
    if (now <= endDate) return 'registration';
    if (now <= new Date(endDate.getTime() + 30 * 24 * 60 * 60 * 1000)) return 'active';
    return 'completed';
  }

  // Save data to localStorage
  saveData() {
    this.data.leagues.current.updatedAt = new Date().toISOString();
    return Utils.setLocalStorage(this.dataKey, this.data);
  }

  // User Management
  createUser(userData) {
    const user = {
      id: Utils.generateUUID(),
      email: Utils.sanitizeInput(userData.email),
      password: Utils.hashPassword(userData.password),
      name: Utils.sanitizeInput(userData.name),
      role: 'user',
      createdAt: new Date().toISOString(),
      lastLogin: null,
      profile: {
        displayName: Utils.sanitizeInput(userData.name),
        avatar: null,
        bio: ''
      },
      isActive: true
    };

    this.data.users.push(user);
    this.saveData();
    return user;
  }

  getUserById(userId) {
    return this.data.users.find(user => user.id === userId);
  }

  getUserByEmail(email) {
    return this.data.users.find(user => user.email === email);
  }

  updateUser(userId, updates) {
    const userIndex = this.data.users.findIndex(user => user.id === userId);
    if (userIndex !== -1) {
      this.data.users[userIndex] = { ...this.data.users[userIndex], ...updates };
      this.saveData();
      return this.data.users[userIndex];
    }
    return null;
  }

  deleteUser(userId) {
    const userIndex = this.data.users.findIndex(user => user.id === userId);
    if (userIndex !== -1) {
      const deletedUser = this.data.users.splice(userIndex, 1)[0];
      // Clean up related data
      this.data.registrations = this.data.registrations.filter(reg => reg.userId !== userId);
      this.data.games = this.data.games.filter(game => game.player1Id !== userId && game.player2Id !== userId);
      this.saveData();
      return deletedUser;
    }
    return null;
  }

  getAllUsers() {
    return [...this.data.users];
  }

  // Session Management
  createSession(userId, rememberMe = false) {
    const session = {
      userId,
      token: Utils.generateUUID(),
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + (rememberMe ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000)).toISOString()
    };

    this.data.sessions[session.token] = session;
    this.saveData();
    return session;
  }

  getSession(token) {
    const session = this.data.sessions[token];
    if (session && new Date(session.expiresAt) > new Date()) {
      return session;
    }
    return null;
  }

  removeSession(token) {
    if (this.data.sessions[token]) {
      delete this.data.sessions[token];
      this.saveData();
      return true;
    }
    return false;
  }

  cleanExpiredSessions() {
    let cleaned = false;
    const now = new Date();

    for (const token in this.data.sessions) {
      if (new Date(this.data.sessions[token].expiresAt) <= now) {
        delete this.data.sessions[token];
        cleaned = true;
      }
    }

    if (cleaned) {
      this.saveData();
    }
  }

  getUserSessions(userId) {
    return Object.values(this.data.sessions).filter(session => session.userId === userId);
  }

  // League Management
  getCurrentLeague() {
    return this.data.leagues.current;
  }

  updateLeague(updates) {
    this.data.leagues.current = { ...this.data.leagues.current, ...updates };
    this.saveData();
    return this.data.leagues.current;
  }

  // Registration Management
  createRegistration(registrationData) {
    const existingRegistration = this.data.registrations.find(
      reg => reg.userId === registrationData.userId && reg.leagueId === registrationData.leagueId
    );

    if (existingRegistration) {
      throw new Error('Usuário já está inscrito nesta liga');
    }

    const registration = {
      id: Utils.generateUUID(),
      userId: registrationData.userId,
      leagueId: registrationData.leagueId || 'current-league',
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

    this.data.registrations.push(registration);
    this.saveData();
    return registration;
  }

  getRegistration(userId, leagueId = 'current-league') {
    return this.data.registrations.find(
      reg => reg.userId === userId && reg.leagueId === leagueId
    );
  }

  getUserRegistrations(userId) {
    return this.data.registrations.filter(reg => reg.userId === userId);
  }

  getLeagueRegistrations(leagueId = 'current-league') {
    return this.data.registrations.filter(reg => reg.leagueId === leagueId);
  }

  updateRegistration(registrationId, updates) {
    const regIndex = this.data.registrations.findIndex(reg => reg.id === registrationId);
    if (regIndex !== -1) {
      this.data.registrations[regIndex] = { ...this.data.registrations[regIndex], ...updates };
      this.saveData();
      return this.data.registrations[regIndex];
    }
    return null;
  }

  deleteRegistration(registrationId) {
    const regIndex = this.data.registrations.findIndex(reg => reg.id === registrationId);
    if (regIndex !== -1) {
      const deletedRegistration = this.data.registrations.splice(regIndex, 1)[0];
      this.saveData();
      return deletedRegistration;
    }
    return null;
  }

  // Game Management
  createGame(gameData) {
    const game = {
      id: Utils.generateUUID(),
      player1Id: gameData.player1Id,
      player2Id: gameData.player2Id,
      player1Wins: parseInt(gameData.player1Wins) || 0,
      player2Wins: parseInt(gameData.player2Wins) || 0,
      player1Deck: gameData.player1Deck,
      player2Deck: gameData.player2Deck,
      leagueId: gameData.leagueId || 'current-league',
      playedAt: gameData.playedAt || new Date().toISOString(),
      validated: false,
      validatedBy: null,
      validatedAt: null,
      notes: Utils.sanitizeInput(gameData.notes || ''),
      winner: this.determineWinner(gameData.player1Wins, gameData.player2Wins)
    };

    this.data.games.push(game);
    this.saveData();
    return game;
  }

  determineWinner(player1Wins, player2Wins) {
    if (player1Wins > player2Wins) return 'player1';
    if (player2Wins > player1Wins) return 'player2';
    return 'tie';
  }

  getGame(gameId) {
    return this.data.games.find(game => game.id === gameId);
  }

  getLeagueGames(leagueId = 'current-league') {
    return this.data.games.filter(game => game.leagueId === leagueId);
  }

  getUserGames(userId, leagueId = 'current-league') {
    return this.data.games.filter(
      game => (game.player1Id === userId || game.player2Id === userId) &&
              game.leagueId === leagueId
    );
  }

  updateGame(gameId, updates) {
    const gameIndex = this.data.games.findIndex(game => game.id === gameId);
    if (gameIndex !== -1) {
      const updatedGame = { ...this.data.games[gameIndex], ...updates };
      updatedGame.winner = this.determineWinner(updatedGame.player1Wins, updatedGame.player2Wins);
      this.data.games[gameIndex] = updatedGame;
      this.saveData();
      return updatedGame;
    }
    return null;
  }

  validateGame(gameId, validatedBy) {
    return this.updateGame(gameId, {
      validated: true,
      validatedBy,
      validatedAt: new Date().toISOString()
    });
  }

  deleteGame(gameId) {
    const gameIndex = this.data.games.findIndex(game => game.id === gameId);
    if (gameIndex !== -1) {
      const deletedGame = this.data.games.splice(gameIndex, 1)[0];
      this.saveData();
      return deletedGame;
    }
    return null;
  }

  // Rankings and Statistics
  calculateRankings(leagueId = 'current-league') {
    const registrations = this.getLeagueRegistrations(leagueId);
    const games = this.getLeagueGames(leagueId);

    // Calculate statistics for each registration
    const rankings = registrations.map(registration => {
      const userGames = games.filter(
        game => game.player1Id === registration.userId || game.player2Id === registration.userId
      );

      let wins = 0;
      let losses = 0;
      let totalPoints = 0;
      const opponentIds = new Set();

      userGames.forEach(game => {
        const isPlayer1 = game.player1Id === registration.userId;
        const playerWins = isPlayer1 ? game.player1Wins : game.player2Wins;
        const opponentWins = isPlayer1 ? game.player2Wins : game.player1Wins;
        const opponentId = isPlayer1 ? game.player2Id : game.player1Id;

        opponentIds.add(opponentId);

        wins += playerWins;
        losses += opponentWins;
        totalPoints += playerWins * this.data.leagues.current.settings.pointsPerWin;
      });

      const totalGames = wins + losses;
      const winRate = totalGames > 0 ? (wins / totalGames) : 0;

      // Calculate opponent win percentage
      const opponentWinPercentage = this.calculateOpponentWinPercentage(
        Array.from(opponentIds),
        leagueId
      );

      return {
        ...registration,
        games: totalGames,
        wins,
        losses,
        totalPoints,
        winRate,
        opponentWinPercentage,
        strengthOfSchedule: opponentWinPercentage // Simplified strength of schedule
      };
    });

    // Sort rankings
    rankings.sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) {
        return b.totalPoints - a.totalPoints;
      }
      if (b.winRate !== a.winRate) {
        return b.winRate - a.winRate;
      }
      if (b.opponentWinPercentage !== a.opponentWinPercentage) {
        return b.opponentWinPercentage - a.opponentWinPercentage;
      }
      return 0;
    });

    // Assign ranks
    rankings.forEach((ranking, index) => {
      ranking.rank = index + 1;
    });

    return rankings;
  }

  calculateOpponentWinPercentage(opponentIds, leagueId) {
    if (opponentIds.length === 0) return 0;

    let totalOpponentWins = 0;
    let totalOpponentGames = 0;

    opponentIds.forEach(opponentId => {
      const opponentRegistration = this.getRegistration(opponentId, leagueId);
      if (opponentRegistration) {
        totalOpponentWins += opponentRegistration.wins || 0;
        totalOpponentGames += (opponentRegistration.wins || 0) + (opponentRegistration.losses || 0);
      }
    });

    return totalOpponentGames > 0 ? totalOpponentWins / totalOpponentGames : 0;
  }

  // Notifications
  createNotification(notificationData) {
    const notification = {
      id: Utils.generateUUID(),
      userId: notificationData.userId || null,
      title: Utils.sanitizeInput(notificationData.title),
      message: Utils.sanitizeInput(notificationData.message),
      type: notificationData.type || 'info',
      read: false,
      createdAt: new Date().toISOString(),
      expiresAt: notificationData.expiresAt || null
    };

    this.data.notifications.unshift(notification);

    // Keep only last 50 notifications
    if (this.data.notifications.length > 50) {
      this.data.notifications = this.data.notifications.slice(0, 50);
    }

    this.saveData();
    return notification;
  }

  getUnreadNotifications(userId = null) {
    return this.data.notifications.filter(
      notification => !notification.read &&
      (userId === null || notification.userId === userId || notification.userId === null)
    );
  }

  markNotificationAsRead(notificationId) {
    const notificationIndex = this.data.notifications.findIndex(n => n.id === notificationId);
    if (notificationIndex !== -1) {
      this.data.notifications[notificationIndex].read = true;
      this.saveData();
      return true;
    }
    return false;
  }

  markAllNotificationsAsRead(userId = null) {
    let updated = false;
    this.data.notifications.forEach(notification => {
      if (!notification.read &&
          (userId === null || notification.userId === userId || notification.userId === null)) {
        notification.read = true;
        updated = true;
      }
    });

    if (updated) {
      this.saveData();
    }
    return updated;
  }

  // Data Export and Backup
  exportAllData() {
    return {
      ...this.data,
      exportedAt: new Date().toISOString(),
      exportedBy: 'user'
    };
  }

  exportUsers() {
    return this.data.users.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
      isActive: user.isActive
    }));
  }

  exportRankings(leagueId = 'current-league') {
    return this.calculateRankings(leagueId);
  }

  exportGames(leagueId = 'current-league') {
    return this.getLeagueGames(leagueId);
  }

  // Data Import and Restore
  importData(importData, validateStructure = true) {
    if (validateStructure && !this.validateDataStructure(importData)) {
      throw new Error('Invalid data structure');
    }

    // Backup current data
    const backup = this.exportAllData();

    try {
      this.data = importData;
      this.saveData();
      return { success: true, backup };
    } catch (error) {
      // Restore backup on failure
      this.data = backup;
      this.saveData();
      throw error;
    }
  }

  validateDataStructure(data) {
    const requiredKeys = ['version', 'users', 'sessions', 'leagues', 'registrations', 'games', 'settings'];
    return requiredKeys.every(key => key in data);
  }

  // Maintenance
  archiveCurrentLeague() {
    const currentLeague = this.data.leagues.current;
    this.data.leagues.archived.push({
      ...currentLeague,
      archivedAt: new Date().toISOString()
    });

    // Create new league
    this.data.leagues.current = this.getDefaultLeague();
    this.saveData();
    return this.data.leagues.current;
  }

  clearAllData() {
    this.data = this.getDefaultData();
    this.initializeData();
    return true;
  }

  // Discord integration methods
  async sendDiscordNotification(message, type = 'info') {
    const discordSettings = this.data.settings.discord;
    if (!discordSettings.enabled || !discordSettings.webhookUrl) {
      return false;
    }

    try {
      const payload = {
        content: null,
        embeds: [{
          title: this.getDiscordTitle(type),
          description: message,
          color: this.getDiscordColor(type),
          timestamp: new Date().toISOString(),
          footer: {
            text: 'Liga Pauperalho'
          }
        }]
      };

      const response = await fetch(discordSettings.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      return response.ok;
    } catch (error) {
      console.error('Discord notification error:', error);
      return false;
    }
  }

  getDiscordTitle(type) {
    const titles = {
      'new_registration': '🎮 Nova Inscrição na Liga',
      'game_result': '⚔️ Resultado de Jogo Registrado',
      'league_update': '📅 Atualização da Liga',
      'announcement': '📢 Anúncio Importante',
      'info': 'ℹ️ Informação'
    };
    return titles[type] || titles.info;
  }

  getDiscordColor(type) {
    const colors = {
      'new_registration': 0x00ff00,    // Green
      'game_result': 0xffaa00,        // Gold
      'league_update': 0x0099ff,      // Blue
      'announcement': 0xff0000,       // Red
      'info': 0x9966ff                // Purple
    };
    return colors[type] || colors.info;
  }

  // Settings management methods
  updateSettings(updates) {
    this.data.settings = { ...this.data.settings, ...updates };
    this.saveData();
    return this.data.settings;
  }

  getSettings() {
    return this.data.settings;
  }

  // Contact management
  updateContactInfo(updates) {
    this.data.settings.contactInfo = { ...this.data.settings.contactInfo, ...updates };
    this.saveData();
    return this.data.settings.contactInfo;
  }

  getContactInfo() {
    return this.data.settings.contactInfo;
  }

  // Useful links management
  addUsefulLink(link) {
    const newLink = {
      id: Utils.generateUUID(),
      title: Utils.sanitizeInput(link.title),
      url: Utils.sanitizeInput(link.url),
      description: Utils.sanitizeInput(link.description || ''),
      createdAt: new Date().toISOString()
    };

    this.data.settings.usefulLinks.push(newLink);
    this.saveData();
    return newLink;
  }

  updateUsefulLink(linkId, updates) {
    const linkIndex = this.data.settings.usefulLinks.findIndex(link => link.id === linkId);
    if (linkIndex !== -1) {
      this.data.settings.usefulLinks[linkIndex] = {
        ...this.data.settings.usefulLinks[linkIndex],
        ...updates
      };
      this.saveData();
      return this.data.settings.usefulLinks[linkIndex];
    }
    return null;
  }

  removeUsefulLink(linkId) {
    const linkIndex = this.data.settings.usefulLinks.findIndex(link => link.id === linkId);
    if (linkIndex !== -1) {
      const removedLink = this.data.settings.usefulLinks.splice(linkIndex, 1)[0];
      this.saveData();
      return removedLink;
    }
    return null;
  }

  getUsefulLinks() {
    return this.data.settings.usefulLinks;
  }

  getStorageInfo() {
    const usage = Utils.getLocalStorageUsage();
    return {
      ...usage,
      userCount: this.data.users.length,
      registrationCount: this.data.registrations.length,
      gameCount: this.data.games.length,
      notificationCount: this.data.notifications.length,
      archivedLeagues: this.data.leagues.archived.length,
      version: this.data.version
    };
  }
}

// Create global instance
const dataManager = new DataManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DataManager, dataManager };
}