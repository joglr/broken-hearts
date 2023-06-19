import type { LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useRef } from "react";
import { useDimensions } from "~/hooks";
import { animated, useSpring } from "react-spring";
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

type Data = Awaited<ReturnType<typeof getData>>;

export default function Index() {
  const data = useLoaderData<Data>();
  const todayDate = new Date().getTime();
  const timeSinceLastIncident = todayDate - data.lastShooting.date;
  const daysSinceLastIncident = Math.floor(
    timeSinceLastIncident / (1000 * 60 * 60 * 24)
  );

  const year = new Date().getFullYear()

  return (
    <>
      <section className="full-height grid weight-700">
        <div className="stats">
          <div className="stat">
            <span>In {year} alone,</span>
            <p className="large-stat">{data.totalDeadThisYear}</p>
            <span>
              people has been murdered in the United States in mass
              shootings.
            </span>
          </div>

          <div className="stat">
            <span>In {year} alone,</span>
            <p className="large-stat">{data.totalInjuredThisYear}</p>
            <span>
              people has been injured in the United States in mass shootings.
            </span>
          </div>
          <div className="stat">
            <span>It has been</span>
            <p className="large-stat">{daysSinceLastIncident}</p>
            <div title={data.lastShooting.description}>
              day{daysSinceLastIncident === 1 ? "" : "s"} since the last mass
              shooting
            </div>
          </div>
        </div>
      </section>
      <Incidents />
      <section className="full-height months">
        {months.map((monthName, i) =>
          (data.perMonth[i] ?? 0) > 0 ? (
            <div key={i}>
              <div className="weight-900">{monthName}</div>
              <div className="large-stat">{data.perMonth[i]!}</div>
              <Hearts count={data.perMonth[i]!} />
            </div>
          ) : null
        )}
      </section>
      <section className="sources">
        <h2>Sources</h2>
        <ul>
          <li>
            <a
              href={`https://en.m.wikipedia.org/wiki/List_of_mass_shootings_in_the_United_States_in_${year}`}
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

const padding = {
  top: 20,
  right: 100,
  bottom: 20,
  left: 20,
};

const text = {
  width: 350,
};

function Incidents() {
  const data = useLoaderData<Data>();
  const svgRef = useRef<SVGSVGElement>(null);
  const { width: svgWidth } = useDimensions(svgRef);

  return (
    <section
      className="full-height"
      style={{
        backgroundColor: "var(--red-30)",
      }}
    >
      <svg
        ref={svgRef}
        width={`calc(100vw - ${padding.left + padding.right})`}
        height={`${
          padding.top + data.incidents.length * 21 + padding.bottom
        }px`}
      >
        {data.incidents.map((incident, i) => (
          <IncidentBar key={i} index={i} incident={incident} width={svgWidth} />
        ))}
      </svg>
    </section>
  );
}

function IncidentBar({
  incident,
  width,
  index,
}: {
  incident: Incident;
  width: number;
  index: number;
}) {
  const availableBarWidth = width - padding.left - padding.right - text.width;

  const availableBlockWidths = Math.floor(availableBarWidth / 20);
  const barWidth = availableBlockWidths * 20;

  const injuredBarProps = useSpring({
    width: incident.injuredNormalized * barWidth,
    x: padding.left + text.width,
  });

  const deadBarProps = useSpring({
    width: incident.deadNormalized * barWidth,
    x: padding.left + text.width + incident.injuredNormalized * barWidth,
  });

  return (
    <g transform={`translate(${padding.left}, ${padding.top + index * 21})`}>
      <animated.rect
        {...injuredBarProps}
        y={0}
        height={20}
        fill="var(--red-20)"
      >
        <title>{incident.injured} injured</title>
      </animated.rect>
      <animated.rect {...deadBarProps} y={0} height={20} fill="var(--red-0)">
        <title>{incident.dead} killed</title>
      </animated.rect>

      <g x={0} y={padding.top}>
        <text
          x={0}
          width={175}
          fill="var(--red-80)"
          dominant-baseline="hanging"
        >
          {incident.city}
        </text>
        <text
          x={150}
          dominant-baseline="hanging"
          fill="var(--red-10)"
          fontWeight="bold"
        >
          {incident.state}
        </text>
        <title>{incident.description}</title>
      </g>
    </g>
  );
}

function Hearts({ count }: { count: number }): JSX.Element {
  const brokenHearts = [];

  for (let i = 0; i < count; i++) {
    brokenHearts.push(
      <div className="broken-heart" key={i}>
        💔
      </div>
    );
  }

  return <div className="broken-hearts">{brokenHearts}</div>;
}

type Incident = Data["incidents"][number];
