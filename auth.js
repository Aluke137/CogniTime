/**
 * Auth Module - Gerencia autenticação de usuários
 */
class AuthModule {
    constructor() {
        this.currentUser = null;
        this.loadUser();
    }

    /**
     * Carregar usuário salvo
     */
    loadUser() {
        const userJSON = localStorage.getItem('cognitime_user');
        if (userJSON) {
            try {
                this.currentUser = JSON.parse(userJSON);
            } catch (e) {
                console.error('Erro ao carregar usuário:', e);
                this.currentUser = null;
            }
        }
    }

    /**
     * Registrar novo usuário
     */
    register(email, password, name) {
        // Validação básica
        if (!email || !password || !name) {
            return { success: false, message: 'Preencha todos os campos' };
        }

        if (password.length < 6) {
            return { success: false, message: 'Senha deve ter no mínimo 6 caracteres' };
        }

        if (!this.isValidEmail(email)) {
            return { success: false, message: 'Email inválido' };
        }

        // Verificar se usuário já existe
        const users = this.getAllUsers();
        if (users.find(u => u.email === email)) {
            return { success: false, message: 'Este email já está registrado' };
        }

        // Criar novo usuário
        const newUser = {
            id: Date.now(),
            email,
            password: this.hashPassword(password),
            name,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString()
        };

        // Salvar usuário
        users.push(newUser);
        localStorage.setItem('cognitime_users', JSON.stringify(users));

        // Fazer login automático
        this.currentUser = {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name
        };
        this.saveCurrentUser();

        return { success: true, message: 'Usuário registrado com sucesso!' };
    }

    /**
     * Login de usuário
     */
    login(email, password) {
        // Validação
        if (!email || !password) {
            return { success: false, message: 'Preencha email e senha' };
        }

        // Buscar usuário
        const users = this.getAllUsers();
        const user = users.find(u => u.email === email);

        if (!user) {
            return { success: false, message: 'Email ou senha incorretos' };
        }

        // Verificar senha
        if (user.password !== this.hashPassword(password)) {
            return { success: false, message: 'Email ou senha incorretos' };
        }

        // Atualizar último login
        user.lastLogin = new Date().toISOString();
        localStorage.setItem('cognitime_users', JSON.stringify(users));

        // Fazer login
        this.currentUser = {
            id: user.id,
            email: user.email,
            name: user.name
        };
        this.saveCurrentUser();

        return { success: true, message: 'Login realizado com sucesso!' };
    }

    /**
     * Logout
     */
    logout() {
        this.currentUser = null;
        localStorage.removeItem('cognitime_user');
        localStorage.removeItem('cognitime_sessions');
        localStorage.removeItem('cognitime_materials');
        localStorage.removeItem('cognitime_quizzes');
        localStorage.removeItem('cognitime_quiz_attempts');
        localStorage.removeItem('cognitime_flashcards');
        localStorage.removeItem('cognitime_review_schedule');
    }

    /**
     * Salvar usuário atual
     */
    saveCurrentUser() {
        if (this.currentUser) {
            localStorage.setItem('cognitime_user', JSON.stringify(this.currentUser));
        }
    }

    /**
     * Obter usuário atual
     */
    getCurrentUser() {
        return this.currentUser;
    }

    /**
     * Verificar se está autenticado
     */
    isAuthenticated() {
        return this.currentUser !== null;
    }

    /**
     * Obter todos os usuários
     */
    getAllUsers() {
        const usersJSON = localStorage.getItem('cognitime_users');
        if (usersJSON) {
            try {
                return JSON.parse(usersJSON);
            } catch (e) {
                return [];
            }
        }
        return [];
    }

    /**
     * Hash simples de senha (para demonstração - usar bcrypt em produção)
     */
    hashPassword(password) {
        // Implementação simples - em produção usar bcrypt
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return 'hash_' + Math.abs(hash).toString(16);
    }

    /**
     * Validar email
     */
    isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    /**
     * Atualizar perfil
     */
    updateProfile(name, email) {
        if (!this.currentUser) return false;

        const users = this.getAllUsers();
        const userIndex = users.findIndex(u => u.id === this.currentUser.id);

        if (userIndex !== -1) {
            users[userIndex].name = name;
            users[userIndex].email = email;
            localStorage.setItem('cognitime_users', JSON.stringify(users));

            this.currentUser.name = name;
            this.currentUser.email = email;
            this.saveCurrentUser();

            return true;
        }

        return false;
    }

    /**
     * Alterar senha
     */
    changePassword(oldPassword, newPassword) {
        if (!this.currentUser) return { success: false, message: 'Não autenticado' };

        const users = this.getAllUsers();
        const user = users.find(u => u.id === this.currentUser.id);

        if (!user) return { success: false, message: 'Usuário não encontrado' };

        if (user.password !== this.hashPassword(oldPassword)) {
            return { success: false, message: 'Senha atual incorreta' };
        }

        if (newPassword.length < 6) {
            return { success: false, message: 'Nova senha deve ter no mínimo 6 caracteres' };
        }

        user.password = this.hashPassword(newPassword);
        localStorage.setItem('cognitime_users', JSON.stringify(users));

        return { success: true, message: 'Senha alterada com sucesso!' };
    }
}

// Instância global
const auth = new AuthModule();
