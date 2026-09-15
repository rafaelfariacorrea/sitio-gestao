import { FarmState, formatCurrency, formatFullDate } from "./farm-data";

function csvCell(value: unknown) { return `"${String(value ?? "").replace(/"/g, '""')}"`; }

export function buildCsv(state: FarmState) {
  const rows = [
    ["FINANÇAS"],
    ["Tipo", "Descrição", "Categoria", "Cultura", "Quantidade (kg)", "Valor por kg", "Valor total", "Data"],
    ...state.transactions.map((item) => [item.kind === "expense" ? "Despesa" : "Receita", item.description, item.category, item.culture ?? "Geral", item.quantityKg ?? "", item.pricePerKg?.toFixed(2).replace(".", ",") ?? "", item.amount.toFixed(2).replace(".", ","), formatFullDate(item.date)]),
    [],
    ["INVENTÁRIO"],
    ["Item", "Categoria", "Quantidade", "Unidade", "Mínimo", "Validade", "Atualizado em"],
    ...state.inventory.map((item) => [item.name, item.category, item.quantity, item.unit, item.minimum, item.expiresAt ?? "Não informado", formatFullDate(item.updatedAt)]),
  ];
  return "\uFEFF" + rows.map((row) => row.map(csvCell).join(";")).join("\n");
}

export function buildPdfHtml(state: FarmState) {
  const revenue = state.transactions.filter((item) => item.kind === "revenue").reduce((sum, item) => sum + item.amount, 0);
  const expenses = state.transactions.filter((item) => item.kind === "expense").reduce((sum, item) => sum + item.amount, 0);
  const rows = state.transactions.map((item) => `<tr><td>${item.kind === "expense" ? "Despesa" : "Receita"}</td><td>${item.description}</td><td>${item.culture ?? "Geral"}</td><td>${item.quantityKg ? `${item.quantityKg} kg` : "—"}</td><td>${item.pricePerKg ? `${formatCurrency(item.pricePerKg)}/kg` : "—"}</td><td>${formatCurrency(item.amount)}</td><td>${formatFullDate(item.date)}</td></tr>`).join("");
  const stock = state.inventory.map((item) => `<tr><td>${item.name}</td><td>${item.category}</td><td>${item.quantity} ${item.unit}</td><td>${item.minimum} ${item.unit}</td><td>${item.expiresAt ?? "Não informado"}</td></tr>`).join("");
  return `<html><head><meta name="viewport" content="width=device-width" /><style>body{font-family:Arial,sans-serif;color:#173324;padding:24px}h1{color:#2F6B45}h2{margin-top:28px;color:#2F6B45}table{width:100%;border-collapse:collapse;margin-top:10px}th,td{border:1px solid #DCE8DE;padding:7px;text-align:left;font-size:10px}th{background:#EEF6EF}.summary{display:flex;gap:24px;background:#F6F8F2;padding:14px}.summary b{font-size:18px}</style></head><body><h1>Relatório — Sítio Gestão</h1><p>Gerado em ${formatFullDate(new Date().toISOString())}</p><div class="summary"><div>Receitas<br><b>${formatCurrency(revenue)}</b></div><div>Despesas<br><b>${formatCurrency(expenses)}</b></div><div>Saldo<br><b>${formatCurrency(revenue - expenses)}</b></div></div><h2>Finanças</h2><table><tr><th>Tipo</th><th>Descrição</th><th>Cultura</th><th>Quantidade</th><th>Preço/kg</th><th>Total</th><th>Data</th></tr>${rows || "<tr><td colspan='7'>Nenhum lançamento registrado.</td></tr>"}</table><h2>Inventário</h2><table><tr><th>Item</th><th>Categoria</th><th>Quantidade</th><th>Mínimo</th><th>Validade</th></tr>${stock || "<tr><td colspan='5'>Nenhum item cadastrado.</td></tr>"}</table></body></html>`;
}
