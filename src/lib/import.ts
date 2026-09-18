import "server-only";
import ExcelJS from "exceljs";
import { normalizeOrderStatus, type OrderStatus } from "@/lib/order-status";

function normalizeHeader(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function cellText(value: ExcelJS.CellValue): string | null {
  if (value === null || value === undefined) return null;
  if (value instanceof Date) return null;
  if (typeof value === "object") {
    if ("richText" in value) {
      return (
        value.richText
          .map((part) => part.text)
          .join("")
          .trim() || null
      );
    }
    if ("result" in value) return cellText(value.result ?? null);
    if ("text" in value) return String(value.text).trim() || null;
    return null;
  }
  const text = String(value).trim();
  return text ? text : null;
}

function cellNumber(value: ExcelJS.CellValue): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "object" && "result" in value) {
    return cellNumber(value.result ?? null);
  }
  const text = cellText(value);
  if (!text) return null;
  const normalized = text.replace(/\./g, "").replace(",", ".");
  const parsed = Number(text.includes(",") ? normalized : text);
  return Number.isFinite(parsed) ? parsed : null;
}

function cellDate(value: ExcelJS.CellValue): Date | null {
  if (value instanceof Date) return value;
  if (typeof value === "object" && value && "result" in value) {
    return cellDate(value.result ?? null);
  }
  const text = cellText(value);
  if (!text) return null;
  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

async function loadSheet(buffer: ArrayBuffer, nameAliases: string[]) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  if (workbook.worksheets.length === 0) {
    throw new Error("El archivo no tiene ninguna hoja.");
  }
  // Si el Excel tiene varias hojas (como tu archivo original con Gastos,
  // Pedidos, DTF, etc.) usamos la que coincide por nombre; si no la
  // encuentra, o el archivo solo tiene una hoja, usa la primera.
  const byName = workbook.worksheets.find((sheet) =>
    nameAliases.includes(normalizeHeader(sheet.name)),
  );
  return byName ?? workbook.worksheets[0];
}

function buildHeaderMap(sheet: ExcelJS.Worksheet) {
  const map = new Map<string, number>();
  sheet.getRow(1).eachCell((cell, colNumber) => {
    const header = normalizeHeader(cellText(cell.value) ?? "");
    if (header && !map.has(header)) map.set(header, colNumber);
  });
  return map;
}

function findColumn(headerMap: Map<string, number>, aliases: string[]) {
  for (const alias of aliases) {
    const col = headerMap.get(alias);
    if (col) return col;
  }
  return undefined;
}

export type ParsedExpenseRow = {
  date: Date;
  category: string;
  concept: string | null;
  amount: number;
  paymentMethod: string | null;
};

export async function parseExpensesFile(buffer: ArrayBuffer) {
  const sheet = await loadSheet(buffer, ["gastos", "gasto"]);
  const headerMap = buildHeaderMap(sheet);

  const dateCol = findColumn(headerMap, ["fecha"]);
  const categoryCol = findColumn(headerMap, ["categoria"]);
  const conceptCol = findColumn(headerMap, ["concepto"]);
  const amountCol = findColumn(headerMap, ["precio", "importe"]);
  const paymentCol = findColumn(headerMap, [
    "metododepago",
    "metodopago",
    "pago",
  ]);

  if (!dateCol || !categoryCol || !amountCol) {
    throw new Error(
      'No encuentro las columnas "Fecha", "Categoría" y "Precio" en la primera hoja del Excel.',
    );
  }

  const rows: ParsedExpenseRow[] = [];
  let skipped = 0;

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const date = cellDate(row.getCell(dateCol).value);
    const category = cellText(row.getCell(categoryCol).value);
    const amount = cellNumber(row.getCell(amountCol).value);
    if (!date || !category || amount === null) {
      if (date || category || amount !== null) skipped += 1;
      return;
    }
    rows.push({
      date,
      category,
      concept: conceptCol ? cellText(row.getCell(conceptCol).value) : null,
      amount,
      paymentMethod: paymentCol
        ? cellText(row.getCell(paymentCol).value)
        : null,
    });
  });

  return { rows, skipped };
}

export type ParsedOrderRow = {
  orderNumber: number | null;
  quantity: number;
  model: string;
  color: string | null;
  size: string | null;
  price: number;
  status: OrderStatus;
  date: Date | null;
};

export async function parseOrdersFile(buffer: ArrayBuffer) {
  const sheet = await loadSheet(buffer, ["pedidos", "pedido"]);
  const headerMap = buildHeaderMap(sheet);

  const orderNumberCol = findColumn(headerMap, [
    "npedido",
    "nopedido",
    "numeropedido",
    "pedido",
  ]);
  const quantityCol = findColumn(headerMap, ["cantidad"]);
  const modelCol = findColumn(headerMap, ["modelo"]);
  const colorCol = findColumn(headerMap, ["color"]);
  const sizeCol = findColumn(headerMap, ["talla"]);
  const priceCol = findColumn(headerMap, ["precio", "importe"]);
  const statusCol = findColumn(headerMap, ["estado"]);
  const dateCol = findColumn(headerMap, ["fecha"]);

  if (!modelCol || !priceCol) {
    throw new Error(
      'No encuentro las columnas "Modelo" y "Precio" en la primera hoja del Excel.',
    );
  }

  const rows: ParsedOrderRow[] = [];
  let skipped = 0;

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const model = cellText(row.getCell(modelCol).value);
    const price = cellNumber(row.getCell(priceCol).value);
    if (!model || price === null) {
      if (model || price !== null) skipped += 1;
      return;
    }
    const orderNumber = orderNumberCol
      ? cellNumber(row.getCell(orderNumberCol).value)
      : null;
    if (orderNumberCol && orderNumber === 0) {
      // fila de referencia/plantilla que algunos Excel dejan como Nº pedido = 0
      skipped += 1;
      return;
    }
    const quantity = quantityCol
      ? cellNumber(row.getCell(quantityCol).value)
      : null;

    rows.push({
      orderNumber: orderNumber !== null ? Math.trunc(orderNumber) : null,
      quantity: quantity && quantity > 0 ? Math.trunc(quantity) : 1,
      model,
      color: colorCol ? cellText(row.getCell(colorCol).value) : null,
      size: sizeCol ? cellText(row.getCell(sizeCol).value) : null,
      price,
      status: normalizeOrderStatus(
        statusCol ? cellText(row.getCell(statusCol).value) : null,
      ),
      date: dateCol ? cellDate(row.getCell(dateCol).value) : null,
    });
  });

  return { rows, skipped };
}
