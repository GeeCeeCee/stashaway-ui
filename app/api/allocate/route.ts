import { DepositPlan } from "@/app/types";
import axios from "axios";

export async function POST(request: Request) {
  const apiPath = process.env.BACKEND_API ?? "";
  if (apiPath === "") {
    return new Response(
      JSON.stringify({ message: "System was not configured correctly" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
  try {
    const data = await request.json();
    const newDepositPlan: DepositPlan[] = [];
    const deepCopyPlans = JSON.parse(JSON.stringify(data.depositPlans));
    deepCopyPlans.forEach((depositPlan: DepositPlan) => {
      if (!depositPlan.isEnabled) {
        return;
      }
      newDepositPlan.push({
        type: depositPlan.type,
        allocations: depositPlan.allocations,
      });
    });

    const body = {
      depositPlans: newDepositPlan,
      deposits: data.deposits,
    };

    const response = await axios.post(`${apiPath}/allocate`, body);

    return new Response(JSON.stringify(response.data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error during fund allocation:", error);

    return new Response(
      JSON.stringify({ message: "Allocation could not be done", error }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
