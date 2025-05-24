import express from "express";
import {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
} from "../controllers/employeeController.js";
import {
  validateCreateEmployee,
  validateUpdateEmployee,
} from "../middlewares/employeeValidation.js";

const router = express.Router();

// Create a new employee
router.post("/", validateCreateEmployee, createEmployee);

// Get all employees
router.get("/", getEmployees);

// Get a single employee by ID
router.get("/:id", getEmployeeById);

// Update an existing employee
router.put("/:id", validateUpdateEmployee, updateEmployee);

// Delete an employee
router.delete("/:id", deleteEmployee);
router.put("/reset", async (req, res) => {
  const { currentMonthYear } = req.body;

  try {
    // Update all employees' statuses to "unpaid" for the new month
    const result = await Employee.updateMany(
      {}, // filter (all employees)
      {
        $set: {
          salaryStatus: "unpaid",
          paidAmount: 0,
          lastPayment: null,
        },
        $push: {
          paymentHistory: {
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString(),
            timestamp: new Date(),
            monthYear: currentMonthYear,
            amount: 0,
          },
        },
      }
    );

    res
      .status(200)
      .json({
        message: "Employee statuses reset",
        modifiedCount: result.modifiedCount,
      });
  } catch (err) {
    console.error("Error resetting employee statuses:", err);
    res.status(500).json({ error: "Failed to reset employee statuses" });
  }
});
export default router;
