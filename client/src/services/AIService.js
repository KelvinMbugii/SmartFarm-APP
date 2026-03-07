import api from "@/services/api";

const aiService = {
  assist: async ({ message, files = [] }) => {
    const form = new FormData();
    form.append("message", message || "");
    files.forEach((f) => form.append("files", f));
    const { data } = await api.post("/api/ai/assist", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },
  getJob: async (jobId) => {
    const { data } = await api.get(`/api/ai/jobs/${jobId}`);
    return data;
  },
};

export default aiService;

