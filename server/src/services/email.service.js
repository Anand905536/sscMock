import resend from "../config/mail.js";

export const sendWelcomeEmail = async (name, email) => {
  try {
    const { data, error } = await resend.emails.send({
      from: "sscMock <onboarding@resend.dev>",
      to: [email],
      subject: "Welcome to sscMock 🎉",
      html: `
        <h2>Welcome to sscMock, ${name}! 🎉</h2>

        <p>Your account has been successfully created.</p>

        <p>
          You can now start practicing mock tests
          and track your preparation.
        </p>

        <p>Best of luck with your preparation!</p>

        <p>
          <strong>Team sscMock</strong>
        </p>
      `,
    });

    if (error) {
      console.error("Welcome email failed:", error);
      return;
    }

    console.log("Welcome email sent:", data.id);
  } catch (error) {
    console.error("Email service error:", error.message);
  }
};