import { Log } from "../../../logging_middleware/logger.js";

export class KnapsackService {

  static async solve(tasks, budget) {

    await Log(
      "backend",
      "info",
      "domain",
      `Knapsack optimization started for ${tasks.length} tasks with budget ${budget}`
    );

    const n = tasks.length;

    const dp = new Array(budget + 1).fill(0);

    const keep = Array.from(
      { length: n + 1 },
      () => new Array(budget + 1).fill(false)
    );

    for (let i = 1; i <= n; i++) {

      const { Duration, Impact } = tasks[i - 1];

      for (let w = budget; w >= Duration; w--) {

        if (dp[w - Duration] + Impact > dp[w]) {
          dp[w] = dp[w - Duration] + Impact;
          keep[i][w] = true;
        }
      }
    }

    const selectedTasks = [];

    let currentBudget = budget;

    for (let i = n; i > 0; i--) {

      if (keep[i][currentBudget]) {
        selectedTasks.push(tasks[i - 1].TaskID);
        currentBudget -= tasks[i - 1].Duration;
      }
    }

    await Log(
      "backend",
      "info",
      "domain",
      `Knapsack optimization completed. Selected ${selectedTasks.length} tasks with impact ${dp[budget]}`
    );

    return {
      selectedTasks,
      totalImpact: dp[budget],
    };
  }
}