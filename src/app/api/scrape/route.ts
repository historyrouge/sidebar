export async function POST(req: Request) {
  const { url } = await req.json();
  const response = await fetch("http://localhost:5000/scrape", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });

  const data = await response.json();
  return Response.json(data);
}
