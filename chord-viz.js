import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

function groupTicks(d, step) {
    const k = (d.endAngle - d.startAngle) / d.value;
    return d3.range(0, d.value, step).map(value => {
      return {value: value, angle: value * k + d.startAngle};
    });
  }
  
data = Object.assign(
  [
    [115, 315, 369, 8, 0, 147, 1, 0, 1, 0, 2, 47, 0, 1],
    [106, 13682, 0, 27, 2, 703, 0, 15, 5, 10, 7, 0, 0, 4],
    [145, 1751, 21887, 46, 0, 0, 0, 0, 6, 0, 0, 0, 0, 0],
    [0, 0, 73, 513, 0, 27, 0, 0, 0, 0, 0, 20, 1, 0],
    [0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 2, 1, 0],
    [0, 485, 0, 34, 4, 7651, 0, 21, 2, 0, 3, 141, 0, 4],
    [0, 0, 0, 0, 0, 0, 12, 0, 0, 0, 0, 2, 0, 0],
    [2, 0, 31, 0, 0, 30, 1, 0, 0, 0, 4, 15, 0, 0],
    [0, 0, 0, 0, 0, 2, 0, 1, 139, 0, 0, 0, 0, 0],
    [0, 6, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 2, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 0, 0],
    [0, 239, 507, 9, 0, 119, 0, 0, 0, 2, 1, 2526, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 144, 0],
  ],
  {
    names: [
      "ADA",
      "C",
      "CPP",
      "CSHARP",
      "HASK",
      "JAVA",
      "LISP",
      "OTHER",
      "PASCAL",
      "PERL",
      "PHP",
      "PYTHON",
      "RUBY",
      "TCL",
    ],
    colors: [
      "#827717",
      "#689F38",
      "#AFB42B",
      "#FBC02D",
      "#FFA000",
      "#F57C00",
      "#E64A19",
      "#5D4037",
      "#616161",
      "#455A64",
      "#263238",
      "#0D47A1",
      "#B71C1C",
      "#1B5E20",
    ],
  }
);

const width = 640;
const height = width;
const outerRadius = Math.min(width, height) * 0.5 - 30;
const innerRadius = outerRadius - 20;
const { names, colors } = data;
const sum = d3.sum(data.flat());
const tickStep = d3.tickStep(0, sum, 100);
const tickStepMajor = d3.tickStep(0, sum, 20);
const formatValue = d3.formatPrefix(",.0", tickStep);

const chord = d3
  .chord()
  .padAngle(20 / innerRadius)
  .sortSubgroups(d3.descending);

const arc = d3.arc().innerRadius(innerRadius).outerRadius(outerRadius);

const ribbon = d3.ribbon().radius(innerRadius);

const svg = d3
  .create("svg")
  .attr("width", width)
  .attr("height", height)
  .attr("viewBox", [-width / 2, -height / 2, width, height])
  .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;");

const chords = chord(data);

const group = svg.append("g").selectAll().data(chords.groups).join("g");

group
  .append("path")
  .attr("fill", (d) => colors[d.index])
  .attr("d", arc)
  .append("title")
  .text((d) => `${d.value.toLocaleString("en-US")} ${names[d.index]}`);

const groupTick = group
  .append("g")
  .selectAll()
  .data((d) => groupTicks(d, tickStep))
  .join("g")
  .attr(
    "transform",
    (d) =>
      `rotate(${(d.angle * 180) / Math.PI - 90}) translate(${outerRadius},0)`
  );

groupTick.append("line").attr("stroke", "currentColor").attr("x2", 6);

groupTick
  .filter((d) => d.value % tickStepMajor === 0)
  .append("text")
  .attr("x", 8)
  .attr("dy", ".35em")
  .attr("transform", (d) =>
    d.angle > Math.PI ? "rotate(180) translate(-16)" : null
  )
  .attr("text-anchor", (d) => (d.angle > Math.PI ? "end" : null))
  .text((d) => formatValue(d.value));

svg
  .append("g")
  .attr("fill-opacity", 0.7)
  .selectAll()
  .data(chords)
  .join("path")
  .attr("d", ribbon)
  .attr("fill", (d) => colors[d.target.index])
  .attr("stroke", "white")
  .append("title")
  .text(
    (d) =>
      `${d.source.value.toLocaleString("en-US")} ${names[d.source.index]} → ${
        names[d.target.index]
      }${
        d.source.index !== d.target.index
          ? `\n${d.target.value.toLocaleString("en-US")} ${
              names[d.target.index]
            } → ${names[d.source.index]}`
          : ``
      }`
  );

container.append(svg.node());
