import { type NextRequest } from "next/server";

const API_URL = process.env.RAGFLOW_API_URL + "/api" || "";
const API_KEY = process.env.RAGFLOW_API_KEY;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const to_do = searchParams.get("method");
  const assistant = searchParams.get("id");

  switch (to_do) {
    case "delete_chats":
      await fetch(`${API_URL}/v1/chats/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
      });
      // const resJson = await res.json();
      return Response.json({ success: 200 });
    case "delete_sessions":
      await fetch(`${API_URL}/v1/chats/${assistant}/sessions`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
      });
      return Response.json({ success: 200 });
    case "get_chats":
      const chats = await fetch(`${API_URL}/v1/chats/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
      });
      return Response.json((await chats.json()).data);
    case "get_sessions":
      const sessions = await fetch(
        `${API_URL}/v1/chats/${assistant}/sessions`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );
      return Response.json((await sessions.json()).data);
  }

  // const res = await fetch(
  //   `${API_URL}/v1/chats/`,
  //   {
  //     method: "DELETE",
  //     headers: {
  //       Authorization: `Bearer ${API_KEY}`,
  //       "Content-Type": "application/json",
  //     },
  //   }
  // );
  // const resJson = await res.json();

  // return Response.json(resJson.data);
}
