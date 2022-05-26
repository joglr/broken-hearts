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

  return (
    <>
      <header>
        In 2022 alone,
        <br />
        <p className="large">{data.totalThisYear}</p>
        <br />
        children has been murdered in the United States
        <br />
        It has been
        <br />
        <p className="large">{daysSinceLastIncident}</p>
        <br />
        day{daysSinceLastIncident === 1 ? "" : "s"} since the last shooting
        <br />
        {data.lastShooting.description}
        <br />
        {data.perMonth.map((x, i) => {
          if (x == null) return null;
          return (
            <div key={i}>
              {months[i]}
              <br />
              {x}
            </div>
          );
        })}
      </header>
    </>
  );
}
