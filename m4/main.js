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
  activeLines: [1, 2],
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


let tooltip = d3.select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("position", "absolute")
  .style("background", "rgba(255, 255, 255, 0.9)")
  .style("padding", "10px")
  .style("border", "1px solid #ddd")
  .style("border-radius", "4px")
  .style("pointer-events", "none")
  .style("opacity", 0);

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


 function stateDeathVis(sortOption = "mortality") {
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
    
    // Dictionary mapping states to their political party
    const statePoliticalParty = {
      "Alabama": "Republican",
      "Alaska": "Republican",
      "Arizona": "Democrat",
      "Arkansas": "Republican",
      "California": "Democrat",
      "Colorado": "Democrat",
      "Connecticut": "Democrat",
      "Delaware": "Democrat",
      "Florida": "Republican",
      "Georgia": "Republican",
      "Hawaii": "Democrat",
      "Idaho": "Republican",
      "Illinois": "Democrat",
      "Indiana": "Republican",
      "Iowa": "Republican",
      "Kansas": "Republican",
      "Kentucky": "Republican",
      "Louisiana": "Republican",
      "Maine": "Democrat",
      "Maryland": "Democrat",
      "Massachusetts": "Democrat",
      "Michigan": "Democrat",
      "Minnesota": "Democrat",
      "Mississippi": "Republican",
      "Missouri": "Republican",
      "Montana": "Republican",
      "Nebraska": "Republican",
      "Nevada": "Democrat",
      "New Hampshire": "Democrat",
      "New Jersey": "Democrat",
      "New Mexico": "Democrat",
      "New York": "Democrat",
      "North Carolina": "Republican",
      "North Dakota": "Republican",
      "Ohio": "Republican",
      "Oklahoma": "Republican",
      "Oregon": "Democrat",
      "Pennsylvania": "Democrat",
      "Rhode Island": "Democrat",
      "South Carolina": "Republican",
      "South Dakota": "Republican",
      "Tennessee": "Republican",
      "Texas": "Republican",
      "Utah": "Republican",
      "Vermont": "Democrat",
      "Virginia": "Democrat",
      "Washington": "Democrat",
      "West Virginia": "Republican",
      "Wisconsin": "Democrat",
      "Wyoming": "Republican"
    };
    
    if (sortOption === "mortality") {
      // Sort states from highest to lowest infant mortality rate
      stateData.sort((a, b) => b.avg_infant_mortality - a.avg_infant_mortality);
    } else if (sortOption === "party") {
      // Define fixed order for parties: Republican (red) first, Democrat (blue) second.
      const partyOrder = { "Republican": 0, "Democrat": 1 };
      stateData.sort((a, b) => {
         const partyA = statePoliticalParty[a.state] || "";
         const partyB = statePoliticalParty[b.state] || "";
         // If in the same party, sort descending by infant mortality rate.
         if (partyA === partyB) {
              return b.avg_infant_mortality - a.avg_infant_mortality;
         }
         // Otherwise, sort by our fixed party order.
         return (partyOrder[partyA] ?? 2) - (partyOrder[partyB] ?? 2);
      });
    }
    
    initialiseSVG();
 
    const margin = { top: 80, right: 20, bottom: 60, left: 80 };
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
 
    // Bars with fill color based on political party
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
      .attr("fill", (d) => {
        const party = statePoliticalParty[d.state];
        if (party === "Republican") return "red";
        else if (party === "Democrat") return "blue";
        else return "gray";
      })
      .on("mouseover", function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("filter", "url(#glow)")
          .style("stroke", "#fff")
          .style("stroke-width", "2px");
   
        tooltip.transition()
          .duration(200)
          .style("opacity", 0.9);
          
        tooltip.html(
          `<strong>${d.state}</strong><br>
          Avg Infant Mortality: ${d.avg_infant_mortality.toFixed(2)}`
        )
        .style("left", event.pageX + "px")
        .style("top", event.pageY - 28 + "px");
      })
      .on("mousemove", function(event) {
        tooltip.style("left", event.pageX + "px")
              .style("top", event.pageY - 28 + "px");
      })
      .on("mouseout", function() {
        d3.select(this)
          .transition()
          .duration(200)
          .style("stroke", "none");
          
        tooltip.transition()
          .duration(500)
          .style("opacity", 0);
      });
 
    // X-axis
    const xAxis = chartArea
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .attr("dx", "-0.8em")
      .attr("dy", "0.4em")
      .style("text-anchor", "end")
      .style("font-size", "25px");
 
    // Y-axis
    const yAxis = chartArea.append("g").call(d3.axisLeft(yScale));
    yAxis.selectAll("text").style("font-size", "25px");
 
    // X-axis label
    chartArea
      .append("text")
      .attr("class", "x-axis-label")
      .attr("text-anchor", "middle")
      .attr("x", width / 2)
      .attr("y", height + 200)
      .attr("font-size", "40px")
      .text("State");
 
    // Y-axis label
    chartArea
      .append("text")
      .attr("class", "y-axis-label")
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .attr("y", -45)
      .attr("x", -height / 2 + 50)
      .attr("font-size", "40px")
      .text("Infant Mortality Rate (per 1,000 live births)");
 
    // Title
    svg
      .append("text")
      .attr("class", "title")
      .attr("text-anchor", "middle")
      .attr("x", w / 2)
      .attr("y", -100)
      .attr("font-size", "50px")
      .attr("font-weight", "bold")
      .text("Average Infant Mortality by US State");
 
    // Add legend for party colors
    const legendData = [
      { party: "Republican", color: "red" },
      { party: "Democrat", color: "blue" }, 
      { party: "NA", color: "gray" } 
    ];
    const legend = svg.append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${w - margin.right -200}, ${margin.top})`);
 
    legend.selectAll("rect")
      .data(legendData)
      .enter()
      .append("rect")
      .attr("x", 0)
      .attr("y", (d, i) => i * 30)
      .attr("width", 20)
      .attr("height", 20)
      .attr("fill", d => d.color);
 
    legend.selectAll("text")
      .data(legendData)
      .enter()
      .append("text")
      .attr("x", 30)
      .attr("y", (d, i) => i * 30 + 15)
      .text(d => d.party)
      .style("font-size", "25px");
 
    // If sorting by party, this calculates the average for each
    if (sortOption === "party") {
      // Calculate average infant mortality per party
      const partyAvg = Array.from(
        d3.rollup(
          stateData,
          v => d3.mean(v, d => d.avg_infant_mortality),
          d => statePoliticalParty[d.state]
        ),
        ([party, avg]) => ({ party, avg })
      );
      
      partyAvg.forEach(({ party, avg }) => {
        // Get all states of this party
        const statesOfParty = stateData.filter(d => statePoliticalParty[d.state] === party);
        const xValues = statesOfParty.map(d => xScale(d.state));
        const minX = d3.min(xValues);
        const maxX = d3.max(xValues) + xScale.bandwidth();
        
        // horizontal dashed line representing average
        chartArea.append("line")
          .attr("x1", minX)
          .attr("x2", maxX)
          .attr("y1", yScale(avg))
          .attr("y2", yScale(avg))
          .attr("stroke", "black")
          .attr("stroke-dasharray", "4")
          .attr("stroke-width", 2);
          
        // text label for the average
        chartArea.append("text")
          .attr("x", (minX + maxX) / 2)
          .attr("y", yScale(avg) - 5)
          .attr("text-anchor", "middle")
          .style("font-size", "30px")
          .text(`Avg: ${avg.toFixed(2)}`);
      });
    }
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
  // Clear the SVG container
  svg.selectAll("*").remove();

  const gameWidth = w;
  const gameHeight = h;

  const fallbackSteps = [
    {
      topText: "Welcome to 'Guess the Rate'",
      bottomText: "Each icon represents 1 baby death per 1,000 births. Click to guess rates in different regions.",
      numIcons: 10,
      isGuess: false,
    },
    {
      topText: "What is the average infant mortality rate across the U.S.?",
      bottomText: "Click how many infants (out of 1,000 births) you think don’t survive, on average.",
      numIcons: 10,
      isGuess: true,
      correctAnswer: 6,  // placeholder
    },
    {
      topText: "Now guess the rate in counties with higher median incomes.",
      bottomText: "These are the top 20% of counties by income. What do you think the average is?",
      numIcons: 10,
      isGuess: true,
      correctAnswer: 4, // placeholder
    },
    {
      topText: "Now guess the rate in counties with lower median incomes.",
      bottomText: "These are the bottom 20% of counties by income. What do you think the average is?",
      numIcons: 10,
      isGuess: true,
      correctAnswer: 9, // placeholder
    },
    {
      topText: "Thanks for exploring these disparities",
      bottomText: "Click ► to continue with the poem.",
      numIcons: 0,
      isGuess: false,
    }
  ];
  

  function startGame(steps) {
    let currentStep = 0;
    let userGuess = 0;

    const gameGroup = svg.append("g").attr("class", "game-group");

    gameGroup.append("rect")
      .attr("width", gameWidth)
      .attr("height", gameHeight)
      .attr("fill", "#f5f5f5")
      .attr("rx", 10)
      .attr("ry", 10);

    const topText = gameGroup.append("text")
      .attr("class", "game-top-text")
      .attr("x", gameWidth / 2)
      .attr("y", 80)
      .attr("text-anchor", "middle")
      .attr("font-size", "28px")
      .attr("font-weight", "bold")
      .attr("fill", "#333")
      .text("");

    const bottomText = gameGroup.append("text")
      .attr("class", "game-bottom-text")
      .attr("x", gameWidth / 2)
      .attr("y", gameHeight - 80)
      .attr("text-anchor", "middle")
      .attr("font-size", "22px")
      .attr("fill", "#333")
      .text("");

    const nextButton = gameGroup.append("g")
      .attr("class", "next-button")
      .attr("transform", `translate(${gameWidth/2}, ${gameHeight - 40})`)
      .style("cursor", "pointer");

    nextButton.append("rect")
      .attr("x", -60)
      .attr("y", -25)
      .attr("width", 120)
      .attr("height", 40)
      .attr("rx", 20)
      .attr("ry", 20)
      .attr("fill", "#3498db");

    nextButton.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", 5)
      .attr("fill", "white")
      .attr("font-size", "18px")
      .text("Next");

    const infoText = gameGroup.append("text")
      .attr("class", "info-text")
      .attr("x", gameWidth / 2)
      .attr("y", gameHeight - 120)
      .attr("text-anchor", "middle")
      .attr("font-size", "20px")
      .attr("fill", "#555")
      .attr("opacity", 0)
      .text("");

    function drawStep(stepIndex) {
      const step = steps[stepIndex];
      topText.text(step.topText);
      bottomText.text(step.bottomText);
      infoText.attr("opacity", 0);
      userGuess = 0;

      gameGroup.selectAll(".icons-group").remove();
      nextButton.select("text").text(stepIndex === steps.length - 1 ? "Continue" : "Next");
      nextButton.style("display", stepIndex === steps.length - 1 ? "none" : "block");

      if (step.numIcons === 0) return;

      const iconsGroup = gameGroup.append("g").attr("class", "icons-group");
      const iconSize = 60;
      const iconPadding = 20;
      const startX = (gameWidth - (step.numIcons * (iconSize + iconPadding) - iconPadding)) / 2;
      const iconY = gameHeight / 2 - 50;

      const icons = iconsGroup.selectAll(".icon")
        .data(d3.range(step.numIcons))
        .enter()
        .append("g")
        .attr("class", d => `icon icon-${d}`)
        .attr("transform", (d, i) => `translate(${startX + i * (iconSize + iconPadding)}, ${iconY})`)
        .style("cursor", step.isGuess ? "pointer" : "default")
        .style("opacity", 1);

      icons.each(function(d, i) {
        const icon = d3.select(this);
        icon.append("circle")
          .attr("cx", iconSize / 2)
          .attr("cy", iconSize / 3)
          .attr("r", 12)
          .attr("fill", "#3498db");

        icon.append("rect")
          .attr("x", iconSize / 2 - 8)
          .attr("y", iconSize / 3 + 15)
          .attr("width", 16)
          .attr("height", 25)
          .attr("rx", 5)
          .attr("ry", 5)
          .attr("fill", "#3498db");

        icon.append("text")
          .attr("x", iconSize / 2)
          .attr("y", iconSize / 3 + 60)
          .attr("text-anchor", "middle")
          .attr("font-size", "16px")
          .attr("fill", "#555")
          .text(i + 1);
      });

      if (step.isGuess) {
        setupGuessInteraction(icons, step.correctAnswer, step.actualRate);
      }
    }

    function setupGuessInteraction(icons, correctAnswer, actualRate) {
      nextButton.on("click", null);

      icons.on("click", function(event, d) {
        userGuess = d + 1;
        icons.each(function(iconIndex) {
          const icon = d3.select(this);
          icon.selectAll("circle, rect")
            .transition()
            .duration(200)
            .attr("fill", iconIndex < userGuess ? "#e74c3c" : "#3498db");
        });

        bottomText.text(`You selected ${userGuess} out of 10. Click Next to continue.`);
        nextButton.on("click", () => checkAnswer(userGuess, correctAnswer, actualRate));
      });

      nextButton.on("click", function() {
        if (userGuess === 0) {
          bottomText.text("Please make a selection by clicking on the icons.");
        } else {
          checkAnswer(userGuess, correctAnswer, actualRate);
        }
      });
    }

    function checkAnswer(guess, correct, actualRate) {
      const step = steps[currentStep];
      const difference = Math.abs(guess - correct);
    
      let feedbackText = guess === correct
        ? "✓ Correct! That's exactly right."
        : difference <= 1
        ? "Almost! Very close to the correct answer."
        : guess > correct
        ? "Your guess was too high."
        : "Your guess was too low.";
    
      let rateDetail = actualRate
        ? ` (${actualRate.toFixed(1)} deaths per 1,000 births)`
        : "";
    
      let note = (currentStep === 2 || currentStep === 3)
        ? " Note: This is an average — individual counties in this group may vary widely (especially in lower income)."
        : "";
    
      infoText.text(`${feedbackText} The correct answer is ${correct}${rateDetail}.${note}`)
        .transition()
        .duration(500)
        .attr("opacity", 1);
    
      gameGroup.selectAll(".icon").each(function(d) {
        const icon = d3.select(this);
        icon.selectAll("circle, rect")
          .transition()
          .duration(500)
          .attr("fill", d < correct ? "#2ecc71" : "#bdc3c7");
      });
    
      nextButton.on("click", nextStep);
      bottomText.text("Click Next to continue");
    }
    

    function nextStep() {
      currentStep++;
      if (currentStep < steps.length) {
        drawStep(currentStep);
      } else {
        svg.selectAll("*").remove();
        keyframeIndex++;
        updateVisualization();
      }
    }

    nextButton.on("click", function() {
      if (steps[currentStep].isGuess && userGuess === 0) {
        bottomText.text("Please make a selection by clicking on the icons.");
      } else {
        nextStep();
      }
    });

    drawStep(currentStep);
  }

  // Load and process real data
  d3.csv(CSV_FILE_PATH).then(function(data) {
    data.forEach(d => {
      d.infant_mortality = +d.infant_mortality;
      d.median_income = +d.median_income;
    });

// Sort counties by income and extract top/bottom 20%
// This helps us define "high income" vs "low income" areas
const sortedByIncome = data.sort((a, b) => a.median_income - b.median_income);
const cutoff = Math.floor(sortedByIncome.length * 0.2);

const bottom20 = sortedByIncome.slice(0, cutoff);           // Lowest 20% income counties
const top20 = sortedByIncome.slice(-cutoff);                // Highest 20% income counties


    const avgBottom20MortalityRaw = d3.mean(bottom20, d => d.infant_mortality);
    const avgTop20MortalityRaw = d3.mean(top20, d => d.infant_mortality);
    const medianMortalityRaw = d3.median(data, d => d.infant_mortality);

    const avgBottom20Mortality = Math.floor(avgBottom20MortalityRaw);
    const avgTop20Mortality = Math.floor(avgTop20MortalityRaw);
    const medianMortality = Math.floor(medianMortalityRaw);

    const dataSteps = [...fallbackSteps];
    dataSteps[1].correctAnswer = medianMortality;
    dataSteps[1].actualRate = medianMortalityRaw;

    dataSteps[2].correctAnswer = avgTop20Mortality;
    dataSteps[2].actualRate = avgTop20MortalityRaw;

    dataSteps[3].correctAnswer = avgBottom20Mortality;
    dataSteps[3].actualRate = avgBottom20MortalityRaw;

    startGame(dataSteps);
  }).catch(error => {
    console.error("Data load failed, using fallback:", error);
    startGame(fallbackSteps);
  });
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

  // Remove any existing active highlighting
  document.querySelectorAll(".verse").forEach(verse => verse.classList.remove("active-verse"));
  document.querySelectorAll(".line").forEach(line => line.classList.remove("active-line"));

  // Mark the active verse and its active lines
  let verseEl = document.getElementById("verse" + keyframe.activeVerse);
  if (verseEl) {
    verseEl.classList.add("active-verse");
    keyframe.activeLines.forEach(num => {
      let lineEl = verseEl.querySelector("#line" + num);
      if (lineEl) lineEl.classList.add("active-line");
    });
  }

  // Get layout elements
  const wrapper = document.querySelector(".wrapper");
  const rightColumn = document.querySelector(".right-column");

  // Check if a visual update function is provided
  if (keyframe.svgUpdate && typeof keyframe.svgUpdate === "function") {
    // For verses with a visual: remove the centered layout and show the right column.
    wrapper.classList.remove("center-only");
    rightColumn.style.display = "block";  // Ensure the right column is visible
    keyframe.svgUpdate(); // Call the visualization update
  } else {
    // For verses without a visual (first and last): add centered layout and hide the right column.
    wrapper.classList.add("center-only");
    rightColumn.style.display = "none";
    // Optionally clear the SVG or reset it as needed:
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


// Attach event listener to the dropdown
document.getElementById("sort-select").addEventListener("change", function() {
  // Clear the current SVG content before re-rendering
  svg.selectAll("*").remove();
  
  // Get the selected sort option and re-render the chart
  const selectedSortOption = this.value;
  stateDeathVis(selectedSortOption);
});



document.getElementById("backward-button").addEventListener("click", () => {
 if (keyframeIndex > 0) {
   keyframeIndex--;
   updateVisualization();
 }
});


document.getElementById("playGameButton").addEventListener("click", function() {
  guessTheRateVis();
});


// Initialize the SVG and visualization on page load
initialiseSVG();
updateVisualization();
