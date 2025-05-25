import Joi from "joi";

// Payment history entry schema
const paymentEntrySchema = Joi.object({
  date: Joi.string().required(),
  time: Joi.string().required(),
  timestamp: Joi.date().required(),
  monthYear: Joi.string().required(),
  amount: Joi.number().positive().required(),
});

// Schema for creating a new employee
export const createEmployeeSchema = Joi.object({
  employeeId: Joi.string().required(),
  name: Joi.string().min(3).required(),
  phone: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      "string.pattern.base": "Phone number must be a 10-digit number",
    }),
  aadhaar: Joi.string()
    .length(12)
    .pattern(/^[0-9]+$/)
    .required()
    .messages({
      "string.length": "Aadhaar number must be 12 digits",
      "string.pattern.base": "Aadhaar number must contain only digits",
    }),
  role: Joi.string().required(),
  salary: Joi.number().positive().required(),
  address: Joi.string().min(5).optional(),
  paidAmount: Joi.number().min(0).optional(),
  salaryStatus: Joi.string()
    .valid("paid", "partially_paid", "unpaid")
    .optional(),
  lastPayment: Joi.date().allow(null).optional(),
  paymentHistory: Joi.array().items(paymentEntrySchema).optional(),
});

// Schema for updating an employee
export const updateEmployeeSchema = Joi.object({
  name: Joi.string().min(3).optional(),
  phone: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .messages({
      "string.pattern.base": "Phone number must be a 10-digit number",
    })
    .optional(),
  address: Joi.string().min(5).optional(),
  role: Joi.string().optional(),
  salary: Joi.number().positive().optional(),
  paidAmount: Joi.number().min(0).optional(),
  salaryStatus: Joi.string()
    .valid("paid", "partially_paid", "unpaid")
    .optional(),
  lastPayment: Joi.date().allow(null).optional(),
  paymentHistory: Joi.array().items(paymentEntrySchema).optional(),
});

// Middleware for validating create
export const validateCreateEmployee = (req, res, next) => {
  const { error } = createEmployeeSchema.validate(req.body, {
    abortEarly: false, // Report all errors
    allowUnknown: true, // Allow unknown properties, if any
  });

  if (error) {
    const errors = error.details.map((detail) => detail.message);
    return res.status(400).json({ errors });
  }

  next();
};

// Middleware for validating update
export const validateUpdateEmployee = (req, res, next) => {
  const { error } = updateEmployeeSchema.validate(req.body, {
    abortEarly: false, // Report all errors
    allowUnknown: true, // Allow unknown properties, if any
  });

  if (error) {
    const errors = error.details.map((detail) => detail.message);
    return res.status(400).json({ errors });
  }

  next();
};
