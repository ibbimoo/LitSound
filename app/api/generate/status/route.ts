import { NextResponse } from "next/server";
import { getMusicProvider } from "@/lib/generation/getMusicProvider";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get("taskId");

    if (!taskId) {
      return NextResponse.json({ error: "taskId is required." }, { status: 400 });
    }

    const provider = getMusicProvider();
    const status = await provider.getStatus(taskId);

    return NextResponse.json(status);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid generation status request." },
      { status: 400 }
    );
  }
}
