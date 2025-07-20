import axios from "axios";

export const sendWhatsappMessage = async (to, message) => {
  try {
    const res = await axios.post(
      `https://wa.kchord.com/send`,
      {
        to: `94${to}`,
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
