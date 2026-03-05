import emailjs from "@emailjs/browser";

// Initialize EmailJS with public key
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;

let initialized = false;

function initEmailJS() {
  if (!initialized && PUBLIC_KEY) {
    emailjs.init(PUBLIC_KEY);
    initialized = true;
  }
}

export interface TaskAssignmentEmailData {
  toEmail: string;
  toName: string;
  taskTitle: string;
  taskDescription: string;
  assignedBy: string;
}

export async function sendTaskAssignmentEmail(
  data: TaskAssignmentEmailData,
): Promise<boolean> {
  if (!PUBLIC_KEY || !SERVICE_ID || !TEMPLATE_ID) {
    console.warn("EmailJS not configured. Skipping email notification.");
    return false;
  }

  initEmailJS();

  try {
    await emailjs.send(SERVICE_ID, TEMPLATE_ID, {
      to_email: data.toEmail,
      to_name: data.toName,
      task_title: data.taskTitle,
      task_description: data.taskDescription || "No description provided",
      assigned_by: data.assignedBy,
    });
    console.log("Task assignment email sent successfully");
    return true;
  } catch (error) {
    console.error("Failed to send task assignment email:", error);
    return false;
  }
}
