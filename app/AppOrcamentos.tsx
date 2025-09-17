'use client';
import React, { useEffect, useMemo, useState } from 'react';

/* ===================== Tipos (unions) ===================== */
type Aba = 'catalogo' | 'carrinho' | 'pedidos' | 'perfil';
type Role = 'cliente' | 'colaborador';
type Categoria = 'todas' | 'buzios' | 'pingente' | 'vidrilho' | 'firma';
type StatusOption =
  | 'Em conferência'
  | 'Orçamento atualizado'
  | 'Confirmado'
  | 'Aguardando pagamento'
  | 'Pagamento confirmado'
  | 'Pedido separado'
  | 'Pronto para retirada'
  | 'Finalizado'
  | 'Cancelado';

/* ===================== UI mínima ===================== */
const Card = ({ className = "", children }: any) => (
  <div className={`bg-white border border-slate-200 rounded-2xl shadow-sm ${className}`}>{children}</div>
);
const CardContent = ({ className = "", children }: any) => (
  <div className={`p-4 ${className}`}>{children}</div>
);
const Button = ({ className = "", children, ...props }: any) => (
  <button
    className={`inline-flex items-center justify-center rounded-xl border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50 active:bg-slate-100 ${className}`}
    {...props}
  >
    {children}
  </button>
);

/* Input controlado + filtro de props internas */
const Input = ({
  className = "",
  type = "text",
  value,
  defaultValue,
  onChange,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & {
  __tabsValue?: unknown;
  __setTabsValue?: unknown;
}) => {
  const { __tabsValue, __setTabsValue, ...props } = rest as Record<string, unknown>;
  const normalizedValue =
    value === undefined ? (defaultValue as string | number | readonly string[] | undefined) : value;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (value !== undefined) {
      onChange?.({
        ...e,
        target: { ...e.target, value: e.target.value },
      } as unknown as React.ChangeEvent<HTMLInputElement>);
    } else {
      onChange?.(e);
    }
  };

  return (
    <input
      type={type}
      className={`w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300 ${className}`}
      {...props}
      {...(value !== undefined ? { value: normalizedValue } : {})}
      onChange={handleChange}
    />
  );
};

const Badge = ({ children, className = "" }: any) => (
  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs border ${className}`}>{children}</span>
);
const Separator = ({ className = "" }: any) => <div className={`h-px w-full bg-slate-200 ${className}`} />;

/* ===================== Tabs ===================== */
function Tabs({
  value,
  onValueChange,
  children,
}: {
  value: string;
  onValueChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div data-tabs>
      {React.Children.map(children as any, (c: any) =>
        React.isValidElement(c)
          ? React.cloneElement(c as any, { __tabsValue: value, __setTabsValue: onValueChange } as any)
          : c
      )}
    </div>
  );
}
function TabsList({ className = "", children, __tabsValue, __setTabsValue }: any) {
  const kids = React.Children.map(children as any, (c: any) =>
    React.isValidElement(c)
      ? React.cloneElement(c as any, { __tabsValue, __setTabsValue } as any)
      : c
  );
  return <div className={`grid grid-cols-4 w-full gap-2 ${className}`}>{kids}</div>;
}
function TabsTrigger({ value, children, __tabsValue, __setTabsValue }: any) {
  const active = __tabsValue === value;
  return (
    <button
      onClick={() => __setTabsValue?.(value)}
      className={`rounded-xl px-3 py-2 text-sm border ${
        active ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
      }`}
    >
      {children}
    </button>
  );
}
function TabsContent({ value, children, __tabsValue }: any) {
  if (value !== __tabsValue) return null;
  return <div className="mt-3">{children}</div>;
}

/* ===================== Select “wrapper” ===================== */
function Select({ value, onValueChange, children }: any) {
  const options: { value: string; label: string }[] = [];
  React.Children.forEach(children, (c: any) => {
    if (c?.type?.displayName === "SelectContent") {
      React.Children.forEach(c.props.children, (item: any) => {
        if (item?.type?.displayName === "SelectItem")
          options.push({ value: item.props.value, label: item.props.children });
      });
    }
  });
  return (
    <select
      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm bg-white"
      value={value}
      onChange={(e) => onValueChange?.(e.target.value)}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}
function SelectTrigger({ children }: any) { return <>{children}</>; }
function SelectValue({ placeholder }: any) { return <span className="text-slate-500">{placeholder}</span>; }
function SelectContent({ children }: any) { return <>{children}</>; }
function SelectItem({ value, children }: any) { return <option value={value}>{children}</option>; }
SelectContent.displayName = "SelectContent";
SelectItem.displayName = "SelectItem";
/* ===================== Utils ===================== */
function svgPlaceholder(text = "Sem imagem") {
  const safe = encodeURIComponent(text);
  return `data:image/svg+xml;charset=UTF-8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='300'><rect width='100%' height='100%' fill='%23f8fafc'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%2364748b' font-family='Inter,Arial' font-size='20'>${safe}</text></svg>`;
}
function ImageWithFallback({ src, alt, h = 144 }: { src?: string; alt?: string; h?: number }) {
  const [err, setErr] = useState(false);
  return (
    <img
      src={err || !src ? svgPlaceholder(alt || "Sem imagem") : src}
      alt={alt || "imagem"}
      className="w-full object-cover bg-slate-100"
      style={{ height: h }}
      onError={() => setErr(true)}
    />
  );
}

/* ===================== Mock DB (4 produtos + categoria) ===================== */
const MOCK_PRODUCTS = [
  { id: "P-1001", codigo: "BUZ-AFRICANO", nome: "Búzios Africano", cor: "Natural", unidadePadrao: "UN", foto: "", descricao: "Búzios selecionados.", categoria: "buzios" as Categoria },
  { id: "P-1002", codigo: "PING-OXALA",   nome: "Pingente Oxalá",  cor: "Prata",   unidadePadrao: "UN", foto: "", descricao: "Pingente religioso.", categoria: "pingente" as Categoria },
  { id: "P-1003", codigo: "VID-11-0",     nome: "Vidrilho 11/0",   cor: "Sortido", unidadePadrao: "UN", foto: "", descricao: "Vidrilho para artesanato.", categoria: "vidrilho" as Categoria },
  { id: "P-1004", codigo: "FIRMA-TORCIDA",nome: "Firma Torcida",   cor: "Sortido", unidadePadrao: "UN", foto: "", descricao: "Firma torcida para montagens.", categoria: "firma" as Categoria },
];

const UNIDADES = ["UN", "KG", "PC", "CJ", "M", "L"] as const;
const FORMAS_PGTO = ["Dinheiro", "Pix", "Boleto"] as const;

const PIX_KEYS = [
  { id: "pix1", label: "PIX (Telefone)", tipo: "Telefone", chave: "+55 (11) 91234-5678", banco: "Banco Fictício S.A. 999", titular: "COMERCIAL ACME LTDA", agencia: "0001", conta: "12345-6" },
  { id: "pix2", label: "PIX (CNPJ)",     tipo: "CNPJ",     chave: "12.345.678/0001-90",  banco: "Banco Demo 123",        titular: "ACME IMPORTS EIRELI",  agencia: "4321", conta: "98765-4" },
] as const;

/* ===================== Helpers ===================== */
const STATUS_FLOW: StatusOption[] = [
  "Em conferência","Orçamento atualizado","Confirmado","Aguardando pagamento","Pagamento confirmado","Pedido separado","Pronto para retirada","Finalizado","Cancelado"
];
function statusColorClasses(status: string) {
  const s = (status || '').toLowerCase();
  if (s.includes('em confer')) return 'bg-amber-100 text-amber-800 border-amber-200';
  if (s.includes('orçamento atualizado')) return 'bg-purple-100 text-purple-800 border-purple-200';
  if (s === 'confirmado') return 'bg-blue-100 text-blue-800 border-blue-200';
  if (s.includes('aguardando pag')) return 'bg-orange-100 text-orange-800 border-orange-200';
  if (s.includes('pagamento confirmado')) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
  if (s.includes('pedido separado')) return 'bg-violet-100 text-violet-800 border-violet-200';
  if (s.includes('pronto para retirada')) return 'bg-cyan-100 text-cyan-800 border-cyan-200';
  if (s.includes('finalizado')) return 'bg-slate-900 text-white border-slate-900';
  if (s.includes('cancelado')) return 'bg-rose-100 text-rose-800 border-rose-200';
  return 'bg-slate-100 text-slate-700 border-slate-200';
}
function canDeleteStatus(status: string) {
  const idx = STATUS_FLOW.indexOf('Confirmado');
  const cur = STATUS_FLOW.indexOf(status as StatusOption);
  return cur === -1 || cur < idx;
}
function isTerminal(status: string) { return status === 'Finalizado' || status === 'Cancelado'; }
function currencyBRL(v = 0) { return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }); }
function uid(prefix = "id") { return `${prefix}-${Math.random().toString(36).slice(2, 10)}`; }
function computeTotal(itens: any[]) { return itens.reduce((acc, it) => acc + (Number(it.preco)||0)*(Number(it.quantidade)||0), 0); }
function isOwner(orc: any, user: { id?: string; email?: string } | null) {
  if (!orc || !user) return false;
  const oe = String(orc.clienteEmail || "").toLowerCase();
  const ue = String(user.email || "").toLowerCase();
  if (oe && ue && oe === ue) return true;
  return !!orc.clienteId && !!user.id && orc.clienteId === user.id;
}
function makeHistoryEntry(user: any, action: string, from: string | null, to: string, extra: any = {}) {
  return { id: uid("log"), ts: new Date().toISOString(), userId: user?.id || null, userName: user?.nome || null, action, from, to, ...extra };
}
function computeDueDates(prazo: string, base = new Date()): string[] {
  const addDays = (d: number) => { const dt = new Date(base); dt.setDate(dt.getDate()+d); return dt.toISOString(); };
  const norm = (prazo || '').toLowerCase();
  if (norm.includes('á vista') || norm.includes('a vista')) return [addDays(0)];
  if (norm.includes('acordado')) return [];
  const parts = prazo.split('/').map((x)=>parseInt(x.replace(/\D/g,''),10)).filter((n)=>!isNaN(n));
  if (parts.length) return parts.map(addDays);
  return [];
}
function runSelfTests() { try { computeTotal([]); } catch {} }

/* filtro combinado: termo + categoria */
function filterProducts(list: any[], filtro: { termo: string; categoria: Categoria }) {
  const termo = (filtro.termo || "").toLowerCase();
  return list.filter((p) => {
    const hitTermo =
      !termo ||
      p.nome.toLowerCase().includes(termo) ||
      p.codigo.toLowerCase().includes(termo) ||
      (p.cor || '').toLowerCase().includes(termo);
    const hitCat = filtro.categoria === 'todas' || p.categoria === filtro.categoria;
    return hitTermo && hitCat;
  });
}
/* ===================== Persistência local ===================== */
let GLOBAL_ORCAMENTOS: any[] = [];
const USERS_KEY = "portal_users_v1";
const STORAGE_KEY = "orcamentos_store_v1";
function emitChange() { try { window.dispatchEvent(new Event("orcamentos:changed")); } catch {} }
function loadGlobal(): any[] {
  try { const raw = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null; if (!raw) return []; const parsed = JSON.parse(raw); return Array.isArray(parsed)? parsed: []; } catch { return []; }
}
function saveGlobal(list: any[]) { try { if (typeof window !== 'undefined') window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch {} }
function loadUsers(): any[] {
  try { const raw = typeof window !== 'undefined' ? window.localStorage.getItem(USERS_KEY) : null; if (!raw) return []; const arr = JSON.parse(raw); return Array.isArray(arr)? arr: []; } catch { return []; }
}
function saveUsers(users: any[]) { try { if (typeof window !== 'undefined') window.localStorage.setItem(USERS_KEY, JSON.stringify(users)); } catch {} }
function setGlobal(list: any[]) { GLOBAL_ORCAMENTOS = list; saveGlobal(GLOBAL_ORCAMENTOS); emitChange(); }
try { const init = loadGlobal(); if (init.length) GLOBAL_ORCAMENTOS = init; } catch {}
async function notifyEmailUpdate(to: string, subject: string, body: string, attachments: { name: string; type: string; dataUrl: string }[] = []) { console.log("[Email] To:", to, "Subject:", subject, "Body:", body, "Attachments:", attachments.map((a) => a.name)); return true; }

// ==== MASKS & CEP LOOKUP (helpers) =====================================
function onlyDigits(v: string = "") {
  return (v || "").replace(/\D+/g, "");
}

function formatCNPJ(v: string = "") {
  const d = onlyDigits(v).slice(0, 14);
  const p = [];
  if (d.length > 2) p.push(d.slice(0, 2));
  if (d.length > 5) p.push(d.slice(2, 5));
  if (d.length > 8) p.push(d.slice(5, 8));
  const rest = d.slice(8, 12);
  const tail = d.slice(12, 14);
  let out = "";
  if (p.length) out = `${p[0]}.${p[1] || ""}`;
  if (p.length >= 2) out = `${p[0]}.${p[1]}.${p[2] || ""}`;
  if (d.length <= 8) out = d.replace(/^(\d{2})(\d{0,3})?(\d{0,3})?/, (m, a, b="", c="") => {
    return [a, b && "."+b, c && "."+c].filter(Boolean).join("");
  });
  if (d.length > 8) {
    out = `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5,8)}` +
          (rest ? `/${rest}` : "") +
          (tail ? `-${tail}` : "");
  }
  return out;
}

function formatCEP(v: string = "") {
  const d = onlyDigits(v).slice(0, 8);
  if (d.length <= 5) return d;
  return `${d.slice(0,5)}-${d.slice(5)}`;
}

function formatPhoneBR(v: string = "") {
  // Aceita fixo ou celular com DDD. Ex.: (11) 91234-5678 / (11) 1234-5678
  const d = onlyDigits(v).slice(0, 11);
  if (d.length <= 10) {
    // fixo
    // (XX) XXXX-XXXX
    if (d.length <= 2) return `(${d}`;
    if (d.length <= 6) return `(${d.slice(0,2)}) ${d.slice(2)}`;
    if (d.length <= 10) return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`;
    return d;
  } else {
    // celular (11 dígitos)
    // (XX) 9XXXX-XXXX
    return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
  }
}

async function lookupCep(cepMasked: string) {
  const d = onlyDigits(cepMasked);
  if (d.length !== 8) return null;
  try {
    const res = await fetch(`https://viacep.com.br/ws/${d}/json/`);
    const data = await res.json();
    if (data?.erro) return null;
    return {
      logradouro: data.logradouro || "",
      bairro: data.bairro || "",
      cidade: data.localidade || "",
      uf: data.uf || "",
      cep: formatCEP(d),
    };
  } catch {
    return null;
  }
}

/* ===================== App principal ===================== */
export default function AppOrcamentos() {
  const [usuario, setUsuario] = useState<null | { id: string; nome: string; email: string; role: Role }>(null);
  const [aba, setAba] = useState<Aba>('catalogo');
  const [filtro, setFiltro] = useState<{ termo: string; categoria: Categoria }>({ termo: "", categoria: "todas" });
  const [carrinho, setCarrinho] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>(loadUsers());
  const [showRegister, setShowRegister] = useState(false);
  const [orcamentos, setOrcamentos] = useState<any[]>([]);

  function syncFromGlobal(user: { id: string; role: Role; email?: string } | null) {
    if (!user) return;
    const list = user.role === "cliente" ? GLOBAL_ORCAMENTOS.filter((o) => isOwner(o, user)) : GLOBAL_ORCAMENTOS;
    setOrcamentos(list);
  }
  useEffect(() => {
    function onChange() { if (usuario) syncFromGlobal(usuario); }
    window.addEventListener("orcamentos:changed", onChange);
    return () => window.removeEventListener("orcamentos:changed", onChange);
  }, [usuario]);
  useEffect(() => { try { runSelfTests(); } catch {} }, []);

  function handleLogin(
  role: "cliente" | "colaborador",
  email: string,
  senha: string
) {
  const r = role === "colaborador" ? "colaborador" : "cliente";
  const emailNorm = String(email || "").trim().toLowerCase();
  const senhaNorm = String(senha || "").trim();

  if (!emailNorm || !senhaNorm) {
    alert("Informe e-mail e senha.");
    return;
  }

  if (r === "cliente") {
    // procura no cadastro local
    const found = (users || []).find(
      (u: any) => u.email === emailNorm && u.senha === senhaNorm
    );
    if (!found) {
      alert("Cliente não encontrado ou senha inválida. Cadastre-se antes.");
      return;
    }

    const user = {
      id: found.id,
      nome: found.username || found.razaoSocial || emailNorm.split("@")[0],
      email: emailNorm,
      role: "cliente" as const,
    };

    setUsuario(user);
    syncFromGlobal(user);
    // vai direto para "pedidos" após logar
    setAba("pedidos");
  } else {
    // colaborador: acesso simples
    const user = {
      id: uid("user"),
      nome: emailNorm.split("@")[0],
      email: emailNorm,
      role: "colaborador" as const,
    };
    setUsuario(user);
    setOrcamentos(GLOBAL_ORCAMENTOS);
    setAba("todos");
  }
}


  function logout() { setUsuario(null); setCarrinho([]); setOrcamentos([]); setAba("catalogo"); }
  function addToCart(produto: any, unidade: string, quantidade: number, preco: number) { setCarrinho((prev) => [...prev, { ...produto, unidade, quantidade, preco }]); }
  function removeFromCart(idx: number) { setCarrinho((prev) => prev.filter((_, i) => i !== idx)); }

  function finalizarOrcamento(formaPagamento: string, prazoTermo: string, descontoPct: number, pixInfo?: any, comprovante?: { name: string; type: string; dataUrl: string } | null = null) {
    if (!carrinho.length || !usuario) return;
    const now = new Date().toISOString();

    // snapshot do cliente no momento do pedido (perfil futuro não altera)
    const uSnap = (users || []).find((uu: any) => uu.id === usuario.id || (uu.email||'').toLowerCase() === (usuario.email||'').toLowerCase()) || {};

    const novo = {
      id: uid("orc"),
      clienteId: usuario.id,
      clienteEmail: (usuario.email || "").toLowerCase(),
      clienteNome: usuario.nome || (usuario.email?.split("@")[0]) || "Cliente",
      clienteSnapshot: {
        razaoSocial: uSnap?.razaoSocial || uSnap?.username || usuario.nome,
        cnpj: uSnap?.cnpj || '',
        ie: uSnap?.ie || '',
        endereco: uSnap?.endereco || '',
        cidade: uSnap?.cidade || '',
        uf: uSnap?.uf || '',
        cep: uSnap?.cep || '',
        telefone: uSnap?.telefone || '',
        email: uSnap?.email || usuario.email || '',
      },
      itens: carrinho,
      descontoPct: Number(descontoPct) || 0,
      formaPagamento,
      pagamentoPix: formaPagamento === "Pix" ? (pixInfo || null) : null,
      comprovantes: comprovante ? [comprovante] : [],
      prazo: prazoTermo,
      dueDates: computeDueDates(prazoTermo),
      status: "Em conferência" as StatusOption,
      criadoEm: now,
      history: [makeHistoryEntry(usuario, "criou", null, "Em conferência")],
      anexos: [] as { id: string; nome: string; tipo: string; url: string; dataUrl?: string }[],
    };
    setOrcamentos((prev) => [novo, ...prev]);
    setGlobal([novo, ...GLOBAL_ORCAMENTOS]);
    setCarrinho([]); setAba('pedidos' as Aba);
  }

  function alterarStatus(orcId: string, status: StatusOption) {
    const now = new Date().toISOString();
    setOrcamentos((prev) => prev.map((o) => {
      if (o.id !== orcId) return o;
      const entry = makeHistoryEntry(usuario, "alterou status", o.status, status);
      const next = { ...o, status, history: [...(o.history || []), entry] };
      notifyEmailUpdate(o.clienteEmail || "cliente@exemplo.com", `Atualização do pedido #${o.id}`,
        `Status alterado de "${o.status}" para "${status}" em ${new Date(now).toLocaleString("pt-BR")} por ${usuario?.nome || "colaborador"}.`);
      return next;
    }));
    setGlobal(GLOBAL_ORCAMENTOS.map((o) => o.id !== orcId ? o : { ...o, status, history: [...(o.history || []), makeHistoryEntry(usuario, "alterou status", o.status, status)] }));
  }

  function excluirOrcamento(orcId: string) {
    setOrcamentos((prev) => {
      const alvo = prev.find((o) => o.id === orcId);
      if (!alvo) return prev;
      if (!canDeleteStatus(alvo.status)) { alert('Este pedido não pode mais ser excluído. Após "Confirmado" somente cancelamento.'); return prev; }
      const next = prev.filter((o) => o.id !== orcId);
      setGlobal(GLOBAL_ORCAMENTOS.filter((o) => o.id !== orcId));
      return next;
    });
  }
  function cancelarOrcamento(orcId: string) {
    const motivo = prompt('Informe o motivo do cancelamento:'); if (!motivo) return;
    const now = new Date().toISOString();
    setOrcamentos((prev) => prev.map((o) => {
      if (o.id !== orcId) return o;
      const entry = makeHistoryEntry(usuario, "cancelou", o.status, "Cancelado", { motivo });
      const next = { ...o, status: 'Cancelado' as StatusOption, cancelReason: motivo, history: [...(o.history || []), entry] };
      notifyEmailUpdate(o.clienteEmail || "cliente@exemplo.com", `Cancelamento do pedido #${o.id}`,
        `${usuario?.nome || 'usuário'} cancelou o pedido em ${new Date(now).toLocaleString('pt-BR')}\nMotivo: ${motivo}`);
      return next;
    }));
    setGlobal(GLOBAL_ORCAMENTOS.map((o) => o.id !== orcId ? o : ({ ...o, status: 'Cancelado', cancelReason: motivo, history: [...(o.history || []), makeHistoryEntry(usuario, "cancelou", o.status, "Cancelado", { motivo })] })));
  }

  const produtosFiltrados = useMemo(() => filterProducts(MOCK_PRODUCTS, filtro), [filtro]);

  return (
    <div className="min-h-screen bg-slate-100 p-4">
      {!usuario ? (
        <AuthCard
          onSubmit={handleLogin}
          onRegister={(u: any) => { const next = [...users, u]; setUsers(next); saveUsers(next); setShowRegister(false); }}
          showRegister={showRegister}
          setShowRegister={setShowRegister}
        />
      ) : (
        <>
          <header className="flex justify-between items-center mb-4">
            <h1 className="font-bold">Portal - Importadora</h1>
            <div className="flex gap-2 items-center">
              <Badge className="bg-slate-900 text-white border-slate-900">{usuario.role}</Badge>
              <span>Olá, {usuario.nome}</span>
              <Button className="text-sm" onClick={logout}>Sair</Button>
            </div>
          </header>
          <Separator className="mb-4" />

          {usuario.role === "cliente" ? (
            <Tabs value={aba} onValueChange={(v) => setAba(v as Aba)}>
              <TabsList>
                <TabsTrigger value="catalogo">Catálogo</TabsTrigger>
                <TabsTrigger value="carrinho">Carrinho</TabsTrigger>
                <TabsTrigger value="pedidos">Pedidos</TabsTrigger>
                <TabsTrigger value="perfil">Meu Perfil</TabsTrigger>
              </TabsList>

              <TabsContent value="catalogo">
                <Catalogo produtos={produtosFiltrados} filtro={filtro} setFiltro={setFiltro} onAdd={addToCart} />
              </TabsContent>

              <TabsContent value="carrinho">
                <Carrinho
                  itens={carrinho}
                  total={computeTotal(carrinho)}
                  onFinalizar={finalizarOrcamento}
                  onRemove={removeFromCart}
                />
              </TabsContent>

              <TabsContent value="pedidos">
                <ListaOrcamentos
                  orcamentos={orcamentos}
                  users={users}
                  onAlterarStatus={alterarStatus}
                  onAddAttachments={anexarArquivos}
                  onDelete={excluirOrcamento}
                  onCancel={cancelarOrcamento}
                  isAdmin={false}
                />
              </TabsContent>

              <TabsContent value="perfil">
                <Perfil usuario={usuario} users={users} setUsers={setUsers} setUsuario={setUsuario} />
              </TabsContent>
            </Tabs>
          ) : (
            <Tabs value={aba} onValueChange={(v) => setAba(v as Aba)}>
              <TabsList className="grid grid-cols-1 w-full">
                <TabsTrigger value="pedidos">Pedidos Recebidos</TabsTrigger>
              </TabsList>
              <TabsContent value="pedidos">
                <ListaOrcamentos
                  orcamentos={orcamentos}
                  users={users}
                  onAlterarStatus={alterarStatus}
                  onAddAttachments={anexarArquivos}
                  onDelete={excluirOrcamento}
                  onCancel={cancelarOrcamento}
                  isAdmin={true}
                />
              </TabsContent>
            </Tabs>
          )}
        </>
      )}
    </div>
  );

  /* anexos em pedidos */
  async function anexarArquivos(orcId: string, files: FileList | null, tipo: "foto" | "documento") {
    if (!files || files.length === 0) return;
    const arr = Array.from(files);
    const lidos = await Promise.all(arr.map((f) => new Promise<{ id: string; nome: string; tipo: string; url: string; dataUrl: string }>((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = () => resolve({ id: uid("att"), nome: f.name, tipo: f.type || (tipo === "foto" ? "image/*" : "application/octet-stream"), url: String(fr.result), dataUrl: String(fr.result) });
      fr.onerror = () => reject(fr.error);
      fr.readAsDataURL(f);
    })));

    const apply = (list: any[]) => list.map((o) => {
      if (o.id !== orcId) return o;
      const nextAtt = [...(o.anexos || []), ...lidos];
      const entry = makeHistoryEntry(usuario, tipo === "foto" ? "anexou fotos" : "anexou documentos", null, o.status, { qtd: lidos.length });
      const next = { ...o, anexos: nextAtt, history: [...(o.history || []), entry] };
      notifyEmailUpdate(o.clienteEmail || "cliente@exemplo.com", `Atualização do pedido #${o.id} (novos anexos)`, `${usuario?.nome || "colaborador"} adicionou ${lidos.length} arquivo(s) ao pedido #${o.id}.`, lidos.map((x) => ({ name: x.nome, type: x.tipo, dataUrl: x.dataUrl })));
      return next;
    });

    setOrcamentos((prev) => apply(prev));
    setGlobal(apply(GLOBAL_ORCAMENTOS));
  }
}
/* ===================== Catálogo ===================== */
function Catalogo({ produtos, filtro, setFiltro, onAdd }: any) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <Input
          placeholder="Pesquisar por nome, código ou cor..."
          value={filtro.termo}
          onChange={(e) => setFiltro((p: any) => ({ ...p, termo: e.target.value }))}
        />
        <select
          className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm bg-white"
          value={filtro.categoria}
          onChange={(e) => setFiltro((p: any) => ({ ...p, categoria: e.target.value as Categoria }))}
        >
          <option value="todas">Todas as categorias</option>
          <option value="buzios">Búzios</option>
          <option value="pingente">Pingente</option>
          <option value="vidrilho">Vidrilho</option>
          <option value="firma">Firma</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {produtos.map((p: any) => (
          <Card key={p.id}>
            <ImageWithFallback src={p.foto} alt={p.nome} />
            <CardContent className="p-3 space-y-2">
              <div className="text-center text-slate-500">{p.nome}</div>
              <h3 className="font-semibold">{p.nome}</h3>
              <p className="text-xs text-slate-500">Código: {p.codigo}</p>
              <p className="text-[11px] text-slate-500">Categoria: {p.categoria}</p>
              <AddToCartInline produto={p} onAdd={onAdd} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function AddToCartInline({ produto, onAdd }: any) {
  const [unidade, setUnidade] = useState(produto.unidadePadrao);
  const [quantidade, setQuantidade] = useState(0);
  const [preco, setPreco] = useState(0);
  return (
    <div className="space-y-1">
      <Select value={unidade} onValueChange={setUnidade}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          {(UNIDADES as readonly string[]).map((u) => (<SelectItem key={u} value={u}>{u}</SelectItem>))}
        </SelectContent>
      </Select>
      <Input type="number" placeholder="Qtd." value={quantidade} onChange={(e) => setQuantidade(Number(e.target.value))} />
      <Input type="number" placeholder="Preço" value={preco} onChange={(e) => setPreco(Number(e.target.value))} />
      <Button onClick={() => onAdd(produto, unidade, quantidade, preco)}>Adicionar</Button>
    </div>
  );
}

/* util: copiar texto */
function copyText(text: string) {
  try { navigator.clipboard.writeText(text); alert('Copiado!'); } catch { }
}

/* ===================== Carrinho ===================== */
function Carrinho({ itens, total, onFinalizar, onRemove }: any) {
  const [forma, setForma] = useState("Pix");
  const [prazo, setPrazo] = useState("Á Vista");
  const [desconto, setDesconto] = useState(0);
  const subtotal = total;
  const valorDesc = (Math.max(0, Math.min(100, Number(desconto))) * subtotal) / 100;
  const totalLiquido = Math.max(0, subtotal - valorDesc);
  const PRAZOS = ["30 dias", "30/45 dias", "30/45/60 dias", "Á Vista", "Acordado"];
  const dueDates = computeDueDates(prazo);
  const dueLabel = dueDates.length
    ? dueDates.map((d) => new Date(d).toLocaleDateString("pt-BR")).join(" • ")
    : (prazo.toLowerCase().includes("acordado") ? "a combinar" : "-");

  const [pixId, setPixId] = useState(PIX_KEYS[0]?.id || "");
  const selectedPix = useMemo(() => PIX_KEYS.find((p:any) => p.id === pixId) || null, [pixId]);

  /* comprovante (Pix/Boleto) */
  const [comprovante, setComprovante] = useState<{ name: string; type: string; dataUrl: string } | null>(null);
  async function onPickComprovante(files: FileList | null) {
    if (!files || files.length === 0) return setComprovante(null);
    const f = files[0];
    const fr = new FileReader();
    fr.onload = () => setComprovante({ name: f.name, type: f.type || 'application/octet-stream', dataUrl: String(fr.result) });
    fr.readAsDataURL(f);
  }

  return (
    <div className="space-y-3">
      {itens.map((it: any, i: number) => (
        <Card key={i}>
          <CardContent className="flex justify-between items-center gap-3">
            <span className="truncate">{it.nome} ({it.quantidade}x)</span>
            <span className="whitespace-nowrap">{currencyBRL((Number(it.preco) || 0) * (Number(it.quantidade) || 0))}</span>
            <Button onClick={() => onRemove(i)} className="text-red-600 border-red-300">Remover</Button>
          </CardContent>
        </Card>
      ))}

      <div className="space-y-1 text-sm">
        <div>Subtotal: <b>{currencyBRL(subtotal)}</b></div>
        <div className="flex items-center gap-2">Desconto (%):
          <Input type="number" value={desconto} onChange={(e) => setDesconto(Number(e.target.value))} className="w-24" />
          <span>(-{currencyBRL(valorDesc)})</span>
        </div>
        <div>Total: <b>{currencyBRL(totalLiquido)}</b></div>
      </div>

      {/* Prazo de pagamento */}
      <select className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm bg-white" value={prazo} onChange={(e) => setPrazo(e.target.value)}>
        {PRAZOS.map((p) => <option key={p} value={p}>{p}</option>)}
      </select>
      <div className="text-xs text-slate-600">Vencimentos: <b>{dueLabel}</b></div>

      {/* Forma de pagamento */}
      <select className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm bg-white" value={forma} onChange={(e) => setForma(e.target.value)}>
        {(FORMAS_PGTO as readonly string[]).map((f) => <option key={f} value={f}>{f}</option>)}
      </select>

      {/* PIX */}
      {forma === "Pix" && (
        <Card>
          <CardContent className="space-y-2">
            <div className="text-sm font-medium">Chave PIX</div>
            <select className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm bg-white" value={pixId} onChange={(e) => setPixId(e.target.value)}>
              {PIX_KEYS.map((k:any) => (<option key={k.id} value={k.id}>{k.label} — {k.chave}</option>))}
            </select>
            {selectedPix && (
              <>
                <div className="text-xs text-slate-700 grid grid-cols-1 sm:grid-cols-2 gap-y-1 gap-x-4">
                  <div><span className="text-slate-500">Tipo:&nbsp;</span><b>{selectedPix.tipo}</b></div>
                  <div><span className="text-slate-500">Chave:&nbsp;</span><b>{selectedPix.chave}</b></div>
                  <div><span className="text-slate-500">Banco:&nbsp;</span><b>{selectedPix.banco}</b></div>
                  <div><span className="text-slate-500">Titular:&nbsp;</span><b>{selectedPix.titular}</b></div>
                  <div><span className="text-slate-500">Agência:&nbsp;</span><b>{selectedPix.agencia}</b></div>
                  <div><span className="text-slate-500">Conta:&nbsp;</span><b>{selectedPix.conta}</b></div>
                </div>
                <Button onClick={() => copyText(selectedPix.chave)}>Copiar chave PIX</Button>
              </>
            )}
            <div className="text-[11px] text-slate-500">
              Recomendamos efetuar o pagamento **após o pedido ser confirmado**.
              Se já pagou, anexe o comprovante abaixo para agilizar a conferência.
            </div>
          </CardContent>
        </Card>
      )}

      {/* Boleto/Pix comprovante */}
      {(forma === 'Pix' || forma === 'Boleto') && (
        <div className="space-y-2">
          <label className="text-xs text-slate-600">Anexar comprovante (PDF/JPG/PNG)</label>
          <input type="file" accept="application/pdf,image/*" onChange={(e) => onPickComprovante(e.target.files)} />
          {comprovante && <div className="text-xs text-slate-500">Selecionado: <b>{comprovante.name}</b></div>}
        </div>
      )}

      <Button onClick={() => onFinalizar(forma, prazo, desconto, forma === "Pix" ? selectedPix : null, comprovante)} disabled={!itens.length}>
        Finalizar
      </Button>

      <div className="text-xs text-slate-500">
        Clientes na loja: o pagamento pode ser feito após separação para agilizar.  
        Clientes à distância: aguarde a confirmação do pedido antes de pagar.
      </div>
    </div>
  );
}
/* ===================== Lista de Pedidos ===================== */
function ListaOrcamentos({ orcamentos, users, onAlterarStatus, onAddAttachments, onDelete, onCancel, isAdmin }: any) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const toggle = (id: string) => setExpanded((e) => ({ ...e, [id]: !e[id] }));
  return (
    <div className="space-y-3">
      {orcamentos.map((o: any) => {
        const canDelete = canDeleteStatus(o.status);
        const canCancel = !canDelete && !isTerminal(o.status);
        const roleColor = statusColorClasses(o.status);
        const totalBruto = computeTotal(o.itens);
        const totalLiq = Math.max(0, totalBruto * (1 - (Number(o.descontoPct) || 0) / 100));
        return (
          <Card key={o.id}>
            <CardContent className="p-0">
              <button className="w-full flex items-center justify-between px-4 py-3" onClick={() => toggle(o.id)}>
                <div className="flex items-center gap-3 text-left">
                  <div className="text-sm font-semibold">#{o.id}</div>
                  <div className="text-xs text-slate-500">{o.clienteNome || o.clienteEmail || 'Cliente'}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={roleColor}>{o.status}</Badge>
                  <span className="text-slate-400 text-xs">{expanded[o.id] ? 'Ocultar' : 'Exibir'}</span>
                </div>
              </button>
              <Separator />

              {expanded[o.id] && (
                <div className="p-4 space-y-4">
                  {/* 1) Itens */}
                  <div>
                    <div className="text-xs uppercase text-slate-500 mb-1">Itens</div>
                    <div className="divide-y rounded border">
                      {o.itens.map((it: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between p-2 text-sm">
                          <span className="truncate">{it.nome} ({it.quantidade}x)</span>
                          <span className="whitespace-nowrap">{currencyBRL((Number(it.preco)||0)*(Number(it.quantidade)||0))}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 2) Totais */}
                  <div className="text-sm space-y-1">
                    <div className="text-xs uppercase text-slate-500">Totais</div>
                    <div>Subtotal: <b>{currencyBRL(totalBruto)}</b></div>
                    {o.descontoPct ? <div>Desconto: <b>{o.descontoPct}%</b></div> : null}
                    <div>Total: <b>{currencyBRL(totalLiq)}</b></div>
                  </div>

                  {/* 3) Pagamento */}
                  <div className="text-sm space-y-1">
                    <div className="text-xs uppercase text-slate-500">Pagamento</div>
                    <div>Forma: <b>{o.formaPagamento}</b></div>
                    {o.prazo && <div>Prazo: <b>{o.prazo}</b></div>}
                    <div>Vencimentos: <b>{Array.isArray(o.dueDates) ? (o.dueDates.length ? o.dueDates.map((d: string) => new Date(d).toLocaleDateString('pt-BR')).join(' • ') : (String(o.prazo||'').toLowerCase().includes('acordado') ? 'a combinar' : '-')) : '-'}</b></div>
                  </div>

                  {/* 4) Snapshot de dados do cliente */}
                  <div className="text-sm space-y-1">
                    <div className="text-xs uppercase text-slate-500">Dados do cliente (no momento do pedido)</div>
                    <div>Razão Social/Usuário: <b>{o.clienteSnapshot?.razaoSocial || o.clienteNome || '-'}</b></div>
                    <div>CNPJ: <b>{o.clienteSnapshot?.cnpj || '-'}</b> &nbsp; IE: <b>{o.clienteSnapshot?.ie || '-'}</b></div>
                    <div>Endereço: <b>{o.clienteSnapshot?.endereco || '-'}</b></div>
                    <div>Cidade/UF: <b>{o.clienteSnapshot?.cidade || '-'} / {o.clienteSnapshot?.uf || '-'}</b> &nbsp; CEP: <b>{o.clienteSnapshot?.cep || '-'}</b></div>
                    <div>Telefone: <b>{o.clienteSnapshot?.telefone || '-'}</b></div>
                    <div>E-mail: <b>{o.clienteSnapshot?.email || o.clienteEmail || '-'}</b></div>
                  </div>

                  {/* 5) PIX */}
                  {o.formaPagamento === 'Pix' && o.pagamentoPix && (
                    <div className="text-sm space-y-1">
                      <div className="text-xs uppercase text-slate-500">PIX</div>
                      <div>Tipo: <b>{o.pagamentoPix.label}</b></div>
                      <div>Chave: <b>{o.pagamentoPix.chave}</b></div>
                      <div>Banco: <b>{o.pagamentoPix.banco}</b></div>
                      <div>Titular: <b>{o.pagamentoPix.titular}</b></div>
                      <div>Agência: <b>{o.pagamentoPix.agencia}</b></div>
                      <div>Conta: <b>{o.pagamentoPix.conta}</b></div>
                      <Button onClick={() => copyText(o.pagamentoPix.chave)}>Copiar chave PIX</Button>
                    </div>
                  )}

                  {/* 6) Comprovantes */}
                  {o.comprovantes?.length ? (
                    <div>
                      <div className="text-xs uppercase text-slate-500 mb-1">Comprovante(s)</div>
                      <ul className="list-disc pl-4 text-xs space-y-1">
                        {o.comprovantes.map((c: any, i: number) => (
                          <li key={i}><a className="underline" href={c.dataUrl} download={c.name}>Baixar {c.name}</a></li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {/* Histórico */}
                  <div>
                    <div className="text-xs uppercase text-slate-500 mb-1">Histórico/Auditoria</div>
                    <div className="border rounded bg-slate-50 max-h-40 overflow-auto divide-y">
                      {(o.history || []).map((h: any) => (
                        <div key={h.id} className="p-2 text-xs flex flex-wrap gap-2 items-center">
                          <span className="font-medium">{h.userName || '(desconhecido)'}</span>
                          <span className="text-slate-500">{new Date(h.ts).toLocaleString('pt-BR')}</span>
                          <span className="text-slate-600">{h.action}</span>
                          {h.from && <span className="text-slate-500">de "{h.from}"</span>}
                          <span className="text-slate-500">para "{h.to}"</span>
                          {h.motivo && <span className="text-rose-700">(motivo: {h.motivo})</span>}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {isAdmin && <AdminStatusControls status={o.status} onChange={(s: StatusOption) => onAlterarStatus(o.id, s)} />}
                    {canDelete && (
                      <Button className="border-rose-300 text-rose-700" onClick={() => { if (confirm('Confirma excluir este pedido?')) onDelete?.(o.id); }}>Excluir</Button>
                    )}
                    {canCancel && (
                      <Button className="border-amber-300 text-amber-700" onClick={() => onCancel?.(o.id)}>Cancelar</Button>
                    )}
                  </div>

                  {/* Anexos diversas */}
                  <div className="space-y-2 mt-2">
                    <div className="text-xs uppercase text-slate-500">Anexos do Pedido</div>
                    {isAdmin && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-slate-500">Fotos (JPG, PNG)</label>
                          <div className="space-y-1">
                            <input type="file" accept="image/*" multiple onChange={(e) => onAddAttachments(o.id, e.target.files, 'foto')} />
                            <input type="file" accept="image/*" capture="environment" multiple onChange={(e) => onAddAttachments(o.id, e.target.files, 'foto')} />
                          </div>
                          <div className="mt-2 grid grid-cols-3 gap-2">
                            {(o.anexos || []).filter((a: any) => a.tipo.startsWith('image/')).map((ph: any, idx: number) => (
                              <img key={idx} src={ph.url} alt={ph.nome} className="w-full h-20 object-cover rounded" />
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-slate-500">Notas Fiscais / Documentos (PDF, imagens)</label>
                          <div className="space-y-1">
                            <input type="file" accept="application/pdf,image/*" multiple onChange={(e) => onAddAttachments(o.id, e.target.files, 'documento')} />
                            <input type="file" accept="image/*" capture="environment" multiple onChange={(e) => onAddAttachments(o.id, e.target.files, 'documento')} />
                          </div>
                          <ul className="mt-2 space-y-1 text-xs list-disc pl-4">
                            {(o.anexos || []).filter((a: any) => !a.tipo.startsWith('image/')).map((d: any, idx: number) => (
                              <li key={idx}><a href={d.url} target="_blank" rel="noreferrer" className="underline">{d.nome}</a></li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function AdminStatusControls({ status, onChange }: { status: StatusOption; onChange: (s: StatusOption) => void }) {
  const options: StatusOption[] = [
    'Em conferência','Orçamento atualizado','Confirmado','Aguardando pagamento','Pagamento confirmado','Pedido separado','Pronto para retirada','Finalizado','Cancelado'
  ];
  return (
    <Select value={status} onValueChange={(v: string) => onChange(v as StatusOption)}>
      <SelectTrigger><SelectValue /></SelectTrigger>
      <SelectContent>
        {options.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
      </SelectContent>
    </Select>
  );
}

/* ===================== Perfil ===================== */
/* ===================== Perfil ===================== */
function Perfil({ usuario, users, setUsers, setUsuario }: any) {
  // Estado do formulário preenchido a partir do usuário existente (se houver)
  const [form, setForm] = useState(() => {
    const u =
      (users || []).find((x: any) => x.id === usuario.id) ||
      (users || []).find(
        (x: any) =>
          String(x.email || "").toLowerCase() ===
          String(usuario.email || "").toLowerCase()
      ) ||
      ({} as any);

    return {
      razaoSocial: u.razaoSocial || "",
      cnpj: u.cnpj || "",
      ie: u.ie || "",
      endereco: u.endereco || "",
      cidade: u.cidade || "",
      uf: u.uf || "",
      cep: u.cep || "",
      telefone: u.telefone || "",
      email: u.email || usuario.email || "",
      username: u.username || usuario.nome || "",
      senha: u.senha || "",
      id: u.id || usuario.id,
    };
  });

  function saveProfile(e: any) {
    e.preventDefault();

    const normalized = {
      ...form,
      email: String(form.email || "").toLowerCase(),
      cnpj: formatCNPJ(form.cnpj || ""),
      cep: formatCEP(form.cep || ""),
      telefone: formatPhoneBR(form.telefone || ""),
      uf: String(form.uf || "").toUpperCase().slice(0, 2),
    };

    // Atualiza/insere no "banco" local
    const nextUsers = (users || []).map((x: any) =>
      x.id === normalized.id ? { ...x, ...normalized } : x
    );
    if (!nextUsers.some((x: any) => x.id === normalized.id)) {
      nextUsers.push(normalized);
    }
    saveUsers(nextUsers);
    setUsers(nextUsers);

    // Reflete nome/email atuais no cabeçalho/saudação
    setUsuario((u: any) => ({
      ...u,
      nome: normalized.username || normalized.razaoSocial || u?.nome,
      email: normalized.email,
    }));

    alert("Dados salvos.");
  }

  return (
    <Card className="max-w-3xl">
      <CardContent className="space-y-3">
        <div className="text-lg font-semibold">Meu Perfil</div>

        {/* FORMULÁRIO com máscaras + auto-CEP */}
        <form className="grid grid-cols-1 sm:grid-cols-2 gap-3" onSubmit={saveProfile}>
          <Input
            placeholder="Razão Social"
            value={form.razaoSocial}
            onChange={(e) => setForm({ ...form, razaoSocial: e.target.value })}
          />
          <Input
            placeholder="CNPJ"
            inputMode="numeric"
            value={form.cnpj}
            onChange={(e) => setForm({ ...form, cnpj: formatCNPJ(e.target.value) })}
          />
          <Input
            placeholder="Inscrição Estadual"
            value={form.ie}
            onChange={(e) => setForm({ ...form, ie: e.target.value })}
          />
          <Input
            placeholder="Endereço"
            value={form.endereco}
            onChange={(e) => setForm({ ...form, endereco: e.target.value })}
          />
          <Input
            placeholder="Cidade"
            value={form.cidade}
            onChange={(e) => setForm({ ...form, cidade: e.target.value })}
          />
          <Input
            placeholder="UF"
            value={form.uf}
            onChange={(e) =>
              setForm({ ...form, uf: e.target.value.toUpperCase().slice(0, 2) })
            }
          />
          <Input
            placeholder="CEP"
            inputMode="numeric"
            value={form.cep}
            onChange={(e) => setForm({ ...form, cep: formatCEP(e.target.value) })}
            onBlur={async () => {
              const info = await lookupCep(form.cep);
              if (info) {
                // Preenche só o que estiver vazio para não apagar edições manuais
                setForm((prev: any) => ({
                  ...prev,
                  cep: info.cep,
                  endereco:
                    prev.endereco ||
                    [info.logradouro, info.bairro].filter(Boolean).join(" - "),
                  cidade: prev.cidade || info.cidade,
                  uf: prev.uf || info.uf,
                }));
              }
            }}
          />
          <Input
            placeholder="Telefone"
            inputMode="tel"
            value={form.telefone}
            onChange={(e) =>
              setForm({ ...form, telefone: formatPhoneBR(e.target.value) })
            }
          />
          <Input
            type="email"
            placeholder="E-mail"
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value.toLowerCase() })
            }
          />
          <Input
            placeholder="Nome de usuário"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />
          <Input
            type="password"
            placeholder="Senha"
            value={form.senha}
            onChange={(e) => setForm({ ...form, senha: e.target.value })}
          />
          <div className="sm:col-span-2 flex gap-2">
            <Button type="submit" className="w-full">
              Salvar
            </Button>
          </div>
        </form>

        <div className="text-xs text-slate-500">
          Essas informações serão mostradas junto ao seu pedido para os colaboradores.
        </div>
      </CardContent>
    </Card>
  );
}


/* ===================== Auth (login/cadastro) ===================== */
/* ===================== Auth (login/cadastro) ===================== */
function AuthCard({
  onSubmit,
  onRegister,
  showRegister,
  setShowRegister,
}: any) {
  const [role, setRole] = useState<Role>("cliente");
  const [cad, setCad] = useState<any>({
    razaoSocial: "",
    cnpj: "",
    ie: "",
    endereco: "",
    cidade: "",
    uf: "",
    cep: "",
    telefone: "",
    email: "",
    username: "",
    senha: "",
  });

  return (
    <Card className="mx-auto max-w-2xl shadow-lg">
      <CardContent className="space-y-4 p-6">
        <div className="flex justify-between items-center">
          <div className="text-lg font-semibold">
            {showRegister ? "Acesso ao Portal" : "Login"}
          </div>
          <button
            type="button"
            className="text-sm text-blue-600 underline"
            onClick={() => setShowRegister(!showRegister)}
          >
            {showRegister ? "Ir para Entrar" : "Novo cadastro"}
          </button>
        </div>

        {showRegister ? (
          // ===================== FORMULÁRIO DE CADASTRO =====================
          <form
            className="grid grid-cols-1 sm:grid-cols-2 gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              const novo = {
                ...cad,
                id: uid("cli"),
                email: String(cad.email || "").toLowerCase(),
                cnpj: formatCNPJ(cad.cnpj),
                cep: formatCEP(cad.cep),
                telefone: formatPhoneBR(cad.telefone),
                uf: cad.uf.toUpperCase().slice(0, 2),
                role,
              };
              if (!novo.email || !novo.senha) {
                alert("Preencha e-mail e senha");
                return;
              }
              onRegister(novo);
            }}
          >
            <Input
              placeholder="Razão Social"
              value={cad.razaoSocial}
              onChange={(e) => setCad({ ...cad, razaoSocial: e.target.value })}
              required
            />
            <Input
              placeholder="CNPJ"
              inputMode="numeric"
              value={cad.cnpj}
              onChange={(e) => setCad({ ...cad, cnpj: formatCNPJ(e.target.value) })}
              required
            />
            <Input
              placeholder="Inscrição Estadual (opcional)"
              value={cad.ie}
              onChange={(e) => setCad({ ...cad, ie: e.target.value })}
            />
            <Input
              placeholder="Endereço"
              value={cad.endereco}
              onChange={(e) => setCad({ ...cad, endereco: e.target.value })}
              required
            />
            <Input
              placeholder="Cidade"
              value={cad.cidade}
              onChange={(e) => setCad({ ...cad, cidade: e.target.value })}
              required
            />
            <Input
              placeholder="UF"
              value={cad.uf}
              onChange={(e) =>
                setCad({ ...cad, uf: e.target.value.toUpperCase().slice(0, 2) })
              }
              required
            />
            <Input
              placeholder="CEP"
              inputMode="numeric"
              value={cad.cep}
              onChange={(e) => setCad({ ...cad, cep: formatCEP(e.target.value) })}
              onBlur={async () => {
                const info = await lookupCep(cad.cep);
                if (info) {
                  setCad((prev: any) => ({
                    ...prev,
                    cep: info.cep,
                    endereco:
                      prev.endereco ||
                      [info.logradouro, info.bairro].filter(Boolean).join(" - "),
                    cidade: prev.cidade || info.cidade,
                    uf: prev.uf || info.uf,
                  }));
                }
              }}
              required
            />
            <Input
              placeholder="Telefone"
              inputMode="tel"
              value={cad.telefone}
              onChange={(e) =>
                setCad({ ...cad, telefone: formatPhoneBR(e.target.value) })
              }
            />
            <Input
              type="email"
              placeholder="E-mail (login)"
              value={cad.email}
              onChange={(e) => setCad({ ...cad, email: e.target.value })}
              required
            />
            <Input
              placeholder="Nome de usuário"
              value={cad.username}
              onChange={(e) => setCad({ ...cad, username: e.target.value })}
              required
            />
            <Input
              type="password"
              placeholder="Senha"
              value={cad.senha}
              onChange={(e) => setCad({ ...cad, senha: e.target.value })}
              required
            />

            <div className="sm:col-span-2 flex gap-2">
              <Button type="submit" className="w-full">
                Salvar cadastro
              </Button>
            </div>
          </form>
        ) : (
          // ===================== FORMULÁRIO DE LOGIN =====================
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit(role, cad.email, cad.senha);
            }}
          >
            <select
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
            >
              <option value="cliente">Cliente</option>
              <option value="colaborador">Colaborador</option>
            </select>
            <Input
              type="email"
              placeholder="E-mail"
              value={cad.email}
              onChange={(e) => setCad({ ...cad, email: e.target.value })}
              required
            />
            <Input
              type="password"
              placeholder="Senha"
              value={cad.senha}
              onChange={(e) => setCad({ ...cad, senha: e.target.value })}
              required
            />
            <Button type="submit" className="w-full">
              Entrar
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

