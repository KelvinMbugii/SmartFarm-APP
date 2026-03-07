const formatValidationError = (error) => {
  if (error?.name === "ValidationError") {
    const fieldErrors = Object.values(error.errors || {}).map(
      (item) => item.message,
    );

    return {
      statusCode: 400,
      message: fieldErrors[0] || "Validation failed",
      details: fieldErrors,
    };
  }

  if (error?.code === 11000) {
    const duplicateField = Object.keys(error.keyPattern || {})[0] || "field";

    return {
      statusCode: 400,
      message: `${duplicateField} already exists`,
    };
  }

  return {
    statusCode: 500,
    message: error?.message || "Internal server error",
  };
};

module.exports = formatValidationError;
