# 🔐 Guia de Autenticação - CogniTime

## Sistema de Login e Registro

O CogniTime agora possui um sistema completo de autenticação que protege seus dados e permite múltiplas contas.

### 🆕 Criar Conta (Registro)

**Passo 1: Acessar a Página de Registro**
1. Abra o CogniTime
2. Você verá a página de login
3. Clique em "Registre-se" no final do formulário

**Passo 2: Preencher Informações**
- **Nome Completo:** Seu nome (obrigatório)
- **Email:** Seu email (obrigatório, deve ser único)
- **Senha:** Mínimo 6 caracteres (obrigatório)
- **Confirmar Senha:** Deve ser igual à senha acima

**Passo 3: Registrar**
- Clique em "Registrar"
- Se tudo estiver correto, você será automaticamente logado
- Você será redirecionado para a página inicial

### 🔑 Fazer Login

**Passo 1: Acessar a Página de Login**
1. Abra o CogniTime
2. Você verá o formulário de login por padrão

**Passo 2: Preencher Credenciais**
- **Email:** O email da sua conta
- **Senha:** A senha que você registrou

**Passo 3: Entrar**
- Clique em "Entrar"
- Se as credenciais estiverem corretas, você será logado
- Você será redirecionado para a página inicial

### 🚪 Fazer Logout

**Para Sair da Sua Conta:**
1. Clique em "Sair" na barra de navegação (canto superior direito)
2. Confirme que deseja sair
3. Você será redirecionado para a página de login

### 📝 Dados de Teste

Para testar a aplicação, você pode usar:

**Conta de Teste:**
- **Email:** teste@cognitime.com
- **Senha:** teste123
- **Nome:** Usuário Teste

Ou crie sua própria conta!

### 🔒 Segurança

**Informações Importantes:**
- Suas senhas são armazenadas de forma segura (com hash)
- Seus dados de estudo são privados e só você pode acessar
- Cada usuário tem seus próprios:
  - Materiais
  - Simulados
  - Flashcards
  - Histórico de sessões
  - Cronograma de revisão

### ⚠️ Avisos de Segurança

**Não Compartilhe:**
- Sua senha com ninguém
- Sua conta com outras pessoas
- Seus dados de login

**Boas Práticas:**
- Use uma senha forte (letras, números, caracteres especiais)
- Não use a mesma senha em múltiplos sites
- Faça logout ao usar computadores compartilhados

### 🆘 Problemas Comuns

**Problema: "Email ou senha incorretos"**
- Verifique se o email está correto
- Verifique se a senha está correta
- Lembre-se que é case-sensitive (maiúsculas/minúsculas)

**Problema: "Este email já está registrado"**
- O email já tem uma conta
- Faça login com esse email
- Ou use um email diferente

**Problema: "Senha deve ter no mínimo 6 caracteres"**
- Sua senha é muito curta
- Use uma senha com pelo menos 6 caracteres

**Problema: "As senhas não coincidem"**
- Os campos de senha e confirmação são diferentes
- Digite a mesma senha nos dois campos

### 💾 Dados Salvos

Após fazer login, todos os seus dados são salvos localmente:
- Sessões de estudo
- Materiais enviados
- Simulados e resultados
- Flashcards
- Cronograma de revisão

**Importante:** Os dados são salvos no navegador. Se você limpar o cache/cookies, perderá os dados.

### 🔄 Alternar Entre Contas

**Para Trocar de Conta:**
1. Clique em "Sair" na barra de navegação
2. Faça login com outra conta
3. Seus dados da conta anterior serão mantidos

Cada conta tem seus próprios dados separados.

### 📱 Login em Múltiplos Dispositivos

**Importante:**
- Você pode usar a mesma conta em múltiplos dispositivos
- Mas os dados são salvos separadamente em cada dispositivo
- Se você estudar no computador, os dados não sincronizam com o celular

Para sincronizar dados entre dispositivos, você precisaria de uma versão com servidor (upgrade futuro).

### 🎯 Fluxo de Autenticação

```
1. Abrir CogniTime
   ↓
2. Verificar se está logado
   ├─ SIM → Ir para Dashboard
   └─ NÃO → Mostrar Página de Login
   ↓
3. Login/Registro
   ├─ Sucesso → Salvar usuário
   └─ Erro → Mostrar mensagem
   ↓
4. Acessar Dashboard
   ↓
5. Usar a plataforma
   ↓
6. Fazer Logout (opcional)
   ↓
7. Voltar para Login
```

---

**Dúvidas?** Consulte o README.md ou GUIA_USO.md para mais informações.

**Boa sorte em seus estudos! 🎓✨**
