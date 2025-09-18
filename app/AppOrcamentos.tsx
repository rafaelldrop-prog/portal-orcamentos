'use client';
import React, { useEffect, useMemo, useState } from "react";

/* ===== Mini UI ===== */
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

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & { label?: string };
const Input = ({ className = "", label, ...props }: InputProps) => (
  <label className="block space-y-1">
    {label && <span className="text-xs text-slate-600">{label}</span>}
    <input
      className={`w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300 ${className}`}
      {...props}
    />
  </label>
);

const Badge = ({ children, className = "" }: any) => (
  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs border ${className}`}>{children}</span>
);
const Separator = ({ className = "" }: any) => <div className={`h-px w-full bg-slate-200 ${className}`} />;

/* Tabs simples */
function Tabs({ value, onValueChange, children }: any) {
  return (
    <div data-tabs>
      {React.Children.map(children, (c: any) =>
        React.cloneElement(c, { __tabsValue: value, __setTabsValue: onValueChange })
      )}
    </div>
  );
}
function TabsList({ className = "", children, __tabsValue, __setTabsValue }: any) {
  const kids = React.Children.map(children, (c: any) =>
    React.isValidElement(c) ? React.cloneElement(c, { __tabsValue, __setTabsValue }) : c
  );
  return <div className={`flex gap-2 ${className}`}>{kids}</div>;
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

/* Select simplificado */
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

/* Utils */
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

const STATUS_FLOW = [
  "Em conferência",
  "Orçamento atualizado",
  "Confirmado",
  "Aguardando pagamento",
  "Pagamento confirmado",
  "Pedido separado",
  "Pronto para retirada",
  "Finalizado",
  "Cancelado",
] as const;

function statusColorClasses(status: string) {
  const s = (status || '').toLowerCase();
  if (s.includes('em confer')) return 'bg-amber-100 text-amber-800 border-amber-200';
  if (s.includes('atualizado')) return 'bg-violet-100 text-violet-800 border-violet-200';
  if (s === 'confirmado') return 'bg-blue-100 text-blue-800 border-blue-200';
  if (s.includes('aguardando pag')) return 'bg-orange-100 text-orange-800 border-orange-200';
  if (s.includes('pagamento confirmado')) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
  if (s.includes('pedido separado')) return 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200';
  if (s.includes('pronto para retirada')) return 'bg-cyan-100 text-cyan-800 border-cyan-200';
  if (s.includes('finalizado')) return 'bg-slate-900 text-white border-slate-900';
  if (s.includes('cancelado')) return 'bg-rose-100 text-rose-800 border-rose-200';
  return 'bg-slate-100 text-slate-700 border-slate-200';
}
function canDeleteStatus(status: string) {
  const idx = STATUS_FLOW.indexOf('Confirmado');
  const cur = STATUS_FLOW.indexOf(status as any);
  return cur === -1 || cur < idx;
}
function isTerminal(status: string) {
  return status === 'Finalizado' || status === 'Cancelado';
}
function currencyBRL(v = 0) { return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }); }
function uid(prefix = "id") { return `${prefix}-${Math.random().toString(36).slice(2, 10)}`; }
function computeTotal(itens: any[]) { return itens.reduce((acc, it) => acc + (Number(it.preco)||0)*(Number(it.quantidade)||0), 0); }
/* Dados mock com CATEGORIAS */
const MOCK_PRODUCTS = [
  { id:"P-0001", codigo:"BUZ-AFRICANO", nome:"Búzios Africano", categoria:"buzios", cor:"Sortido", unidadePadrao:"UN", foto:"", descricao:"Búzios africanos." },
  { id:"P-0002", codigo:"PING-OXALA", nome:"Pingente Oxalá", categoria:"pingente", cor:"Prata", unidadePadrao:"UN", foto:"", descricao:"Pingente de Oxalá." },
  { id:"P-0003", codigo:"VIDR-11-0", nome:"Vidrilho 11/0", categoria:"vidrilho", cor:"Sortido", unidadePadrao:"UN", foto:"", descricao:"Vidrilho 11/0." },
  { id:"P-0004", codigo:"FIRMA-TORCIDA", nome:"Firma Torcida", categoria:"firma", cor:"Sortido", unidadePadrao:"UN", foto:"", descricao:"Firma torcida." },
];

const UNIDADES = ["UN", "KG", "PC", "CJ", "M", "L"] as const;
const FORMAS_PGTO = ["Dinheiro", "Pix", "Boleto"] as const;

const PIX_KEYS = [
  { id: "pix1", label: "PIX (Telefone)", tipo: "Telefone", chave: "+55 (11) 91234-5678", banco: "Banco Fictício 999", titular: "ACME LTDA", agencia: "0001", conta: "12345-6" },
  { id: "pix2", label: "PIX (CNPJ)",     tipo: "CNPJ",     chave: "12.345.678/0001-90",   banco: "Banco Demo 123",   titular: "ACME IMPORTS", agencia: "4321", conta: "98765-4" },
] as const;

/* helpers */
function filterProducts(list: any[], filtro: any) {
  const termo = (filtro.termo || "").toLowerCase();
  const cat = (filtro.categoria || "todas").toLowerCase();
  return list.filter((p) => {
    const txt = `${p.nome} ${p.codigo} ${p.cor}`.toLowerCase();
    const okTermo = !termo || txt.includes(termo);
    const okCat = cat === "todas" || (p.categoria || "") === cat;
    return okTermo && okCat;
  });
}
function isOwner(orc: { clienteEmail?: string; clienteId?: string } | any, user: { id?: string; email?: string } | null) {
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

/* Persistência local */
let GLOBAL_ORCAMENTOS: any[] = [];
const USERS_KEY = "portal_users_v1";
const STORAGE_KEY = "orcamentos_store_v1";
function emitChange() { try { window.dispatchEvent(new Event("orcamentos:changed")); } catch {} }
function loadGlobal(): any[] { try { const raw = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null; if (!raw) return []; const parsed = JSON.parse(raw); return Array.isArray(parsed)? parsed: []; } catch { return []; } }
function saveGlobal(list: any[]) { try { if (typeof window !== 'undefined') window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch {} }
function loadUsers(): any[] { try { const raw = typeof window !== 'undefined' ? window.localStorage.getItem(USERS_KEY) : null; if (!raw) return []; const arr = JSON.parse(raw); return Array.isArray(arr)? arr: []; } catch { return []; } }
function saveUsers(users: any[]) { try { if (typeof window !== 'undefined') window.localStorage.setItem(USERS_KEY, JSON.stringify(users)); } catch {} }
function setGlobal(list: any[]) { GLOBAL_ORCAMENTOS = list; saveGlobal(GLOBAL_ORCAMENTOS); emitChange(); }
try { const init = loadGlobal(); if (init.length) GLOBAL_ORCAMENTOS = init; } catch {}
async function notifyEmailUpdate(to: string, subject: string, body: string, attachments: { name: string; type: string; dataUrl: string }[] = []) { console.log("[Email] To:", to, "Subject:", subject, "Body:", body, "Attachments:", attachments.map((a) => a.name)); return true; }
export default function AppOrcamentos() {
  const [usuario, setUsuario] = useState<null | { id: string; nome: string; email: string; role: "cliente" | "colaborador" }>(null);
  const [aba, setAba] = useState("catalogo");
  const [filtro, setFiltro] = useState({ termo: "", categoria: "todas" });
  const [carrinho, setCarrinho] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>(loadUsers());
  const [showRegister, setShowRegister] = useState(false);
  const [orcamentos, setOrcamentos] = useState<any[]>([]);

  function syncFromGlobal(user: { id: string; role: "cliente" | "colaborador"; email?: string } | null) {
    if (!user) return;
    const list = user.role === "cliente" ? GLOBAL_ORCAMENTOS.filter((o) => isOwner(o, user)) : GLOBAL_ORCAMENTOS;
    setOrcamentos(list);
  }
  useEffect(() => {
    function onChange() { if (usuario) syncFromGlobal(usuario); }
    window.addEventListener("orcamentos:changed", onChange);
    return () => window.removeEventListener("orcamentos:changed", onChange);
  }, [usuario]);

  function handleLogin(form: HTMLFormElement) {
    const data = new FormData(form);
    const email = String(data.get("email") || "").trim().toLowerCase();
    const senha = String(data.get("senha") || "").trim();
    const roleRaw = (data.get("role") as string) || "cliente";
    const role: "cliente" | "colaborador" = roleRaw === "colaborador" ? "colaborador" : "cliente";
    if (!email || !senha) return;

    if (role === "cliente") {
      const found = users.find((u: any) => u.email === email && u.senha === senha);
      if (!found) { alert("Cliente não encontrado ou senha inválida. Cadastre-se antes."); return; }
      const user = { id: found.id, nome: found.username || found.razaoSocial || email.split("@")[0], email, role };
      setUsuario(user); syncFromGlobal(user); setAba("pedidos");
    } else {
      const user = { id: uid("user"), nome: email.split("@")[0], email, role };
      setUsuario(user); setOrcamentos(GLOBAL_ORCAMENTOS); setAba("pedidos");
    }
  }
  function logout() { setUsuario(null); setCarrinho([]); setOrcamentos([]); setAba("catalogo"); }

  function addToCart(produto: any, unidade: string, quantidade: number, preco: number) {
    setCarrinho((prev) => [...prev, { ...produto, unidade, quantidade, preco }]);
  }
  function removeFromCart(idx: number) { setCarrinho((prev) => prev.filter((_, i) => i !== idx)); }

  function finalizarOrcamento(formaPagamento: string, prazoTermo: string, descontoPct: number, pixInfo?: any, boletoComprovante?: any) {
    if (!carrinho.length || !usuario) return;
    const now = new Date().toISOString();
    const novo = {
      id: uid("orc"),
      clienteId: usuario.id,
      clienteEmail: (usuario.email || "").toLowerCase(),
      clienteNome: usuario.nome || (usuario.email?.split("@")[0]) || "Cliente",
      itens: carrinho,
      descontoPct: Number(descontoPct) || 0,
      formaPagamento,
      pagamentoPix: formaPagamento === "Pix" ? (pixInfo || null) : null,
      prazo: prazoTermo,
      dueDates: computeDueDates(prazoTermo),
      status: "Em conferência",
      criadoEm: now,
      history: [makeHistoryEntry(usuario, "criou", null, "Em conferência")],
      anexos: [] as { id: string; nome: string; tipo: string; url: string; dataUrl?: string }[],
      comprovante: boletoComprovante || null,
    };
    setOrcamentos((prev) => [novo, ...prev]);
    setGlobal([novo, ...GLOBAL_ORCAMENTOS]);
    setCarrinho([]); setAba("pedidos");
  }

  function alterarStatus(orcId: string, status: string) {
    const now = new Date().toISOString();
    setOrcamentos((prev) => prev.map((o) => {
      if (o.id !== orcId) return o;
      const entry = makeHistoryEntry(usuario, "alterou status", o.status, status);
      const next = { ...o, status, history: [...(o.history || []), entry] };
      notifyEmailUpdate(o.clienteEmail || "cliente@exemplo.com", `Atualização do pedido #${o.id}`,
        `Status alterado de \"${o.status}\" para \"${status}\" em ${new Date(now).toLocaleString("pt-BR")} por ${usuario?.nome || "colaborador"}.`);
      return next;
    }));
    setGlobal(GLOBAL_ORCAMENTOS.map((o) => {
      if (o.id !== orcId) return o;
      const entry = makeHistoryEntry(usuario, "alterou status", o.status, status);
      return { ...o, status, history: [...(o.history || []), entry] };
    }));
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
    const motivo = prompt('Informe o motivo do cancelamento:');
    if (!motivo) return;
    const now = new Date().toISOString();
    setOrcamentos((prev) => prev.map((o) => {
      if (o.id !== orcId) return o;
      const entry = makeHistoryEntry(usuario, "cancelou", o.status, "Cancelado", { motivo });
      const next = { ...o, status: 'Cancelado', cancelReason: motivo, history: [...(o.history || []), entry] };
      notifyEmailUpdate(o.clienteEmail || "cliente@exemplo.com", `Cancelamento do pedido #${o.id}`,
        `${usuario?.nome || 'usuário'} cancelou o pedido em ${new Date(now).toLocaleString('pt-BR')}\nMotivo: ${motivo}`);
      return next;
    }));
    setGlobal(GLOBAL_ORCAMENTOS.map((o) => {
      if (o.id !== orcId) return o;
      const entry = makeHistoryEntry(usuario, "cancelou", o.status, "Cancelado", { motivo });
      return { ...o, status: 'Cancelado', cancelReason: motivo, history: [...(o.history || []), entry] };
    }));
  }

  /* === NOVOS HANDLERS: ATUALIZAR / CONFIRMAR (Colaborador) === */
  function atualizarPedido(orcId: string) {
    const now = new Date().toISOString();
    setOrcamentos((prev) =>
      prev.map((o) => {
        if (o.id !== orcId) return o;
        const entry = makeHistoryEntry(usuario, "marcou para atualização", o.status, "Orçamento atualizado");
        const next = { ...o, status: "Orçamento atualizado", history: [...(o.history || []), entry] };
        notifyEmailUpdate(
          o.clienteEmail || "cliente@exemplo.com",
          `Seu pedido #${o.id} foi atualizado`,
          `Um colaborador marcou seu pedido para atualização em ${new Date(now).toLocaleString("pt-BR")}. ` +
            `Revise as alterações e confirme.`
        );
        return next;
      })
    );
    setGlobal(
      GLOBAL_ORCAMENTOS.map((o) => {
        if (o.id !== orcId) return o;
        const entry = makeHistoryEntry(usuario, "marcou para atualização", o.status, "Orçamento atualizado");
        return { ...o, status: "Orçamento atualizado", history: [...(o.history || []), entry] };
      })
    );
  }

  function confirmarPedido(orcId: string) {
    const now = new Date().toISOString();
    setOrcamentos((prev) =>
      prev.map((o) => {
        if (o.id !== orcId) return o;
        const entry = makeHistoryEntry(usuario, "confirmou", o.status, "Confirmado");
        const next = { ...o, status: "Confirmado", history: [...(o.history || []), entry] };
        notifyEmailUpdate(
          o.clienteEmail || "cliente@exemplo.com",
          `Pedido #${o.id} confirmado`,
          `Seu pedido foi confirmado em ${new Date(now).toLocaleString("pt-BR")}.`
        );
        return next;
      })
    );
    setGlobal(
      GLOBAL_ORCAMENTOS.map((o) => {
        if (o.id !== orcId) return o;
        const entry = makeHistoryEntry(usuario, "confirmou", o.status, "Confirmado");
        return { ...o, status: "Confirmado", history: [...(o.history || []), entry] };
      })
    );
  }
  const produtosFiltrados = useMemo(() => filterProducts(MOCK_PRODUCTS, filtro), [filtro]);
  const totalCarrinho = useMemo(() => computeTotal(carrinho), [carrinho]);

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
            <Tabs value={aba} onValueChange={setAba}>
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="catalogo">Catálogo</TabsTrigger>
                <TabsTrigger value="carrinho">Carrinho</TabsTrigger>
                <TabsTrigger value="pedidos">Pedidos</TabsTrigger>
                <TabsTrigger value="perfil">Meu Perfil</TabsTrigger>
              </TabsList>

              <TabsContent value="catalogo">
                <Catalogo produtos={produtosFiltrados} filtro={filtro} setFiltro={setFiltro} onAdd={addToCart} />
              </TabsContent>

              <TabsContent value="carrinho">
                <Carrinho itens={carrinho} total={totalCarrinho} onFinalizar={finalizarOrcamento} onRemove={removeFromCart} />
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
                  onAtualizar={atualizarPedido}
                  onConfirmar={confirmarPedido}
                />
              </TabsContent>

              <TabsContent value="perfil">
                <Perfil usuario={usuario} users={users} setUsers={setUsers} setUsuario={setUsuario} />
              </TabsContent>
            </Tabs>
          ) : (
            <Tabs value={aba} onValueChange={setAba}>
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
                  onAtualizar={atualizarPedido}
                  onConfirmar={confirmarPedido}
                />
              </TabsContent>
            </Tabs>
          )}
        </>
      )}
    </div>
  );

  /* anexos (dentro do componente para ter acesso a estados) */
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
/* ================== Auth (login/cadastro) ================== */
function AuthCard({ onSubmit, onRegister, showRegister, setShowRegister }: { onSubmit: (form: HTMLFormElement) => void; onRegister: (user: any) => void; showRegister: boolean; setShowRegister: (v: boolean) => void; }) {
  const [role, setRole] = useState<"cliente" | "colaborador">("cliente");
  const [cad, setCad] = useState<any>({ razaoSocial: "", cnpj: "", ie: "", endereco: "", cidade: "", uf: "", cep: "", telefone: "", email: "", username: "", senha: "" });
  return (
    <Card className="mx-auto max-w-2xl shadow-lg">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Acesso ao Portal</h2>
          <Button onClick={() => setShowRegister(!showRegister)}>{showRegister ? "Ir para Entrar" : "Novo cadastro"}</Button>
        </div>
        {showRegister ? (
          <form className="grid grid-cols-1 sm:grid-cols-2 gap-3" onSubmit={(e) => { e.preventDefault(); const novo = { ...cad, id: uid("cli"), email: String(cad.email || "").toLowerCase() }; if (!novo.email || !novo.senha) { alert("Preencha e-mail e senha"); return; } onRegister(novo); }}>
            <Input placeholder="Razão Social" value={cad.razaoSocial} onChange={(e) => setCad({ ...cad, razaoSocial: e.target.value })} required />
            <Input placeholder="CNPJ" value={cad.cnpj} onChange={(e) => setCad({ ...cad, cnpj: e.target.value })} required />
            <Input placeholder="Inscrição Estadual (opcional)" value={cad.ie} onChange={(e) => setCad({ ...cad, ie: e.target.value })} />
            <Input placeholder="Endereço" value={cad.endereco} onChange={(e) => setCad({ ...cad, endereco: e.target.value })} required />
            <Input placeholder="Cidade" value={cad.cidade} onChange={(e) => setCad({ ...cad, cidade: e.target.value })} required />
            <Input placeholder="UF" value={cad.uf} onChange={(e) => setCad({ ...cad, uf: e.target.value })} required />
            <Input placeholder="CEP" value={cad.cep} onChange={(e) => setCad({ ...cad, cep: e.target.value })} required />
            <Input placeholder="Telefone" value={cad.telefone} onChange={(e) => setCad({ ...cad, telefone: e.target.value })} />
            <Input type="email" placeholder="E-mail (login)" value={cad.email} onChange={(e) => setCad({ ...cad, email: e.target.value })} required />
            <Input placeholder="Nome de usuário" value={cad.username} onChange={(e) => setCad({ ...cad, username: e.target.value })} required />
            <Input type="password" placeholder="Senha" value={cad.senha} onChange={(e) => setCad({ ...cad, senha: e.target.value })} required />
            <div className="sm:col-span-2 flex gap-2">
              <Button type="submit" className="w-full">Salvar cadastro</Button>
            </div>
          </form>
        ) : (
          <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); onSubmit(e.currentTarget); }}>
            <div className="flex gap-2 items-center">
              <span className="text-sm text-slate-600">Acesso:</span>
              <select className="rounded-xl border border-slate-300 px-3 py-2 text-sm" value={role} onChange={(e) => setRole(e.target.value as any)}>
                <option value="cliente">Cliente</option>
                <option value="colaborador">Colaborador</option>
              </select>
            </div>
            <Input name="email" type="email" placeholder="seu@email.com" required />
            <Input name="senha" type="password" placeholder="********" required />
            <input type="hidden" name="role" value={role} />
            <Button type="submit" className="w-full">Entrar</Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

/* ================== Catálogo ================== */
function Catalogo({ produtos, filtro, setFiltro, onAdd }: any) {
  const categorias = ["todas", "buzios", "pingente", "vidrilho", "firma"];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <Input placeholder="Pesquisar por nome/código/cor" value={filtro.termo} onChange={(e) => setFiltro({ ...filtro, termo: e.target.value })} />
        <label className="block space-y-1">
          <span className="text-xs text-slate-600">Categoria</span>
          <select
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm bg-white"
            value={filtro.categoria}
            onChange={(e) => setFiltro({ ...filtro, categoria: e.target.value })}
          >
            {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {produtos.map((p: any) => (
          <Card key={p.id}>
            <ImageWithFallback src={p.foto} alt={p.nome} />
            <CardContent className="p-3 space-y-2">
              <h3 className="font-semibold">{p.nome}</h3>
              <p className="text-xs text-slate-500">Código: {p.codigo}</p>
              <p className="text-xs text-slate-500">Categoria: {p.categoria}</p>
              <AddToCartInline produto={p} onAdd={onAdd} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* campos na ordem: Quantidade → Unidade → Preço, e sem “0” inicial */
function AddToCartInline({ produto, onAdd }: any) {
  const [quantidade, setQuantidade] = useState<string>("");
  const [unidade, setUnidade] = useState(produto.unidadePadrao || "UN");
  const [preco, setPreco] = useState<string>("");

  const qNum = quantidade === "" ? 0 : Number(quantidade);
  const pNum = preco === "" ? 0 : Number(preco);

  return (
    <div className="space-y-2">
      <Input label="Quantidade" type="number" inputMode="numeric" min={0} placeholder="Digite a quantidade" value={quantidade}
             onChange={(e) => setQuantidade(e.target.value.replace(/^0+/, ''))} />
      <label className="block space-y-1">
        <span className="text-xs text-slate-600">Unidade</span>
        <select className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm bg-white" value={unidade} onChange={(e) => setUnidade(e.target.value)}>
          {(UNIDADES as readonly string[]).map((u) => <option key={u} value={u}>{u}</option>)}
        </select>
      </label>
      <Input label="Preço (R$)" type="number" inputMode="decimal" min={0} step="0.01" placeholder="Digite o preço" value={preco}
             onChange={(e) => setPreco(e.target.value.replace(/^0+(?=\d)/, ''))} />
      <Button onClick={() => onAdd(produto, unidade, qNum, pNum)}>Adicionar</Button>
    </div>
  );
}
function Carrinho({ itens, total, onFinalizar, onRemove }: any) {
  const [forma, setForma] = useState("Pix");
  const [prazo, setPrazo] = useState("Á Vista");
  const [desconto, setDesconto] = useState(0);
  const PRAZOS = ["30 dias", "30/45 dias", "30/45/60 dias", "Á Vista", "Acordado"];
  const dueDates = computeDueDates(prazo);
  const dueLabel = dueDates.length
    ? dueDates.map((d) => new Date(d).toLocaleDateString("pt-BR")).join(" • ")
    : (prazo.toLowerCase().includes("acordado") ? "a combinar" : "-");

  const [pixId, setPixId] = useState(PIX_KEYS[0]?.id || "");
  const selectedPix = useMemo(() => PIX_KEYS.find((p:any) => p.id === pixId) || null, [pixId]);

  const subtotal = total;
  const valorDesc = (Math.max(0, Math.min(100, Number(desconto))) * subtotal) / 100;
  const totalLiquido = Math.max(0, subtotal - valorDesc);

  // anexos de comprovante
  const [pixFiles, setPixFiles] = useState<FileList | null>(null);
  const [boletoFiles, setBoletoFiles] = useState<FileList | null>(null);

  return (
    <div className="space-y-3">
      {itens.map((it: any, i: number) => (
        <Card key={i}>
          <CardContent className="flex justify-between items-center gap-3">
            <span className="truncate">{it.nome} ({it.quantidade}x)</span>
            <span className="whitespace-nowrap">{currencyBRL((Number(it.preco)||0)*(Number(it.quantidade)||0))}</span>
            <Button onClick={() => onRemove(i)} className="text-red-600 border-red-300">Remover</Button>
          </CardContent>
        </Card>
      ))}

      <div className="space-y-1 text-sm">
        <div>Subtotal: <b>{currencyBRL(subtotal)}</b></div>
        <div className="flex items-center gap-2">Desconto (%):
          <Input type="number" value={desconto as any} onChange={(e) => setDesconto(Number(e.target.value))} className="w-24" />
          <span>(-{currencyBRL(valorDesc)})</span>
        </div>
        <div>Total: <b>{currencyBRL(totalLiquido)}</b></div>
      </div>

      {/* Prazo de pagamento */}
      <label className="block space-y-1">
        <span className="text-xs text-slate-600">Prazo</span>
        <select className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm bg-white" value={prazo} onChange={(e) => setPrazo(e.target.value)}>
          {PRAZOS.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </label>
      <div className="text-xs text-slate-600">Vencimentos: <b>{dueLabel}</b></div>

      {/* Forma de pagamento */}
      <label className="block space-y-1">
        <span className="text-xs text-slate-600">Forma de pagamento</span>
        <select className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm bg-white" value={forma} onChange={(e) => setForma(e.target.value)}>
          {(FORMAS_PGTO as readonly string[]).map((f) => <option key={f} value={f}>{f}</option>)}
        </select>
      </label>

      {/* PIX (com anexar dentro do card) */}
      {forma === "Pix" && (
        <Card>
          <CardContent className="space-y-2">
            <div className="text-sm font-medium">Chave PIX</div>
            <select className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm bg-white" value={pixId} onChange={(e) => setPixId(e.target.value)}>
              {PIX_KEYS.map((k:any) => (
                <option key={k.id} value={k.id}>{k.label} — {k.chave}</option>
              ))}
            </select>
            {selectedPix && (
              <div className="text-xs text-slate-700 grid grid-cols-1 sm:grid-cols-2 gap-y-1 gap-x-4">
                <div><span className="text-slate-500">Tipo:&nbsp;</span><b>{selectedPix.tipo}</b></div>
                <div><span className="text-slate-500">Chave:&nbsp;</span><b>{selectedPix.chave}</b></div>
                <div><span className="text-slate-500">Banco:&nbsp;</span><b>{selectedPix.banco}</b></div>
                <div><span className="text-slate-500">Titular:&nbsp;</span><b>{selectedPix.titular}</b></div>
                <div><span className="text-slate-500">Agência:&nbsp;</span><b>{selectedPix.agencia}</b></div>
                <div><span className="text-slate-500">Conta:&nbsp;</span><b>{selectedPix.conta}</b></div>
              </div>
            )}
            <div className="text-xs text-slate-600">Anexe o comprovante PIX (recomendado após confirmação do pedido):</div>
            <input type="file" accept="image/*,application/pdf" multiple onChange={(e) => setPixFiles(e.target.files)} />
          </CardContent>
        </Card>
      )}

      {/* Boleto (com anexar dentro do card) */}
      {forma === "Boleto" && (
        <Card>
          <CardContent className="space-y-2">
            <div className="text-sm font-medium">Boleto</div>
            <div className="text-xs text-slate-600">Anexe o comprovante do boleto (recomendado para agilizar a conferência):</div>
            <input type="file" accept="image/*,application/pdf" multiple onChange={(e) => setBoletoFiles(e.target.files)} />
          </CardContent>
        </Card>
      )}

      <Button
        onClick={() => onFinalizar(
          forma,
          prazo,
          desconto,
          forma === "Pix" ? PIX_KEYS.find(p => p.id === pixId) : null,
          forma === "Boleto" ? boletoFiles : null
        )}
        disabled={!itens.length}
      >
        Finalizar
      </Button>
      <div className="text-xs text-slate-500">
        Recomendações: pagamentos PIX/BOLETO são mais ágeis se anexar o comprovante. Para pedidos feitos fora da loja, prefira pagar após a confirmação.
      </div>
    </div>
  );
}

function Perfil({ usuario, users, setUsers, setUsuario }: any) {
  const [form, setForm] = useState(() => {
    const u = (users || []).find((x: any) => x.id === usuario.id) || {};
    return {
      razaoSocial: u.razaoSocial || '', cnpj: u.cnpj || '', ie: u.ie || '', endereco: u.endereco || '', cidade: u.cidade || '', uf: u.uf || '', cep: u.cep || '', telefone: u.telefone || '', email: u.email || usuario.email || '', username: u.username || usuario.nome || '', senha: u.senha || '', id: u.id || usuario.id,
    };
  });
  function saveProfile(e: any) {
    e.preventDefault();
    const nextUsers = (users || []).map((x: any) => x.id === form.id ? { ...x, ...form, email: String(form.email||'').toLowerCase() } : x);
    if (!nextUsers.some((x: any) => x.id === form.id)) nextUsers.push({ ...form, email: String(form.email||'').toLowerCase() });
    saveUsers(nextUsers); setUsers(nextUsers);
    setUsuario((u: any) => ({ ...u, nome: form.username || form.razaoSocial || u?.nome, email: String(form.email||'').toLowerCase() }));
    alert('Dados salvos.');
  }
  return (
    <Card className="max-w-3xl">
      <CardContent className="space-y-3">
        <div className="text-lg font-semibold">Meu Perfil</div>
        <form className="grid grid-cols-1 sm:grid-cols-2 gap-3" onSubmit={saveProfile}>
          <Input placeholder="Razão Social" value={form.razaoSocial} onChange={(e) => setForm({ ...form, razaoSocial: e.target.value })} />
          <Input placeholder="CNPJ" value={form.cnpj} onChange={(e) => setForm({ ...form, cnpj: e.target.value })} />
          <Input placeholder="Inscrição Estadual" value={form.ie} onChange={(e) => setForm({ ...form, ie: e.target.value })} />
          <Input placeholder="Endereço" value={form.endereco} onChange={(e) => setForm({ ...form, endereco: e.target.value })} />
          <Input placeholder="Cidade" value={form.cidade} onChange={(e) => setForm({ ...form, cidade: e.target.value })} />
          <Input placeholder="UF" value={form.uf} onChange={(e) => setForm({ ...form, uf: e.target.value })} />
          <Input placeholder="CEP" value={form.cep} onChange={(e) => setForm({ ...form, cep: e.target.value })} />
          <Input placeholder="Telefone" value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} />
          <Input type="email" placeholder="E-mail" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input placeholder="Nome de usuário" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
          <Input type="password" placeholder="Senha" value={form.senha} onChange={(e) => setForm({ ...form, senha: e.target.value })} />
          <div className="sm:col-span-2 flex gap-2">
            <Button type="submit" className="w-full">Salvar</Button>
          </div>
        </form>
        <div className="text-xs text-slate-500">Alterações de perfil **não** mexem nos pedidos que já foram enviados.</div>
      </CardContent>
    </Card>
  );
}
function ListaOrcamentos({
  orcamentos, users, onAlterarStatus, onAddAttachments, onDelete, onCancel, isAdmin,
  onAtualizar, onConfirmar
}: any) {
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
                  {/* Itens */}
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

                  {/* Totais */}
                  <div className="text-sm space-y-1">
                    <div className="text-xs uppercase text-slate-500">Totais</div>
                    <div>Subtotal: <b>{currencyBRL(totalBruto)}</b></div>
                    {o.descontoPct ? <div>Desconto: <b>{o.descontoPct}%</b></div> : null}
                    <div>Total: <b>{currencyBRL(totalLiq)}</b></div>
                  </div>

                  {/* Pagamento */}
                  <div className="text-sm space-y-1">
                    <div className="text-xs uppercase text-slate-500">Pagamento</div>
                    <div>Forma: <b>{o.formaPagamento}</b></div>
                    {o.prazo && <div>Prazo: <b>{o.prazo}</b></div>}
                    <div>Vencimentos: <b>{Array.isArray(o.dueDates) ? (o.dueDates.length ? o.dueDates.map((d: string) => new Date(d).toLocaleDateString('pt-BR')).join(' • ') : (String(o.prazo||'').toLowerCase().includes('acordado') ? 'a combinar' : '-')) : '-'}</b></div>
                  </div>

                  {/* Dados do cliente */}
                  {(() => {
                    const u = (users || []).find((uu: any) => uu.id === o.clienteId || (uu.email||'').toLowerCase() === (o.clienteEmail||'').toLowerCase());
                    return (
                      <div className="text-sm space-y-1">
                        <div className="text-xs uppercase text-slate-500">Dados do cliente</div>
                        <div>Razão Social/Usuário: <b>{u?.razaoSocial || u?.username || o.clienteNome || '-'}</b></div>
                        <div>CNPJ: <b>{u?.cnpj || '-'}</b> &nbsp; IE: <b>{u?.ie || '-'}</b></div>
                        <div>Endereço: <b>{u?.endereco || '-'}</b></div>
                        <div>Cidade/UF: <b>{u?.cidade || '-'} / {u?.uf || '-'}</b> &nbsp; CEP: <b>{u?.cep || '-'}</b></div>
                        <div>Telefone: <b>{u?.telefone || '-'}</b></div>
                        <div>E-mail: <b>{u?.email || o.clienteEmail || '-'}</b></div>
                      </div>
                    );
                  })()}

                  {/* PIX */}
                  {o.formaPagamento === 'Pix' && o.pagamentoPix && (
                    <div className="text-sm space-y-1">
                      <div className="text-xs uppercase text-slate-500">PIX</div>
                      <div>Tipo: <b>{o.pagamentoPix.label}</b></div>
                      <div>Chave: <b>{o.pagamentoPix.chave}</b></div>
                      <div>Banco: <b>{o.pagamentoPix.banco}</b></div>
                      <div>Titular: <b>{o.pagamentoPix.titular}</b></div>
                      <div>Agência: <b>{o.pagamentoPix.agencia}</b></div>
                      <div>Conta: <b>{o.pagamentoPix.conta}</b></div>
                    </div>
                  )}

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
                    {isAdmin && (
                      <>
                        <Button className="border-amber-300 text-amber-700" onClick={() => onAtualizar?.(o.id)}>
                          Atualizar pedido
                        </Button>
                        <Button className="border-emerald-300 text-emerald-700" onClick={() => onConfirmar?.(o.id)}>
                          Confirmar
                        </Button>
                      </>
                    )}
                    {isAdmin && <AdminStatusControls status={o.status} onChange={(s: string) => onAlterarStatus(o.id, s)} />}
                    {canDelete && (
                      <Button className="border-rose-300 text-rose-700" onClick={() => { if (confirm('Confirma excluir este pedido?')) onDelete?.(o.id); }}>
                        Excluir
                      </Button>
                    )}
                    {canCancel && (
                      <Button className="border-amber-300 text-amber-700" onClick={() => onCancel?.(o.id)}>Cancelar</Button>
                    )}
                  </div>

                  {/* Anexos */}
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
                    {!isAdmin && o.anexos && o.anexos.length > 0 && (
                      <>
                        <div className="grid grid-cols-3 gap-2">
                          {o.anexos.filter((a: any) => a.tipo.startsWith('image/')).map((ph: any, i: number) => (
                            <img key={i} src={ph.url} alt={ph.nome} className="w-full h-20 object-cover rounded" />
                          ))}
                        </div>
                        <ul className="mt-2 space-y-1 text-xs list-disc pl-4">
                          {o.anexos.filter((a: any) => !a.tipo.startsWith('image/')).map((d: any, i: number) => (
                            <li key={i}><a href={d.url} target="_blank" rel="noreferrer" className="underline">{d.nome}</a></li>
                          ))}
                        </ul>
                      </>
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

function AdminStatusControls({ status, onChange }: { status: string; onChange: (s: string) => void }) {
  const options = Array.from(STATUS_FLOW);
  return (
    <Select value={status} onValueChange={onChange}>
      <SelectTrigger><SelectValue /></SelectTrigger>
      <SelectContent>
        {options.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
      </SelectContent>
    </Select>
  );
}
