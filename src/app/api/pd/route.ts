import { NextResponse } from "next/server";
import { getAccountInfo, serverConnectTokenCreate } from "@/app/api/pd/pd";

export async function POST(req: Request) {
  const body = await req.json();
  const { external_user_id } = body;

  try {
    const result = await serverConnectTokenCreate({ external_user_id });
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Failed to create token", err);
    return new NextResponse("Failed to create token", { status: 500 });
  }
}

export async function PUT(req: Request) {
  const body = await req.json();
  const { external_user_id, accountId } = body;
  const result = await getAccountInfo({ external_user_id,accountId: accountId});
  console.log("APIresult ===>", result);
  return NextResponse.json(result);
}
