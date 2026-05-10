(function () {

    /* ── Estado global ── */
    let CATEGORIAS = [];
    let ORGAOS_FLAT = [];
    let isAdmin = false;

    /* ── Helpers ── */
    function logout() {
        fetch('/api/auth/logout', { method: 'POST' }).catch(() => {}).finally(() => {
            window.location.href = '/login';
        });
    }

    function getOrgaoSelecionado() {
        try { return JSON.parse(localStorage.getItem('dme_orgao_selecionado') || 'null'); }
        catch (_) { return null; }
    }

    function setOrgaoSelecionado(orgao) {
        localStorage.setItem('dme_orgao_selecionado', JSON.stringify(orgao));
    }

    async function apiFetch(url, opts = {}) {
        const r = await fetch(url, { credentials: 'include', ...opts });
        if (!r.ok) {
            const err = await r.json().catch(() => ({}));
            throw new Error(err.detail || 'Erro ' + r.status);
        }
        return r.json();
    }

    /* ── Carregar dados da API ── */
    async function carregarDados() {
        try {
            const res = await apiFetch('/api/orgaos');
            const { categorias, orgaos } = res.data;
            CATEGORIAS = categorias.map(cat => ({
                ...cat,
                orgaos: orgaos
                    .filter(o => o.categoria_slug === cat.slug && o.ativo)
                    .sort((a, b) => a.ordem - b.ordem || a.nome_oficial.localeCompare(b.nome_oficial))
            })).filter(cat => cat.orgaos.length > 0);
            ORGAOS_FLAT = orgaos.filter(o => o.ativo);
        } catch (e) {
            CATEGORIAS = _FALLBACK_CATEGORIAS;
            ORGAOS_FLAT = _FALLBACK_CATEGORIAS.flatMap(c => c.orgaos);
        }
        renderList();
        const statTotal = document.getElementById('statTotalOrgaos');
        if (statTotal) statTotal.textContent = ORGAOS_FLAT.length;
    }

    /* ── Fallback estático ── */
    const _FALLBACK_CATEGORIAS = [
        { slug: 'centros-operacionais', nome: 'Centros Operacionais', icone: '🛡️', orgaos: [
            { nick: 'centro-instrucao',   nome_oficial: 'Centro de Instrução',                icone: 'https://dme.systemhb.net/template/uploads/images/funcao/logo/914016940fb6c52e135e9f446ba8aaf8.gif', sub: '' },
            { nick: 'centro-treinamento', nome_oficial: 'Centro de Treinamento',               icone: 'https://dme.systemhb.net/template/uploads/images/funcao/logo/bbef8297aa5a9abcd7953cae6a9cfdd7.gif', sub: '' },
            { nick: 'centro-supervisao',  nome_oficial: 'Centro de Supervisão',                icone: 'https://dme.systemhb.net/template/uploads/images/funcao/logo/2f1401dec91ad95dfe3001d54ffe569d.gif', sub: '' },
            { nick: 'centro-patrulha',    nome_oficial: 'Centro de Patrulha',                  icone: 'https://dme.systemhb.net/template/uploads/images/funcao/logo/0f0070fc35e6287165dbca41c7f346c6.gif', sub: '' },
            { nick: 'guerra-selva',       nome_oficial: 'Centro de Instrução Guerra na Selva', icone: 'https://dme.systemhb.net/template/uploads/images/funcao/logo/180f8013216b09a65bbafae73c9f12b0.gif', sub: '' },
        ]},
        { slug: 'academias-militares', nome: 'Academias Militares', icone: '🦅', orgaos: [
            { nick: 'academia-agulhas-negras', nome_oficial: 'Academia Militar das Agulhas Negras', icone: 'https://dme.systemhb.net/template/uploads/images/funcao/logo/77bc72a49309801dfcf55518220ae70c.gif', sub: '' },
            { nick: 'academia-publicitaria',   nome_oficial: 'Academia Publicitária Militar',        icone: 'https://dme.systemhb.net/template/uploads/images/funcao/logo/eec244065cf20e5456d5af87cea314d7.gif', sub: '' },
            { nick: 'instrucao-inicial',        nome_oficial: 'Aplicar Instrução Inicial',            icone: 'https://dme.systemhb.net/template/uploads/images/funcao/logo/4a7d41ffdd34910a055aa7bfd6a70860.gif', sub: 'Instrutores' },
            { nick: 'cadetes',                  nome_oficial: 'Cadetes',                              icone: 'https://www.habbo.com.br/habbo-imaging/badge/b10194s36014s43014s19114afed5dd516965c942bfef238012dfec3.gif', sub: '' },
        ]},
        { slug: 'justica-fiscalizacao', nome: 'Justiça & Fiscalização', icone: '⚖️', orgaos: [
            { nick: 'auditoria-fiscal',    nome_oficial: 'Auditoria Fiscal',          icone: 'https://dme.systemhb.net/template/uploads/images/funcao/logo/31e84ea0b11c5ed7b63ac1e6166bee90.gif', sub: '' },
            { nick: 'ministerio-publico',  nome_oficial: 'Ministério Público',         icone: 'https://www.habbo.com.br/habbo-imaging/badge/b06124s36114s41014s17013s170158665a8b59b24d62a77d191db749be846.gif', sub: '' },
            { nick: 'corregedoria',        nome_oficial: 'Corregedoria',              icone: 'https://dme.systemhb.net/template/uploads/images/funcao/logo/cc4349be1fff875b8b228fd1f7db0563.gif', sub: '' },
            { nick: 'stm',                 nome_oficial: 'Superior Tribunal Militar', icone: 'https://dme.systemhb.net/template/uploads/images/funcao/logo/268e5cc580db6b8ba1a0c7a0eec4db1e.gif', sub: '' },
        ]},
        { slug: 'corpos-inteligencia', nome: 'Corpos & Inteligência', icone: '🗡️', orgaos: [
            { nick: 'corpo-oficiais-gerais', nome_oficial: 'Corpo de Oficiais Generais',          icone: 'https://dme.systemhb.net/template/uploads/images/funcao/logo/7c694a9b1b9a4f9b08c7bc84e57afa50.gif', sub: '' },
            { nick: 'corpo-oficiais',        nome_oficial: 'Corpo de Oficiais',                   icone: 'https://dme.systemhb.net/template/uploads/images/funcao/logo/1d4f2a2e5aca8eabc7f2af853ed44772.gif', sub: 'Setor de Inteligência' },
            { nick: 'abi',                   nome_oficial: 'Agência Brasileira de Inteligência',  icone: 'https://dme.systemhb.net/template/uploads/images/funcao/logo/598213fbfb9e3f0f791096139b758bfc.gif', sub: '' },
            { nick: 'goe',                   nome_oficial: 'Grupamento de Operações Especiais',   icone: 'https://dme.systemhb.net/template/uploads/images/funcao/logo/f7967dd54a1e116af97792bc4debd02a.gif', sub: 'Instrutores' },
        ]},
        { slug: 'orgaos-sociais-rh', nome: 'Órgãos Sociais & RH', icone: '👥', orgaos: [
            { nick: 'centro-rh',           nome_oficial: 'Centro de Recursos Humanos', icone: 'https://dme.systemhb.net/template/uploads/images/funcao/logo/ddfe838106828917d067c863e0f26971.gif', sub: '' },
            { nick: 'portadores-direitos', nome_oficial: 'Portadores de Direitos',      icone: 'https://www.habbo.com.br/habbo-imaging/badge/b09114s36044s43014s39114877cc564318702d741883b056ebfd9e8.gif', sub: '' },
            { nick: 'comando-feminino',    nome_oficial: 'Comando Feminino',            icone: 'https://dme.systemhb.net/template/uploads/images/funcao/logo/76014a0a9c1042e63ad0408ae12f55cf.gif', sub: '' },
        ]},
    ];

    /* ── Render Img Orgãos ── */
    function getIcon(o) {
    const icon = o.icone || o.icon;

    if (!icon) return '🏛️';

    // Se for URL
    if (
        icon.startsWith('http://') ||
        icon.startsWith('https://') ||
        icon.startsWith('/')
    ) {
        return '<img src="' + icon + '" class="funcao-item-img" alt="">';
    }

    // Emoji fallback
    return icon;

    }
    /* ── Render ── */
    const ARROW_SVG = '<svg class="funcao-item-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>';

    function getTitle(o) { return o.nome_oficial || o.title || ''; }
    function getNick(o)  { return o.nick || o.id || ''; }
    
    function getSub(o)   { return o.sub || ''; }

    function cardHTML(o, selectedNick) {
    const nick = getNick(o);
    const isSelected = selectedNick === nick;
    const sub  = getSub(o)
        ? '<div class="funcao-item-sub">' + getSub(o) + '</div>'
        : '';

    const badge = '<span class="funcao-item-badge">Ativo</span>';

    const icon = o.icone || o.icon || '🏛️';

    const iconHTML =
        icon.startsWith('http://') ||
        icon.startsWith('https://') ||
        icon.startsWith('/')
            ? '<img class="funcao-item-img" src="' + icon + '" alt="">'
            : icon;

    return `
        <div class="funcao-item ${isSelected ? 'selected' : ''}"
            data-id="${nick}"
            role="button"
            tabindex="0"
            aria-label="${getTitle(o)}">

            <div class="funcao-item-icon">
                ${iconHTML}
            </div>

            <div class="funcao-item-text">
                <div class="funcao-item-title">${getTitle(o)}</div>
                ${sub}
            </div>

            ${isSelected ? badge : ARROW_SVG}
        </div>
    `;
    }

    function renderList(filtro) {
        const container = document.getElementById('funcaoList');
        if (!container) return;
        const selected = getOrgaoSelecionado();
        const selectedNick = selected ? (selected.nick || selected.id || null) : null;

        if (filtro !== undefined && filtro !== '') {
            const termo = filtro.toLowerCase();
            const matches = ORGAOS_FLAT.filter(o =>
                getTitle(o).toLowerCase().includes(termo) || getSub(o).toLowerCase().includes(termo)
            );
            if (!matches.length) {
                container.innerHTML = '<div class="funcao-grid"><div class="funcao-empty"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>Nenhum resultado para "<strong>' + filtro + '</strong>"</div></div>';
            } else {
                container.innerHTML = '<div class="funcao-grid">' + matches.map(o => cardHTML(o, selectedNick)).join('') + '</div>';
                attachEvents(container);
            }
            return;
        }

        container.innerHTML = CATEGORIAS.map(function(cat) {
            const editBtn = isAdmin
                ? '<button class="btn-edit-cat" onclick="abrirModalEditCat(\'' + cat.slug + '\',\'' + encodeURIComponent(cat.nome) + '\',\'' + (cat.icone||'🏛️') + '\')" title="Editar categoria"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="13" height="13"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>'
                : '';
            return '<div class="funcao-category">' +
                '<div class="funcao-category-header">' +
                '<div class="funcao-category-dot"></div>' +
                '<span class="funcao-category-name">' + cat.nome + '</span>' +
                '<span class="funcao-category-count">' + cat.orgaos.length + '</span>' +
                editBtn +
                '</div>' +
                '<div class="funcao-grid">' + cat.orgaos.map(o => cardHTML(o, selectedNick)).join('') + '</div>' +
                '</div>';
        }).join('');

        attachEvents(container);
    }

    function attachEvents(container) {
        container.querySelectorAll('.funcao-item').forEach(function(el) {
            el.addEventListener('click', function() { selecionarOrgao(el.getAttribute('data-id')); });
            el.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selecionarOrgao(el.getAttribute('data-id')); }
            });
        });
    }

    function selecionarOrgao(id) {
        const orgao = ORGAOS_FLAT.find(o => getNick(o) === id);
        if (!orgao) return;
        setOrgaoSelecionado({ nick: getNick(orgao), id: getNick(orgao), title: getTitle(orgao), nome_oficial: getTitle(orgao), sub: getSub(orgao), icon: getIcon(orgao), icone: getIcon(orgao) });
        window.location.href = '/centro_detalhe';
    }

    /* ── Modais (admin) ── */
    window.abrirModalEditCat = function(slug, nome, icone) {
        document.getElementById('editCatSlug').value = slug;
        document.getElementById('editCatNome').value = decodeURIComponent(nome);
        document.getElementById('editCatIcone').value = icone;
        document.getElementById('modalEditCat').classList.add('active');
    };

    window.fecharModalEditCat = function() {
        document.getElementById('modalEditCat').classList.remove('active');
    };

    window.salvarCategoria = async function() {
        const slug  = document.getElementById('editCatSlug').value;
        const nome  = document.getElementById('editCatNome').value.trim();
        const icone = document.getElementById('editCatIcone').value.trim() || '🏛️';
        const ordemEl = document.getElementById('editCatOrdem');
        const ordem = ordemEl ? (parseInt(ordemEl.value) || 99) : 99;
        if (!nome) return showToast('Informe o nome da categoria.', 'erro');
        try {
            await apiFetch('/api/orgaos/categorias', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug, nome, icone, ordem }) });
            fecharModalEditCat();
            showToast('Categoria atualizada!', 'ok');
            await carregarDados();
        } catch (e) { showToast(e.message, 'erro'); }
    };

    window.abrirModalNovaCat = function() {
        document.getElementById('editCatSlug').value = 'cat-' + Date.now();
        document.getElementById('editCatNome').value = '';
        document.getElementById('editCatIcone').value = '🏛️';
        if (document.getElementById('editCatOrdem')) document.getElementById('editCatOrdem').value = '99';
        document.getElementById('modalEditCat').classList.add('active');
    };

    window.abrirModalNovoOrgao = function() {
        const sel = document.getElementById('novoOrgaoCat');
        if (sel) sel.innerHTML = CATEGORIAS.map(c => '<option value="' + c.slug + '">' + c.nome + '</option>').join('');
        document.getElementById('modalNovoOrgao').classList.add('active');
    };

    window.fecharModalNovoOrgao = function() {
        document.getElementById('modalNovoOrgao').classList.remove('active');
        document.getElementById('formNovoOrgao').reset();
    };

    window.salvarNovoOrgao = async function() {
        const nick         = document.getElementById('novoOrgaoNick').value.trim();
        const nome_oficial = document.getElementById('novoOrgaoNome').value.trim();
        const categoria_slug = document.getElementById('novoOrgaoCat').value;
        const imagem_url   = document.getElementById('novoOrgaoImagem').value.trim() || null;
        const ordem        = parseInt(document.getElementById('novoOrgaoOrdem').value) || 99;
        if (!nick || !nome_oficial) return showToast('Preencha nick e nome.', 'erro');
        try {
            await apiFetch('/api/orgaos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nick, nome_oficial, categoria_slug, imagem_url, ordem }) });
            fecharModalNovoOrgao();
            showToast('Órgão/Centro criado!', 'ok');
            await carregarDados();
        } catch (e) { showToast(e.message, 'erro'); }
    };

    /* ── Toast ── */
    function showToast(msg, tipo) {
        tipo = tipo || 'ok';
        const t = document.createElement('div');
        t.className = 'dme-toast dme-toast-' + tipo;
        t.textContent = msg;
        document.body.appendChild(t);
        requestAnimationFrame(function() { t.classList.add('show'); });
        setTimeout(function() { t.classList.remove('show'); setTimeout(function() { t.remove(); }, 300); }, 3000);
    }

    /* ── Init ── */
    document.addEventListener('DOMContentLoaded', async function() {

        const orgao = JSON.parse(localStorage.getItem('dme_orgao_selecionado') || 'null');

if (orgao) {

    const imagem =
        orgao.icone ||
        orgao.icon ||
        orgao.imagem_url ||
        '';

    console.log('Imagem:', imagem);

    const inicioIcon = document.getElementById('inicioIcon');
    if (inicioIcon) {
        inicioIcon.src = imagem;
    }

    const centroIcon = document.getElementById('centroIcon');
    if (centroIcon) {
        centroIcon.src = imagem;
    }
}

        try {
            const me = await apiFetch('/api/auth/me');
            const username = me.nick || me.sub || '';
            isAdmin = (me.role === 'admin');

            document.getElementById('navUserName').textContent = username;
            document.getElementById('dropdownName').textContent = username;
            document.getElementById('navUserImage').src = 'https://www.habbo.com.br/habbo-imaging/avatarimage?user=' + encodeURIComponent(username) + '&headonly=1&size=m&gesture=std&head_direction=2';
            document.getElementById('dropdownUserImage').src = 'https://www.habbo.com.br/habbo-imaging/avatarimage?user=' + encodeURIComponent(username) + '&size=m&direction=2&head_direction=2&gesture=std';

            if (isAdmin) {
                const painel = document.getElementById('dropdownPainel');
                if (painel) painel.style.display = 'flex';
                const adminBar = document.getElementById('adminToolbar');
                if (adminBar) adminBar.style.display = 'flex';
            }

            const cargoEl = document.getElementById('dropdownCargo');
            if (cargoEl) {
                const sel = getOrgaoSelecionado();
                cargoEl.textContent = (sel && (sel.title || sel.nome_oficial)) ? (sel.title || sel.nome_oficial) : 'Militar DME';
            }
        } catch (e) {
            window.location.href = '/login';
            return;
        }

        /*const selected = getOrgaoSelecionado();
        const statSel = document.getElementById('statSelecionado');
        if (statSel) statSel.textContent = (selected && (selected.icone || selected.icon)) ? (selected.icone || selected.icon) : '—';*/

        const selected = getOrgaoSelecionado();
        const statSel = document.getElementById('statSelecionado');

        if (statSel) {
        const icone = selected && (selected.icone || selected.icon);

        // Se for uma URL (começa com http ou termina em .png/.gif/.jpg), mostra apenas "—"
        if (icone && !/^https?:\/\//.test(icone) && !/\.(png|jpg|jpeg|gif)$/i.test(icone)) {
            statSel.textContent = icone;
        } else {
            statSel.textContent = '—';
        }
        }

        await carregarDados();

        /* Sidebar */
        const hamburger = document.getElementById('hamburger');
        const sidebar   = document.getElementById('mobileSidebar');
        const overlay   = document.getElementById('sidebarOverlay');
        const closeBtn  = document.getElementById('sidebarClose');
        if (hamburger && sidebar && overlay) {
            var toggle = function() { sidebar.classList.toggle('active'); overlay.classList.toggle('active'); };
            hamburger.addEventListener('click', toggle);
            if (closeBtn) closeBtn.addEventListener('click', toggle);
            overlay.addEventListener('click', toggle);
        }

        /* Dropdown usuário */
        const userProfileBtn = document.getElementById('userProfileBtn');
        const userDropdown   = document.getElementById('userDropdown');
        if (userProfileBtn && userDropdown) {
            userProfileBtn.addEventListener('click', function(e) { e.stopPropagation(); userDropdown.classList.toggle('active'); });
            document.addEventListener('click', function() { userDropdown.classList.remove('active'); });
        }

        /* Busca */
        const searchInput = document.getElementById('funcaoSearch');
        if (searchInput) {
            searchInput.addEventListener('input', function() { renderList(this.value.trim()); });
        }

        window.logout = logout;

        /* Fechar modais clicando no fundo */
        document.querySelectorAll('.modal-co-wrap').forEach(function(m) {
            m.addEventListener('click', function(e) { if (e.target === m) m.classList.remove('active'); });
        });
    });

})();
