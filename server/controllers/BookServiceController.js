// controllers/BookServiceController.js
import BookService from "../models/BookServiceModel.js";

// Create new booking
export const createBooking = async (req, res) => {
  try {
    const {
      name,
      email,
      phoneNumber,
      address,
      pincode,
      additionalMessage,
      serviceIds,
    } = req.body;

    const booking = new BookService({
      name,
      email,
      phoneNumber,
      address,
      pincode,
      additionalMessage: additionalMessage || "",
      serviceIds,
      // status defaults to "pending"
    });

    const savedBooking = await booking.save();

    res.status(201).json({
      success: true,
      message: "Service(s) booked successfully",
      data: {
        bookingId: savedBooking._id,
        status: savedBooking.status,
        createdAt: savedBooking.createdAt,
      },
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get all bookings (optionally filter by status or serviceId)
export const getAllBookings = async (req, res) => {
  try {
    const { status, serviceId } = req.query;
    const query = {};
    if (status) query.status = status;
    if (serviceId) query.serviceIds = serviceId;

    const bookings = await BookService.find(query)
      .populate("serviceIds", "title price duration")
      .sort({ createdAt: -1 });
    console.log(bookings);
    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
// Update booking status (admin runtime update)
export const updateBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const { status } = req.body;

    // Only allow updating the status field
    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required for updating",
      });
    }

    const allowedStatuses = ["pending", "confirmed", "completed", "cancelled"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values are: ${allowedStatuses.join(
          ", "
        )}`,
      });
    }

    const updatedBooking = await BookService.findByIdAndUpdate(
      bookingId,
      {
        status,
        statusChangedAt: new Date(),
      },
      { new: true, runValidators: true }
    );

    if (!updatedBooking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Booking status updated successfully",
      data: updatedBooking,
    });
  } catch (error) {
    console.error("Error updating booking status:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Delete a booking
export const deleteBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;

    const deletedBooking = await BookService.findByIdAndDelete(bookingId);

    if (!deletedBooking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Booking deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting booking:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
