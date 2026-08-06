"use client";

import {
  ChangeEvent,
  DragEvent,
  KeyboardEvent as ReactKeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ArchiveRestore,
  Check,
  ChevronDown,
  ChevronUp,
  Download,
  FileDown,
  FileUp,
  ImageDown,
  Plus,
  Redo2,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  Undo2,
  X,
} from "lucide-react";
import { toPng } from "html-to-image";

type Track = {
  id: string;
  edition: string;
  game: string;
  year: number;
  order: number;
  disc: number;
  track: number;
  title: string;
  originalTitle: string;
  duration: string;
  image: string;
};

type Tier = { id: string; label: string; color: string };
type BoardState = { tiers: Tier[]; board: Record<string, string[]> };

const EDITIONS = [
  ["p1_ps1", "P1 · PS1", "P1"],
  ["p1_psp", "P1 · PSP", "P1"],
  ["p2_is_ps1", "P2 IS · PS1", "P2"],
  ["p2_is_psp", "P2 IS · PSP", "P2"],
  ["p2_ep_ps1", "P2 EP · PS1", "P2"],
  ["p2_ep_psp", "P2 EP · PSP", "P2"],
  ["p3", "Persona 3", "P3"],
  ["p3_fes", "P3 FES", "P3"],
  ["p3p", "P3 Portable", "P3"],
  ["p3_reload", "P3 Reload", "P3"],
  ["p4", "Persona 4", "P4"],
  ["p4g", "P4 Golden", "P4"],
  ["p5", "Persona 5", "P5"],
  ["p5r", "P5 Royal", "P5"],
] as const;

const FAMILY_COLORS: Record<string, string> = {
  P1: "#a16d72",
  P2: "#d83c45",
  P3: "#3196e8",
  P4: "#f4ce13",
  P5: "#e11d36",
};

const DEFAULT_TIERS: Tier[] = [
  { id: "material", label: "a fuga do plano material", color: "#e8e063" },
  { id: "peak", label: "simplesmente peak", color: "#ff5c69" },
  { id: "absurda", label: "absurda", color: "#ff8a4c" },
  { id: "muito-boa", label: "muito boa", color: "#ffbf4b" },
  { id: "boa-demais", label: "boa demais", color: "#c7d86b" },
  { id: "e-boa", label: "é boa", color: "#74cfa3" },
  { id: "ok", label: "ok", color: "#68bed5" },
  { id: "neutra", label: "nao fede nem cheira", color: "#829bd0" },
  { id: "memes", label: "meio memes", color: "#a684cb" },
  { id: "vibe", label: "estraga minha vibe", color: "#6f687d" },
];

const makeDefaultState = (): BoardState => ({
  tiers: DEFAULT_TIERS,
  board: Object.fromEntries(DEFAULT_TIERS.map((tier) => [tier.id, []])),
});

const cloneState = (state: BoardState): BoardState => ({
  tiers: state.tiers.map((tier) => ({ ...tier })),
  board: Object.fromEntries(Object.entries(state.board).map(([key, ids]) => [key, [...ids]])),
});

function familyFor(edition: string) {
  return EDITIONS.find(([id]) => id === edition)?.[2] ?? "P1";
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function TrackCard({
  track,
  selected,
  compact,
  onToggle,
  onDragStart,
  onDropBefore,
}: {
  track: Track;
  selected: boolean;
  compact?: boolean;
  onToggle: () => void;
  onDragStart: (event: DragEvent<HTMLElement>) => void;
  onDropBefore?: (event: DragEvent<HTMLElement>) => void;
}) {
  const family = familyFor(track.edition);
  return (
    <article
      className={`track-card ${selected ? "is-selected" : ""} ${compact ? "is-compact" : ""}`}
      draggable
      onDragStart={onDragStart}
      onDragOver={(event) => event.preventDefault()}
      onDrop={onDropBefore}
      onClick={onToggle}
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      aria-label={`${track.title}, ${track.game}`}
      onKeyDown={(event: ReactKeyboardEvent<HTMLElement>) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onToggle();
        }
      }}
      style={{ "--game-color": FAMILY_COLORS[family] } as React.CSSProperties}
      title={`${track.title} · ${track.game} · disco ${track.disc}, faixa ${track.track}`}
    >
      <img src={track.image} alt="" loading="lazy" decoding="async" draggable={false} />
      <span className="selection-mark" aria-hidden="true"><Check size={14} strokeWidth={3} /></span>
      <span className="edition-mark">{family}</span>
    </article>
  );
}

export function TierEditor() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [state, setState] = useState<BoardState>(makeDefaultState);
  const [past, setPast] = useState<BoardState[]>([]);
  const [future, setFuture] = useState<BoardState[]>([]);
  const [query, setQuery] = useState("");
  const [family, setFamily] = useState("ALL");
  const [edition, setEdition] = useState("ALL");
  const [sort, setSort] = useState<"archive" | "title">("archive");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [cardSize, setCardSize] = useState(152);
  const [libraryOpen, setLibraryOpen] = useState(true);
  const [targetTier, setTargetTier] = useState(DEFAULT_TIERS[0].id);
  const [toast, setToast] = useState("");
  const [ready, setReady] = useState(false);
  const boardRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const importRef = useRef<HTMLInputElement>(null);
  const draggedIds = useRef<string[]>([]);

  useEffect(() => {
    fetch("tracks.json")
      .then((response) => response.json())
      .then((data: Track[]) => {
        setTracks(data);
        const saved = localStorage.getItem("persona-music-tierlist-v2");
        if (saved) {
          try {
            const parsed = JSON.parse(saved) as BoardState;
            if (parsed.tiers?.length && parsed.board) setState(parsed);
          } catch { /* mantém o estado inicial */ }
        }
        setReady(true);
      });
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem("persona-music-tierlist-v2", JSON.stringify(state));
  }, [state, ready]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const commit = useCallback((updater: (previous: BoardState) => BoardState) => {
    setState((previous) => {
      const next = updater(cloneState(previous));
      setPast((items) => [...items.slice(-39), cloneState(previous)]);
      setFuture([]);
      return next;
    });
  }, []);

  const undo = useCallback(() => {
    setPast((items) => {
      if (!items.length) return items;
      const previous = items[items.length - 1];
      setState((current) => {
        setFuture((futureItems) => [cloneState(current), ...futureItems].slice(0, 40));
        return cloneState(previous);
      });
      return items.slice(0, -1);
    });
  }, []);

  const redo = useCallback(() => {
    setFuture((items) => {
      if (!items.length) return items;
      const next = items[0];
      setState((current) => {
        setPast((pastItems) => [...pastItems.slice(-39), cloneState(current)]);
        return cloneState(next);
      });
      return items.slice(1);
    });
  }, []);

  const trackById = useMemo(() => new Map(tracks.map((track) => [track.id, track])), [tracks]);
  const rankedIds = useMemo(() => new Set(Object.values(state.board).flat()), [state.board]);
  const unranked = useMemo(() => tracks.filter((track) => !rankedIds.has(track.id)), [tracks, rankedIds]);

  const visibleUnranked = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    const filtered = unranked.filter((track) => {
      if (family !== "ALL" && familyFor(track.edition) !== family) return false;
      if (edition !== "ALL" && track.edition !== edition) return false;
      if (!needle) return true;
      return `${track.title} ${track.originalTitle} ${track.game}`.toLocaleLowerCase().includes(needle);
    });
    if (sort === "title") return [...filtered].sort((a, b) => a.title.localeCompare(b.title));
    return filtered;
  }, [unranked, query, family, edition, sort]);

  const groupedLibrary = useMemo(() => EDITIONS.map(([id, label, group]) => ({
    id,
    label,
    group,
    tracks: visibleUnranked.filter((track) => track.edition === id),
  })).filter((entry) => entry.tracks.length), [visibleUnranked]);

  const moveTracks = useCallback((ids: string[], tierId: string | null, beforeId?: string) => {
    if (!ids.length) return;
    commit((next) => {
      Object.keys(next.board).forEach((key) => {
        next.board[key] = (next.board[key] ?? []).filter((id) => !ids.includes(id));
      });
      if (tierId) {
        const destination = [...(next.board[tierId] ?? [])];
        const index = beforeId ? destination.indexOf(beforeId) : -1;
        destination.splice(index >= 0 ? index : destination.length, 0, ...ids);
        next.board[tierId] = destination;
      }
      return next;
    });
    setSelected(new Set());
    setTargetTier(tierId ?? targetTier);
  }, [commit, targetTier]);

  const toggleSelected = (id: string) => setSelected((current) => {
    const next = new Set(current);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  const startDrag = (id: string, event: DragEvent<HTMLElement>) => {
    const ids = selected.has(id) ? [...selected] : [id];
    draggedIds.current = ids;
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", id);
  };

  useEffect(() => {
    const handler = (event: globalThis.KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (target.matches("input, textarea, select")) return;
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
        event.preventDefault();
        event.shiftKey ? redo() : undo();
      } else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "y") {
        event.preventDefault(); redo();
      } else if (event.key === "/") {
        event.preventDefault(); searchRef.current?.focus();
      } else if (event.key === "Escape") {
        setSelected(new Set()); setQuery("");
      } else if (/^[0-9]$/.test(event.key) && selected.size) {
        const index = event.key === "0" ? 9 : Number(event.key) - 1;
        const tier = state.tiers[index];
        if (tier) moveTracks([...selected], tier.id);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [moveTracks, redo, selected, state.tiers, undo]);

  const selectVisible = () => setSelected(new Set(visibleUnranked.map((track) => track.id)));

  const exportJson = () => {
    const payload = { version: 2, exportedAt: new Date().toISOString(), ...state };
    downloadBlob(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }), "persona-music-tierlist.json");
    setToast("Backup JSON exportado");
  };

  const importJson = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const payload = JSON.parse(await file.text()) as BoardState;
      if (!payload.tiers?.length || !payload.board) throw new Error("invalid");
      commit(() => ({ tiers: payload.tiers, board: payload.board }));
      setToast("Tier list importada");
    } catch {
      setToast("Arquivo inválido");
    }
    event.target.value = "";
  };

  const exportImage = async () => {
    if (!boardRef.current) return;
    setToast("Preparando imagem…");
    try {
      const dataUrl = await toPng(boardRef.current, { cacheBust: true, pixelRatio: 1, backgroundColor: "#0b0b0d" });
      const response = await fetch(dataUrl);
      downloadBlob(await response.blob(), "persona-music-tierlist.png");
      setToast("Imagem exportada");
    } catch {
      setToast("A imagem ficou grande demais; exporte o JSON");
    }
  };

  const reset = () => {
    if (!window.confirm("Limpar toda a classificação? Você ainda poderá desfazer.")) return;
    commit(() => makeDefaultState());
    setToast("Tabuleiro limpo");
  };

  const updateTier = (id: string, patch: Partial<Tier>) => commit((next) => {
    next.tiers = next.tiers.map((tier) => tier.id === id ? { ...tier, ...patch } : tier);
    return next;
  });

  const moveTier = (id: string, direction: -1 | 1) => commit((next) => {
    const index = next.tiers.findIndex((tier) => tier.id === id);
    const target = index + direction;
    if (target < 0 || target >= next.tiers.length) return next;
    [next.tiers[index], next.tiers[target]] = [next.tiers[target], next.tiers[index]];
    return next;
  });

  const addTier = () => commit((next) => {
    const id = `tier-${Date.now()}`;
    next.tiers.push({ id, label: "nova categoria", color: "#9a8cff" });
    next.board[id] = [];
    return next;
  });

  const removeTier = (id: string) => {
    if (state.tiers.length <= 1) return;
    commit((next) => {
      next.tiers = next.tiers.filter((tier) => tier.id !== id);
      delete next.board[id];
      return next;
    });
  };

  if (!ready) return (
    <main className="loading-screen">
      <div className="loading-mark">P</div>
      <p>Organizando 887 faixas…</p>
    </main>
  );

  const progress = Math.round((rankedIds.size / Math.max(tracks.length, 1)) * 100);

  return (
    <main className="app-shell" style={{ "--card-width": `${cardSize}px` } as React.CSSProperties}>
      <header className="topbar">
        <div className="brand-lockup">
          <span className="brand-kicker"><Sparkles size={14} /> Velvet Rank Protocol</span>
          <h1>Persona Music <em>Archive</em></h1>
        </div>
        <div className="progress-cluster" aria-label={`${rankedIds.size} de ${tracks.length} músicas classificadas`}>
          <div className="progress-copy"><strong>{rankedIds.size}</strong><span>/ {tracks.length} classificadas</span></div>
          <div className="progress-track"><span style={{ width: `${progress}%` }} /></div>
          <b>{progress}%</b>
        </div>
        <div className="top-actions">
          <button className="icon-button" onClick={undo} disabled={!past.length} title="Desfazer (Ctrl+Z)"><Undo2 /></button>
          <button className="icon-button" onClick={redo} disabled={!future.length} title="Refazer (Ctrl+Y)"><Redo2 /></button>
          <div className="menu-wrap">
            <button className="button secondary"><Download size={17} /> Exportar <ChevronDown size={14} /></button>
            <div className="export-menu">
              <button onClick={exportImage}><ImageDown size={17} /> Imagem PNG</button>
              <button onClick={exportJson}><FileDown size={17} /> Backup JSON</button>
              <button onClick={() => importRef.current?.click()}><FileUp size={17} /> Importar JSON</button>
            </div>
          </div>
          <input ref={importRef} type="file" accept="application/json" hidden onChange={importJson} />
        </div>
      </header>

      <section className="command-deck" aria-label="Ferramentas da tier list">
        <label className="search-box">
          <Search size={18} />
          <input ref={searchRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar música, jogo ou título original…" />
          <kbd>/</kbd>
          {query && <button onClick={() => setQuery("")} aria-label="Limpar busca"><X size={16} /></button>}
        </label>
        <div className="filter-cluster">
          {["ALL", "P1", "P2", "P3", "P4", "P5"].map((item) => (
            <button key={item} className={family === item ? "active" : ""} onClick={() => { setFamily(item); setEdition("ALL"); }}>
              {item === "ALL" ? "Todos" : item}
            </button>
          ))}
        </div>
        <label className="zoom-control" title="Tamanho das capas">
          <SlidersHorizontal size={17} />
          <input type="range" min="104" max="220" step="8" value={cardSize} onChange={(event) => setCardSize(Number(event.target.value))} />
        </label>
        <button className="icon-button danger" onClick={reset} title="Limpar tabuleiro"><RotateCcw /></button>
      </section>

      <nav className="edition-rail" aria-label="Filtrar por edição">
        {EDITIONS.map(([id, label, group]) => {
          const remaining = unranked.filter((track) => track.edition === id).length;
          return (
            <button
              key={id}
              className={edition === id ? "active" : ""}
              onClick={() => { setEdition(edition === id ? "ALL" : id); setFamily(edition === id ? "ALL" : group); }}
              style={{ "--chip-color": FAMILY_COLORS[group] } as React.CSSProperties}
            >
              <span>{label}</span><b>{remaining}</b>
            </button>
          );
        })}
      </nav>

      {selected.size > 0 && (
        <aside className="selection-bar">
          <strong>{selected.size} selecionada{selected.size > 1 ? "s" : ""}</strong>
          <select value={targetTier} onChange={(event) => setTargetTier(event.target.value)}>
            {state.tiers.map((tier, index) => <option key={tier.id} value={tier.id}>{index + 1}. {tier.label}</option>)}
          </select>
          <button className="button primary" onClick={() => moveTracks([...selected], targetTier)}>Mover</button>
          <button className="button secondary" onClick={() => moveTracks([...selected], null)}><ArchiveRestore size={16} /> Não classificadas</button>
          <button className="icon-button" onClick={() => setSelected(new Set())}><X /></button>
          <span className="shortcut-hint">atalhos: 1–0</span>
        </aside>
      )}

      <section className="board-section">
        <div className="section-heading">
          <div><span className="eyebrow">Seu cânone pessoal</span><h2>Tabuleiro</h2></div>
          <div className="section-tools"><button onClick={addTier}><Plus size={16} /> Categoria</button></div>
        </div>
        <div className="tier-board" ref={boardRef}>
          <div className="export-title"><span>PERSONA MUSIC ARCHIVE</span><b>{rankedIds.size} FAIXAS CLASSIFICADAS</b></div>
          {state.tiers.map((tier, tierIndex) => {
            const ids = state.board[tier.id] ?? [];
            return (
              <div
                className="tier-row"
                key={tier.id}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => { event.preventDefault(); moveTracks(draggedIds.current, tier.id); }}
              >
                <div className="tier-label" style={{ "--tier-color": tier.color } as React.CSSProperties}>
                  <div className="tier-number">{tierIndex === 9 ? "0" : tierIndex + 1}</div>
                  <input value={tier.label} onChange={(event) => updateTier(tier.id, { label: event.target.value })} aria-label={`Nome da categoria ${tierIndex + 1}`} />
                  <span>{ids.length} faixa{ids.length === 1 ? "" : "s"}</span>
                  <div className="tier-controls">
                    <input type="color" value={tier.color} onChange={(event) => updateTier(tier.id, { color: event.target.value })} aria-label="Cor da categoria" />
                    <button onClick={() => moveTier(tier.id, -1)} disabled={tierIndex === 0} aria-label="Mover categoria para cima"><ChevronUp /></button>
                    <button onClick={() => moveTier(tier.id, 1)} disabled={tierIndex === state.tiers.length - 1} aria-label="Mover categoria para baixo"><ChevronDown /></button>
                    <button onClick={() => removeTier(tier.id)} aria-label="Remover categoria"><Trash2 /></button>
                  </div>
                  {selected.size > 0 && <button className="drop-selected" onClick={() => moveTracks([...selected], tier.id)}>+ {selected.size}</button>}
                </div>
                <div className={`tier-content ${ids.length ? "" : "is-empty"}`}>
                  {!ids.length && <span>Arraste músicas para cá</span>}
                  {ids.map((id) => {
                    const track = trackById.get(id);
                    if (!track) return null;
                    return <TrackCard key={id} track={track} selected={selected.has(id)} compact onToggle={() => toggleSelected(id)} onDragStart={(event) => startDrag(id, event)} onDropBefore={(event) => { event.preventDefault(); event.stopPropagation(); moveTracks(draggedIds.current, tier.id, id); }} />;
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className={`library-section ${libraryOpen ? "" : "is-collapsed"}`}>
        <div className="library-heading">
          <button className="library-toggle" onClick={() => setLibraryOpen(!libraryOpen)} aria-expanded={libraryOpen}>
            <div><span className="eyebrow">Acervo não classificado</span><h2>Biblioteca <em>{unranked.length}</em></h2></div>
            {libraryOpen ? <ChevronDown /> : <ChevronUp />}
          </button>
          <div className="library-actions">
            <span>{visibleUnranked.length} visíveis</span>
            <button onClick={selectVisible} disabled={!visibleUnranked.length}>Selecionar visíveis</button>
            <select value={sort} onChange={(event) => setSort(event.target.value as "archive" | "title")} aria-label="Ordenação da biblioteca">
              <option value="archive">Ordem dos jogos</option>
              <option value="title">Título A–Z</option>
            </select>
          </div>
        </div>
        {libraryOpen && (
          <div className="library-body">
            {!groupedLibrary.length && <div className="empty-state"><Sparkles /><strong>Nenhuma faixa encontrada</strong><span>Limpe a busca ou troque o filtro.</span></div>}
            {groupedLibrary.map((group) => (
              <section className="edition-group" key={group.id} style={{ "--game-color": FAMILY_COLORS[group.group] } as React.CSSProperties}>
                <header><div><span>{group.group}</span><h3>{group.label}</h3></div><b>{group.tracks.length}</b></header>
                <div className="card-grid">
                  {group.tracks.map((track) => <TrackCard key={track.id} track={track} selected={selected.has(track.id)} onToggle={() => toggleSelected(track.id)} onDragStart={(event) => startDrag(track.id, event)} />)}
                </div>
              </section>
            ))}
          </div>
        )}
      </section>

      <footer className="app-footer">
        <span>887 faixas · Persona 1–5 · progresso salvo automaticamente</span>
        <span><kbd>/</kbd> busca <kbd>Ctrl Z</kbd> desfazer <kbd>1–0</kbd> classificar</span>
      </footer>
      {toast && <div className="toast" role="status">{toast}</div>}
    </main>
  );
}
