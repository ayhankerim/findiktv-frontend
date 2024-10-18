import { NextRequest } from "next/server";
import { headers } from "next/headers";

type Data = {
  ip: string;
};

export async function GET(request: NextRequest) {
  const headersList = headers();
  let ip = headersList.get("x-real-ip") as string;

  const forwardedFor = headersList.get("x-forwarded-for") as string;

  if (!ip && forwardedFor) {
    ip = forwardedFor?.split(",").at(0) ?? "Unknown";
  }

  return Response.json({ ip: ip, now: Date.now() });
}
