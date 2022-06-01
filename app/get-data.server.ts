import { load } from "cheerio";

const wikiURL =
  "https://en.m.wikipedia.org/wiki/List_of_mass_shootings_in_the_United_States_in_2022";

export async function getData() {
  // : Promise<Data>
  // Fetch HTML text from Wikipedia
  const response = await fetch(wikiURL);
  const text = await response.text();

  // Parse HTML text
  const $ = load(text);

  const table = $("table").first();

  const rawIncidents: {
    date: string;
    city: string;
    state: string;
    dead: number;
    injured: number;
    total: number;
    description: string;
  }[] = [];

  let maxTotal = 0;

  table.find("tr").each((i, elem) => {
    // if (i !== 1) {
    //   return;
    // }
    if (i === 0) {
      return;
    }
    const row = $(elem);

    const date = cleanText(row.find("td:nth-child(1)").text());
    const city = cleanText(row.find("td:nth-child(2)").text());
    const state = cleanText(row.find("td:nth-child(3)").text());
    const dead = Number(cleanText(row.find("td:nth-child(4)").text()));
    const injured = Number(cleanText(row.find("td:nth-child(5)").text()));
    const total = Number(cleanText(row.find("td:nth-child(6)").text()));
    const description = cleanText(row.find("td:nth-child(7)").text());

    if (total > maxTotal) {
      maxTotal = total;
    }

    const entry = {
      date,
      city,
      state,
      dead,
      injured,
      total,
      description,
    };

    rawIncidents.push(entry);
  });

  // Normalize data

  const incidents = rawIncidents.map((incident) => {
    return {
      ...incident,
      deadNormalized: incident.dead / maxTotal,
      injuredNormalized: incident.injured / maxTotal,
      totalNormalized: incident.total / maxTotal,
    };
  });

  // Get first table row
  const firstTableRow = table.find("tr:nth-child(2)");

  const dateRaw = firstTableRow.find("td").first().text();
  // return date

  const date = new Date(`${dateRaw} 2022`).getTime();
  const descriptionNode = firstTableRow.find("td").last();

  // remove sup tags

  const description = removeFootnotes(descriptionNode.remove("sup").text());

  const perMonth: (number | null)[] = new Array(12).fill(0);

  // Get per month table

  const totalTable = $("tbody").last();
  const totalTableRows = totalTable.find("tr");

  // Get per month
  totalTableRows.each((i, row) => {
    if (i > 12) return;
    const firstCell = $(row).find("td:nth-child(1)");
    const cell = $(row).find("td:nth-child(4)");
    const textValue = cell.last().text().trim();
    console.log(`${firstCell.text().trim()} ${textValue}`);
    const perMonthValue = parseInt(textValue);
    perMonth[i - 1] = isNaN(perMonthValue) ? null : perMonthValue;
  });

  const totalDeadThisYear = incidents.reduce<number>(
    (acc, curr) => acc + curr.dead,
    0
  );
  const totalInjuredThisYear = incidents.reduce<number>(
    (acc, curr) => acc + curr.injured,
    0
  );

  const result = {
    lastShooting: {
      date,
      description,
    },
    perMonth,
    totalDeadThisYear,
    totalInjuredThisYear,
    incidents,
  };

  console.log(JSON.stringify(result, null, 2));

  return result;
}

function removeFootnotes(text: string) {
  return text.replace(/\[.+\]/g, "");
}

function removeParens(text: string) {
  return text.replace(/\(.+\)/g, "");
}

function cleanText(text: string) {
  return pipe(
    removeFootnotes,
    removeParens,
    (s: string) => s.trim()
  )(text);
}

// Pipe function

const pipe =
  (...fns: Function[]) =>
  (x: any) =>
    fns.reduce((v, f) => f(v), x);
