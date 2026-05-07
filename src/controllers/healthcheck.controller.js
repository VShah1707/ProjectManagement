import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/async-handler.js";

// const healthCheck = (req, res) => {
//   try {
//     console.log('hello')
//     res
//       .status(200)
//       .json(new ApiResponse(200, { message: "Server is running" }));
//   } catch (err) {}
// };

// asynce handler method
const healthCheck = asyncHandler(async (req, res) => {
  res.status(200).json(new ApiResponse(200, { message: "Server is Working" }));
});

export { healthCheck };
