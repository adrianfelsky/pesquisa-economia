const { useState, useRef, useEffect } = React;
const { BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer, LabelList, PieChart, Pie, Label } = window.Recharts;
const Papa = window.Papa;

const T = {
  navy: "#1e2a4a",
  navyLight: "#4a5f8a",
  gold: "#c9a45a",
  muted: "#7a8099",
  colors: [
    "#1e2a4a", /* Azul Escuro (Principal) */
    "#c9a45a", /* Dourado */
    "#60437a", /* Azul Médio */
    "#8abf8e", /* Azul Cinza */
    "#2ca4b9", /* Azul Noite */
    "#8a9abf", /* Azul Cinza */
    "#141c33", /* Azul Muito Escuro */
    "#686868"  /* Dourado Suave */
  ]
};
const AGE_OPTS = ["Todos", "18-24", "25-34", "35-44", "45+"];

// Colunas do Forms que serão ignoradas na geração dos gráficos
const COLUNAS_IGNORADAS = ["Carimbo de data/hora"];

// 📌 INSIGHTS DE VOLTA PRO CÓDIGO (Chaves atualizadas para o texto exato do Forms)
const INSIGHTS = {
  "Qual a sua faixa etária?": "A geração 18-24 domina a amostra (35%), refletindo maior familiaridade com plataformas digitais. O grupo 45+ (26%) representa a segunda maior fatia, sinalizando adoção ampla.",
  "Ao planejar uma viagem, qual é o seu principal canal para reservar hospedagem?": "Plataformas digitais e Airbnb somam 73% das reservas. O contato direto com o hotel representa apenas 26% — evidenciando o peso das OTAs no processo de decisão.",
  "Quando você encontra um hotel de seu interesse em uma plataforma (ex: Booking), com que frequência você procura o site ou o contato direto do hotel para comparar o preço?": "44,1% dos respondentes raramente ou nunca comparam preços com o hotel diretamente. Isso valida empiricamente a inércia de decisão identificada no caso alemão (Bundeskartellamt, 2020).",
  "Se você respondeu \"Raramente\" ou \"Nunca\" na questão anterior, qual o principal motivo?": "Aversão ao esforço mental (33%) e excesso de confiança (27%) são os vieses dominantes — os mesmos identificados por Bezerra (2023) como facilitadores das cláusulas MFN.",
  "Avisos como \"Resta apenas 1 quarto por este preço\" ou \"5 pessoas estão olhando esta acomodação agora\" influenciam você a fechar a reserva mais rápido?": "41,2% confessam sentir urgência com mensagens de escassez. O viés de aversão à perda atua reduzindo a deliberação racional e beneficiando as plataformas com maior conversão."
};

const PERGUNTAS = {
  "Qual a sua faixa etária?": "FAIXA ETÁRIA",
  "Ao planejar uma viagem, qual é o seu principal canal para reservar hospedagem?": "CANAL DE RESERVA",
  "Quando você encontra um hotel de seu interesse em uma plataforma (ex: Booking), com que frequência você procura o site ou o contato direto do hotel para comparar o preço?": "COMPARAÇÃO DE PREÇOS",
  "Se você respondeu \"Raramente\" ou \"Nunca\" na questão anterior, qual o principal motivo?": "MOTIVO DE NÃO COMPARAR",
  "Avisos como \"Resta apenas 1 quarto por este preço\" ou \"5 pessoas estão olhando esta acomodação agora\" influenciam você a fechar a reserva mais rápido?": "GATILHO DE URGÊNCIA"
}

function AnimNum({ value }) {
  const [d, setD] = useState(0);
  const r = useRef(null);
  useEffect(() => {
    const from = d, start = Date.now(), dur = 520;
    const go = () => {
      const t = Math.min((Date.now() - start) / dur, 1);
      setD(Math.round(from + (value - from) * (1 - Math.pow(1 - t, 3))));
      if (t < 1) r.current = requestAnimationFrame(go);
    };
    r.current = requestAnimationFrame(go);
    return () => cancelAnimationFrame(r.current);
  }, [value]);
  return <>{d}</>;
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <div className="custom-tooltip">
      <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, marginBottom: 6, color: T.gold }}>{item.label || label}</div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}><span style={{ color: "#a0aec0" }}>Respostas</span><span style={{ fontWeight: 700 }}>{item.value}</span></div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, marginTop: 2 }}><span style={{ color: "#a0aec0" }}>Fatia</span><span style={{ fontWeight: 700, color: T.gold }}>{item.pct}%</span></div>
    </div>
  );
}

function Dashboard() {
  const [data, setData] = useState({ rawAll: {}, rawByAge: {}, questions: [] });
  const [loading, setLoading] = useState(true);

  const [question, setQuestion] = useState("");
  const [chartType, setChartType] = useState("bar");
  const [sortMode, setSortMode] = useState("desc");
  const [ageFilter, setAgeFilter] = useState("Todos");
  const [hoverIdx, setHoverIdx] = useState(null);

  useEffect(() => {
    // Agora busca apenas o arquivo CSV
    fetch('./pesquisa.csv')
      .then(res => res.text())
      .then(csvText => {
        Papa.parse(csvText, {
          header: true, skipEmptyLines: true,
          complete: function (results) {
            const rows = results.data;
            const allColumns = results.meta.fields || [];

            // Filtra as colunas indesejadas (como Carimbo de data/hora)
            const columns = allColumns.filter(col =>
              !COLUNAS_IGNORADAS.includes(col.trim()) && col.trim() !== ""
            );

            let calcAll = {}, calcByAge = {};

            columns.forEach(q => { calcAll[q] = {}; calcByAge[q] = {}; });

            rows.forEach(row => {
              const age = row["Qual a sua faixa etária?"];
              if (!age) return;

              columns.forEach(q => {
                const answer = row[q];
                if (!answer) return;
                calcAll[q][answer] = (calcAll[q][answer] || 0) + 1;
                if (!calcByAge[q][age]) calcByAge[q][age] = {};
                calcByAge[q][age][answer] = (calcByAge[q][age][answer] || 0) + 1;
              });
            });

            setData({ rawAll: calcAll, rawByAge: calcByAge, questions: columns });

            setQuestion(columns[0]);
            setLoading(false);
          }
        });
      })
      .catch(err => { console.error(err); setLoading(false); });
  }, []);

  if (loading) return <div style={{ padding: 50, textAlign: "center" }}>Carregando dados da pesquisa...</div>;
  if (data.questions.length === 0) return <div style={{ padding: 50, color: "red" }}>Erro ao ler arquivo. Verifique se o pesquisa.csv existe.</div>;

  let raw = ageFilter === "Todos" ? (data.rawAll[question] || {}) : ((data.rawByAge[question] || {})[ageFilter] || {});
  let entries = Object.entries(raw).filter(([, v]) => v > 0);
  const total = entries.reduce((s, [, v]) => s + v, 0);

  if (sortMode === "desc") entries.sort((a, b) => b[1] - a[1]);
  else if (sortMode === "asc") entries.sort((a, b) => a[1] - b[1]);
  else entries.sort((a, b) => a[0].localeCompare(b[0]));

  const items = entries.map(([label, value]) => ({ label, value, pct: total > 0 ? Math.round(value / total * 100) : 0 }));
  const topItem = items[0];

  return (
    <div>
      <header className="header">
        <div className="header-left">
          <span className="eyebrow">Economia Digital e Comportamento · UFSC Blumenau · 2026</span>
          <h1 className="header-title">Vieses Cognitivos em Plataformas de Hospedagem</h1>
          <p className="header-sub">Adrian Gazzani Felsky dos Anjos · Dashboard analítico interativo</p>
        </div>
        <div className="badge">{data.rawAll[data.questions[0]] ? Object.values(data.rawAll[data.questions[0]]).reduce((a, b) => a + b, 0) : 0} respondentes</div>
      </header>

      <div className="dashboard-body">
        <div className="controls-row">

          <div className="kpi"><div className="kpi-val"><AnimNum value={topItem?.pct || 0} />%</div><div className="kpi-sub">{sortMode === "desc" ? "Maior" : sortMode === "asc" ? "Menor" : "Ordem Alfabética"} {sortMode === "alpha" ? "" : "fatia"} · {topItem?.label || "—"}</div></div>

          <div>
            <span className="field-label">Tipo de gráfico</span>
            <div style={{ display: "flex", gap: 4 }}>
              <button className={`btn-pill ${chartType === "bar" ? "active" : ""}`} onClick={() => setChartType("bar")}>Barras</button>
              <button className={`btn-pill ${chartType === "pie" ? "active" : ""}`} onClick={() => setChartType("pie")}>Pizza</button>
            </div>
          </div>
          <div>
            <span className="field-label">Ordenação</span>
            <div style={{ display: "flex", gap: 4 }}>
              <button className={`btn-pill ${sortMode === "desc" ? "active" : ""}`} onClick={() => setSortMode("desc")}>↓ Maior</button>
              <button className={`btn-pill ${sortMode === "asc" ? "active" : ""}`} onClick={() => setSortMode("asc")}>↑ Menor</button>
              <button className={`btn-pill ${sortMode === "alpha" ? "active" : ""}`} onClick={() => setSortMode("alpha")}>A–Z</button>
            </div>
          </div>
          <div>
            <span className="field-label">Faixa etária</span>
            <select className="styled-select" value={ageFilter} onChange={e => setAgeFilter(e.target.value)}>
              {AGE_OPTS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        </div>

        <div className={`chart-card ${hoverIdx !== null ? "is-hovering idx-" + hoverIdx : ""}`}>
          <div className="chart-header">
            <div>
              <p className="chart-title">{question}</p>
              <p className="chart-sub">Amostra: {total} respondentes</p>
            </div>
          </div>
          <div className="gold-line"></div>

          {items.length === 0 ? <div style={{ textAlign: "center", padding: "48px 0", color: T.muted }}>Sem dados.</div> : chartType === "bar" ? (

            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={items} margin={{ top: 28, right: 20, bottom: 0, left: 0 }} barCategoryGap="32%">
                <XAxis dataKey="label" tickFormatter={l => l.length > 25 ? l.slice(0, 22) + "…" : l} tick={{ fill: T.muted, fontSize: 12 }} tickLine={false} interval={0} angle={0} textAnchor={"middle"} />
                <YAxis hide />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(201,164,90,0.06)", radius: 6 }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={72} onMouseEnter={(_, i) => setHoverIdx(i)} onMouseLeave={() => setHoverIdx(null)}>
                  <LabelList dataKey="value" position="top" style={{ fill: T.navy, fontSize: 13, fontWeight: 700 }} />
                  {items.map((_, i) => (
                    <Cell key={i} fill={T.colors[i % T.colors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={items} dataKey="value" nameKey="label" cx="50%" cy="50%" innerRadius="50%" outerRadius="76%" paddingAngle={3} onMouseEnter={(_, i) => setHoverIdx(i)} onMouseLeave={() => setHoverIdx(null)} animationDuration={550}>
                  <Label position="center" content={({ viewBox }) => {
                    const d = hoverIdx !== null ? items[hoverIdx] : null;
                    return (
                      <g>
                        <text x={viewBox.cx} y={viewBox.cy - 10} textAnchor="middle" fill={T.navy} fontSize={28} fontWeight={700}>{d ? `${d.pct}%` : total}</text>
                        <text x={viewBox.cx} y={viewBox.cy + 14} textAnchor="middle" fill={T.muted} fontSize={12}>{d ? "da amostra" : "respostas"}</text>
                      </g>
                    );
                  }} />
                  {items.map((_, i) => (
                    <Cell key={i} fill={T.colors[i % T.colors.length]} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          )}

          <div className="legend-row">
            {items.map((item, i) => (
              <div key={i} className="legend-item" style={{ opacity: hoverIdx === null || hoverIdx === i ? 1 : 0.35 }} onMouseEnter={() => setHoverIdx(i)} onMouseLeave={() => setHoverIdx(null)}>
                <span style={{
                  width: 10, height: 10, borderRadius: 2, flexShrink: 0,
                  background: T.colors[i % T.colors.length]
                }} />
                <span>{item.label.length > 60 ? item.label.slice(0, 55) + "…" : item.label}</span><span style={{ color: T.gold, marginLeft: 2, fontWeight: 700 }}>· {item.pct}%</span>
              </div>
            ))}
          </div>

          <div className="insight">
            <div className="insight-label">📌 Implicação analítica</div>
            <p className="insight-text">{INSIGHTS[question] || "Sem insight disponível para esta pergunta. Adicione no objeto INSIGHTS do código."}</p>
          </div>
        </div>

        {/* criar botoes melhores */}
        <div className="q-pills-row">
          {data.questions.map((q, i) => (
            <button key={q} onClick={() => setQuestion(q)} className={`btn-pill ${question === q ? "active" : ""}`}>
              {PERGUNTAS[q]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Dashboard />);