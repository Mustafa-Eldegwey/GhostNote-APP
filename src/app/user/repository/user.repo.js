import { User } from "../model/user.model.js";

export async function updateUserByEmail(email, updatedData) {
  await User.findOneAndUpdate(
    { email: email }, // filter
     updatedData, // updated data
    { returnDocument: "after" }, // options
  );
}
