/**
 * CyberGuard - TCC Refatorado (2026)
 * Script Principal - script.js
 */

// ==========================================================================
// CONFIGURAÇÕES GLOBAIS E CONSTANTES
// ==========================================================================
const CONTACT_WHATSAPP = "5516993080408"; // WhatsApp que recebe o formulário: (16) 99308-0408
const CONTACT_EMAIL = "victor.cunha5@aluno.cps.sp.gov.br";
const GITHUB_URL = "SEU_USUARIO"; // Preencha com seu usuário do GitHub

const VAULT_STORAGE_KEY = "cyberguard_vault_v2"; // Chave atualizada para nova estrutura
const CHECK_PHRASE = "cyberguard-vault-check";
const PBKDF2_ITERATIONS = 600000;

// Lista de palavras para o Modo Frase (200+ palavras)
const WORDLIST = [
    "abacate", "abacaxi", "aberto", "abraço", "acesso", "acordo", "açúcar", "agora", "água", "ajuda", 
    "alerta", "algum", "aliado", "amarelo", "amigo", "amor", "amplo", "andar", "anjo", "ano", 
    "antigo", "apenas", "apoio", "aqui", "arroz", "arte", "árvore", "asa", "astro", "ativo", 
    "autor", "aviso", "azul", "bala", "banco", "banda", "barco", "barro", "base", "bater", 
    "beber", "beijo", "belo", "bicho", "bico", "biscoito", "bola", "bolo", "bom", "borda", 
    "braço", "branco", "brasil", "brilho", "brisa", "broto", "buraco", "busca", "cabelo", "cabo", 
    "caixa", "caju", "calma", "cama", "caminho", "camisa", "campo", "canal", "caneta", "canto", 
    "capa", "carro", "carta", "casa", "caso", "cego", "cena", "centro", "certo", "céu", 
    "chave", "cheio", "cheque", "chute", "ciclo", "cidade", "cinco", "cinza", "claro", "clima", 
    "cobre", "código", "cofre", "coisa", "colar", "comer", "comum", "conta", "copo", "cores", 
    "corpo", "corte", "cozinha", "cravo", "crime", "cruz", "cubo", "curso", "curto", "dado", 
    "dano", "data", "dedo", "dente", "dentro", "deus", "dia", "dica", "doce", "dois", 
    "dono", "dourado", "dúvida", "eco", "tela", "eixo", "ele", "ema", "rede", "tecla", 
    "erro", "escala", "escola", "espaço", "espelho", "estado", "este", "exame", "exato", "faca", 
    "falar", "falso", "fama", "fase", "fato", "favor", "fazer", "feio", "feliz", "ferro", 
    "festa", "ficar", "filho", "filme", "fio", "fogo", "folha", "fonte", "fora", "forma", 
    "forte", "foto", "frase", "frio", "fruta", "fuga", "fundo", "furto", "gado", "galo", 
    "ganho", "garfo", "gato", "gelo", "geral", "gigante", "giro", "golpe", "goma", "gota", 
    "gozo", "grau", "guia", "hora", "hoje", "hino", "ilha", "imagem", "ímã", "índice"
];

let vaultState = {
    activeKey: null,
    items: [],
    failedAttempts: 0,
    lockUntil: 0,
    render: null,
    inactivityTimer: null
};

let activeUrlAnalysisSession = null;

// ==========================================================================
// INICIALIZAÇÃO
// ==========================================================================
// Tela de carregamento com a logo (somente na Home, uma vez por sessão)
initSplashScreen();

document.addEventListener("DOMContentLoaded", () => {
    initNav();
    initActiveNav();
    initScrollReveal();
    initBackToTop();
    initTyping();
    initClock();
    initCounters();
    initChecklist();
    initUrlChecker();
    initQuiz();
    initPasswordTools();
    initPasswordToggles();
    initVault();
    initMatrixLock();
    initContactForm();
    initHeaderLogoScroll();
    initCardCarousels();
    initAccordions();
    initBinaryRain();
    initScrollProgress();
    initCardSpotlight();
    setupAutoLock();
});

// ==========================================================================
// UTILITÁRIOS GLOBAIS E NAVEGAÇÃO
// ==========================================================================
function initActiveNav() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const navItems = document.querySelectorAll('.bottom-nav__item, .nav__links a, .footer__links a');
    
    navItems.forEach(item => {
        const href = item.getAttribute('href');
        if (!href) return;
        const pageName = href.split('/').pop();
        if (pageName === currentPath || (currentPath === '' && pageName === 'index.html')) {
            item.classList.add('active');
            item.setAttribute('aria-current', 'page');
        } else {
            item.classList.remove('active');
            item.removeAttribute('aria-current');
        }
    });
}

function initNav() {
    const toggle = document.getElementById('nav-toggle');
    const links = document.getElementById('nav-links');
    if (!toggle || !links) return;
    toggle.addEventListener('click', () => {
        const isOpen = links.classList.contains('is-open');
        links.classList.toggle('is-open', !isOpen);
        toggle.setAttribute('aria-expanded', !isOpen);
    });
}

function initScrollReveal() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const elements = document.querySelectorAll('.hidden-scroll');
    if (!elements.length) return;

    document.documentElement.classList.add('js');
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-in');
                entry.target.classList.remove('is-out-top');
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

    elements.forEach(el => observer.observe(el));
}

function initBackToTop() {
    const btnTop = document.getElementById('btn-top');
    if (!btnTop) return;
    window.addEventListener('scroll', () => {
        btnTop.classList.toggle('is-visible', window.scrollY > 400);
    });
    btnTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

function initHeaderLogoScroll() {
    const headerLogo = document.getElementById('header-scroll-logo');
    if (!headerLogo || !document.body.classList.contains('page-home')) return;
    window.addEventListener('scroll', () => {
        headerLogo.classList.toggle('is-visible', window.scrollY > 150);
    });
}

function initPasswordToggles() {
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-toggle-pass');
        if (!btn) return;
        const targetId = btn.getAttribute('data-target');
        const input = document.getElementById(targetId);
        if (!input) return;
        const isPass = input.type === 'password';
        input.type = isPass ? 'text' : 'password';
    });
}

function escapeHtml(str) {
    if (!str) return "";
    return String(str).replace(/[&<>"']/g, m => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
    })[m]);
}

function showToast(msg, type = "info") {
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.style.cssText = "position:fixed;bottom:calc(92px + env(safe-area-inset-bottom, 0px));right:16px;left:16px;max-width:420px;margin-left:auto;z-index:9999;display:flex;flex-direction:column;gap:10px;";
        document.body.appendChild(toastContainer);
    }
    const toast = document.createElement('div');
    toast.className = `alert alert-${type} shadow-md`;
    toast.style.cssText = "margin:0;padding:12px 20px;animation:slideUp 0.3s ease-out;";
    toast.innerHTML = escapeHtml(msg);
    toastContainer.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ==========================================================================
// WEB CRYPTO API
// ==========================================================================
const cryptoUtils = {
    encoder: new TextEncoder(),
    decoder: new TextDecoder(),
    arrayBufferToBase64(buffer) {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
        return window.btoa(binary);
    },
    base64ToArrayBuffer(base64) {
        const binary = window.atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        return bytes.buffer;
    },
    generateSalt(bytes = 16) { return window.crypto.getRandomValues(new Uint8Array(bytes)); },
    generateIV(bytes = 12) { return window.crypto.getRandomValues(new Uint8Array(bytes)); },
    async deriveKey(masterPassword, salt) {
        const keyMaterial = await window.crypto.subtle.importKey(
            "raw", this.encoder.encode(masterPassword), { name: "PBKDF2" }, false, ["deriveKey"]
        );
        return window.crypto.subtle.deriveKey(
            { name: "PBKDF2", salt: salt, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
            keyMaterial, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]
        );
    },
    async encryptData(dataObject, cryptoKey) {
        const iv = this.generateIV(12);
        const encodedData = this.encoder.encode(JSON.stringify(dataObject));
        const encryptedBuffer = await window.crypto.subtle.encrypt({ name: "AES-GCM", iv: iv }, cryptoKey, encodedData);
        return { iv: this.arrayBufferToBase64(iv), cipher: this.arrayBufferToBase64(encryptedBuffer) };
    },
    async decryptData(cipherBase64, ivBase64, cryptoKey) {
        const encryptedBuffer = this.base64ToArrayBuffer(cipherBase64);
        const ivBuffer = this.base64ToArrayBuffer(ivBase64);
        const decryptedBuffer = await window.crypto.subtle.decrypt({ name: "AES-GCM", iv: new Uint8Array(ivBuffer) }, cryptoKey, encryptedBuffer);
        return JSON.parse(this.decoder.decode(decryptedBuffer));
    },
    getSecureRandomChar(chars) {
        const limit = 256 - (256 % chars.length);
        const array = new Uint8Array(1);
        while (true) {
            window.crypto.getRandomValues(array);
            if (array[0] < limit) return chars[array[0] % chars.length];
        }
    }
};

// ==========================================================================
// BANCO DE DADOS LOCAL DO COFRE (IndexedDB)
// Banco "cyberguard_db" no próprio navegador, com duas tabelas:
//   - meta  : salt + verificação da senha mestre (nunca guarda a senha)
//   - items : um registro CIFRADO (AES-GCM) por senha salva
// Se o navegador não tiver IndexedDB, usa localStorage como reserva.
// ==========================================================================
const CG_DB_NAME = "cyberguard_db";
const CG_DB_VERSION = 1;
const CG_STORE_META = "meta";
const CG_STORE_ITEMS = "items";

const vaultStorage = {
    cache: null,
    backend: "none",
    db: null,
    _initPromise: null,

    init() {
        if (this._initPromise) return this._initPromise;
        this._initPromise = (async () => {
            try {
                this.db = await this._openDb();
                this.backend = "indexeddb";
                const meta = await this._idbGet(CG_STORE_META, "vault");
                if (meta) {
                    const records = await this._idbGetAll(CG_STORE_ITEMS);
                    this.cache = this._normalize({ salt: meta.salt, check: meta.check, items: records, itemsData: meta.legacyItemsData });
                } else {
                    const old = this._readLocal();
                    if (old) {
                        this.cache = this._normalize(old);
                        await this._persistAll();
                        try { localStorage.removeItem(VAULT_STORAGE_KEY); } catch {}
                    }
                }
            } catch (err) {
                this.db = null;
                this.backend = "localstorage";
                const old = this._readLocal();
                this.cache = old ? this._normalize(old) : null;
            }
        })();
        return this._initPromise;
    },

    _openDb() {
        return new Promise((resolve, reject) => {
            if (!window.indexedDB) return reject(new Error("IndexedDB indisponível"));
            const req = indexedDB.open(CG_DB_NAME, CG_DB_VERSION);
            req.onupgradeneeded = () => {
                const db = req.result;
                if (!db.objectStoreNames.contains(CG_STORE_META)) db.createObjectStore(CG_STORE_META, { keyPath: "key" });
                if (!db.objectStoreNames.contains(CG_STORE_ITEMS)) db.createObjectStore(CG_STORE_ITEMS, { keyPath: "id" });
            };
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
            req.onblocked = () => reject(new Error("Banco bloqueado"));
        });
    },

    _idbGet(store, key) {
        return new Promise((resolve, reject) => {
            const req = this.db.transaction(store, "readonly").objectStore(store).get(key);
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
    },

    _idbGetAll(store) {
        return new Promise((resolve, reject) => {
            const req = this.db.transaction(store, "readonly").objectStore(store).getAll();
            req.onsuccess = () => resolve(req.result || []);
            req.onerror = () => reject(req.error);
        });
    },

    _readLocal() {
        try {
            const raw = localStorage.getItem(VAULT_STORAGE_KEY);
            const parsed = raw ? JSON.parse(raw) : null;
            return parsed && parsed.salt && parsed.check ? parsed : null;
        } catch { return null; }
    },

    _normalize(raw) {
        return {
            version: 3,
            salt: raw.salt,
            check: raw.check,
            items: Array.isArray(raw.items) ? raw.items.filter(r => r && r.id && r.iv && r.cipher).map(r => ({ id: r.id, iv: r.iv, cipher: r.cipher })) : [],
            legacyItemsData: raw.itemsData || raw.legacyItemsData || null
        };
    },

    async _persistAll() {
        const c = this.cache;
        if (this.backend === "indexeddb" && this.db) {
            await new Promise((resolve, reject) => {
                const tx = this.db.transaction([CG_STORE_META, CG_STORE_ITEMS], "readwrite");
                const meta = tx.objectStore(CG_STORE_META);
                const items = tx.objectStore(CG_STORE_ITEMS);
                if (c) {
                    meta.put({ key: "vault", salt: c.salt, check: c.check, legacyItemsData: c.legacyItemsData || null });
                    items.clear();
                    c.items.forEach(r => items.put(r));
                } else {
                    meta.clear();
                    items.clear();
                }
                tx.oncomplete = () => resolve();
                tx.onerror = () => reject(tx.error);
                tx.onabort = () => reject(tx.error);
            });
        } else {
            try {
                if (c) localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(this.getRawVault()));
                else localStorage.removeItem(VAULT_STORAGE_KEY);
            } catch { showToast("Erro ao salvar no armazenamento local.", "danger"); }
        }
    },

    // Formato usado no backup (.json)
    getRawVault() {
        if (!this.cache) return null;
        const out = { version: 3, salt: this.cache.salt, check: this.cache.check, items: this.cache.items };
        if (this.cache.legacyItemsData) out.itemsData = this.cache.legacyItemsData;
        return out;
    },

    hasLegacyData() { return !!(this.cache && this.cache.legacyItemsData); },

    async createVault({ salt, check }) {
        this.cache = this._normalize({ salt, check, items: [] });
        await this._persistAll();
    },

    async loadItems(key) {
        if (!this.cache) return [];
        if (this.cache.legacyItemsData) {
            const legacy = this.cache.legacyItemsData;
            return (await cryptoUtils.decryptData(legacy.cipher, legacy.iv, key)) || [];
        }
        const items = [];
        for (const rec of this.cache.items) {
            try { items.push(await cryptoUtils.decryptData(rec.cipher, rec.iv, key)); }
            catch { /* registro corrompido é ignorado */ }
        }
        return items;
    },

    async replaceItems(records) {
        if (!this.cache) return;
        this.cache.items = records;
        this.cache.legacyItemsData = null;
        await this._persistAll();
    },

    async importRaw(parsed) {
        this.cache = this._normalize(parsed);
        await this._persistAll();
    },

    async clearVault() {
        this.cache = null;
        vaultState.activeKey = null;
        vaultState.items = [];
        try { localStorage.removeItem(VAULT_STORAGE_KEY); } catch {}
        await this._persistAll();
    },

    describe() {
        return {
            backend: this.backend,
            count: this.cache ? (this.cache.legacyItemsData ? vaultState.items.length : this.cache.items.length) : 0
        };
    }
};

// ==========================================================================
// TELA DE BLOQUEIO (MATRIX) E ACESSO AO COFRE
// ==========================================================================
function initMatrixEffect() {
    const canvas = document.getElementById("matrix-canvas");
    if (!canvas) return null;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    resize();
    window.addEventListener("resize", resize);

    const chars = "01";
    const fontSize = 16;
    let drops = Array(Math.floor(canvas.width / fontSize)).fill(0).map(() => Math.floor(Math.random() * -100));

    function draw() {
        ctx.fillStyle = "rgba(2, 6, 23, 0.15)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#38bdf8";
        ctx.font = `${fontSize}px monospace`;

        for (let i = 0; i < drops.length; i++) {
            const char = chars.charAt(Math.floor(Math.random() * chars.length));
            ctx.fillText(char, i * fontSize, drops[i] * fontSize);
            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
            drops[i]++;
        }
        animationFrameId = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(animationFrameId);
}

function setupAutoLock() {
    function reset() {
        if (!vaultState.activeKey) return;
        clearTimeout(vaultState.inactivityTimer);
        vaultState.inactivityTimer = setTimeout(() => {
            vaultState.activeKey = null;
            vaultState.items = [];
            location.reload();
        }, 5 * 60 * 1000); // 5 minutos
    }
    window.addEventListener('mousemove', reset);
    window.addEventListener('keydown', reset);
    window.addEventListener('scroll', reset);
    window.addEventListener('click', reset);
}

function initMatrixLock() {
    if (!document.getElementById("matrix-lock-screen")) return;
    vaultStorage.init().then(setupMatrixLock);
}

function setupMatrixLock() {
    const lockScreen = document.getElementById("matrix-lock-screen");
    const loginForm = document.getElementById("matrix-vault-form");
    const masterInput = document.getElementById("matrix-master-pass");
    const confirmGroup = document.getElementById("matrix-confirm-group");
    const confirmInput = document.getElementById("matrix-master-confirm");
    const errorArea = document.getElementById("matrix-error-area");
    const purgeBtn = document.getElementById("btn-matrix-purge");
    const titleEl = document.getElementById("matrix-title");
    const btnSubmit = document.getElementById("btn-matrix-unlock");

    if (!lockScreen || !loginForm) return;

    let stopAnimation = initMatrixEffect();
    let isFirstAccess = !vaultStorage.getRawVault();

    if (isFirstAccess) {
        if(titleEl) titleEl.textContent = "CRIAR SENHA MESTRE";
        if(confirmGroup) confirmGroup.classList.remove("hidden");
        if(confirmInput) confirmInput.setAttribute("required", "true");
        if(btnSubmit) btnSubmit.textContent = "Criar e Criptografar Cofre";
        const warn = document.querySelector(".matrix-warning-text");
        if(warn) warn.innerHTML = "<strong>ATENÇÃO:</strong> Esta senha não pode ser recuperada se for esquecida. Use no mínimo 8 caracteres.";
    }

    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        if (Date.now() < vaultState.lockUntil) {
            const left = Math.ceil((vaultState.lockUntil - Date.now()) / 1000);
            showError(`Muitas tentativas. Aguarde ${left} segundos.`);
            return;
        }

        const password = masterInput.value.trim();
        if (password.length < 8) {
            showError("A senha mestre deve ter pelo menos 8 caracteres.");
            return;
        }

        const originalBtnText = btnSubmit.textContent;
        btnSubmit.textContent = "Processando...";
        btnSubmit.disabled = true;

        try {
            if (isFirstAccess) {
                if (password !== confirmInput.value.trim()) {
                    throw new Error("As senhas não coincidem.");
                }
                const salt = cryptoUtils.generateSalt();
                const key = await cryptoUtils.deriveKey(password, salt);
                const checkData = await cryptoUtils.encryptData({ phrase: CHECK_PHRASE }, key);
                
                await vaultStorage.createVault({
                    salt: cryptoUtils.arrayBufferToBase64(salt),
                    check: checkData
                });
                vaultState.activeKey = key;
                vaultState.items = [];
            } else {
                const rawVault = vaultStorage.getRawVault();
                const salt = cryptoUtils.base64ToArrayBuffer(rawVault.salt);
                const key = await cryptoUtils.deriveKey(password, salt);
                
                try {
                    const decryptedCheck = await cryptoUtils.decryptData(rawVault.check.cipher, rawVault.check.iv, key);
                    if (decryptedCheck.phrase !== CHECK_PHRASE) throw new Error("Chave inválida");
                } catch {
                    throw new Error("Senha Mestre incorreta.");
                }
                
                vaultState.activeKey = key;
                vaultState.items = await vaultStorage.loadItems(key);
                // Cofre antigo (localStorage): migra para o banco novo, item por item
                if (vaultStorage.hasLegacyData()) await persistVaultItems();
            }

            vaultState.failedAttempts = 0;
            lockScreen.classList.add("hidden");
            if (stopAnimation) stopAnimation();
            document.getElementById("vault-state-unlocked")?.classList.remove("hidden");
            if (vaultState.render) vaultState.render();

        } catch (err) {
            vaultState.failedAttempts++;
            if (vaultState.failedAttempts >= 5) {
                vaultState.lockUntil = Date.now() + (vaultState.failedAttempts * 5000);
            }
            showError(err.message);
        } finally {
            btnSubmit.textContent = originalBtnText;
            btnSubmit.disabled = false;
        }
    });

    function showError(msg) {
        if (errorArea) {
            errorArea.textContent = msg;
            errorArea.classList.remove("hidden");
        }
    }

    if (purgeBtn) {
        purgeBtn.addEventListener("click", () => {
            if (confirm("ATENÇÃO: Deseja realmente apagar TODOS os dados do cofre? Isso não pode ser desfeito.")) {
                vaultStorage.clearVault().then(() => location.reload());
            }
        });
    }
}

// ==========================================================================
// GERENCIAMENTO DO COFRE & UI
// ==========================================================================
function initVault() {
    const searchInput = document.getElementById("vault-search-input");
    const filterCat = document.getElementById("vault-filter-category");
    const btnLockNow = document.getElementById("btn-lock-vault-now");
    const btnPurgeUnlocked = document.getElementById("btn-purge-unlocked");
    const btnAddModal = document.getElementById("btn-open-add-modal");
    const btnAddFirst = document.getElementById("btn-add-first-item");
    const btnExport = document.getElementById("btn-export-backup");
    const inputImport = document.getElementById("import-backup-file");
    
    // Configura o Modal
    const modal = document.getElementById("vault-modal");
    const modalForm = document.getElementById("vault-modal-form");
    const btnCloseModal = document.getElementById("btn-close-modal");
    
    let currentEditId = null;

    vaultState.render = function() {
        const grid = document.getElementById("vault-grid-list");
        const emptyState = document.getElementById("vault-empty-state");
        if (!grid || !emptyState) return;

        updateHealthDiagnostics();
        updateVaultDbStatus();

        const term = searchInput ? searchInput.value.trim().toLowerCase() : "";
        const cat = filterCat ? filterCat.value : "all";

        const filtered = vaultState.items.filter(item => {
            const matchTerm = (item.service && item.service.toLowerCase().includes(term)) || 
                              (item.user && item.user.toLowerCase().includes(term));
            const matchCat = cat === "all" || item.category === cat;
            return matchTerm && matchCat;
        });

        grid.innerHTML = "";

        if (filtered.length === 0) {
            emptyState.classList.remove("hidden");
            grid.classList.add("hidden");
        } else {
            emptyState.classList.add("hidden");
            grid.classList.remove("hidden");

            filtered.forEach(item => {
                const st = vaultStrengthInfo(item.pass || "");
                const initial = (item.service || "?").trim().charAt(0).toUpperCase() || "?";
                let hash = 0;
                for (const ch of String(item.service || "")) hash = (hash + ch.charCodeAt(0)) % 4;
                const tone = ["blue", "cyan", "green", "amber"][hash];

                const card = document.createElement("div");
                card.className = "card vault-item-card";
                card.innerHTML = `
                    <div class="vault-item__head">
                        <div class="vault-avatar vault-avatar--${tone}" aria-hidden="true">${escapeHtml(initial)}</div>
                        <div class="vault-item__title">
                            <h3 class="truncate" title="${escapeHtml(item.service)}">${escapeHtml(item.service)}</h3>
                            <span class="badge badge-primary">${escapeHtml(item.category || 'Outros')}</span>
                        </div>
                        <div class="vault-item__actions">
                            <button type="button" class="btn btn-ghost icon-btn btn-edit-item" data-id="${item.id}" aria-label="Editar ${escapeHtml(item.service)}" title="Editar">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"></path><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>
                            </button>
                            <button type="button" class="btn btn-ghost icon-btn text-alert btn-del-item" data-id="${item.id}" aria-label="Excluir ${escapeHtml(item.service)}" title="Excluir">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18"></path><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path></svg>
                            </button>
                        </div>
                    </div>

                    <div class="vault-item__row">
                        <span class="vault-item__label">Usuário</span>
                        <code class="code-font vault-item__user" title="${escapeHtml(item.user)}">${escapeHtml(item.user)}</code>
                    </div>

                    <div class="vault-item__row">
                        <span class="vault-item__label">Senha</span>
                        <div class="input-with-toggle">
                            <input type="password" readonly value="${escapeHtml(item.pass)}" class="form-control code-font" id="pass-item-${item.id}" aria-label="Senha de ${escapeHtml(item.service)}">
                            <button type="button" class="btn-toggle-pass" data-target="pass-item-${item.id}" aria-label="Mostrar ou ocultar senha"><span class="eye-icon">👁️</span></button>
                        </div>
                    </div>

                    <div class="vault-strength" title="Força estimada: ${st.label}">
                        <div class="vault-strength__bar"><span style="width:${st.percent}%; background:${st.color};"></span></div>
                        <span class="vault-strength__label" style="color:${st.color};">${st.label}</span>
                    </div>

                    <button type="button" class="btn btn-secondary btn-copy-item mt-auto" data-id="${item.id}">Copiar senha</button>
                `;
                grid.appendChild(card);
            });
        }
    };

    // Listeners do Painel
    if (searchInput) searchInput.addEventListener("input", vaultState.render);
    if (filterCat) filterCat.addEventListener("change", vaultState.render);

    if (btnLockNow) btnLockNow.addEventListener("click", () => location.reload());

    if (btnPurgeUnlocked) {
        btnPurgeUnlocked.addEventListener("click", () => {
            if (confirm("ATENÇÃO: Excluir cofre permanentemente?")) {
                vaultStorage.clearVault().then(() => location.reload());
            }
        });
    }

    // Delegação de eventos para botões dentro do grid
    document.getElementById("vault-grid-list")?.addEventListener("click", (e) => {
        const btnCopy = e.target.closest('.btn-copy-item');
        const btnDel = e.target.closest('.btn-del-item');
        const btnEdit = e.target.closest('.btn-edit-item');

        if (btnCopy) {
            const item = vaultState.items.find(i => i.id === btnCopy.getAttribute('data-id'));
            if (item) {
                navigator.clipboard.writeText(item.pass);
                btnCopy.textContent = 'Copiado!';
                showToast("Copiado. Área de transferência será limpa em 30s.", "info");
                setTimeout(() => { 
                    if(btnCopy.isConnected) btnCopy.textContent = 'Copiar senha'; 
                }, 1500);
                setTimeout(() => { navigator.clipboard.writeText(""); }, 30000);
            }
        }

        if (btnDel) {
            if (confirm("Excluir este item permanentemente?")) {
                vaultState.items = vaultState.items.filter(i => i.id !== btnDel.getAttribute('data-id'));
                persistVaultItems().then(vaultState.render);
            }
        }

        if (btnEdit && modal) {
            currentEditId = btnEdit.getAttribute('data-id');
            const item = vaultState.items.find(i => i.id === currentEditId);
            if (item) {
                document.getElementById('modal-service').value = item.service;
                document.getElementById('modal-user').value = item.user;
                document.getElementById('modal-pass').value = item.pass;
                document.getElementById('modal-category').value = item.category || 'Outros';
                openModal();
            }
        }
    });

    // Lógica do Modal
    function openModal() {
        if (!modal) return;
        modal.classList.remove('hidden');
        modal.setAttribute('aria-hidden', 'false');
        document.getElementById('modal-service')?.focus();
        
        // Trap focus
        const focusable = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if(focusable.length) {
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            modal.onkeydown = function(e) {
                if (e.key === 'Escape') closeModal();
                if (e.key === 'Tab') {
                    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
                    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
                }
            };
        }
    }

    function closeModal() {
        if (!modal) return;
        modal.classList.add('hidden');
        modal.setAttribute('aria-hidden', 'true');
        modalForm?.reset();
        currentEditId = null;
        modal.onkeydown = null;
    }

    if (btnAddModal) btnAddModal.addEventListener('click', () => { currentEditId = null; openModal(); });
    if (btnAddFirst) btnAddFirst.addEventListener('click', () => { currentEditId = null; openModal(); });
    if (btnCloseModal) btnCloseModal.addEventListener('click', closeModal);
    
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal(); // Click fora
        });
    }

    if (modalForm) {
        modalForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const service = document.getElementById('modal-service').value.trim();
            const user = document.getElementById('modal-user').value.trim();
            const pass = document.getElementById('modal-pass').value;
            const category = document.getElementById('modal-category').value;
            const now = new Date().toISOString();

            if (currentEditId) {
                const item = vaultState.items.find(i => i.id === currentEditId);
                if (item) {
                    item.service = service; item.user = user; item.pass = pass; item.category = category;
                    item.updatedAt = now;
                }
            } else {
                vaultState.items.push({
                    id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
                    service, user, pass, category,
                    createdAt: now, updatedAt: now
                });
            }
            
            await persistVaultItems();
            closeModal();
            vaultState.render();
            showToast("Item salvo com sucesso!", "success");
        });
        
        const btnGen = document.getElementById('btn-modal-gen-pass');
        if (btnGen) {
            btnGen.addEventListener('click', () => {
                document.getElementById('modal-pass').value = passwordGenerator.generateRandomPassword(16, true, true, true, true);
            });
        }
    }

    // Export / Import
    if (btnExport) {
        btnExport.addEventListener('click', () => {
            const rawVault = vaultStorage.getRawVault();
            if (!rawVault) return showToast("Cofre vazio ou não iniciado.", "warning");
            
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(rawVault));
            const dlAnchorElem = document.createElement('a');
            dlAnchorElem.setAttribute("href", dataStr);
            dlAnchorElem.setAttribute("download", `cyberguard_backup_${new Date().toISOString().split('T')[0]}.json`);
            dlAnchorElem.click();
            showToast("Backup exportado com sucesso.", "success");
        });
    }

    if (inputImport) {
        inputImport.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = async function(evt) {
                try {
                    const parsed = JSON.parse(evt.target.result);
                    if (!parsed.salt || !parsed.check) throw new Error("Arquivo de backup inválido.");
                    if (parsed.items !== undefined && !Array.isArray(parsed.items)) throw new Error("Arquivo de backup inválido.");
                    if (confirm("ATENÇÃO: A importação irá sobrescrever seu cofre atual. A senha mestre original deste backup será exigida. Confirmar?")) {
                        await vaultStorage.importRaw(parsed);
                        showToast("Backup importado. O cofre será bloqueado.", "success");
                        setTimeout(() => location.reload(), 2000);
                    }
                } catch(err) {
                    showToast("Erro ao importar: Arquivo inválido ou corrompido.", "danger");
                }
                inputImport.value = '';
            };
            reader.readAsText(file);
        });
    }
}

async function persistVaultItems() {
    if (!vaultStorage.getRawVault() || !vaultState.activeKey) return;
    // Cada senha vira um registro cifrado separado dentro do banco
    const records = [];
    for (const item of vaultState.items) {
        const enc = await cryptoUtils.encryptData(item, vaultState.activeKey);
        records.push({ id: item.id, iv: enc.iv, cipher: enc.cipher });
    }
    await vaultStorage.replaceItems(records);
}

function updateVaultDbStatus() {
    const el = document.getElementById("vault-db-status");
    if (!el) return;
    const info = vaultStorage.describe();
    const nome = info.backend === "indexeddb" ? "IndexedDB (cyberguard_db)" : "localStorage (reserva)";
    el.textContent = `Banco local: ${nome} · ${info.count} registro(s) cifrado(s) · salvo apenas neste dispositivo`;
}

// Força estimada de uma senha (usada nos cards do cofre)
function vaultStrengthInfo(pass) {
    let pool = 0;
    if (/[a-z]/.test(pass)) pool += 26;
    if (/[A-Z]/.test(pass)) pool += 26;
    if (/[0-9]/.test(pass)) pool += 10;
    if (/[^a-zA-Z0-9]/.test(pass)) pool += 32;
    const entropy = pass.length * Math.log2(pool || 1);
    if (entropy >= 80) return { label: "Excelente", percent: 100, color: "var(--color-safe)" };
    if (entropy >= 60) return { label: "Forte", percent: 75, color: "var(--color-accent-cyan)" };
    if (entropy >= 36) return { label: "Moderada", percent: 50, color: "var(--color-warn)" };
    return { label: "Fraca", percent: 22, color: "var(--color-alert)" };
}

function updateHealthDiagnostics() {
    let weak = 0, reused = 0, old = 0;
    const now = Date.now();
    const passwords = vaultState.items.map(i => i.pass);
    const issues = [];
    
    vaultState.items.forEach(item => {
        // Weak
        if (item.pass.length < 8) {
            weak++;
            issues.push(`Senha fraca em: ${item.service}`);
        }
        // Reused
        if (passwords.filter(p => p === item.pass).length > 1) {
            reused++;
            if (!issues.includes(`Senha reutilizada em: ${item.service}`)) {
                issues.push(`Senha reutilizada em: ${item.service}`);
            }
        }
        // Old (>180 days)
        if (item.updatedAt) {
            const ageDays = (now - new Date(item.updatedAt).getTime()) / (1000 * 60 * 60 * 24);
            if (ageDays > 180) {
                old++;
                issues.push(`Senha antiga (>180d) em: ${item.service}`);
            }
        }
    });

    // Score calc
    const total = vaultState.items.length || 1;
    let score = 100 - ((weak * 20) + (reused * 15) + (old * 5));
    if (score < 0) score = 0;
    if (vaultState.items.length === 0) score = 100;

    const elTotal = document.getElementById("stat-total-items");
    const elWeak = document.getElementById("stat-weak-count");
    const elReused = document.getElementById("stat-reused-count");
    const elOld = document.getElementById("stat-old-count");
    const elBadge = document.getElementById("health-score-display");
    const elIssues = document.getElementById("health-issues-list");

    if(elTotal) elTotal.textContent = vaultState.items.length;
    if(elWeak) elWeak.textContent = weak;
    if(elReused) elReused.textContent = reused;
    if(elOld) elOld.textContent = old;

    const elRing = document.getElementById("health-ring");
    const elRingVal = document.getElementById("health-ring-value");
    const elLabel = document.getElementById("health-label");
    const ringColor = score >= 80 ? "var(--color-safe)" : (score >= 50 ? "var(--color-warn)" : "var(--color-alert)");
    if (elRing) {
        elRing.style.setProperty("--p", score);
        elRing.style.setProperty("--ring-color", ringColor);
    }
    if (elRingVal) elRingVal.textContent = score;
    if (elLabel) {
        elLabel.textContent = vaultState.items.length === 0
            ? "Adicione itens para começar"
            : (score >= 80 ? "Cofre saudável" : (score >= 50 ? "Precisa de atenção" : "Risco alto"));
    }

    if(elBadge) {
        elBadge.textContent = `Nota: ${score}/100`;
        elBadge.className = "health-score-badge";
        if (score >= 80) elBadge.style.color = "var(--color-safe)";
        else if (score >= 50) elBadge.style.color = "var(--color-warn)";
        else elBadge.style.color = "var(--color-alert)";
    }

    if(elIssues) {
        if (issues.length > 0) {
            elIssues.classList.remove("hidden");
            elIssues.innerHTML = `<h4 class="text-sm">Atenção necessária</h4><ul class="health-issues__list">${issues.slice(0, 5).map(i => `<li>${escapeHtml(i)}</li>`).join('')}${issues.length > 5 ? `<li class="text-muted">...e mais ${issues.length - 5} problemas</li>` : ''}</ul>`;
        } else {
            elIssues.classList.add("hidden");
        }
    }
}

// ==========================================================================
// GERADOR & ANALISADOR DE SENHAS
// ==========================================================================
const passwordGenerator = {
    generateRandomPassword(length = 16, upper = true, lower = true, num = true, sym = true) {
        let chars = "";
        const uC = "ABCDEFGHIJKLMNOPQRSTUVWXYZ", lC = "abcdefghijklmnopqrstuvwxyz", nC = "0123456789", sC = "!@#$%^&*()_+-=[]{}|;:,.<>?";
        if (upper) chars += uC; if (lower) chars += lC; if (num) chars += nC; if (sym) chars += sC;
        if (!chars) chars = lC + nC;

        let result = "";
        // Rejection sampling para evitar viés de módulo
        for (let i = 0; i < length; i++) {
            result += cryptoUtils.getSecureRandomChar(chars);
        }
        
        // Garante ao menos 1 de cada selecionado
        let positions = Array.from({length}, (_, i) => i);
        positions.sort(() => Math.random() - 0.5);
        if (upper) result = result.substring(0, positions[0]) + cryptoUtils.getSecureRandomChar(uC) + result.substring(positions[0] + 1);
        if (lower) result = result.substring(0, positions[1]) + cryptoUtils.getSecureRandomChar(lC) + result.substring(positions[1] + 1);
        if (num) result = result.substring(0, positions[2]) + cryptoUtils.getSecureRandomChar(nC) + result.substring(positions[2] + 1);
        if (sym) result = result.substring(0, positions[3]) + cryptoUtils.getSecureRandomChar(sC) + result.substring(positions[3] + 1);

        return result;
    },
    generatePassphrase(wordsCount = 4, separator = "-", includeNum = true) {
        let phrase = [];
        for(let i=0; i<wordsCount; i++){
            const array = new Uint32Array(1);
            window.crypto.getRandomValues(array);
            phrase.push(WORDLIST[array[0] % WORDLIST.length]);
        }
        let res = phrase.join(separator);
        if(includeNum) {
            const array = new Uint32Array(1);
            window.crypto.getRandomValues(array);
            res += separator + (array[0] % 100);
        }
        return res;
    }
};

function initPasswordTools() {
    const genOut = document.getElementById('standalone-gen-out');
    const genRange = document.getElementById('gen-range-len');
    const genLenVal = document.getElementById('gen-len-val');
    const btnExec = document.getElementById('btn-exec-gen-pass');
    const btnPhrase = document.getElementById('btn-gen-passphrase');
    const btnCopy = document.getElementById('btn-copy-gen-pass');
    const evalInput = document.getElementById('standalone-eval-in');
    const evalOutput = document.getElementById('standalone-eval-out');

    if (genRange && genLenVal) {
        genRange.addEventListener('input', () => genLenVal.textContent = genRange.value);
    }
    
    if (btnExec && genOut) {
        btnExec.addEventListener('click', () => {
            const length = parseInt(genRange ? genRange.value : 16);
            genOut.value = passwordGenerator.generateRandomPassword(
                length,
                document.getElementById('gen-opt-upper')?.checked ?? true,
                document.getElementById('gen-opt-lower')?.checked ?? true,
                document.getElementById('gen-opt-num')?.checked ?? true,
                document.getElementById('gen-opt-sym')?.checked ?? true
            );
        });
        // Auto-generate on load
        btnExec.click(); 
    }

    if (btnPhrase && genOut) {
        btnPhrase.addEventListener('click', () => {
            genOut.value = passwordGenerator.generatePassphrase(4, "-", true);
        });
    }

    if (btnCopy && genOut) {
        btnCopy.addEventListener('click', () => {
            if (!genOut.value) return;
            navigator.clipboard.writeText(genOut.value);
            btnCopy.textContent = "Copiado!";
            setTimeout(() => btnCopy.textContent = "Copiar", 1500);
        });
    }

    if (evalInput && evalOutput) {
        evalInput.addEventListener('input', () => {
            const val = evalInput.value;
            if (!val) { evalOutput.innerHTML = ""; return; }
            
            let pool = 0;
            if (/[a-z]/.test(val)) pool += 26;
            if (/[A-Z]/.test(val)) pool += 26;
            if (/[0-9]/.test(val)) pool += 10;
            if (/[^a-zA-Z0-9]/.test(val)) pool += 32;

            const entropy = Math.round(val.length * Math.log2(pool || 1));
            let status = "Fraca", color = "var(--color-alert)", width = "20%";

            if (entropy >= 80) { status = "Excelente (Inviolável)"; color = "var(--color-safe)"; width = "100%"; }
            else if (entropy >= 60) { status = "Forte"; color = "var(--color-accent-cyan)"; width = "75%"; }
            else if (entropy >= 36) { status = "Moderada"; color = "var(--color-warn)"; width = "50%"; }

            // Verifica padrões fracos
            const isWeakPattern = /^(1234|abcd|qwer|asdf)/i.test(val) || /^(.+)\1+$/.test(val) || val.toLowerCase() === "senha" || val.toLowerCase() === "123456";
            if (isWeakPattern) { status = "Muito Fraca (Padrão Comum)"; color = "var(--color-alert)"; width = "10%"; }

            evalOutput.innerHTML = `
                <div class="progress-container mb-8"><div class="progress-bar" style="width: ${width}; background-color: ${color};"></div></div>
                Entropia: <strong>${entropy} bits</strong> | <span style="color:${color}; font-weight:bold;">${status}</span>
            `;
        });
    }
}

// ==========================================================================
// DICAS: CHECKLIST, URL CHECKER E QUIZ
// ==========================================================================
function initChecklist() {
    const form = document.getElementById('checklist-form');
    const progressBar = document.getElementById('checklist-progress-bar');
    const statusText = document.getElementById('checklist-status');
    const badge = document.getElementById('checklist-badge');
    const btnLimpar = document.getElementById('btn-limpar-checklist');

    if (!form || !progressBar || !statusText) return;

    const checkboxes = form.querySelectorAll('input[type="checkbox"]');

    function updateView() {
        let checked = 0;
        checkboxes.forEach((cb, idx) => {
            if (cb.checked) checked++;
            try { localStorage.setItem(`cyberguard_check_${idx}`, cb.checked); } catch(e){}
        });
        
        const perc = Math.round((checked / checkboxes.length) * 100);
        progressBar.style.width = perc + '%';
        statusText.textContent = `Nível de proteção: ${perc}%`;

        if (badge) {
            if (perc === 100) { badge.textContent = "Protegido!"; badge.className = "badge badge-safe"; }
            else if (perc >= 60) { badge.textContent = "Avançado"; badge.className = "badge badge-primary"; }
            else if (perc >= 30) { badge.textContent = "Intermediário"; badge.className = "badge badge-warn"; }
            else { badge.textContent = "Nível Básico"; badge.className = "badge badge-danger"; }
        }
    }

    // Load state
    checkboxes.forEach((cb, idx) => {
        try { if(localStorage.getItem(`cyberguard_check_${idx}`) === "true") cb.checked = true; } catch(e){}
    });
    updateView();

    form.addEventListener('change', updateView);
    if(btnLimpar) {
        btnLimpar.addEventListener('click', () => {
            checkboxes.forEach((cb, idx) => { cb.checked = false; try{localStorage.removeItem(`cyberguard_check_${idx}`);}catch(e){} });
            updateView();
        });
    }
}

function initUrlChecker() {
    const input = document.getElementById('url-input');
    const btn = document.getElementById('url-btn');
    const resultDiv = document.getElementById('url-result');
    if (!input || !btn || !resultDiv) return;

    const stepsData = [
        "Validando formato da URL...",
        "Verificando protocolo e ofuscação...",
        "Analisando domínio e extensão (.xyz, .top etc.)...",
        "Procurando palavras suspeitas (login, banco, atualiza)...",
        "Checando substituições visuais e subdomínios...",
        "Calculando nível de risco..."
    ];

    btn.addEventListener('click', async () => {
        const rawUrl = input.value.trim();
        if (activeUrlAnalysisSession) activeUrlAnalysisSession.cancelled = true;

        if (!rawUrl) {
            resultDiv.className = "alert alert-warning fade-in";
            resultDiv.innerHTML = "Informe um endereço válido.";
            resultDiv.classList.remove('hidden');
            return;
        }

        let parsedUrl;
        try {
            parsedUrl = new URL(rawUrl.startsWith('http') ? rawUrl : 'https://' + rawUrl);
        } catch (e) {
            resultDiv.className = "alert alert-danger fade-in";
            resultDiv.innerHTML = "<strong>URL INVÁLIDA:</strong> Formato não reconhecido.";
            resultDiv.classList.remove('hidden');
            return;
        }

        const session = { cancelled: false };
        activeUrlAnalysisSession = session;
        const originalBtnHTML = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = `<span class="btn-spinner" aria-hidden="true"></span> Analisando...`;
        resultDiv.className = "url-analysis-panel fade-in mb-16";
        resultDiv.classList.remove('hidden');

        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            resultDiv.innerHTML = `<p class="code-font text-xs text-muted">Processando...</p>`;
            await new Promise(r => setTimeout(r, 400));
        } else {
            let stepsHTML = stepsData.map((text, idx) => `
                <li class="url-step-item" id="url-step-${idx}">
                    <span class="url-step-icon" id="url-step-icon-${idx}">⏳</span><span>${text}</span>
                </li>
            `).join('');
            resultDiv.innerHTML = `
                <div class="url-analysis-header code-font"><span class="highlight">ANÁLISE HEURÍSTICA</span><span id="url-progress-percent">0%</span></div>
                <div class="progress-container mb-12"><div id="url-analysis-bar" class="progress-bar" style="width:0%;"></div></div>
                <ul class="url-steps-list">${stepsHTML}</ul>
            `;
            for (let i = 0; i < stepsData.length; i++) {
                if (session.cancelled) return;
                document.getElementById(`url-step-${i}`)?.classList.add('active');
                if (document.getElementById(`url-step-icon-${i}`)) document.getElementById(`url-step-icon-${i}`).innerHTML = `<span class="spinner-icon" aria-hidden="true"></span>`;
                await new Promise(r => setTimeout(r, 400));
                document.getElementById(`url-step-${i}`)?.classList.replace('active', 'done');
                if (document.getElementById(`url-step-icon-${i}`)) {
                    document.getElementById(`url-step-icon-${i}`).className = "url-step-icon check";
                    document.getElementById(`url-step-icon-${i}`).innerHTML = `✓`;
                }
                document.getElementById('url-analysis-bar').style.width = `${Math.round(((i + 1) / stepsData.length) * 100)}%`;
                document.getElementById('url-progress-percent').textContent = `${Math.round(((i + 1) / stepsData.length) * 100)}%`;
            }
        }
        if (session.cancelled) return;

        // Análise
        const urlStr = parsedUrl.href.toLowerCase();
        const hostname = parsedUrl.hostname.toLowerCase();
        const reasons = [];
        let score = 0;

        if (parsedUrl.protocol !== 'https:') { reasons.push("Protocolo não seguro (sem HTTPS)."); score += 2; }
        if (/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(hostname)) { reasons.push("Domínio é um endereço IP."); score += 3; }
        if (urlStr.includes('@')) { reasons.push("Presença do caractere '@' (tenta ofuscar o domínio real)."); score += 3; }
        
        const suspTlds = ['.xyz', '.top', '.online', '.tech', '.tk', '.ml'];
        if (suspTlds.some(t => hostname.endsWith(t))) { reasons.push("Extensão de domínio suspeita."); score += 2; }
        
        const keywords = ['login', 'banco', 'atualiza', 'pix', 'conta', 'senha', 'bloqueio'];
        if (keywords.some(k => urlStr.includes(k))) { reasons.push("Palavras de urgência/engenharia social detectadas."); score += 2; }
        
        if (hostname.split('.').length > 4) { reasons.push("Múltiplos subdomínios detectados."); score += 1; }
        if (/(paypa1|facbook|g00gle|itau-|brad-)/i.test(hostname)) { reasons.push("Substituição visual de caracteres (Typosquatting)."); score += 3; }

        btn.disabled = false;
        btn.innerHTML = originalBtnHTML;
        
        if (score === 0) {
            resultDiv.className = "alert alert-success fade-in mb-16";
            resultDiv.innerHTML = `<strong>LINK APARENTEMENTE SEGURO</strong><p class="text-xs mt-8">Nenhum padrão suspeito óbvio.</p>`;
        } else if (score <= 2) {
            resultDiv.className = "alert alert-warning fade-in mb-16";
            resultDiv.innerHTML = `<strong>RISCO MODERADO</strong><ul class="text-xs ml-16 mt-8">${reasons.map(r=>`<li>${r}</li>`).join('')}</ul>`;
        } else {
            resultDiv.className = "alert alert-danger fade-in mb-16";
            resultDiv.innerHTML = `<strong>ALERTA PERIGO</strong><ul class="text-xs ml-16 mt-8">${reasons.map(r=>`<li>${r}</li>`).join('')}</ul>`;
        }
        activeUrlAnalysisSession = null;
    });
}

function initQuiz() {
    const quizContainer = document.getElementById('quiz-container');
    if (!quizContainer) return;
    
    const questions = [
        { q: "O ícone de cadeado (HTTPS) no navegador garante que o site é legítimo?", o: ["Sim, protege contra golpes", "Não, apenas criptografa a conexão"], a: 1 },
        { q: "Qual a atitude correta ao receber SMS do banco pedindo código?", o: ["Digitar no link enviado", "Ignorar e ligar pro banco"], a: 1 },
        { q: "Qual dessas senhas é teoricamente mais segura contra força bruta?", o: ["Trator-Nuvem-Cabo-2026", "S3nh4!@#"], a: 0 },
        { q: "Seu 'amigo' pede Pix urgente no WhatsApp com número novo. O que fazer?", o: ["Transferir rápido", "Ligar por voz pro número antigo"], a: 1 },
        { q: "Um anexo de email com final '.pdf.exe' é seguro?", o: ["Sim, é um PDF compactado", "Não, é um executável malicioso"], a: 1 }
    ];

    let current = 0;
    let score = 0;

    function renderQuestion() {
        if (current >= questions.length) {
            quizContainer.innerHTML = `
                <div class="text-center p-24">
                    <h3>Quiz Concluído!</h3>
                    <p class="mb-16">Sua pontuação: ${score} de ${questions.length}</p>
                    <button class="btn btn-primary" onclick="location.reload()">Refazer Quiz</button>
                </div>`;
            return;
        }
        const q = questions[current];
        quizContainer.innerHTML = `
            <div class="p-16">
                <p class="text-sm text-muted mb-8">Pergunta ${current+1} de ${questions.length}</p>
                <h4 class="mb-16">${q.q}</h4>
                ${q.o.map((opt, i) => `<button class="quiz-opt-btn" data-index="${i}">${opt}</button>`).join('')}
            </div>
        `;
        quizContainer.querySelectorAll('.quiz-opt-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const isCorrect = parseInt(btn.getAttribute('data-index')) === q.a;
                if (isCorrect) { score++; btn.classList.add('correct'); } 
                else { btn.classList.add('wrong'); quizContainer.querySelectorAll('.quiz-opt-btn')[q.a].classList.add('correct'); }
                
                quizContainer.querySelectorAll('.quiz-opt-btn').forEach(b => b.disabled = true);
                setTimeout(() => { current++; renderQuestion(); }, 1200);
            });
        });
    }
    renderQuestion();
}

// ==========================================================================
// HOME: ANIMAÇÕES E CONTADORES
// ==========================================================================
function initTyping() {
    const el = document.getElementById('typing-effect');
    if (!el) return;
    const txts = ["Protegendo ativos digitais.", "Prevenção contra golpes.", "Conscientização digital."];
    let tIdx = 0, cIdx = 0, isDel = false;
    function type() {
        const cur = txts[tIdx];
        el.textContent = isDel ? cur.substring(0, cIdx - 1) : cur.substring(0, cIdx + 1);
        cIdx += isDel ? -1 : 1;
        let spd = isDel ? 30 : 50;
        if (!isDel && cIdx === cur.length) { spd = 2000; isDel = true; } 
        else if (isDel && cIdx === 0) { isDel = false; tIdx = (tIdx + 1) % txts.length; spd = 500; }
        setTimeout(type, spd);
    }
    setTimeout(type, 500);
}

function initClock() {
    const el = document.getElementById("relogio");
    if (!el) return;
    setInterval(() => el.textContent = `SysTime: ${new Date().toLocaleTimeString('pt-BR')}`, 1000);
}

function easeOutExpo(x) { return x === 1 ? 1 : 1 - Math.pow(2, -10 * x); }

function initCounters() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const counters = document.querySelectorAll('.stat-number');
    if (!counters.length) return;

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseFloat(el.getAttribute('data-target') || 0);
                const prefix = el.getAttribute('data-prefix') || '';
                const suffix = el.getAttribute('data-suffix') || '';
                const dec = parseInt(el.getAttribute('data-decimals') || 0);
                
                let start = null;
                const duration = 1500;
                
                function step(timestamp) {
                    if (!start) start = timestamp;
                    const progress = Math.min((timestamp - start) / duration, 1);
                    const current = target * easeOutExpo(progress);
                    el.textContent = prefix + current.toFixed(dec) + suffix;
                    if (progress < 1) requestAnimationFrame(step);
                    else el.textContent = prefix + target.toFixed(dec) + suffix;
                }
                requestAnimationFrame(step);
                obs.unobserve(el);
            }
        });
    }, { threshold: 0.5 });
    counters.forEach(c => observer.observe(c));
}

// ==========================================================================
// CONTATO: VALIDAÇÃO E ENVIO
// ==========================================================================
function initContactForm() {
    const form = document.getElementById('contact-form');
    const statusDiv = document.getElementById('contact-status');
    const msgInput = document.getElementById('contact-msg');
    const charCount = document.getElementById('contact-char-count');
    const ghLink = document.getElementById('github-link');

    if (ghLink) {
        if (GITHUB_URL === "SEU_USUARIO") ghLink.parentElement.style.display = 'none';
        else ghLink.href = `https://github.com/${GITHUB_URL}/cyberguard`;
    }

    if (msgInput && charCount) {
        msgInput.addEventListener('input', () => {
            charCount.textContent = `${msgInput.value.length}/500`;
        });
    }

    if (!form || !statusDiv) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Honeypot anti-spam
        if (document.getElementById('contact-hp')?.value) return;

        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const nome = document.getElementById('contact-name').value.trim();
        const email = document.getElementById('contact-email').value.trim();
        const assunto = document.getElementById('contact-subject').value;
        const mensagem = msgInput.value.trim();

        const texto = [
            '*Novo contato pelo site CyberGuard*',
            '',
            `*Nome:* ${nome}`,
            `*E-mail:* ${email}`,
            `*Assunto:* ${assunto}`,
            '',
            '*Mensagem:*',
            mensagem
        ].join('\n');

        const url = `https://wa.me/${CONTACT_WHATSAPP}?text=${encodeURIComponent(texto)}`;

        statusDiv.innerHTML = `<div class="alert alert-success">Abrindo o WhatsApp com sua mensagem pronta. Toque em <strong>Enviar</strong> lá para concluir. Se não abrir, <a href="${url}" target="_blank" rel="noopener noreferrer" class="highlight">clique aqui</a>.</div>`;

        const win = window.open(url, '_blank', 'noopener');
        if (!win) window.location.href = url;

        setTimeout(() => {
            form.reset();
            if (charCount) charCount.textContent = '0/500';
        }, 800);
    });
}

// ==========================================================================
// CARROSSEL MOBILE DE CARDS
// Transforma automaticamente qualquer grupo de cards (.grid-cards,
// .grid-cards-4, .grid-3-cols) em carrossel horizontal no celular.
// No notebook/desktop continua sendo grade normal.
// ==========================================================================
function initCardCarousels() {
    const SELECTOR = '.grid-cards, .grid-cards-4, .grid-3-cols';
    const mq = window.matchMedia('(max-width: 767px)');
    const registry = new Map();

    const isCardGroup = (grid) => {
        const kids = Array.from(grid.children);
        return kids.length > 0 && kids.every(k => k.classList && k.classList.contains('card'));
    };

    function build(grid) {
        if (registry.has(grid)) return registry.get(grid);

        const dots = document.createElement('div');
        dots.className = 'carousel-dots';
        dots.setAttribute('role', 'tablist');
        dots.setAttribute('aria-label', 'Navegação do carrossel de cards');
        dots.hidden = true;
        grid.insertAdjacentElement('afterend', dots);

        const state = { grid, dots, raf: null, active: 0 };
        registry.set(grid, state);

        grid.addEventListener('scroll', () => {
            if (state.raf) return;
            state.raf = requestAnimationFrame(() => {
                state.raf = null;
                updateActive(state);
            });
        }, { passive: true });

        const mo = new MutationObserver(() => refresh(state));
        mo.observe(grid, { childList: true, attributes: true, attributeFilter: ['class'] });
        state.observer = mo;

        return state;
    }

    function refresh(state) {
        const { grid, dots } = state;
        const enabled = mq.matches && isCardGroup(grid);

        if (!enabled) {
            grid.removeAttribute('data-carousel');
            grid.removeAttribute('data-carousel-count');
            dots.hidden = true;
            dots.innerHTML = '';
            return;
        }

        const cards = Array.from(grid.children);
        grid.setAttribute('data-carousel', '');
        grid.setAttribute('data-carousel-count', String(cards.length));

        const hiddenGrid = grid.classList.contains('hidden');
        if (cards.length < 2 || hiddenGrid) {
            dots.hidden = true;
            dots.innerHTML = '';
            return;
        }

        if (dots.children.length !== cards.length + 1) {
            dots.innerHTML = '';
            cards.forEach((card, i) => {
                const dot = document.createElement('button');
                dot.type = 'button';
                dot.className = 'carousel-dot';
                dot.setAttribute('role', 'tab');
                dot.setAttribute('aria-label', 'Ir para o card ' + (i + 1) + ' de ' + cards.length);
                dot.addEventListener('click', () => {
                    const target = grid.children[i];
                    if (!target) return;
                    const left = target.offsetLeft - (grid.clientWidth - target.clientWidth) / 2;
                    grid.scrollTo({ left: Math.max(0, left), behavior: 'smooth' });
                });
                dots.appendChild(dot);
            });
            const counter = document.createElement('span');
            counter.className = 'carousel-counter';
            counter.setAttribute('aria-hidden', 'true');
            dots.appendChild(counter);
        }

        dots.hidden = false;
        updateActive(state);
    }

    function updateActive(state) {
        const { grid, dots } = state;
        const cards = Array.from(grid.children);
        if (!cards.length || dots.hidden) return;

        const center = grid.scrollLeft + grid.clientWidth / 2;
        let best = 0;
        let bestDist = Infinity;
        cards.forEach((card, i) => {
            const cardCenter = card.offsetLeft + card.clientWidth / 2;
            const dist = Math.abs(cardCenter - center);
            if (dist < bestDist) { bestDist = dist; best = i; }
        });

        // Nas pontas do carrossel, força o primeiro/último card como ativo
        if (grid.scrollLeft <= 4) best = 0;
        else if (grid.scrollLeft + grid.clientWidth >= grid.scrollWidth - 4) best = cards.length - 1;

        state.active = best;
        const dotEls = dots.querySelectorAll('.carousel-dot');
        dotEls.forEach((d, i) => {
            const on = i === best;
            d.classList.toggle('is-active', on);
            d.setAttribute('aria-selected', on ? 'true' : 'false');
        });
        const counter = dots.querySelector('.carousel-counter');
        if (counter) counter.textContent = (best + 1) + '/' + cards.length;
    }

    function scan() {
        document.querySelectorAll(SELECTOR).forEach(grid => {
            const state = build(grid);
            refresh(state);
        });
    }

    scan();

    const onChange = () => registry.forEach(refresh);
    if (mq.addEventListener) mq.addEventListener('change', onChange);
    else if (mq.addListener) mq.addListener(onChange);
    window.addEventListener('resize', () => registry.forEach(updateActive), { passive: true });
    window.addEventListener('orientationchange', () => setTimeout(onChange, 250));
    window.addEventListener('load', onChange);
}

// ==========================================================================
// ACORDEÃO (FAQ da Contato e "Mitos e Verdades" da Dicas)
// ==========================================================================
function initAccordions() {
    const accordions = document.querySelectorAll('.accordion');
    if (!accordions.length) return;

    accordions.forEach((acc, idx) => {
        const header = acc.querySelector('.accordion__header');
        const content = acc.querySelector('.accordion__content');
        if (!header || !content) return;

        const panelId = content.id || ('accordion-panel-' + idx);
        content.id = panelId;
        header.setAttribute('aria-controls', panelId);
        content.setAttribute('role', 'region');

        const setState = (open) => {
            acc.classList.toggle('is-open', open);
            header.setAttribute('aria-expanded', open ? 'true' : 'false');
            const icon = header.querySelector('.accordion__icon');
            if (icon) icon.textContent = '+';
        };

        header.addEventListener('click', () => {
            const willOpen = !acc.classList.contains('is-open');

            // Fecha os outros itens do mesmo grupo (só um aberto por vez)
            const group = acc.parentElement;
            if (willOpen && group) {
                group.querySelectorAll(':scope > .accordion.is-open').forEach(other => {
                    if (other === acc) return;
                    other.classList.remove('is-open');
                    const h = other.querySelector('.accordion__header');
                    if (h) h.setAttribute('aria-expanded', 'false');
                });
            }
            setState(willOpen);
        });
    });
}

// ==========================================================================
// FUNDO DE NÚMEROS BINÁRIOS ANIMADOS (hero da página Dicas)
// ==========================================================================
function initBinaryRain() {
    const canvas = document.getElementById('binary-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const COLORS = ['#38bdf8', '#2563eb', '#0ea5e9', '#60a5fa'];
    const FRAME_MS = 1000 / 30; // ~30 quadros por segundo (leve para o celular)

    let width = 0, height = 0, fontSize = 16, columns = 0;
    let drops = [];
    let speeds = [];
    let colors = [];
    let rafId = null;
    let lastTime = 0;
    let running = false;
    let inView = true;

    function resize() {
        const rect = canvas.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        width = Math.max(1, Math.floor(rect.width));
        height = Math.max(1, Math.floor(rect.height));
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        fontSize = width < 600 ? 14 : 18;
        columns = Math.ceil(width / fontSize);
        drops = [];
        speeds = [];
        colors = [];
        for (let i = 0; i < columns; i++) {
            drops[i] = Math.random() * -(height / fontSize);
            speeds[i] = 0.35 + Math.random() * 0.75;
            colors[i] = COLORS[Math.floor(Math.random() * COLORS.length)];
        }
        ctx.fillStyle = '#020617';
        ctx.fillRect(0, 0, width, height);
        if (reduceMotion) drawStatic();
    }

    function drawStatic() {
        ctx.fillStyle = '#020617';
        ctx.fillRect(0, 0, width, height);
        ctx.font = fontSize + 'px "Fira Code", monospace';
        ctx.globalAlpha = 0.25;
        for (let i = 0; i < columns; i++) {
            for (let y = 0; y < height; y += fontSize * 2) {
                ctx.fillStyle = colors[i];
                ctx.fillText(Math.random() > 0.5 ? '1' : '0', i * fontSize, y + fontSize);
            }
        }
        ctx.globalAlpha = 1;
    }

    function draw(time) {
        rafId = requestAnimationFrame(draw);
        if (time - lastTime < FRAME_MS) return;
        lastTime = time;

        // Rastro: escurece o quadro anterior aos poucos
        ctx.fillStyle = 'rgba(2, 6, 23, 0.14)';
        ctx.fillRect(0, 0, width, height);

        ctx.font = fontSize + 'px "Fira Code", monospace';
        ctx.textBaseline = 'top';

        for (let i = 0; i < columns; i++) {
            const y = drops[i] * fontSize;
            if (y > -fontSize && y < height + fontSize) {
                // Cabeça da coluna mais clara, resto na cor da coluna
                ctx.fillStyle = '#e0f2fe';
                ctx.globalAlpha = 0.95;
                ctx.fillText(Math.random() > 0.5 ? '1' : '0', i * fontSize, y);

                ctx.fillStyle = colors[i];
                ctx.globalAlpha = 0.55;
                ctx.fillText(Math.random() > 0.5 ? '1' : '0', i * fontSize, y - fontSize);
                ctx.globalAlpha = 1;
            }
            drops[i] += speeds[i];
            if (y > height && Math.random() > 0.975) {
                drops[i] = Math.random() * -12;
                speeds[i] = 0.35 + Math.random() * 0.75;
            }
        }
    }

    function start() {
        if (running || reduceMotion) return;
        running = true;
        lastTime = 0;
        rafId = requestAnimationFrame(draw);
    }

    function stop() {
        running = false;
        if (rafId) cancelAnimationFrame(rafId);
        rafId = null;
    }

    resize();

    if (reduceMotion) return;

    // Só anima quando o banner está visível e a aba está ativa (economiza bateria)
    if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries) => {
            inView = entries[0].isIntersecting;
            if (inView && !document.hidden) start(); else stop();
        }, { threshold: 0.01 });
        io.observe(canvas);
    } else {
        start();
    }

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) stop();
        else if (inView) start();
    });

    let resizeTimer = null;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(resize, 200);
    }, { passive: true });

    start();
}

// ==========================================================================
// POLIMENTO VISUAL: barra de progresso de rolagem + brilho que segue o mouse
// ==========================================================================
function initScrollProgress() {
    if (document.querySelector('.scroll-progress')) return;
    const bar = document.createElement('div');
    bar.className = 'scroll-progress';
    bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);

    let ticking = false;
    function update() {
        const doc = document.documentElement;
        const max = doc.scrollHeight - window.innerHeight;
        const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
        bar.style.transform = `scaleX(${p})`;
        ticking = false;
    }
    window.addEventListener('scroll', () => {
        if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    update();
}

function initCardSpotlight() {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    document.addEventListener('pointermove', (e) => {
        const card = e.target.closest && e.target.closest('.card');
        if (!card) return;
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    }, { passive: true });
}

// ==========================================================================
// TELA DE CARREGAMENTO COM A LOGO (Home)
// Aparece uma vez por sessão. Para rever: feche a aba e abra de novo,
// ou acrescente ?splash no endereço (ex.: index.html?splash).
// ==========================================================================
function initSplashScreen() {
    const root = document.documentElement;
    const isHome = !!(document.body && document.body.classList.contains('page-home'));
    const forced = /[?&]splash\b/.test(location.search);
    let seen = false;
    try { seen = sessionStorage.getItem('cg_splash_seen') === '1'; } catch (e) {}

    if (!isHome || (seen && !forced)) {
        root.classList.add('cg-splash-skip');
        return;
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const MIN_MS = reduceMotion ? 900 : 2600;
    const MAX_MS = 7000;
    const MESSAGES = [
        'Inicializando módulos de segurança',
        'Preparando criptografia local',
        'Verificando integridade do sistema',
        'Acesso liberado'
    ];

    const splash = document.createElement('div');
    splash.className = 'cg-splash';
    splash.setAttribute('role', 'status');
    splash.setAttribute('aria-label', 'Carregando CyberGuard');
    splash.innerHTML = `
        <canvas class="cg-splash__rain" aria-hidden="true"></canvas>
        <div class="cg-splash__vignette" aria-hidden="true"></div>
        <div class="cg-splash__center">
            <div class="cg-splash__logo-wrap">
                <div class="cg-splash__ring" aria-hidden="true"></div>
                <div class="cg-splash__logo" role="img" aria-label="Logotipo CyberGuard"></div>
            </div>
            <div class="cg-splash__bar" aria-hidden="true"><span class="cg-splash__fill"></span></div>
            <div class="cg-splash__meta">
                <span class="cg-splash__msg">${MESSAGES[0]}</span>
                <span class="cg-splash__pct">0%</span>
            </div>
        </div>`;

    root.classList.add('cg-splash-on');
    (document.body || root).appendChild(splash);
    if (!document.body) document.addEventListener('DOMContentLoaded', () => document.body.appendChild(splash), { once: true });

    const fill = splash.querySelector('.cg-splash__fill');
    const pctEl = splash.querySelector('.cg-splash__pct');
    const msgEl = splash.querySelector('.cg-splash__msg');
    const stopRain = startSplashRain(splash.querySelector('.cg-splash__rain'), reduceMotion);

    const start = performance.now();
    let loaded = document.readyState === 'complete';
    if (!loaded) window.addEventListener('load', () => { loaded = true; }, { once: true });

    let progress = 0;
    let finished = false;
    let lastMsg = 0;

    function tick(now) {
        if (finished) return;
        const elapsed = now - start;
        // Avança até 92% pelo tempo mínimo; só chega a 100% quando a página carregou
        const timeRatio = Math.min(1, elapsed / MIN_MS);
        const eased = 1 - Math.pow(1 - timeRatio, 2.2);
        let target = eased * 92;
        if (loaded && elapsed >= MIN_MS) target = 100;
        else if (elapsed >= MIN_MS) target = 92 + Math.min(6, (elapsed - MIN_MS) / 600);
        progress += (target - progress) * 0.18;
        if (target === 100 && progress > 99.5) progress = 100;

        const p = Math.round(progress);
        fill.style.transform = `scaleX(${progress / 100})`;
        pctEl.textContent = p + '%';

        const idx = p >= 100 ? 3 : (p >= 66 ? 2 : (p >= 33 ? 1 : 0));
        if (idx !== lastMsg) { lastMsg = idx; msgEl.textContent = MESSAGES[idx]; }

        if (progress >= 100 || elapsed >= MAX_MS) { finish(); return; }
        requestAnimationFrame(tick);
    }

    function finish() {
        if (finished) return;
        finished = true;
        fill.style.transform = 'scaleX(1)';
        pctEl.textContent = '100%';
        msgEl.textContent = MESSAGES[3];
        splash.classList.add('is-done');
        try { sessionStorage.setItem('cg_splash_seen', '1'); } catch (e) {}
        setTimeout(() => {
            splash.classList.add('is-leaving');
            setTimeout(() => {
                stopRain();
                splash.remove();
                root.classList.remove('cg-splash-on');
                root.classList.add('cg-splash-skip');
            }, reduceMotion ? 50 : 750);
        }, reduceMotion ? 100 : 450);
    }

    requestAnimationFrame(tick);
    setTimeout(finish, MAX_MS + 1500); // garantia: nunca trava a página
}

// Chuva de 0 e 1 leve para o fundo da tela de carregamento
function startSplashRain(canvas, reduceMotion) {
    const ctx = canvas && canvas.getContext('2d');
    if (!ctx) return () => {};
    let w = 0, h = 0, cols = 0, fs = 16, drops = [], raf = null, last = 0;

    function resize() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        w = window.innerWidth;
        h = window.innerHeight;
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        fs = w < 600 ? 14 : 18;
        cols = Math.ceil(w / fs);
        drops = Array.from({ length: cols }, () => Math.random() * -(h / fs));
        ctx.fillStyle = '#020617';
        ctx.fillRect(0, 0, w, h);
    }
    resize();
    window.addEventListener('resize', resize);
    if (reduceMotion) return () => window.removeEventListener('resize', resize);

    function draw(t) {
        raf = requestAnimationFrame(draw);
        if (t - last < 40) return;
        last = t;
        ctx.fillStyle = 'rgba(2, 6, 23, 0.16)';
        ctx.fillRect(0, 0, w, h);
        ctx.font = fs + 'px "Fira Code", monospace';
        ctx.textBaseline = 'top';
        for (let i = 0; i < cols; i++) {
            const y = drops[i] * fs;
            ctx.fillStyle = '#e0f2fe';
            ctx.globalAlpha = 0.9;
            ctx.fillText(Math.random() > 0.5 ? '1' : '0', i * fs, y);
            ctx.fillStyle = i % 3 ? '#2563eb' : '#38bdf8';
            ctx.globalAlpha = 0.5;
            ctx.fillText(Math.random() > 0.5 ? '1' : '0', i * fs, y - fs);
            ctx.globalAlpha = 1;
            drops[i] += 0.5 + (i % 5) * 0.12;
            if (y > h && Math.random() > 0.96) drops[i] = Math.random() * -10;
        }
    }
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
}