export type RsvpResponse = {
  id: string;
  full_name: string;
  attendance: "yes" | "no";
  guest_count: number;
  message: string | null;
  created_at: string;
};

type NewRsvpResponse = Pick<RsvpResponse, "full_name" | "attendance" | "guest_count" | "message">;

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !secretKey) {
    throw new Error("The Supabase server environment variables are not configured.");
  }

  return { url: url.replace(/\/$/, ""), secretKey };
}

function supabaseHeaders(secretKey: string) {
  return {
    apikey: secretKey,
    Authorization: `Bearer ${secretKey}`,
    "Content-Type": "application/json",
  };
}

export async function createRsvpResponse(response: NewRsvpResponse) {
  const { url, secretKey } = getSupabaseConfig();
  const result = await fetch(`${url}/rest/v1/rsvp_responses`, {
    method: "POST",
    headers: {
      ...supabaseHeaders(secretKey),
      Prefer: "return=minimal",
    },
    body: JSON.stringify(response),
    cache: "no-store",
  });

  if (!result.ok) {
    const details = await result.text();
    console.error("Unable to save RSVP response:", result.status, details);
    throw new Error("Unable to save RSVP response.");
  }
}

export async function getRsvpResponses(): Promise<RsvpResponse[]> {
  const { url, secretKey } = getSupabaseConfig();
  const result = await fetch(
    `${url}/rest/v1/rsvp_responses?select=id,full_name,attendance,guest_count,message,created_at&order=created_at.desc`,
    {
      headers: supabaseHeaders(secretKey),
      cache: "no-store",
    },
  );

  if (!result.ok) {
    const details = await result.text();
    console.error("Unable to load RSVP responses:", result.status, details);
    throw new Error("Unable to load RSVP responses.");
  }

  return result.json() as Promise<RsvpResponse[]>;
}

export async function deleteRsvpResponses(ids: string[]): Promise<number> {
  const { url, secretKey } = getSupabaseConfig();
  const filter = encodeURIComponent(`(${ids.join(",")})`);
  const result = await fetch(`${url}/rest/v1/rsvp_responses?id=in.${filter}&select=id`, {
    method: "DELETE",
    headers: {
      ...supabaseHeaders(secretKey),
      Prefer: "return=representation",
    },
    cache: "no-store",
  });

  if (!result.ok) {
    const details = await result.text();
    console.error("Unable to delete RSVP responses:", result.status, details);
    throw new Error("Unable to delete RSVP responses.");
  }

  const deleted = await result.json() as Array<{ id: string }>;
  return deleted.length;
}
