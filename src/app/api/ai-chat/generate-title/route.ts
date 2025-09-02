import PortkeyClient from "@/lib/portkey";
import { createApiResponse } from "@/lib/apiResponse";
import { NextRequest } from "next/server";

async function agentTitleGenerator(userPrompt: string) {
  try {
    if (!userPrompt) {
      return createApiResponse({
        success: false,
        error: "Missing required fields",
        status: 400,
      });
    }

    const portkeyClient = new PortkeyClient();
    const response = await portkeyClient.client.prompts.completions.create({
      promptID: "pp-agent-titl-a0a456",
      variables: { user_prompt: userPrompt },
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userPrompt } = await request.json();
    console.log("generate-title userPrompt =>", userPrompt);

    if (!userPrompt) {
      console.error("Missing userPrompt");
      return createApiResponse({
        success: false,
        error: "Missing userPrompt",
        status: 400,
      });
    }

    const agentTitle = await agentTitleGenerator(userPrompt);
    console.log("Generated title:", agentTitle);

    return createApiResponse({
      success: true,
      data: agentTitle,
      status: 200,
    });
  } catch (error) {
    console.error("Error in agentTitleGenerator:", error);
    return createApiResponse({
      success: false,
      error: "Failed to create conversation title",
      status: 422,
    });
  }
}
