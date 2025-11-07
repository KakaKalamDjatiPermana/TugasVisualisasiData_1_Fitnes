window.addEventListener("DOMContentLoaded", () => {
  // --- Konfigurasi Global ---
  const plotlyConfig = { responsive: true, displaylogo: false };
  const plotlyLayout = {
    margin: { t: 40, b: 60, l: 60, r: 20 }, // Margin default
    paper_bgcolor: "rgba(0,0,0,0)", // Transparan
    plot_bgcolor: "rgba(0,0,0,0)", // Transparan
    font: { color: "#333" },
  };

  // --- Definisi Fungsi Plot (Bar & Pie) ---
  function plotBarChart(data) {
    let exerciseCalories = {};
    data.forEach((row) => {
      const exercise = row["Name of Exercise"];
      const calories = row.Calories_Burned;
      if (exerciseCalories[exercise]) {
        exerciseCalories[exercise] += calories;
      } else {
        exerciseCalories[exercise] = calories;
      }
    });

    const sortedExercises = Object.entries(exerciseCalories)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);
    sortedExercises.reverse();

    const trace = {
      type: "bar",
      x: sortedExercises.map((item) => item[1]),
      y: sortedExercises.map((item) => item[0]),
      orientation: "h",
      marker: {
        color: "#667eea",
      },
    };

    const layout = {
      ...plotlyLayout,
      title: "Top 10 Latihan Pembakar Kalori",
      margin: { ...plotlyLayout.margin, l: 150 }, // Memberi 150px ruang
    };
    // --------------------------------------------------------------------

    Plotly.newPlot("barChart", [trace], layout, plotlyConfig);
  }

  // --- FUNGSI PENGGANTI: plotHistogram ---
  function plotHistogram(data) {
    const trace = {
      type: "histogram",
      x: data.map((row) => row.Age),
      marker: {
        color: "#f0c419",
      },
      nbinsx: 20,
    };

    const layout = {
      ...plotlyLayout,
      title: "Distribusi Frekuensi Usia",
      xaxis: { title: "Kelompok Usia" },
      yaxis: { title: "Jumlah Pengguna" },
      bargap: 0.05,
    };
    Plotly.newPlot("histogramChart", [trace], layout, plotlyConfig);
  }
  // -------------------------------------------------------------------

  function plotPieChart(data) {
    let difficultyCounts = {
      Beginner: 0,
      Intermediate: 0,
      Advanced: 0,
    };
    data.forEach((row) => {
      const level = row["Difficulty Level"];
      if (difficultyCounts.hasOwnProperty(level)) {
        difficultyCounts[level]++;
      }
    });
    const trace = {
      type: "pie",
      labels: Object.keys(difficultyCounts),
      values: Object.values(difficultyCounts),
      marker: {
        colors: ["#45b7d1", "#f0c419", "#e95a49"],
      },
      hole: 0.4,
    };
    const layout = { ...plotlyLayout, title: "Proporsi Tingkat Kesulitan" };
    Plotly.newPlot("pieChart", [trace], layout, plotlyConfig);
  }

  // --- Definisi Fungsi Update ---
  function updateDashboard(allData, selectedWorkout) {
    let filteredData = allData;
    const selectedValue = selectedWorkout.trim().toLowerCase();

    if (selectedValue !== "all") {
      filteredData = allData.filter(
        (row) =>
          row.Workout_Type && row.Workout_Type.toLowerCase() === selectedValue
      );
    }
    console.log(
      `Filter diubah ke: ${selectedValue}. Ditemukan ${filteredData.length} baris.`
    );

    plotBarChart(filteredData);
    plotHistogram(filteredData);
    plotPieChart(filteredData);
  }

  // --- Fungsi Asinkron Utama ---
  async function main() {
    const filterElement = document.getElementById("workoutTypeFilter");
    let allData = [];

    try {
      // Menggunakan sintaks modern (Promise) untuk D3 v7
      const rows = await d3.csv("SmartFitnesNutrition.csv");

      // Memproses dan membersihkan data
      allData = rows.map((row) => {
        row.Calories_Burned = +row["Calories_Burned"];
        row.Avg_BPM = +row["Avg_BPM"];
        row.Age = +row["Age"];
        if (row.Workout_Type) row.Workout_Type = row.Workout_Type.trim();
        if (row["Name of Exercise"])
          row["Name of Exercise"] = row["Name of Exercise"].trim();
        if (row["Difficulty Level"])
          row["Difficulty Level"] = row["Difficulty Level"].trim();
        return row;
      });

      // Tampilkan debugging untuk mengecek data
      const uniqueTypes = [...new Set(allData.map((row) => row.Workout_Type))];
      console.log("Nilai unik 'Workout_Type' (setelah di-trim):", uniqueTypes);

      // Pasang event listener
      filterElement.addEventListener("change", () => {
        updateDashboard(allData, filterElement.value); // Pass allData
      });

      // Panggil update pertama kali
      updateDashboard(allData, "All"); // Pass allData
    } catch (error) {
      console.error("GAGAL MEMUAT ATAU MEMPROSES DATA CSV:", error);
    }
  }

  // --- Jalankan Aplikasi ---
  main();
});
