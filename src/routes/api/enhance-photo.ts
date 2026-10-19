import { createFileRoute } from "@tanstack/react-router";
import { editImage, imageSettings } from "@/lib/image-gateway.server";

export const Route = createFileRoute("/api/enhance-photo")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env["OPENAI_API_KEY"];
        if (!apiKey) return new Response("Missing OPENAI_API_KEY", { status: 500 });
        const env = request.headers.get("x-payments-env") === "sandbox" ? "sandbox" : "live";
        const { isMemberToken } = await import("@/lib/membership.server");
        if (!(await isMemberToken(request.headers.get("authorization"), env))) {
          return new Response("Membership required", { status: 403 });
        }
        const form = await request.formData();
        const img = form.get("image");
        if (!(img instanceof File) || img.size === 0) return new Response("Please choose a photo.", { status: 400 });
        if (img.size > 20 * 1024 * 1024) return new Response("Photo is over 20 MB.", { status: 400 });
        const upstream = await editImage({ ...imageSettings, apiKey }, form);
        return new Response(upstream.body, {
          status: upstream.status,
          headers: {
            "Content-Type": upstream.headers.get("Content-Type") ?? "application/json",
            "Cache-Control": "no-cache",
          },
        });
      },
    },
  },
});
