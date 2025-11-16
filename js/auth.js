// Authentication System for Liga Pauperalho
class AuthManager {
  constructor() {
    this.currentUser = null;
    this.sessionToken = null;
    this.init();
  }

  // Initialize authentication
  init() {
    this.checkExistingSession();
    this.bindEvents();
    this.updateUI();
  }

  // Check for existing session
  checkExistingSession() {
    const sessionToken = sessionStorage.getItem('ligaSessionToken') ||
                        localStorage.getItem('ligaSessionToken');

    if (sessionToken) {
      const session = dataManager.getSession(sessionToken);
      if (session) {
        this.sessionToken = sessionToken;
        this.currentUser = dataManager.getUserById(session.userId);
        if (this.currentUser) {
          this.updateLastLogin();
          this.showNotification('Bem-vindo de volta!', `Olá, ${this.currentUser.name}`, 'success');
        }
      } else {
        this.logout();
      }
    }
  }

  // Update last login time
  updateLastLogin() {
    if (this.currentUser) {
      dataManager.updateUser(this.currentUser.id, {
        lastLogin: new Date().toISOString()
      });
    }
  }

  // Bind event listeners
  bindEvents() {
    // Login and register buttons
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const logoutBtn = document.getElementById('logoutBtn');

    if (loginBtn) {
      loginBtn.addEventListener('click', () => this.showLoginModal());
    }

    if (registerBtn) {
      registerBtn.addEventListener('click', () => this.showRegisterModal());
    }

    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => this.logout());
    }

    // Modal events
    this.bindModalEvents();
  }

  // Bind modal events
  bindModalEvents() {
    const modalOverlay = document.getElementById('modalOverlay');
    const modalClose = document.getElementById('modalClose');

    if (modalClose) {
      modalClose.addEventListener('click', () => this.closeModal());
    }

    if (modalOverlay) {
      modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
          this.closeModal();
        }
      });

      // Close modal with Escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
          this.closeModal();
        }
      });
    }
  }

  // Show login modal
  showLoginModal() {
    const modalContent = `
      <div class="modal-header">
        <h2 class="modal-title">Login</h2>
        <p class="modal-subtitle">Entre na sua conta para acessar a liga</p>
      </div>
      <div class="modal-body">
        <form id="loginForm">
          <div class="form-group">
            <label for="loginEmail">Email:</label>
            <input type="email" id="loginEmail" name="email" required placeholder="seu@email.com">
            <span class="error-message" id="loginEmailError"></span>
          </div>

          <div class="form-group">
            <label for="loginPassword">Senha:</label>
            <input type="password" id="loginPassword" name="password" required placeholder="Sua senha">
            <span class="error-message" id="loginPasswordError"></span>
          </div>

          <div class="form-group checkbox-group">
            <input type="checkbox" id="rememberMe" name="rememberMe">
            <label for="rememberMe">Lembrar-me por 7 dias</label>
          </div>

          <button type="submit" class="btn btn-primary btn-large btn-block">
            <i class="fas fa-sign-in-alt"></i>
            Entrar
          </button>
        </form>

        <div class="form-divider">
          <span>ou</span>
        </div>

        <button type="button" class="btn btn-outline btn-large btn-block" id="forgotPasswordBtn">
          <i class="fas fa-key"></i>
          Esqueci minha senha
        </button>

        <div class="form-footer">
          <p>Não tem uma conta? <a href="#" id="showRegisterLink">Cadastre-se</a></p>
        </div>
      </div>
    `;

    this.showModal(modalContent);
    this.bindLoginEvents();
  }

  // Show register modal
  showRegisterModal() {
    const modalContent = `
      <div class="modal-header">
        <h2 class="modal-title">Criar Conta</h2>
        <p class="modal-subtitle">Cadastre-se para participar da Liga Pauperalho</p>
      </div>
      <div class="modal-body">
        <form id="registerForm">
          <div class="form-group">
            <label for="registerName">Nome Completo:</label>
            <input type="text" id="registerName" name="name" required placeholder="Seu nome completo">
            <span class="error-message" id="registerNameError"></span>
          </div>

          <div class="form-group">
            <label for="registerEmail">Email:</label>
            <input type="email" id="registerEmail" name="email" required placeholder="seu@email.com">
            <span class="error-message" id="registerEmailError"></span>
          </div>

          <div class="form-group">
            <label for="registerPassword">Senha:</label>
            <input type="password" id="registerPassword" name="password" required placeholder="Mínimo 8 caracteres">
            <span class="error-message" id="registerPasswordError"></span>
          </div>

          <div class="form-group">
            <label for="registerConfirmPassword">Confirmar Senha:</label>
            <input type="password" id="registerConfirmPassword" name="confirmPassword" required placeholder="Confirme sua senha">
            <span class="error-message" id="registerConfirmPasswordError"></span>
          </div>

          <div class="form-group checkbox-group">
            <input type="checkbox" id="agreeTerms" name="agreeTerms" required>
            <label for="agreeTerms">Li e concordo com os <a href="#rules" id="viewRulesLink">termos e regras</a> da liga</label>
            <span class="error-message" id="agreeTermsError"></span>
          </div>

          <button type="submit" class="btn btn-primary btn-large btn-block">
            <i class="fas fa-user-plus"></i>
            Criar Conta
          </button>
        </form>

        <div class="form-footer">
          <p>Já tem uma conta? <a href="#" id="showLoginLink">Faça login</a></p>
        </div>
      </div>
    `;

    this.showModal(modalContent);
    this.bindRegisterEvents();
  }

  // Show forgot password modal
  showForgotPasswordModal() {
    const modalContent = `
      <div class="modal-header">
        <h2 class="modal-title">Recuperar Senha</h2>
        <p class="modal-subtitle">Digite seu email para receber instruções de recuperação</p>
      </div>
      <div class="modal-body">
        <form id="forgotPasswordForm">
          <div class="form-group">
            <label for="forgotEmail">Email:</label>
            <input type="email" id="forgotEmail" name="email" required placeholder="seu@email.com">
            <span class="error-message" id="forgotEmailError"></span>
          </div>

          <button type="submit" class="btn btn-primary btn-large btn-block">
            <i class="fas fa-paper-plane"></i>
            Enviar Instruções
          </button>
        </form>

        <div class="form-footer">
          <p><a href="#" id="backToLoginLink">Voltar para login</a></p>
        </div>
      </div>
    `;

    this.showModal(modalContent);
    this.bindForgotPasswordEvents();
  }

  // Bind login form events
  bindLoginEvents() {
    const loginForm = document.getElementById('loginForm');
    const showRegisterLink = document.getElementById('showRegisterLink');
    const forgotPasswordBtn = document.getElementById('forgotPasswordBtn');

    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleLogin();
      });
    }

    if (showRegisterLink) {
      showRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.showRegisterModal();
      });
    }

    if (forgotPasswordBtn) {
      forgotPasswordBtn.addEventListener('click', () => this.showForgotPasswordModal());
    }
  }

  // Bind register form events
  bindRegisterEvents() {
    const registerForm = document.getElementById('registerForm');
    const showLoginLink = document.getElementById('showLoginLink');
    const viewRulesLink = document.getElementById('viewRulesLink');

    if (registerForm) {
      registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleRegister();
      });

      // Real-time validation
      const inputs = registerForm.querySelectorAll('input');
      inputs.forEach(input => {
        input.addEventListener('blur', () => this.validateField(input));
      });
    }

    if (showLoginLink) {
      showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.showLoginModal();
      });
    }

    if (viewRulesLink) {
      viewRulesLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.closeModal();
        // Navigate to rules section
        document.getElementById('rulesLink').click();
      });
    }
  }

  // Bind forgot password form events
  bindForgotPasswordEvents() {
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    const backToLoginLink = document.getElementById('backToLoginLink');

    if (forgotPasswordForm) {
      forgotPasswordForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleForgotPassword();
      });
    }

    if (backToLoginLink) {
      backToLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.showLoginModal();
      });
    }
  }

  // Validate form field
  validateField(field) {
    const value = field.value.trim();
    const errorElement = document.getElementById(field.id + 'Error');

    let isValid = true;
    let errorMessage = '';

    // Clear previous error
    if (errorElement) {
      errorElement.textContent = '';
    }
    field.parentElement.classList.remove('error', 'success');

    switch (field.type) {
      case 'email':
        if (!value) {
          errorMessage = 'Email é obrigatório';
          isValid = false;
        } else if (!Utils.validateEmail(value)) {
          errorMessage = 'Email inválido';
          isValid = false;
        }
        break;

      case 'password':
        if (field.id === 'registerPassword') {
          const validation = Utils.validatePassword(value);
          if (!validation.valid) {
            errorMessage = validation.message;
            isValid = false;
          }
        } else if (!value) {
          errorMessage = 'Senha é obrigatória';
          isValid = false;
        }
        break;

      case 'text':
        if (field.id === 'registerName' && !value) {
          errorMessage = 'Nome é obrigatório';
          isValid = false;
        }
        break;
    }

    // Check password confirmation
    if (field.id === 'registerConfirmPassword') {
      const password = document.getElementById('registerPassword').value;
      if (value !== password) {
        errorMessage = 'As senhas não conferem';
        isValid = false;
      }
    }

    if (errorElement) {
      errorElement.textContent = errorMessage;
    }

    field.parentElement.classList.add(isValid ? 'success' : 'error');

    return isValid;
  }

  // Handle login
  handleLogin() {
    const form = document.getElementById('loginForm');
    const formData = new FormData(form);

    const email = formData.get('email').trim();
    const password = formData.get('password');
    const rememberMe = formData.get('rememberMe') === 'on';

    // Validation
    let isValid = true;

    if (!Utils.validateEmail(email)) {
      this.showFieldError('loginEmail', 'Email inválido');
      isValid = false;
    }

    if (!password) {
      this.showFieldError('loginPassword', 'Senha é obrigatória');
      isValid = false;
    }

    if (!isValid) return;

    // Authenticate user
    const user = dataManager.getUserByEmail(email);

    if (!user) {
      this.showFieldError('loginEmail', 'Usuário não encontrado');
      return;
    }

    if (!user.isActive) {
      this.showFieldError('loginEmail', 'Conta desativada');
      return;
    }

    if (user.password !== Utils.hashPassword(password)) {
      this.showFieldError('loginPassword', 'Senha incorreta');
      return;
    }

    // Create session
    const session = dataManager.createSession(user.id, rememberMe);

    // Store session token
    if (rememberMe) {
      localStorage.setItem('ligaSessionToken', session.token);
    } else {
      sessionStorage.setItem('ligaSessionToken', session.token);
    }

    // Update current user
    this.currentUser = user;
    this.sessionToken = session.token;
    this.updateLastLogin();

    // Show success message
    this.showNotification('Login realizado com sucesso!', `Bem-vindo, ${user.name}`, 'success');

    // Close modal and update UI
    this.closeModal();
    this.updateUI();

    // Redirect to appropriate page
    this.redirectAfterLogin();
  }

  // Handle registration
  handleRegister() {
    const form = document.getElementById('registerForm');
    const formData = new FormData(form);

    const userData = {
      name: formData.get('name').trim(),
      email: formData.get('email').trim(),
      password: formData.get('password'),
      confirmPassword: formData.get('confirmPassword'),
      agreeTerms: formData.get('agreeTerms') === 'on'
    };

    // Validation
    let isValid = true;

    // Validate all fields
    const inputs = form.querySelectorAll('input');
    inputs.forEach(input => {
      if (!this.validateField(input)) {
        isValid = false;
      }
    });

    // Check if terms are agreed
    if (!userData.agreeTerms) {
      this.showFieldError('agreeTerms', 'Você deve concordar com os termos');
      isValid = false;
    }

    if (!isValid) return;

    // Check if email already exists
    if (dataManager.getUserByEmail(userData.email)) {
      this.showFieldError('registerEmail', 'Este email já está cadastrado');
      return;
    }

    try {
      // Create user
      const newUser = dataManager.createUser({
        name: userData.name,
        email: userData.email,
        password: userData.password
      });

      // Auto-login after registration
      const session = dataManager.createSession(newUser.id, false);
      sessionStorage.setItem('ligaSessionToken', session.token);

      this.currentUser = newUser;
      this.sessionToken = session.token;
      this.updateLastLogin();

      // Show success message
      this.showNotification('Conta criada com sucesso!', `Bem-vindo à Liga Pauperalho, ${newUser.name}`, 'success');

      // Create welcome notification
      dataManager.createNotification({
        title: 'Bem-vindo à Liga Pauperalho!',
        message: 'Sua conta foi criada com sucesso. Agora você pode se inscrever na liga e começar a jogar.',
        type: 'success',
        userId: newUser.id
      });

      // Close modal and update UI
      this.closeModal();
      this.updateUI();

      // Redirect to registration page
      this.redirectAfterRegistration();

    } catch (error) {
      this.showNotification('Erro ao criar conta', error.message, 'error');
    }
  }

  // Handle forgot password
  handleForgotPassword() {
    const form = document.getElementById('forgotPasswordForm');
    const formData = new FormData(form);

    const email = formData.get('email').trim();

    // Validation
    if (!Utils.validateEmail(email)) {
      this.showFieldError('forgotEmail', 'Email inválido');
      return;
    }

    // Check if user exists
    const user = dataManager.getUserByEmail(email);

    if (!user) {
      this.showFieldError('forgotEmail', 'Usuário não encontrado');
      return;
    }

    // In a real application, you would send an email here
    // For this demo, we'll show a success message
    this.showNotification('Instruções enviadas!', 'Verifique seu email para instruções de recuperação de senha', 'info');

    // Create recovery notification (simulated email)
    dataManager.createNotification({
      title: 'Recuperação de Senha',
      message: `Uma recuperação de senha foi solicitada para a conta ${email}. Em um ambiente real, você receberia um email com instruções.`,
      type: 'info',
      userId: user.id
    });

    // Close modal
    this.closeModal();
  }

  // Logout user
  logout() {
    if (this.sessionToken) {
      dataManager.removeSession(this.sessionToken);
    }

    // Clear session storage
    sessionStorage.removeItem('ligaSessionToken');
    localStorage.removeItem('ligaSessionToken');

    this.currentUser = null;
    this.sessionToken = null;

    this.showNotification('Logout realizado', 'Você saiu da sua conta com sucesso', 'info');
    this.updateUI();

    // Redirect to home
    if (window.location.hash !== '#home') {
      window.location.hash = '#home';
    }
  }

  // Update UI based on authentication state
  updateUI() {
    const authButtons = document.getElementById('authButtons');
    const userMenu = document.getElementById('userMenu');
    const userName = document.getElementById('userName');
    const userRole = document.getElementById('userRole');
    const adminLinks = document.querySelectorAll('.admin-only');

    if (this.currentUser) {
      // Show user menu
      if (authButtons) authButtons.style.display = 'none';
      if (userMenu) userMenu.style.display = 'flex';
      if (userName) userName.textContent = this.currentUser.profile.displayName || this.currentUser.name;
      if (userRole) userRole.textContent = this.currentUser.role === 'admin' ? 'Administrador' : 'Jogador';

      // Show admin links for admin users
      adminLinks.forEach(link => {
        link.style.display = this.currentUser.role === 'admin' ? 'flex' : 'none';
      });

    } else {
      // Show auth buttons
      if (authButtons) authButtons.style.display = 'flex';
      if (userMenu) userMenu.style.display = 'none';

      // Hide admin links
      adminLinks.forEach(link => {
        link.style.display = 'none';
      });
    }
  }

  // Redirect after login
  redirectAfterLogin() {
    // Check if user is registered in current league
    if (this.currentUser) {
      const registration = dataManager.getRegistration(this.currentUser.id);

      if (!registration) {
        // User not registered, go to registration
        window.location.hash = '#registration';
      } else {
        // User registered, go to rankings
        window.location.hash = '#rankings';
      }
    }
  }

  // Redirect after registration
  redirectAfterRegistration() {
    window.location.hash = '#registration';
  }

  // Show modal
  showModal(content) {
    const modalOverlay = document.getElementById('modalOverlay');
    const modalContent = document.getElementById('modalContent');

    if (modalContent) {
      modalContent.innerHTML = content;
    }

    if (modalOverlay) {
      modalOverlay.classList.add('active');
    }
  }

  // Close modal
  closeModal() {
    const modalOverlay = document.getElementById('modalOverlay');
    if (modalOverlay) {
      modalOverlay.classList.remove('active');
    }
  }

  // Show field error
  showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errorElement = document.getElementById(fieldId + 'Error');

    if (field) {
      field.parentElement.classList.add('error');
      field.parentElement.classList.remove('success');
    }

    if (errorElement) {
      errorElement.textContent = message;
    }
  }

  // Show notification
  showNotification(title, message, type = 'info') {
    const notificationContainer = document.getElementById('notificationContainer');

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <div class="notification-title">${title}</div>
        <div class="notification-message">${message}</div>
      </div>
      <button class="notification-close">
        <i class="fas fa-times"></i>
      </button>
    `;

    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
      notification.remove();
    });

    notificationContainer.appendChild(notification);

    // Trigger animation
    setTimeout(() => {
      notification.classList.add('show');
    }, 100);

    // Auto remove after 5 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
      }
    }, 5000);
  }

  // Check if user is authenticated
  isAuthenticated() {
    return this.currentUser !== null;
  }

  // Check if user is admin
  isAdmin() {
    return this.currentUser && this.currentUser.role === 'admin';
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser;
  }

  // Require authentication (redirect to login if not authenticated)
  requireAuth() {
    if (!this.isAuthenticated()) {
      this.showLoginModal();
      return false;
    }
    return true;
  }

  // Require admin role
  requireAdmin() {
    if (!this.isAuthenticated()) {
      this.showLoginModal();
      return false;
    }

    if (!this.isAdmin()) {
      this.showNotification('Acesso Negado', 'Você não tem permissão para acessar esta área', 'error');
      return false;
    }

    return true;
  }
}

// Create global instance
const authManager = new AuthManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AuthManager, authManager };
}