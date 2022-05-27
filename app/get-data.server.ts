import { load } from "cheerio";

const wikiURL =
  "https://en.m.wikipedia.org/wiki/List_of_mass_shootings_in_the_United_States_in_2022";

interface Data {
  lastShooting: {
    date: number;
    description: string;
  };
  perMonth: (number | null)[];
  totalThisYear: number;
}

export async function getData(): Promise<Data> {
  // Fetch HTML text from Wikipedia
  const response = await fetch(wikiURL);
  const text = await response.text();

  // Parse HTML text
  const $ = load(text);

  const table = $("table").first();
  // Get first table row
  const firstTableRow = table.find("tr:nth-child(2)");

  const dateRaw = firstTableRow.find("td").first().text();
  // return date

  const date = new Date(`${dateRaw} 2022`).getTime();
  const descriptionNode = firstTableRow.find("td").last();

  // remove sup tags

  const description = descriptionNode.remove("sup").text();

  const perMonth: (number | null)[] = new Array(12).fill(0);

  // Get per month table

  const totalTable = $("tbody").last();
  const totalTableRows = totalTable.find("tr");

  // Get per month
  totalTableRows.each((i, row) => {
    if (i == 11) return;
    const cell = $(row).find("td:nth-child(4)");
    const textValue = cell.last().text();

    const perMonthValue = parseInt(textValue);
    perMonth[i-1] = isNaN(perMonthValue) ? null : perMonthValue;
  });

  const totalThisYear = perMonth.reduce<number>((acc, curr) => acc + (curr ?? 0), 0);
  console.log(totalThisYear)

  return {
    lastShooting: {
      date,
      description,
    },
    perMonth,
    totalThisYear,
  };
}
