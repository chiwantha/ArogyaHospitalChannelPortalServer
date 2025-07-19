import axios from "axios";

export const sendWhatsappMessage = async (message) => {
  try {
    const res = await axios.post(
      `https://wa.kchord.com/send`,
      {
        to: "94788806670",
        message: message,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error(
      "whatsapp sending failed:",
      error.response?.data || error.message
    );
    throw error;
  }
};
