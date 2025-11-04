// const FundAllocation = {
//   allocate: function (depositPlans: DepositPlan, deposits: Array<number>) {
//     axios
//       .post("http://localhost:9000/allocate", {
//         depositPlans,
//         deposits,
//       })
//       .then((data) => {
//         console.log("Allocation response:", data);
//       })
//       .catch((error) => {
//         console.error("Error during fund allocation:", error);
//       });
//   },
// };

import axios from "axios";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    console.log("Received depositPlans:", data.depositPlans);

    const response = await axios.post("http://localhost:9000/allocate", {
      depositPlans: data.depositPlans,
      deposits: data.deposits,
    });

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
