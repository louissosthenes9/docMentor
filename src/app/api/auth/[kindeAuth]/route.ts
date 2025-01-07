import { handleAuth } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: any): Promise<NextResponse> {
  const endpoint = params.kindeAuth;

  const response = await handleAuth(request, endpoint);
  return NextResponse.json(response);
}