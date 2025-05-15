// sketches.js

// --- Sketch voor de STATISCHE matrix ---
let pdMatrixStaticSketch = function(p_containerId) {
  return function(p) {
    let matrixWidth, matrixHeight, cellWidth, cellHeight, offsetX, offsetY;
    let yPosPlayerB, yPosChoicesB, xPosPlayerA, xPosChoicesA;
    let playerLabelFontSize, choiceLabelFontSize, payoffFontSize;

    const payoffs = {
        zwijg_zwijg: { p1: 1, p2: 1 },
        zwijg_beken: { p1: 10, p2: 0 },
        beken_zwijg: { p1: 0, p2: 10 },
        beken_beken: { p1: 5, p2: 5 }
    };
    const choices = ["Zwijgen", "Bekennen"];
    const player1Label = "Gevangene A", player2Label = "Gevangene B";

    let bgColor, labelColor, textColor, p1PayoffColor, p2PayoffColor, matrixBorderColor, cellBgColor;

    function getThemeColors() {
        bgColor = p.color(getComputedStyle(document.documentElement).getPropertyValue('--main-bg-color').trim() || '#FAF6F0');
        labelColor = p.color(getComputedStyle(document.documentElement).getPropertyValue('--heading-text-color').trim() || '#223A5E');
        textColor = p.color(getComputedStyle(document.documentElement).getPropertyValue('--text-color').trim() || '#223A5E');
        p1PayoffColor = p.color(getComputedStyle(document.documentElement).getPropertyValue('--payoff-color-p1').trim() || '#F27F54');
        p2PayoffColor = p.color(getComputedStyle(document.documentElement).getPropertyValue('--payoff-color-p2').trim() || '#4A89C8');
        matrixBorderColor = p.color(getComputedStyle(document.documentElement).getPropertyValue('--border-color-interactive').trim() || '#78B954');
        cellBgColor = p.color(255, 255, 255, 230);
    }

    function calculateDimensions() {
      // Stap 1: Bepaal gewenste celgrootte (startpunt)
      let targetCellWidth = 155; // VERHOOGD (was 130, toen 150)
      let targetCellHeight = targetCellWidth * 0.75;

      // Stap 2: Bepaal benodigde ruimte voor labels
      let spacingFactorTop = 0.8;
      let spacingFactorLeft = 1.25; // VERHOOGD (was 0.9, toen 1.1) - meer ruimte links

      let labelSpaceAboveMatrix = targetCellHeight * spacingFactorTop;
      let labelSpaceLeftOfMatrix = targetCellWidth * spacingFactorLeft;

      // Stap 3: Bereken de totale afmetingen van het "matrix + labels" blok
      let blockWidth = (2 * targetCellWidth) + labelSpaceLeftOfMatrix;
      let blockHeight = (2 * targetCellHeight) + labelSpaceAboveMatrix;

      // Stap 4: Schaal het blok om in de container te passen (met marge)
      let containerPadding = 0.015; // VERLAAGD (was 0.03, toen 0.02) - minder padding
      let availableDrawingWidth = p.width * (1 - 2 * containerPadding);
      let availableDrawingHeight = p.height * (1 - 2 * containerPadding);

      let scale = 1;
      if (blockWidth > availableDrawingWidth) {
          scale = Math.min(scale, availableDrawingWidth / blockWidth);
      }
      if (blockHeight > availableDrawingHeight) {
          scale = Math.min(scale, availableDrawingHeight / blockHeight);
      }

      // Stap 5: Pas alle afmetingen aan met de schaalfactor
      cellWidth = targetCellWidth * scale;
      cellHeight = targetCellHeight * scale;
      matrixWidth = 2 * cellWidth;
      matrixHeight = 2 * cellHeight;

      let effectiveLabelSpaceAbove = cellHeight * spacingFactorTop;
      let effectiveLabelSpaceLeft = cellWidth * spacingFactorLeft;

      // Stap 6: Bepaal de positie (offsetX, offsetY) van de linkerbovenhoek van de 2x2 MATRIX
      offsetX = (p.width - (matrixWidth + effectiveLabelSpaceLeft)) / 2 + effectiveLabelSpaceLeft;
      offsetY = (p.height - (matrixHeight + effectiveLabelSpaceAbove)) / 2 + effectiveLabelSpaceAbove;

      // Stap 7: Definieer de Y-posities voor labels BOVEN de matrix (midden van de tekst)
      yPosPlayerB = offsetY - effectiveLabelSpaceAbove * 0.65; // Iets aangepast voor balans
      yPosChoicesB = offsetY - effectiveLabelSpaceAbove * 0.25; // Iets aangepast voor balans

      // Stap 8: Definieer de X-posities voor labels LINKS van de matrix (midden van de tekst)
      // Deze factoren bepalen hoe ver de labels *binnen* de effectiveLabelSpaceLeft staan.
      // 0.75 betekent 75% van de labelruimte weg van de matrix (dus dichter bij de linkerrand van de labelruimte)
      xPosPlayerA = offsetX - effectiveLabelSpaceLeft * 0.75; // VERHOOGD (was 0.70) -> verder naar links
      xPosChoicesA = offsetX - effectiveLabelSpaceLeft * 0.35; // VERHOOGD (was 0.30) -> ook iets verder naar links, relatief

      // Stap 9: Bereken lettergroottes
      playerLabelFontSize = p.max(15, p.min(21, cellHeight * 0.25)); // Limieten iets aangepast
      choiceLabelFontSize = p.max(13, p.min(19, cellHeight * 0.21)); // Limieten iets aangepast
      payoffFontSize = p.max(22, p.min(32, cellHeight * 0.38)); // Limieten iets aangepast
    }

    p.setup = function() {
      let container = document.getElementById(p_containerId);
      if (!container) { console.error("Static matrix container NOT FOUND:", p_containerId); return; }
      // GEWIJZIGD: Gebruik clientWidth en clientHeight
      p.createCanvas(container.clientWidth, container.clientHeight);
      getThemeColors();
      calculateDimensions(); // Moet na createCanvas en het ophalen van dimensies
      p.textFont(getComputedStyle(document.documentElement).getPropertyValue('--font-body').trim() || 'Lato');
      p.noLoop();
    };

    p.windowResized = function() {
      let container = document.getElementById(p_containerId);
      if (!container) return;
      // GEWIJZIGD: Gebruik clientWidth en clientHeight
      p.resizeCanvas(container.clientWidth, container.clientHeight);
      getThemeColors();
      calculateDimensions();
      p.redraw();
    };

    p.draw = function() {
      getThemeColors();
      p.background(bgColor);
      p.textAlign(p.CENTER, p.CENTER); // Standaard uitlijning voor alle labels

      // Player B (boven)
      p.textFont(getComputedStyle(document.documentElement).getPropertyValue('--font-headings').trim() || 'Nunito');
      p.fill(labelColor); p.textSize(playerLabelFontSize);
      p.text(player2Label, offsetX + matrixWidth / 2, yPosPlayerB);

      p.textFont(getComputedStyle(document.documentElement).getPropertyValue('--font-body').trim() || 'Lato');
      p.fill(textColor); p.textSize(choiceLabelFontSize);
      for (let j = 0; j < 2; j++) {
        p.text(choices[j], offsetX + cellWidth * (j + 0.5), yPosChoicesB);
      }

      // Player A (links)
      p.textFont(getComputedStyle(document.documentElement).getPropertyValue('--font-headings').trim() || 'Nunito');
      p.fill(labelColor); p.textSize(playerLabelFontSize);
      p.text(player1Label, xPosPlayerA, offsetY + matrixHeight / 2);

      p.textFont(getComputedStyle(document.documentElement).getPropertyValue('--font-body').trim() || 'Lato');
      p.fill(textColor); p.textSize(choiceLabelFontSize);
      for (let i = 0; i < 2; i++) {
        p.text(choices[i], xPosChoicesA, offsetY + cellHeight * (i + 0.5));
      }

      let cellData = [
        [payoffs.zwijg_zwijg, payoffs.zwijg_beken],
        [payoffs.beken_zwijg, payoffs.beken_beken]
      ];

      for (let i = 0; i < 2; i++) {
        for (let j = 0; j < 2; j++) {
          let x = offsetX + j * cellWidth; let y = offsetY + i * cellHeight;
          let currentOutcome = cellData[i][j];
          p.stroke(matrixBorderColor); p.strokeWeight(2); p.fill(cellBgColor);
          p.rect(x, y, cellWidth, cellHeight, 6);

          p.textSize(payoffFontSize); p.noStroke();
          p.textFont(getComputedStyle(document.documentElement).getPropertyValue('--font-headings').trim() || 'Nunito');
          p.fill(p1PayoffColor); p.text(currentOutcome.p1, x + cellWidth * 0.33, y + cellHeight / 2);
          p.fill(p2PayoffColor); p.text(currentOutcome.p2, x + cellWidth * 0.67, y + cellHeight / 2);
        }
      }
    };
  };
};


// --- Sketch voor de DYNAMISCHE matrix met analyse ---
let pdMatrixAnalysisSketch = function(p_containerId) {
  return function(p) {
    let matrixWidth, matrixHeight, cellWidth, cellHeight, offsetX, offsetY;
    let yPosPlayerB, yPosChoicesB, xPosPlayerA, xPosChoicesA;
    let playerLabelFontSize, choiceLabelFontSize, payoffFontSize;

    const payoffsData = {
        zwijg_zwijg: { p1: 1, p2: 1 },
        zwijg_beken: { p1: 10, p2: 0 },
        beken_zwijg: { p1: 0, p2: 10 },
        beken_beken: { p1: 5, p2: 5 }
    };
    const choices = ["Zwijgen", "Bekennen"];
    const player1Label = "Gevangene A", player2Label = "Gevangene B";
    let cellPayoffsLookup = [
        [payoffsData.zwijg_zwijg, payoffsData.zwijg_beken],
        [payoffsData.beken_zwijg, payoffsData.beken_beken]
    ];

    let bgColor, labelColor, textColor, p1PayoffColor, p2PayoffColor, matrixBorderColor, cellBgColor;
    let highlightGoodColor, highlightBadColor, columnHighlightColorVal, nashEquilibriumColor;
    let currentAnalysisStep = null;

    function getThemeColors() {
        bgColor = p.color(getComputedStyle(document.documentElement).getPropertyValue('--main-bg-color').trim() || '#FAF6F0');
        labelColor = p.color(getComputedStyle(document.documentElement).getPropertyValue('--heading-text-color').trim() || '#223A5E');
        textColor = p.color(getComputedStyle(document.documentElement).getPropertyValue('--text-color').trim() || '#223A5E');
        p1PayoffColor = p.color(getComputedStyle(document.documentElement).getPropertyValue('--payoff-color-p1').trim() || '#F27F54');
        p2PayoffColor = p.color(getComputedStyle(document.documentElement).getPropertyValue('--payoff-color-p2').trim() || '#4A89C8');
        matrixBorderColor = p.color(getComputedStyle(document.documentElement).getPropertyValue('--border-color-interactive').trim() || '#78B954');
        cellBgColor = p.color(255, 255, 255, 230);
        let greenBase = p.color(getComputedStyle(document.documentElement).getPropertyValue('--img-green-nature').trim() || '#78B954');
        highlightGoodColor = p.color(p.red(greenBase), p.green(greenBase), p.blue(greenBase), 220);
        columnHighlightColorVal = p.color(p.red(greenBase), p.green(greenBase), p.blue(greenBase), 30);
        let orangeBase = p.color(getComputedStyle(document.documentElement).getPropertyValue('--img-orange-accent').trim() || '#F27F54');
        highlightBadColor = p.color(p.red(orangeBase), p.green(orangeBase), p.blue(orangeBase), 220);
        nashEquilibriumColor = p.color(p.red(orangeBase), p.green(orangeBase), p.blue(orangeBase), 190);
    }

    function calculateDimensions() {
      // Stap 1: Bepaal gewenste celgrootte (startpunt)
      let targetCellWidth = 120; // VERHOOGD (was 100, toen 115)
      let targetCellHeight = targetCellWidth * 0.75;

      // Stap 2: Ruimte voor labels
      let spacingFactorTop = 0.9;
      let spacingFactorLeft = 1.3; // VERHOOGD (was 1.0, toen 1.2) - meer ruimte links

      let labelSpaceAboveMatrix = targetCellHeight * spacingFactorTop;
      let labelSpaceLeftOfMatrix = targetCellWidth * spacingFactorLeft;

      // Stap 3: Totale blokafmetingen
      let blockWidth = (2 * targetCellWidth) + labelSpaceLeftOfMatrix;
      let blockHeight = (2 * targetCellHeight) + labelSpaceAboveMatrix;

      // Stap 4: Schalen
      let containerPadding = 0.015; // VERLAAGD (was 0.03, toen 0.02)
      let availableDrawingWidth = p.width * (1 - 2 * containerPadding);
      let availableDrawingHeight = p.height * (1 - 2 * containerPadding);
      let scale = 1;
      if (blockWidth > availableDrawingWidth) scale = Math.min(scale, availableDrawingWidth / blockWidth);
      if (blockHeight > availableDrawingHeight) scale = Math.min(scale, availableDrawingHeight / blockHeight);

      // Stap 5: Aangepaste afmetingen
      cellWidth = targetCellWidth * scale;
      cellHeight = targetCellHeight * scale;
      matrixWidth = 2 * cellWidth;
      matrixHeight = 2 * cellHeight;
      let effectiveLabelSpaceAbove = cellHeight * spacingFactorTop;
      let effectiveLabelSpaceLeft = cellWidth * spacingFactorLeft;

      // Stap 6: Matrix positie
      offsetX = (p.width - (matrixWidth + effectiveLabelSpaceLeft)) / 2 + effectiveLabelSpaceLeft;
      offsetY = (p.height - (matrixHeight + effectiveLabelSpaceAbove)) / 2 + effectiveLabelSpaceAbove;

      // Stap 7: Label Y-posities (boven)
      yPosPlayerB = offsetY - effectiveLabelSpaceAbove * 0.65;
      yPosChoicesB = offsetY - effectiveLabelSpaceAbove * 0.25;

      // Stap 8: Label X-posities (links)
      xPosPlayerA = offsetX - effectiveLabelSpaceLeft * 0.75; // VERHOOGD (was 0.70)
      xPosChoicesA = offsetX - effectiveLabelSpaceLeft * 0.35; // VERHOOGD (was 0.30)

      // Stap 9: Lettergroottes
      playerLabelFontSize = p.max(14, p.min(19, cellHeight * 0.25)); // Limieten aangepast
      choiceLabelFontSize = p.max(12, p.min(17, cellHeight * 0.21)); // Limieten aangepast
      payoffFontSize = p.max(20, p.min(28, cellHeight * 0.38));    // Limieten aangepast
    }

    p.setup = function() {
        let container = document.getElementById(p_containerId);
        if (!container) { console.error("Analysis matrix container NOT FOUND:", p_containerId); return; }
        // GEWIJZIGD: Gebruik clientWidth en clientHeight
        p.createCanvas(container.clientWidth, container.clientHeight);
        getThemeColors();
        calculateDimensions(); // Moet na createCanvas en het ophalen van dimensies
        p.textFont(getComputedStyle(document.documentElement).getPropertyValue('--font-body').trim() || 'Lato');
        p.noLoop();
    };
    p.windowResized = function() {
        let container = document.getElementById(p_containerId);
        if (!container) return;
        // GEWIJZIGD: Gebruik clientWidth en clientHeight
        p.resizeCanvas(container.clientWidth, container.clientHeight);
        getThemeColors();
        calculateDimensions();
        p.redraw();
    };
    p.updateAnalysisStep = function(step) { currentAnalysisStep = step; p.loop(); };

    p.draw = function() {
      getThemeColors();
      p.background(bgColor);
      p.textAlign(p.CENTER, p.CENTER);

      // Player B (boven)
      p.textFont(getComputedStyle(document.documentElement).getPropertyValue('--font-headings').trim() || 'Nunito');
      p.noStroke(); p.fill(labelColor); p.textSize(playerLabelFontSize);
      p.text(player2Label, offsetX + matrixWidth / 2, yPosPlayerB);

      p.textFont(getComputedStyle(document.documentElement).getPropertyValue('--font-body').trim() || 'Lato');
      p.fill(textColor); p.textSize(choiceLabelFontSize);
      for (let j = 0; j < 2; j++) { p.text(choices[j], offsetX + cellWidth * (j + 0.5), yPosChoicesB); }

      // Player A (links)
      p.textFont(getComputedStyle(document.documentElement).getPropertyValue('--font-headings').trim() || 'Nunito');
      p.fill(labelColor); p.textSize(playerLabelFontSize);
      p.text(player1Label, xPosPlayerA, offsetY + matrixHeight / 2);

      p.textFont(getComputedStyle(document.documentElement).getPropertyValue('--font-body').trim() || 'Lato');
      p.fill(textColor); p.textSize(choiceLabelFontSize);
      for (let i = 0; i < 2; i++) { p.text(choices[i], xPosChoicesA, offsetY + cellHeight * (i + 0.5));}

      p.noStroke();
      if (currentAnalysisStep && currentAnalysisStep.startsWith("B_Zwijgt")) {
          p.fill(columnHighlightColorVal); p.rect(offsetX, offsetY, cellWidth, matrixHeight, 6);
      } else if (currentAnalysisStep && currentAnalysisStep.startsWith("B_Bekent")) {
          p.fill(columnHighlightColorVal); p.rect(offsetX + cellWidth, offsetY, cellWidth, matrixHeight, 6);
      }

      for (let i = 0; i < 2; i++) {
        for (let j = 0; j < 2; j++) {
          let x = offsetX + j * cellWidth; let y = offsetY + i * cellHeight;
          let currentOutcomeData = cellPayoffsLookup[i][j];
          p.stroke(matrixBorderColor); p.strokeWeight(1.5); p.fill(cellBgColor);
          p.rect(x, y, cellWidth, cellHeight, 6);

          let circleRadius = cellHeight * 0.29;
          let circleStrokeWeight = p.max(2.2, p.min(3.8, cellHeight * 0.05));
          let shouldDrawP1Circle = false; let p1CircleColor = p1PayoffColor;

          if (currentAnalysisStep === "B_Zwijgt_A_Beken" && i === 1 && j === 0) { shouldDrawP1Circle = true; p1CircleColor = highlightGoodColor; }
          else if (currentAnalysisStep === "B_Zwijgt_A_Zwijg" && i === 0 && j === 0) {shouldDrawP1Circle = true; p1CircleColor = highlightBadColor; }
          else if (currentAnalysisStep === "B_Bekent_A_Beken" && i === 1 && j === 1) { shouldDrawP1Circle = true; p1CircleColor = highlightGoodColor; }
          else if (currentAnalysisStep === "B_Bekent_A_Zwijg" && i === 0 && j === 1) { shouldDrawP1Circle = true; p1CircleColor = highlightBadColor; }

          p.noStroke();
          p.textFont(getComputedStyle(document.documentElement).getPropertyValue('--font-headings').trim() || 'Nunito');
          p.textSize(payoffFontSize);
          p.fill(p1PayoffColor); p.text(currentOutcomeData.p1, x + cellWidth * 0.33, y + cellHeight / 2);
          p.fill(p2PayoffColor); p.text(currentOutcomeData.p2, x + cellWidth * 0.67, y + cellHeight / 2);

          if (shouldDrawP1Circle) {
              p.noFill(); p.stroke(p1CircleColor); p.strokeWeight(circleStrokeWeight);
              p.ellipse(x + cellWidth * 0.33, y + cellHeight / 2, circleRadius);
          }
          if (currentAnalysisStep === "A_Dominant" && i === 1 && j === 1) {
              p.noFill(); p.stroke(nashEquilibriumColor);
              p.strokeWeight(p.max(2.8, cellHeight * 0.06));
              p.ellipse(x + cellWidth / 2, y + cellHeight / 2, cellWidth * 0.62, cellHeight * 0.62);
          }
        }
      }
      if(currentAnalysisStep) p.noLoop();
    };
  };
};