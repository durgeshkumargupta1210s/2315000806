import apiClient from '../../../shared/src/http-client';
import { KnapsackService } from '../services/knapsack.service';
import { Log } from '../../../logging_middleware/logger.js';

export const scheduleMaintenance = async (req, res) => {
  try {

    await Log(
      "backend",
      "info",
      "controller",
      "Maintenance scheduling request received"
    );

    const depotResponse = await apiClient.get('/depots');

    await Log(
      "backend",
      "info",
      "domain",
      "Depot data fetched successfully"
    );

    const depots = depotResponse.data.depots;

    if (!depots || depots.length === 0) {

      await Log(
        "backend",
        "warn",
        "controller",
        "No depot data found"
      );

      return res.status(404).json({
        error: 'No depot data found'
      });
    }

    const budget = depots[0].MechanicHours;

    const vehicleResponse = await apiClient.get('/vehicles');

    await Log(
      "backend",
      "info",
      "domain",
      "Vehicle data fetched successfully"
    );

    const vehicles = vehicleResponse.data.vehicles;

    if (!vehicles || !Array.isArray(vehicles)) {

      await Log(
        "backend",
        "warn",
        "controller",
        "No vehicle data found"
      );

      return res.status(404).json({
        error: 'No vehicle data found'
      });
    }

    const result =
      await KnapsackService.solve(
        vehicles,
        budget
      );

    await Log(
      "backend",
      "info",
      "domain",
      `Maintenance schedule generated with ${result.selectedTasks.length} tasks`
    );

    return res.json({
      budget,
      totalImpact: result.totalImpact,
      selectedTasks: result.selectedTasks,
    });

  } catch (error) {

    await Log(
      "backend",
      "error",
      "controller",
      error.message
    );

    return res.status(500).json({
      error: 'Internal Server Error',
      details: error.message
    });
  }
};