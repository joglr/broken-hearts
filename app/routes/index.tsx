import type { LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getData } from "~/get-data.server";

export const loader: LoaderFunction = async ({ params }) => {
  const data = JSON.stringify(await getData());

  return new Response(data, {
    headers: {
      "Cache-Control": `public, max-age=${60 * 10}, s-maxage=${60 * 60 * 24}`,
      "Content-Type": "application/json",
      "Content-Length": String(Buffer.byteLength(data)),
    },
  });
};

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function Index() {
  const data = useLoaderData<Awaited<ReturnType<typeof getData>>>();
  const todayDate = new Date().getTime();
  const timeSinceLastIncident = todayDate - data.lastShooting.date;
  const daysSinceLastIncident = Math.floor(
    timeSinceLastIncident / (1000 * 60 * 60 * 24)
  );

  const brokenHearts = [];

  for (let i = 0; i < data.totalThisYear; i++) {
    brokenHearts.push(
      <div className="broken-heart" key={i}>
        💔
      </div>
    );
  }

  return (
    <>
      <section className="full-height stats">
        <div className="stat">
          In 2022 alone,
          <p className="large-stat">{data.totalThisYear}</p>
          children has been murdered in the United States in school shootings.
        </div>
        <div className="stat">
          It has been
          <p className="large-stat">{daysSinceLastIncident}</p>
          <div title="data.lastShooting.description">
            day{daysSinceLastIncident === 1 ? "" : "s"} since the last school
            shooting
          </div>
        </div>
      </section>
      <section className="full-height">
        <div className="broken-hearts">{brokenHearts}</div>
      </section>
      <section className="full-height months">
        {data.perMonth.map((x, i) => {
          // if (x == null) return null;
          return (
            <div key={i}>
              <div>{months[i]}</div>
              <div className="month-stat">{x ?? "-"}</div>
            </div>
          );
        })}
      </section>
      <section className="sources">
        <h2>Sources</h2>
        <ul>
          <li>
            <a
              href="https://en.m.wikipedia.org/wiki/List_of_mass_shootings_in_the_United_States_in_2022"
              target="_blank"
              rel="noreferrer"
            >
              Wikipedia
            </a>
          </li>
        </ul>
      </section>
    </>
  );
}
