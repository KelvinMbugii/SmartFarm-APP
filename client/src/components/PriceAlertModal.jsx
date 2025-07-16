import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Bell, TrendingUp, TrendingDown } from "lucide-react";
import marketService from "../services/marketService";

const PriceAlertModal = ({ isOpen, onClose, commodity = "Rice" }) => {
  const [alertData, setAlertData] = useState({
    commodity,
    targetPrice: "",
    condition: "above", 
    email: "",
    sms: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await marketService.createPriceAlert(
        alertData.commodity,
        parseFloat(alertData.targetPrice),
        alertData.condition
      );

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
        setAlertData({
          commodity,
          targetPrice: "",
          condition: "above",
          email: "",
          sms: false,
        });
      }, 2000);
    } catch (error) {
      console.error("Error creating alert:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 50 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: 50,
      transition: { duration: 0.2 },
    },
  };

  const successVariants = {
    hidden: { scale: 0 },
    visible: {
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 30,
      },
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
              {success ? (
                <motion.div
                  variants={successVariants}
                  initial="hidden"
                  animate="visible"
                  className="p-8 text-center"
                >
                  <motion.div
                    className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 0.5 }}
                  >
                    <Bell className="w-8 h-8 text-green-600" />
                  </motion.div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Alert Created!
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    You'll be notified when {alertData.commodity} price goes{" "}
                    {alertData.condition} ₹{alertData.targetPrice}
                  </p>
                </motion.div>
              ) : (
                <>
                  {/* Header */}
                  <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
                        <Bell className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Set Price Alert
                      </h3>
                    </div>
                    <button
                      onClick={onClose}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Commodity
                      </label>
                      <select
                        value={alertData.commodity}
                        onChange={(e) =>
                          setAlertData((prev) => ({
                            ...prev,
                            commodity: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="Rice">Rice</option>
                        <option value="Wheat">Wheat</option>
                        <option value="Corn">Corn</option>
                        <option value="Soybeans">Soybeans</option>
                        <option value="Cotton">Cotton</option>
                        <option value="Sugarcane">Sugarcane</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Alert Condition
                      </label>
                      <div className="flex space-x-4">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            value="above"
                            checked={alertData.condition === "above"}
                            onChange={(e) =>
                              setAlertData((prev) => ({
                                ...prev,
                                condition: e.target.value,
                              }))
                            }
                            className="mr-2"
                          />
                          <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            Price goes above
                          </span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            value="below"
                            checked={alertData.condition === "below"}
                            onChange={(e) =>
                              setAlertData((prev) => ({
                                ...prev,
                                condition: e.target.value,
                              }))
                            }
                            className="mr-2"
                          />
                          <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            Price goes below
                          </span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Target Price (₹ per quintal)
                      </label>
                      <input
                        type="number"
                        value={alertData.targetPrice}
                        onChange={(e) =>
                          setAlertData((prev) => ({
                            ...prev,
                            targetPrice: e.target.value,
                          }))
                        }
                        placeholder="Enter target price"
                        required
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email (optional)
                      </label>
                      <input
                        type="email"
                        value={alertData.email}
                        onChange={(e) =>
                          setAlertData((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        placeholder="your@email.com"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="sms"
                        checked={alertData.sms}
                        onChange={(e) =>
                          setAlertData((prev) => ({
                            ...prev,
                            sms: e.target.checked,
                          }))
                        }
                        className="mr-2"
                      />
                      <label
                        htmlFor="sms"
                        className="text-sm text-gray-700 dark:text-gray-300"
                      >
                        Also send SMS alerts
                      </label>
                    </div>

                    <div className="flex space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        Cancel
                      </button>
                      <motion.button
                        type="submit"
                        disabled={isSubmitting || !alertData.targetPrice}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? "Creating..." : "Create Alert"}
                      </motion.button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default PriceAlertModal;
