# 🎉 Sistema de Notificações (Toasts) Bonitinho

Agora sua aplicação tem **toasts modernos e bonitos** ao invés dos alerts feios do navegador!

## ✨ Características

- 🎨 **Design moderno** - Combina perfeitamente com o tema escuro
- ⚡ **Animações suaves** - Aparece/desaparece suavemente
- ⏱️ **Auto-ocultação** - Desaparece automaticamente após 5 segundos
- 🎯 **4 tipos** - Success, Error, Warning, Info
- 🔄 **Barra de progresso** - Mostra quanto tempo falta para desaparecer
- ❌ **Fechar manual** - Botão para fechar antecipadamente
- 📱 **Responsivo** - Funciona em todos os dispositivos

## 🚀 Como Usar

### Importar o hook
```typescript
import { useToast } from '../hooks/useToast';

const MeuComponente = () => {
  const { success, error, warning, info } = useToast();
```

### Mostrar notificações
```typescript
// Sucesso
success('Cadastro realizado!', 'Bem-vindo à nossa comunidade!');

// Erro
error('Erro no cadastro', 'Verifique os dados e tente novamente.');

// Aviso
warning('Atenção', 'Este email já está cadastrado.');

// Informação
info('Dica', 'Preencha todos os campos obrigatórios.');
```

### Com ações (opcional)
```typescript
success('Cadastro realizado!', 'Clique aqui para ver detalhes.', {
  label: 'Ver detalhes',
  onClick: () => navigate('/perfil')
});
```

## 🎨 Aparência

### Success (Verde)
- ✅ Ícone de sucesso
- Fundo verde gradiente
- Perfeito para confirmações

### Error (Vermelho)
- ❌ Ícone de erro
- Fundo vermelho gradiente
- Ideal para erros

### Warning (Amarelo)
- ⚠️ Ícone de aviso
- Fundo amarelo gradiente
- Para alertas importantes

### Info (Azul)
- ℹ️ Ícone de informação
- Fundo azul gradiente
- Para dicas e informações

## 🔧 Personalização

### Duração customizada
```typescript
success('Mensagem', 'Texto', { duration: 10000 }); // 10 segundos
```

### Sem auto-ocultação
```typescript
success('Mensagem', 'Texto', { duration: 0 }); // Não some automaticamente
```

## 🏗️ Arquitetura

- **`useToast()`** - Hook principal para mostrar toasts
- **`useToastListener()`** - Hook interno para ouvir eventos
- **`ToastContainer`** - Componente que gerencia todos os toasts
- **Eventos customizados** - Comunicação entre componentes

## 📍 Onde está integrado

✅ **RegistrationPage** - Mostra sucesso/erro no cadastro
✅ **AdminPanel** - Pode ser usado para notificações admin
✅ **Qualquer componente** - Basta importar o hook

## 🎯 Exemplo Completo

### **Uso Básico:**
```typescript
import { useToast } from '../hooks/useToast';

const MeuComponente = () => {
  const { success, error } = useToast();

  const handleSubmit = async () => {
    try {
      await apiCall();
      success('Sucesso!', 'Operação realizada com sucesso.');
    } catch (err) {
      error('Erro', 'Algo deu errado. Tente novamente.');
    }
  };

  return (
    <button onClick={handleSubmit}>
      Executar
    </button>
  );
};
```

### **Uso Avançado (com opções):**
```typescript
import { useToast } from '../hooks/useToast';

const MeuComponente = () => {
  const { showToast } = useToast();

  const handleMBWay = () => {
    showToast({
      type: 'info',
      title: 'MB WAY',
      message: 'Tentando abrir o app automaticamente...',
      duration: 3000, // 3 segundos
      action: {
        label: 'Ver ajuda',
        onClick: () => console.log('Ajuda clicada!')
      }
    });
  };

  return (
    <button onClick={handleMBWay}>
      Pagar com MB WAY
    </button>
  );
};
```

## 📍 **Onde está sendo usado:**

### ✅ **RegistrationPage**
- ✅ **Sucesso**: "Cadastro realizado! Entraremos em contato em breve."
- ✅ **Erro**: Tratamento específico de diferentes tipos de erro

### ✅ **VerseSection (MB WAY)**
- ✅ **Inicial**: "Tentando abrir o app automaticamente..." (3s)
- ✅ **Número copiado**: "965169925 está na área de transferência."
- ✅ **Fallback**: "MB WAY não abriu? Abra o app manualmente..."
- ✅ **Instruções completas**: Botão para ver instruções detalhadas

### ✅ **AdminPanel** (pronto para uso)
- 🎯 Pode ser usado para notificações de administração

## 🎨 **Experiência do Usuário:**

### **Antes (alert feio):**
```javascript
alert(`📱 MB WAY não abriu automaticamente?
✅ Número 965169925 já foi copiado!
🔄 Instruções: 1. Abra o app MB WAY manualmente...`);
```

### **Agora (toast bonitinho):**
- 🎨 **Toast inicial**: "Tentando abrir o app..." (3 segundos)
- ✅ **Toast de sucesso**: "Número copiado! 965169925 está na área..."
- ℹ️ **Toast informativo**: "MB WAY não abriu? Abra o app manualmente..."
- 🎯 **Botão de ação**: "Ver instruções" para detalhes completos

---

**Agora suas notificações são bonitinhas e profissionais! 🎨✨**

**Quer testar?** Clique no botão "Pagar com MB WAY" na página principal! 🔔💳
