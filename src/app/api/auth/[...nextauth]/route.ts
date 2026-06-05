import NexrtAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NexrtAuth(authOptions);

export { handler as GET, handler as POST };
