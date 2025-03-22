let keyframes = [
    {
        activeVerse: 1,
        activeLines: [1, 2, 3, 4, 5],
    },
    {
        activeVerse: 2,
        activeLines: [1, 2, 3],
        svgUpdate: stateDeathVis
    },
    {
        activeVerse: 2,
        activeLines: [4],
        svgUpdate: incomeDeathVis
    },
    {
        activeVerse: 2,
        activeLines: [5],
        svgUpdate: raceDeathVis
    },  
    {
        activeVerse: 3,
        activeLines: [1, 2, 3],
        svgUpdate: obesityDeathVis
    },
    {
        activeVerse: 3,
        activeLines: [4, 5],
        svgUpdate: raceDeathVis
    },
    {
        activeVerse: 4,
        activeLines: [1, 2, 3, 4, 5, 6],
        svgUpdate: raceDeathVis
    },
    {
        activeVerse: 6,
        activeLines: [1, 2, 3, 4, 5]
    }
]

// Set width, height, and padding for the plot
const w = 1600;
const h = 500;
const padding = 80;

let svg = d3.select("#svg");
let keyframeIndex = 0;

function initialiseSVG(){
    svg.attr("width", w)
       .attr("height", h)
       .attr("viewBox", "0 0 " + w + " " + h);

    svg.selectAll("*").remove();

    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    let chartWidth = w - margin.left - margin.right;
    let chartHeight = h - margin.top - margin.bottom;

    let chart = svg.append("g")
                   .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    let xScale = d3.scaleBand()
                    //  .domain(data.map(d => d.state))
                     .range([0, chartWidth])
                     .padding(0.1);
}

// // TODO write an asynchronous loadData function
// async function loadData(){
//   await d3.json("../../merged_output.json").then(data => {
//       roseChartData = data;
//   }
//   )
//   await d3.json("../../assets/data/violet_colours.json").then(data => {
//       violetChartData = data;
//   }
//   )
// }


function stateDeathVis() {   
  d3.csv('../merged_output.csv')
    .then(function(data) {
      // console.table(data.map(d => d.State));
      data.forEach(d => {
        d.infant_mortality = +d.infant_mortality;
      });
    
      const stateData = Array.from(
        d3.rollup(data,
          v => d3.mean(v, d => d.infant_mortality),
          d => d.State
        ),
        ([state, avg_infant_mortality]) => ({ state, avg_infant_mortality })
      )
      console.table(stateData);
    
    // the above transorms state data into something that looks like this 
    // [
    //   { state: "Alabama", avgInfantMortality: 7.87 },
    //   { state: "Alaska", avgInfantMortality: 6.50 },
    //   // ... one object per state
    // ]
      
    initialiseSVG();

    const xScale = d3.scaleBand()
                      .domain(stateData.map(d => d.state))
                      .range([padding, w - padding])
                      .padding(0.1);
    const yScale = d3.scaleLinear()
                      .domain([0, d3.max(stateData, d => d.avg_infant_mortality)])
                      .range([h - padding, padding]);
    svg.selectAll(".bar")
        .data(stateData)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => xScale(d.state))
        .attr("y", d => yScale(d.avg_infant_mortality))
        .attr("width", xScale.bandwidth())
        .attr("height", d => h - padding - yScale(d.avg_infant_mortality))
        .attr("fill", "steelblue");
        // .attr("fill-opacity", 0.3);

        const xAxis = d3.axisBottom(xScale);
        svg.append("g")
            .attr("transform", "translate(0," + (h - padding) + ")")
            .call(xAxis)
            .selectAll("text")
            .attr("transform", "rotate(-45)")
            .attr("dx", "-0.8em")
            .attr("dy", "0.15em")
            .style("text-anchor", "end")
            .style("font-size", "14px");

        const yAxis = d3.axisLeft(yScale);
        svg.append("g")
            .call(yAxis)
            .selectAll("text")
            .style("font-size", "14px");
            svg.append("text")
            .attr("class", "x-axis-label")
            .attr("x", w / 2)
            .attr("y", h - 10 + 30)
            .attr("text-anchor", "middle")
            .attr("font-size", "20px")
            .text("State");
  
        // Add the y-axis label (rotated so it reads vertically)
        svg.append("text")
            .attr("class", "y-axis-label")
            .attr("x", -h / 2)
            .attr("y", padding - 50)
            .attr("transform", "rotate(-90)")
            .attr("text-anchor", "middle")
            .attr("font-size", "20px")
            .text("Average Infant Mortality Rate (per 1,000 live births)");
        
        svg.append("text")
            .attr("class", "title")
            .attr("x", w / 2 )
            .attr("y", padding -40)
            .style("text-anchor", "middle")
            .attr("font-size", "30px")
            .text("Average Infant Mortality by US State");
    })                    

  }
  
function incomeDeathVis() {
    d3.csv('../merged_output.csv')
    .then(function(data) {
        // Convert infant_mortality to numbers
        data.forEach(d => {
            d.median_income = +d.median_income;
            d.infant_mortality = +d.infant_mortality;
        });

        initialiseSVG();
        
        // Define xScale based on median income
        let xScale = d3.scaleLinear()
                       .domain(d3.extent(data, d => d.median_income))
                       .range([padding, w - padding]);

        // Define yScale based on infant mortality
        let yScale = d3.scaleLinear()
                       .domain([0, d3.max(data, d => d.infant_mortality)])
                       .range([h - padding, padding]);

        // Append circles for each data point to create scatter plot
        svg.selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", (d, i) => xScale(d.median_income))
            .attr("cy", d => yScale(d.infant_mortality))
            .attr("r", 5)
            .attr("fill", "steelblue")
            .attr("fill-opacity", 0.3);

        // Define and append the x-axis
        let xAxis = d3.axisBottom(xScale);
        svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", "translate(0," + (h - padding) + ")")
            .call(xAxis);
          
        svg.append("text")
           .attr("class", "title")
            .attr("x", w / 2 )
            .attr("y", padding -40)
            .style("text-anchor", "middle")
            .attr("font-size", "40px")
            .text("Infant Mortality by US countys' median income");


        // Define and append the y-axis
        let yAxis = d3.axisLeft(yScale);
        svg.append("g")
            .attr("class", "y-axis")
            .attr("transform", "translate(" + padding + ",0)")
            .call(yAxis);

        // Add axis labels
        svg.append("text")
            .attr("class", "x-axis-label")
            .attr("x", w / 2 )
            .attr("y", h - 10 + 30)
            .style("text-anchor", "middle")
            .attr("font-size", "30px")
            .text("Median Income ($)");

        svg.append("text")
           .attr("class", "y-axis-label")
           .attr("x", -h / 2)
           .attr("y", padding -50)
           .attr("transform", "rotate(-90)")  
           .attr("text-anchor", "middle")
           .attr("font-size", "30px")
           .text("Infant Mortality Rate (per 1,000 live births)");

           // Adjust x-axis tick labels
        svg.selectAll(".x-axis text")
        .style("font-size", "20px");

        // Adjust y-axis tick labels
        svg.selectAll(".y-axis text")
        .style("font-size", "20px");
    });
  }
  
  function raceDeathVis() {
    
    initialiseSVG();
  }
  
  function obesityDeathVis() {
    initialiseSVG();
    console.log("Rendering obesityDeathVis");
  }


  
  // Update visualization based on the current keyframe
function updateVisualization() {
    let keyframe = keyframes[keyframeIndex];
  
    // Highlight the active verse and its active lines
    // Remove any existing active highlighting from all verses/lines first
    document.querySelectorAll(".verse").forEach(verse => verse.classList.remove("active-verse"));
    document.querySelectorAll(".line").forEach(line => line.classList.remove("active-line"));
  
    // Mark the active verse (assuming each verse has an id like "verse1", "verse2", etc.)
    let verseEl = document.getElementById("verse" + keyframe.activeVerse);
    if (verseEl) {
      verseEl.classList.add("active-verse");
      // For each active line number, add a class to highlight it.
      keyframe.activeLines.forEach(num => {
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