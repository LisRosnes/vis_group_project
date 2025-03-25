const CSV_FILE_PATH = "assets/data/merged_output.csv";
let keyframes = [
 {
   activeVerse: 1,
   activeLines: [1, 2, 3, 4, 5]
 },
 {
   activeVerse: 2,
   activeLines: [1, 2, 3],
   svgUpdate: stateDeathVis,
 },
 {
   activeVerse: 2,
   activeLines: [4],
   svgUpdate: incomeDeathVis,
 },
 {
   activeVerse: 2,
   activeLines: [5],
   svgUpdate: raceDeathVis,
 },
 {
   activeVerse: 3,
   activeLines: [1, 2, 3],
   svgUpdate: obesityDeathVis,
 },
 {
   activeVerse: 3,
   activeLines: [4, 5],
   svgUpdate: raceDeathVis,
 },
 {
   activeVerse: 4,
   activeLines: [1, 2, 3, 4, 5, 6],
   svgUpdate: raceDeathVis,
 },
 {
  activeVerse: 5,
  activeLines: [],
  svgUpdate: guessTheRateVis,
},
 {
   activeVerse: 6,
   activeLines: [1, 2, 3, 4, 5],
 },
];


// Set width, height, and padding for the plot
const w = 1600;
const h = 700;
const padding = 80;


let svg = d3.select("#svg");
let keyframeIndex = 0;

function initialiseSVG() {
 svg
   .attr("width", w)
   .attr("height", h)
   .attr("viewBox", "0 0 " + w + " " + h);


 svg.selectAll("*").remove();


 const margin = { top: 20, right: 20, bottom: 30, left: 40 };
 let chartWidth = w - margin.left - margin.right;
 let chartHeight = h - margin.top - margin.bottom;


 let chart = svg
   .append("g")
   .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


 let xScale = d3
   .scaleBand()
   //  .domain(data.map(d => d.state))
   .range([0, chartWidth])
   .padding(0.1);
}


async function loadData() {
  try {
    const data = await d3.csv(CSV_FILE_PATH);
    if (!data || data.length === 0) {
      throw new Error("Failed to load dataset or empty data.");
    }
    data.forEach((d) => {
      d.infant_mortality = +d.infant_mortality;
      d["Black including Hispanic"] = +d["Black including Hispanic"];
      d["White including Hispanic"] = +d["White including Hispanic"];
      d["Hispanic All Races"] = +d["Hispanic All Races"];
      d["All Non-White Races including Hispanic"] =
        +d["All Non-White Races including Hispanic"];
      d["Asian/Pacific Islander including Hispanic"] =
        +d["Asian/Pacific Islander including Hispanic"];
      d["American Indian/Alaskan Native including Hispanic"] =
        +d["American Indian/Alaskan Native including Hispanic"];
      d.median_income = +d.median_income;
      d.obesity = +d.obesity;
    });
    console.log("Loaded Data:", data);
    infantMortalityData = data;  // Store data in global variable
    return data;
  } catch (error) {
    console.error("Error loading data:", error);
    throw error;
  }
 }


function stateDeathVis() {
  d3.csv(CSV_FILE_PATH).then(function (data) {
    data.forEach((d) => {
      d.infant_mortality = +d.infant_mortality;
    });
 
    const stateData = Array.from(
      d3.rollup(
        data,
        (v) => d3.mean(v, (d) => d.infant_mortality),
        (d) => d.State
      ),
      ([state, avg_infant_mortality]) => ({ state, avg_infant_mortality })
    );
 
    initialiseSVG();
 
    const margin = { top: 80, right: 80, bottom: 60, left: 80 };
    const width = w - margin.left - margin.right;
    const height = h - margin.top - margin.bottom;
 
    const chartArea = svg
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);
 
    const xScale = d3
      .scaleBand()
      .domain(stateData.map((d) => d.state))
      .range([0, width])
      .padding(0.1);
 
    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(stateData, (d) => d.avg_infant_mortality)])
      .range([height, 0]);
 
    // Bars
    chartArea
      .selectAll(".bar")
      .data(stateData)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => xScale(d.state))
      .attr("y", (d) => yScale(d.avg_infant_mortality))
      .attr("width", xScale.bandwidth())
      .attr("height", (d) => height - yScale(d.avg_infant_mortality))
      .attr("fill", "steelblue");
 
    // X-axis
    const xAxis = chartArea
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .attr("dx", "-0.8em")
      .attr("dy", "0.15em")
      .style("text-anchor", "end")
      .style("font-size", "20px");
 
    // Y-axis
    const yAxis = chartArea.append("g").call(d3.axisLeft(yScale));
    yAxis.selectAll("text").style("font-size", "20px");
 
    // X-axis label
    chartArea
      .append("text")
      .attr("class", "x-axis-label")
      .attr("text-anchor", "middle")
      .attr("x", width / 2)
      .attr("y", height + 150)
      .attr("font-size", "25px")
      .text("State");
 
    // Y-axis label
    chartArea
      .append("text")
      .attr("class", "y-axis-label")
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .attr("y", -50)
      .attr("x", -height / 2)
      .attr("font-size", "25px")
      .text("Infant Mortality Rate (per 1,000 live births)");
 
    // Title
    svg
      .append("text")
      .attr("class", "title")
      .attr("text-anchor", "middle")
      .attr("x", w / 2)
      .attr("y", -100)
      .attr("font-size", "30px")
      .attr("font-weight", "bold")
      .text("Average Infant Mortality by US State");
  });
 }
 
 function incomeDeathVis() {
  d3.csv(CSV_FILE_PATH).then(function (data) {
    // Convert infant_mortality to numbers
    data.forEach((d) => {
      d.median_income = +d.median_income;
      d.infant_mortality = +d.infant_mortality;
    });
 
    initialiseSVG();
 
    const margin = { top: 80, right: 80, bottom: 60, left: 80 };
    const width = w - margin.left - margin.right;
    const height = h - margin.top - margin.bottom;
 
    const chartArea = svg
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);
 
    // Define xScale based on median income
    let xScale = d3
      .scaleLinear()
      .domain(d3.extent(data, (d) => d.median_income))
      .range([0, width]);
 
    // Define yScale based on infant mortality
    let yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.infant_mortality)])
      .range([height, 0]);
 
    // Append circles for each data point to create scatter plot
    chartArea
      .selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", (d) => xScale(d.median_income))
      .attr("cy", (d) => yScale(d.infant_mortality))
      .attr("r", 5)
      .attr("fill", "steelblue")
      .attr("fill-opacity", 0.3);
 
    // X-axis
    const xAxis = chartArea
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale));
    xAxis.selectAll("text").style("font-size", "25px");
 
    // Y-axis
    const yAxis = chartArea.append("g").call(d3.axisLeft(yScale));
    yAxis.selectAll("text").style("font-size", "25px");
 
    // X-axis label
    chartArea
      .append("text")
      .attr("class", "x-axis-label")
      .attr("text-anchor", "middle")
      .attr("x", width / 2)
      .attr("y", height + 70)
      .attr("font-size", "25px")
      .text("Median Income ($)");
 
    // Y-axis label
    chartArea
      .append("text")
      .attr("class", "y-axis-label")
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .attr("y", -50)
      .attr("x", -height / 2)
      .attr("font-size", "25px")
      .text("Infant Mortality Rate (per 1,000 live births)");
 
    // Title
    svg
      .append("text")
      .attr("class", "title")
      .attr("text-anchor", "middle")
      .attr("x", w / 2)
      .attr("y", -100)
      .attr("font-size", "30px")
      .attr("font-weight", "bold")
      .text("Infant Mortality by US Counties' Median Income");
  });
 }
 function guessTheRateVis() {
  // Clear the SVG
  initialiseSVG();

  // Set up dimensions
  const margin = { top: 80, right: 80, bottom: 60, left: 80 };
  const width = w - margin.left - margin.right;
  const height = h - margin.top - margin.bottom;

  // Create a group for the content
  const container = svg
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // Add top text
  container
    .append("text")
    .attr("class", "title")
    .attr("text-anchor", "middle")
    .attr("x", width / 2)
    .attr("y", 0)
    .attr("font-size", "30px")
    .attr("font-weight", "bold")
    .text("Guess the Rate [Static Visualization]");

  // Add middle section with icon
  const iconWidth = 100;
  const iconHeight = 200;
  const iconX = width / 2 - iconWidth / 2;
  const iconY = height / 2 - iconHeight / 2 - 50;

  // Create person icon
  const personIcon = container
    .append("g")
    .attr("transform", `translate(${iconX}, ${iconY})`);

  // Head
  personIcon
    .append("circle")
    .attr("cx", 50)
    .attr("cy", 40)
    .attr("r", 30)
    .attr("fill", "#3498db");

  // Body
  personIcon
    .append("rect")
    .attr("x", 35)
    .attr("y", 70)
    .attr("width", 30)
    .attr("height", 40)
    .attr("rx", 5)
    .attr("fill", "#3498db");

  // Arms
  personIcon
    .append("rect")
    .attr("x", 10)
    .attr("y", 80)
    .attr("width", 25)
    .attr("height", 15)
    .attr("rx", 5)
    .attr("fill", "#3498db");

  personIcon
    .append("rect")
    .attr("x", 65)
    .attr("y", 80)
    .attr("width", 25)
    .attr("height", 15)
    .attr("rx", 5)
    .attr("fill", "#3498db");

  // Legs
var legLength = 35;
  personIcon
    .append("rect")
    .attr("x", 35)
    .attr("y", 110)
    .attr("width", 12)
    .attr("height", legLength)
    .attr("rx", 5)
    .attr("fill", "#3498db");

  personIcon
    .append("rect")
    .attr("x", 53)
    .attr("y", 110)
    .attr("width", 12)
    .attr("height", legLength)
    .attr("rx", 5)
    .attr("fill", "#3498db");

  // Add pointer text
  container
    .append("text")
    .attr("class", "pointer-text")
    .attr("text-anchor", "middle")
    .attr("x", width / 2)
    .attr("y", iconY + iconHeight + 20)
    .attr("font-size", "24px")
    .text("⬆️");

  container
    .append("text")
    .attr("class", "pointer-text")
    .attr("text-anchor", "middle")
    .attr("x", width / 2)
    .attr("y", iconY + iconHeight + 50)
    .attr("font-size", "20px")
    .text("Each icon represents 1 death out of 1,000 infants.");

  // Add bottom text
  container
    .append("text")
    .attr("class", "bottom-text")
    .attr("text-anchor", "middle")
    .attr("x", width / 2)
    .attr("y", height - 30)
    .attr("font-size", "20px")
    .text("To progress, click the next button →");
}

function obesityDeathVis() {
  d3.csv(CSV_FILE_PATH).then(function (data) {
    // Process data
    data.forEach((d) => {
      d.infant_mortality = +d.infant_mortality;
      d.obesity = +d.obesity;
    });

    // Filter out rows with missing data
    data = data.filter(
      (d) => !isNaN(d.infant_mortality) && !isNaN(d.obesity)
    );

    // Create obesity percentiles
    const numIntervals = 10; // Change this value to divide into different numbers of intervals (e.g., 5, 10, 20)
    //I found any more than 10 creates a graph that is less consistent
    const rangeLabels = Array.from({ length: numIntervals }, (_, i) => {
      const start = (i * 100) / numIntervals;
      const end = ((i + 1) * 100) / numIntervals;
      return `${start.toFixed(0)}-${end.toFixed(0)}%`;
    });

    const obesityPercentiles = d3
      .scaleQuantile()
      .domain(data.map((d) => d.obesity))
      .range(rangeLabels);

    // Group data by obesity percentile and calculate average infant mortality
    const groupedData = Array.from(
      d3.group(data, (d) => obesityPercentiles(d.obesity)),
      ([percentile, values]) => ({
        percentile,
        avgInfantMortality: d3.mean(values, (d) => d.infant_mortality),
      })
    ).sort((a, b) => a.percentile.localeCompare(b.percentile));

    initialiseSVG();

    // Create scales
    const xScale = d3
      .scaleBand()
      .domain(groupedData.map((d) => d.percentile))
      .range([padding, w - padding])
      .padding(0.1);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(groupedData, (d) => d.avgInfantMortality) * 1.1])
      .range([h - padding, padding]);

    // Create color scale
    const colorScale = d3
      .scaleLinear()
      .domain([0, groupedData.length - 1])
      .range(["#add8e6", "#00008b"]); // Light blue to dark blue

    // Create bars
    svg
      .selectAll(".bar")
      .data(groupedData)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => xScale(d.percentile))
      .attr("y", (d) => yScale(d.avgInfantMortality))
      .attr("width", xScale.bandwidth())
      .attr("height", (d) => h - padding - yScale(d.avgInfantMortality))
      .attr("fill", (d, i) => colorScale(i));

    // Add axes
    const xAxis = d3.axisBottom(xScale);
    svg
      .append("g")
      .attr("transform", `translate(0,${h - padding})`)
      .call(xAxis)
      .selectAll("text")
      .style("font-size", "14px");

    const yAxis = d3.axisLeft(yScale);
    svg
      .append("g")
      .attr("transform", `translate(${padding},0)`)
      .call(yAxis)
      .selectAll("text")
      .style("font-size", "14px");

    // Add title and axis labels
    svg
      .append("text")
      .attr("class", "title")
      .attr("x", w / 2)
      .attr("y", padding - 40)
      .style("text-anchor", "middle")
      .attr("font-size", "30px")
      .text("Infant Mortality by Relative Obesity Percentile");

    svg
      .append("text")
      .attr("class", "x-axis-label")
      .attr("x", w / 2)
      .attr("y", h - 10 + 30)
      .attr("text-anchor", "middle")
      .attr("font-size", "20px")
      .text("Relative National Obesity Percentile");

    svg
      .append("text")
      .attr("class", "y-axis-label")
      .attr("x", -h / 2)
      .attr("y", padding - 50)
      .attr("transform", "rotate(-90)")
      .attr("text-anchor", "middle")
      .attr("font-size", "20px")
      .text("Average Infant Mortality Rate (per 1,000 live births)");
  });
}

function raceDeathVis() {
 // Determine which demographic to use as default based on current keyframe
 let defaultDemographic;
  // Check which keyframe is currently active
 if (keyframes[keyframeIndex].activeVerse === 2 && keyframes[keyframeIndex].activeLines.includes(5)) {
   defaultDemographic = "Black including Hispanic";
 } else if (keyframes[keyframeIndex].activeVerse === 3 && keyframes[keyframeIndex].activeLines.includes(4) && keyframes[keyframeIndex].activeLines.includes(5)) {
   defaultDemographic = "All Non-White Races including Hispanic";
 } else {
   defaultDemographic = "White including Hispanic";
 }


 d3.csv(CSV_FILE_PATH)
   .then(function (data) {
     // Parse numeric values
     data.forEach((d) => {
       d.infant_mortality = +d.infant_mortality;
       d["Black including Hispanic"] = +d["Black including Hispanic"];
       d["White including Hispanic"] = +d["White including Hispanic"];
       d["Hispanic All Races"] = +d["Hispanic All Races"];
       d["All Non-White Races including Hispanic"] =
         +d["All Non-White Races including Hispanic"];
       d["Asian/Pacific Islander including Hispanic"] =
         +d["Asian/Pacific Islander including Hispanic"];
       d["American Indian/Alaskan Native including Hispanic"] =
         +d["American Indian/Alaskan Native including Hispanic"];
       d.median_income = +d.median_income;
       d.obesity = +d.obesity;
     });


     initialiseSVG();


     // Set default demographic based on keyframe
     let selectedDemographic = defaultDemographic;


     // Set up dimensions based on your existing SVG settings
     const margin = { top: 80, right: 200, bottom: 60, left: 80 };
     const width = w - margin.left - margin.right;
     const height = h - margin.top - margin.bottom;


     // Create a group for the main chart area
     const chartArea = svg
       .append("g")
       .attr("transform", `translate(${margin.left}, ${margin.top})`);


     const x = d3.scaleLinear().domain([0, 100]).range([0, width]).nice();


     const y = d3
       .scaleLinear()
       .domain([0, d3.max(data, (d) => d.infant_mortality) * 1.1])
       .range([height, 0])
       .nice();


     // Color scale by state
     const states = Array.from(new Set(data.map((d) => d.State)));
     const color = d3.scaleOrdinal().domain(states).range(d3.schemeCategory10);


     // Create axes
     const xAxis = chartArea
       .append("g")
       .attr("transform", `translate(0,${height})`)
       .call(d3.axisBottom(x));


     const yAxis = chartArea.append("g").call(d3.axisLeft(y));

      xAxis.selectAll("text").style("font-size", "20px");
      yAxis.selectAll("text").style("font-size", "20px");
     //Axis
     chartArea
       .append("text")
       .attr("class", "x-axis-label")
       .attr("text-anchor", "middle")
       .attr("x", width / 2)
       .attr("y", height + 40)
       .attr("font-size", "20px")
       .text(`${selectedDemographic} (%)`);
     //Text
     chartArea
       .append("text")
       .attr("class", "y-axis-label")
       .attr("text-anchor", "middle")
       .attr("transform", "rotate(-90)")
       .attr("y", -50)
       .attr("x", -height / 2)
       .attr("font-size", "20px")
       .text("Infant Mortality Rate (per 1,000 live births)");


     // Add title above the chart
     svg
       .append("text")
       .attr("class", "title")
       .attr("text-anchor", "middle")
       .attr("x", w / 2)
       .attr("y", -100)
       .attr("font-size", "30px")
       .attr("font-weight", "bold")
       .text(`Infant Mortality Rates by County:  ${selectedDemographic} Population %`);


     // Create tooltip
     let tooltip = d3.select("body").select(".tooltip");
     if (tooltip.empty()) {
       tooltip = d3
         .select("body")
         .append("div")
         .attr("class", "tooltip")
         .style("position", "absolute")
         .style("background", "rgba(255, 255, 255, 0.9)")
         .style("padding", "10px")
         .style("border", "1px solid #ddd")
         .style("border-radius", "4px")
         .style("pointer-events", "none")
         .style("opacity", 0)
         .style("z-index", "100"); // Ensure tooltip is on top
     }


     // Plot dots
     const dots = chartArea
       .selectAll(".dot")
       .data(data)
       .enter()
       .append("circle")
       .attr("class", "dot")
       .attr("cx", (d) => x(d[selectedDemographic]))
       .attr("cy", (d) => y(d.infant_mortality))
       .attr("r", 5)
       .style("fill", (d) => color(d.State))
       .style("opacity", 0.7)
       .on("mouseover", function (event, d) {
         // Format the demographic percentage value
         const demographicValue = d[selectedDemographic]
           ? d[selectedDemographic].toFixed(1) + "%"
           : "N/A";


         // Format the infant mortality rate
         const mortalityValue = d.infant_mortality
           ? d.infant_mortality.toFixed(2)
           : "N/A";


         // Format median income with commas
         const incomeValue = d.median_income
           ? "$" + d.median_income.toLocaleString()
           : "N/A";


         // Format obesity percentage
         const obesityValue = d.obesity ? d.obesity.toFixed(1) + "%" : "N/A";


         // Show the tooltip with enhanced formatting
         tooltip.transition().duration(200).style("opacity", 0.9);


         tooltip
           .html(
             `
                   <div style="font-weight: bold; margin-bottom: 5px;">${d.County}, ${d.State}</div>
                   <div>
                       <span style="font-weight: bold;">Infant Mortality:</span>
                       <span>${mortalityValue}</span>
                   </div>
                   <div>
                       <span style="font-weight: bold;">${selectedDemographic}:</span>
                       <span>${demographicValue}</span>
                   </div>
                   <div>
                       <span style="font-weight: bold;">Median Income:</span>
                       <span>${incomeValue}</span>
                   </div>
                   <div>
                       <span style="font-weight: bold;">Obesity Rate:</span>
                       <span>${obesityValue}</span>
                   </div>
               `
           )
           .style("left", event.pageX + 15 + "px")
           .style("top", event.pageY - 28 + "px");


         d3.select(this)
           .transition()
           .duration(200)
           .attr("r", 8)
           .style("stroke", "#000")
           .style("stroke-width", 2)
           .style("opacity", 1);
       })
       .on("mouseout", function () {
         // Hide the tooltip
         tooltip.transition().duration(500).style("opacity", 0);


         d3.select(this)
           .transition()
           .duration(200)
           .attr("r", 5)
           .style("stroke", "none")
           .style("opacity", 0.7);
       });


     // Legend
     const legendX = margin.left + width + 5;
     const legendY = margin.top;


     const legend = svg
       .append("g")
       .attr("class", "legend")
       .attr("transform", `translate(${legendX}, ${legendY})`);


     // Show only first 15 states to avoid cutoff
     const legendStates = states.slice(0, 15);
     if (states.length > 15) {
       legendStates.push("Other States");
     }


     legendStates.forEach((state, i) => {
       const legendRow = legend
         .append("g")
         .attr("transform", `translate(0, ${i * 20})`);


       legendRow
         .append("rect")
         .attr("width", 10)
         .attr("height", 10)
         .attr("fill", color(state));


       legendRow
         .append("text")
         .attr("x", 15)
         .attr("y", 9)
         .attr("text-anchor", "start")
         .style("text-transform", "capitalize")
         .style("font-size", "20px")
         .text(state);
     });


     // Add demographic selector inside the SVG
     const demographics = [
       "All Non-White Races including Hispanic",
       "Black including Hispanic",
       "White including Hispanic",
       "Hispanic All Races",
       "Asian/Pacific Islander including Hispanic",
       "American Indian/Alaskan Native including Hispanic",
     ];


     // Create a dropdown container inside the SVG
     const dropdownG = svg
       .append("g")
       .attr("class", "dropdown-container")
       .attr("transform", `translate(${margin.left}, ${margin.top + 700})`);


     // Add label 
     dropdownG
       .append("text")
       .attr("x", 0)
       .attr("y", 0)
       .attr("dominant-baseline", "middle")
       .attr("font-size", "22px")
       .text("Select Demographic: ");


     // Create HTML dropdown
     const fo = dropdownG
       .append("foreignObject")
       .attr("x", 200)
       .attr("y", -15)
       .attr("width", 350)
       .attr("height", 40);


     const select = fo
       .append("xhtml:select")
       .attr("id", "demographic-select")
       .style("font-size", "16px") 
       .style("padding", "2px")
       .style("width", "100%")
       .on("change", function () {
         selectedDemographic = this.value;
         updateChart(selectedDemographic);
       });


     // Add options to dropdown
     demographics.forEach((demographic) => {
       select
         .append("xhtml:option")
         .attr("value", demographic)
         .property("selected", demographic === selectedDemographic)
         .text(demographic);
     });


     // Function to update chart based on selected demographic
     function updateChart(demographic) {
       // Keep X scale fixed from 0-100%
       x.domain([0, 100]).nice();
       xAxis.transition().duration(1000).call(d3.axisBottom(x));


       // Update dots
       dots
         .transition()
         .duration(1000)
         .attr("cx", (d) => x(d[demographic]));


       // Update axis label
       chartArea.select(".x-axis-label").text(`${demographic} (%)`);


       // Update title
       svg
         .select(".title")
         .text(`Infant Mortality Rates by County: ${demographic} Population %`);
     }
   })
   .catch((error) => {
     console.error("Error loading or processing data:", error);
   });
}

// Update visualization based on the current keyframe
function updateVisualization() {
 let keyframe = keyframes[keyframeIndex];


 // Highlight the active verse and its active lines
 // Remove any existing active highlighting from all verses/lines first
 document
   .querySelectorAll(".verse")
   .forEach((verse) => verse.classList.remove("active-verse"));
 document
   .querySelectorAll(".line")
   .forEach((line) => line.classList.remove("active-line"));


 // Mark the active verse (assuming each verse has an id like "verse1", "verse2", etc.)
 let verseEl = document.getElementById("verse" + keyframe.activeVerse);
 if (verseEl) {
   verseEl.classList.add("active-verse");
   // For each active line number, add a class to highlight it.
   keyframe.activeLines.forEach((num) => {
     // Here we assume the line id is "line" followed by the line number.
     // If lines are unique across verses, you may need to adjust this.
     let lineEl = verseEl.querySelector("#line" + num);
     if (lineEl) lineEl.classList.add("active-line");
   });
 }


 // Update the SVG if the current keyframe has an svgUpdate function
 if (keyframe.svgUpdate && typeof keyframe.svgUpdate === "function") {
   keyframe.svgUpdate();
 } else {
   // If no specific visualization function is provided, you might choose to clear or reset the SVG.
   initialiseSVG();
 }
}


// Event listeners for arrow buttons to navigate keyframes
document.getElementById("forward-button").addEventListener("click", () => {
 if (keyframeIndex < keyframes.length - 1) {
   keyframeIndex++;
   updateVisualization();
 }
});


document.getElementById("backward-button").addEventListener("click", () => {
 if (keyframeIndex > 0) {
   keyframeIndex--;
   updateVisualization();
 }
});


// Initialize the SVG and visualization on page load
initialiseSVG();
updateVisualization();
