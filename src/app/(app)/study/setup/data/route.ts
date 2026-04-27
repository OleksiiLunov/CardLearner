import { NextResponse } from "next/server";

import { getListByIdForUser } from "@/lib/data/lists";
import { getCurrentUser } from "@/lib/supabase/session";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const listId = requestUrl.searchParams.get("listId");

  if (!listId) {
    return NextResponse.json({ status: "not-found" }, { status: 404 });
  }

  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ status: "unauthorized" }, { status: 401 });
  }

  const list = await getListByIdForUser(listId, user.id, "[perf] study:getSourceList");

  if (!list) {
    return NextResponse.json({ status: "not-found" }, { status: 404 });
  }

  return NextResponse.json({
    status: "ok",
    source: {
      kind: "saved-list-source",
      listId: list.id,
      listName: list.name,
      items: list.items.map((item) => ({
        id: item.id,
        front: item.front,
        back: item.back,
        position: item.position,
      })),
    },
  });
}
