function getY(max, height, diff, value) {
  return parseFloat((height - (value * height / max) + diff).toFixed(2));
}

function removeChildren(svg) {
  [...svg.querySelectorAll("*")].forEach(element => svg.removeChild(element));
}

function defaultFetch(entry) {
  return entry.value;
}

function buildElement(tag, attrs) {
  const element = document.createElementNS("http://www.w3.org/2000/svg", tag);

  for (let name in attrs) {
    element.setAttribute(name, attrs[name]);
  }

  return element;
}

export function sparkline(svg, entries, options) {
  removeChildren(svg);

  if (entries.length <= 1) {
    return;
  }

  options = options || {};

  if (typeof(entries[0]) === "number") {
    entries = entries.map(entry => {
      return {value: entry};
    });
  }

  // This function will be called whenever the mouse moves
  // over the SVG. You can use it to render something like a
  // tooltip.
  const onmousemove = options.onmousemove;

  // This function will be called whenever the mouse leaves
  // the SVG area. You can use it to hide the tooltip.
  const onmouseout = options.onmouseout;

  // Should we run in interactive mode? If yes, this will handle the
  // cursor and spot position when moving the mouse.
  const interactive = ("interactive" in options) ? options.interactive : !!onmousemove;

  // normalise the values
  const normalize = ("normalize" in options) ? options.normalize : false;

  // Define how big should be the spot area.
  const spotRadius = options.spotRadius || 2;
  const spotDiameter = spotRadius * 2;

  // Define how wide should be the cursor area.
  const cursorWidth = options.cursorWidth || 2;

  // Get the stroke width; this is used to compute the
  // rendering offset.
  const strokeWidth = parseFloat(svg.attributes["stroke-width"].value);

  // By default, data must be formatted as an array of numbers or
  // an array of objects with the value key (like `[{value: 1}]`).
  // You can set a custom function to return data for a different
  // data structure.
  const fetch = options.fetch || defaultFetch;

  // Retrieve only values, easing the find for the maximum value.
  const values = entries.map(entry => fetch(entry));

  // The rendering width will account for the spot size.
  const width = parseFloat(svg.attributes.width.value) - spotDiameter * 2;

  // Get the SVG element's full height.
  // This is used
  const fullHeight = parseFloat(svg.attributes.height.value);

  // The rendering height accounts for stroke width and spot size.
  const height = fullHeight - (strokeWidth * 2) - spotDiameter;

  // The maximum value. This is used to calculate the Y coord of
  // each sparkline datapoint.
  const max = Math.max(...values);
  const min = Math.min(...values);

  // Some arbitrary value to remove the cursor and spot out of
  // the viewing canvas.
  const offscreen = -1000;

  // Cache the last item index.
  const lastItemIndex = values.length - 1;

  // Calculate the X coord base step.
  const offset = width / lastItemIndex;

  // Hold all datapoints, which is whatever we got as the entry plus
  // x/y coords and the index.
  const datapoints = [];

  let renderValues = values
  let y0 = getY(max, height, strokeWidth + spotRadius, 0 )

  if(normalize) {
    renderValues = values.map((value) => (value - min) / (max - min))
    let zeroNormalised = (0 - min) / (max - min)
    y0 = getY(1, height, strokeWidth + spotRadius, zeroNormalised )
  }


  const renderMax = normalize ? 1 : max

  // Hold the line coordinates.
  const pathY = getY(renderMax, height, strokeWidth + spotRadius, renderValues[0]);
  let pathCoords = `M${spotDiameter} ${pathY}`;

  renderValues.forEach((value, index) => {
    const x = index * offset + spotDiameter;
    const y = getY(renderMax, height, strokeWidth + spotRadius, value);

    datapoints.push(Object.assign({}, entries[index], {
      index: index,
      x: x,
      y: y
    }));

    pathCoords += ` L ${x} ${y}`;
  });

  const path = buildElement("path", {
    class: "sparkline--line",
    d: pathCoords,
    fill: "none"
  });

  let fillCoordsPos = `${pathCoords} V ${fullHeight} L ${spotDiameter} ${fullHeight} Z`;
  const fillPos = buildElement("path", {
    class: "sparkline--fill sparkline--fill-pos",
    d: fillCoordsPos,
    stroke: "none"
  });

  let fillCoordsNeg = `${pathCoords} V 0 L ${spotDiameter} 0 Z`;
  const fillNeg = buildElement("path", {
    class: "sparkline--fill sparkline--fill-neg",
    d: fillCoordsNeg,
    stroke: "none",
  });

  if(max >= 0 && min >= 0 ) { // only positive values
    svg.appendChild(fillPos);
  }
  else if(max <= 0 && min <= 0 ) { // only negative values
    svg.appendChild(fillNeg);
  } else { // ues clipping to provide positive and negative fill areas

    let defs = buildElement("defs")
    let clipPathPos = buildElement("clipPath", {
      id: "clipPathPos"
    })
    let clipPathPosPath = buildElement("path", {
      d: `M0 0 L ${width} 0 L ${width} ${y0} L 0 ${y0} Z`
    })

    clipPathPos.appendChild(clipPathPosPath);
    defs.appendChild(clipPathPos);

    fillPos.setAttribute("clip-path", "url(#clipPathPos)")

    let clipPathNeg = buildElement("clipPath", {
      id: "clipPathNeg"
    })
    let clipPathNegPath = buildElement("path", {
      d: `M0 ${y0} L ${width} ${y0} L ${width} ${fullHeight} L 0 ${fullHeight} Z`
    })

    clipPathNeg.appendChild(clipPathNegPath);
    defs.appendChild(clipPathNeg);
    svg.appendChild(defs);

    fillPos.setAttribute("clip-path", "url(#clipPathPos)")
    svg.appendChild(fillPos);

    fillNeg.setAttribute("clip-path", "url(#clipPathNeg)")
    svg.appendChild(fillNeg);
  }

  svg.appendChild(path);

  if (!interactive) {
    return;
  }

  const cursor = buildElement("line", {
    class: "sparkline--cursor",
    x1: offscreen,
    x2: offscreen,
    y1: 0,
    y2: fullHeight,
    "stroke-width": cursorWidth
  });

  const spot = buildElement("circle", {
    class: "sparkline--spot",
    cx: offscreen,
    cy: offscreen,
    r: spotRadius
  });

  svg.appendChild(cursor);
  svg.appendChild(spot);

  const interactionLayer = buildElement("rect", {
    width: svg.attributes.width.value,
    height: svg.attributes.height.value,
    style: "fill: transparent; stroke: transparent",
    class: "sparkline--interaction-layer",
  });
  svg.appendChild(interactionLayer);

  interactionLayer.addEventListener("mouseout", event => {
    cursor.setAttribute("x1", offscreen);
    cursor.setAttribute("x2", offscreen);

    spot.setAttribute("cx", offscreen);

    if (onmouseout) {
      onmouseout(event);
    }
  });

  interactionLayer.addEventListener("mousemove", event => {
    const mouseX = event.offsetX;

    let nextDataPoint = datapoints.find(entry => {
      return entry.x >= mouseX;
    });

    if (!nextDataPoint) {
      nextDataPoint = datapoints[lastItemIndex];
    }

    let previousDataPoint = datapoints[datapoints.indexOf(nextDataPoint) - 1];
    let currentDataPoint;
    let halfway;

    if (previousDataPoint) {
      halfway = previousDataPoint.x + ((nextDataPoint.x - previousDataPoint.x) / 2);
      currentDataPoint = mouseX >= halfway ? nextDataPoint : previousDataPoint;
    } else {
      currentDataPoint = nextDataPoint;
    }

    const x = currentDataPoint.x;
    const y = currentDataPoint.y;

    spot.setAttribute("cx", x);
    spot.setAttribute("cy", y);

    cursor.setAttribute("x1", x);
    cursor.setAttribute("x2", x);

    if (onmousemove) {
      onmousemove(event, currentDataPoint);
    }
  });
}

export default sparkline;
