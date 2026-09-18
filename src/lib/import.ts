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

async function loadMatchingSheets(buffer: ArrayBuffer, namePrefix: string) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  if (workbook.worksheets.length === 0) {
    throw new Error("El archivo no tiene ninguna hoja.");
  }
  // Si el Excel tiene varias hojas (como tu archivo original con Gastos,
  // Pedidos, Pedidos EH, DTF, etc.) cogemos TODAS las que empiecen por
  // ese nombre (p.ej. "Pedidos" y "Pedidos EH"); si ninguna coincide, o
  // el archivo solo tiene una hoja, usamos la primera.
  const matching = workbook.worksheets.filter((sheet) =>
    normalizeHeader(sheet.name).startsWith(namePrefix),
  );
  return matching.length > 0 ? matching : [workbook.worksheets[0]];
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
  const sheets = await loadMatchingSheets(buffer, "gasto");
  const rows: ParsedExpenseRow[] = [];
  const skipped = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const sheet of sheets) {
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

    if (!categoryCol && !amountCol) {
      // esta hoja no parece de gastos, la saltamos entera
      continue;
    }

    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      const date = dateCol ? cellDate(row.getCell(dateCol).value) : null;
      const category = categoryCol
        ? cellText(row.getCell(categoryCol).value)
        : null;
      const concept = conceptCol
        ? cellText(row.getCell(conceptCol).value)
        : null;
      const amount = amountCol ? cellNumber(row.getCell(amountCol).value) : null;
      const paymentMethod = paymentCol
        ? cellText(row.getCell(paymentCol).value)
        : null;

      const isEntirelyEmpty =
        !date && !category && !concept && amount === null && !paymentMethod;
      if (isEntirelyEmpty) return;

      rows.push({
        date: date ?? today,
        category: category ?? "Sin categoría",
        concept,
        amount: amount ?? 0,
        paymentMethod,
      });
    });
  }

  if (rows.length === 0 && skipped === 0) {
    throw new Error(
      'No encuentro ninguna fila de gastos (columnas "Fecha", "Categoría" o "Precio") en el archivo.',
    );
  }

  return { rows, skipped };
}

export type ParsedOrderRow = {
  orderNumber: string | null;
  quantity: number;
  model: string;
  color: string | null;
  size: string | null;
  price: number;
  status: OrderStatus;
  date: Date | null;
};

export async function parseOrdersFile(buffer: ArrayBuffer) {
  const sheets = await loadMatchingSheets(buffer, "pedido");
  const rows: ParsedOrderRow[] = [];
  const skipped = 0;

  for (const sheet of sheets) {
    const headerMap = buildHeaderMap(sheet);

    // La columna del número/nombre de pedido es siempre la primera
    // (columna A) de la hoja, sea cual sea el texto exacto de su
    // cabecera ("Nº Pedido", "Nº/Nombre Pedido", etc.).
    const orderNumberCol = 1;
    const quantityCol = findColumn(headerMap, ["cantidad"]);
    const modelCol = findColumn(headerMap, ["modelo"]);
    const colorCol = findColumn(headerMap, ["color"]);
    const sizeCol = findColumn(headerMap, ["talla"]);
    const priceCol = findColumn(headerMap, ["precio", "importe"]);
    const statusCol = findColumn(headerMap, ["estado"]);
    const dateCol = findColumn(headerMap, ["fecha"]);

    if (!modelCol && !priceCol) {
      // esta hoja no parece de pedidos, la saltamos entera
      continue;
    }

    // Si la hoja no tiene columna "Modelo" (como una hoja de un único
    // producto), usamos el nombre de la propia hoja como modelo por
    // defecto en vez de "Sin modelo".
    const defaultModel = modelCol ? "Sin modelo" : sheet.name.trim();

    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      const orderNumber = cellText(row.getCell(orderNumberCol).value);
      const orderNumberAsNumber = cellNumber(row.getCell(orderNumberCol).value);
      const model = modelCol ? cellText(row.getCell(modelCol).value) : null;
      const color = colorCol ? cellText(row.getCell(colorCol).value) : null;
      const size = sizeCol ? cellText(row.getCell(sizeCol).value) : null;
      const price = priceCol ? cellNumber(row.getCell(priceCol).value) : null;
      const quantity = quantityCol
        ? cellNumber(row.getCell(quantityCol).value)
        : null;
      const status = statusCol
        ? cellText(row.getCell(statusCol).value)
        : null;
      const date = dateCol ? cellDate(row.getCell(dateCol).value) : null;

      const isEntirelyEmpty =
        !orderNumber &&
        !model &&
        price === null &&
        !color &&
        !size &&
        quantity === null &&
        !status &&
        !date;
      if (isEntirelyEmpty) return;

      // Fila de referencia/plantilla que algunos Excel dejan con Nº
      // pedido = 0 y ningún otro dato real de producto.
      const isZeroReferenceRow =
        orderNumberAsNumber === 0 && !model && !color && !size;
      if (isZeroReferenceRow) return;

      rows.push({
        orderNumber,
        quantity: quantity && quantity > 0 ? Math.trunc(quantity) : 1,
        model: model ?? defaultModel,
        color,
        size,
        price: price ?? 0,
        status: normalizeOrderStatus(status),
        date,
      });
    });
  }

  if (rows.length === 0 && skipped === 0) {
    throw new Error(
      'No encuentro ninguna fila de pedidos (columnas "Modelo", "Precio" o "Nº Pedido") en el archivo.',
    );
  }

  return { rows, skipped };
}
